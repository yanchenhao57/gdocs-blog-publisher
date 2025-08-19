# Google Docs 转换 Socket.io 实时通知 API 文档

## 概述

Google Docs 转换系统提供了基于 Socket.io 的实时通知功能，让客户端能够实时监听文档转换过程中的各个阶段进度，包括文档获取、AI 分析、图片处理等步骤的状态更新。

**实时性**: 所有转换步骤都会发送实时事件通知
**透明度**: 客户端可以清楚了解转换进度和可能的错误
**用户体验**: 提供更好的用户交互体验，避免长时间等待

## 基础信息

- **连接 URL**: `http://localhost:3000`
- **协议**: Socket.io (WebSocket)
- **命名空间**: 默认命名空间 `/`

## 连接设置

### JavaScript 客户端连接

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ['websocket', 'polling']
});

// 连接成功
socket.on("connect", () => {
  console.log("Socket连接成功:", socket.id);
});

// 连接断开
socket.on("disconnect", (reason) => {
  console.log("Socket连接断开:", reason);
});

// 连接错误
socket.on("connect_error", (error) => {
  console.error("Socket连接错误:", error);
});
```

### React Hook 示例

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io("http://localhost:3000");

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  return { socket, isConnected };
};
```

## 事件列表

### 文档转换流程事件

#### 1. Google Docs 获取阶段

**`googleDocs:fetch:start`** - 开始拉取 Google Docs

```javascript
socket.on("googleDocs:fetch:start", (data) => {
  console.log("开始拉取Google Docs:", data);
  // data: { docId: string, message: string }
});
```

**`googleDocs:fetch:success`** - Google Docs 拉取成功

```javascript
socket.on("googleDocs:fetch:success", (data) => {
  console.log("Google Docs拉取成功:", data);
  // data: { docId: string, message: string }
});
```

**`googleDocs:fetch:error`** - Google Docs 拉取失败

```javascript
socket.on("googleDocs:fetch:error", (data) => {
  console.error("Google Docs拉取失败:", data);
  // data: { docId: string, message: string, error: string }
});
```

#### 2. AI 分析阶段

**`ai:analysis:start`** - 开始 AI 分析

```javascript
socket.on("ai:analysis:start", (data) => {
  console.log("开始AI分析:", data);
  // data: { docId: string, message: string }
});
```

**`ai:analysis:success`** - AI 分析完成

```javascript
socket.on("ai:analysis:success", (data) => {
  console.log("AI分析完成:", data);
  // data: { 
  //   docId: string, 
  //   message: string, 
  //   aiMeta: {
  //     seo_title: string,
  //     seo_description: string,
  //     heading_h1: string,
  //     slug: string,
  //     reading_time: number,
  //     language: string,
  //     cover_alt: string
  //   }
  // }
});
```

**`ai:analysis:error`** - AI 分析失败

```javascript
socket.on("ai:analysis:error", (data) => {
  console.error("AI分析失败:", data);
  // data: { docId: string, message: string, error: string }
  // 注意: AI分析失败不会终止整个流程，会使用默认值继续
});
```

**`ai:analysis:fallback`** - AI 分析失败，使用默认值

```javascript
socket.on("ai:analysis:fallback", (data) => {
  console.warn("AI分析失败，使用默认值:", data);
  // data: { 
  //   docId: string, 
  //   message: string, 
  //   aiMeta: object,
  //   error: string 
  // }
});
```

#### 3. Storyblok 转换阶段

**`storyblok:convert:start`** - 开始 Storyblok 转换

```javascript
socket.on("storyblok:convert:start", (data) => {
  console.log("开始Storyblok转换:", data);
  // data: { docId: string, message: string }
});
```

**`storyblok:convert:success`** - Storyblok 转换完成

```javascript
socket.on("storyblok:convert:success", (data) => {
  console.log("Storyblok转换完成:", data);
  // data: { docId: string, message: string }
});
```

**`storyblok:convert:error`** - Storyblok 转换失败

```javascript
socket.on("storyblok:convert:error", (data) => {
  console.error("Storyblok转换失败:", data);
  // data: { docId: string, message: string, error: string }
});
```

#### 4. 图片处理阶段

