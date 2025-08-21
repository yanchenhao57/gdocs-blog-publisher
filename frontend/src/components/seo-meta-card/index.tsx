"use client";

import React from "react";
import styles from "./index.module.css";

export interface SeoMetaCardProps {
  /** SEO 标题 */
  title: string;
  /** SEO 描述 */
  description: string;
  /** Canonical URL */
  canonical?: string;
  /** 自定义类名 */
  className?: string;
  /** 是否可编辑 */
  editable?: boolean;
  /** 编辑事件回调 */
  onEdit?: (field: 'title' | 'description' | 'canonical', value: string) => void;
}

export default function SeoMetaCard({
  title,
  description,
  canonical,
  className,
  editable = false,
  onEdit,
}: SeoMetaCardProps) {
  // 计算字符数和限制
  const titleLength = title.length;
  const descriptionLength = description.length;
  const titleLimit = 60;
  const descriptionLimit = 160;

  // 获取字符数显示的颜色
  const getCountColor = (current: number, limit: number) => {
    const percentage = current / limit;
    if (percentage <= 0.8) return styles.countGood;
    if (percentage <= 0.95) return styles.countWarning;
    return styles.countDanger;
  };

  const handleFieldChange = (field: 'title' | 'description' | 'canonical', value: string) => {
    if (onEdit) {
      onEdit(field, value);
    }
  };

  return (
    <div className={`${styles.card} ${className || ""}`}>
      {/* 头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.icon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.745 3.745 0 0 1 3.296-1.043A3.745 3.745 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12z"/>
            </svg>
          </div>
          <span className={styles.title}>Meta</span>
        </div>
        
        {editable && (
          <button className={styles.editButton} title="编辑 SEO Meta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="m18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
      </div>

      {/* 内容区域 */}
      <div className={styles.content}>
        {/* SEO Title */}
        <div className={styles.field}>
          <div className={styles.fieldHeader}>
            <label className={styles.label}>Title</label>
            <span className={`${styles.count} ${getCountColor(titleLength, titleLimit)}`}>
              {titleLength}/{titleLimit}
            </span>
          </div>
          {editable ? (
            <input
              type="text"
              value={title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className={styles.input}
              placeholder="Enter SEO title"
              maxLength={100}
            />
          ) : (
            <div className={styles.value}>
              {title}
              <span className={styles.badge}>HTML</span>
            </div>
          )}
        </div>

        {/* SEO Description */}
        <div className={styles.field}>
          <div className={styles.fieldHeader}>
            <label className={styles.label}>Description</label>
            <span className={`${styles.count} ${getCountColor(descriptionLength, descriptionLimit)}`}>
              {descriptionLength}/{descriptionLimit}
            </span>
          </div>
          {editable ? (
            <textarea
              value={description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className={styles.textarea}
              placeholder="Enter SEO description"
              rows={3}
              maxLength={200}
            />
          ) : (
            <div className={styles.value}>
              {description}
              <span className={styles.badge}>HTML</span>
            </div>
          )}
        </div>

        {/* Canonical URL */}
        {canonical && (
          <div className={styles.field}>
            <div className={styles.fieldHeader}>
              <label className={styles.label}>Canonical</label>
            </div>
            {editable ? (
              <input
                type="url"
                value={canonical}
                onChange={(e) => handleFieldChange('canonical', e.target.value)}
                className={styles.input}
                placeholder="https://example.com/page"
              />
            ) : (
              <div className={styles.value}>
                <a 
                  href={canonical} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {canonical}
                </a>
                <span className={styles.badge}>URL</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEO 预览 */}
      <div className={styles.preview}>
        <div className={styles.previewHeader}>
          <span className={styles.previewLabel}>Google Preview</span>
        </div>
        <div className={styles.previewContent}>
          <div className={styles.previewTitle}>
            {title.length > titleLimit ? title.substring(0, titleLimit) + '...' : title}
          </div>
          <div className={styles.previewUrl}>
            {canonical || 'https://example.com/page'}
          </div>
          <div className={styles.previewDescription}>
            {description.length > descriptionLimit ? description.substring(0, descriptionLimit) + '...' : description}
          </div>
        </div>
      </div>
    </div>
  );
}
