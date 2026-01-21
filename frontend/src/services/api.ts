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

// SEO Inspector 相关接口
export interface SeoAnalyzeRequest {
  url: string;
}

export interface SeoAnalyzeResponse {
  url: string;
  fetch: {
    status: number;
    htmlSize: number;
    headers: Record<string, string>;
  };
  htmlContent: {
    textLength: number;
    semanticTextLength: number;
    hiddenTextLength: number;
    hiddenElementsCount: number;
    paragraphCount: number;
    previewText: string;
    fullText: string;
  };
  renderedContent: {
    enabled: boolean;
    textLength: number;
    semanticTextLength: number;
    hiddenTextLength: number;
    hiddenElementsCount: number;
    paragraphCount: number;
    previewText: string;
    fullText: string;
  };
  metrics: {
    contentCoverage: number;
    semanticCoverage: number;
    htmlSemanticRatio: number;
    renderedSemanticRatio: number;
    htmlHiddenRatio: number;
    renderedHiddenRatio: number;
  };
  seoSignals: {
    title: { exists: boolean; source: string | null };
    metaDescription: { exists: boolean; source: string | null };
    h1: { exists: boolean; source: string | null };
    canonical: { exists: boolean };
    hreflangCount: number;
  };
  diagnosis: {
    riskLevel: "HIGH" | "MEDIUM" | "LOW";
    issues: string[];
    summary: string;
    recommendation: string;
  };
  _meta?: {
    responseTime: string;
    timestamp: string;
  };
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

  // SEO Inspector - 分析 URL
  async analyzeSeoUrl(url: string): Promise<any> {
    const response = await this.request<SeoAnalyzeResponse>("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ url }),
    });

    // Transform API response to frontend format
    return this.transformSeoAnalyzeResponse(response);
  }

  // 转换后端响应为前端格式
  private transformSeoAnalyzeResponse(apiData: SeoAnalyzeResponse): any {
    // 确定状态
    const statusMap: Record<string, "high-risk" | "warning" | "optimal"> = {
      HIGH: "high-risk",
      MEDIUM: "warning",
      LOW: "optimal",
    };

    const status = statusMap[apiData.diagnosis.riskLevel] || "warning";

    // 格式化响应大小 - KB/MB 自动转换
    const sizeInKB = apiData.fetch.htmlSize / 1024;
    const responseSize =
      sizeInKB >= 1024
        ? `${(sizeInKB / 1024).toFixed(1)} MB`
        : `${sizeInKB.toFixed(1)} KB`;

    // 获取 robots 状态
    const robotsStatus =
      apiData.fetch.headers["x-robots-tag"] || "Not specified";

    // 构建 SEO 元素数组
    const seoElements = [
      {
        name: "Title",
        initialValue:
          apiData.seoSignals.title.exists &&
          apiData.seoSignals.title.source === "html"
            ? this.extractFirstLine(apiData.htmlContent.previewText)
            : null,
        renderedValue: apiData.seoSignals.title.exists
          ? this.extractFirstLine(apiData.htmlContent.previewText)
          : null,
        isVisible:
          apiData.seoSignals.title.exists &&
          apiData.seoSignals.title.source === "html",
      },
      {
        name: "Meta Description",
        initialValue:
          apiData.seoSignals.metaDescription.exists &&
          apiData.seoSignals.metaDescription.source === "html"
            ? "Present in HTML"
            : null,
        renderedValue: apiData.seoSignals.metaDescription.exists
          ? "Present"
          : null,
        isVisible:
          apiData.seoSignals.metaDescription.exists &&
          apiData.seoSignals.metaDescription.source === "html",
      },
      {
        name: "H1",
        initialValue:
          apiData.seoSignals.h1.exists &&
          apiData.seoSignals.h1.source === "html"
            ? this.extractFirstLine(apiData.htmlContent.fullText)
            : null,
        renderedValue: apiData.seoSignals.h1.exists
          ? this.extractFirstLine(
              apiData.renderedContent.enabled
                ? apiData.renderedContent.fullText
                : apiData.htmlContent.fullText
            )
          : null,
        isVisible:
          apiData.seoSignals.h1.exists &&
          apiData.seoSignals.h1.source === "html",
      },
      {
        name: "Canonical",
        initialValue: apiData.seoSignals.canonical.exists ? apiData.url : null,
        renderedValue: apiData.seoSignals.canonical.exists ? apiData.url : null,
        isVisible: apiData.seoSignals.canonical.exists,
      },
      {
        name: "hreflang",
        initialValue:
          apiData.seoSignals.hreflangCount > 0
            ? `${apiData.seoSignals.hreflangCount} links`
            : null,
        renderedValue:
          apiData.seoSignals.hreflangCount > 0
            ? `${apiData.seoSignals.hreflangCount} links`
            : null,
        isVisible: apiData.seoSignals.hreflangCount > 0,
      },
    ];

    return {
      url: apiData.url,
      timestamp: apiData._meta?.timestamp || new Date().toISOString(),
      status,
      httpStatus: apiData.fetch.status,
      responseSize,
      robotsStatus,
      coverage: apiData.metrics.contentCoverage,
      semanticCoverage: apiData.metrics.semanticCoverage,
      htmlSemanticRatio: apiData.metrics.htmlSemanticRatio,
      renderedSemanticRatio: apiData.metrics.renderedSemanticRatio,
      htmlHiddenRatio: apiData.metrics.htmlHiddenRatio,
      renderedHiddenRatio: apiData.metrics.renderedHiddenRatio,
      htmlHiddenTextLength: apiData.htmlContent.hiddenTextLength,
      htmlHiddenElementsCount: apiData.htmlContent.hiddenElementsCount,
      renderedHiddenTextLength: apiData.renderedContent.hiddenTextLength,
      renderedHiddenElementsCount: apiData.renderedContent.hiddenElementsCount,
      initialHtmlText:
        apiData.htmlContent.fullText || apiData.htmlContent.previewText,
      renderedHtmlText: apiData.renderedContent.enabled
        ? apiData.renderedContent.fullText
        : apiData.htmlContent.fullText,
      seoElements,
    };
  }

  // 辅助方法：提取第一行文本
  private extractFirstLine(text: string): string | null {
    if (!text) return null;
    const lines = text.split("\n").filter((line) => line.trim().length > 0);
    return lines.length > 0 ? lines[0].substring(0, 100) : null;
  }
}

export const apiService = new ApiService();
