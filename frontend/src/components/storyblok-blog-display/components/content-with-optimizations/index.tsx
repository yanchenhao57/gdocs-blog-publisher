import React, { useMemo } from 'react';
import { render } from 'storyblok-rich-text-react-renderer';
import OptimizationComparison from '../optimization-comparison';
import type { OptimizationChange } from '../../../../app/internal-link-optimizer/modules/types';

interface ContentWithOptimizationsProps {
  /** 原始的 richtext 内容 */
  originalContent: any;
  /** AI 优化建议 */
  optimizationChanges: OptimizationChange[];
  /** 优化状态映射 */
  optimizationStatus: Record<number, 'pending' | 'accepted' | 'rejected'>;
  /** 接受优化的回调 */
  onAcceptOptimization: (index: number) => void;
  /** 拒绝优化的回调 */
  onRejectOptimization: (index: number) => void;
  /** 撤销决策的回调 */
  onUndoOptimization: (index: number) => void;
  /** 自定义 blok 解析器 */
  customResolvers?: Record<string, any>;
}

const ContentWithOptimizations = ({
  originalContent,
  optimizationChanges,
  optimizationStatus,
  onAcceptOptimization,
  onRejectOptimization,
  onUndoOptimization,
  customResolvers = {}
}: ContentWithOptimizationsProps) => {
  
  // 将内容按段落分割并插入优化建议
  const enhancedContent = useMemo(() => {
    console.log('🔍 ContentWithOptimizations - originalContent:', originalContent);
    console.log('🔍 ContentWithOptimizations - optimizationChanges:', optimizationChanges);
    
    if (!originalContent || !Array.isArray(originalContent.content)) {
      console.log('❌ No valid originalContent structure');
      return [];
    }

    const result: React.ReactNode[] = [];
    const contentItems = originalContent.content;
    
    // 创建优化索引映射
    const optimizationMap = new Map();
    optimizationChanges.forEach(change => {
      optimizationMap.set(change.index, change);
    });
    
    console.log('🗺️ OptimizationMap:', optimizationMap);

    contentItems.forEach((item: any, index: number) => {
      // 渲染原始内容项
      const renderedItem = render({ 
        type: 'doc', 
        content: [item] 
      }, {
        blokResolvers: customResolvers
      });
      
      result.push(
        <div key={`content-${index}`}>
          {renderedItem}
        </div>
      );

      // 检查是否有对应的优化建议
      const optimization = optimizationMap.get(index);
      if (optimization) {
        result.push(
          <OptimizationComparison
            key={`optimization-${index}`}
            change={optimization}
            status={optimizationStatus[index] || 'pending'}
            onAccept={onAcceptOptimization}
            onReject={onRejectOptimization}
            onUndo={onUndoOptimization}
          />
        );
      }
    });

    return result;
  }, [
    originalContent, 
    optimizationChanges, 
    optimizationStatus, 
    onAcceptOptimization, 
    onRejectOptimization,
    onUndoOptimization,
    customResolvers
  ]);

  return (
    <div>
      {enhancedContent}
    </div>
  );
};

export default ContentWithOptimizations;
