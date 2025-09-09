export default {
  apps: [
    {
      name: 'gdocs-api-server',
      script: './api-server/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_file: './logs/api-server.log',
      error_file: './logs/api-server-error.log',
      out_file: './logs/api-server-out.log',
      time: true
    },
    {
      name: 'gdocs-frontend',
      script: 'npm',
      args: 'run start:network',
      cwd: './frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_PUBLIC_API_URL: 'http://192.168.101.79:3000',
        NEXT_PUBLIC_SOCKET_URL: 'http://192.168.101.79:3000'
      },
      log_file: './logs/frontend.log',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      time: true
    }
  ]
};
