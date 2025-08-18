# 代理配置说明

## 概述

本项目支持智能代理检测，可以自动检测并配置 ClashX 或其他代理服务，用于访问 Google APIs。现在提供了灵活的启动方式来控制是否启用代理检测。

## 启动命令对比

### 🚀 `npm run start` - 常规启动（禁用代理检测）
```bash
npm run start
```
- **特点**: 禁用自动代理检测，启动更快
- **适用场景**: 
  - 本地开发环境
  - 不需要访问 Google APIs 的功能测试
  - 网络环境良好，无需代理的情况

### 🧠 `npm run start:smart` - 智能启动（启用代理检测）
```bash
npm run start:smart
```
- **特点**: 启用自动代理检测，会检测可用的代理服务
- **适用场景**:
  - 需要访问 Google APIs 的完整功能
  - 网络环境需要代理的情况
  - 生产环境或完整功能测试

### 🚫 `npm run start:skip-upload` - 跳过图片上传启动
```bash
npm run start:skip-upload
```
- **特点**: 禁用代理检测 + 跳过图片上传
- **适用场景**: 快速测试文档转换功能，不涉及图片处理

## 代理检测逻辑

### 启用代理检测时 (`start:smart`)
1. **检查环境变量**: 优先使用 `HTTP_PROXY` 或 `HTTPS_PROXY`
2. **自动检测 ClashX**: 依次检测以下端口
   - HTTP: `http://127.0.0.1:7890`
   - HTTPS: `http://127.0.0.1:7890`
   - SOCKS5: `socks5://127.0.0.1:7891`
3. **验证可用性**: 通过访问 `https://httpbin.org/ip` 验证代理是否可用
4. **配置全局环境**: 自动设置代理环境变量供后续请求使用

### 禁用代理检测时 (`start` / `start:skip-upload`)
- **跳过自动检测**: 不会进行代理可用性检测，启动更快
- **保留手动配置**: 仍然会使用环境变量中预设的代理配置
- **显示状态**: 控制台会显示 "🚫 代理自动检测已禁用"

## 环境变量配置

### 控制代理检测
```bash
# 禁用自动代理检测
DISABLE_PROXY_AUTO_DETECT=true

# 手动设置代理（优先级最高）
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

### 其他配置
```bash
# 跳过图片上传
SKIP_IMAGE_UPLOAD=true

# Google API 配置
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

## 代理检测日志示例

### 启用自动检测 (`start:smart`)
```
🔍 自动检测代理配置...
🔍 检测 http 代理: http://127.0.0.1:7890
✅ 检测到可用代理: http://127.0.0.1:7890
✅ 已设置代理环境变量: http://127.0.0.1:7890
🌐 使用代理配置 Google API 客户端
```

### 禁用自动检测 (`start`)
```
🚫 代理自动检测已禁用 (DISABLE_PROXY_AUTO_DETECT=true)
🚀 API server running at http://localhost:3000
```

## 使用建议

### 开发环境
- **日常开发**: 使用 `npm run start`，启动快速
- **测试 Google APIs**: 使用 `npm run start:smart`，确保功能完整

### 生产环境
- **推荐**: 使用 `npm run start:smart` 确保完整功能
- **或者**: 手动设置环境变量 `HTTP_PROXY` 和 `HTTPS_PROXY`

### 网络环境
- **国内环境**: 通常需要使用 `start:smart` 访问 Google APIs
- **海外环境**: 可以使用 `start`，无需代理

## 故障排查

### 代理检测失败
1. **检查 ClashX 是否运行**: 确保代理服务正在运行
2. **检查端口配置**: 确认 ClashX 端口设置正确
3. **手动设置代理**: 使用环境变量手动配置代理

### API 请求失败
1. **检查代理设置**: 确认代理配置正确
2. **网络连接**: 验证代理服务器可以访问目标 API
3. **认证信息**: 确认 Google API 认证配置正确

### 启动速度慢
- **使用 `npm run start`**: 跳过代理检测，提高启动速度
- **预设环境变量**: 手动设置代理，避免自动检测

## 技术实现

### 核心文件
- **`utils/proxyConfig.js`**: 代理检测和配置逻辑
- **`utils/googleAuth.js`**: Google API 认证，集成代理支持
- **`package.json`**: 定义不同的启动脚本

### 工作流程
1. **启动脚本**: 根据命令设置环境变量
2. **代理检测**: 在 Google API 调用时触发
3. **配置应用**: 自动配置 Google APIs 使用检测到的代理
4. **环境设置**: 为后续请求设置全局代理环境变量
