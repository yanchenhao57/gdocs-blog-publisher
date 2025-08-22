"use client";

import DocInput from "../components/DocInput";
import ConversionMonitorWithStore from "../components/ConversionMonitorWithStore";
import EditFieldsForm from "../components/edit-fields-form";
import PublishResultDisplay from "../components/publish-result-display";

import { useState, useEffect } from "react";
import documentSocketService from "../services/documentSocket";
import {
  useConversionStoreClient,
  useWorkflowStage,
} from "../stores/conversionStoreClient";
import { WorkflowStage } from "../stores/conversionStore";

export default function Home() {
  const [currentDocId, setCurrentDocId] = useState<string>("");

  // Zustand状态管理（客户端安全版本）
  const { convertDocument, resetConversion } = useConversionStoreClient();

  const workflowStage = useWorkflowStage();

  useEffect(() => {
    // 确保Socket服务正常运行
    documentSocketService.getConnectionStats();
  }, []);

  const handleConvert = async (docId: string) => {
    console.log("Converting document:", docId);

    // 重置之前的转换状态
    resetConversion();

    // 设置当前正在转换的文档ID，用于过滤Socket事件
    setCurrentDocId(docId);

    try {
      // 调用Zustand中的convertDocument action
      // 这个action会处理所有的API调用、状态更新和工作流转换
      await convertDocument(docId);
    } catch (error) {
      // 错误已经在convertDocument action中处理了
      console.error("Conversion failed:", error);
    } finally {
      // 清除当前文档ID
      setCurrentDocId("");
    }
  };

  // 根据工作流状态渲染不同的UI组件
  const renderCurrentStage = () => {
    console.log("Current workflow stage:", workflowStage); // 调试用

    switch (workflowStage) {
      case WorkflowStage.INPUT_DOC_ID:
        return <DocInput onConvert={handleConvert} />;

      case WorkflowStage.EDIT_FIELDS:
        return <EditFieldsForm />;

      case WorkflowStage.PUBLISH_RESULT:
        return <PublishResultDisplay />;

      default:
        return <DocInput onConvert={handleConvert} />;
    }
  };

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Socket监听器 - 监听当前文档的转换事件（集成Zustand状态管理） */}
      <ConversionMonitorWithStore docId={currentDocId} />

      {/* 根据工作流状态渲染对应的UI组件 */}
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
          }}
        >
          Current Stage: {workflowStage}
        </div>
      )}
    </main>
  );
}
