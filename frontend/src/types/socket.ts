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
  | 'ai:analysis:fallback'
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

// AI元数据接口
export interface AiMeta {
  seo_title: string;
  seo_description: string;
  heading_h1: string;
  slug: string;
  reading_time: number;
  language: string;
  cover_alt: string;
  _fallback?: boolean; // 标记是否使用了fallback数据
  _documentType?: string; // 文档类型（用于调试）
  _keywordCount?: number; // 关键词数量（用于调试）
}

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

// AI分析开始通知
export interface AiAnalysisStartNotification extends BaseNotification {
  type: 'ai:analysis:start';
}

// AI分析成功通知
export interface AiAnalysisSuccessNotification extends BaseNotification {
  type: 'ai:analysis:success';
  aiMeta: AiMeta;
}

// AI分析错误通知
export interface AiAnalysisErrorNotification extends BaseNotification {
  type: 'ai:analysis:error';
  error: string;
}

// AI分析降级通知
export interface AiAnalysisFallbackNotification extends BaseNotification {
  type: 'ai:analysis:fallback';
  aiMeta: AiMeta;
  error: string;
}

// AI重新生成开始通知
export interface AiRegenerateStartNotification extends BaseNotification {
  type: 'ai:regenerate:start';
}

// AI重新生成成功通知
export interface AiRegenerateSuccessNotification extends BaseNotification {
  type: 'ai:regenerate:success';
  aiMeta: AiMeta;
}

// AI重新生成错误通知
export interface AiRegenerateErrorNotification extends BaseNotification {
  type: 'ai:regenerate:error';
  error: string;
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
  | AiAnalysisStartNotification
  | AiAnalysisSuccessNotification
  | AiAnalysisErrorNotification
  | AiAnalysisFallbackNotification
  | AiRegenerateStartNotification
  | AiRegenerateSuccessNotification
  | AiRegenerateErrorNotification
  | StoryblokNotification
  | ImageProcessNotification
  | ConvertCompleteNotification
  | ConvertErrorNotification
  | ConnectionStatusNotification;

// Socket连接状态
export type SocketConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

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
export type EventListener<T = NotificationData> = (data: T) => void;

// 事件类型到数据类型的映射
export interface SocketEventMap {
  'googleDocs:fetch:start': GoogleDocsNotification;
  'googleDocs:fetch:success': GoogleDocsNotification;
  'googleDocs:fetch:error': GoogleDocsNotification;
  'ai:analysis:start': AiAnalysisStartNotification;
  'ai:analysis:success': AiAnalysisSuccessNotification;
  'ai:analysis:error': AiAnalysisErrorNotification;
  'ai:analysis:fallback': AiAnalysisFallbackNotification;
  'ai:regenerate:start': AiRegenerateStartNotification;
  'ai:regenerate:success': AiRegenerateSuccessNotification;
  'ai:regenerate:error': AiRegenerateErrorNotification;
  'storyblok:convert:start': StoryblokNotification;
  'storyblok:convert:success': StoryblokNotification;
  'storyblok:convert:error': StoryblokNotification;
  'image:process:start': ImageProcessNotification;
  'image:process:success': ImageProcessNotification;
  'image:process:error': ImageProcessNotification;
  'convert:complete': ConvertCompleteNotification;
  'convert:error': ConvertErrorNotification;
  'connectionStatusChanged': ConnectionStatusNotification;
}

// 类型安全的事件监听器
export type TypedEventListener<T extends keyof SocketEventMap> = (data: SocketEventMap[T]) => void;

// 具体事件的监听器类型映射（保留向后兼容）
export interface TypedEventListeners {
  'googleDocs:fetch:start': TypedEventListener<'googleDocs:fetch:start'>;
  'googleDocs:fetch:success': TypedEventListener<'googleDocs:fetch:success'>;
  'googleDocs:fetch:error': TypedEventListener<'googleDocs:fetch:error'>;
  'ai:analysis:start': TypedEventListener<'ai:analysis:start'>;
  'ai:analysis:success': TypedEventListener<'ai:analysis:success'>;
  'ai:analysis:error': TypedEventListener<'ai:analysis:error'>;
  'ai:analysis:fallback': TypedEventListener<'ai:analysis:fallback'>;
  'ai:regenerate:start': TypedEventListener<'ai:regenerate:start'>;
  'ai:regenerate:success': TypedEventListener<'ai:regenerate:success'>;
  'ai:regenerate:error': TypedEventListener<'ai:regenerate:error'>;
  'storyblok:convert:start': TypedEventListener<'storyblok:convert:start'>;
  'storyblok:convert:success': TypedEventListener<'storyblok:convert:success'>;
  'storyblok:convert:error': TypedEventListener<'storyblok:convert:error'>;
  'image:process:start': TypedEventListener<'image:process:start'>;
  'image:process:success': TypedEventListener<'image:process:success'>;
  'image:process:error': TypedEventListener<'image:process:error'>;
  'convert:complete': TypedEventListener<'convert:complete'>;
  'convert:error': TypedEventListener<'convert:error'>;
  'connectionStatusChanged': TypedEventListener<'connectionStatusChanged'>;
}

// 通用事件监听器映射
export interface EventListeners {
  [eventType: string]: EventListener[];
} 