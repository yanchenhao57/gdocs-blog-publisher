import React, { useState, useMemo } from "react";
import {
  FileText,
  RotateCcw,
  Upload,
  Loader2,
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { useInternalLinkOptimizerStore } from "../../../stores/internalLinkOptimizerStore";
import { render } from "storyblok-rich-text-react-renderer";
import { MarkdownConverter } from "../../../utils/markdownConverter";
import { apiService } from "../../../services/api";
import Button from "../../../components/button";
import styles from "./OutputStep.module.css";

interface OutputStepProps {
  onStartOver: () => void;
}

export default function OutputStep({ onStartOver }: OutputStepProps) {
  const {
    storyData,
    optimizationChanges,
    optimizationStatus,
    markdownContent,
    blogUrl,
    linkRows,
    isPublishing,
    publishSuccess,
    publishError,
    publishResult,
    publishToStoryblok,
  } = useInternalLinkOptimizerStore();

  const [isCopied, setIsCopied] = useState(false);
  const [showStartOverModal, setShowStartOverModal] = useState(false);

  // 计算接受的修改统计
  const acceptedChanges = useMemo(() => {
    return optimizationChanges.filter(
      (change) => optimizationStatus[change.index] === "accepted"
    );
  }, [optimizationChanges, optimizationStatus]);

  // 计算用户输入信息摘要
  const inputSummary = useMemo(() => {
    const validLinks = linkRows.filter((row) => row.targetUrl.trim());
    const totalAnchorTexts = linkRows.reduce(
      (total, row) =>
        total + row.anchorTexts.filter((text) => text.trim()).length,
      0
    );

    return {
      blogUrl,
      totalLinks: validLinks.length,
      totalAnchorTexts,
      storyTitle: storyData?.name || "Unknown",
    };
  }, [blogUrl, linkRows, storyData]);

  // 检查是否所有建议都已决策完毕
  const allDecisionsComplete = useMemo(() => {
    if (optimizationChanges.length === 0) return true; // 没有建议时认为完成

    return optimizationChanges.every(
      (change) =>
        optimizationStatus[change.index] === "accepted" ||
        optimizationStatus[change.index] === "rejected"
    );
  }, [optimizationChanges, optimizationStatus]);

  // Start Over 处理逻辑
  const handleStartOver = () => {
    if (!publishSuccess) {
      // 如果没有发布过，显示确认弹窗
      setShowStartOverModal(true);
    } else {
      // 如果已经发布过，直接重新开始
      onStartOver();
    }
  };

  const confirmStartOver = () => {
    setShowStartOverModal(false);
    onStartOver();
  };

  // 复制链接功能
  const handleCopyUrl = async () => {
    if (publishResult?.previewLink) {
      try {
        await navigator.clipboard.writeText(publishResult.previewLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy URL:", err);
      }
    }
  };

  // 生成最终优化的 Storyblok content JSON
  const finalOptimizedContent = useMemo(() => {
    if (!storyData || !storyData.content) return null;

    // 深拷贝原始的 storyData.content
    const optimizedContent = JSON.parse(JSON.stringify(storyData.content));

    // 如果没有接受的修改，直接返回原始内容
    if (acceptedChanges.length === 0) {
      return optimizedContent;
    }

    // 获取 body 中的 content 数组（paragraph 列表）
    if (!optimizedContent.body || !optimizedContent.body.content) {
      console.error("Invalid story content structure");
      return optimizedContent;
    }

    const paragraphs = optimizedContent.body.content;

    // 应用用户接受的修改
    acceptedChanges.forEach((change) => {
      // change.index 对应 paragraph 在 content 数组中的位置
      if (change.index >= 0 && change.index < paragraphs.length) {
        const paragraph = paragraphs[change.index];

        // 确保是 paragraph 类型
        if (paragraph && paragraph.type === "paragraph") {
          try {
            // 将修改后的 markdown 转换为 ProseMirror paragraph 节点
            const newParagraphNode = MarkdownConverter.markdownToParagraph(
              change.modified
            );
            if (newParagraphNode) {
              // 替换原始的 paragraph 内容
              paragraphs[change.index] = newParagraphNode;
            }
          } catch (error) {
            console.error(
              `Error converting modified content at index ${change.index}:`,
              error
            );
          }
        }
      }
    });

    return optimizedContent;
  }, [storyData, acceptedChanges]);

  // 渲染优化后的内容（仅用于预览，实际发布使用完整的 finalOptimizedContent）
  const renderedContent = useMemo(() => {
    if (!finalOptimizedContent || !finalOptimizedContent.body) return null;

    try {
      // 只渲染 body 部分用于预览
      return render(finalOptimizedContent.body);
    } catch (error) {
      console.error("Error rendering final content:", error);
      return <p>Error rendering optimized content</p>;
    }
  }, [finalOptimizedContent]);

  if (!storyData) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>No Content Available</h2>
          <p className={styles.subtitle}>
            Please complete the analysis process first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* 标题区域 */}
        <div className={styles.header}>
          <h2 className={styles.title}>Final Optimized Article</h2>
          <p className={styles.subtitle}>
            Your content has been optimized with {acceptedChanges.length}{" "}
            accepted improvements
          </p>
        </div>

        {/* 输入信息摘要 */}
        <div className={styles.statsSection}>
          <h3 className={styles.statsTitle}>Configuration Summary</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>Blog URL</div>
              <div className={styles.summaryValue}>{inputSummary.blogUrl}</div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>Story Title</div>
              <div className={styles.summaryValue}>
                {inputSummary.storyTitle}
              </div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>Internal Links</div>
              <div className={styles.summaryValue}>
                {inputSummary.totalLinks} links configured
              </div>
            </div>
            <div className={styles.summaryItem}>
              <div className={styles.summaryLabel}>Anchor Texts</div>
              <div className={styles.summaryValue}>
                {inputSummary.totalAnchorTexts} texts defined
              </div>
            </div>
          </div>
        </div>

        {/* 优化统计信息 */}
        <div className={styles.statsSection}>
          <h3 className={styles.statsTitle}>Optimization Summary</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {optimizationChanges.length}
              </div>
              <div className={styles.statLabel}>Total Suggestions</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{acceptedChanges.length}</div>
              <div className={styles.statLabel}>Accepted Changes</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {markdownContent?.length || 0}
              </div>
              <div className={styles.statLabel}>Content Paragraphs</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {Math.round(
                  (acceptedChanges.length /
                    Math.max(optimizationChanges.length, 1)) *
                    100
                )}
                %
              </div>
              <div className={styles.statLabel}>Acceptance Rate</div>
            </div>
          </div>
        </div>

        {/* 发布结果显示 */}
        {publishSuccess && (
          <div className={styles.successSection}>
            <div className={styles.successHeader}>
              <CheckCircle size={24} className={styles.successIcon} />
              <h3 className={styles.successTitle}>Published Successfully!</h3>
            </div>
            <p className={styles.successDescription}>
              Your optimized content has been published to Storyblok.
            </p>

            {publishResult?.previewLink && (
              <div className={styles.previewSection}>
                <label className={styles.previewLabel}>Preview Link:</label>
                <div className={styles.urlContainer}>
                  <div className={styles.urlDisplay}>
                    {publishResult.previewLink}
                  </div>
                  <div className={styles.linkActions}>
                    <Button
                      variant="ghost"
                      size="small"
                      icon={isCopied ? <Check size={14} /> : <Copy size={14} />}
                      onClick={handleCopyUrl}
                    >
                      {isCopied ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      icon={<ExternalLink size={14} />}
                      onClick={() =>
                        window.open(publishResult.previewLink, "_blank")
                      }
                    >
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {publishError && (
          <div className={styles.errorSection}>
            <h3 className={styles.errorTitle}>Publication Failed</h3>
            <div className={styles.errorMessage}>{publishError}</div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className={styles.actionSection}>
          <div className={styles.actionButtons}>
            <Button
              variant="primary"
              size="large"
              icon={
                isPublishing ? (
                  <Loader2 className={styles.iconSpin} size={16} />
                ) : (
                  <Upload size={16} />
                )
              }
              iconPosition="left"
              onClick={publishToStoryblok}
              disabled={
                isPublishing ||
                !finalOptimizedContent ||
                publishSuccess ||
                !allDecisionsComplete
              }
              loading={isPublishing}
            >
              {publishSuccess
                ? "Published to Storyblok"
                : "Publish to Storyblok"}
            </Button>

            <Button
              variant="outline"
              size="large"
              icon={<RotateCcw size={16} />}
              iconPosition="left"
              onClick={handleStartOver}
            >
              Start Over
            </Button>
          </div>
        </div>

        {/* 添加未完成决策时的提示 */}
        {!allDecisionsComplete && (
          <div className={styles.warningSection}>
            <p className={styles.warningText}>
              Please complete all optimization decisions before publishing. Go
              back to the Suggestions step to review remaining items.
            </p>
          </div>
        )}
      </div>

      {/* Start Over 确认弹窗 */}
      {showStartOverModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Start Over?</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalDescription}>
                You haven't published your optimized content yet. Starting over
                will clear all your current progress including:
              </p>
              <ul className={styles.modalList}>
                <li>• All optimization suggestions and decisions</li>
                <li>• Current blog content analysis</li>
                <li>• Link configuration settings</li>
              </ul>
              <p className={styles.modalWarning}>
                This action cannot be undone. Are you sure you want to continue?
              </p>
            </div>
            <div className={styles.modalFooter}>
              <Button
                variant="outline"
                onClick={() => setShowStartOverModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmStartOver}>
                Yes, Start Over
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