**`image:process:start`** - 开始处理图片

```javascript
socket.on("image:process:start", (data) => {
  console.log("开始处理图片:", data);
  // data: { docId: string, imageUrl: string, message: string }
});
```

**`image:process:success`** - 图片处理完成

```javascript
socket.on("image:process:success", (data) => {
  console.log("图片处理完成:", data);
  // data: { 
  //   docId: string, 
  //   imageUrl: string, 
  //   resultUrl: string, 
  //   message: string 
  // }
});
```

**`image:process:error`** - 图片处理失败

```javascript
socket.on("image:process:error", (data) => {
  console.error("图片处理失败:", data);
  // data: { docId: string, imageUrl: string, message: string, error: string }
});
```

#### 5. 流程完成/错误事件

**`convert:complete`** - 转换流程完成

```javascript
socket.on("convert:complete", (data) => {
  console.log("转换流程完成:", data);
  // data: { 
  //   docId: string, 
  //   message: string, 
  //   summary: {
  //     totalImages: number,
  //     successImages: number,
  //     failedImages: number,
  //     aiAnalysisSuccess: boolean
  //   }
  // }
});
```

**`convert:error`** - 转换过程出错

```javascript
socket.on("convert:error", (data) => {
  console.error("转换过程出错:", data);
  // data: { docId: string, message: string, error: string }
});
```

### AI 重新生成流程事件

#### 1. 重新生成 AI 分析

**`ai:regenerate:analysis:start`** - 开始重新生成 AI 分析

```javascript
socket.on("ai:regenerate:analysis:start", (data) => {
  console.log("开始重新生成AI分析:", data);
  // data: { docId: string, message: string }
});
```

**`ai:regenerate:analysis:success`** - 重新生成 AI 分析完成

```javascript
socket.on("ai:regenerate:analysis:success", (data) => {
  console.log("重新生成AI分析完成:", data);
  // data: { 
  //   docId: string, 
  //   message: string, 
  //   aiMeta: {
  //     seo_title: string,
  //     seo_description: string,
  //     heading_h1: string,
  //     slug: string,
  //     reading_time: number,
  //     language: string,
  //     cover_alt: string
  //   }
  // }
});
```

**`ai:regenerate:error`** - 重新生成过程出错

```javascript
socket.on("ai:regenerate:error", (data) => {
  console.error("重新生成过程出错:", data);
  // data: { docId: string, message: string, error: string }
});
```

## 完整实现示例

### 基础监听器设置

