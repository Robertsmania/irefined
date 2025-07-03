# Changelog

## [v1.4]

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
