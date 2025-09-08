# Changelog

## [v1.5.4]

- Fix update check reporting an error on Windows start-up (or no internet).
- Tray right click can now Reload the extension manually, useful if it doesm't show up. Thanks to Simber for the inspiration.
- Include launcher version in tray menu.

## [v1.5.3]

- Better iRacing path detection and config verification.
- Fix for CPU hogging that some users experienced.

## [v1.5.2]

- Switched to applying persistent config for the CDP port.
- This requires a UAC prompt if the local.json file is missing to place it within Program Files.
- New method of opening port is much more reliable and fast. Does not require restarting the iRacing UI process or polling for processes.

## [v1.5.1]

- Tray app now has right click menu item to launch iRefined at Windows start-up.

## [v1.5.0]

- YATA (Yet another tray app!) That's right folks, as of launcher v1.5.0 iRefined is now a tray app.
- iRefined will automatically load the extension to any iRacing UI instance you open.
- No need to launch the UI through the iRefined shortcut.

## [v1.4.0]

- Improved logic for locating iRacingUI.exe including a file browser to update the config entry if it can't be found.
- Moved config.ini to `Documents/iRefined`, it will be created here if it does not exist. No longer provided in the release.

## [v1.3.5]

- Added an icon (mmm purple).

## [v1.3.4]

- Release update routine, versions prior to 1.3.4 will not auto update correctly.

## [v1.3.0-v1.3.3]

- Move to semver
- Start using velopack for installer/updater

## [v1.2]

iRacingUI path and port moved to config.ini for advanced configuration. Non standard install paths now supported.

## [v1.1]

Remove `electron-inject` in favour of using CDP directly through WS.

## [v1.0]

First public version of the iRefined launcher. The launcher bootstraps custom javascript and css (referred to as the extension) into the iRacing UI. The extension is loaded from URLs also hosted in this repo. The launcher does not need to be updated to receive the latest iRefined features - you can check the iRefined extension version in the iRacing UI settings panel (rocket icon).
