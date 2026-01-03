const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log file for server output
const logFile = path.join(__dirname, 'server.log');
const errorLogFile = path.join(__dirname, 'server-error.log');

// Function to start the server
function startServer() {
  console.log('Starting server...');

  // Create a write stream for logging
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  const errorLogStream = fs.createWriteStream(errorLogFile, { flags: 'a' });

  // Start the server process
  const serverProcess = spawn('node', ['server.js'], {
    stdio: ['pipe', logStream, errorLogStream],
    detached: true
  });

  // Log server start
  const timestamp = new Date().toISOString();
  logStream.write(`[${timestamp}] Server started with PID: ${serverProcess.pid}
`);

  // Handle server process exit
  serverProcess.on('exit', (code, signal) => {
    const exitTime = new Date().toISOString();
    logStream.write(`[${exitTime}] Server exited with code: ${code}, signal: ${signal}
`);

    // Restart the server if it crashed (exit code not 0)
    if (code !== 0) {
      logStream.write(`[${exitTime}] Restarting server in 5 seconds...
`);
      setTimeout(startServer, 5000);
    }
  });

  // Handle uncaught exceptions
  serverProcess.on('error', (err) => {
    const errorTime = new Date().toISOString();
    errorLogStream.write(`[${errorTime}] Server error: ${err.message}
`);
  });

  // Detach the process
  serverProcess.unref();

  return serverProcess;
}

// Start the server
const server = startServer();

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  if (server) {
    server.kill('SIGINT');
  }
  process.exit(0);
});

// Keep the process alive
setInterval(() => {
  // This interval prevents the process from exiting
}, 60000);
