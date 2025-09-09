# Mac服务持久化运行指南

本指南介绍如何让您的服务在Mac合上盖子后仍然持续运行，确保局域网内其他设备能够正常访问。

## 方案一：系统设置配置（推荐）

### 1. 防止Mac休眠

#### 方法A：使用系统偏好设置
1. 打开 "系统偏好设置" > "节能"
2. 在 "电源适配器" 选项卡中：
   - 将 "防止电脑自动进入睡眠" 滑块调到 "永不"
   - 勾选 "当显示器关闭时，防止电脑自动进入睡眠"
3. 确保Mac连接电源适配器

#### 方法B：使用命令行（临时）
```bash
# 防止系统休眠（在终端运行，关闭终端后失效）
caffeinate -d

# 防止系统休眠并运行特定命令
caffeinate -d npm start

# 设置永久不休眠（需要管理员权限）
sudo pmset -a sleep 0
sudo pmset -a displaysleep 0
sudo pmset -a disksleep 0
```

### 2. 合盖模式配置

#### 启用合盖模式（clamshell mode）
```bash
# 查看当前设置
pmset -g custom

# 设置合盖不休眠（连接外部显示器时）
sudo pmset -a lidwake 0

# 恢复默认设置
sudo pmset -a lidwake 1
```

## 方案二：使用PM2进程管理器（最佳实践）

### 1. 安装PM2
```bash
npm install -g pm2
```

### 2. 创建PM2配置文件
创建 `ecosystem.config.js` 文件：

```javascript
module.exports = {
  apps: [
    {
      name: 'api-server',
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
      }
    },
    {
      name: 'frontend',
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
      }
    }
  ]
};
```

### 3. PM2 命令
```bash
# 启动所有服务
pm2 start ecosystem.config.js

# 停止所有服务
pm2 stop all

# 重启所有服务
pm2 restart all

# 查看服务状态
pm2 status

# 查看日志
pm2 logs

# 设置开机自启动
pm2 startup
pm2 save

# 删除开机自启动
pm2 unstartup
```

## 方案三：使用Docker（高级用户）

### 1. 创建Dockerfile
```dockerfile
# API服务器
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "api-server/server.js"]
```

### 2. 创建docker-compose.yml
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    networks:
      - app-network
  
  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_API_URL=http://192.168.101.79:3000
      - NEXT_PUBLIC_SOCKET_URL=http://192.168.101.79:3000
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## 推荐配置步骤

### 1. 系统设置
```bash
# 防止Mac休眠
sudo pmset -a sleep 0
sudo pmset -a displaysleep 10  # 10分钟后关闭显示器，但保持系统运行
```

### 2. 使用PM2管理服务
```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start ecosystem.config.js

# 设置开机自启动
pm2 startup
pm2 save
```

### 3. 验证服务状态
```bash
# 检查PM2服务状态
pm2 status

# 检查服务是否可访问
curl http://localhost:3000
curl http://192.168.101.79:3000
```

## 注意事项

1. **电源管理**：
   - 建议保持Mac连接电源适配器
   - 可以关闭显示器但保持系统运行

2. **网络连接**：
   - 确保Mac保持WiFi连接
   - 合盖时WiFi连接可能会断开，建议使用有线网络

3. **安全考虑**：
   - 不休眠会增加电池消耗
   - 确保在安全的环境中运行

4. **监控**：
   - 定期检查服务运行状态
   - 设置日志文件监控

## 故障排除

### 服务意外停止
```bash
# 检查PM2状态
pm2 status

# 查看错误日志
pm2 logs

# 重启服务
pm2 restart all
```

### Mac仍然进入休眠
```bash
# 检查当前电源设置
pmset -g

# 重新设置不休眠
sudo pmset -a sleep 0
```

### 网络连接中断
- 检查WiFi设置中的"自动连接"选项
- 考虑使用有线网络连接
- 重启网络服务：`sudo ifconfig en0 down && sudo ifconfig en0 up`
