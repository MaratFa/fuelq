# Server Logs Directory

This directory contains logs from the FuelQ server:

- `err.log` - Error logs
- `out.log` - Standard output logs
- `combined.log` - Combined error and output logs

## Viewing Logs with PM2

To view logs in real-time:
```
pm2 logs fuelq-server
```

To view only error logs:
```
pm2 logs fuelq-server --err
```

To view only output logs:
```
pm2 logs fuelq-server --out
```

## Log Rotation

To set up log rotation with PM2:
```
pm2 install pm2-logrotate
```

Then configure log rotation:
```
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```
