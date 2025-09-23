import React, { useState, useMemo } from "react";
import { FileText, RotateCcw, Upload, Loader2, CheckCircle } from "lucide-react";
import { useInternalLinkOptimizerStore } from "../../../stores/internalLinkOptimizerStore";
import { render } from "storyblok-rich-text-react-renderer";
import { MarkdownConverter } from "../../../utils/markdownConverter";
import styles from "./OutputStep.module.css";

interface OutputStepProps {
  onStartOver: () => void;
}

export default function OutputStep({ onStartOver }: OutputStepProps) {
  const { 
    storyData, 
    optimizationChanges, 
    optimizationStatus,
    markdownContent 
  } = useInternalLinkOptimizerStore();

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // 计算接受的修改统计
  const acceptedChanges = useMemo(() => {
    return optimizationChanges.filter(change => 
      optimizationStatus[change.index] === "accepted"
    );
  }, [optimizationChanges, optimizationStatus]);

  // 生成最终优化的 Storyblok content JSON
  const finalOptimizedContent = useMemo(() => {
    if (!storyData || !storyData.content) return null;

    // 深拷贝原始的 storyData.content
    const optimizedContent = JSON.parse(JSON.stringify(storyData.content));
    
    // 如果没有接受的修改，直接返回原始内容
    if (acceptedChanges.length === 0) {
      return optimizedContent;
    }

    // 获取 body 中的 content 数组（paragraph 列表）
    if (!optimizedContent.body || !optimizedContent.body.content) {
      console.error('Invalid story content structure');
      return optimizedContent;
    }

    const paragraphs = optimizedContent.body.content;
    
    // 应用用户接受的修改
    acceptedChanges.forEach(change => {
      // change.index 对应 paragraph 在 content 数组中的位置
      if (change.index >= 0 && change.index < paragraphs.length) {
        const paragraph = paragraphs[change.index];
        
        // 确保是 paragraph 类型
        if (paragraph && paragraph.type === 'paragraph') {
          try {
            // 将修改后的 markdown 转换为 ProseMirror paragraph 节点
            const newParagraphNode = MarkdownConverter.markdownToParagraph(change.modified);
            if (newParagraphNode) {
              // 替换原始的 paragraph 内容
              paragraphs[change.index] = newParagraphNode;
            }
          } catch (error) {
            console.error(`Error converting modified content at index ${change.index}:`, error);
          }
        }
      }
    });
    
    return optimizedContent;
  }, [storyData, acceptedChanges]);

  // 渲染优化后的内容（仅用于预览，实际发布使用完整的 finalOptimizedContent）
  const renderedContent = useMemo(() => {
    if (!finalOptimizedContent || !finalOptimizedContent.body) return null;
    
    try {
      // 只渲染 body 部分用于预览
      return render(finalOptimizedContent.body);
    } catch (error) {
      console.error('Error rendering final content:', error);
      return <p>Error rendering optimized content</p>;
    }
  }, [finalOptimizedContent]);

  const handlePublishToStoryblok = async () => {
    if (!storyData || !finalOptimizedContent) return;

    setIsPublishing(true);
    setPublishError(null);

    try {
      // 这里需要调用发布到 Storyblok 的 API
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Publishing optimized Storyblok content:', {
        storyId: storyData.id,
        storyName: storyData.name,
        storySlug: storyData.slug,
        originalContent: storyData.content,
        optimizedContent: finalOptimizedContent,
        acceptedChanges: acceptedChanges.map(change => ({
          index: change.index,
          original: change.original,
          modified: change.modified
        })),
        acceptedChangesCount: acceptedChanges.length,
        totalSuggestions: optimizationChanges.length
      });

      setPublishSuccess(true);
    } catch (error) {
      console.error('Failed to publish to Storyblok:', error);
      setPublishError(error instanceof Error ? error.message : 'Publication failed');
    } finally {
      setIsPublishing(false);
    }
  };


  if (!storyData) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>No Content Available</h2>
          <p className={styles.subtitle}>Please complete the analysis process first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* 标题区域 */}
        <div className={styles.header}>
          <h2 className={styles.title}>Final Optimized Article</h2>
          <p className={styles.subtitle}>
            Your content has been optimized with {acceptedChanges.length} accepted improvements
          </p>
        </div>

        {/* 统计信息 */}
        <div className={styles.statsSection}>
          <h3 className={styles.statsTitle}>Optimization Summary</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{optimizationChanges.length}</div>
              <div className={styles.statLabel}>Total Suggestions</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{acceptedChanges.length}</div>
              <div className={styles.statLabel}>Accepted Changes</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{markdownContent?.length || 0}</div>
              <div className={styles.statLabel}>Content Paragraphs</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {Math.round((acceptedChanges.length / Math.max(optimizationChanges.length, 1)) * 100)}%
              </div>
              <div className={styles.statLabel}>Acceptance Rate</div>
            </div>
          </div>
        </div>

        {/* 优化内容展示 */}
        <div className={styles.contentSection}>
          <div className={styles.contentHeader}>
            <FileText className={styles.buttonIcon} size={16} />
            <span className={styles.contentHeaderText}>Optimized Storyblok Content JSON</span>
          </div>
          <div className={styles.contentBody}>
            <div className={styles.optimizedContent}>
              {finalOptimizedContent ? (
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontSize: '12px', 
                  lineHeight: '1.4',
                  backgroundColor: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '8px',
                  overflow: 'auto',
                  maxHeight: '400px'
                }}>
                  {JSON.stringify(finalOptimizedContent, null, 2)}
                </pre>
              ) : (
                <p>No optimized content available</p>
              )}
            </div>
          </div>
        </div>

        {/* 发布状态 */}
        {publishSuccess && (
          <div className={styles.statsSection} style={{ background: '#dcfce7', borderColor: '#bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} style={{ color: '#059669' }} />
              <span style={{ color: '#065f46', fontWeight: '500' }}>
                Successfully published to Storyblok!
              </span>
            </div>
          </div>
        )}

        {publishError && (
          <div className={styles.statsSection} style={{ background: '#fee2e2', borderColor: '#fca5a5' }}>
            <span style={{ color: '#991b1b' }}>
              ❌ Publication failed: {publishError}
            </span>
          </div>
        )}

        {/* 发布操作 */}
        <div className={styles.actionSection}>
          <h3 className={styles.actionTitle}>Publish to Storyblok</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handlePublishToStoryblok}
              disabled={isPublishing || !finalOptimizedContent || publishSuccess}
              className={`${styles.actionButton} ${styles.publishButton}`}
              style={{ minWidth: '200px' }}
            >
              {isPublishing ? (
                <div className={styles.loading}>
                  <Loader2 className={styles.iconSpin} size={16} />
                  <span className={styles.loadingText}>Publishing...</span>
                </div>
              ) : publishSuccess ? (
                <>
                  <CheckCircle className={styles.buttonIcon} size={16} />
                  Published to Storyblok
                </>
              ) : (
                <>
                  <Upload className={styles.buttonIcon} size={16} />
                  Publish to Storyblok
                </>
              )}
            </button>
          </div>
        </div>

        {/* 底部操作 */}
        <div className={styles.bottomActions}>
          <button onClick={onStartOver} className={styles.startOverButton}>
            <RotateCcw className={styles.buttonIcon} size={16} />
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
