import React from "react";
import { CheckCircle } from "lucide-react";
import styles from "./index.module.css";

interface SuggestionsNavigationPanelProps {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  progressPercentage: number;
  onScrollToNext: () => void;
}

export default function SuggestionsNavigationPanel({
  totalCount,
  completedCount,
  pendingCount,
  progressPercentage,
  onScrollToNext,
}: SuggestionsNavigationPanelProps) {
  if (totalCount === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        {/* 进度信息 */}
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Progress</span>
            <span className={styles.progressCount}>
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* 导航按钮 */}
        {pendingCount > 0 ? (
          <button
            onClick={onScrollToNext}
            className={styles.nextButton}
            title="Jump to next pending suggestion"
          >
            <span className={styles.nextButtonText}>Next ({pendingCount})</span>
            <svg
              className={styles.nextButtonIcon}
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
          <div className={styles.completedSection}>
            <div className={styles.completedText}>
              <CheckCircle size={16} className={styles.completedIcon} />
              All Complete!
            </div>
            <div className={styles.completedSubtext}>
              All suggestions reviewed
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
