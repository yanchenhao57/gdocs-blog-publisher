import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { subscribeWithSelector } from "zustand/middleware";
import {
  ConvertResponse,
  PublishRequest,
  PublishResponse,
  PrePublishCheckResponse,
  apiService,
} from "../services/api";
import { AiMeta } from "../types/socket";
import { ToastUtils } from "../utils/toastUtils";
import { applySpecialHeadings } from "../utils/richtextHeadingTransformer";

// 转换阶段枚举
export enum ConversionStage {
  IDLE = "idle",
  FETCHING_DOCUMENT = "fetching_document",
  AI_ANALYSIS = "ai_analysis",
  FORMAT_CONVERSION = "format_conversion",
  PROCESSING_IMAGES = "processing_images",
  COMPLETED = "completed",
  ERROR = "error",
}

// UI工作流状态枚举
export enum WorkflowStage {
  INPUT_DOC_ID = "input_doc_id", // 1. 填写docId
  EDIT_FIELDS = "edit_fields", // 2. 编辑字段（转换完成后）
  PUBLISH_RESULT = "publish_result", // 3. 发布结果
}

// 转换进度信息
export interface ConversionProgress {
  stage: ConversionStage;
  message: string;
  timestamp: number;
  details?: {
    docId?: string;
    imageUrl?: string;
    resultUrl?: string;
    error?: string;
    result?: ConvertResponse;
    aiMeta?: AiMeta;
    totalImages?: number;
    [key: string]: unknown; // 允许其他属性
  };
}

// 转换结果
export interface ConversionResult extends ConvertResponse {
  // 继承API响应的所有字段
}

// 可编辑的发布字段
export interface SpecialHeadings {
  h2: boolean;
  h3: boolean;
}

export interface EditableFields {
  seo_title: string;
  seo_description: string;
  heading_h1: string;
  slug: string;
  coverUrl?: string;
  coverAlt?: string;
  date?: string;
  canonical?: string;
  author_id?: string;
  reading_time: number;
  language: string;
  is_show_newsletter_dialog?: boolean;
  special_headings: SpecialHeadings;
}

// 发布状态
export interface PublishState {
  isPublishing: boolean;
  hasPublished: boolean;
  publishSuccess: boolean;
  publishError: string | null;
  publishResult?: {
    publishedUrl: string;
  };
}

// 转换状态
export interface ConversionState {
  // === UI工作流状态 ===
  // 当前UI工作流阶段
  workflowStage: WorkflowStage;

  // === 文档转换状态 ===
  // 当前转换的文档ID
  currentDocId: string;

  // 转换状态
  isConverting: boolean;

  // 当前阶段
  currentStage: ConversionStage;

  // 进度历史记录
  progressHistory: ConversionProgress[];

  // 转换结果
  result: ConversionResult | null;

  // 错误信息
  error: string | null;

  // AI分析状态
  aiAnalysis: {
    isAnalyzing: boolean;
    hasSucceeded: boolean;
    hasFailed: boolean;
    usedFallback: boolean;
    aiMeta: AiMeta | null;
  };

  // 图片处理状态
  imageProcessing: {
    totalImages: number;
    processedImages: number;
    failedImages: number;
    processingImages: string[]; // 正在处理的图片URL列表
  };

  // === 字段编辑状态 ===
  // 可编辑的发布字段（从AI meta初始化，用户可修改）
  editableFields: EditableFields;

  // 字段是否有未保存的修改
  hasUnsavedChanges: boolean;

  // === 发布状态 ===
  publishState: PublishState;
}

// Actions
export interface ConversionActions {
  // 开始转换
  startConversion: (docId: string) => void;

  // 完成转换
  completeConversion: (result: ConversionResult) => void;

  // 转换失败
  failConversion: (error: string) => void;

  // 更新进度
  updateProgress: (
    stage: ConversionStage,
    message: string,
    details?: ConversionProgress["details"]
  ) => void;

  // AI分析相关
  startAiAnalysis: (message?: string) => void;
  completeAiAnalysis: (aiMeta: AiMeta, message?: string) => void;
  failAiAnalysis: (error: string, message?: string) => void;
  useAiFallback: (aiMeta: AiMeta, error: string, message?: string) => void;

