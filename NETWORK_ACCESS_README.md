# 局域网访问配置指南

本文档介绍如何配置应用程序以支持局域网内其他设备的访问。

## 问题描述

默认情况下，应用程序的API服务器只监听localhost，前端也只向localhost发起请求。这意味着其他设备无法访问API接口，会出现类似以下错误：

```
POST http://localhost:3000/api/convert net::ERR_CONNECTION_REFUSED
```

## 解决方案

### 1. API服务器配置

API服务器已经配置为监听所有网络接口（`0.0.0.0`），这样其他设备就可以通过服务器的IP地址访问API。

**修改位置**：`api-server/server.js`
```javascript
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API server running at http://localhost:${PORT}`);
  console.log(`🌐 API server also accessible at http://192.168.101.79:${PORT}`);
});
```

### 2. 前端配置

#### 方法一：使用环境变量（推荐）

创建 `frontend/.env.local` 文件：
```env
NEXT_PUBLIC_API_URL=http://192.168.101.79:3000
NEXT_PUBLIC_SOCKET_URL=http://192.168.101.79:3000
```

#### 方法二：使用专用脚本

使用已配置的npm脚本：
```bash
# 开发环境（支持局域网访问）
cd frontend
npm run dev:network

# 构建（支持局域网访问）
npm run build:network

# 生产环境启动（支持局域网访问）
npm run start:network
```

## 使用步骤

### 1. 启动API服务器

```bash
# 在项目根目录
npm start
```

API服务器将在以下地址提供服务：
- 本机访问：`http://localhost:3000`
- 局域网访问：`http://192.168.101.79:3000`

### 2. 启动前端服务

#### 选项A：使用环境变量
```bash
cd frontend
# 创建 .env.local 文件并设置正确的API URL
echo "NEXT_PUBLIC_API_URL=http://192.168.101.79:3000" > .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://192.168.101.79:3000" >> .env.local
npm run dev
```

#### 选项B：使用专用脚本
```bash
cd frontend
npm run dev:network
```

前端服务将在以下地址提供服务：
- 本机访问：`http://localhost:3001`
- 局域网访问：`http://192.168.101.79:3001`

### 3. 局域网设备访问

其他设备现在可以通过以下地址访问应用：
- 前端界面：`http://192.168.101.79:3001`
- API接口：`http://192.168.101.79:3000`

## 注意事项

1. **IP地址**：请将 `192.168.101.79` 替换为实际的服务器IP地址
2. **防火墙**：确保服务器防火墙允许3000和3001端口的访问
3. **网络**：确保所有设备都在同一局域网内
4. **安全性**：此配置仅适用于开发环境和可信的局域网环境

## 故障排除

### 无法访问API
- 检查服务器IP地址是否正确
- 确认API服务器正在监听 `0.0.0.0:3000`
- 检查防火墙设置

### Socket.io连接失败
- 确认 `NEXT_PUBLIC_SOCKET_URL` 环境变量设置正确
- 检查Socket.io服务器的CORS配置

### 前端无法加载
- 确认前端服务使用 `-H 0.0.0.0` 参数启动
- 检查 `next.config.ts` 中的 `allowedDevOrigins` 配置

## 配置文件位置

- API服务器配置：`api-server/server.js`
- 前端配置：`frontend/next.config.ts`
- 环境变量：`frontend/.env.local`（需要手动创建）
- 脚本配置：`frontend/package.json`
