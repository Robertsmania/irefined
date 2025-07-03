import velopack
import tkinter as tk
from tkinter import messagebox, filedialog
import sys
import configparser
from os import path, makedirs
import subprocess
import time
import requests
import asyncio
import websockets
import json

# Get the user's Documents folder and create iRefined folder if needed
DOCUMENTS_PATH = path.join(path.expanduser("~"), "Documents")
IREFINED_CONFIG_DIR = path.join(DOCUMENTS_PATH, "iRefined")
CONFIG_FILE_PATH = path.join(IREFINED_CONFIG_DIR, "config.ini")
JS_FILE_PATH = "bootstrap.js"

def find_data_file(filename):
    if getattr(sys, "frozen", False):
        # The application is frozen
        datadir = sys.prefix
    else:
        # The application is not frozen
        datadir = path.dirname(__file__)
    return path.join(datadir, filename)

root = tk.Tk()
root.withdraw()  # Hide the main window
root.iconbitmap(find_data_file("icon.ico"))

def create_default_config():
    # Create default config file in Documents/iRefined/
    if not path.exists(IREFINED_CONFIG_DIR):
        makedirs(IREFINED_CONFIG_DIR)
    
    config = configparser.ConfigParser()
    config['Config'] = {
        'IRACING_UI_PATH': 'C:\\Program Files (x86)\\iRacing\\ui\\iRacingUI.exe',
        'REMOTE_DEBUGGING_PORT': '9222'
    }
    
    with open(CONFIG_FILE_PATH, 'w') as configfile:
        config.write(configfile)
    
    return config

def load_config():
    # Load config from Documents/iRefined/config.ini, create if doesn't exist
    config = configparser.ConfigParser()
    
    if path.exists(CONFIG_FILE_PATH):
        config.read(CONFIG_FILE_PATH)
    else:
        config = create_default_config()
    
    return config

def save_config(config):
    # Save config to Documents/iRefined/config.ini
    with open(CONFIG_FILE_PATH, 'w') as configfile:
        config.write(configfile)

def browse_for_iracing_ui():
    # Show file browser to select iRacing UI executable    
    messagebox.showinfo("iRefined", "Please locate your iRacingUI.exe\n\nUsually found at:\nC:\\Program Files (x86)\\iRacing\\ui\\iRacingUI.exe")
    
    file_path = filedialog.askopenfilename(
        title="Select iRacingUI.exe",
        filetypes=[("Executable files", "*.exe"), ("All files", "*.*")],
        initialdir="C:\\Program Files (x86)\\iRacing\\ui\\"
    )
    
    return file_path

config = load_config()
IRACING_UI_PATH = config.get("Config", "IRACING_UI_PATH")
REMOTE_DEBUGGING_PORT = config.getint("Config", "REMOTE_DEBUGGING_PORT")

def launch_electron():
    global IRACING_UI_PATH
    # Launch Electron with remote debugging
    try:
        if not path.exists(IRACING_UI_PATH):
            # Show file browser to select iRacing UI
            new_path = browse_for_iracing_ui()
            if not new_path:
                messagebox.showerror("iRefined Error", "No iRacing UI executable selected. Cannot continue.")
                sys.exit(1)
            
            # Update the config with the new path
            IRACING_UI_PATH = new_path
            config.set("Config", "IRACING_UI_PATH", new_path)
            save_config(config)
                    
        return subprocess.Popen([
            IRACING_UI_PATH,
            f"--remote-debugging-port={REMOTE_DEBUGGING_PORT}"
        ])
    except FileNotFoundError as e:
        messagebox.showerror("iRefined Error", f"iRacing UI path not found.\n\nError: {str(e)}")
        sys.exit(1)
    except Exception as e:
        messagebox.showerror("iRefined Error", f"Failed to launch iRacing UI.\n\nError: {str(e)}")
        sys.exit(1)

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

    # Download the updates
    manager.download_updates(update_info)

    # Apply the update and restart the app
    manager.apply_updates_and_restart(update_info)


def main():
    if getattr(sys, "frozen", False):
        check_update()

    launch_electron()
    ws_url = get_websocket_url()
    asyncio.run(run_js_from_file(ws_url, find_data_file(JS_FILE_PATH)))

if __name__ == "__main__":
    velopack.App().run()
    main()
