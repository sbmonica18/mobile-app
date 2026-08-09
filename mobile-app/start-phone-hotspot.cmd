@echo off
title UrbanLens - Phone via PC Hotspot
cd /d "%~dp0"

echo.
echo  UrbanLens on PHONE (Hotspot LAN) — no ngrok
echo  ============================================
echo.
echo  1. Windows Settings -^> Network ^& internet -^> Mobile hotspot -^> ON
echo  2. On phone: connect Wi-Fi to that hotspot (NOT mobile data)
echo  3. Wait for QR below, scan with Expo Go
echo.
echo  Tip: After Metro starts, note the exp://192.168.x.x:8081 URL.
echo  If QR fails, open Expo Go -^> Enter URL manually -^> paste that URL.
echo.

call npx expo start --lan --port 8081

pause
