# Linux Server Setup Guide for FuelQ.ru

## Initial Setup

1. **Connect to your server** via SSH:
   ```bash
   ssh u3363187@server39
   ```

2. **Navigate to your website directory**:
   ```bash
   cd www/fuelq.ru
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

5. **Install project dependencies**:
   ```bash
   npm install
   ```

## Starting the Server

### Option 1: Using PM2 (Recommended)

1. **Make the startup script executable**:
   ```bash
   chmod +x start.sh
   ```

2. **Start the server with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **Save the PM2 configuration** to ensure it restarts on server reboot:
   ```bash
   pm2 startup
   pm2 save
   ```

4. **Check server status**:
   ```bash
   pm2 status
   pm2 logs fuelq-server
   ```

### Option 2: Using the Startup Script

1. **Make the startup script executable**:
   ```bash
   chmod +x start.sh
   ```

2. **Run the startup script**:
   ```bash
   ./start.sh
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
   pm2 restart fuelq-server
   ```

### If the server is not accessible:

1. **Check if the server is running**:
   ```bash
   pm2 status
   ```

2. **Check if port 3000 is listening**:
   ```bash
   netstat -tlnp | grep :3000
   ```

3. **Check the error logs**:
   ```bash
   pm2 logs fuelq-server --err
   ```

4. **Restart the server**:
   ```bash
   pm2 restart fuelq-server
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

1. **Pull the latest code**:
   ```bash
   git pull origin main
   ```

2. **Install new dependencies**:
   ```bash
   npm install
   ```

3. **Restart the server**:
   ```bash
   pm2 restart fuelq-server
   ```

### To view server metrics:

```bash
pm2 monit
```

### To backup the database:

```bash
mysqldump -u u3363187_fuelq_admin -p u3363187_fuelq > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Setting up Cron Jobs for Maintenance

1. **Open crontab editor**:
   ```bash
   crontab -e
   ```

2. **Add a daily backup job** (runs at 2 AM):
   ```
   0 2 * * * mysqldump -u u3363187_fuelq_admin -p'PASSWORD' u3363187_fuelq > /path/to/backups/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql
   ```

3. **Add a server health check** (runs every 5 minutes):
   ```
   */5 * * * * cd /path/to/www/fuelq.ru && pm2 list | grep -q "fuelq-server.*online" || pm2 restart fuelq-server
   ```
