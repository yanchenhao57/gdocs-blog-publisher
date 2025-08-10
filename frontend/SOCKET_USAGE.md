# Socket服务使用说明

本文档说明如何在React组件中使用Socket服务进行实时通信。

## 文件结构

```
frontend/src/
├── services/
│   ├── socket.ts              # 基础Socket服务封装
│   └── documentSocket.ts      # 文档转换专用Socket服务
├── hooks/
│   └── useSocket.ts           # React Hooks封装
├── contexts/
│   └── SocketContext.tsx      # Socket上下文管理
└── types/
    └── socket.ts              # Socket相关类型定义
```

## 快速开始

### 1. 在应用根组件中设置SocketProvider

```tsx
import { SocketProvider } from './contexts/SocketContext';

function App() {
  return (
    <SocketProvider autoConnect={true}>
      {/* 你的应用组件 */}
    </SocketProvider>
  );
}
```

### 2. 在组件中使用Socket连接状态

```tsx
import { useSocketContext } from './contexts/SocketContext';

function ConnectionStatus() {
  const { connectionStatus, isConnected, connect, disconnect } = useSocketContext();

  return (
    <div>
      <p>连接状态: {connectionStatus}</p>
      <p>已连接: {isConnected ? '是' : '否'}</p>
      <button onClick={connect} disabled={isConnected}>连接</button>
      <button onClick={disconnect} disabled={!isConnected}>断开</button>
    </div>
  );
}
```

### 3. 在组件中使用文档转换Socket服务

```tsx
import { useDocumentSocket } from './hooks/useSocket';

function DocumentConverter() {
  const {
    conversionStatus,
    progress,
    startConversion,
    regenerateAiData,
  } = useDocumentSocket();

  const handleStartConversion = async () => {
    await startConversion('your-doc-id');
  };

  const handleRegenerateAi = async () => {
    await regenerateAiData('your-doc-id', 'markdown content', 'zh');
  };

  return (
    <div>
      <p>转换状态: {conversionStatus}</p>
      {progress && (
        <div>
          <p>步骤: {progress.step}</p>
          <p>消息: {progress.message}</p>
        </div>
      )}
      <button onClick={handleStartConversion}>开始转换</button>
      <button onClick={handleRegenerateAi}>重新生成AI数据</button>
    </div>
  );
}
```

## 主要功能

### SocketService (基础服务)

- **连接管理**: `connect()`, `disconnect()`, `reconnect()`
- **事件监听**: `on()`, `off()`
- **消息发送**: `emit()`, `emitWithAck()`
- **状态查询**: `getConnectionStatus()`, `isConnected()`

### DocumentSocketService (文档转换服务)

- **文档转换**: `startDocumentConversion(docId)`
- **AI数据重新生成**: `regenerateAiData(docId, markdown, language)`
- **发布到Storyblok**: `publishToStoryblok(data)`
- **事件监听**: 支持所有转换相关事件的监听

### React Hooks

- **useSocketConnection()**: 管理Socket连接状态
- **useDocumentSocket()**: 管理文档转换状态和操作
- **useSocketEvent()**: 通用Socket事件监听

## 事件类型

### 连接状态事件
- `connectionStatusChanged`: 连接状态变化

### Google Docs事件
- `googleDocs:fetch:start`: 开始获取文档
- `googleDocs:fetch:success`: 文档获取成功
- `googleDocs:fetch:error`: 文档获取失败

### AI分析事件
- `ai:analysis:start`: 开始AI分析
- `ai:analysis:success`: AI分析成功
- `ai:analysis:error`: AI分析失败

### AI重新生成事件
- `ai:regenerate:start`: 开始重新生成
- `ai:regenerate:success`: 重新生成成功
- `ai:regenerate:error`: 重新生成失败

### Storyblok转换事件
- `storyblok:convert:start`: 开始转换
- `storyblok:convert:success`: 转换成功
- `storyblok:convert:error`: 转换失败

### 图片处理事件
- `image:process:start`: 开始处理图片
- `image:process:success`: 图片处理成功
- `image:process:error`: 图片处理失败

### 整体流程事件
- `convert:complete`: 转换完成
- `convert:error`: 转换错误

## 配置选项

### SocketConfig
```typescript
interface SocketConfig {
  url: string;                    // Socket服务器URL
  autoConnect?: boolean;          // 是否自动连接
  reconnection?: boolean;         // 是否自动重连
  reconnectionAttempts?: number;  // 重连尝试次数
  reconnectionDelay?: number;     // 重连延迟时间
  timeout?: number;               // 连接超时时间
}
```

### 环境变量
```bash
# .env.local
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 错误处理

### 连接错误
```tsx
const { connect } = useSocketContext();

const handleConnect = async () => {
  try {
    await connect();
  } catch (error) {
    console.error('连接失败:', error);
    // 显示错误提示
  }
};
```

### 转换错误
```tsx
const { startConversion } = useDocumentSocket();

const handleConversion = async () => {
  try {
    await startConversion(docId);
  } catch (error) {
    console.error('转换失败:', error);
    // 显示错误提示
  }
};
```

## 最佳实践

1. **在应用根组件中设置SocketProvider**，确保所有子组件都能访问Socket服务
2. **使用Hooks而不是直接调用服务**，这样可以获得更好的React集成
3. **及时清理事件监听器**，避免内存泄漏
4. **处理连接状态变化**，为用户提供清晰的反馈
5. **实现错误重试机制**，提高用户体验

## 示例组件

参考 `src/examples/SocketUsageExample.tsx` 文件，了解完整的使用示例。

## 注意事项

1. 确保Socket服务器正在运行
2. 检查网络连接和防火墙设置
3. 在生产环境中使用HTTPS/WSS连接
4. 实现适当的错误处理和用户反馈
5. 考虑连接超时和重连策略 