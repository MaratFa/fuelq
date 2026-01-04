# FuelQ Server Structure Documentation

This document explains the server structure and organization of the FuelQ application.

## Server Files

### Main Server File

- `server.js` - The main server file that consolidates all server functionality
  - Express server setup
  - Static file serving
  - API endpoints
  - Database connection
  - Graceful shutdown handling

### Configuration Files

- `ecosystem.config.js` - PM2 configuration for process management
  - Production and development environment settings
  - Logging configuration
  - Memory and restart settings

### Service Worker

- `src/sw.js` - Service worker for offline functionality and caching
  - Caching strategies for static and dynamic content
  - Background sync for form submissions
  - Offline fallback handling
  - Served from both `/sw.js` (for backward compatibility) and `/src/sw.js`

### Startup Scripts

- `start-unified.sh` - Unified startup script for Linux/Mac systems
- `start-unified.bat` - Unified startup script for Windows systems
- `start-server.js` - Programmatic server startup with logging and auto-restart
- `watchdog.sh` - Script to monitor and restart the server if it crashes

## API Endpoints

### Health Check
- `GET /api/health` - Returns server status

### Forum API
- `GET /api/forum/threads` - Get all forum threads
- `GET /api/forum/threads/:id` - Get a specific thread
- `GET /api/forum/threads/:id/posts` - Get posts for a specific thread
- `POST /api/forum/threads` - Create a new thread
- `POST /api/forum/threads/:id/posts` - Create a new post in a thread

### Contact Form
- `POST /api/contact` - Submit the contact form

## Static File Serving

The server serves static files from multiple directories:

- `/src/assets` - CSS, JavaScript, images, and other assets
- `/src/components` - HTML components
- Root directory - For files like index.html

## Database

The server connects to a MySQL database using connection details from environment variables:

- `DB_HOST` - Database host (default: localhost)
- `DB_USER` - Database username (default: root)
- `DB_PASSWORD` - Database password (default: empty)
- `DB_NAME` - Database name (default: fuelq)

## Logging

The server creates logs in the `logs` directory:

- `out.log` - Standard output
- `err.log` - Error output
- `combined.log` - Combined output (when using PM2)

## Deployment

### Using PM2 (Recommended)

```bash
# Start with PM2
pm2 start ecosystem.config.js

# View logs
pm2 logs fuelq-server

# Restart
pm2 restart fuelq-server

# Stop
pm2 stop fuelq-server
```

### Using Startup Scripts

```bash
# Linux/Mac
./start-unified.sh --pm2

# Windows
start-unified.bat /pm2
```

### Direct Start

```bash
node server.js
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fuelq
```

## Previous Server Files

The following server files have been consolidated into `server.js`:

- `server-with-restart.js` - Functionality incorporated into `server.js` and `start-server.js`
- `server-prod.js` - Functionality incorporated into `server.js`

The `start-server.js` file is still used by the startup scripts for programmatic server management with logging and auto-restart capabilities.
