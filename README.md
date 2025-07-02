<p align="center">
  <img width="300" src="https://github.com/jason-murray/irefined/blob/main/extension/src/assets/logo.png?raw=true" alt="iRefined Logo"/>
</p>
<p align="center">
  An extension for the iRacing UI that adds some quality of life features for drivers everywhere.
</p>

## Features
:heavy_check_mark: Load/save/share test drive config as json files.  
:heavy_check_mark: Load/save/share hosted session config as json files.  
:heavy_check_mark: Green join button shows the session type e.g. Race, Practice, Spectate, Spot.  
:heavy_check_mark: Automatically launch sim for sessions.  
:heavy_check_mark: Automatically forfeit sessions after x minutes.  
:heavy_check_mark: Queue for future races where registration is not open yet.  
:heavy_check_mark: Automatically close notifications after x seconds.  
:heavy_check_mark: Hide sidebars & collapse menu for more screen real estate.

## Planned
:black_circle: Hide iRating everywhere.  

Why not [suggest a feature](https://github.com/jason-murray/irefined/issues/new?template=feature_request.md)?

## Usage & Download

1. Download the [launcher latest release](https://github.com/jason-murray/irefined/releases) and unzip it somewhere.
2. Run `iRefined.exe` to start the iRacing UI with the iRefined extension.
3. Once the UI has launched you'll find the iRefined queue & log bar at the bottom of the screen, and the settings button (rocket) in the top right.
4. Many of the features are disabled to start with, open the settings to turn them on.

> [!TIP]
> Make sure to start the iRacing UI with `iRefined.exe` every time you open iRacing!

## Common Issues

*cx_freeze the system cannot find the file specified*
This is likely because iRacing UI is installed in a different place, you can edit config.ini to set the correct path.

*Opening the settings sometimes shows the latest announcements screen.*  
This can usually be sorted by closing the pop up window and clicking the settings button again.

*Feature x isn't working properly.*  
Because the iRacing UI is essentially a website loaded from the internet, iRacing often roll out changes silently. This can lead to some features breaking without notice.
Luckily iRefined takes the same approach and can also load fixes without needing to be explicitly updated by the user. If you find something that's not working right, please [create an issue](https://github.com/jason-murray/irefined/issues/new?template=bug_report.md).

## Contributing
WIP

### Build Launcher
`pipenv run cxfreeze build --target-dir=dist`
