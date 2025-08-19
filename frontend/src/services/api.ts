import { ErrorHandler } from '../utils/errorHandler';
import { AiMeta } from '../types/socket';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Storyblok Richtext 内容块接口
export interface StoryblokRichtextNode {
  type: string;
  content?: StoryblokRichtextNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
  attrs?: Record<string, any>;
}

// Storyblok Richtext 文档接口
export interface StoryblokRichtext {
  type: 'doc';
  content: StoryblokRichtextNode[];
}

export interface ConvertResponse {
  html: string;
  markdown: string;
  richtext: StoryblokRichtext;
  aiMeta: AiMeta;
  firstH1Title: string;
  coverImage: string;
}

export interface PublishRequest {
  seo_title: string;
  seo_description: string;
  heading_h1: string;
  slug: string;
  body: StoryblokRichtext;
  coverUrl?: string;
  coverAlt?: string;
  date?: string;
  canonical?: string;
  author_id?: string;
  reading_time: number;
  language: string;
  is_show_newsletter_dialog?: boolean;
}

export interface PublishResponse {
  success: boolean;
  previewLink: string;
}

class ApiService {

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = ErrorHandler.parseErrorMessage(errorData);
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // 转换 Google Docs 文档
  async convertDocument(docId: string): Promise<ConvertResponse> {
    return this.request<ConvertResponse>('/api/convert', {
      method: 'POST',
      body: JSON.stringify({ docId }),
    });
  }

  // 重新生成 AI 结构化数据
  async regenerateAiData(
    docId: string, 
    markdown: string, 
    userLanguage?: string
  ): Promise<{ aiMeta: ConvertResponse['aiMeta']; message: string }> {
    return this.request('/api/convert/regenerate', {
      method: 'POST',
      body: JSON.stringify({ docId, markdown, userLanguage }),
    });
  }

  // 发布到 Storyblok
  async publishToStoryblok(data: PublishRequest): Promise<PublishResponse> {
    return this.request<PublishResponse>('/api/publish', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService(); 