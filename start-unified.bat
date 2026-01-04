@echo off
title FuelQ Server

echo FuelQ Server Startup Script
echo.
echo Usage: start-unified.bat [options]
echo.
echo Options:
echo   /pm2         Use PM2 to manage the server (requires PM2 to be installed)
echo   /local-pm2   Install PM2 locally and use it to manage the server
echo   /watchdog    Use watchdog script to monitor and restart the server if needed
echo   /server FILE Specify which server script to use (default: server-with-restart.js)
echo.
echo Examples:
echo   start-unified.bat              Start server directly
echo   start-unified.bat /pm2         Start server with PM2
echo   start-unified.bat /local-pm2   Install PM2 locally and start server with it
echo   start-unified.bat /watchdog     Start server with watchdog monitoring
echo.

:: Default values
set USE_PM2=false
set USE_LOCAL_PM2=false
set USE_WATCHDOG=false
set SERVER_SCRIPT=server-with-restart.js
set LOG_DIR=logs

:: Parse command line arguments
:parse_args
if "%~1"=="" goto start_server
if /i "%~1"=="/pm2" (
    set USE_PM2=true
    shift
    goto parse_args
)
if /i "%~1"=="/local-pm2" (
    set USE_LOCAL_PM2=true
    shift
    goto parse_args
)
if /i "%~1"=="/watchdog" (
    set USE_WATCHDOG=true
    shift
    goto parse_args
)
if /i "%~1"=="/server" (
    set SERVER_SCRIPT=%~2
    shift
    shift
    goto parse_args
)
echo Unknown option: %~1
goto end

:start_server
:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Change to the script directory
cd /d "%~dp0"

:: Create logs directory if it doesn't exist
if not exist "%LOG_DIR%" (
    mkdir "%LOG_DIR%"
    echo Created logs directory
)

:: Start server based on selected options
if "%USE_WATCHDOG%"=="true" (
    echo Starting server with watchdog monitoring...
    call watchdog.sh
    goto end
)

if "%USE_LOCAL_PM2%"=="true" (
    if not exist "node_modules\pm2" (
        echo Installing PM2 locally...
        npm install pm2
    )
    echo Starting server with local PM2...
    node_modules\.bin\pm2.cmd start "%SERVER_SCRIPT%" --name fuelq-server
    node_modules\.bin\pm2.cmd save
    echo Server started with local PM2. Use 'node_modules\.bin\pm2.cmd logs fuelq-server' to view logs.
    goto end
)

if "%USE_PM2%"=="true" (
    where pm2 >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo PM2 is not installed. Use /local-pm2 option to install it locally.
        pause
        exit /b 1
    )
    echo Starting server with PM2...
    pm2 start "%SERVER_SCRIPT%" --name fuelq-server
    pm2 save
    echo Server started with PM2. Use 'pm2 logs fuelq-server' to view logs.
    goto end
)

:: Default: Start server directly
echo Starting server directly with %SERVER_SCRIPT%...
start "FuelQ Server" cmd /k "node %SERVER_SCRIPT%"
echo Server started. Logs are being written to the console window.
echo Press any key to exit this script (server will continue running)...
pause >nul

:end
echo Done.
