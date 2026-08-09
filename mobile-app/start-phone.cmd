@echo off
title UrbanLens — Phone fix
cd /d "%~dp0"

echo.
echo  Why you always see exp://10.34.139.1:8081
echo  -----------------------------------------
echo  That IS your laptop's real Wi-Fi IP right now.
echo  Expo cannot invent another IP. We fix CONNECTION instead.
echo.

set ADB=%~dp0.tools\platform-tools\adb.exe
set PORT=8081

echo  Opening Windows Firewall for port %PORT% (approve UAC if asked)...
powershell -Command "Start-Process netsh -ArgumentList 'advfirewall firewall delete rule name=UrbanLensExpo8081' -Verb RunAs -Wait" 2>nul
powershell -Command "Start-Process netsh -ArgumentList 'advfirewall firewall add rule name=UrbanLensExpo8081 dir=in action=allow protocol=TCP localport=8081' -Verb RunAs -Wait"

"%ADB%" start-server >nul 2>&1
"%ADB%" devices
"%ADB%" reverse --remove-all >nul 2>&1
"%ADB%" reverse tcp:%PORT% tcp:%PORT% 2>nul
if "%ERRORLEVEL%"=="0" (
  echo.
  echo  USB OK. Starting Expo...
  echo  In Expo Go type:  exp://127.0.0.1:%PORT%
  echo.
  set REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1
  call npx expo start --localhost --port %PORT%
  goto end
)

echo.
echo  No USB phone detected. Starting LAN on %PORT%...
echo.
echo  ON YOUR PHONE — Expo Go —^> Enter URL manually:
echo.
echo      exp://10.34.139.1:%PORT%
echo.
echo  Do NOT only scan QR if it fails. Type the URL above.
echo.
echo  If it still fails: plug phone USB cable, enable USB Debugging,
echo  Allow the PC, then run this file again.
echo.

set REACT_NATIVE_PACKAGER_HOSTNAME=10.34.139.1
call npx expo start --lan --port %PORT%

:end
pause
