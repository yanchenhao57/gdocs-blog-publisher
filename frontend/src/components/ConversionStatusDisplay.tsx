"use client";

import React from "react";
import { ConversionStage } from "../stores/conversionStore";
import {
  useConversionStatus,
  useAiAnalysisStatus,
  useImageProcessingStatus,
  useLatestProgress,
  useConversionComplete,
  useConversionError,
} from "../stores/conversionStoreClient";

/**
 * 转换状态显示组件
 * 显示当前转换的详细进度和状态信息
 */
export const ConversionStatusDisplay: React.FC = () => {
  const conversionStatus = useConversionStatus();
  const aiStatus = useAiAnalysisStatus();
  const imageProgress = useImageProcessingStatus();
  const latestProgress = useLatestProgress();
  const isCompleted = useConversionComplete();
  const hasError = useConversionError();

  // 如果没有在转换，不显示
  if (!conversionStatus.isConverting && !isCompleted && !hasError) {
    return null;
  }

  // 获取阶段显示信息
  const getStageInfo = (stage: ConversionStage) => {
    switch (stage) {
      case ConversionStage.FETCHING_DOCUMENT:
        return { icon: "📄", text: "Fetching Document", color: "#3498db" };
      case ConversionStage.AI_ANALYSIS:
        return { icon: "🤖", text: "AI Analysis", color: "#9b59b6" };
      case ConversionStage.FORMAT_CONVERSION:
        return { icon: "📝", text: "Format Conversion", color: "#e67e22" };
      case ConversionStage.PROCESSING_IMAGES:
        return { icon: "🖼️", text: "Processing Images", color: "#f39c12" };
      case ConversionStage.COMPLETED:
        return { icon: "✅", text: "Completed", color: "#27ae60" };
      case ConversionStage.ERROR:
        return { icon: "❌", text: "Error", color: "#e74c3c" };
      default:
        return { icon: "⏳", text: "Processing", color: "#95a5a6" };
    }
  };

  const stageInfo = getStageInfo(conversionStatus.stage);

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        minWidth: "320px",
        maxWidth: "400px",
        padding: "16px",
        backgroundColor: "white",
        border: "1px solid #e1e5e9",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        fontSize: "14px",
        zIndex: 1000,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 标题栏 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
          paddingBottom: "8px",
          borderBottom: "1px solid #f1f3f4",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: "600",
            color: "#1a73e8",
          }}
        >
          Document Conversion
        </h3>
        <div
          style={{
            fontSize: "12px",
            color: "#5f6368",
            backgroundColor: "#f8f9fa",
            padding: "2px 8px",
            borderRadius: "12px",
          }}
        >
          {conversionStatus.docId.slice(-8)}
        </div>
      </div>

      {/* 当前阶段 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "12px",
          padding: "8px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        <span
          style={{
            fontSize: "20px",
            marginRight: "8px",
          }}
        >
          {stageInfo.icon}
        </span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: "500",
              color: stageInfo.color,
              marginBottom: "2px",
            }}
          >
            {stageInfo.text}
          </div>
          {latestProgress && (
            <div
              style={{
                fontSize: "12px",
                color: "#5f6368",
              }}
            >
              {latestProgress.message}
            </div>
          )}
        </div>
      </div>

      {/* AI 分析状态 */}
      {(aiStatus.isAnalyzing ||
        aiStatus.hasSucceeded ||
        aiStatus.hasFailed ||
        aiStatus.usedFallback) && (
        <div
          style={{
            marginBottom: "12px",
            padding: "8px",
            backgroundColor: aiStatus.hasSucceeded
              ? "#e8f5e8"
              : aiStatus.usedFallback
              ? "#fff3cd"
              : aiStatus.hasFailed
              ? "#f8d7da"
              : "#f8f9fa",
            borderRadius: "6px",
            fontSize: "12px",
          }}
        >
          <div style={{ fontWeight: "500", marginBottom: "4px" }}>
            🤖 AI Analysis
          </div>
          <div style={{ color: "#5f6368" }}>
            {aiStatus.isAnalyzing && "Analyzing content..."}
            {aiStatus.hasSucceeded && "Completed successfully"}
            {aiStatus.usedFallback && "Using fallback defaults"}
            {aiStatus.hasFailed && "Failed, continuing with defaults"}
          </div>
        </div>
      )}

      {/* 图片处理进度 */}
      {imageProgress.totalImages > 0 && (
        <div
          style={{
            marginBottom: "12px",
            padding: "8px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: "500" }}>
              🖼️ Images
            </span>
            <span style={{ fontSize: "12px", color: "#5f6368" }}>
              {imageProgress.processedImages + imageProgress.failedImages} /{" "}
              {imageProgress.totalImages}
            </span>
          </div>

          {/* 进度条 */}
          <div
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "#e1e5e9",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${imageProgress.completionRate * 100}%`,
                height: "100%",
                backgroundColor:
                  imageProgress.successRate > 0.8 ? "#27ae60" : "#f39c12",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {imageProgress.failedImages > 0 && (
            <div
              style={{
                fontSize: "11px",
                color: "#e74c3c",
                marginTop: "4px",
              }}
            >
              {imageProgress.failedImages} failed
            </div>
          )}
        </div>
      )}

      {/* 时间信息 */}
      {latestProgress && (
        <div
          style={{
            fontSize: "11px",
            color: "#9aa0a6",
            textAlign: "right",
          }}
        >
          {new Date(latestProgress.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ConversionStatusDisplay;
