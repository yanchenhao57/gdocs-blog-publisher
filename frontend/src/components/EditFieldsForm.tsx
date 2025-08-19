"use client";

import React from "react";
import { 
  useEditableFields,
  useHasUnsavedChanges,
  usePublishState,
  useCanPublish,
  useConversionStoreClient
} from "../stores/conversionStoreClient";

export default function EditFieldsForm() {
  const editableFields = useEditableFields();
  const hasUnsavedChanges = useHasUnsavedChanges();
  const publishState = usePublishState();
  const canPublish = useCanPublish();
  
  const { 
    updateEditableField,
    publishToStoryblok,
    regenerateAiData,
    resetWorkflow,
    currentDocId,
    result
  } = useConversionStoreClient();

  const handlePublish = async () => {
    if (!canPublish) return;
    
    try {
      // 调用Zustand中的publishToStoryblok action
      // 这个action会处理所有的API调用、状态更新和工作流转换
      await publishToStoryblok();
    } catch (error) {
      // 错误已经在publishToStoryblok action中处理了
      console.error("Publication failed:", error);
    }
  };

  const handleStartOver = () => {
    resetWorkflow();
  };

  const handleRegenerateAi = async () => {
    if (!currentDocId || !result?.markdown) {
      console.warn("Cannot regenerate AI: missing docId or markdown");
      return;
    }

    try {
      // 调用Zustand中的regenerateAiData action
      await regenerateAiData(currentDocId, result.markdown, editableFields.language);
    } catch (error) {
      // 错误已经在regenerateAiData action中处理了
      console.error("AI regeneration failed:", error);
    }
  };

  return (
    <div style={{ 
      maxWidth: "600px", 
      margin: "0 auto", 
      padding: "20px",
      textAlign: "left" 
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        ✏️ Step 2: Edit Fields & Publish
      </h1>
      
      {/* 转换结果摘要 */}
      <div style={{ 
        marginBottom: "30px", 
        padding: "20px", 
        backgroundColor: "#f0f9ff",
        border: "1px solid #0ea5e9",
        borderRadius: "8px"
      }}>
        <h3>📋 Conversion Completed Successfully!</h3>
        <p>Document has been converted to all required formats.</p>
        {/* TODO: 显示转换结果的详细信息 */}
      </div>

      {/* 字段编辑表单 */}
      <div style={{ marginBottom: "30px" }}>
        <h3>🔧 Edit Publication Fields</h3>
        
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            SEO Title:
          </label>
          <input 
            type="text"
            value={editableFields.seo_title}
            onChange={(e) => updateEditableField("seo_title", e.target.value)}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
            placeholder="Enter SEO title..."
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            SEO Description:
          </label>
          <textarea 
            value={editableFields.seo_description}
            onChange={(e) => updateEditableField("seo_description", e.target.value)}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #ccc",
              borderRadius: "4px",
              minHeight: "80px"
            }}
            placeholder="Enter SEO description..."
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Slug:
          </label>
          <input 
            type="text"
            value={editableFields.slug}
            onChange={(e) => updateEditableField("slug", e.target.value)}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
            placeholder="Enter URL slug..."
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Language:
          </label>
          <select 
            value={editableFields.language}
            onChange={(e) => updateEditableField("language", e.target.value)}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="es">Español</option>
            {/* TODO: 添加更多语言选项 */}
          </select>
        </div>

        {/* TODO: 添加更多字段 */}
        <p style={{ color: "#666", fontSize: "14px" }}>
          更多字段待实现: heading_h1, coverUrl, coverAlt, reading_time, etc.
        </p>
      </div>

      {/* 未保存更改提示 */}
      {hasUnsavedChanges && (
        <div style={{ 
          marginBottom: "20px", 
          padding: "10px",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "4px",
          color: "#856404"
        }}>
          ⚠️ You have unsaved changes
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ 
        display: "flex", 
        gap: "15px", 
        justifyContent: "center",
        marginTop: "30px",
        flexWrap: "wrap"
      }}>
        <button 
          onClick={handlePublish}
          disabled={!canPublish}
          style={{ 
            padding: "12px 24px", 
            fontSize: "16px",
            backgroundColor: canPublish ? "#10b981" : "#9ca3af",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: canPublish ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          {publishState.isPublishing ? "🔄" : "📤"} 
          {publishState.isPublishing ? "Publishing..." : "Publish to Storyblok"}
        </button>

        <button 
          onClick={handleRegenerateAi}
          disabled={publishState.isPublishing}
          style={{ 
            padding: "12px 24px", 
            fontSize: "14px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: publishState.isPublishing ? "not-allowed" : "pointer",
            opacity: publishState.isPublishing ? 0.6 : 1
          }}
        >
          🤖 Regenerate AI Data
        </button>

        <button 
          onClick={handleStartOver}
          style={{ 
            padding: "12px 24px", 
            fontSize: "14px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          🔄 Start Over
        </button>
      </div>
    </div>
  );
}
