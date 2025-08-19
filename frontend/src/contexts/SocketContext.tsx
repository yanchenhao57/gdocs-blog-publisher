import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { SocketConnectionStatus } from '../types/socket';
import documentSocketService from '../services/documentSocket';
import { ToastUtils } from '../utils/toastUtils';

interface SocketContextType {
  connectionStatus: SocketConnectionStatus;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ 
  children, 
  autoConnect = true 
}) => {
  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const hasShownInitialConnection = useRef(false);
  const lastToastId = useRef<string | number | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // 防止React Strict Mode重复初始化
    if (isInitialized.current) return;
    isInitialized.current = true;

    // 监听连接状态变化
    const unsubscribe = documentSocketService.on('connectionStatusChanged', (data: any) => {
      console.log('Connection status changed in SocketContext:', data);
      const newStatus = data.status;
      setConnectionStatus(newStatus);
      setIsConnected(newStatus === 'connected');

      // 处理连接状态Toast通知
      if (lastToastId.current) {
        ToastUtils.dismissById(lastToastId.current);
      }

      switch (newStatus) {
        case 'connected':
          // 首次连接（页面加载）不显示Toast，避免刷新时的提示
          if (hasShownInitialConnection.current) {
            lastToastId.current = ToastUtils.success("🔌 Socket Reconnected", {
              description: "Real-time notifications restored",
              duration: 2000,
            });
          } else {
            hasShownInitialConnection.current = true;
          }
          break;

        case 'disconnected':
          lastToastId.current = ToastUtils.warning("🔌 Socket Disconnected", {
            description: "Real-time notifications are not available",
            duration: 3000,
          });
          break;

        case 'reconnecting':
          lastToastId.current = ToastUtils.info("🔄 Reconnecting...", {
            description: "Attempting to restore real-time connection",
            duration: 2000,
          });
          break;

        case 'error':
          lastToastId.current = ToastUtils.error("❌ Connection Error", "Failed to connect to real-time services", {
            duration: 4000,
          });
          break;
      }
    });

    // 自动连接
    if (autoConnect) {
      handleAutoConnect();
    }

    return () => {
      isInitialized.current = false;
      unsubscribe();
    };
  }, [autoConnect]);

  const handleAutoConnect = async () => {
    try {
      await documentSocketService.connect();
    } catch (error) {
      console.error('Auto-connect failed:', error);
    }
  };

  const connect = async () => {
    try {
      console.log('🔌 SocketContext.connect() 被调用');
      await documentSocketService.connect();
      console.log('✅ SocketContext.connect() 完成');
    } catch (error) {
      console.error('❌ SocketContext.connect() 失败:', error);
      throw error;
    }
  };

  const disconnect = () => {
    documentSocketService.disconnect();
  };

  const reconnect = async () => {
    try {
      await documentSocketService.reconnect();
    } catch (error) {
      console.error('Failed to reconnect to socket:', error);
      throw error;
    }
  };

  const value: SocketContextType = {
    connectionStatus,
    isConnected,
    connect,
    disconnect,
    reconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext; 