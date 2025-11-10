import { ErrorHandler } from "../utils/errorHandler";
import { AiMeta } from "../types/socket";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
  type: "doc";
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

export interface PrePublishCheckResponse {
  exists: boolean;
  full_slug: string;
  story: {
    id: string;
    name: string;
    slug: string;
    full_slug: string;
  } | null;
}

// Storyblok Story 接口
export interface StoryblokStory {
  id: number;
  name: string;
  slug: string;
  full_slug: string;
  content: any;
  created_at: string;
  published_at: string;
  uuid: string;
  [key: string]: any;
}

// 获取单个 Story 响应接口
export interface GetStoryResponse {
  success: boolean;
  data: {
    story: StoryblokStory;
  };
}

// 批量获取 Stories 响应接口
export interface GetStoriesResponse {
  success: boolean;
  data: {
    total: number;
    success_count: number;
    failed_count: number;
    stories: StoryblokStory[];
    failed: Array<{
      full_slug: string;
      error: string;
    }>;
  };
}

// 健康检查响应接口
export interface HealthCheckResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// 内部链接优化相关接口
export interface InternalLinkOptimizationRequest {
  paragraphs: Array<{
    index: number;
    markdown: string;
  }>;
  links: Array<{
    targetUrl: string;
    anchorTexts: string[];
  }>;
}

export interface InternalLinkOptimizationResponse {
  changes: Array<{
    index: number;
    original: string;
    modified: string;
  }>;
}

export interface TranslateStoryResponse {
  data: {
    lng: string;
    story: StoryblokStory;
  }[];
}

export interface UploadStoryToStoryblokResponse {
  success: boolean;
  data?: any;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
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
    return this.request<ConvertResponse>("/api/convert", {
      method: "POST",
      body: JSON.stringify({ docId }),
    });
  }

  // 重新生成 AI 结构化数据
  async regenerateAiData(
    docId: string,
    markdown: string,
    userLanguage?: string
  ): Promise<{ aiMeta: ConvertResponse["aiMeta"]; message: string }> {
    return this.request("/api/convert/regenerate", {
      method: "POST",
      body: JSON.stringify({ docId, markdown, userLanguage }),
    });
  }

  // 发布到 Storyblok
  async publishToStoryblok(data: PublishRequest): Promise<PublishResponse> {
    return this.request<PublishResponse>("/api/publish", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 检查 Storyblok 中是否已存在该 full_slug
  async checkStoryblokFullSlug(
    full_slug: string
  ): Promise<PrePublishCheckResponse> {
    return this.request<PrePublishCheckResponse>("/api/publish/pre-publish", {
      method: "POST",
      body: JSON.stringify({ full_slug }),
    });
  }

  // 根据 full_slug 获取单个 Storyblok Story
  async getStoryblokStory(full_slug: string): Promise<StoryblokStory> {
    const response = await this.request<GetStoryResponse>(
      `/api/storyblok/story/${encodeURIComponent(full_slug)}`
    );
    return response.data.story;
  }

  // 批量获取 Storyblok Stories
  async getStoryblokStories(
    full_slugs: string[]
  ): Promise<GetStoriesResponse["data"]> {
    const response = await this.request<GetStoriesResponse>(
      "/api/storyblok/stories",
      {
        method: "POST",
        body: JSON.stringify({ full_slugs }),
      }
    );
    return response.data;
  }

  // Storyblok 健康检查
  async checkStoryblokHealth(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>("/api/storyblok/health");
  }

  // 内部链接优化
  async optimizeInternalLinks(
    data: InternalLinkOptimizationRequest
  ): Promise<InternalLinkOptimizationResponse> {
    return this.request<InternalLinkOptimizationResponse>(
      "/api/internal-link-optimizer",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async translateStory(
    story: StoryblokStory,
    lngInfo: string[]
  ): Promise<TranslateStoryResponse> {
    return this.request<TranslateStoryResponse>("/api/translate/generated", {
      method: "POST",
      body: JSON.stringify({ story, lngInfo }),
    });
  }

  // 创建 Storyblok 数据
  async uploadStoryToStoryblok({
    story,
  }: {
    story: StoryblokStory;
  }): Promise<UploadStoryToStoryblokResponse> {
    return this.request<UploadStoryToStoryblokResponse>(
      "/api/storyblok/upload",
      {
        method: "POST",
        body: JSON.stringify({ story }),
      }
    );
  }

  // 发布 Storyblok 数据
  async publishStoryToStoryblok(id: number): Promise<any> {
    return this.request<any>(`/api/publish/${id}`, {
      method: "GET",
    });
  }
}

export const apiService = new ApiService();
