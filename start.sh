#!/bin/bash

# FuelQ Server Startup Script for Linux

# Change to the script directory
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PM2 is installed (preferred method)
if command -v pm2 &> /dev/null; then
    echo "Starting server with PM2..."
    pm2 start server.js --name fuelq-server
    pm2 save
    echo "Server started with PM2. Use 'pm2 logs fuelq-server' to view logs."
else
    echo "PM2 not found. Starting server directly..."
    # Start the server with auto-restart capability
    node start-server.js
fi
