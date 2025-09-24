"use client";

import React, { useEffect, useState } from "react";
import { render } from "storyblok-rich-text-react-renderer";
import { ImageIcon } from "lucide-react";
import type { ReactElement } from "react";
import styles from "./index.module.css";
import type {
  StoryblokBlogDisplayProps,
  BlogData,
  IBlogContent,
  IBlogStory,
  ISpecialH2Content,
  ISpecialH3Content,
  IAnchorContent,
} from "../../types/storyblok";
import SpecialH2 from "./components/special-h2";
import SpecialH3 from "./components/special-h3";
import ContentWithOptimizations from "./components/content-with-optimizations";
import type { OptimizationChange } from "../../app/internal-link-optimizer/modules/types";

// Re-export types for convenience
export type { StoryblokBlogDisplayProps } from "../../types/storyblok";

export default function StoryblokBlogDisplay({
  storyData,
  className,
  optimizationChanges = [],
  optimizationStatus = {},
  onAcceptOptimization = () => {},
  onRejectOptimization = () => {},
  onUndoOptimization = () => {},
}: StoryblokBlogDisplayProps) {
  const [blogData, setBlogData] = useState<BlogData | null>(null);

  useEffect(() => {
    if (!storyData) {
      setBlogData(null);
      return;
    }

    try {
      // Now we have proper typing for storyData
      const content = storyData.content;

      // Extract blog data from passed-in story data using correct IBlogContent structure
      const extractedData: BlogData = {
        title:
          content?.title || content?.heading_h1 || storyData.name || "Untitled",
        author: content?.author_id || "Unknown Author",
        readingTime: content?.reading_time || "5 mins",
        publishDate: formatDate(
          content?.date || storyData.published_at || storyData.created_at
        ),
        content: content?.body || [],
        excerpt: content?.description,
        coverImage: content?.cover?.filename,
        canonicalUrl: content?.canonical,
      };

      setBlogData(extractedData);
    } catch (err) {
      console.error("Error processing story data:", err);
      setBlogData(null);
    }
  }, [storyData]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown Date";
    }
  };

  const renderContent = (content: any) => {
    try {
      if (!content || (Array.isArray(content) && content.length === 0)) {
        return <p className={styles.noContent}>No content available</p>;
      }

      // Custom component resolver for Storyblok bloks
      const customResolvers = {
        "video embed code": ({ code }: any) => {
          const iframeReg = /^<iframe/;
          const tableCodeFlag = /<table.*?<\/table>/;

          if (iframeReg.test(code)) {
            return (
              <div className={styles.blogRichTextIframeWrapper}>
                <div className={styles.blogRichTextIframePlaceholder}></div>
                <div dangerouslySetInnerHTML={{ __html: code }} />
              </div>
            );
          } else if (tableCodeFlag.test(code)) {
            return (
              <div className={styles.contentTableWrapper}>
                <div dangerouslySetInnerHTML={{ __html: code }} />
              </div>
            );
          }
          return <div dangerouslySetInnerHTML={{ __html: code }} />;
        },
        large_cta: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>Large CTA Component</h4>
            <p>Component: large_cta</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
        small_cta: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>Small CTA Component</h4>
            <p>Component: small_cta</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
        Cta02: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>CTA 02 Component</h4>
            <p>Component: Cta02</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
        Cta03: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>CTA 03 Component</h4>
            <p>Component: Cta03</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
        Cta05: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>CTA 05 Component</h4>
            <p>Component: Cta05</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
        Cta06: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>CTA 06 Component</h4>
            <p>Component: Cta06</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
        Cta07: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>CTA 07 Component</h4>
            <p>Component: Cta07</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
        Cta08: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>CTA 08 Component</h4>
            <p>Component: Cta08</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
        Cta09: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>CTA 09 Component</h4>
            <p>Component: Cta09</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
        Cta10: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>CTA 10 Component</h4>
            <p>Component: Cta10</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
        blog_tips: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>Blog Tips Component</h4>
            <p>Component: blog_tips</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
        blog_shadow: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>Blog Shadow Component</h4>
            <p>Component: blog_shadow</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
        blog_cta_btn: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>Blog CTA Button Component</h4>
            <p>Component: blog_cta_btn</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
        special_h2: (props: Record<string, unknown>) => (
          <SpecialH2 data={props as unknown as ISpecialH2Content} />
        ),
        special_h3: (props: Record<string, unknown>) => (
          <SpecialH3 data={props as unknown as ISpecialH3Content} />
        ),
        anchor: (props: Record<string, unknown>) => {
          const anchorData = props as unknown as IAnchorContent;
          return (
            <a
              id={anchorData._uid}
              style={{ position: 'relative', top: '-75px' }}
            />
          );
        },
        showcase_blog_cta_1: (props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>Showcase Blog CTA 1 Component</h4>
            <p>Component: showcase_blog_cta_1</p>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
      };

      // Use storyblok-rich-text-react-renderer
      const renderedContent = render(content, {
        blokResolvers: customResolvers,
        defaultBlokResolver: (name: string, props: any) => (
          <div className={styles.placeholderBlock}>
            <h4>Unknown Component: {name}</h4>
            <pre>{JSON.stringify(props, null, 2)}</pre>
          </div>
        ),
      });

      // 如果有优化建议，使用特殊的内容渲染器
      if (optimizationChanges.length > 0) {
        console.log('🚀 StoryblokBlogDisplay - Using ContentWithOptimizations');
        console.log('📊 optimizationChanges:', optimizationChanges);
        console.log('📄 content:', content);
        
        return (
          <div className={styles.richtext}>
            <ContentWithOptimizations
              originalContent={content}
              optimizationChanges={optimizationChanges}
              optimizationStatus={optimizationStatus}
              onAcceptOptimization={onAcceptOptimization}
              onRejectOptimization={onRejectOptimization}
              onUndoOptimization={onUndoOptimization}
              customResolvers={customResolvers}
            />
          </div>
        );
      }

      return <div className={styles.richtext}>{renderedContent}</div>;
    } catch (err) {
      console.error("Error rendering content:", err);
      return <p className={styles.renderError}>Error rendering content</p>;
    }
  };

  if (!blogData) {
    return null;
  }

  return (
    <article className={`${styles.container} ${className || ""}`}>
      {/* Hero Section */}
      <header className={styles.heroSection}>
        {/* Cover Image */}
        <div className={styles.coverImageContainer}>
          {blogData.coverImage ? (
            <img
              src={blogData.coverImage}
              alt={blogData.title}
              className={styles.coverImage}
            />
          ) : (
            <div className={styles.coverImagePlaceholder}>
              <div className={styles.placeholderIcon}>
                <ImageIcon size={48} />
              </div>
              <h3 className={styles.placeholderTitle}>Cover Image</h3>
              <p className={styles.placeholderText}>
                No cover image available for this article
              </p>
            </div>
          )}
        </div>

        {/* Article Meta */}
        <div className={styles.articleMeta}>
          {/* Title */}
          <h1 className={styles.title}>{blogData.title}</h1>

          {/* Description */}
          {blogData.excerpt && (
            <p className={styles.description}>{blogData.excerpt}</p>
          )}

          {/* Article Info */}
          <div className={styles.articleInfo}>
            <div className={styles.metaLeft}>
              {blogData.author && <span>Author: {blogData.author}</span>}
              {blogData.readingTime && (
                <span>Reading time: {blogData.readingTime}</span>
              )}
            </div>
            {blogData.publishDate && (
              <time className={styles.publishDate}>
                Published on {blogData.publishDate}
              </time>
            )}
          </div>
        </div>
      </header>

      {/* Separator */}
      <div className={styles.separator}></div>

      {/* Article Content */}
      <div className={styles.content}>{renderContent(blogData.content)}</div>
    </article>
  );
}
