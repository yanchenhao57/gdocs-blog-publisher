'use client';

import { useMemo } from 'react';
import { ConversionStore, ConversionStage, WorkflowStage, useConversionStore } from './conversionStore';

/**
 * 客户端安全的Zustand store hooks
 * 使用简单的方法避免SSR问题
 */

// 默认状态（SSR安全）
const defaultState = {
  // UI工作流状态
  workflowStage: WorkflowStage.INPUT_DOC_ID,
  
  // 文档转换状态
  currentDocId: '',
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
    seo_title: '',
    seo_description: '',
    heading_h1: '',
    slug: '',
    coverUrl: '',
    coverAlt: '',
    date: '',
    canonical: '',
    author_id: '',
    reading_time: 0,
    language: 'en',
    is_show_newsletter_dialog: false,
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
  
  startTime: null,
  endTime: null,
};

const defaultActions = {
  startConversion: () => {},
  completeConversion: () => {},
  failConversion: () => {},
  updateProgress: () => {},
  startAiAnalysis: () => {},
  completeAiAnalysis: () => {},
  failAiAnalysis: () => {},
  useAiFallback: () => {},
  startImageProcessing: () => {},
  addProcessingImage: () => {},
  completeImageProcessing: () => {},
  failImageProcessing: () => {},
  resetConversion: () => {},
  clearHistory: () => {},
  
  // UI工作流Actions
  setWorkflowStage: () => {},
  enterEditFieldsStage: () => {},
  
  // 字段编辑Actions
  initializeEditableFields: () => {},
  updateEditableField: () => {},
  updateEditableFields: () => {},
  markFieldsSaved: () => {},
  
  // 发布Actions
  startPublishing: () => {},
  publishSuccess: () => {},
  publishError: () => {},
  resetPublishState: () => {},
  
  // 整体重置
  resetWorkflow: () => {},
  
  // API调用Actions
  convertDocument: async () => {},
  regenerateAiData: async () => {},
  publishToStoryblok: async () => {},
};

// 检查是否在客户端
const isClient = typeof window !== 'undefined';

// 主要的客户端安全hook
export const useConversionStoreClient = () => {
  const store = isClient ? useConversionStore() : { ...defaultState, ...defaultActions };
  return store;
};

// 选择器hooks - 使用useMemo避免无限循环
export const useConversionStatus = () => {
  const store = useConversionStoreClient();
  
  return useMemo(() => ({
    docId: store.currentDocId,
    isConverting: store.isConverting,
    stage: store.currentStage,
    progress: store.progressHistory.length > 0 ? store.progressHistory[store.progressHistory.length - 1] : null,
  }), [store.currentDocId, store.isConverting, store.currentStage, store.progressHistory]);
};

export const useAiAnalysisStatus = () => {
  const store = useConversionStoreClient();
  return useMemo(() => store.aiAnalysis, [store.aiAnalysis]);
};

export const useImageProcessingStatus = () => {
  const store = useConversionStoreClient();
  
  return useMemo(() => {
    const { totalImages, processedImages, failedImages } = store.imageProcessing;
    return {
      ...store.imageProcessing,
      completionRate: totalImages > 0 ? (processedImages + failedImages) / totalImages : 0,
      successRate: totalImages > 0 ? processedImages / totalImages : 0,
    };
  }, [store.imageProcessing]);
};

export const useLatestProgress = () => {
  const store = useConversionStoreClient();
  return useMemo(() => 
    store.progressHistory.length > 0 ? store.progressHistory[store.progressHistory.length - 1] : null,
    [store.progressHistory]
  );
};

export const useConversionError = () => {
  const store = useConversionStoreClient();
  return useMemo(() => 
    !!store.error || store.currentStage === ConversionStage.ERROR,
    [store.error, store.currentStage]
  );
};

export const useConversionComplete = () => {
  const store = useConversionStoreClient();
  return useMemo(() => 
    store.currentStage === ConversionStage.COMPLETED,
    [store.currentStage]
  );
};

// === UI工作流选择器 ===

export const useWorkflowStage = () => {
  const store = useConversionStoreClient();
  return useMemo(() => store.workflowStage, [store.workflowStage]);
};

export const useEditableFields = () => {
  const store = useConversionStoreClient();
  return useMemo(() => store.editableFields, [store.editableFields]);
};

export const useHasUnsavedChanges = () => {
  const store = useConversionStoreClient();
  return useMemo(() => store.hasUnsavedChanges, [store.hasUnsavedChanges]);
};

export const usePublishState = () => {
  const store = useConversionStoreClient();
  return useMemo(() => store.publishState, [store.publishState]);
};

export const useCanEnterEditStage = () => {
  const store = useConversionStoreClient();
  return useMemo(() => 
    store.currentStage === ConversionStage.COMPLETED && store.result !== null,
    [store.currentStage, store.result]
  );
};

export const useCanPublish = () => {
  const store = useConversionStoreClient();
  return useMemo(() => 
    store.workflowStage === WorkflowStage.EDIT_FIELDS && !store.publishState.isPublishing,
    [store.workflowStage, store.publishState.isPublishing]
  );
};

export const useShouldShowPublishResult = () => {
  const store = useConversionStoreClient();
  return useMemo(() => 
    store.workflowStage === WorkflowStage.PUBLISH_RESULT,
    [store.workflowStage]
  );
};