  // 图片处理相关
  startImageProcessing: (totalImages: number) => void;
  addProcessingImage: (imageUrl: string) => void;
  completeImageProcessing: (imageUrl: string) => void;
  failImageProcessing: (imageUrl: string) => void;

  // 重置状态
  resetConversion: () => void;

  // 清除历史记录
  clearHistory: () => void;

  // === UI工作流Actions ===
  // 设置工作流阶段
  setWorkflowStage: (stage: WorkflowStage) => void;

  // 进入编辑字段阶段（转换完成后调用）
  enterEditFieldsStage: () => void;

  // === 字段编辑Actions ===
  // 初始化可编辑字段（从AI meta）
  initializeEditableFields: (
    aiMeta: AiMeta,
    conversionResult: ConversionResult
  ) => void;

  // 更新可编辑字段
  updateEditableField: <K extends keyof EditableFields>(
    field: K,
    value: EditableFields[K]
  ) => void;

  // 批量更新字段
  updateEditableFields: (fields: Partial<EditableFields>) => void;

  // 重置字段修改状态
  markFieldsSaved: () => void;

  // === 发布Actions ===
  // 开始发布
  startPublishing: () => void;

  // 发布成功
  publishSuccess: (result: { publishedUrl: string }) => void;

  // 发布失败
  publishError: (error: string) => void;

  // 重置发布状态
  resetPublishState: () => void;

  // === 整体重置 ===
  // 重置到初始状态（重新开始工作流）
  resetWorkflow: () => void;

  // === API调用Actions ===
  // 调用转换API并处理工作流状态
  convertDocument: (docId: string) => Promise<void>;

  // 重新生成AI数据
  regenerateAiData: (
    docId: string,
    markdown: string,
    userLanguage?: string
  ) => Promise<void>;

  // 发布到Storyblok
  publishToStoryblok: () => Promise<void>;

  // 检查 Storyblok 中是否已存在该 full_slug
  checkStoryblokFullSlug: (
    full_slug: string
  ) => Promise<PrePublishCheckResponse>;
}

export type ConversionStore = ConversionState & ConversionActions;

// 初始状态
const initialState: ConversionState = {
  // UI工作流状态
  workflowStage: WorkflowStage.INPUT_DOC_ID,

  // 文档转换状态
  currentDocId: "",
  isConverting: false,
  currentStage: ConversionStage.IDLE,
  progressHistory: [],
  result: null,
  error: null,

  aiAnalysis: {
    isAnalyzing: false,
    hasSucceeded: false,
    hasFailed: false,
    usedFallback: false,
    aiMeta: null,
  },

  imageProcessing: {
    totalImages: 0,
    processedImages: 0,
    failedImages: 0,
    processingImages: [],
  },

  // 字段编辑状态
  editableFields: {
    seo_title: "",
    seo_description: "",
    heading_h1: "",
    slug: "",
    coverUrl: "",
    coverAlt: "",
    date: "",
    canonical: "",
    author_id: "",
    reading_time: 0,
    language: "en",
    is_show_newsletter_dialog: false,
    special_headings: { h2: true, h3: false },
  },
  hasUnsavedChanges: false,

  // 发布状态
  publishState: {
    isPublishing: false,
    hasPublished: false,
    publishSuccess: false,
    publishError: null,
    publishResult: undefined,
  },
};

