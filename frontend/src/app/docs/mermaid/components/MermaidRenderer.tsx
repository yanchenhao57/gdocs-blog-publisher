"use client";

import { useMermaidStore } from "@/stores/mermaidStore";
import { useEffect, useRef, useState } from "react";
import {
  initMermaid,
  renderMermaid,
  bindNodeClickEvents,
  highlightSelectedNode,
} from "@/utils/mermaidUtils";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, AlertTriangle, FileText } from "lucide-react";
import styles from "./index.module.css";

/**
 * Mermaid 渲染区域组件（中间面板）
 */
export const MermaidRenderer: React.FC = () => {
  const { mermaidCode, selectedNodeId, selectNode, projectHistory, currentProjectId } = useMermaidStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGElement | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 缩放和平移状态
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // 初始化 Mermaid
  useEffect(() => {
    initMermaid();
  }, []);

  // 渲染 Mermaid 图表
  useEffect(() => {
    if (!containerRef.current) return;

    const render = async () => {
      setIsRendering(true);
      setError(null);

      try {
        // 渲染图表
        const svg = await renderMermaid(mermaidCode, "main");

        // 更新 DOM
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;

          // 获取 SVG 元素
          const svgElement = containerRef.current.querySelector("svg");
          if (svgElement) {
            svgRef.current = svgElement;

            // 优化 SVG 渲染质量
            svgElement.setAttribute("shape-rendering", "geometricPrecision");
            svgElement.setAttribute("text-rendering", "geometricPrecision");

            // 获取原始尺寸
            const viewBox = svgElement.getAttribute("viewBox");
            if (viewBox) {
              const [, , width, height] = viewBox.split(" ").map(Number);
              // 设置更大的实际渲染尺寸以提高清晰度
              svgElement.setAttribute("width", String(width * 1.5));
              svgElement.setAttribute("height", String(height * 1.5));
            }

            // 移除可能导致模糊的 style 属性
            svgElement.style.maxWidth = "none";
            svgElement.style.height = "auto";

            // 确保文字和线条清晰
            svgElement.style.transformOrigin = "0 0";

            // 绑定点击事件
            bindNodeClickEvents(svgElement, (nodeId) => {
              selectNode(nodeId);
            });

            // 高亮选中的节点
            if (selectedNodeId) {
              highlightSelectedNode(svgElement, selectedNodeId);
            }
          }
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        // 静默失败：不设置错误状态，不显示错误信息
        // 注意：不清空容器，因为有些"错误"实际上图表已经渲染成功了
      } finally {
        setIsRendering(false);
      }
    };

    render();
  }, [mermaidCode]);

  // 更新高亮状态
  useEffect(() => {
    if (svgRef.current) {
      highlightSelectedNode(svgRef.current, selectedNodeId);
    }
  }, [selectedNodeId]);

  // 缩放控制函数
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 10)); // 最大 10x
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.1)); // 最小 0.1x (10%)
  };

  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleFitToScreen = () => {
    if (containerRef.current && svgRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const svgRect = svgRef.current.getBoundingClientRect();

      const scaleX = (containerRect.width * 0.9) / svgRect.width;
      const scaleY = (containerRect.height * 0.9) / svgRect.height;
      const newScale = Math.min(scaleX, scaleY, 2);

      setScale(newScale);
      setPosition({ x: 0, y: 0 });
    }
  };

  // 鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.02 : 0.02; // 进一步降低灵敏度：从 0.05 改为 0.02
      setScale((prev) => Math.max(0.1, Math.min(10, prev + delta)));
    }
  };

  // 拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // 左键
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  // 拖拽移动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  // 拖拽结束
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 防止拖拽时选中文本
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 获取当前项目名称
  const currentProject = projectHistory.find(p => p.id === currentProjectId);
  const projectName = currentProject?.name || '';

  return (
    <div className={styles.rendererPanel}>
      <div className={styles.panelHeader}>
        <h3>Diagram Preview</h3>
        {projectName && (
          <div className={styles.projectNameDisplay}>
            <FileText size={16} />
            <span>{projectName}</span>
          </div>
        )}
        <div className={styles.headerRight}>
          {selectedNodeId && (
            <span className={styles.selectedNodeBadge}>
              Selected: {selectedNodeId}
            </span>
          )}
          <span className={styles.zoomLevel}>{(scale * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div
        className={styles.rendererContainer}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {isRendering && (
          <div className={styles.renderingOverlay}>
            <div className={styles.spinner}></div>
            <p>Rendering diagram...</p>
          </div>
        )}

        {/* 错误提示已禁用 - 静默失败 */}
        {/* {error && (
          <div className={styles.errorMessage}>
            <h4>
              <AlertTriangle size={18} />
              Render Error
            </h4>
            <pre>{error}</pre>
          </div>
        )} */}

        {/* 视口容器（应用缩放和平移） */}
        <div
          ref={viewportRef}
          className={styles.viewport}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
        >
          <div ref={containerRef} className={styles.mermaidOutput}></div>
        </div>

        {/* 控制按钮 */}
        <div className={styles.controls}>
          <button
            onClick={handleZoomIn}
            className={styles.controlButton}
            title="Zoom In (Ctrl + Scroll)"
            disabled={scale >= 10}
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            className={styles.controlButton}
            title="Zoom Out (Ctrl + Scroll)"
            disabled={scale <= 0.1}
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleResetView}
            className={styles.controlButton}
            title="Reset View"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={handleFitToScreen}
            className={styles.controlButton}
            title="Fit to Screen"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
