#!/bin/bash

# FuelQ Simple Server Startup Script (no PM2 required)

# Change to the script directory
cd "$(dirname "$0")"

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to start the server
start_server() {
    echo "Starting FuelQ server..."
    node server.js > logs/out.log 2> logs/err.log &
    echo $! > server.pid
    echo "Server started with PID: $(cat server.pid)"
}

# Function to stop the server
stop_server() {
    if [ -f server.pid ]; then
        PID=$(cat server.pid)
        echo "Stopping server with PID: $PID"
        kill $PID
        rm server.pid
        echo "Server stopped."
    else
        echo "Server is not running (no PID file found)."
    fi
}

# Function to check if server is running
check_server() {
    if [ -f server.pid ]; then
        PID=$(cat server.pid)
        if ps -p $PID > /dev/null 2>&1; then
            echo "Server is running with PID: $PID"
            return 0
        else
            echo "Server PID file exists but process is not running."
            rm server.pid
            return 1
        fi
    else
        echo "Server is not running (no PID file found)."
        return 1
    fi
}

# Main script logic
case "$1" in
    start)
        if check_server; then
            echo "Server is already running."
        else
            start_server
        fi
        ;;
    stop)
        stop_server
        ;;
    restart)
        stop_server
        sleep 2
        start_server
        ;;
    status)
        check_server
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
