import defaultSocketService, { SocketService } from './socket';
import {
  NotificationData,
  SocketEventType,
  ConvertCompleteNotification,
  ConvertErrorNotification,
  SocketEventMap,
  TypedEventListener,
} from '../types/socket';

/**
 * 文档转换Socket服务
 * 专门处理Google Docs转换相关的Socket通信
 */
class DocumentSocketService {
  private socketService: SocketService;
  private listeners: Map<SocketEventType, Set<(data: NotificationData) => void>> = new Map();

  constructor(socketService: SocketService = defaultSocketService) {
    this.socketService = socketService;
    // 移除自动事件监听器设置，让组件通过 on() 或 onTyped() 显式注册
    // this.setupDefaultListeners();
  }

  /**
   * 设置默认的事件监听器 (已废弃)
   * @deprecated 移除自动事件监听器，改为组件显式注册
   */
  private setupDefaultListeners(): void {
    // 已移除自动事件监听器设置
    // 组件现在需要通过 on() 或 onTyped() 方法显式注册所需的事件监听器
  }

  /**
   * 开始转换文档
   */
  async startDocumentConversion(docId: string): Promise<void> {
    if (!this.socketService.isConnected()) {
      await this.socketService.connect();
    }

    this.socketService.emit('startConversion', { docId });
  }

  /**
   * 重新生成AI数据
   */
  async regenerateAiData(docId: string, markdown: string, userLanguage?: string): Promise<void> {
    if (!this.socketService.isConnected()) {
      await this.socketService.connect();
    }

    this.socketService.emit('regenerateAiData', { docId, markdown, userLanguage });
  }

  /**
   * 发布到Storyblok
   */
  async publishToStoryblok(publishData: Record<string, unknown>): Promise<void> {
    if (!this.socketService.isConnected()) {
      await this.socketService.connect();
    }

    this.socketService.emit('publishToStoryblok', publishData);
  }

  /**
   * 添加事件监听器
   */
  on(eventType: SocketEventType, callback: (data: NotificationData) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);

    // 返回取消监听的函数
    return () => {
      this.off(eventType, callback);
    };
  }

  /**
   * 添加类型安全的事件监听器
   */
  onTyped<T extends keyof SocketEventMap>(
    eventType: T,
    callback: TypedEventListener<T>
  ): () => void {
    // 使用类型安全的Socket服务方法
    const unsubscribe = this.socketService.onTyped(eventType, callback);
    
    // 还要在本地监听器集合中添加（为了兼容现有的notifyListeners逻辑）
    const genericCallback = callback as (data: NotificationData) => void;
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(genericCallback);

    // 返回取消监听的函数
    return () => {
      unsubscribe();
      this.off(eventType as SocketEventType, genericCallback);
    };
  }

  /**
   * 移除事件监听器
   */
  off(eventType: SocketEventType, callback: (data: NotificationData) => void): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  /**
   * 移除特定类型的所有监听器
   */
  offAll(eventType: SocketEventType): void {
    this.listeners.delete(eventType);
  }

  /**
   * 移除所有监听器
   */
  offAllEvents(): void {
    this.listeners.clear();
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(eventType: SocketEventType, data: NotificationData): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * 监听转换完成事件
   */
  onConversionComplete(callback: (data: ConvertCompleteNotification) => void): () => void {
    return this.on('convert:complete', callback as (data: NotificationData) => void);
  }

  /**
   * 监听转换错误事件
   */
  onConversionError(callback: (data: ConvertErrorNotification) => void): () => void {
    return this.on('convert:error', callback as (data: NotificationData) => void);
  }

  /**
   * 监听Google Docs获取事件
   */
  onGoogleDocsEvent(callback: (data: NotificationData) => void): () => void {
    const unsubscribe1 = this.on('googleDocs:fetch:start', callback);
    const unsubscribe2 = this.on('googleDocs:fetch:success', callback);
    const unsubscribe3 = this.on('googleDocs:fetch:error', callback);

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }

  /**
   * 监听AI分析事件
   */
  onAiAnalysisEvent(callback: (data: NotificationData) => void): () => void {
    const unsubscribe1 = this.on('ai:analysis:start', callback);
    const unsubscribe2 = this.on('ai:analysis:success', callback);
    const unsubscribe3 = this.on('ai:analysis:error', callback);

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }

  /**
   * 监听AI重新生成事件
   */
  onAiRegenerateEvent(callback: (data: NotificationData) => void): () => void {
    const unsubscribe1 = this.on('ai:regenerate:start', callback);
    const unsubscribe2 = this.on('ai:regenerate:success', callback);
    const unsubscribe3 = this.on('ai:regenerate:error', callback);

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }

  /**
   * 监听Storyblok转换事件
   */
  onStoryblokEvent(callback: (data: NotificationData) => void): () => void {
    const unsubscribe1 = this.on('storyblok:convert:start', callback);
    const unsubscribe2 = this.on('storyblok:convert:success', callback);
    const unsubscribe3 = this.on('storyblok:convert:error', callback);

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }

  /**
   * 监听图片处理事件
   */
  onImageProcessEvent(callback: (data: NotificationData) => void): () => void {
    const unsubscribe1 = this.on('image:process:start', callback);
    const unsubscribe2 = this.on('image:process:success', callback);
    const unsubscribe3 = this.on('image:process:error', callback);

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }

  /**
   * 获取Socket连接状态
   */
  getConnectionStatus() {
    return this.socketService.getConnectionStatus();
  }

  /**
   * 获取连接统计信息
   */
  getConnectionStats() {
    return this.socketService.getConnectionStats();
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.socketService.isConnected();
  }

  /**
   * 连接到Socket服务器
   */
  async connect(): Promise<void> {
    return this.socketService.connect();
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.socketService.disconnect();
  }

  /**
   * 手动重连
   */
  async reconnect(): Promise<void> {
    return this.socketService.reconnect();
  }
}

// 创建默认的文档Socket服务实例
const documentSocketService = new DocumentSocketService();

export { DocumentSocketService, documentSocketService };
export default documentSocketService; 