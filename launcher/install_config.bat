@echo off
setlocal

:: Check if argument is provided
if "%~1"=="" (
    echo Usage: %~nx0 ^<target_folder_path^>
    exit /b 1
)

:: Set the target folder from the argument
set "targetFolder=%~1"
set "fileName=local.json"

:: Set your JSON content here
set "jsonContent={"scorpioDebugPort": 9222}"

:: Create the folder if it doesn't exist
if not exist "%targetFolder%\ui\config" (
    mkdir "%targetFolder%\ui\config"
)

:: Write the JSON content to the file
(
    echo %jsonContent%
) > "%targetFolder%\ui\config\%fileName%"

echo JSON file written to: %targetFolder%\ui\config\%fileName%
endlocal
