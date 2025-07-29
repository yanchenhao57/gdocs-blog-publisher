# Socket.io 实时通知功能

本项目已集成 Socket.io 实时通知功能，可以在 Google Docs 转换过程中实时向前端推送进度通知。

## 功能特点

- 🔌 **实时连接**: 使用 Socket.io 建立 WebSocket 连接
- 📊 **进度跟踪**: 实时跟踪转换流程的各个步骤
- 🖼️ **图片处理**: 监控图片上传和处理进度
- 🤖 **AI分析**: 跟踪AI结构化分析进度
- ⚡ **即时反馈**: 前端可以立即收到后端状态变化

## 安装和启动

### 1. 安装依赖

```bash
npm install socket.io
```

### 2. 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动，同时支持 HTTP API 和 WebSocket 连接。

## 实时通知事件

### 连接事件
- `connect`: 客户端连接成功
- `disconnect`: 客户端断开连接

### Google Docs 相关事件
- `googleDocs:fetch:start`: 开始拉取 Google Docs 文档信息
- `googleDocs:fetch:success`: Google Docs 文档信息拉取成功

### Storyblok 转换事件
- `storyblok:convert:start`: 开始转换 Google Docs 到 Storyblok 格式
- `storyblok:convert:success`: Google Docs 到 Storyblok 转换完成

### AI 分析事件
- `ai:analysis:start`: 开始 AI 结构化分析
- `ai:analysis:success`: AI 结构化分析完成

### 图片处理事件
- `image:process:start`: 开始处理图片
- `image:process:success`: 图片处理完成
- `image:process:error`: 图片处理失败

### 整体流程事件
- `convert:complete`: 整个转换流程完成
- `convert:error`: 转换过程中出现错误

## 前端集成示例

### 1. 连接 Socket.io

```javascript
// 引入 Socket.io 客户端
<script src="/socket.io/socket.io.js"></script>

// 建立连接
const socket = io();

// 监听连接状态
socket.on('connect', () => {
  console.log('已连接到服务器');
});

socket.on('disconnect', () => {
  console.log('连接已断开');
});
```

### 2. 监听转换事件

```javascript
// 监听 Google Docs 拉取事件
socket.on('googleDocs:fetch:start', (data) => {
  console.log('开始拉取文档:', data.message);
  // 更新UI显示进度
});

socket.on('googleDocs:fetch:success', (data) => {
  console.log('文档拉取成功:', data.message);
  // 更新UI显示成功状态
});

// 监听 Storyblok 转换事件
socket.on('storyblok:convert:start', (data) => {
  console.log('开始转换:', data.message);
});

socket.on('storyblok:convert:success', (data) => {
  console.log('转换完成:', data.message);
});

// 监听 AI 分析事件
socket.on('ai:analysis:start', (data) => {
  console.log('开始AI分析:', data.message);
});

socket.on('ai:analysis:success', (data) => {
  console.log('AI分析完成:', data.message, data.aiMeta);
});

// 监听图片处理事件
socket.on('image:process:start', (data) => {
  console.log('开始处理图片:', data.imageUrl);
});

socket.on('image:process:success', (data) => {
  console.log('图片处理完成:', data.resultUrl);
});

// 监听整体完成事件
socket.on('convert:complete', (data) => {
  console.log('转换流程完成:', data.summary);
});
```

### 3. 发送转换请求

```javascript
async function startConvert(docId) {
  try {
    const response = await fetch('/api/convert-doc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ docId }),
    });
    
    if (!response.ok) {
      throw new Error('转换请求失败');
    }
    
    const data = await response.json();
    console.log('转换结果:', data);
    
  } catch (error) {
    console.error('转换错误:', error);
  }
}
```

## 演示页面

访问 `http://localhost:3000/socket-demo` 可以查看实时通知演示页面。

该页面包含：
- 🔌 连接状态显示
- 📝 测试表单
- 📊 实时通知列表
- 🎨 美观的UI界面

## 图片压缩优化

新增了图片大小判断功能：
- 如果图片小于 200KB，跳过压缩
- 如果图片大于 200KB，进行压缩处理
- 压缩参数：JPEG格式，最大宽度1200px，质量70%

## 事件数据结构

每个事件都包含以下基础字段：
```javascript
{
  timestamp: "2024-01-01T12:00:00.000Z", // 事件时间戳
  docId: "文档ID",                       // 文档ID
  message: "事件描述",                   // 事件消息
  // ... 其他特定字段
}
```

## 错误处理

所有事件都包含错误处理：
- 网络错误会自动重试
- 图片处理失败会发送错误通知
- 转换流程错误会发送详细错误信息

## 生产环境配置

在生产环境中，建议：
1. 设置具体的 CORS 域名而不是 `"*"`
2. 添加身份验证机制
3. 限制连接数量和频率
4. 监控 Socket.io 连接状态

```javascript
const io = new Server(server, {
  cors: {
    origin: ["https://yourdomain.com"], // 设置具体域名
    methods: ["GET", "POST"]
  }
});
``` 