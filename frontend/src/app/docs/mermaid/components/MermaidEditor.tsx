"use client";

import { useMermaidStore } from "@/stores/mermaidStore";
import { useState, useEffect } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import { ChevronRight, ChevronLeft, Info } from "lucide-react";
import styles from "./index.module.css";

// 定义 Mermaid 语法高亮规则
if (typeof window !== "undefined" && !Prism.languages.mermaid) {
  Prism.languages.mermaid = {
    comment: /%%[^\r\n]*/,
    string: {
      pattern: /"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*'/,
      greedy: true,
    },
    keyword: /\b(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|quadrantChart|requirementDiagram|gitGraph|mindmap|timeline|zenuml|sankey|block-beta|TD|TB|BT|RL|LR|subgraph|end|class|click|callback|link|style|classDef|direction|title|accTitle|accDescr)\b/,
    operator: /-->|---|-\.-|==>|==|->|-\.|::|:::|\||&/,
    punctuation: /[{}[\];(),.:]/,
    "class-name": /\b[A-Z]\w*\b/,
    function: /\b\w+(?=\()/,
    number: /\b\d+(?:\.\d+)?\b/,
  };
}

interface MermaidEditorProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * Mermaid 源码编辑器组件（左侧面板）
 */
export const MermaidEditor: React.FC<MermaidEditorProps> = ({
  isCollapsed,
  onToggleCollapse,
}) => {
  const { mermaidCode, updateMermaidCode, saveToLocal, hasUnsavedChanges } =
    useMermaidStore();

  const [localCode, setLocalCode] = useState(mermaidCode);

  // 同步外部更新
  useEffect(() => {
    setLocalCode(mermaidCode);
  }, [mermaidCode]);

  // 防抖更新
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localCode !== mermaidCode) {
        updateMermaidCode(localCode);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localCode]);

  const handleChange = (code: string) => {
    setLocalCode(code);
  };

  const handleSave = () => {
    saveToLocal();
  };

  // 语法高亮函数
  const highlightCode = (code: string) => {
    try {
      return Prism.highlight(code, Prism.languages.mermaid, 'mermaid');
    } catch (error) {
      console.warn('Syntax highlighting error:', error);
      return code;
    }
  };

  return (
    <div
      className={`${styles.editorPanel} ${
        isCollapsed ? styles.collapsed : ""
      }`}
    >
      {isCollapsed ? (
        // 折叠状态：只显示一个展开按钮
        <div className={styles.collapsedPanel}>
          <button
            onClick={onToggleCollapse}
            className={styles.expandButton}
            title="Expand Mermaid Editor"
          >
            <ChevronRight size={18} className={styles.expandIcon} />
            <span className={styles.expandText}>Editor</span>
          </button>
        </div>
      ) : (
        // 展开状态：显示完整编辑器
        <>
          <div className={styles.panelHeader}>
            <h3>Mermaid Source</h3>
            <div className={styles.headerActions}>
              <button
                onClick={handleSave}
                className={styles.saveButton}
                disabled={!hasUnsavedChanges}
              >
                {hasUnsavedChanges ? "Save" : "Saved"}
              </button>
              <button
                onClick={onToggleCollapse}
                className={styles.collapseButton}
                title="Collapse Editor"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>

          <Editor
            value={localCode}
            onValueChange={handleChange}
            highlight={highlightCode}
            padding={16}
            className={styles.codeEditor}
            textareaClassName={styles.codeEditorTextarea}
            preClassName={styles.codeEditorPre}
            style={{
              fontFamily: '"Monaco", "Courier New", monospace',
              fontSize: 13,
              lineHeight: 1.6,
              flex: 1,
            }}
            placeholder="Enter Mermaid code here..."
          />

          <div className={styles.panelFooter}>
            <p className={styles.hint}>
              <Info size={14} /> Changes auto-save. Click nodes in the diagram to edit docs.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

