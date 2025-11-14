module.exports = {
  apps: [
    {
      name: 'discord-bot',
      script: './src/index.js',
      cwd: '/home/zeus-system/htdocs/panel.zeus-system.lat',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/home/zeus-system/.pm2/logs/discord-bot-error.log',
      out_file: '/home/zeus-system/.pm2/logs/discord-bot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'zeus-dashboard',
      script: './dashboard/server.js',
      cwd: '/home/zeus-system/htdocs/panel.zeus-system.lat',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/home/zeus-system/.pm2/logs/zeus-dashboard-error.log',
      out_file: '/home/zeus-system/.pm2/logs/zeus-dashboard-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