```javascript
import io from "socket.io-client";

class DocumentConversionMonitor {
  constructor() {
    this.socket = io("http://localhost:3000");
    this.setupEventListeners();
    this.currentProgress = {};
  }

  setupEventListeners() {
    // 连接状态
    this.socket.on("connect", () => {
      console.log("✅ Socket连接成功");
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Socket连接断开");
    });

    // Google Docs 获取阶段
    this.socket.on("googleDocs:fetch:start", (data) => {
      this.updateProgress(data.docId, "fetching", "正在获取Google Docs文档...");
    });

    this.socket.on("googleDocs:fetch:success", (data) => {
      this.updateProgress(data.docId, "analyzing", "文档获取成功，开始AI分析...");
    });

    // AI 分析阶段
    this.socket.on("ai:analysis:start", (data) => {
      this.updateProgress(data.docId, "analyzing", "正在进行AI内容分析...");
    });

    this.socket.on("ai:analysis:success", (data) => {
      this.updateProgress(data.docId, "converting", "AI分析完成，开始格式转换...");
      this.onAiAnalysisComplete(data.docId, data.aiMeta);
    });

    this.socket.on("ai:analysis:error", (data) => {
      console.warn("⚠️ AI分析失败，使用默认值继续:", data.error);
      this.updateProgress(data.docId, "converting", "AI分析失败，使用默认值继续转换...");
    });

    // Storyblok 转换阶段
    this.socket.on("storyblok:convert:start", (data) => {
      this.updateProgress(data.docId, "converting", "正在转换为Storyblok格式...");
    });

    this.socket.on("storyblok:convert:success", (data) => {
      this.updateProgress(data.docId, "processing_images", "格式转换完成，开始处理图片...");
    });

    // 图片处理阶段
    this.socket.on("image:process:start", (data) => {
      this.onImageProcessStart(data.docId, data.imageUrl);
    });

    this.socket.on("image:process:success", (data) => {
      this.onImageProcessSuccess(data.docId, data.imageUrl, data.resultUrl);
    });

    this.socket.on("image:process:error", (data) => {
      this.onImageProcessError(data.docId, data.imageUrl, data.error);
    });

    // 完成/错误事件
    this.socket.on("convert:complete", (data) => {
      this.onConversionComplete(data.docId, data.summary);
    });

    this.socket.on("convert:error", (data) => {
      this.onConversionError(data.docId, data.error);
    });

    // 重新生成事件
    this.socket.on("ai:regenerate:analysis:start", (data) => {
      this.updateProgress(data.docId, "regenerating", "正在重新生成AI分析...");
    });

    this.socket.on("ai:regenerate:analysis:success", (data) => {
      this.onAiRegenerateComplete(data.docId, data.aiMeta);
    });
  }

  updateProgress(docId, stage, message) {
    this.currentProgress[docId] = { stage, message, timestamp: new Date() };
    console.log(`📋 [${docId}] ${message}`);
    
    // 触发UI更新事件
    this.onProgressUpdate?.(docId, stage, message);
  }

  onAiAnalysisComplete(docId, aiMeta) {
    console.log("🤖 AI分析结果:", aiMeta);
    this.onAiDataReceived?.(docId, aiMeta);
  }

  onImageProcessStart(docId, imageUrl) {
    console.log(`🖼️ 开始处理图片: ${imageUrl}`);
  }

  onImageProcessSuccess(docId, imageUrl, resultUrl) {
    console.log(`✅ 图片处理成功: ${imageUrl} -> ${resultUrl}`);
  }

  onImageProcessError(docId, imageUrl, error) {
    console.warn(`❌ 图片处理失败: ${imageUrl}`, error);
  }

  onConversionComplete(docId, summary) {
    this.updateProgress(docId, "completed", "转换完成！");
    console.log("🎉 转换完成:", summary);
    this.onConversionFinished?.(docId, summary);
  }

  onConversionError(docId, error) {
    this.updateProgress(docId, "error", `转换失败: ${error}`);
    console.error("❌ 转换失败:", error);
    this.onConversionFailed?.(docId, error);
  }

  onAiRegenerateComplete(docId, aiMeta) {
    console.log("🔄 AI重新生成完成:", aiMeta);
    this.onAiDataUpdated?.(docId, aiMeta);
  }

  // 公共方法
  startMonitoring(docId) {
    this.currentProgress[docId] = { stage: "waiting", message: "等待开始..." };
  }

  getProgress(docId) {
    return this.currentProgress[docId];
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// 使用示例
const monitor = new DocumentConversionMonitor();

// 设置回调函数
monitor.onProgressUpdate = (docId, stage, message) => {
  // 更新UI进度条
  updateProgressBar(stage, message);
};

monitor.onAiDataReceived = (docId, aiMeta) => {
  // 显示AI生成的元数据
  displayAiMetadata(aiMeta);
};

monitor.onConversionFinished = (docId, summary) => {
  // 显示完成消息
  showSuccessMessage(summary);
};

monitor.onConversionFailed = (docId, error) => {
  // 显示错误消息
  showErrorMessage(error);
};
```

### React Hook 完整实现

