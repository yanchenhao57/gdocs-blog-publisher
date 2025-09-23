import React, { useState } from "react";
import { render } from "storyblok-rich-text-react-renderer";
import { MarkdownConverter } from "../../../../utils/markdownConverter";
import styles from "./index.module.css";
import type { OptimizationChange } from "../../../../app/internal-link-optimizer/modules/types";

interface OptimizationComparisonProps {
  change: OptimizationChange;
  onAccept: (index: number) => void;
  onReject: (index: number) => void;
  onUndo: (index: number) => void;
  status?: "pending" | "accepted" | "rejected";
}

const OptimizationComparison = ({
  change,
  onAccept,
  onReject,
  onUndo,
  status = "pending",
}: OptimizationComparisonProps) => {
  const [expanded, setExpanded] = useState(true);

  const renderContent = (markdown: string) => {
    try {
      // 使用 MarkdownConverter 将 markdown 转换为 ProseMirror JSON
      const paragraphNode = MarkdownConverter.markdownToParagraph(markdown);
      console.log("🚀 ~ renderContent ~ paragraphNode:", paragraphNode);

      if (!paragraphNode) {
        // 如果转换失败，显示原始文本
        return <p>{markdown}</p>;
      }

      // 包装为完整的文档结构
      const docContent = {
        type: "doc",
        content: [paragraphNode]
      };

      console.log("🚀 ~ renderContent ~ docContent:", docContent);

      // 使用 storyblok-rich-text-react-renderer 渲染
      return render(docContent);
    } catch (error) {
      console.error("Error rendering content:", error);
      // 如果转换失败，显示原始文本
      return <p>{markdown}</p>;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "accepted":
        return "✅";
      case "rejected":
        return "❌";
      default:
        return "⏳";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      default:
        return "Pending Review";
    }
  };

  return (
    <div 
      className={`${styles.comparisonContainer} ${styles[status]}`}
      data-optimization-index={change.index}
    >
      {/* 折叠/展开控制 */}
      <div className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.headerLeft}>
          <span className={styles.expandIcon}>{expanded ? "📖" : "📕"}</span>
          <span className={styles.changeLabel}>
            AI Optimization Suggestion #{change.index}
          </span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.statusBadge}>
            {getStatusIcon()} {getStatusLabel()}
          </span>
        </div>
      </div>

      {expanded && (
        <div className={styles.comparisonContent}>
          {/* 建议内容 - 直接显示优化后的文案 */}
          <div className={styles.suggestedSection}>
            <div className={styles.sectionLabel}>
              ✨ AI Suggested Improvement
            </div>
            <div className={styles.contentBox}>
              {renderContent(change.modified)}
            </div>
          </div>

          {/* 操作按钮 */}
          {status === "pending" && (
            <div className={styles.actionButtons}>
              <button
                className={`${styles.actionButton} ${styles.acceptButton}`}
                onClick={() => onAccept(change.index)}
              >
                ✅ Accept Changes
              </button>
              <button
                className={`${styles.actionButton} ${styles.rejectButton}`}
                onClick={() => onReject(change.index)}
              >
                ❌ Reject Changes
              </button>
            </div>
          )}

          {/* 已处理状态提示和撤销按钮 */}
          {status !== "pending" && (
            <div className={styles.statusSection}>
              <div className={styles.statusMessage}>
                {status === "accepted"
                  ? "✅ These changes have been accepted and will be applied."
                  : "❌ These changes have been rejected and will not be applied."}
              </div>
              <button
                className={`${styles.actionButton} ${styles.undoButton}`}
                onClick={() => onUndo(change.index)}
              >
                ↩️ Undo Decision
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OptimizationComparison;
