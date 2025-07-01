# iRefined
An extension for the iRacing UI that adds some quality of life features for drivers everywhere.

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

> [!TIP]
> Make sure to start the iRacing UI with `iRefined.exe` every time you open iRacing!

## Contributing
WIP

### Build Launcher
`pipenv run cxfreeze build --target-dir=dist`
