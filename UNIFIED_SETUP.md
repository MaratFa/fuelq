# FuelQ.ru Setup Guide

This comprehensive guide provides instructions for setting up the FuelQ website in different environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Setup](#database-setup)
4. [Server Startup Options](#server-startup-options)
5. [Platform-Specific Instructions](#platform-specific-instructions)
   - [Linux Server](#linux-server)
   - [Shared Hosting (No Sudo)](#shared-hosting-no-sudo)
   - [Windows](#windows)
6. [Maintenance and Monitoring](#maintenance-and-monitoring)

## Prerequisites

- Node.js (version 14 or higher)
- MySQL database
- Git (for cloning the repository)
- SSH access (for remote servers)

## Initial Setup

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd fuelq
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your specific configuration
   ```

## Database Setup

1. **Ensure MySQL server is running**:
   - On Linux: `sudo systemctl status mysql`
   - On Windows: Check Services for MySQL service

2. **Create database and user** (if needed):
   ```sql
   CREATE DATABASE fuelq;
   CREATE USER 'fuelq_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON fuelq.* TO 'fuelq_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Import the database schema**:
   ```bash
   mysql -u your_username -p fuelq < database/schema.sql
   ```

4. **Update database connection settings** in `.env`:
   ```
   DB_HOST=localhost
   DB_USER=fuelq_user
   DB_PASSWORD=your_password
   DB_NAME=fuelq
   ```

## Server Startup Options

The FuelQ server can be started in several ways using the unified startup scripts:

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
```

## Platform-Specific Instructions

### Linux Server

1. **Connect to your server** via SSH:
   ```bash
   ssh username@your-server
   ```

2. **Navigate to your website directory**:
   ```bash
   cd /path/to/fuelq
   ```

3. **Install Node.js** (if not already installed):
   ```bash
   # Check if Node.js is installed
   node --version

   # If not installed, install it using:
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2** (Process Manager for Node.js):
   ```bash
   sudo npm install -g pm2
   ```

5. **Start the server with PM2** (recommended for production):
   ```bash
   ./start-unified.sh --pm2
   ```

6. **Set up PM2 to start on system boot**:
   ```bash
   pm2 startup
   pm2 save
   ```

### Shared Hosting (No Sudo)

1. **Connect to your server** via SSH:
   ```bash
   ssh username@your-server
   ```

2. **Navigate to your website directory**:
   ```bash
   cd /path/to/fuelq
   ```

3. **Install project dependencies**:
   ```bash
   npm install
   ```

4. **Start the server with local PM2**:
   ```bash
   ./start-unified.sh --local-pm2
   ```

5. **Set up a cron job to restart the server if it crashes**:
   ```bash
   crontab -e
   # Add the following line to check every 5 minutes
   */5 * * * * cd /path/to/fuelq && ./start-unified.sh --local-pm2 > /dev/null 2>&1
   ```

### Windows

1. **Open Command Prompt or PowerShell** as administrator

2. **Navigate to your website directory**:
   ```cmd
   cd C:\path	ouelq
   ```

3. **Install PM2** (optional, but recommended for production):
   ```cmd
   npm install -g pm2
   ```

4. **Start the server**:
   ```cmd
   # Direct start
   start-unified.bat

   # Or with PM2
   start-unified.bat /pm2
   ```

5. **Set up automatic startup**:
   - Press Win+R, type `shell:startup` and press Enter
   - Create a shortcut to `start-unified.bat` in the startup folder

## Maintenance and Monitoring

### Checking Server Status

**With PM2**:
```bash
pm2 list
pm2 logs fuelq-server
```

**Without PM2**:
- Check the logs in the `logs` directory
- Use the watchdog script for automatic monitoring

### Updating the Application

1. **Pull the latest changes**:
   ```bash
   git pull origin main
   ```

2. **Install new dependencies** (if any):
   ```bash
   npm install
   ```

3. **Restart the server**:
   - With PM2: `pm2 restart fuelq-server`
   - Without PM2: Stop the current process and run the startup script again

### Database Backups

Set up regular database backups:

```bash
# Create a backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u your_username -p your_password fuelq > backups/fuelq_backup_$DATE.sql
# Keep only the last 7 days of backups
find backups/ -name "fuelq_backup_*.sql" -mtime +7 -delete
EOF

chmod +x backup-db.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add: 0 2 * * * /path/to/fuelq/backup-db.sh
```

## Troubleshooting

### Common Issues

1. **Port already in use**:
   - Check which process is using the port: `netstat -tulpn | grep :3000`
   - Kill the process: `kill -9 [PID]`

2. **Database connection errors**:
   - Verify database is running
   - Check credentials in `.env` file
   - Ensure database user has proper permissions

3. **Module not found errors**:
   - Run `npm install` to install missing dependencies
   - Check if `node_modules` directory exists and has proper permissions

4. **Permission issues**:
   - Ensure scripts are executable: `chmod +x *.sh`
   - Check file ownership: `chown -R user:group /path/to/fuelq`

### Getting Help

If you encounter issues not covered in this guide:

1. Check the application logs in the `logs` directory
2. Review error messages carefully
3. Search for the error message online
4. Contact the development team with detailed error information

## Security Considerations

1. **Keep dependencies updated**:
   ```bash
   npm audit
   npm audit fix
   ```

2. **Use HTTPS in production**:
   - Configure SSL certificates
   - Redirect HTTP to HTTPS

3. **Protect sensitive data**:
   - Never commit `.env` files to version control
   - Use strong passwords for database
   - Implement rate limiting for API endpoints

4. **Regular backups**:
   - Set up automated database backups
   - Backup application files regularly
