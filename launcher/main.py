from electron_inject import inject
from os import path, environ
bundle_dir = path.abspath(path.dirname(__file__))
path_to_bootstrap = path.join(bundle_dir, 'bootstrap.js')
program_files_x86 = environ.get("ProgramFiles(x86)")
    
inject(
    f"\"{program_files_x86}\\iRacing\\ui\\iRacingUI.exe\" --remote-allow-origins=*",
    devtools=False,
    browser=False,
    timeout=None,
    scripts=[
        path_to_bootstrap,
    ],
)