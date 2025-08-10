import { useEffect, useState, useCallback, useRef } from 'react';
import { SocketConnectionStatus } from '../types/socket';
import documentSocketService from '../services/documentSocket';

/**
 * Socket连接状态Hook
 */
export const useSocketConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>('disconnected');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 获取初始状态
    setConnectionStatus(documentSocketService.getConnectionStatus());
    setIsConnected(documentSocketService.isConnected());

    // 监听连接状态变化
    const unsubscribe = documentSocketService.on('connectionStatusChanged', (data: any) => {
      setConnectionStatus(data.status);
      setIsConnected(data.status === 'connected');
    });

    return unsubscribe;
  }, []);

  const connect = useCallback(async () => {
    try {
      await documentSocketService.connect();
    } catch (error) {
      console.error('Failed to connect to socket:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    documentSocketService.disconnect();
  }, []);

  const reconnect = useCallback(async () => {
    try {
      await documentSocketService.reconnect();
    } catch (error) {
      console.error('Failed to reconnect to socket:', error);
    }
  }, []);

  return {
    connectionStatus,
    isConnected,
    connect,
    disconnect,
    reconnect,
  };
};

/**
 * 文档转换Socket Hook
 */
export const useDocumentSocket = () => {
  const [conversionStatus, setConversionStatus] = useState<string>('idle');
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    step: string;
    message: string;
    timestamp: number;
  } | null>(null);

  const startConversion = useCallback(async (docId: string) => {
    try {
      setCurrentDocId(docId);
      setConversionStatus('starting');
      await documentSocketService.startDocumentConversion(docId);
    } catch (error) {
      console.error('Failed to start conversion:', error);
      setConversionStatus('error');
    }
  }, []);

  const regenerateAiData = useCallback(async (docId: string, markdown: string, userLanguage?: string) => {
    try {
      setConversionStatus('regenerating');
      await documentSocketService.regenerateAiData(docId, markdown, userLanguage);
    } catch (error) {
      console.error('Failed to regenerate AI data:', error);
      setConversionStatus('error');
    }
  }, []);

  const publishToStoryblok = useCallback(async (publishData: any) => {
    try {
      setConversionStatus('publishing');
      await documentSocketService.publishToStoryblok(publishData);
    } catch (error) {
      console.error('Failed to publish to Storyblok:', error);
      setConversionStatus('error');
    }
  }, []);

  useEffect(() => {
    // 监听Google Docs事件
    const unsubscribeGoogleDocs = documentSocketService.onGoogleDocsEvent((data) => {
      if (data.docId === currentDocId) {
        setProgress({
          step: 'googleDocs',
          message: data.message,
          timestamp: Date.now(),
        });
        
        if (data.type === 'googleDocs:fetch:success') {
          setConversionStatus('ai_analysis');
        } else if (data.type === 'googleDocs:fetch:error') {
          setConversionStatus('error');
        }
      }
    });

    // 监听AI分析事件
    const unsubscribeAiAnalysis = documentSocketService.onAiAnalysisEvent((data) => {
      if (data.docId === currentDocId) {
        setProgress({
          step: 'ai_analysis',
          message: data.message,
          timestamp: Date.now(),
        });
        
        if (data.type === 'ai:analysis:success') {
          setConversionStatus('storyblok_convert');
        } else if (data.type === 'ai:analysis:error') {
          setConversionStatus('error');
        }
      }
    });

    // 监听AI重新生成事件
    const unsubscribeAiRegenerate = documentSocketService.onAiRegenerateEvent((data) => {
      if (data.docId === currentDocId) {
        setProgress({
          step: 'ai_regenerate',
          message: data.message,
          timestamp: Date.now(),
        });
        
        if (data.type === 'ai:regenerate:success') {
          setConversionStatus('storyblok_convert');
        } else if (data.type === 'ai:regenerate:error') {
          setConversionStatus('error');
        }
      }
    });

    // 监听Storyblok转换事件
    const unsubscribeStoryblok = documentSocketService.onStoryblokEvent((data) => {
      if (data.docId === currentDocId) {
        setProgress({
          step: 'storyblok_convert',
          message: data.message,
          timestamp: Date.now(),
        });
        
        if (data.type === 'storyblok:convert:success') {
          setConversionStatus('image_processing');
        } else if (data.type === 'storyblok:convert:error') {
          setConversionStatus('error');
        }
      }
    });

    // 监听图片处理事件
    const unsubscribeImageProcess = documentSocketService.onImageProcessEvent((data) => {
      if (data.docId === currentDocId) {
        setProgress({
          step: 'image_processing',
          message: data.message,
          timestamp: Date.now(),
        });
        
        if (data.type === 'image:process:success') {
          setConversionStatus('completed');
        } else if (data.type === 'image:process:error') {
          setConversionStatus('error');
        }
      }
    });

    // 监听转换完成事件
    const unsubscribeComplete = documentSocketService.onConversionComplete((data) => {
      if (data.docId === currentDocId) {
        setProgress({
          step: 'completed',
          message: '转换完成',
          timestamp: Date.now(),
        });
        setConversionStatus('completed');
      }
    });

    // 监听转换错误事件
    const unsubscribeError = documentSocketService.onConversionError((data) => {
      if (data.docId === currentDocId) {
        setProgress({
          step: 'error',
          message: data.error,
          timestamp: Date.now(),
        });
        setConversionStatus('error');
      }
    });

    return () => {
      unsubscribeGoogleDocs();
      unsubscribeAiAnalysis();
      unsubscribeAiRegenerate();
      unsubscribeStoryblok();
      unsubscribeImageProcess();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, [currentDocId]);

  const resetConversion = useCallback(() => {
    setConversionStatus('idle');
    setCurrentDocId(null);
    setProgress(null);
  }, []);

  return {
    conversionStatus,
    currentDocId,
    progress,
    startConversion,
    regenerateAiData,
    publishToStoryblok,
    resetConversion,
  };
};

/**
 * 通用Socket事件监听Hook
 */
export const useSocketEvent = <T = any>(
  eventType: string,
  callback: (data: T) => void,
  dependencies: any[] = []
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const unsubscribe = documentSocketService.on(eventType as any, (data: any) => {
      callbackRef.current(data);
    });

    return unsubscribe;
  }, [eventType, ...dependencies]);
}; 