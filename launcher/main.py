import sys
from electron_inject import inject # type: ignore
from os import path, environ

program_files_x86 = environ.get("ProgramFiles(x86)")

def find_data_file(filename):
    if getattr(sys, "frozen", False):
        # The application is frozen
        datadir = sys.prefix  # datadir = os.path.dirname(sys.executable)
    else:
        # The application is not frozen
        # Change this bit to match where you store your data files:
        datadir = path.dirname(__file__)
    return path.join(datadir, filename)

inject(
    f"\"{program_files_x86}\\iRacing\\ui\\iRacingUI.exe\" --remote-allow-origins=*",
    devtools=False,
    browser=False,
    timeout=None,
    scripts=[
        find_data_file('bootstrap.js'),
    ],
)