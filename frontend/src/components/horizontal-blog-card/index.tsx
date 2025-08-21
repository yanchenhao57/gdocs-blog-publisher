"use client";

import React from "react";
import styles from "./index.module.css";

export interface HorizontalBlogCardProps {
  /** 博客文章标题 */
  title: string;
  /** 博客文章描述 */
  description: string;
  /** 作者姓名 */
  author: string;
  /** 阅读时间 */
  readingTime: string;
  /** 发布日期 */
  publishDate: string;
  /** 分类标签 */
  category?: string;
  /** 封面图片URL */
  coverImage?: string;
  /** 点击事件 */
  onClick?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 是否显示外部链接图标 */
  showExternalIcon?: boolean;
  /** 图片位置 */
  imagePosition?: "left" | "right";
}

export default function HorizontalBlogCard({
  title,
  description,
  author,
  readingTime,
  publishDate,
  category,
  coverImage,
  onClick,
  className,
  showExternalIcon = false,
  imagePosition = "left",
}: HorizontalBlogCardProps) {
  const cardContent = (
    <>
      {/* 图片区域 */}
      <div className={styles.imageContainer}>
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title}
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              className={styles.placeholderIcon}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
        )}
        {showExternalIcon && (
          <div className={styles.externalIcon}>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M7 17L17 7"/>
              <path d="M7 7h10v10"/>
            </svg>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className={styles.content}>
        {/* 作者和阅读时间 */}
        <div className={styles.meta}>
          <span className={styles.author}>{author}</span>
          <span className={styles.separator}>•</span>
          <span className={styles.readingTime}>{readingTime}</span>
        </div>

        {/* 标题 */}
        <h3 className={styles.title}>
          {title}
          {showExternalIcon && (
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={styles.titleIcon}
            >
              <path d="M7 17L17 7"/>
              <path d="M7 7h10v10"/>
            </svg>
          )}
        </h3>

        {/* 描述 */}
        <p className={styles.description}>
          {description}
        </p>

        {/* 底部信息 */}
        <div className={styles.footer}>
          {category && (
            <span className={styles.category}>{category}</span>
          )}
          <span className={styles.date}>{publishDate}</span>
        </div>
      </div>
    </>
  );

  return (
    <div 
      className={`${styles.card} ${imagePosition === "right" ? styles.imageRight : ""} ${className || ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {cardContent}
    </div>
  );
}
