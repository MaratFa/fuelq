#!/bin/bash

# FuelQ Server Watchdog Script
# This script monitors the server and restarts it if it crashes

# Change to the script directory
cd "$(dirname "$0")"

# Configuration
SERVER_SCRIPT="server.js"
PID_FILE="server.pid"
CHECK_INTERVAL=30  # Check every 30 seconds
MAX_RESTART_ATTEMPTS=5
RESTART_DELAY=10   # Seconds to wait before restarting

# Function to check if server is running
is_server_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            return 0  # Server is running
        else
            return 1  # PID file exists but process is not running
        fi
    else
        return 1  # No PID file, server is not running
    fi
}

# Function to start the server
start_server() {
    echo "Starting server..."
    nohup node "$SERVER_SCRIPT" > logs/out.log 2> logs/err.log &
    echo $! > "$PID_FILE"
    echo "Server started with PID: $(cat $PID_FILE)"
}

# Function to stop the server
stop_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        echo "Stopping server with PID: $PID"
        kill $PID
        sleep 2

        # Force kill if still running
        if ps -p $PID > /dev/null 2>&1; then
            echo "Force killing server..."
            kill -9 $PID
        fi

        rm "$PID_FILE"
        echo "Server stopped."
    else
        echo "Server is not running (no PID file found)."
    fi
}

# Function to restart the server
restart_server() {
    echo "Restarting server..."
    stop_server
    sleep $RESTART_DELAY
    start_server
}

# Main watchdog loop
restart_count=0

echo "Starting FuelQ server watchdog..."

# Start the server if it's not running
if ! is_server_running; then
    start_server
fi

while true; do
    if is_server_running; then
        echo "$(date): Server is running with PID $(cat $PID_FILE)"
        restart_count=0  # Reset restart count on successful check
    else
        echo "$(date): Server is not running!"

        # Check if we've exceeded max restart attempts
        if [ $restart_count -ge $MAX_RESTART_ATTEMPTS ]; then
            echo "$(date): Maximum restart attempts ($MAX_RESTART_ATTEMPTS) reached. Giving up."
            # Send email notification if possible (requires mail command)
            # echo "FuelQ server has crashed and could not be restarted after $MAX_RESTART_ATTEMPTS attempts." | mail -s "FuelQ Server Alert" your-email@example.com
            exit 1
        fi

        echo "$(date): Attempting to restart server (attempt $((restart_count + 1))/$MAX_RESTART_ATTEMPTS)..."
        restart_server
        restart_count=$((restart_count + 1))
    fi

    sleep $CHECK_INTERVAL
done