```javascript
import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

export const useDocumentConversion = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState({});
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const socketInstance = io("http://localhost:3000");

    // 连接状态处理
    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    // 设置所有事件监听器
    const eventHandlers = {
      "googleDocs:fetch:start": (data) => addEvent(data, "info"),
      "googleDocs:fetch:success": (data) => addEvent(data, "success"),
      "googleDocs:fetch:error": (data) => addEvent(data, "error"),
      
      "ai:analysis:start": (data) => addEvent(data, "info"),
      "ai:analysis:success": (data) => addEvent(data, "success"),
      "ai:analysis:error": (data) => addEvent(data, "warning"),
      
      "storyblok:convert:start": (data) => addEvent(data, "info"),
      "storyblok:convert:success": (data) => addEvent(data, "success"),
      "storyblok:convert:error": (data) => addEvent(data, "error"),
      
      "image:process:start": (data) => addEvent(data, "info"),
      "image:process:success": (data) => addEvent(data, "success"),
      "image:process:error": (data) => addEvent(data, "warning"),
      
      "convert:complete": (data) => addEvent(data, "success"),
      "convert:error": (data) => addEvent(data, "error"),
      
      "ai:regenerate:analysis:start": (data) => addEvent(data, "info"),
      "ai:regenerate:analysis:success": (data) => addEvent(data, "success"),
      "ai:regenerate:error": (data) => addEvent(data, "error"),
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socketInstance.on(event, handler);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  const addEvent = useCallback((data, type) => {
    const event = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      type,
      data,
    };
    
    setEvents(prev => [...prev, event]);
    
    // 更新进度
    if (data.docId) {
      setProgress(prev => ({
        ...prev,
        [data.docId]: {
          stage: getStageFromEvent(event),
          message: data.message,
          timestamp: event.timestamp,
          type
        }
      }));
    }
  }, []);

  const getStageFromEvent = (event) => {
    const eventType = event.data.type || 'unknown';
    if (eventType.includes('fetch')) return 'fetching';
    if (eventType.includes('analysis')) return 'analyzing';
    if (eventType.includes('convert')) return 'converting';
    if (eventType.includes('image')) return 'processing_images';
    if (eventType.includes('complete')) return 'completed';
    if (eventType.includes('error')) return 'error';
    return 'unknown';
  };

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const getProgressForDoc = useCallback((docId) => {
    return progress[docId];
  }, [progress]);

  return {
    socket,
    isConnected,
    events,
    progress,
    clearEvents,
    getProgressForDoc,
  };
};
```

## 最佳实践

### 1. 错误处理

```javascript
// 设置错误处理
socket.on("connect_error", (error) => {
  console.error("连接失败:", error);
  // 实现重连逻辑
  setTimeout(() => {
    socket.connect();
  }, 5000);
});

// 处理AI分析失败（非致命错误）
socket.on("ai:analysis:error", (data) => {
  // AI失败不应该停止整个流程
  console.warn("AI分析失败，将使用默认值:", data.error);
  showNotification("AI分析失败，使用默认设置继续转换", "warning");
});
```

### 2. 性能优化

```javascript
// 限制事件日志数量
const MAX_EVENTS = 100;
const addEvent = (event) => {
  setEvents(prev => {
    const newEvents = [...prev, event];
    return newEvents.length > MAX_EVENTS 
      ? newEvents.slice(-MAX_EVENTS) 
      : newEvents;
  });
};

// 防抖处理频繁的图片处理事件
const debouncedImageUpdate = debounce((data) => {
  updateImageProgress(data);
}, 300);
```

### 3. 用户体验

```javascript
// 提供有意义的进度反馈
const getProgressPercentage = (stage) => {
  const stages = {
    'waiting': 0,
    'fetching': 20,
    'analyzing': 40,
    'converting': 60,
    'processing_images': 80,
    'completed': 100,
    'error': 0
  };
  return stages[stage] || 0;
};

// 优雅的错误显示
const handleConversionError = (docId, error) => {
  showNotification(
    "文档转换失败", 
    `请检查文档ID是否正确: ${error}`,
    "error",
    { duration: 10000, showRetry: true }
  );
};
```

## 注意事项

1. **连接管理**: 确保在组件卸载时正确关闭Socket连接
2. **事件清理**: 避免内存泄漏，及时清理不需要的事件监听器  
3. **错误恢复**: AI分析失败是可恢复的，不应该终止整个流程
4. **进度跟踪**: 使用docId来跟踪特定文档的转换进度
5. **性能考虑**: 对于大量图片的文档，图片处理事件可能很频繁
6. **用户反馈**: 提供清晰的进度指示和错误信息

## 更新日志

### v1.0.0

- 初始版本发布
- 支持完整的文档转换流程事件
- 支持AI重新生成流程事件
- 提供详细的事件数据结构
- 包含完整的使用示例和最佳实践
