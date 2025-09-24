import React, { useState } from "react";
import { render } from "storyblok-rich-text-react-renderer";
import { MarkdownConverter } from "../../../../utils/markdownConverter";
import { Card, CardContent } from "../../../ui/card";
import Button from "../../../button";
import { Check, X, RotateCcw, Clock, CheckCircle, XCircle } from "lucide-react";
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
  const renderContent = (markdown: string) => {
    try {
      // 使用 MarkdownConverter 将 markdown 转换为 ProseMirror JSON
      const paragraphNode = MarkdownConverter.markdownToParagraph(markdown);

      if (!paragraphNode) {
        // 如果转换失败，显示原始文本
        return <p>{markdown}</p>;
      }

      // 包装为完整的文档结构
      const docContent = {
        type: "doc",
        content: [paragraphNode],
      };

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
        return <CheckCircle size={14} />;
      case "rejected":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
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
    <Card
      className={`${styles.card} ${styles[status]}`}
      data-optimization-index={change.index}
    >
      <CardContent className={styles.cardContent}>
        {/* 状态标签 - 左上角 */}
        <div className={styles.statusBadge}>
          <span className={styles.statusIcon}>{getStatusIcon()}</span>
          <span className={styles.statusText}>{getStatusLabel()}</span>
        </div>

        {/* AI 建议内容 */}
        <div className={styles.contentSection}>
          <div className={styles.contentBox}>
            {renderContent(change.modified)}
          </div>
        </div>

        {/* 操作按钮 - 右下角 */}
        <div className={styles.actionButtons}>
          {status === "pending" ? (
            <>
              <Button
                variant="outline"
                size="small"
                icon={<Check size={14} />}
                onClick={() => onAccept(change.index)}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="small"
                icon={<X size={14} />}
                onClick={() => onReject(change.index)}
              >
                Reject
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="small"
              icon={<RotateCcw size={14} />}
              onClick={() => onUndo(change.index)}
            >
              Undo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationComparison;
