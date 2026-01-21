"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import InputStep from "./modules/input-step";
import ResultsStep from "./modules/results-step";
import LoadingStep from "./modules/loading-step";
import { useSeoInspectorStore } from "../../stores/seoInspectorStore";

export default function SeoInspectorClient() {
  const {
    currentStep,
    currentUrl,
    auditResult,
    isAnalyzing,
    error,
    startAudit,
    goBack,
    setError,
  } = useSeoInspectorStore();

  // 监听错误状态并显示 toast
  useEffect(() => {
    if (error) {
      toast.error("Analysis Failed", {
        description: error,
        duration: 5000,
      });
      // 清除错误状态（可选）
      // setError(null);
    }
  }, [error]);

  const handleStartAudit = async (url: string) => {
    try {
      await startAudit(url);
      // 成功后显示 toast
      toast.success("Analysis Complete", {
        description: "URL analysis completed successfully",
        duration: 3000,
      });
    } catch (err) {
      // 错误已经在 store 中处理并通过 useEffect 显示
    }
  };

  // 显示加载页面
  if (isAnalyzing) {
    return <LoadingStep url={currentUrl} />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {currentStep === "input" ? (
        <InputStep onAudit={handleStartAudit} />
      ) : (
        auditResult && <ResultsStep data={auditResult} onBack={goBack} />
      )}
    </div>
  );
}

