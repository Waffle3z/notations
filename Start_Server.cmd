@echo off
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required but not found. Opening the download page...
  start "" "https://nodejs.org/en/download"
  pause
  exit /b 1
)

rem If PORT isn't set, default to 5500
if "%PORT%"=="" set "PORT=5500"

rem Start the server in its own window and keep it open
start "Notations Dev Server" cmd /k node dev-server.mjs

rem Give the server a moment to start, then open the browser
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:%PORT%/"