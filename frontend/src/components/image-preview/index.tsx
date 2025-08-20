"use client";

import React, { useState, useEffect, useRef } from "react";
import { ImageIcon, Link } from "lucide-react";
import styles from "./index.module.css";

export interface ImagePreviewProps {
  imageUrl?: string;
  altText?: string;
  aspectRatio?: number; // 宽高比，例如 16/9, 4/3, 1 等
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  fullWidth?: boolean; // 是否占满容器宽度
  onImageUrlChange?: (url: string) => void;
  onAltTextChange?: (alt: string) => void;
  onImageLoad?: (naturalWidth: number, naturalHeight: number) => void;
  className?: string;
  placeholder?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl = "",
  altText = "",
  aspectRatio,
  maxWidth = 600,
  maxHeight = 400,
  minWidth = 200,
  minHeight = 150,
  fullWidth = false,
  onImageUrlChange,
  onAltTextChange,
  onImageLoad,
  className,
  placeholder = "Enter image URL to preview the image here",
}) => {
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [currentAltText, setCurrentAltText] = useState(altText);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCurrentImageUrl(imageUrl);
  }, [imageUrl]);

  useEffect(() => {
    setCurrentAltText(altText);
  }, [altText]);

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCurrentImageUrl(url);
    onImageUrlChange?.(url);
    setImageError(false);
    setNaturalDimensions(null);
  };

  const handleAltTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const alt = e.target.value;
    setCurrentAltText(alt);
    onAltTextChange?.(alt);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setNaturalDimensions({ width: naturalWidth, height: naturalHeight });
      onImageLoad?.(naturalWidth, naturalHeight);
    }
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    setNaturalDimensions(null);
  };

  const handleImageLoadStart = () => {
    if (currentImageUrl) {
      setImageLoading(true);
    }
  };

  // 计算显示尺寸
  const getDisplayDimensions = () => {
    if (fullWidth) {
      // 全宽模式：宽度为100%，使用CSS aspect-ratio属性控制高度
      let targetRatio = aspectRatio;
      if (!targetRatio && naturalDimensions) {
        targetRatio = naturalDimensions.width / naturalDimensions.height;
      }
      
      return {
        width: "100%",
        aspectRatio: targetRatio,
        useAspectRatio: true,
      };
    }

    // 原有逻辑：固定尺寸模式
    if (!naturalDimensions && !aspectRatio) {
      return {
        width: maxWidth,
        height: maxHeight,
      };
    }

    let targetRatio = aspectRatio;
    if (!targetRatio && naturalDimensions) {
      targetRatio = naturalDimensions.width / naturalDimensions.height;
    }

    if (targetRatio) {
      const maxRatioWidth = maxHeight * targetRatio;
      const maxRatioHeight = maxWidth / targetRatio;

      if (maxRatioWidth <= maxWidth) {
        return {
          width: Math.max(maxRatioWidth, minWidth),
          height: Math.max(maxHeight, minHeight),
        };
      } else {
        return {
          width: Math.max(maxWidth, minWidth),
          height: Math.max(maxRatioHeight, minHeight),
        };
      }
    }

    return {
      width: maxWidth,
      height: maxHeight,
    };
  };

  const displayDimensions = getDisplayDimensions();

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {/* 图片预览区域 */}
      <div 
        className={`${styles.preview_area} ${fullWidth ? styles.preview_area_fullwidth : ""}`}
        style={{
          width: displayDimensions.width,
          height: displayDimensions.useAspectRatio ? undefined : displayDimensions.height,
          aspectRatio: displayDimensions.useAspectRatio ? displayDimensions.aspectRatio : undefined,
        }}
      >
        {currentImageUrl ? (
          <>
            {imageLoading && (
              <div className={styles.loading_state}>
                <div className={styles.loading_spinner} />
                <span>Loading...</span>
              </div>
            )}
            
            {imageError && (
              <div className={styles.error_state}>
                <ImageIcon size={48} />
                <span>Image failed to load</span>
                <small>Please check if the image URL is correct</small>
              </div>
            )}
            
            <img
              ref={imageRef}
              src={currentImageUrl}
              alt={currentAltText}
              className={`${styles.preview_image} ${
                imageLoading || imageError ? styles.hidden : ""
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onLoadStart={handleImageLoadStart}
            />
          </>
        ) : (
          <div className={styles.placeholder_state}>
            <div className={styles.placeholder_icon}>
              <ImageIcon size={48} />
            </div>
            <h3 className={styles.placeholder_title}>Image Preview</h3>
            <p className={styles.placeholder_text}>{placeholder}</p>
          </div>
        )}
      </div>

      {/* Controls Area */}
      <div className={styles.controls_area}>
        {/* Image URL Input */}
        <div className={styles.input_group}>
          <div className={styles.input_label}>
            <Link size={16} />
            <span>Image URL</span>
          </div>
          <input
            type="url"
            value={currentImageUrl}
            onChange={handleImageUrlChange}
            placeholder="https://example.com/image.jpg"
            className={styles.url_input}
          />
        </div>

        {/* Alt Text Input */}
        <div className={styles.input_group}>
          <div className={styles.input_label}>
            <span>Alternative Text (Alt)</span>
          </div>
          <textarea
            value={currentAltText}
            onChange={handleAltTextChange}
            placeholder="Describe image content for accessibility"
            className={styles.alt_textarea}
            rows={2}
          />
        </div>

        {/* Image Info */}
        {naturalDimensions && (
          <div className={styles.image_info}>
            <small>
              Original Size: {naturalDimensions.width} × {naturalDimensions.height}
              {aspectRatio && ` | Display Ratio: ${aspectRatio.toFixed(2)}`}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;