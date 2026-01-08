module.exports = {
  apps: [{
    name: 'fuelq-server',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_HOST: 'server39.hosting.reg.ru',
      DB_USER: 'u3363187_fuelq_admin',
      DB_PASSWORD: '3r6flP9H4zUFXcS2',
      DB_NAME: 'u3363187_fuelq'
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000,
      DB_HOST: 'server39.hosting.reg.ru',
      DB_USER: 'u3363187_fuelq_admin',
      DB_PASSWORD: '3r6flP9H4zUFXcS2',
      DB_NAME: 'u3363187_fuelq'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
