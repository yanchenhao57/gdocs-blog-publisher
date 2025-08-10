# 跳过图片上传模式使用说明

## 概述

为了便于开发和测试，我们提供了一个特殊的运行模式，可以让图片上传器直接返回原图片链接，而不执行实际的S3上传操作。这样可以：

- 🚀 **加快开发速度**：避免等待图片上传
- 💰 **节省成本**：不产生AWS S3费用
- 🔧 **便于调试**：专注于核心功能测试
- 📸 **保持功能完整**：图片仍然会显示，只是使用原链接

## 启动方式

### 方式1: 使用npm脚本 (推荐)

```bash
npm run start:skip-upload
```

### 方式2: 使用shell脚本 (macOS/Linux)

```bash
# 给脚本添加执行权限
chmod +x start-skip-upload.sh

# 运行脚本
./start-skip-upload.sh
```

### 方式3: 使用批处理文件 (Windows)

```cmd
start-skip-upload.bat
```

### 方式4: 手动设置环境变量

```bash
# macOS/Linux
export SKIP_IMAGE_UPLOAD=true
node api-server/server.js

# Windows
set SKIP_IMAGE_UPLOAD=true
node api-server/server.js
```

## 工作原理

当设置 `SKIP_IMAGE_UPLOAD=true` 环境变量时：

1. **图片上传器检测到跳过标志**
2. **跳过所有S3相关操作**：
   - 不下载图片
   - 不压缩图片
   - 不上传到S3
3. **直接返回原图片链接**
4. **在控制台显示跳过信息**

## 控制台输出示例

```
🔄 图片上传已跳过，将直接返回原图片链接
🚀 启动跳过图片上传模式的服务器...
📸 图片将不会被上传到S3，直接使用原图片链接

当前配置:
  SKIP_IMAGE_UPLOAD: true
  AWS_BUCKET_NAME: 未设置
  AWS_REGION_NOTTA: 未设置

正在启动服务器...
🚀 API server running at http://localhost:3000
🔌 Socket.io server ready
📱 Visit http://localhost:3000 to use the tool

🔄 跳过图片上传，直接返回原链接: https://example.com/image.jpg
```

## 注意事项

### ⚠️ **重要提醒**

1. **仅用于开发/测试**：生产环境请使用正常的启动命令
2. **图片链接有效性**：确保原图片链接可以正常访问
3. **功能完整性**：除了图片上传，其他功能完全正常
4. **环境变量优先级**：`SKIP_IMAGE_UPLOAD=true` 会覆盖其他配置

### 🔄 **切换回正常模式**

要恢复正常的图片上传功能，只需：

```bash
# 使用正常启动命令
npm start

# 或者清除环境变量
unset SKIP_IMAGE_UPLOAD  # macOS/Linux
set SKIP_IMAGE_UPLOAD=   # Windows
```

## 使用场景

### 🎯 **适合使用跳过模式的场景**

- 开发新功能时
- 调试核心逻辑时
- 测试文档转换流程时
- 在没有AWS凭证的环境中
- 快速原型验证时

### ❌ **不适合使用跳过模式的场景**

- 生产环境部署
- 需要图片CDN加速的场景
- 图片存储和管理的测试
- 图片压缩功能的验证

## 故障排除

### 问题1: 脚本没有执行权限

```bash
chmod +x start-skip-upload.sh
```

### 问题2: Windows批处理文件乱码

确保文件以UTF-8编码保存，或者使用PowerShell：

```powershell
$env:SKIP_IMAGE_UPLOAD="true"
node api-server/server.js
```

### 问题3: 环境变量没有生效

检查环境变量是否正确设置：

```bash
# macOS/Linux
echo $SKIP_IMAGE_UPLOAD

# Windows
echo %SKIP_IMAGE_UPLOAD%
```

## 总结

跳过图片上传模式是一个非常有用的开发工具，可以显著提高开发效率。通过简单的环境变量设置，你就可以在保持功能完整性的同时，避免不必要的图片上传操作。

记住：**开发时用跳过模式，生产时用正常模式**！ 