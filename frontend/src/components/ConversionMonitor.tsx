"use client";

import React, { useEffect, useRef } from 'react';
import documentSocketService from '../services/documentSocket';
import { ToastUtils } from '../utils/toastUtils';
import { NotificationData } from '../types/socket';

interface ConversionMonitorProps {
  docId?: string; // 当前正在转换的文档ID，用于过滤相关事件
}

/**
 * 文档转换流程监听器组件
 * 监听convert接口的所有流程事件，并使用toast提示用户
 */
export const ConversionMonitor: React.FC<ConversionMonitorProps> = ({ docId }) => {
  const currentDocIdRef = useRef<string | undefined>(docId);

  useEffect(() => {
    currentDocIdRef.current = docId;
  }, [docId]);

  useEffect(() => {
    // 过滤事件：只处理当前文档的事件，如果没有指定docId则处理所有事件
    const shouldHandleEvent = (data: NotificationData) => {
      if (!currentDocIdRef.current) return true; // 没有指定docId，处理所有事件
      const eventDocId = (data as any).docId;
      return eventDocId === currentDocIdRef.current;
    };

    // Google Docs 获取阶段
    const unsubscribeGoogleDocs1 = documentSocketService.on('googleDocs:fetch:start', (data) => {
      if (!shouldHandleEvent(data)) return;
      const docId = (data as any).docId || '';
      ToastUtils.info('🚀 Starting Document Fetch', {
        description: `Fetching Google Docs: ${docId}`,
        duration: 3000,
      });
    });

    const unsubscribeGoogleDocs2 = documentSocketService.on('googleDocs:fetch:success', (data) => {
      if (!shouldHandleEvent(data)) return;
      ToastUtils.success('✅ Document Fetched', {
        description: 'Google Docs document fetched successfully',
        duration: 3000,
      });
    });

    const unsubscribeGoogleDocs3 = documentSocketService.on('googleDocs:fetch:error', (data) => {
      if (!shouldHandleEvent(data)) return;
      const message = (data as any).message || '';
      ToastUtils.error('❌ Document Fetch Failed', message || 'Failed to fetch Google Docs', {
        duration: 5000,
      });
    });

    // AI 分析阶段
    const unsubscribeAiAnalysis1 = documentSocketService.on('ai:analysis:start', (data) => {
      if (!shouldHandleEvent(data)) return;
      ToastUtils.info('🤖 Starting AI Analysis', {
        description: 'Analyzing document content with AI...',
        duration: 3000,
      });
    });

    const unsubscribeAiAnalysis2 = documentSocketService.on('ai:analysis:success', (data) => {
      if (!shouldHandleEvent(data)) return;
      ToastUtils.success('🎯 AI Analysis Complete', {
        description: 'Content analysis and metadata generation completed',
        duration: 4000,
      });
    });

    const unsubscribeAiAnalysis3 = documentSocketService.on('ai:analysis:error', (data) => {
      if (!shouldHandleEvent(data)) return;
      ToastUtils.warning('⚠️ AI Analysis Failed', {
        description: 'Using default values to continue the process',
        duration: 4000,
      });
    });

    // AI 降级处理事件
    const unsubscribeAiFallback = documentSocketService.on('ai:analysis:fallback', (data) => {
      if (!shouldHandleEvent(data)) return;

      ToastUtils.warning('🔄 AI Fallback Applied', {
        description: 'AI analysis failed, using document structure-based defaults',
        duration: 4000,
      });
    });

    // Storyblok 转换阶段
    const unsubscribeStoryblok1 = documentSocketService.on('storyblok:convert:start', (data) => {
      if (!shouldHandleEvent(data)) return;
      ToastUtils.info('📝 Starting Format Conversion', {
        description: 'Converting to Storyblok richtext format...',
        duration: 3000,
      });
    });

    const unsubscribeStoryblok2 = documentSocketService.on('storyblok:convert:success', (data) => {
      if (!shouldHandleEvent(data)) return;
      ToastUtils.success('✨ Format Conversion Complete', {
        description: 'Content converted to Storyblok format successfully',
        duration: 3000,
      });
    });

    const unsubscribeStoryblok3 = documentSocketService.on('storyblok:convert:error', (data) => {
      if (!shouldHandleEvent(data)) return;
      const message = (data as any).message || '';
      ToastUtils.error('❌ Format Conversion Failed', message || 'Failed to convert to Storyblok format', {
        duration: 5000,
      });
    });

    // 转换完成事件
    const unsubscribeComplete = documentSocketService.onConversionComplete((data) => {
      if (!shouldHandleEvent(data)) return;

      const summary = (data as any).summary || {};
      const docId = (data as any).docId || '';

      ToastUtils.apiSuccess('🎉 Conversion Complete', 
        `Document ${docId} has been converted successfully! ` +
        `HTML: ${summary.hasHtml ? '✅' : '❌'}, ` +
        `Markdown: ${summary.hasMarkdown ? '✅' : '❌'}, ` +
        `Richtext: ${summary.hasRichtext ? '✅' : '❌'}`
      );
    });

    // 转换错误事件
    const unsubscribeError = documentSocketService.onConversionError((data) => {
      if (!shouldHandleEvent(data)) return;

      const message = (data as any).message || 'Unknown error occurred';
      const error = (data as any).error || '';

      ToastUtils.error('💥 Conversion Failed', `${message}: ${error}`, {
        duration: 8000,
      });
    });

    // 连接状态变化
    const unsubscribeConnection = documentSocketService.on('connectionStatusChanged', (data) => {
      const status = (data as any).status;

      if (status === 'connected') {
        ToastUtils.success('🔌 Socket Connected', {
          description: 'Real-time notifications are now active',
          duration: 2000,
        });
      } else if (status === 'disconnected') {
        ToastUtils.warning('🔌 Socket Disconnected', {
          description: 'Real-time notifications are not available',
          duration: 3000,
        });
      } else if (status === 'reconnecting') {
        ToastUtils.info('🔄 Reconnecting...', {
          description: 'Attempting to restore real-time connection',
          duration: 2000,
        });
      }
    });

    // 清理函数
    return () => {
      unsubscribeGoogleDocs1();
      unsubscribeGoogleDocs2();
      unsubscribeGoogleDocs3();
      unsubscribeAiAnalysis1();
      unsubscribeAiAnalysis2();
      unsubscribeAiAnalysis3();
      unsubscribeAiFallback();
      unsubscribeStoryblok1();
      unsubscribeStoryblok2();
      unsubscribeStoryblok3();
      unsubscribeComplete();
      unsubscribeError();
      unsubscribeConnection();
    };
  }, []); // 空依赖数组，只在组件挂载时设置监听器

  // 这是一个纯粹的监听器组件，不渲染任何UI
  return null;
};

export default ConversionMonitor;
