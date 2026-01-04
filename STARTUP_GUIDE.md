# FuelQ Server Startup Guide

This guide explains how to use the unified startup scripts for the FuelQ server.

## Unified Startup Scripts

We've created two unified startup scripts that replace all the previous startup scripts:

- `start-unified.sh` - For Linux/Mac systems
- `start-unified.bat` - For Windows systems

## Usage

### Linux/Mac

```bash
# Start server directly
./start-unified.sh

# Start server with PM2
./start-unified.sh --pm2

# Install PM2 locally and start server with it
./start-unified.sh --local-pm2

# Start server with watchdog monitoring
./start-unified.sh --watchdog

# Use a different server script
./start-unified.sh --server server.js

# Show help
./start-unified.sh --help
```

### Windows

```cmd
# Start server directly
start-unified.bat

# Start server with PM2
start-unified.bat /pm2

# Install PM2 locally and start server with it
start-unified.bat /local-pm2

# Start server with watchdog monitoring
start-unified.bat /watchdog

# Use a different server script
start-unified.bat /server server.js
```

## Options

| Linux/Mac | Windows | Description |
|-----------|---------|-------------|
| `--help` | | Show help message |
| `--pm2` | `/pm2` | Use PM2 to manage the server (requires PM2 to be installed) |
| `--local-pm2` | `/local-pm2` | Install PM2 locally and use it to manage the server |
| `--watchdog` | `/watchdog` | Use watchdog script to monitor and restart the server if needed |
| `--server FILE` | `/server FILE` | Specify which server script to use (default: server-with-restart.js) |

## Deprecated Scripts

The following scripts have been deprecated and replaced by the unified startup scripts:

- `simple-start.sh`
- `start.sh`
- `start-no-sudo.sh`
- `run-server.bat`

These scripts can be safely removed from your project.
