"use client";

import React from "react";
import { 
  usePublishState,
  useConversionStoreClient
} from "../stores/conversionStoreClient";

export default function PublishResultDisplay() {
  const publishState = usePublishState();
  const { resetWorkflow } = useConversionStoreClient();

  const handleStartNew = () => {
    resetWorkflow();
  };

  return (
    <div style={{ 
      maxWidth: "600px", 
      margin: "0 auto", 
      padding: "20px",
      textAlign: "center"
    }}>
      <h1 style={{ marginBottom: "30px" }}>
        🎯 Step 3: Publish Result
      </h1>

      {/* 发布结果显示 */}
      <div style={{ marginBottom: "40px" }}>
        {publishState.publishSuccess ? (
          // 发布成功
          <div style={{ 
            padding: "30px", 
            backgroundColor: "#f0fdf4",
            border: "2px solid #10b981",
            borderRadius: "12px",
            marginBottom: "20px"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>✅</div>
            <h2 style={{ color: "#059669", marginBottom: "15px" }}>
              Published Successfully!
            </h2>
            <p style={{ color: "#047857", marginBottom: "20px" }}>
              Your document has been published to Storyblok.
            </p>

            {/* 发布结果详情 */}
            {publishState.publishResult && (
              <div style={{ 
                textAlign: "center", 
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #d1fae5"
              }}>
                <h3 style={{ marginBottom: "20px" }}>📊 Publication Details:</h3>
                
                <div style={{ marginBottom: "20px" }}>
                  <a 
                    href={publishState.publishResult.publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      display: "inline-block",
                      padding: "12px 24px",
                      backgroundColor: "#059669", 
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "6px",
                      fontWeight: "bold"
                    }}
                  >
                    🔗 View in Storyblok Dashboard
                  </a>
                </div>
                
                <p style={{ 
                  fontSize: "14px", 
                  color: "#6b7280",
                  wordBreak: "break-all"
                }}>
                  <strong>Preview Link:</strong><br/>
                  {publishState.publishResult.publishedUrl}
                </p>
              </div>
            )}
          </div>
        ) : publishState.publishError ? (
          // 发布失败
          <div style={{ 
            padding: "30px", 
            backgroundColor: "#fef2f2",
            border: "2px solid #ef4444",
            borderRadius: "12px",
            marginBottom: "20px"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>❌</div>
            <h2 style={{ color: "#dc2626", marginBottom: "15px" }}>
              Publication Failed
            </h2>
            <p style={{ color: "#991b1b", marginBottom: "15px" }}>
              There was an error publishing your document.
            </p>
            
            {/* 错误详情 */}
            <div style={{ 
              textAlign: "left", 
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #fecaca"
            }}>
              <h4 style={{ marginBottom: "10px", color: "#dc2626" }}>Error Details:</h4>
              <p style={{ 
                fontFamily: "monospace", 
                fontSize: "14px", 
                color: "#7f1d1d",
                wordBreak: "break-word"
              }}>
                {publishState.publishError}
              </p>
            </div>
          </div>
        ) : (
          // 默认状态（不应该出现）
          <div style={{ 
            padding: "30px", 
            backgroundColor: "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            marginBottom: "20px"
          }}>
            <p style={{ color: "#6b7280" }}>No publish result available.</p>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div style={{ marginTop: "30px" }}>
        <button 
          onClick={handleStartNew}
          style={{ 
            padding: "15px 30px", 
            fontSize: "16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          🔄 Start New Conversion
        </button>
      </div>

      {/* TODO: 添加其他操作 */}
      <div style={{ marginTop: "20px", color: "#6b7280", fontSize: "14px" }}>
        <p>更多操作待实现: 编辑已发布内容, 查看统计数据, 分享链接等</p>
      </div>
    </div>
  );
}
