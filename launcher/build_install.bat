pipenv run cxfreeze build --target-dir=dist
rmdir /s /q release
vpk pack -u iRefined -v 9.9.9 -p .\dist -o .\release --noPortable --icon icon.ico