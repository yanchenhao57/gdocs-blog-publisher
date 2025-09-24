"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
import { InputStep, SuggestionsStep, OutputStep } from "./modules";
import { useInternalLinkOptimizerStore } from "../../stores/internalLinkOptimizerStore";
import BottomBar from "./modules/bottom-bar";
import styles from "./page.module.css";

export default function InternalLinkOptimizerClient() {
  const {
    currentStep,
    completedSteps,
    blogUrl,
    linkRows,
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


  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Internal Link Optimizer</h1>
          <p className={styles.subtitle}>
            Optimize your content with AI-powered internal linking suggestions
          </p>
        </div>

        <div className={styles.stepContent}>
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
          {currentStep === "suggestions" && (
            <SuggestionsStep onProceedToOutput={() => goToStep("output")} />
          )}
          {currentStep === "output" && <OutputStep onStartOver={startOver} />}
        </div>
      </div>

      <BottomBar />
    </div>
  );
}
