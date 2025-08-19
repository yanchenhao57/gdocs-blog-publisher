"use client";

import React, { useEffect, useRef } from "react";
import documentSocketService from "../services/documentSocket";
import { ToastUtils } from "../utils/toastUtils";
import { 
  NotificationData, 
  GoogleDocsNotification,
  AiAnalysisStartNotification,
  AiAnalysisSuccessNotification,
  AiAnalysisErrorNotification,
  AiAnalysisFallbackNotification,
  StoryblokNotification,
  ImageProcessNotification,
  ConvertCompleteNotification,
  ConvertErrorNotification,
  ConnectionStatusNotification
} from "../types/socket";
import { ConversionStage } from "../stores/conversionStore";
import { useConversionStoreClient } from "../stores/conversionStoreClient";

interface ConversionMonitorProps {
  docId?: string; // 当前正在转换的文档ID，用于过滤相关事件
}

/**
 * 文档转换流程监听器组件（集成Zustand状态管理）
 * 监听convert接口的所有流程事件，更新状态并显示toast提示
 */
export const ConversionMonitorWithStore: React.FC<ConversionMonitorProps> = ({
  docId,
}) => {
  const currentDocIdRef = useRef<string | undefined>(docId);
  
  // Zustand状态管理（客户端安全版本）
  const {
    updateProgress,
    startAiAnalysis,
    completeAiAnalysis,
    failAiAnalysis,
    useAiFallback,
    addProcessingImage,
    completeImageProcessing,
    failImageProcessing,
    completeConversion,
    failConversion,
  } = useConversionStoreClient();

  useEffect(() => {
    currentDocIdRef.current = docId;
  }, [docId]);

  useEffect(() => {
    // 过滤事件：只处理当前文档的事件，如果没有指定docId则处理所有事件
    const shouldHandleEvent = (data: NotificationData) => {
      if (!currentDocIdRef.current) return true; // 没有指定docId，处理所有事件
      const eventDocId = data.docId;
      return eventDocId === currentDocIdRef.current;
    };

    // Google Docs 获取阶段
    const unsubscribeGoogleDocs1 = documentSocketService.onTyped("googleDocs:fetch:start", (data) => {
      if (!shouldHandleEvent(data)) return;
      const docId = data.docId;
      
      // 更新Zustand状态
      updateProgress(ConversionStage.FETCHING_DOCUMENT, "Fetching Google Docs document", { docId });
      
      // 显示Toast
      ToastUtils.info("🚀 Starting Document Fetch", {
        description: `Fetching Google Docs: ${docId}`,
        duration: 3000,
      });
    });

    const unsubscribeGoogleDocs2 = documentSocketService.onTyped("googleDocs:fetch:success", (data) => {
      if (!shouldHandleEvent(data)) return;
      
      // 更新Zustand状态
      updateProgress(ConversionStage.FETCHING_DOCUMENT, "Google Docs document fetched successfully");
      
      // 显示Toast
      ToastUtils.success("✅ Document Fetched", {
        description: "Google Docs document fetched successfully",
        duration: 3000,
      });
    });

    const unsubscribeGoogleDocs3 = documentSocketService.onTyped("googleDocs:fetch:error", (data) => {
      if (!shouldHandleEvent(data)) return;
      const message = data.message;
      
      // 更新Zustand状态为错误
      failConversion(`Document fetch failed: ${message}`);
      
      // 显示Toast
      ToastUtils.error("❌ Document Fetch Failed", message || "Failed to fetch Google Docs", {
        duration: 5000,
      });
    });

    // AI 分析阶段
    const unsubscribeAiAnalysis1 = documentSocketService.onTyped("ai:analysis:start", (data) => {
      if (!shouldHandleEvent(data)) return;
      
      // 更新Zustand状态
      startAiAnalysis("Starting AI analysis...");
      
      // 显示Toast
      ToastUtils.info("🤖 Starting AI Analysis", {
        description: "Analyzing document content with AI...",
        duration: 3000,
      });
    });

    const unsubscribeAiAnalysis2 = documentSocketService.onTyped("ai:analysis:success", (data) => {
      if (!shouldHandleEvent(data)) return;
      const aiMeta = data.aiMeta;
      
      // 更新Zustand状态
      completeAiAnalysis(aiMeta, "AI analysis completed successfully");
      
      // 显示Toast
      ToastUtils.success("🎯 AI Analysis Complete", {
        description: "Content analysis and metadata generation completed",
        duration: 4000,
      });
    });

    const unsubscribeAiAnalysis3 = documentSocketService.onTyped("ai:analysis:error", (data) => {
      if (!shouldHandleEvent(data)) return;
      
      // 更新Zustand状态
      failAiAnalysis(data.error, "AI analysis failed");
      
      // 显示Toast
      ToastUtils.warning("⚠️ AI Analysis Failed", {
        description: "Using default values to continue the process",
        duration: 4000,
      });
    });

    // AI 降级处理事件
    const unsubscribeAiFallback = documentSocketService.onTyped("ai:analysis:fallback", (data) => {
      if (!shouldHandleEvent(data)) return;
      const aiMeta = data.aiMeta;
      
      // 更新Zustand状态
      useAiFallback(aiMeta, data.error, "Using AI fallback values");
      
      // 显示Toast
      ToastUtils.warning("🔄 AI Fallback Applied", {
        description: "AI analysis failed, using document structure-based defaults",
        duration: 4000,
      });
    });

    // Storyblok 转换阶段
    const unsubscribeStoryblok1 = documentSocketService.onTyped("storyblok:convert:start", (data) => {
      if (!shouldHandleEvent(data)) return;
      
      // 更新Zustand状态
      updateProgress(ConversionStage.FORMAT_CONVERSION, "Converting to Storyblok richtext format");
      
      // 显示Toast
      ToastUtils.info("📝 Starting Format Conversion", {
        description: "Converting to Storyblok richtext format...",
        duration: 3000,
      });
    });

    const unsubscribeStoryblok2 = documentSocketService.onTyped("storyblok:convert:success", (data) => {
      if (!shouldHandleEvent(data)) return;
      
      // 更新Zustand状态
      updateProgress(ConversionStage.FORMAT_CONVERSION, "Storyblok format conversion completed");
      
      // 显示Toast
      ToastUtils.success("✨ Format Conversion Complete", {
        description: "Content converted to Storyblok format successfully",
        duration: 3000,
      });
    });

    const unsubscribeStoryblok3 = documentSocketService.onTyped("storyblok:convert:error", (data) => {
      if (!shouldHandleEvent(data)) return;
      const message = data.message;
      
      // 更新Zustand状态为错误
      failConversion(`Format conversion failed: ${message}`);
      
      // 显示Toast
      ToastUtils.error("❌ Format Conversion Failed", message || "Failed to convert to Storyblok format", {
        duration: 5000,
      });
    });

    // 图片处理阶段（暂时不处理，但保留状态更新）
    const unsubscribeImageStart = documentSocketService.onTyped("image:process:start", (data) => {
      if (!shouldHandleEvent(data)) return;
      const imageUrl = data.imageUrl || "";
      
      // 更新Zustand状态
      addProcessingImage(imageUrl);
      updateProgress(ConversionStage.PROCESSING_IMAGES, `Processing image: ${imageUrl}`, { imageUrl });
    });

    const unsubscribeImageSuccess = documentSocketService.onTyped("image:process:success", (data) => {
      if (!shouldHandleEvent(data)) return;
      const imageUrl = data.imageUrl || "";
      const resultUrl = data.resultUrl || "";
      
      // 更新Zustand状态
      completeImageProcessing(imageUrl);
    });

    const unsubscribeImageError = documentSocketService.onTyped("image:process:error", (data) => {
      if (!shouldHandleEvent(data)) return;
      const imageUrl = data.imageUrl || "";
      
      // 更新Zustand状态
      failImageProcessing(imageUrl);
    });

    // 转换完成事件
    const unsubscribeComplete = documentSocketService.onTyped("convert:complete", (data) => {
      if (!shouldHandleEvent(data)) return;

      const summary = data.summary;
      const docId = data.docId;
      const documentTitle = summary.firstH1Title || docId; // 优先使用文档标题，fallback到docId
      
      // 更新Zustand转换状态为完成
      // 注意：这里只更新转换进度，不改变工作流状态
      // 工作流状态的改变应该在API调用完成后进行
      completeConversion({
        html: "",
        markdown: "",
        richtext: { type: 'doc' as const, content: [] },
        aiMeta: { seo_title: '', seo_description: '', heading_h1: '', slug: '', reading_time: 0, language: '', cover_alt: '' },
        firstH1Title: summary.firstH1Title || "",
        coverImage: summary.coverImage || "",
      });

      // 显示Toast - 使用文档标题
      ToastUtils.apiSuccess("🎉 Conversion Complete", 
        `"${documentTitle}" has been converted successfully! ` +
        `HTML: ${summary.hasHtml ? "✅" : "❌"}, ` +
        `Markdown: ${summary.hasMarkdown ? "✅" : "❌"}, ` +
        `Richtext: ${summary.hasRichtext ? "✅" : "❌"}`
      );
    });

    // 转换错误事件
    const unsubscribeError = documentSocketService.onTyped("convert:error", (data) => {
      if (!shouldHandleEvent(data)) return;

      const message = data.message || "Unknown error occurred";
      const error = data.error || "";
      
      // 更新Zustand状态为错误
      failConversion(`${message}: ${error}`);

      // 显示Toast
      ToastUtils.error("💥 Conversion Failed", `${message}: ${error}`, {
        duration: 8000,
      });
    });

    // 注意：连接状态通知已移到 SocketConnectionNotifier 组件中统一管理

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
      unsubscribeImageStart();
      unsubscribeImageSuccess();
      unsubscribeImageError();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, []); // 空依赖数组，只在组件挂载时设置监听器

  // 这是一个纯粹的监听器组件，不渲染任何UI
  return null;
};

export default ConversionMonitorWithStore;
