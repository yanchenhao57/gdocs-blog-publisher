"use client";

import { useState } from "react";
import TranslateInitialForm from "./components/initialForm";
import Work from "./components/work";

// 翻译工作流状态枚举
enum WorkflowStage {
  INITIAL_FORM = "initial_form",
  WORKING = "working",
}

const initialFormData = {
  link: "",
  targetLanguages: [],
};

export default function TranslatePage() {
  const [stage, setStage] = useState<WorkflowStage>(WorkflowStage.INITIAL_FORM);

  const [formData, setFormData] = useState<{
    link: string;
    targetLanguages: string[];
  }>(initialFormData);

  // 处理表单提交
  const handleFormSubmit = async (data: {
    link: string;
    targetLanguages: string[];
  }) => {
    console.log("表单提交数据:", data);
    setFormData(data);
    // 切换到工作状态
    setStage(WorkflowStage.WORKING);
  };

  // 返回初始表单
  const handleBackToForm = () => {
    setStage(WorkflowStage.INITIAL_FORM);
    setFormData(initialFormData);
  };

  // 根据工作流状态渲染对应组件
  const renderCurrentStage = () => {
    switch (stage) {
      case WorkflowStage.INITIAL_FORM:
        return <TranslateInitialForm onSubmit={handleFormSubmit} />;

      case WorkflowStage.WORKING:
        return <Work formData={formData} onBack={handleBackToForm} />;

      default:
        return <TranslateInitialForm onSubmit={handleFormSubmit} />;
    }
  };

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: stage === WorkflowStage.WORKING ? "0" : "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: stage === WorkflowStage.WORKING ? "stretch" : "center",
        justifyContent: stage === WorkflowStage.WORKING ? "stretch" : "center",
      }}
    >
      {/* 根据工作流状态渲染对应的组件 */}
      {renderCurrentStage()}

      {/* 开发调试信息 */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "fixed",
            bottom: "10px",
            right: "10px",
            padding: "10px",
            backgroundColor: "rgba(0,0,0,0.8)",
            color: "white",
            borderRadius: "4px",
            fontSize: "12px",
            zIndex: 9999,
          }}
        >
          当前状态: {stage}
        </div>
      )}
    </main>
  );
}
