/**
 * Socket.io 相关类型定义
 */

// Socket事件类型
export type SocketEventType = 
  // Google Docs相关事件
  | 'googleDocs:fetch:start'
  | 'googleDocs:fetch:success'
  | 'googleDocs:fetch:error'
  
  // AI分析相关事件
  | 'ai:analysis:start'
  | 'ai:analysis:success'
  | 'ai:analysis:error'
  | 'ai:regenerate:start'
  | 'ai:regenerate:success'
  | 'ai:regenerate:error'
  
  // Storyblok转换相关事件
  | 'storyblok:convert:start'
  | 'storyblok:convert:success'
  | 'storyblok:convert:error'
  
  // 图片处理相关事件
  | 'image:process:start'
  | 'image:process:success'
  | 'image:process:error'
  
  // 整体流程事件
  | 'convert:complete'
  | 'convert:error'
  
  // 连接状态事件
  | 'connectionStatusChanged';

// 基础通知数据结构
export interface BaseNotification {
  docId: string;
  message: string;
  timestamp?: number;
}

// Google Docs相关通知
export interface GoogleDocsNotification extends BaseNotification {
  type: 'googleDocs:fetch:start' | 'googleDocs:fetch:success' | 'googleDocs:fetch:error';
}

// AI分析相关通知
export interface AiAnalysisNotification extends BaseNotification {
  type: 'ai:analysis:start' | 'ai:analysis:success' | 'ai:analysis:error';
  aiMeta?: any;
  error?: string;
}

// AI重新生成相关通知
export interface AiRegenerateNotification extends BaseNotification {
  type: 'ai:regenerate:start' | 'ai:regenerate:success' | 'ai:regenerate:error';
  aiMeta?: any;
  error?: string;
}

// Storyblok转换相关通知
export interface StoryblokNotification extends BaseNotification {
  type: 'storyblok:convert:start' | 'storyblok:convert:success' | 'storyblok:convert:error';
}

// 图片处理相关通知
export interface ImageProcessNotification extends BaseNotification {
  type: 'image:process:start' | 'image:process:success' | 'image:process:error';
  imageUrl?: string;
  resultUrl?: string;
  error?: string;
}

// 转换完成通知
export interface ConvertCompleteNotification extends BaseNotification {
  type: 'convert:complete';
  summary: {
    hasHtml: boolean;
    hasMarkdown: boolean;
    hasRichtext: boolean;
    hasAiMeta: boolean;
    firstH1Title: string;
    coverImage: string;
  };
}

// 转换错误通知
export interface ConvertErrorNotification extends BaseNotification {
  type: 'convert:error';
  error: string;
}

// 连接状态变化通知
export interface ConnectionStatusNotification extends BaseNotification {
  type: 'connectionStatusChanged';
  status: SocketConnectionStatus;
}

// 所有通知类型的联合类型
export type NotificationData = 
  | GoogleDocsNotification
  | AiAnalysisNotification
  | AiRegenerateNotification
  | StoryblokNotification
  | ImageProcessNotification
  | ConvertCompleteNotification
  | ConvertErrorNotification
  | ConnectionStatusNotification;

// Socket连接状态
export type SocketConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Socket配置选项
export interface SocketConfig {
  url: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
}

// 事件监听器类型
export type EventListener = (data: NotificationData) => void;

// 事件监听器映射
export interface EventListeners {
  [eventType: string]: EventListener[];
} 