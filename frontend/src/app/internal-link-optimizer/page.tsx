"use client";

import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  StepIndicator,
  InputStep,
  AnalysisStep,
  SuggestionsStep,
  OutputStep,
} from "./modules";
import { useInternalLinkOptimizerStore } from "../../stores/internalLinkOptimizerStore";

export default function InternalLinkOptimizer() {
  const {
    currentStep,
    blogUrl,
    linkRows,
    originalContent,
    analysisProgress,
    error,
    setBlogUrl,
    setLinkRows,
    startAnalysis,
    goBackToInput,
    startOver,
    addLinkRow,
    removeLinkRow,
    updateLinkRow,
    addAnchorText,
    updateAnchorText,
    removeAnchorText,
    handleBulkPaste,
    setError,
  } = useInternalLinkOptimizerStore();

  // 监听错误状态并显示 toast
  useEffect(() => {
    if (error) {
      toast.error("Analysis Failed", {
        description: error,
        duration: 5000,
      });
      // 显示 toast 后清除错误状态，避免重复显示
      setTimeout(() => setError(null), 100);
    }
  }, [error, setError]);

  // TODO: Add new useEffect for analysis completion

  // 自定义批量粘贴处理函数，添加 toast 提示
  const handleBulkPasteWithToast = (text: string) => {
    // 先验证文本格式
    const lines = text
      .trim()
      .split("\n")
      .filter((line) => line.trim());
    let validCount = 0;

    lines.forEach((line) => {
      const urlMatch = line.match(/^(https?:\/\/[^\s|]+)/);
      if (urlMatch) {
        const afterUrl = line
          .substring(urlMatch[1].length)
          .replace(/^\s*\|\s*/, "");
        if (afterUrl.trim()) {
          validCount++;
        }
      }
    });

    if (validCount > 0) {
      handleBulkPaste(text);
      toast.success("Bulk Paste Successful", {
        description: `Added ${validCount} link configuration${
          validCount > 1 ? "s" : ""
        }`,
        duration: 2000,
      });
    } else {
      toast.error("Paste Failed", {
        description: "Please check format: URL | anchor text 1 | anchor text 2",
        duration: 3000,
      });
    }
  };

  const getBackButton = () => {
    switch (currentStep) {
      case "suggestions":
        return {
          onClick: goBackToInput,
          text: "Back to Configuration",
        };
      default:
        return null;
    }
  };

  const backButton = getBackButton();

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      <div className="mx-auto max-w-6xl px-8 py-16">
        {/* Back Button */}
        {backButton && (
          <div className="mb-8">
            <button
              onClick={backButton.onClick}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
              style={{
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backButton.text}
            </button>
          </div>
        )}

        <div className="mb-16 text-center">
          <h1
            className="text-xl font-medium text-gray-900 mb-3"
            style={{
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            Internal Link Optimizer
          </h1>
          <p
            className="text-sm text-gray-500"
            style={{
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            Optimize your content with AI-powered internal linking suggestions
          </p>
        </div>

        <div>
          {currentStep === "input" && (
            <InputStep
              blogUrl={blogUrl}
              setBlogUrl={setBlogUrl}
              linkRows={linkRows}
              setLinkRows={setLinkRows}
              onAnalyze={startAnalysis}
              addLinkRow={addLinkRow}
              removeLinkRow={removeLinkRow}
              updateLinkRow={updateLinkRow}
              addAnchorText={addAnchorText}
              updateAnchorText={updateAnchorText}
              removeAnchorText={removeAnchorText}
              handleBulkPaste={handleBulkPasteWithToast}
            />
          )}
          {currentStep === "analysis" && (
            <AnalysisStep analysisProgress={analysisProgress} />
          )}
          {currentStep === "suggestions" && <SuggestionsStep />}
          {currentStep === "output" && (
            <OutputStep
              optimizedContent={originalContent}
              onStartOver={startOver}
            />
          )}
        </div>
      </div>
    </div>
  );
}
