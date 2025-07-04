import asyncio
import json
import os
import subprocess
import sys
import threading
import webbrowser
from os import path

import psutil
import pystray
import requests
import velopack
import websockets
from PIL import Image

DISCORD_URL = "https://discord.gg/hxVf8wcGaV"
JS_FILE_PATH = "bootstrap.js"
REMOTE_DEBUGGING_PORT = 9222


def find_data_file(filename):
    if getattr(sys, "frozen", False):
        # The application is frozen
        datadir = sys.prefix
    else:
        # The application is not frozen
        datadir = path.dirname(__file__)
    return path.join(datadir, filename)


def get_websocket_url():
    try:
        tabs = requests.get(f"http://localhost:{REMOTE_DEBUGGING_PORT}/json").json()
        # loop tabs to find one with title "iRacing"
        tabs = [tab for tab in tabs if tab.get("title") == "iRacing"]
        if not tabs:
            return
        return tabs[0]["webSocketDebuggerUrl"]
    except requests.exceptions.ConnectionError:
        return


async def run_js_from_file(ws_url, js_path):
    with open(js_path, "r") as f:
        js_code = f.read()

    async with websockets.connect(ws_url) as ws:
        await ws.send(
            json.dumps(
                {
                    "id": 1,
                    "method": "Runtime.evaluate",
                    "params": {"expression": js_code},
                }
            )
        )


def check_update():
    if getattr(sys, "frozen", False):
        manager = velopack.UpdateManager(
            "https://github.com/jason-murray/irefined/releases/latest/download"
        )

        update_info = manager.check_for_updates()
        if not update_info:
            print("[INFO] No updates available.")
            return

        # Download and apply updates
        print(f"[INFO] Update available! Applying...")
        manager.download_updates(update_info)
        manager.apply_updates_and_restart(update_info)


def find_instances_without_iref():
    processes = []
    for proc in psutil.process_iter(attrs=["pid", "name", "cmdline"]):
        try:
            if proc.info["name"] == "iRacingUI.exe":
                cmdline = proc.info.get("cmdline", [])
                if (
                    "--remote-debugging-port={REMOTE_DEBUGGING_PORT}" not in cmdline
                    and len(cmdline) < 2
                ):
                    processes.append(proc)
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            continue
    return processes


def restart_with_iref(proc):
    iracing_ui_path = proc.cmdline()[0] if proc.cmdline() else None

    try:
        print(f"[INFO] Terminating PID {proc.pid}...")
        proc.terminate()
        proc.wait(timeout=5)
    except psutil.TimeoutExpired:
        print(f"[WARN] PID {proc.pid} did not terminate in time. Forcing.")
        proc.kill()
    except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
        print(f"[ERROR] Could not terminate process: {e}")
        return

    print("[INFO] Restarting with debug port flag...")
    subprocess.Popen(
        [iracing_ui_path, f"--remote-debugging-port={REMOTE_DEBUGGING_PORT}"],
        stdout=subprocess.DEVNULL,
        start_new_session=True,
    )


def monitor_process():
    while True:
        ir_procs = find_instances_without_iref()
        for proc in ir_procs:
            restart_with_iref(proc)


def monitor_websocket():
    seen_socket_urls = set()

    while True:
        ws_url = get_websocket_url()
        if not ws_url:
            continue
        if ws_url not in seen_socket_urls:
            print(f"[INFO] Found new iRacing WebSocket URL: {ws_url}")
            seen_socket_urls.add(ws_url)
            asyncio.run(run_js_from_file(ws_url, find_data_file(JS_FILE_PATH)))


def on_quit():
    icon.stop()
    os._exit(0)


def open_discord():
    webbrowser.open(DISCORD_URL)


def main():
    check_update()

    threading.Thread(target=monitor_process, daemon=True).start()
    threading.Thread(target=monitor_websocket, daemon=True).start()

    icon.run()


image = Image.open(find_data_file("icon.ico"))
menu = (
    pystray.MenuItem("Discord", open_discord),
    pystray.Menu.SEPARATOR,
    pystray.MenuItem("Update Check", check_update),
    pystray.MenuItem("Quit", on_quit),
)
icon = pystray.Icon("iRefined", image, "iRefined", menu)

if __name__ == "__main__":
    if getattr(sys, "frozen", False):
        velopack.App().run()

    main()
