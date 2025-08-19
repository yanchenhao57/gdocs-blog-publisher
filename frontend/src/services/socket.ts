import { io, Socket } from 'socket.io-client';
import {
  SocketEventType,
  NotificationData,
  SocketConnectionStatus,
  SocketConfig,
  EventListener,
  EventListeners,
  SocketEventMap,
  TypedEventListener,
} from '../types/socket';

/**
 * Socket服务类
 * 提供WebSocket连接管理、事件监听、消息发送等功能
 */
class SocketService {
  private socket: Socket | null = null;
  private connectionStatus: SocketConnectionStatus = 'disconnected';
  private eventListeners: EventListeners = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private config: SocketConfig;

  constructor(config: SocketConfig) {
    this.config = {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      ...config,
    };
  }

  /**
   * 获取当前连接状态
   */
  getConnectionStatus(): SocketConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * 获取Socket实例
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * 连接到Socket服务器
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🔌 SocketService.connect() 被调用');
      console.log('🔗 目标URL:', this.config.url);
      
      if (this.socket?.connected) {
        console.log('✅ Socket已经连接');
        resolve();
        return;
      }

      console.log('🔄 开始连接...');
      this.updateConnectionStatus('connecting');

      try {
        console.log('🔧 创建Socket实例...');
        this.socket = io(this.config.url, {
          autoConnect: false,
          reconnection: this.config.reconnection,
          reconnectionAttempts: this.config.reconnectionAttempts,
          reconnectionDelay: this.config.reconnectionDelay,
          timeout: this.config.timeout,
        });

        console.log('🔧 设置Socket事件处理器...');
        this.setupSocketEventHandlers();
        
        console.log('🔌 调用socket.connect()...');
        this.socket.connect();

        // 设置连接超时
        const timeout = setTimeout(() => {
          if (this.connectionStatus === 'connecting') {
            console.log('⏰ 连接超时');
            this.updateConnectionStatus('error');
            reject(new Error('Connection timeout'));
          }
        }, this.config.timeout);

        // 连接成功
        this.socket.on('connect', () => {
          console.log('✅ Socket连接成功!');
          clearTimeout(timeout);
          this.updateConnectionStatus('connected');
          this.reconnectAttempts = 0;
          
          // 重新注册所有已添加的事件监听器
          this.reregisterEventListeners();
          
          resolve();
        });

        // 连接错误
        this.socket.on('connect_error', (error) => {
          console.log('❌ Socket连接错误:', error);
          clearTimeout(timeout);
          this.updateConnectionStatus('error');
          reject(error);
        });

      } catch (error) {
        console.error('💥 Socket连接过程中发生异常:', error);
        this.updateConnectionStatus('error');
        reject(error);
      }
    });
  }

  /**
   * 断开Socket连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.updateConnectionStatus('disconnected');
      this.clearAllEventListeners();
    }
  }

  /**
   * 重新注册所有事件监听器
   */
  private reregisterEventListeners(): void {
    if (!this.socket) return;

    Object.keys(this.eventListeners).forEach((eventType) => {
      const listeners = this.eventListeners[eventType];
      listeners.forEach((listener) => {
        this.socket!.on(eventType, listener);
      });
    });
  }

  /**
   * 设置Socket事件处理器
   */
  private setupSocketEventHandlers(): void {
    if (!this.socket) return;

    // 连接断开
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.updateConnectionStatus('disconnected');
      
      if (reason === 'io server disconnect') {
        // 服务器主动断开，尝试重连
        this.attemptReconnect();
      }
    });

    // 重连尝试
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
    });

    // 重连成功
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      this.updateConnectionStatus('connected');
      this.reconnectAttempts = 0;
    });

    // 重连失败
    this.socket.on('reconnect_failed', () => {
      console.log('Reconnection failed');
      this.updateConnectionStatus('error');
    });

    // 错误处理
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.updateConnectionStatus('error');
    });
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect();
        }
      }, this.reconnectDelay * (this.reconnectAttempts + 1));
    }
  }

  /**
   * 更新连接状态
   */
  private updateConnectionStatus(status: SocketConnectionStatus): void {
    this.connectionStatus = status;
    // 触发状态变化事件，供UI组件监听
    this.triggerConnectionStatusEvent(status);
  }

  /**
   * 触发连接状态变化事件
   */
  private triggerConnectionStatusEvent(status: SocketConnectionStatus): void {
    // 直接调用所有监听器，不依赖socket连接状态
    const listeners = this.eventListeners['connectionStatusChanged'] || [];
    
    listeners.forEach((listener) => {
      try {
        listener({ 
          type: 'connectionStatusChanged',
          status,
          docId: '', // 连接状态事件不需要docId
          message: `Connection status changed to: ${status}`,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error in connection status listener:', error);
      }
    });
  }

  /**
   * 添加类型安全的事件监听器
   */
  onTyped<T extends keyof SocketEventMap>(
    eventType: T, 
    listener: TypedEventListener<T>
  ): () => void {
    // 转换为通用的监听器格式
    const genericListener = listener as EventListener;
    
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push(genericListener);

    // 如果socket已存在（无论是否连接），立即设置监听器
    if (this.socket) {
      this.socket.on(eventType as any, genericListener as any);
    }

    // 返回取消订阅函数
    return () => {
      this.off(eventType as SocketEventType, genericListener);
    };
  }

  /**
   * 添加事件监听器（原有方法，保持向后兼容）
   */
  on(eventType: SocketEventType, listener: EventListener): void {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push(listener);

    // 如果socket已存在（无论是否连接），立即设置监听器
    if (this.socket) {
      this.socket.on(eventType, listener);
    }
  }

  /**
   * 移除事件监听器
   */
  off(eventType: SocketEventType, listener?: EventListener): void {
    if (!this.eventListeners[eventType]) return;

    if (listener) {
      // 移除特定监听器
      this.eventListeners[eventType] = this.eventListeners[eventType].filter(
        (l) => l !== listener
      );
      if (this.socket?.connected) {
        this.socket.off(eventType, listener);
      }
    } else {
      // 移除所有该类型的监听器
      if (this.socket?.connected) {
        this.eventListeners[eventType].forEach((l) => {
          this.socket!.off(eventType, l);
        });
      }
      delete this.eventListeners[eventType];
    }
  }

  /**
   * 发送消息到服务器
   */
  emit(eventType: string, data?: Record<string, unknown>): void {
    if (this.socket?.connected) {
      this.socket.emit(eventType, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', eventType);
    }
  }

  /**
   * 发送消息并等待响应
   */
  emitWithAck(eventType: string, data?: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Socket emit timeout'));
      }, this.config.timeout);

      this.socket!.emit(eventType, data, (response: unknown) => {
        clearTimeout(timeout);
        resolve(response);
      });
    });
  }

  /**
   * 清除所有事件监听器
   */
  private clearAllEventListeners(): void {
    if (this.socket) {
      Object.keys(this.eventListeners).forEach((eventType) => {
        this.eventListeners[eventType].forEach((listener) => {
          this.socket!.off(eventType, listener);
        });
      });
    }
    this.eventListeners = {};
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * 获取连接ID
   */
  getConnectionId(): string | null {
    return this.socket?.id || null;
  }

  /**
   * 手动重连
   */
  async reconnect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    this.disconnect();
    await this.connect();
  }

  /**
   * 设置认证信息
   */
  setAuth(auth: Record<string, unknown>): void {
    if (this.socket) {
      this.socket.auth = auth;
    }
  }

  /**
   * 获取连接统计信息
   */
  getConnectionStats(): {
    status: SocketConnectionStatus;
    connected: boolean;
    id: string | null;
    reconnectAttempts: number;
  } {
    return {
      status: this.connectionStatus,
      connected: this.isConnected(),
      id: this.getConnectionId(),
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// 创建默认的Socket服务实例
const defaultSocketService = new SocketService({
  url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

export { SocketService, defaultSocketService };
export default defaultSocketService; 