"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";

// 定义状态类型
export interface AppState {
  // 当前步骤
  currentStep: number;
  // Google Docs链接
  docLink: string;
  // 文档ID
  docId: string | null;
  // 是否正在加载
  isLoading: boolean;
  // 错误信息
  error: string;
  // 验证状态
  isValid: boolean;
  // 转换后的Markdown内容
  markdownContent: string;
  // 转换后的HTML内容
  htmlContent: string;
  // 图片信息
  images: ImageInfo[];
  // 发布状态
  publishStatus: PublishStatus;
}

// 图片信息类型
export interface ImageInfo {
  id: string;
  originalUrl: string;
  cdnUrl: string;
  alt: string;
  width?: number;
  height?: number;
}

// 发布状态类型
export interface PublishStatus {
  isPublished: boolean;
  storyblokId?: string;
  publishedUrl?: string;
  publishError?: string;
}

// 初始状态
const initialState: AppState = {
  currentStep: 1,
  docLink: "",
  docId: null,
  isLoading: false,
  error: "",
  isValid: false,
  markdownContent: "",
  htmlContent: "",
  images: [],
  publishStatus: {
    isPublished: false,
  },
};

// Action类型
export type AppAction =
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "SET_DOC_LINK"; payload: string }
  | { type: "SET_DOC_ID"; payload: string | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_VALID"; payload: boolean }
  | { type: "SET_MARKDOWN_CONTENT"; payload: string }
  | { type: "SET_HTML_CONTENT"; payload: string }
  | { type: "SET_IMAGES"; payload: ImageInfo[] }
  | { type: "ADD_IMAGE"; payload: ImageInfo }
  | { type: "UPDATE_IMAGE"; payload: { id: string; updates: Partial<ImageInfo> } }
  | { type: "SET_PUBLISH_STATUS"; payload: Partial<PublishStatus> }
  | { type: "RESET_STATE" }
  | { type: "RESET_TO_STEP_1" };

// Reducer函数
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_CURRENT_STEP":
      return {
        ...state,
        currentStep: action.payload,
      };

    case "SET_DOC_LINK":
      return {
        ...state,
        docLink: action.payload,
      };

    case "SET_DOC_ID":
      return {
        ...state,
        docId: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "SET_VALID":
      return {
        ...state,
        isValid: action.payload,
      };

    case "SET_MARKDOWN_CONTENT":
      return {
        ...state,
        markdownContent: action.payload,
      };

    case "SET_HTML_CONTENT":
      return {
        ...state,
        htmlContent: action.payload,
      };

    case "SET_IMAGES":
      return {
        ...state,
        images: action.payload,
      };

    case "ADD_IMAGE":
      return {
        ...state,
        images: [...state.images, action.payload],
      };

    case "UPDATE_IMAGE":
      return {
        ...state,
        images: state.images.map((img) =>
          img.id === action.payload.id
            ? { ...img, ...action.payload.updates }
            : img
        ),
      };

    case "SET_PUBLISH_STATUS":
      return {
        ...state,
        publishStatus: {
          ...state.publishStatus,
          ...action.payload,
        },
      };

    case "RESET_STATE":
      return initialState;

    case "RESET_TO_STEP_1":
      return {
        ...initialState,
        docLink: state.docLink, // 保留文档链接
        docId: state.docId, // 保留文档ID
      };

    default:
      return state;
  }
};

// Context类型
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // 便捷方法
  setCurrentStep: (step: number) => void;
  setDocLink: (link: string) => void;
  setDocId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setValid: (valid: boolean) => void;
  setMarkdownContent: (content: string) => void;
  setHtmlContent: (content: string) => void;
  setImages: (images: ImageInfo[]) => void;
  addImage: (image: ImageInfo) => void;
  updateImage: (id: string, updates: Partial<ImageInfo>) => void;
  setPublishStatus: (status: Partial<PublishStatus>) => void;
  resetState: () => void;
  resetToStep1: () => void;
  // 业务逻辑方法
  startConversion: () => void;
  completeConversion: (markdown: string, html: string, images: ImageInfo[]) => void;
  startPublishing: () => void;
  completePublishing: (storyblokId: string, publishedUrl: string) => void;
  failPublishing: (error: string) => void;
}

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 便捷方法
  const setCurrentStep = (step: number) => {
    dispatch({ type: "SET_CURRENT_STEP", payload: step });
  };

  const setDocLink = (link: string) => {
    dispatch({ type: "SET_DOC_LINK", payload: link });
  };

  const setDocId = (id: string | null) => {
    dispatch({ type: "SET_DOC_ID", payload: id });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setError = (error: string) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  const setValid = (valid: boolean) => {
    dispatch({ type: "SET_VALID", payload: valid });
  };

  const setMarkdownContent = (content: string) => {
    dispatch({ type: "SET_MARKDOWN_CONTENT", payload: content });
  };

  const setHtmlContent = (content: string) => {
    dispatch({ type: "SET_HTML_CONTENT", payload: content });
  };

  const setImages = (images: ImageInfo[]) => {
    dispatch({ type: "SET_IMAGES", payload: images });
  };

  const addImage = (image: ImageInfo) => {
    dispatch({ type: "ADD_IMAGE", payload: image });
  };

  const updateImage = (id: string, updates: Partial<ImageInfo>) => {
    dispatch({ type: "UPDATE_IMAGE", payload: { id, updates } });
  };

  const setPublishStatus = (status: Partial<PublishStatus>) => {
    dispatch({ type: "SET_PUBLISH_STATUS", payload: status });
  };

  const resetState = () => {
    dispatch({ type: "RESET_STATE" });
  };

  const resetToStep1 = () => {
    dispatch({ type: "RESET_TO_STEP_1" });
  };

  // 业务逻辑方法
  const startConversion = () => {
    setCurrentStep(2);
    setLoading(true);
    setError("");
  };

  const completeConversion = (markdown: string, html: string, images: ImageInfo[]) => {
    setMarkdownContent(markdown);
    setHtmlContent(html);
    setImages(images);
    setCurrentStep(3);
    setLoading(false);
  };

  const startPublishing = () => {
    setCurrentStep(4);
    setLoading(true);
    setError("");
  };

  const completePublishing = (storyblokId: string, publishedUrl: string) => {
    setPublishStatus({
      isPublished: true,
      storyblokId,
      publishedUrl,
    });
    setLoading(false);
  };

  const failPublishing = (error: string) => {
    setPublishStatus({
      isPublished: false,
      publishError: error,
    });
    setError(error);
    setLoading(false);
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    setCurrentStep,
    setDocLink,
    setDocId,
    setLoading,
    setError,
    setValid,
    setMarkdownContent,
    setHtmlContent,
    setImages,
    addImage,
    updateImage,
    setPublishStatus,
    resetState,
    resetToStep1,
    startConversion,
    completeConversion,
    startPublishing,
    completePublishing,
    failPublishing,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// 自定义Hook
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// 便捷Hook
export const useAppState = () => {
  const { state } = useAppContext();
  return state;
};

export const useAppDispatch = () => {
  const { dispatch } = useAppContext();
  return dispatch;
}; 