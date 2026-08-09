@echo off
title UrbanLens - Fast Start (Browser)
cd /d "%~dp0"

echo.
echo  UrbanLens — fastest mode (PC browser)
echo  =====================================
echo  Phone tunnel is skipped (ngrok issues).
echo  Opening http://localhost:8081 ...
echo.

start "" "http://localhost:8081"
call npx expo start --localhost --web --port 8081

pause
