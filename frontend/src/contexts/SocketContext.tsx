import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SocketConnectionStatus } from '../types/socket';
import documentSocketService from '../services/documentSocket';

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

  useEffect(() => {
    // 监听连接状态变化
    const unsubscribe = documentSocketService.on('connectionStatusChanged', (data: any) => {
      console.log('Connection status changed:', data);
      setConnectionStatus(data.status);
      setIsConnected(data.status === 'connected');
    });

    // 自动连接
    if (autoConnect) {
      handleAutoConnect();
    }

    return unsubscribe;
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