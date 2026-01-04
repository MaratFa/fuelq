#!/bin/bash

# FuelQ Unified Server Startup Script
# This script provides multiple ways to start the server based on available tools

# Change to the script directory
cd "$(dirname "$0")"

# Default values
USE_PM2=false
USE_LOCAL_PM2=false
USE_WATCHDOG=false
SERVER_SCRIPT="server-with-restart.js"
LOG_DIR="logs"

# Function to display help
show_help() {
    echo "FuelQ Server Startup Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help         Show this help message"
    echo "  -p, --pm2          Use PM2 to manage the server (requires PM2 to be installed)"
    echo "  -l, --local-pm2    Install PM2 locally and use it to manage the server"
    echo "  -w, --watchdog     Use watchdog script to monitor and restart the server if needed"
    echo "  -s, --server FILE  Specify which server script to use (default: server-with-restart.js)"
    echo ""
    echo "Examples:"
    echo "  $0                 Start server directly"
    echo "  $0 -p              Start server with PM2"
    echo "  $0 -l              Install PM2 locally and start server with it"
    echo "  $0 -w              Start server with watchdog monitoring"
}

# Function to create logs directory
create_logs_dir() {
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
        echo "Created logs directory"
    fi
}

# Function to start server directly
start_server_direct() {
    echo "Starting server directly with $SERVER_SCRIPT..."
    create_logs_dir
    node "$SERVER_SCRIPT" > "$LOG_DIR/out.log" 2> "$LOG_DIR/err.log" &
    echo $! > server.pid
    echo "Server started with PID: $(cat server.pid)"
    echo "Logs are being written to $LOG_DIR/out.log and $LOG_DIR/err.log"
}

# Function to start server with PM2
start_server_pm2() {
    if command -v pm2 &> /dev/null; then
        echo "Starting server with PM2..."
        pm2 start "$SERVER_SCRIPT" --name fuelq-server
        pm2 save
        echo "Server started with PM2. Use 'pm2 logs fuelq-server' to view logs."
    else
        echo "PM2 is not installed. Use --local-pm2 option to install it locally."
        exit 1
    fi
}

# Function to install PM2 locally and start server
start_server_local_pm2() {
    if [ ! -d "node_modules/pm2" ]; then
        echo "Installing PM2 locally..."
        npm install pm2
    fi
    echo "Starting server with local PM2..."
    ./node_modules/.bin/pm2 start "$SERVER_SCRIPT" --name fuelq-server
    ./node_modules/.bin/pm2 save
    echo "Server started with local PM2. Use './node_modules/.bin/pm2 logs fuelq-server' to view logs."
}

# Function to start server with watchdog
start_server_watchdog() {
    echo "Starting server with watchdog monitoring..."
    ./watchdog.sh
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            show_help
            exit 0
            ;;
        -p|--pm2)
            USE_PM2=true
            shift
            ;;
        -l|--local-pm2)
            USE_LOCAL_PM2=true
            shift
            ;;
        -w|--watchdog)
            USE_WATCHDOG=true
            shift
            ;;
        -s|--server)
            SERVER_SCRIPT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Start server based on selected options
if [ "$USE_WATCHDOG" = true ]; then
    start_server_watchdog
elif [ "$USE_LOCAL_PM2" = true ]; then
    start_server_local_pm2
elif [ "$USE_PM2" = true ]; then
    start_server_pm2
else
    start_server_direct
fi
