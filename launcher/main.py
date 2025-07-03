import velopack
import tkinter as tk
from tkinter import messagebox, ttk
import sys
import configparser
from os import path
import subprocess
import time
import requests
import asyncio
import websockets
import json

config = configparser.ConfigParser()
config.read('config.ini')

IRACING_UI_PATH = config.get("Config", "IRACING_UI_PATH")
REMOTE_DEBUGGING_PORT = config.getint("Config", "REMOTE_DEBUGGING_PORT")
JS_FILE_PATH = "bootstrap.js"
CONFIG_FILE_PATH = "config.ini"

def find_data_file(filename):
    if getattr(sys, "frozen", False):
        # The application is frozen
        datadir = sys.prefix
    else:
        # The application is not frozen
        datadir = path.dirname(__file__)
    return path.join(datadir, filename)

def launch_electron():
    # Launch Electron with remote debugging
    return subprocess.Popen([
        IRACING_UI_PATH,
        f"--remote-debugging-port={REMOTE_DEBUGGING_PORT}"
    ])

def get_websocket_url():
    for _ in range(10):
        try:
            tabs = requests.get(f"http://localhost:{REMOTE_DEBUGGING_PORT}/json").json()
            # loop tabs to find one with title "iRacing"
            tabs = [tab for tab in tabs if tab.get('title') == 'iRacing']
            if not tabs:
                time.sleep(1)
                continue
            return tabs[0]['webSocketDebuggerUrl']
        except Exception:
            time.sleep(1)
    messagebox.showerror("iRefined", "Failed to connect to iRacing UI.\nIs iRacing down for maintenance?")
    sys.exit(1)

async def run_js_from_file(ws_url, js_path):
    with open(js_path, 'r') as f:
        js_code = f.read()

    async with websockets.connect(ws_url) as ws:
        await ws.send(json.dumps({
            "id": 1,
            "method": "Runtime.evaluate",
            "params": {"expression": js_code}
        }))

def check_update():
    manager = velopack.UpdateManager("https://github.com/jason-murray/irefined/releases/latest/download")
    
    update_info = manager.check_for_updates()
    if not update_info:
        return # no updates available

    answer = messagebox.askyesno("iRefined Update", "Update? (Strongly recommended)")
    if answer:
            # Download the updates
            manager.download_updates(update_info)

            # Apply the update and restart the app
            manager.apply_updates_and_restart(update_info)
    else:
        root.destroy()

def main():
    if getattr(sys, "frozen", False):
        check_update()

    launch_electron()
    ws_url = get_websocket_url()
    asyncio.run(run_js_from_file(ws_url, find_data_file(JS_FILE_PATH)))

root = tk.Tk()
root.withdraw()

if __name__ == "__main__":
    velopack.App().run()
    main()
