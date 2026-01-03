#!/bin/bash

# FuelQ Server Startup Script for Shared Hosting (no sudo)

# Change to the script directory
cd "$(dirname "$0")"

# Install PM2 locally if not already installed
if [ ! -d "node_modules/pm2" ]; then
    echo "Installing PM2 locally..."
    npm install pm2
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the server with local PM2
echo "Starting server with local PM2..."
./node_modules/.bin/pm2 start server.js --name fuelq-server

# Save the PM2 configuration
./node_modules/.bin/pm2 save

# Set up a cron job to restart PM2 on server reboot (if possible)
echo "To ensure the server restarts on reboot, add this to your crontab:"
echo "@reboot cd $(pwd) && ./node_modules/.bin/pm2 resurrect"

echo "Server started with local PM2. Use './node_modules/.bin/pm2 logs fuelq-server' to view logs."
