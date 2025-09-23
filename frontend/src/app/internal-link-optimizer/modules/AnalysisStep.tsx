import React from "react";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Database,
  Brain,
} from "lucide-react";
import { useInternalLinkOptimizerStore } from "../../../stores/internalLinkOptimizerStore";
import styles from "./AnalysisStep.module.css";

interface AnalysisStepProps {
  analysisProgress: number;
}

// 分析阶段定义
type AnalysisPhase = "storyblok" | "ai" | "completed";

export default function AnalysisStep({ analysisProgress }: AnalysisStepProps) {
  const {
    error,
    storyData,
    optimizationChanges,
    storyblokProgress,
    aiProgress,
    startAnalysis,
    retryStoryblokFetch,
    retryAIAnalysis,
  } = useInternalLinkOptimizerStore();

  // 根据进度和数据状态确定当前阶段
  const getCurrentPhase = (): AnalysisPhase => {
    if (optimizationChanges.length > 0) return "completed";
    if (storyData && analysisProgress >= 50) return "ai";
    return "storyblok";
  };

  const currentPhase = getCurrentPhase();

  // 计算各阶段的状态
  const getPhaseStatus = (phase: AnalysisPhase) => {
    if (error) return "error";

    switch (phase) {
      case "storyblok":
        if (storyData) return "completed";
        if (currentPhase === "storyblok") return "loading";
        return "pending";
      case "ai":
        if (optimizationChanges.length > 0) return "completed";
        if (currentPhase === "ai") return "loading";
        if (storyData) return "pending";
        return "disabled";
      case "completed":
        return optimizationChanges.length > 0 ? "completed" : "pending";
      default:
        return "pending";
    }
  };

  const handleStoryblokRetry = () => {
    retryStoryblokFetch();
  };

  const handleAIRetry = () => {
    retryAIAnalysis();
  };

  const handleGeneralRetry = () => {
    startAnalysis();
  };

  // 直接使用独立的进度状态
  const getStoryblokProgress = () => storyblokProgress;
  const getAIProgress = () => aiProgress;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Content Analysis in Progress</h2>
        <p className={styles.subtitle}>
          Analyzing your blog content to generate optimization suggestions
        </p>
      </div>

      {/* 整体进度条 */}
      <div className={styles.overallProgress}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Overall Progress</span>
          <span className={styles.progressValue}>{analysisProgress}%</span>
        </div>
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${analysisProgress}%` }}
          />
        </div>
      </div>

      {/* 分析阶段 */}
      <div className={styles.phases}>
        {/* 阶段1: 获取 Storyblok 数据 */}
        <div className={styles.phaseCard}>
          <div className={styles.phaseHeader}>
            <div className={styles.phaseInfo}>
              <div
                className={`${styles.phaseIcon} ${
                  getPhaseStatus("storyblok") === "completed"
                    ? styles.phaseIconCompleted
                    : getPhaseStatus("storyblok") === "loading"
                    ? styles.phaseIconLoading
                    : getPhaseStatus("storyblok") === "error"
                    ? styles.phaseIconError
                    : styles.phaseIconPending
                }`}
              >
                {getPhaseStatus("storyblok") === "completed" ? (
                  <CheckCircle className={styles.iconGreen} size={20} />
                ) : getPhaseStatus("storyblok") === "loading" ? (
                  <Loader2
                    className={`${styles.iconBlue} ${styles.iconSpin}`}
                    size={20}
                  />
                ) : getPhaseStatus("storyblok") === "error" ? (
                  <AlertCircle className={styles.iconRed} size={20} />
                ) : (
                  <Database className={styles.iconGray} size={20} />
                )}
              </div>
              <div className={styles.phaseContent}>
                <h3 className={styles.phaseTitle}>
                  Step 1: Fetch Storyblok Data
                </h3>
                <p className={styles.phaseDescription}>
                  Retrieving blog content from Storyblok CMS
                </p>
              </div>
            </div>

            {getPhaseStatus("storyblok") === "error" && (
              <button
                onClick={handleStoryblokRetry}
                className={styles.retryButton}
              >
                <RefreshCw size={16} />
                Retry Fetch
              </button>
            )}
            {getPhaseStatus("storyblok") === "completed" &&
              !optimizationChanges.length &&
              getPhaseStatus("ai") !== "loading" && (
                <button
                  onClick={handleGeneralRetry}
                  className={styles.retryButton}
                >
                  <RefreshCw size={16} />
                  Restart Analysis
                </button>
              )}
          </div>

          {/* Storyblok 阶段进度条 */}
          {(getPhaseStatus("storyblok") === "loading" ||
            getPhaseStatus("storyblok") === "completed") && (
            <div className={styles.phaseProgressContainer}>
              <div className={styles.phaseProgressBar}>
                <div
                  className={`${styles.phaseProgressFill} ${styles.phaseProgressBlue}`}
                  style={{ width: `${getStoryblokProgress()}%` }}
                />
              </div>
            </div>
          )}

          {/* 状态信息 */}
          <div className={styles.statusMessage}>
            {getPhaseStatus("storyblok") === "completed" && storyData && (
              <div className={styles.statusMessageCompleted}>
                ✅ Successfully fetched blog data: "{storyData.name}"
              </div>
            )}
            {getPhaseStatus("storyblok") === "loading" && (
              <div className={styles.statusMessageLoading}>
                🔄 Connecting to Storyblok API...
              </div>
            )}
            {getPhaseStatus("storyblok") === "error" && error && (
              <div className={styles.statusMessageError}>❌ {error}</div>
            )}
          </div>
        </div>

        {/* 阶段2: AI 分析 */}
        <div
          className={`${styles.phaseCard} ${
            getPhaseStatus("ai") === "disabled" ? styles.phaseCardDisabled : ""
          }`}
        >
          <div className={styles.phaseHeader}>
            <div className={styles.phaseInfo}>
              <div
                className={`${styles.phaseIcon} ${
                  getPhaseStatus("ai") === "completed"
                    ? styles.phaseIconCompleted
                    : getPhaseStatus("ai") === "loading"
                    ? styles.phaseIconLoading
                    : getPhaseStatus("ai") === "error"
                    ? styles.phaseIconError
                    : styles.phaseIconPending
                }`}
              >
                {getPhaseStatus("ai") === "completed" ? (
                  <CheckCircle className={styles.iconGreen} size={20} />
                ) : getPhaseStatus("ai") === "loading" ? (
                  <Loader2
                    className={`${styles.iconBlue} ${styles.iconSpin}`}
                    size={20}
                  />
                ) : getPhaseStatus("ai") === "error" ? (
                  <AlertCircle className={styles.iconRed} size={20} />
                ) : (
                  <Brain className={styles.iconGray} size={20} />
                )}
              </div>
              <div className={styles.phaseContent}>
                <h3 className={styles.phaseTitle}>
                  Step 2: AI Content Analysis
                </h3>
                <p className={styles.phaseDescription}>
                  Generating optimization suggestions using AI
                </p>
              </div>
            </div>

            {getPhaseStatus("ai") === "error" && (
              <button onClick={handleAIRetry} className={styles.retryButton}>
                <RefreshCw size={16} />
                Retry AI Analysis
              </button>
            )}
          </div>

          {/* AI 阶段进度条 */}
          {(getPhaseStatus("ai") === "loading" ||
            getPhaseStatus("ai") === "completed") && (
            <div className={styles.phaseProgressContainer}>
              <div className={styles.phaseProgressBar}>
                <div
                  className={`${styles.phaseProgressFill} ${styles.phaseProgressPurple}`}
                  style={{ width: `${getAIProgress()}%` }}
                />
              </div>
            </div>
          )}

          {/* 状态信息 */}
          <div className={styles.statusMessage}>
            {getPhaseStatus("ai") === "completed" &&
              optimizationChanges.length > 0 && (
                <div className={styles.statusMessageCompleted}>
                  ✅ Generated {optimizationChanges.length} optimization
                  suggestions
                </div>
              )}
            {getPhaseStatus("ai") === "loading" && (
              <div className={styles.statusMessageLoadingPurple}>
                🤖 AI is analyzing content and generating suggestions...
              </div>
            )}
            {getPhaseStatus("ai") === "pending" &&
              getPhaseStatus("storyblok") === "completed" && (
                <div className={styles.statusMessagePending}>
                  ⏳ Waiting for content analysis to begin...
                </div>
              )}
            {getPhaseStatus("ai") === "disabled" && (
              <div className={styles.statusMessageDisabled}>
                ⏸️ Waiting for Storyblok data to be fetched first
              </div>
            )}
            {getPhaseStatus("ai") === "error" && error && (
              <div className={styles.statusMessageError}>
                ❌ AI analysis failed: {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 完成状态 */}
      {optimizationChanges.length > 0 && (
        <div className={styles.completionContainer}>
          <div className={styles.completionBadge}>
            <CheckCircle size={20} />
            Analysis Complete! {optimizationChanges.length} suggestions ready
            for review.
          </div>
        </div>
      )}
    </div>
  );
}
