# FuelQ.ru Setup Guide for Shared Hosting

This guide provides step-by-step instructions for setting up the FuelQ website on a shared hosting environment without sudo privileges.

## Initial Setup

1. **Connect to your server** via SSH:
   ```bash
   ssh u3363187@server39
   ```

2. **Navigate to your website directory**:
   ```bash
   cd www/fuelq.ru
   ```

3. **Install project dependencies**:
   ```bash
   npm install
   ```

## Starting the Server

### Option 1: Using the Simple Start Script (Recommended)

1. **Make the scripts executable**:
   ```bash
   chmod +x simple-start.sh
   chmod +x watchdog.sh
   ```

2. **Start the server**:
   ```bash
   ./simple-start.sh start
   ```

3. **Check server status**:
   ```bash
   ./simple-start.sh status
   ```

4. **View logs**:
   ```bash
   tail -f logs/out.log
   tail -f logs/err.log
   ```

### Option 2: Using the Watchdog Script (More Robust)

1. **Make the scripts executable**:
   ```bash
   chmod +x watchdog.sh
   ```

2. **Start the watchdog in the background**:
   ```bash
   nohup ./watchdog.sh > watchdog.log 2>&1 &
   ```

3. **Check watchdog status**:
   ```bash
   tail -f watchdog.log
   ```

## Setting Up Automatic Restart on Server Reboot

Since you don't have sudo privileges, you'll need to use a cron job to restart the server when the system reboots:

1. **Open crontab editor**:
   ```bash
   crontab -e
   ```

2. **Add the following line** to restart the server on system reboot:
   ```
   @reboot cd /home/u3363187/www/fuelq.ru && ./simple-start.sh start > /home/u3363187/www/fuelq.ru/logs/cron.log 2>&1
   ```

3. **Add a health check** to run every 5 minutes:
   ```
   */5 * * * * cd /home/u3363187/www/fuelq.ru && ./simple-start.sh status > /dev/null || ./simple-start.sh start > /dev/null 2>&1
   ```

## Troubleshooting

### If you get a module loading error:

1. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and package-lock.json**:
   ```bash
   rm -rf node_modules package-lock.json
   ```

3. **Reinstall dependencies**:
   ```bash
   npm install
   ```

4. **Restart the server**:
   ```bash
   ./simple-start.sh restart
   ```

### If the server is not accessible:

1. **Check if the server is running**:
   ```bash
   ./simple-start.sh status
   ```

2. **Check if port 3000 is listening**:
   ```bash
   netstat -tlnp | grep :3000
   ```

3. **Check the error logs**:
   ```bash
   tail -f logs/err.log
   ```

4. **Restart the server**:
   ```bash
   ./simple-start.sh restart
   ```

### If database connection issues occur:

1. **Test database connection**:
   ```bash
   mysql -u u3363187_fuelq_admin -p u3363187_fuelq
   ```

2. **Check if database and tables exist**:
   ```sql
   USE u3363187_fuelq;
   SHOW TABLES;
   ```

3. **Import schema if needed**:
   ```bash
   mysql -u u3363187_fuelq_admin -p u3363187_fuelq < database/schema.sql
   ```

## Maintenance

### To update the application:

1. **Stop the server**:
   ```bash
   ./simple-start.sh stop
   ```

2. **Pull the latest code** (if using git):
   ```bash
   git pull origin main
   ```

3. **Install new dependencies**:
   ```bash
   npm install
   ```

4. **Start the server**:
   ```bash
   ./simple-start.sh start
   ```

### To backup the database:

```bash
mysqldump -u u3363187_fuelq_admin -p u3363187_fuelq > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Additional Tips

1. **Monitor disk space** regularly to ensure you don't run out of space:
   ```bash
   df -h
   ```

2. **Set up log rotation** to prevent logs from consuming too much space:
   ```bash
   # Add to crontab
   0 0 * * * find /home/u3363187/www/fuelq.ru/logs -name "*.log" -mtime +7 -delete
   ```

3. **Monitor server resources** using the hosting control panel or command:
   ```bash
   top
   ```

4. **Check for security updates** regularly:
   ```bash
   npm audit
   npm audit fix
   ```

## Files Overview

- `server-with-restart.js` - Enhanced server with auto-restart capabilities
- `simple-start.sh` - Script to start/stop/restart/check server status
- `watchdog.sh` - Script to monitor server and restart if it crashes
- `logs/` - Directory containing server logs
- `.env` - Environment variables for database connection and server configuration

With this setup, your FuelQ website should be constantly accessible at https://fuelq.ru, even on a shared hosting environment without sudo privileges.
