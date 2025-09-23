"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
import {
  InputStep,
  AnalysisStep,
  SuggestionsStep,
  OutputStep,
} from "./modules";
import { useInternalLinkOptimizerStore } from "../../stores/internalLinkOptimizerStore";
import TabBar from "../../components/tab-bar";

export default function InternalLinkOptimizer() {
  const {
    currentStep,
    completedSteps,
    blogUrl,
    linkRows,
    analysisProgress,
    error,
    setBlogUrl,
    setLinkRows,
    startAnalysis,
    goBackToInput,
    goToStep,
    startOver,
    setCompletedSteps,
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

  // 监听步骤变化，确保当前步骤被标记为已完成
  useEffect(() => {
    if (currentStep && !completedSteps.has(currentStep as any)) {
      // 如果当前步骤还没有被标记为完成，添加到完成列表
      const updatedSteps = new Set([...completedSteps, currentStep as any]);
      setCompletedSteps(updatedSteps);
    }
  }, [currentStep, completedSteps, setCompletedSteps]);

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

  const handleTabClick = (stepId: string) => {
    if (stepId === "input") {
      goBackToInput();
    } else {
      goToStep(stepId as any);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 mx-auto px-8 py-16 pb-32">
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
          {currentStep === "suggestions" && (
            <SuggestionsStep 
              onProceedToOutput={() => goToStep("output")} 
            />
          )}
          {currentStep === "output" && <OutputStep onStartOver={startOver} />}
        </div>
      </div>

      <TabBar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onTabClick={handleTabClick}
      />
    </div>
  );
}
