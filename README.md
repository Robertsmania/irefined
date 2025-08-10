<p align="center">
  <img width="300" src="https://github.com/jason-murray/irefined/blob/main/extension/src/assets/logo.png?raw=true" alt="iRefined Logo"/>
</p>
<div align="center">
  
[![](https://img.shields.io/badge/download-5cd633?style=for-the-badge)](https://github.com/jason-murray/irefined/releases/latest/download/iRefined-win-Setup.exe) &nbsp; [![](https://dcbadge.limes.pink/api/server/hxVf8wcGaV)](https://discord.gg/hxVf8wcGaV) &nbsp; [![](https://img.shields.io/badge/buy_me_a_coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/jason_)
  
</div>
<p align="center">
  An unofficial extension for the iRacing UI that adds some quality of life features for drivers everywhere.
</p>

## 🚀 Features

### ⏰ Queue for future races (pre reg!)

![Queue Bar](readme-files/queue-bar.png)

### 💾 Load/save/share test drive & hosted configs!

![Save Conditions](readme-files/saving-conditions.gif)

### 🏁 Easily see the season and session type!

![Join Bar](readme-files/better-join-bar.png)

### Other stuff

:heavy_check_mark: Automatically launch sim for sessions.  
:heavy_check_mark: Automatically forfeit sessions after x minutes.  
:heavy_check_mark: Automatically close notifications after x seconds.  
:heavy_check_mark: Hide sidebars & collapse menu for more screen real estate.

## Planned

:black_circle: Hide iRating everywhere.  
:black_circle: Play notification sound when Race session is available.  
:black_circle: One click withdraw.  
:black_circle: Sort registrations by iRating (Go racing & sim loading screen).

Why not [suggest a feature](https://github.com/jason-murray/irefined/issues/new?template=feature_request.md)?

## Usage & Download

1. Download the [installer](https://github.com/jason-murray/irefined/releases/latest/download/iRefined-win-Setup.exe) and run it.
2. The installer will launch iRefined automatically when it's finished, it runs as a tray app. You will also have a shortcut to iRefined on the desktop and in the start menu.
3. iRefined will load the extension as long as it is running in the system tray.
4. Once the UI has launched you'll find the iRefined queue & log bar at the bottom of the screen, and the settings button (rocket) in the top right.
5. Many of the features are disabled to start with, open the settings to turn them on.

> [!TIP]
> Make sure iRefined is running before you open the iRacing UI! You can add it to Windows start-up by right clicking the tray icon and choosing this option.

## Common Issues

_Feature x isn't working properly._  
Because the iRacing UI is essentially a website loaded from the internet, iRacing often roll out changes silently. This can lead to some features breaking without notice.
Luckily iRefined takes the same approach and can also load fixes without needing to be explicitly updated by the user. If you find something that's not working right, please [create an issue](https://github.com/jason-murray/irefined/issues/new?template=bug_report.md).

## Contributing

WIP

### Build Launcher

1. Build the executable:
   ```bash
   pipenv run cxfreeze build --target-dir=dist
   ```

2. Create the installer:
   ```bash
   dotnet tool install -g vpk
   vpk pack -u iRefined -v 9.9.9 -p .\dist -o .\release --noPortable --icon icon.ico
   ```

The resulting installer will be in the `release` folder.

### Self-Hosting Extension Files

If you want to host the extension files on your own server instead of using the default localhost URLs, you'll need to configure CORS headers to allow the iRacing website to access your files.

#### Apache Configuration

Create a `.htaccess` file in your extension files directory:

```apache
# Enable CORS for JavaScript and CSS files (restricted to iRacing domains)
<FilesMatch "\.(js|css)$">
    # Only allow iRacing domains
    SetEnvIf Origin "^https://(members-ng\.)?iracing\.com$" ALLOWED_ORIGIN=$0
    Header always set Access-Control-Allow-Origin "%{ALLOWED_ORIGIN}e" env=ALLOWED_ORIGIN
    Header always set Access-Control-Allow-Methods "GET, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type"
</FilesMatch>

# Handle preflight OPTIONS requests
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
```

#### Update bootstrap.js

Modify the URLs in `launcher/bootstrap.js` to point to your server:

```javascript
// Change from localhost URLs to your server
link.href = "https://yourdomain.com/irefined/extension.css?" + new Date().getTime();
script.src = "https://yourdomain.com/irefined/main.js?" + new Date().getTime();
```

**Note**: Make sure to enable the `mod_headers` Apache module if it's not already enabled.
