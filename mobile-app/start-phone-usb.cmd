@echo off
title UrbanLens - Phone via USB (no WiFi tunnel)
cd /d "%~dp0"

echo.
echo  UrbanLens on PHONE (USB) — skips LAN + ngrok
echo  =============================================
echo.
echo  BEFORE YOU CONTINUE:
echo   1. Plug phone into PC with USB cable
echo   2. Phone: enable Developer options + USB debugging
echo   3. Allow this PC when phone asks
echo.

set ADB=
where adb >nul 2>&1 && set ADB=adb
if "%ADB%"=="" if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" set ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
if "%ADB%"=="" if exist "%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe" set ADB=%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe

if "%ADB%"=="" (
  echo  ERROR: adb not found.
  echo  Install Android Platform Tools, or use start-phone-hotspot.cmd instead.
  echo.
  pause
  exit /b 1
)

echo  Forwarding port 8081 to phone...
"%ADB%" reverse tcp:8081 tcp:8081
if errorlevel 1 (
  echo  ERROR: phone not detected. Check USB debugging and cable.
  pause
  exit /b 1
)

echo  OK. Starting Expo on localhost...
echo.
echo  In Expo Go on phone:
echo    - Tap "Enter URL manually"
echo    - Type:  exp://127.0.0.1:8081
echo    - Connect
echo.

call npx expo start --localhost --port 8081

pause
