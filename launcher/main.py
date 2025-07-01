import sys
from os import path, environ
import subprocess
import time
import requests
import asyncio
import websockets
import json

program_files_x86 = environ.get("ProgramFiles(x86)")

ELECTRON_APP_PATH = path.join(program_files_x86, "iRacing", "ui", "iRacingUI.exe")
JS_FILE_PATH = "bootstrap.js"
REMOTE_DEBUGGING_PORT = 9222

def find_data_file(filename):
    if getattr(sys, "frozen", False):
        # The application is frozen
        datadir = sys.prefix  # datadir = os.path.dirname(sys.executable)
    else:
        # The application is not frozen
        # Change this bit to match where you store your data files:
        datadir = path.dirname(__file__)
    return path.join(datadir, filename)

def launch_electron():
    # Launch Electron with remote debugging
    return subprocess.Popen([
        ELECTRON_APP_PATH,
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
    raise RuntimeError("Could not connect to Electron's remote debugger")

async def run_js_from_file(ws_url, js_path):
    with open(js_path, 'r') as f:
        js_code = f.read()

    async with websockets.connect(ws_url) as ws:
        await ws.send(json.dumps({
            "id": 1,
            "method": "Runtime.evaluate",
            "params": {"expression": js_code}
        }))

        response = await ws.recv()
        result = json.loads(response)
        print("JS Evaluation Result:", result.get("result", {}).get("result", {}).get("value"))

def main():
    proc = launch_electron()
    ws_url = get_websocket_url()
    asyncio.run(run_js_from_file(ws_url, find_data_file(JS_FILE_PATH)))

if __name__ == "__main__":
    main()
