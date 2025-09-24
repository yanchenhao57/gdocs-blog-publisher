import React, { useEffect, useState } from "react";
import StoryblokBlogDisplay from "../../../components/storyblok-blog-display";
import SuggestionsNavigationPanel from "../../../components/suggestions-navigation-panel";
import { useInternalLinkOptimizerStore } from "../../../stores/internalLinkOptimizerStore";
import { ArrowRight, CheckCircle } from "lucide-react";
import type { OptimizationChange } from "./types";
import styles from "./SuggestionsStep.module.css";

interface SuggestionsStepProps {
  /** Blog full_slugs 列表 */
  fullSlugs?: string[];
  /** 最大显示数量 */
  maxItems?: number;
  /** 跳转到下一步的回调 */
  onProceedToOutput?: () => void;
}

export default function SuggestionsStep({
  fullSlugs,
  maxItems,
  onProceedToOutput,
}: SuggestionsStepProps) {
  // 从 store 中获取数据
  const {
    storyData,
    isAnalyzing,
    optimizationChanges,
    optimizationStatus,
    updateOptimizationStatus,
  } = useInternalLinkOptimizerStore();

  // 用于追踪是否是用户操作触发的状态变化
  const [lastInteractionTime, setLastInteractionTime] = useState<number>(0);

  // 如果没有优化建议数据，不应该显示此组件
  if (optimizationChanges.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>
          No optimization suggestions available. Please go back to analysis.
        </p>
      </div>
    );
  }

  console.log("🔍 SuggestionsStep - storyData:", storyData);
  console.log(
    "🔍 SuggestionsStep - optimizationChanges from store:",
    optimizationChanges
  );

  const handleAcceptOptimization = (index: number) => {
    setLastInteractionTime(Date.now());
    updateOptimizationStatus(index, "accepted");
    console.log("Accepted optimization at index:", index);
  };

  const handleRejectOptimization = (index: number) => {
    setLastInteractionTime(Date.now());
    updateOptimizationStatus(index, "rejected");
    console.log("Rejected optimization at index:", index);
  };

  const handleUndoOptimization = (index: number) => {
    setLastInteractionTime(Date.now());
    updateOptimizationStatus(index, "undo");
    console.log("Undone optimization decision at index:", index);
  };

  // 计算待处理的建议数量和进度
  const pendingCount = optimizationChanges.filter(
    (change) =>
      !optimizationStatus[change.index] ||
      optimizationStatus[change.index] === "pending"
  ).length;

  const totalCount = optimizationChanges.length;
  const completedCount = totalCount - pendingCount;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // 监听 optimizationStatus 变化，自动滚动到下一个待决策项目
  useEffect(() => {
    // 只在用户交互后触发自动滚动（避免初始加载时的滚动）
    if (lastInteractionTime === 0) return;

    // 获取当前待处理的优化建议
    const pendingOptimizations = optimizationChanges.filter(
      (change) =>
        !optimizationStatus[change.index] ||
        optimizationStatus[change.index] === "pending"
    );

    const currentPendingCount = pendingOptimizations.length;

    // 如果有待处理项目，自动滚动到下一个
    if (currentPendingCount > 0) {
      const nextOptimization = pendingOptimizations.sort(
        (a, b) => a.index - b.index
      )[0];

      setTimeout(() => {
        const element = document.querySelector(
          `[data-optimization-index="${nextOptimization.index}"]`
        );

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300);
    } else if (totalCount > 0 && currentPendingCount === 0) {
      // 所有决策完成，滚动到下一步按钮
      setTimeout(() => {
        const proceedButton = document.querySelector("[data-proceed-button]");
        if (proceedButton) {
          proceedButton.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300);
    }
  }, [
    optimizationStatus,
    optimizationChanges,
    totalCount,
    lastInteractionTime,
  ]);

  // 导航到下一个待处理的建议
  const scrollToNextOptimization = () => {
    const pendingOptimizations = optimizationChanges
      .filter(
        (change) =>
          !optimizationStatus[change.index] ||
          optimizationStatus[change.index] === "pending"
      )
      .sort((a, b) => a.index - b.index);

    if (pendingOptimizations.length > 0) {
      const nextOptimization = pendingOptimizations[0];
      const element = document.querySelector(
        `[data-optimization-index="${nextOptimization.index}"]`
      );
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        // 添加高亮效果
        element.classList.add("optimization-highlight");
        setTimeout(() => {
          element.classList.remove("optimization-highlight");
        }, 2000);
      }
    }
  };

  // 检查是否所有建议都已决策完毕
  const allDecisionsComplete = totalCount > 0 && pendingCount === 0;

  useEffect(() => {
    setTimeout(() => {
      scrollToNextOptimization();
    }, 500);
  }, []);

  return (
    <div className={styles.container}>
      {/* 浮动导航面板 */}
      {/* <SuggestionsNavigationPanel
        totalCount={totalCount}
        completedCount={completedCount}
        pendingCount={pendingCount}
        progressPercentage={progressPercentage}
        optimizationChanges={optimizationChanges}
        optimizationStatus={optimizationStatus}
        onScrollToNext={scrollToNextOptimization}
      /> */}

      {/* Storyblok Blog Display */}
      <div className={styles.contentSection}>
        {storyData ? (
          <StoryblokBlogDisplay
            storyData={storyData}
            optimizationChanges={optimizationChanges}
            optimizationStatus={optimizationStatus}
            onAcceptOptimization={handleAcceptOptimization}
            onRejectOptimization={handleRejectOptimization}
            onUndoOptimization={handleUndoOptimization}
          />
        ) : (
          <div className={styles.loadingCard}>
            <div className={styles.loadingContent}>
              {isAnalyzing ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Loading blog content...</p>
                </div>
              ) : (
                <p>
                  No blog data available. Please analyze some content first.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 继续到输出步骤的按钮 */}
        {storyData && totalCount > 0 && (
          <div className={styles.actionSection}>
            <div className={styles.actionContainer}>
              <div className={styles.actionContent}>
                {allDecisionsComplete ? (
                  <>
                    <div className={styles.actionInfo}>
                      <div className={styles.completedMessage}>
                        <CheckCircle size={20} />
                        <span className={styles.completedMessageText}>
                          All suggestions reviewed!
                        </span>
                      </div>
                      <p className={styles.actionDescription}>
                        You've made decisions on all {totalCount} optimization
                        suggestions. Ready to proceed to the final output.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        console.log("🔄 Proceed to Output button clicked!");
                        console.log(
                          "🔍 onProceedToOutput function:",
                          onProceedToOutput
                        );
                        if (onProceedToOutput) {
                          onProceedToOutput();
                        } else {
                          console.error("❌ onProceedToOutput is not defined!");
                        }
                      }}
                      className={styles.proceedButton}
                      data-proceed-button
                    >
                      <span>Proceed to Output</span>
                      <ArrowRight size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className={styles.actionInfo}>
                      <p className={styles.pendingMessage}>
                        Please review all suggestions before proceeding
                      </p>
                      <p className={styles.pendingCount}>
                        {pendingCount} suggestion{pendingCount !== 1 ? "s" : ""}{" "}
                        still pending review
                      </p>
                    </div>
                    <button disabled className={styles.proceedButtonDisabled}>
                      <span>Proceed to Output</span>
                      <ArrowRight size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
