"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { usePrePublishCheck } from "../../hooks/usePrePublishCheck";
import styles from "./index.module.css";

export interface PrePublishCheckProps {
  /** Slug value */
  slug: string;
  /** Language */
  language: "en" | "ja";
  /** Custom class name */
  className?: string;
}

/**
 * Pre-publish check component
 * Automatically builds full_slug based on slug and language and checks if it already exists in Storyblok
 */
export default function PrePublishCheck({
  slug,
  language,
  className,
}: PrePublishCheckProps) {
  const { checkSlug, isChecking, lastCheckResult, clearResult } =
    usePrePublishCheck();

  // 用 ref 来追踪上次检查的 slug，避免重复检查
  const lastCheckedSlugRef = useRef<string>("");

  // Build full_slug based on language and slug
  const fullSlug = useMemo(() => {
    if (!slug.trim()) return "";
    const prefix = language === "en" ? "en/blog/" : "blog/";
    return `${prefix}${slug.trim()}`;
  }, [slug, language]);

  // Auto-check logic - 只有当 slug 真正发生变化时才检查
  useEffect(() => {
    if (!fullSlug) return;
    
    // 如果与上次检查的 slug 相同，则跳过检查
    if (lastCheckedSlugRef.current === fullSlug) return;
    
    // 如果正在检查中，则跳过新的检查
    if (isChecking) return;

    lastCheckedSlugRef.current = fullSlug;
    checkSlug(fullSlug);
  }, [fullSlug, checkSlug, isChecking]);

  // Don't display anything if there's no slug
  if (!slug.trim()) {
    return null;
  }

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {/* Header info */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.label}>URL Check</span>
          <span className={styles.fullSlug}>{fullSlug}</span>
        </div>
      </div>

      {/* Check status display */}
      {isChecking && (
        <div className={styles.checking}>
          <div className={styles.spinner}></div>
          <span>Checking if URL already exists...</span>
        </div>
      )}

      {/* Check result display */}
      {lastCheckResult && !isChecking && (
        <div className={styles.result}>
          {lastCheckResult.exists ? (
            <div className={styles.exists}>
              <div className={styles.statusIcon}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className={styles.statusContent}>
                <div className={styles.statusTitle}>URL Already Exists</div>
                <div className={styles.statusDescription}>
                  This URL is already in use in Storyblok:
                  <strong>{lastCheckResult.story?.name}</strong>
                </div>
                {lastCheckResult.story && (
                  <div className={styles.storyInfo}>
                    Story ID: {lastCheckResult.story.id}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.available}>
              <div className={styles.statusIcon}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className={styles.statusContent}>
                <div className={styles.statusTitle}>URL Available</div>
                <div className={styles.statusDescription}>
                  This URL is safe to use and won't cause conflicts
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
