"use client";

import { useMermaidStore, mermaidSelectors } from "@/stores/mermaidStore";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  X,
  Image,
  Link2,
  Check,
  Clock,
} from "lucide-react";
import styles from "./index.module.css";

interface NodeDocEditorProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * 节点文档编辑器组件（右侧面板）
 */
export const NodeDocEditor: React.FC<NodeDocEditorProps> = ({
  isCollapsed,
  onToggleCollapse,
}) => {
  const { selectedNodeId, updateNodeDoc, deleteNodeDoc, hasUnsavedChanges, lastSavedAt } =
    useMermaidStore();

  const selectedDoc = useMermaidStore((state) =>
    mermaidSelectors.getSelectedNodeDoc(state)
  );

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localContent, setLocalContent] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });
  const isEditingRef = useRef(false); // 标记是否正在编辑
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 格式状态
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // 图片预览状态
  const [imagePreview, setImagePreview] = useState<{ show: boolean; src: string }>({
    show: false,
    src: "",
  });

  // 同步选中文档的内容（仅在切换节点时）
  useEffect(() => {
    // 清理之前的防抖定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    // 重置编辑标志
    isEditingRef.current = false;

    if (selectedDoc) {
      const newContent = selectedDoc.content;
      // 只有在内容真正变化时才更新 DOM
      if (editorRef.current && editorRef.current.innerHTML !== newContent) {
        setLocalContent(newContent);
        editorRef.current.innerHTML = newContent;
      }
    } else {
      setLocalContent("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }
  }, [selectedDoc, selectedNodeId]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 更新格式状态
  const updateFormatState = () => {
    try {
      setFormatState({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    } catch (error) {
      // queryCommandState 可能在某些情况下失败
      console.debug("Failed to query command state:", error);
    }
  };

  // 监听选区变化和输入，更新格式状态
  useEffect(() => {
    const handleSelectionChange = () => {
      if (editorRef.current && document.activeElement === editorRef.current) {
        updateFormatState();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  // 关闭图片预览
  const closeImagePreview = () => {
    setImagePreview({ show: false, src: "" });
  };

  // ESC键关闭图片预览
  useEffect(() => {
    if (!imagePreview.show) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeImagePreview();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [imagePreview.show]);

  // 处理内容变化
  const handleInput = () => {
    if (editorRef.current && selectedNodeId) {
      const content = editorRef.current.innerHTML;
      setLocalContent(content);
      isEditingRef.current = true;

      // 更新格式状态
      updateFormatState();

      // 清除之前的防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // 使用防抖更新 store，避免频繁触发状态更新
      debounceTimerRef.current = setTimeout(() => {
        updateNodeDoc(selectedNodeId, content);
        isEditingRef.current = false;
      }, 300);
    }
  };

  // 删除文档
  const handleDelete = () => {
    if (selectedNodeId) {
      setDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedNodeId) {
      // 清理防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      isEditingRef.current = false;
      
      deleteNodeDoc(selectedNodeId);
    }
    setDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(false);
  };

  // 格式化按钮
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    
    // 格式化后手动触发 input 事件，更新状态
    handleInput();
  };

  // 打开图片上传
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 处理本地图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      setErrorModal({ show: true, message: "Please select an image file" });
      return;
    }

    // 检查文件大小（限制为 5MB）
    if (file.size > 5 * 1024 * 1024) {
      setErrorModal({ show: true, message: "Image size should be less than 5MB" });
      return;
    }

    // 转换为 base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      insertImageToEditor(base64);
    };
    reader.readAsDataURL(file);

    // 清空 input，允许重复选择同一文件
    e.target.value = "";
  };

  // 显示 URL 输入框
  const handleImageUrlClick = () => {
    setShowImageModal(true);
    setImageUrl("");
  };

  // 通过 URL 插入图片
  const handleInsertImageUrl = () => {
    if (!imageUrl.trim()) {
      setErrorModal({ show: true, message: "Please enter an image URL" });
      return;
    }

    // 简单的 URL 验证
    try {
      new URL(imageUrl);
    } catch {
      setErrorModal({ show: true, message: "Please enter a valid URL" });
      return;
    }

    insertImageToEditor(imageUrl);
    setShowImageModal(false);
    setImageUrl("");
  };

  // 插入图片到编辑器
  const insertImageToEditor = (src: string) => {
    if (!editorRef.current) return;

    // 创建 img 元素
    const img = document.createElement("img");
    img.src = src;
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.margin = "8px 0";
    img.style.borderRadius = "4px";

    // 获取当前选区
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // 确保选区在编辑器内
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(img);
        
        // 移动光标到图片后面
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // 如果没有选区或选区不在编辑器内，追加到末尾
        editorRef.current.appendChild(img);
      }
    } else {
      // 没有选区时追加到末尾
      editorRef.current.appendChild(img);
    }

    // 触发更新
    handleInput();
    editorRef.current?.focus();
  };

  if (!selectedNodeId) {
    return (
      <div
        className={`${styles.editorPanel} ${
          isCollapsed ? styles.collapsed : ""
        }`}
      >
        {isCollapsed ? (
          <div className={styles.collapsedPanel}>
            <button
              onClick={onToggleCollapse}
              className={styles.expandButton}
              title="Expand Node Editor"
            >
              <ChevronLeft size={18} className={styles.expandIcon} />
              <span className={styles.expandText}>Docs</span>
            </button>
          </div>
        ) : (
          <>
            <div className={styles.panelHeader}>
              <h3>Node Documentation</h3>
              <button
                onClick={onToggleCollapse}
                className={styles.collapseButton}
                title="Collapse Editor"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className={styles.emptyState}>
              <p>← Select a node from the diagram to edit its documentation</p>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${styles.editorPanel} ${
        isCollapsed ? styles.collapsed : ""
      }`}
    >
      {isCollapsed ? (
        <div className={styles.collapsedPanel}>
          <button
            onClick={onToggleCollapse}
            className={styles.expandButton}
            title="Expand Node Editor"
          >
            <ChevronLeft size={18} className={styles.expandIcon} />
            <span className={styles.expandText}>Docs</span>
          </button>
        </div>
      ) : (
        <>
          <div className={styles.panelHeader}>
            <div className={styles.nodeTitle}>
              <span className={styles.nodeLabel}>Editing Node:</span>
              <span className={styles.nodeId}>{selectedNodeId}</span>
            </div>
            <div className={styles.headerActions}>
              <button
                onClick={handleDelete}
                className={styles.deleteButton}
                title="Delete documentation"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={onToggleCollapse}
                className={styles.collapseButton}
                title="Collapse Editor"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

      <div className={styles.toolbar}>
        <button
          onClick={() => applyFormat("bold")}
          className={`${styles.toolbarButton} ${formatState.bold ? styles.active : ""}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => applyFormat("italic")}
          className={`${styles.toolbarButton} ${formatState.italic ? styles.active : ""}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => applyFormat("underline")}
          className={`${styles.toolbarButton} ${formatState.underline ? styles.active : ""}`}
          title="Underline"
        >
          <Underline size={16} />
        </button>
        <div className={styles.toolbarDivider}></div>
        <button
          onClick={() => applyFormat("insertUnorderedList")}
          className={styles.toolbarButton}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => applyFormat("insertOrderedList")}
          className={styles.toolbarButton}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        <div className={styles.toolbarDivider}></div>
        <button
          onClick={() => applyFormat("formatBlock", "h3")}
          className={styles.toolbarButton}
          title="Heading"
        >
          <Heading2 size={16} />
        </button>
        <div className={styles.toolbarDivider}></div>
        <button
          onClick={handleImageUploadClick}
          className={styles.toolbarButton}
          title="Upload Image"
        >
          <Image size={16} />
        </button>
        <button
          onClick={handleImageUrlClick}
          className={styles.toolbarButton}
          title="Insert Image URL"
        >
          <Link2 size={16} />
        </button>
        <div className={styles.toolbarDivider}></div>
        <button
          onClick={() => applyFormat("removeFormat")}
          className={styles.toolbarButton}
          title="Clear Format"
        >
          <X size={16} />
        </button>
      </div>

      {/* 隐藏的文件上传 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />

      <div
        ref={editorRef}
        className={styles.contentEditor}
        contentEditable
        onInput={handleInput}
        onFocus={updateFormatState}
        onDoubleClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === "IMG") {
            e.preventDefault();
            const img = target as HTMLImageElement;
            setImagePreview({
              show: true,
              src: img.src,
            });
          }
        }}
        suppressContentEditableWarning
        data-placeholder="Enter documentation for this node..."
      ></div>

      {/* 图片 URL 输入模态框 */}
      {showImageModal && (
        <div className={styles.imageModal}>
          <div className={styles.imageModalContent}>
            <h4>Insert Image URL</h4>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={styles.imageUrlInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleInsertImageUrl();
                } else if (e.key === "Escape") {
                  setShowImageModal(false);
                }
              }}
              autoFocus
            />
            <div className={styles.imageModalButtons}>
              <button
                onClick={handleInsertImageUrl}
                className={styles.imageModalButton}
              >
                Insert
              </button>
              <button
                onClick={() => setShowImageModal(false)}
                className={styles.imageModalButtonCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={handleCancelDelete}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Documentation</h3>
            <div className={styles.modalContent}>
              <p>Are you sure you want to delete documentation for node:</p>
              <p className={styles.nodeIdHighlight}>"{selectedNodeId}"</p>
              <p className={styles.warningText}>This action cannot be undone.</p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={handleCancelDelete}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                className={styles.deleteButtonModal}
                onClick={handleConfirmDelete}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 错误提示对话框 */}
      {errorModal.show && (
        <div className={styles.modalOverlay} onClick={() => setErrorModal({ show: false, message: "" })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Error</h3>
            <div className={styles.modalContent}>
              <p>{errorModal.message}</p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.confirmButton}
                onClick={() => setErrorModal({ show: false, message: "" })}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 图片预览模态框 */}
      {imagePreview.show && (
        <div className={styles.imagePreviewOverlay} onClick={closeImagePreview}>
          <div className={styles.imagePreviewContainer}>
            <button
              className={styles.imagePreviewClose}
              onClick={closeImagePreview}
              title="Close (ESC)"
            >
              <X size={24} />
            </button>
            <img
              src={imagePreview.src}
              alt="Preview"
              className={styles.imagePreviewContent}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

          <div className={styles.panelFooter}>
            <div className={styles.saveStatus}>
              {hasUnsavedChanges ? (
                <>
                  <Clock size={14} className={styles.saveIcon} />
                  <span className={styles.saveText}>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} className={styles.saveIcon} />
                  <span className={styles.saveText}>All changes saved</span>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

