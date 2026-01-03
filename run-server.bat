@echo off
title FuelQ Server

echo Starting FuelQ server...
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Change to the script directory
cd /d "%~dp0"

:: Start the server using our start-server.js script
echo Starting server with auto-restart capability...
node start-server.js

:: Keep the window open if there's an error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Server exited with error code %ERRORLEVEL%
    pause
)