// 创建Store（使用subscribeWithSelector中间件）
export const useConversionStore = create<ConversionStore>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        ...initialState,

        // 开始转换
        startConversion: (docId: string) => {
          set(
            {
              currentDocId: docId,
              isConverting: true,
              currentStage: ConversionStage.FETCHING_DOCUMENT,
              progressHistory: [
                {
                  stage: ConversionStage.FETCHING_DOCUMENT,
                  message: `Starting conversion for document: ${docId}`,
                  timestamp: Date.now(),
                },
              ],
              result: null,
              error: null,
              aiAnalysis: initialState.aiAnalysis,
              imageProcessing: initialState.imageProcessing,
            },
            false,
            "startConversion"
          );
        },

        // 完成转换
        completeConversion: (result: ConversionResult) => {
          set(
            {
              isConverting: false,
              currentStage: ConversionStage.COMPLETED,
              result,
              progressHistory: [
                ...get().progressHistory,
                {
                  stage: ConversionStage.COMPLETED,
                  message: "Document conversion completed successfully",
                  timestamp: Date.now(),
                  details: { result },
                },
              ],
            },
            false,
            "completeConversion"
          );
        },

        // 转换失败
        failConversion: (error: string) => {
          set(
            {
              isConverting: false,
              currentStage: ConversionStage.ERROR,
              error,
              progressHistory: [
                ...get().progressHistory,
                {
                  stage: ConversionStage.ERROR,
                  message: `Conversion failed: ${error}`,
                  timestamp: Date.now(),
                  details: { error },
                },
              ],
            },
            false,
            "failConversion"
          );
        },

        // 更新进度
        updateProgress: (
          stage: ConversionStage,
          message: string,
          details?: ConversionProgress["details"]
        ) => {
          set(
            {
              currentStage: stage,
              progressHistory: [
                ...get().progressHistory,
                {
                  stage,
                  message,
                  timestamp: Date.now(),
                  details,
                },
              ],
            },
            false,
            "updateProgress"
          );
        },

        // AI分析开始
        startAiAnalysis: () => {
          set(
            (state) => ({
              currentStage: ConversionStage.AI_ANALYSIS,
              aiAnalysis: {
                ...state.aiAnalysis,
                isAnalyzing: true,
                hasSucceeded: false,
                hasFailed: false,
                usedFallback: false,
              },
              progressHistory: [
                ...state.progressHistory,
                {
                  stage: ConversionStage.AI_ANALYSIS,
                  message: "Starting AI content analysis",
                  timestamp: Date.now(),
                },
              ],
            }),
            false,
            "startAiAnalysis"
          );
        },

        // AI分析完成
        completeAiAnalysis: (
          aiMeta: AiMeta,
          message: string = "AI analysis completed"
        ) => {
          set(
            (state) => ({
              aiAnalysis: {
                ...state.aiAnalysis,
                isAnalyzing: false,
                hasSucceeded: true,
                aiMeta,
              },
              progressHistory: [
                ...state.progressHistory,
                {
                  stage: ConversionStage.AI_ANALYSIS,
                  message: "AI analysis completed successfully",
                  timestamp: Date.now(),
                  details: { aiMeta },
                },
              ],
            }),
            false,
            "completeAiAnalysis"
          );
        },

        // AI分析失败
        failAiAnalysis: () => {
          set(
            (state) => ({
              aiAnalysis: {
                ...state.aiAnalysis,
                isAnalyzing: false,
                hasFailed: true,
              },
              progressHistory: [
                ...state.progressHistory,
                {
                  stage: ConversionStage.AI_ANALYSIS,
                  message: "AI analysis failed, will use default values",
                  timestamp: Date.now(),
                },
              ],
            }),
            false,
            "failAiAnalysis"
          );
        },

        // 使用AI降级方案
        useAiFallback: (
          aiMeta: AiMeta,
          error: string,
          message: string = "Using AI fallback values"
        ) => {
          set(
            (state) => ({
              aiAnalysis: {
                ...state.aiAnalysis,
                isAnalyzing: false,
                usedFallback: true,
                aiMeta,
              },
              progressHistory: [
                ...state.progressHistory,
                {
                  stage: ConversionStage.AI_ANALYSIS,
                  message:
                    "Using AI fallback with document structure-based defaults",
                  timestamp: Date.now(),
                  details: { aiMeta },
                },
              ],
            }),
            false,
            "useAiFallback"
          );
        },

        // 开始图片处理
        startImageProcessing: (totalImages: number) => {
          set(
            (state) => ({
              currentStage: ConversionStage.PROCESSING_IMAGES,
              imageProcessing: {
                totalImages,
                processedImages: 0,
                failedImages: 0,
                processingImages: [],
              },
              progressHistory: [
                ...state.progressHistory,
                {
                  stage: ConversionStage.PROCESSING_IMAGES,
                  message: `Starting image processing (${totalImages} images)`,
                  timestamp: Date.now(),
                  details: { totalImages },
                },
              ],
            }),
            false,
            "startImageProcessing"
          );
        },

        // 添加正在处理的图片
        addProcessingImage: (imageUrl: string) => {
          set(
            (state) => ({
              imageProcessing: {
                ...state.imageProcessing,
                processingImages: [
                  ...state.imageProcessing.processingImages,
                  imageUrl,
                ],
              },
            }),
            false,
            "addProcessingImage"
          );
        },

        // 完成图片处理
        completeImageProcessing: (imageUrl: string) => {
          set(
            (state) => ({
              imageProcessing: {
                ...state.imageProcessing,
                processedImages: state.imageProcessing.processedImages + 1,
                processingImages: state.imageProcessing.processingImages.filter(
                  (url) => url !== imageUrl
                ),
              },
            }),
            false,
            "completeImageProcessing"
          );
        },

        // 图片处理失败
        failImageProcessing: (imageUrl: string) => {
          set(
            (state) => ({
              imageProcessing: {
                ...state.imageProcessing,
                failedImages: state.imageProcessing.failedImages + 1,
                processingImages: state.imageProcessing.processingImages.filter(
                  (url) => url !== imageUrl
                ),
              },
            }),
            false,
            "failImageProcessing"
          );
        },

        // 重置转换状态
        resetConversion: () => {
          set(initialState, false, "resetConversion");
        },

        // 清除历史记录
        clearHistory: () => {
          set(
            (state) => ({
              ...state,
              progressHistory: [],
            }),
            false,
            "clearHistory"
          );
        },

        // === UI工作流Actions ===

        // 设置工作流阶段
        setWorkflowStage: (stage: WorkflowStage) => {
          set(
            (state) => ({
              ...state,
              workflowStage: stage,
            }),
            false,
            "setWorkflowStage"
          );
        },

        // 进入编辑字段阶段（转换完成后调用）
        enterEditFieldsStage: () => {
          set(
            (state) => ({
              ...state,
              workflowStage: WorkflowStage.EDIT_FIELDS,
            }),
            false,
            "enterEditFieldsStage"
          );
        },

        // === 字段编辑Actions ===

        // 初始化可编辑字段（从AI meta）
        initializeEditableFields: (
          aiMeta: AiMeta,
          conversionResult: ConversionResult
        ) => {
          set(
            (state) => ({
              ...state,
              editableFields: {
                seo_title:
                  aiMeta.seo_title || conversionResult.firstH1Title || "",
                seo_description: aiMeta.seo_description || "",
                heading_h1:
                  aiMeta.heading_h1 || conversionResult.firstH1Title || "",
                slug: aiMeta.slug || "",
                coverUrl: conversionResult.coverImage || "",
                coverAlt: aiMeta.cover_alt || "",
                date: new Date().toISOString().split("T")[0], // 今天的日期
                canonical: "",
                author_id: "",
                reading_time: aiMeta.reading_time || 0,
                language: aiMeta.language || "en",
                is_show_newsletter_dialog: false,
                special_headings: { h2: true, h3: false },
              },
              hasUnsavedChanges: false,
            }),
            false,
            "initializeEditableFields"
          );
        },

        // 更新可编辑字段
        updateEditableField: (field, value) => {
          set(
            (state) => ({
              ...state,
              editableFields: {
                ...state.editableFields,
                [field]: value,
              },
              hasUnsavedChanges: true,
            }),
            false,
            "updateEditableField"
          );
        },

        // 批量更新字段
        updateEditableFields: (fields: Partial<EditableFields>) => {
          set(
            (state) => ({
              ...state,
              editableFields: {
                ...state.editableFields,
                ...fields,
              },
              hasUnsavedChanges: true,
            }),
            false,
            "updateEditableFields"
          );
        },

        // 重置字段修改状态
        markFieldsSaved: () => {
          set(
            (state) => ({
              ...state,
              hasUnsavedChanges: false,
            }),
            false,
            "markFieldsSaved"
          );
        },

        // === 发布Actions ===

        // 开始发布
        startPublishing: () => {
          set(
            (state) => ({
              ...state,
              publishState: {
                ...state.publishState,
                isPublishing: true,
                publishError: null,
              },
            }),
            false,
            "startPublishing"
          );
        },

        // 发布成功
        publishSuccess: (result) => {
          set(
            (state) => ({
              ...state,
              workflowStage: WorkflowStage.PUBLISH_RESULT,
              publishState: {
                isPublishing: false,
                hasPublished: true,
                publishSuccess: true,
                publishError: null,
                publishResult: result,
              },
            }),
            false,
            "publishSuccess"
          );
        },

        // 发布失败
        publishError: (error: string) => {
          set(
            (state) => ({
              ...state,
              workflowStage: WorkflowStage.PUBLISH_RESULT,
              publishState: {
                ...state.publishState,
                isPublishing: false,
                publishSuccess: false,
                publishError: error,
              },
            }),
            false,
            "publishError"
          );
        },

        // 重置发布状态
        resetPublishState: () => {
          set(
            (state) => ({
              ...state,
              publishState: {
                isPublishing: false,
                hasPublished: false,
                publishSuccess: false,
                publishError: null,
                publishResult: undefined,
              },
            }),
            false,
            "resetPublishState"
          );
        },

        // === 整体重置 ===

        // 重置到初始状态（重新开始工作流）
        resetWorkflow: () => {
          set(
            () => ({
              ...initialState,
            }),
            false,
            "resetWorkflow"
          );
        },

        // === API调用Actions ===

        // 调用转换API并处理工作流状态
        convertDocument: async (docId: string) => {
          try {
            // 1. 开始转换流程
            get().startConversion(docId);

            // 2. 显示开始转换的toast
            ToastUtils.info("🚀 Document Conversion Started", {
              description: `Starting conversion process for document: ${docId}`,
              duration: 3000,
            });

            // 3. 调用API
            const result = await apiService.convertDocument(docId);
            console.log("🚀 ~ result:", result);

            // 4. 检查是否使用了fallback数据
            if (result.aiMeta?._fallback) {
              get().useAiFallback(
                result.aiMeta,
                "AI analysis failed",
                "Using document structure-based defaults"
              );
            } else {
              get().completeAiAnalysis(result.aiMeta, "AI analysis completed");
            }

            // 5. API调用成功 - 更新转换结果
            get().completeConversion(result);

            // 6. 使用API返回的真实数据初始化可编辑字段
            get().initializeEditableFields(result.aiMeta, result);

            // 7. 进入编辑字段阶段
            get().enterEditFieldsStage();

            console.log("📋 转换完成，API响应:", result);
          } catch (error) {
            // 处理错误
            ToastUtils.handleError(error, "Document conversion failed");

            // 更新错误状态
            get().failConversion(
              error instanceof Error ? error.message : "Unknown error occurred"
            );
          }
        },

        // 重新生成AI数据
        regenerateAiData: async (
          docId: string,
          markdown: string,
          userLanguage?: string
        ) => {
          try {
            // 1. 开始AI重新生成
            get().startAiAnalysis();

            // 2. 显示开始Toast
            ToastUtils.info("🤖 Regenerating AI Data", {
              description: "Re-analyzing document content with AI...",
              duration: 3000,
            });

            // 3. 调用API
            const response = await apiService.regenerateAiData(
              docId,
              markdown,
              userLanguage
            );

            // 4. 检查是否使用了fallback数据并更新AI分析结果
            if (response.aiMeta?._fallback) {
              get().useAiFallback(
                response.aiMeta,
                "AI analysis failed",
                response.message || "Using document structure-based defaults"
              );
            } else {
              get().completeAiAnalysis(response.aiMeta, response.message);
            }

            // 5. 更新可编辑字段
            const currentResult = get().result;
            if (currentResult) {
              get().initializeEditableFields(response.aiMeta, currentResult);
            }

            // 6. 显示成功Toast
            const toastMessage = response.aiMeta?._fallback
              ? "🔄 AI Fallback Applied"
              : "🎯 AI Data Regenerated";
            const toastDescription = response.aiMeta?._fallback
              ? "AI analysis failed, using document structure-based defaults"
              : response.message || "AI analysis completed successfully";
            
            ToastUtils.success(toastMessage, {
              description: toastDescription,
              duration: 4000,
            });

            console.log("🤖 AI数据重新生成完成:", response);
          } catch (error) {
            // 处理错误
            ToastUtils.handleError(error, "AI data regeneration failed");

            // 更新AI分析失败状态
            get().failAiAnalysis(
              error instanceof Error ? error.message : "AI regeneration failed",
              "Failed to regenerate AI data"
            );
          }
        },

        // 发布到Storyblok
        publishToStoryblok: async () => {
          const state = get();

          try {
            // 1. 检查是否可以发布
            if (state.workflowStage !== WorkflowStage.EDIT_FIELDS) {
              throw new Error("Cannot publish: not in edit fields stage");
            }

            if (!state.result) {
              throw new Error("Cannot publish: no conversion result available");
            }

            // 2. 开始发布流程
            get().startPublishing();

            // 3. 构造发布数据（应用 special_headings 开关转换 richtext）
            const processedRichtext = applySpecialHeadings(
              state.result.richtext as unknown as { type: string; content: Record<string, unknown>[] },
              state.editableFields.special_headings ?? { h2: true, h3: false }
            );
            const publishData = {
              ...state.editableFields,
              body: processedRichtext,
              coverUrl: state.editableFields.coverUrl,
              coverAlt: state.editableFields.coverAlt,
            };

            // 4. 调用发布API
            const publishResult = await apiService.publishToStoryblok(
              publishData
            );

            // 5. 发布成功
            get().publishSuccess({
              publishedUrl: publishResult.previewLink,
            });

            // 6. 显示成功Toast
            ToastUtils.success("🎉 Published Successfully", {
              description: "Article published to Storyblok successfully!",
              duration: 5000,
            });

            console.log("📤 发布成功:", publishResult);
          } catch (error) {
            // 处理发布错误
            const errorMessage =
              error instanceof Error ? error.message : "Unknown publish error";

            get().publishError(errorMessage);

            ToastUtils.handleError(error, "Publication failed");
          }
        },

        // 检查 Storyblok 中是否已存在该 full_slug
        checkStoryblokFullSlug: async (full_slug: string) => {
          return await apiService.checkStoryblokFullSlug(full_slug);
        },
      }),
      {
        name: "conversion-store", // devtools中显示的名称
      }
    )
  )
);

