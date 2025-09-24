import React, { useState, useEffect, useRef } from "react";
import { Triangle } from "lucide-react";
import styles from "./index.module.css";

interface SuggestionsNavigationPanelProps {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  progressPercentage: number;
  optimizationChanges: any[];
  optimizationStatus: Record<number, string>;
  onScrollToNext: () => void;
}

export default function SuggestionsNavigationPanel({
  totalCount,
  completedCount,
  pendingCount,
  progressPercentage,
  optimizationChanges,
  optimizationStatus,
  onScrollToNext,
}: SuggestionsNavigationPanelProps) {
  const [upCount, setUpCount] = useState(0);
  const [downCount, setDownCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  if (totalCount === 0) return null;

  useEffect(() => {
    const updateCounts = () => {
      // 获取所有待处理的优化建议
      const pendingOptimizations = optimizationChanges.filter(
        (change) =>
          !optimizationStatus[change.index] ||
          optimizationStatus[change.index] === "pending"
      );

      const cards = Array.from(
        document.querySelectorAll("[data-optimization-index]")
      );
      const viewportHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      const viewportCenter = scrollTop + viewportHeight / 2;

      let above = 0;
      let below = 0;

      cards.forEach((card) => {
        const optimizationIndex = card.getAttribute("data-optimization-index");
        const isPending = pendingOptimizations.some(
          (change) => change.index.toString() === optimizationIndex
        );

        if (isPending) {
          const rect = card.getBoundingClientRect();
          const cardCenter = scrollTop + rect.top + rect.height / 2;

          if (cardCenter < viewportCenter) {
            above++;
          } else if (cardCenter > viewportCenter) {
            below++;
          }
        }
      });

      setUpCount(above);
      setDownCount(below);
    };

    updateCounts();
    window.addEventListener("scroll", updateCounts);
    window.addEventListener("resize", updateCounts);

    return () => {
      window.removeEventListener("scroll", updateCounts);
      window.removeEventListener("resize", updateCounts);
    };
  }, [optimizationChanges, optimizationStatus]);

  const scrollToNext = (direction: "up" | "down") => {
    const pendingOptimizations = optimizationChanges.filter(
      (change) =>
        !optimizationStatus[change.index] ||
        optimizationStatus[change.index] === "pending"
    );

    const cards = Array.from(
      document.querySelectorAll("[data-optimization-index]")
    );
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;
    const viewportCenter = scrollTop + viewportHeight / 2;

    let targetCard: Element | null = null;

    if (direction === "up") {
      // Find the nearest pending card above the viewport center
      for (let i = cards.length - 1; i >= 0; i--) {
        const card = cards[i];
        const optimizationIndex = card.getAttribute("data-optimization-index");
        const isPending = pendingOptimizations.some(
          (change) => change.index.toString() === optimizationIndex
        );

        if (isPending) {
          const rect = card.getBoundingClientRect();
          const cardCenter = scrollTop + rect.top + rect.height / 2;

          if (cardCenter < viewportCenter) {
            targetCard = card;
            break;
          }
        }
      }
    } else {
      // Find the nearest pending card below the viewport center
      for (const card of cards) {
        const optimizationIndex = card.getAttribute("data-optimization-index");
        const isPending = pendingOptimizations.some(
          (change) => change.index.toString() === optimizationIndex
        );

        if (isPending) {
          const rect = card.getBoundingClientRect();
          const cardCenter = scrollTop + rect.top + rect.height / 2;

          if (cardCenter > viewportCenter) {
            targetCard = card;
            break;
          }
        }
      }
    }

    if (targetCard) {
      targetCard.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  if (pendingCount === 0) {
    return null; // 所有决策都完成时隐藏导航
  }

  return (
    <div ref={containerRef} className={styles.container}>
      {/* 向上按钮 */}
      {upCount > 0 && (
        <button
          onClick={() => scrollToNext("up")}
          className={styles.navButton}
          title={`${upCount} pending above`}
        >
          <div className={styles.upTriangle}>
            <Triangle size={28} />
          </div>
          <span className={styles.count}>{upCount > 99 ? "99" : upCount}</span>
        </button>
      )}

      {/* 向下按钮 */}
      {downCount > 0 && (
        <button
          onClick={() => scrollToNext("down")}
          className={styles.navButton}
          title={`${downCount} pending below`}
        >
          <div className={styles.downTriangle}>
            <Triangle size={28} />
          </div>
          <span className={styles.count}>{downCount > 99 ? "99" : downCount}</span>
        </button>
      )}
    </div>
  );
}
