import React, { useState } from "react";
import StoryblokBlogDisplay from "../../../components/storyblok-blog-display";
import { useInternalLinkOptimizerStore } from "../../../stores/internalLinkOptimizerStore";
import { ArrowRight, CheckCircle } from "lucide-react";
import type { OptimizationChange } from "./types";

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
    analysisProgress,
    optimizationChanges,
    optimizationStatus,
    updateOptimizationStatus,
  } = useInternalLinkOptimizerStore();

  // 判断是否正在分析（进度大于0且小于100）
  const isAnalyzing = analysisProgress > 0 && analysisProgress < 100;

  // 添加一些测试数据（当没有真实数据时）
  const testOptimizationChanges: OptimizationChange[] = [
    {
      index: 0,
      original: "ChatGPT was trained on a massive amount of data to function.",
      modified:
        "ChatGPT was trained on a **massive dataset of over 570GB** to function effectively, incorporating diverse text sources from books, articles, and web content.",
    },
    {
      index: 1,
      original:
        "OpenAI claims that they've fed ChatGPT audio to text with 300 billion words",
      modified:
        "OpenAI reports that they've trained ChatGPT using **advanced audio-to-text processing** with over **300 billion words** of diverse linguistic data, enabling sophisticated natural language understanding.",
    },
  ];

  // 使用真实数据或测试数据
  const currentOptimizationChanges =
    optimizationChanges.length > 0
      ? optimizationChanges
      : testOptimizationChanges;

  console.log("🔍 SuggestionsStep - storyData:", storyData);
  console.log(
    "🔍 SuggestionsStep - optimizationChanges from store:",
    optimizationChanges
  );
  console.log(
    "🔍 SuggestionsStep - currentOptimizationChanges:",
    currentOptimizationChanges
  );

  const handleAcceptOptimization = (index: number) => {
    updateOptimizationStatus(index, "accepted");
    console.log("Accepted optimization at index:", index);
  };

  const handleRejectOptimization = (index: number) => {
    updateOptimizationStatus(index, "rejected");
    console.log("Rejected optimization at index:", index);
  };

  const handleUndoOptimization = (index: number) => {
    updateOptimizationStatus(index, "undo");
    console.log("Undone optimization decision at index:", index);
  };

  // 导航到下一个待处理的建议
  const scrollToNextOptimization = () => {
    const pendingOptimizations = currentOptimizationChanges.filter(
      (change) =>
        !optimizationStatus[change.index] ||
        optimizationStatus[change.index] === "pending"
    );

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

  // 计算待处理的建议数量和进度
  const pendingCount = currentOptimizationChanges.filter(
    (change) =>
      !optimizationStatus[change.index] ||
      optimizationStatus[change.index] === "pending"
  ).length;

  const totalCount = currentOptimizationChanges.length;
  const completedCount = totalCount - pendingCount;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // 检查是否所有建议都已决策完毕
  const allDecisionsComplete = totalCount > 0 && pendingCount === 0;

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* 浮动导航面板 */}
      {totalCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px]">
            {/* 进度信息 */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>
                <span className="text-sm text-gray-500">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* 导航按钮 */}
            {pendingCount > 0 ? (
              <button
                onClick={scrollToNextOptimization}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                title="Jump to next pending suggestion"
              >
                <span className="text-sm">Next ({pendingCount})</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>
            ) : (
              <div className="text-center py-2">
                <div className="text-green-600 font-medium text-sm mb-1">
                  ✅ All Complete!
                </div>
                <div className="text-gray-500 text-xs">
                  All suggestions reviewed
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Storyblok Blog Display */}
      <div className="space-y-6">
        {storyData ? (
          <StoryblokBlogDisplay
            storyData={storyData}
            optimizationChanges={currentOptimizationChanges}
            optimizationStatus={optimizationStatus}
            onAcceptOptimization={handleAcceptOptimization}
            onRejectOptimization={handleRejectOptimization}
            onUndoOptimization={handleUndoOptimization}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-500">
              {isAnalyzing ? (
                <div className="space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p>Loading blog content...</p>
                  <p className="text-sm">Progress: {analysisProgress}%</p>
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
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-center">
              <div className="text-center max-w-md">
                {allDecisionsComplete ? (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                        <CheckCircle size={20} />
                        <span className="font-medium">
                          All suggestions reviewed!
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
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
                      className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <span>Proceed to Output</span>
                      <ArrowRight size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="text-gray-600 font-medium mb-2">
                        Please review all suggestions before proceeding
                      </p>
                      <p className="text-sm text-gray-500">
                        {pendingCount} suggestion{pendingCount !== 1 ? "s" : ""}{" "}
                        still pending review
                      </p>
                    </div>
                    <button
                      disabled
                      className="inline-flex items-center gap-3 bg-gray-300 text-gray-500 font-medium px-8 py-3 rounded-lg cursor-not-allowed"
                    >
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