// 选择器（Selectors） - 缓存版本以避免无限循环
export const conversionSelectors = {
  // 获取当前转换状态
  getCurrentStatus: (state: ConversionStore) => {
    const result = {
      docId: state.currentDocId,
      isConverting: state.isConverting,
      stage: state.currentStage,
      progress:
        state.progressHistory.length > 0
          ? state.progressHistory[state.progressHistory.length - 1]
          : null,
    };
    return result;
  },

  // 获取AI分析状态
  getAiStatus: (state: ConversionStore) => state.aiAnalysis,

  // 获取图片处理进度
  getImageProgress: (state: ConversionStore) => {
    const { totalImages, processedImages, failedImages } =
      state.imageProcessing;
    const result = {
      ...state.imageProcessing,
      completionRate:
        totalImages > 0 ? (processedImages + failedImages) / totalImages : 0,
      successRate: totalImages > 0 ? processedImages / totalImages : 0,
    };
    return result;
  },

  // 获取最新进度消息
  getLatestProgress: (state: ConversionStore) =>
    state.progressHistory.length > 0
      ? state.progressHistory[state.progressHistory.length - 1]
      : null,

  // 检查是否有错误
  hasError: (state: ConversionStore) =>
    !!state.error || state.currentStage === ConversionStage.ERROR,

  // 检查是否已完成
  isCompleted: (state: ConversionStore) =>
    state.currentStage === ConversionStage.COMPLETED,

  // === UI工作流选择器 ===

  // 获取当前工作流阶段
  getWorkflowStage: (state: ConversionStore) => state.workflowStage,

  // 获取可编辑字段
  getEditableFields: (state: ConversionStore) => state.editableFields,

  // 检查是否有未保存的修改
  hasUnsavedChanges: (state: ConversionStore) => state.hasUnsavedChanges,

  // 获取发布状态
  getPublishState: (state: ConversionStore) => state.publishState,

  // 检查是否可以进入编辑阶段
  canEnterEditStage: (state: ConversionStore) =>
    state.currentStage === ConversionStage.COMPLETED && state.result !== null,

  // 检查是否可以发布
  canPublish: (state: ConversionStore) =>
    state.workflowStage === WorkflowStage.EDIT_FIELDS &&
    !state.publishState.isPublishing,

  // 检查是否显示发布结果
  shouldShowPublishResult: (state: ConversionStore) =>
    state.workflowStage === WorkflowStage.PUBLISH_RESULT,
};
