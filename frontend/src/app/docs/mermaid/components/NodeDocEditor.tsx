"use client";

import { useMermaidStore, mermaidSelectors } from "@/stores/mermaidStore";
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { EditorToolbar } from "./editor/EditorToolbar";
import { ImageModal } from "./editor/ImageModal";
import { LinkModal } from "./editor/LinkModal";
import { DeleteConfirmModal } from "./editor/DeleteConfirmModal";
import { ErrorModal } from "./editor/ErrorModal";
import { SaveStatus } from "./editor/SaveStatus";
import { ImagePreviewModal } from "./editor/ImagePreviewModal";
import styles from "./index.module.css";

interface NodeDocEditorProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function NodeDocEditor(props: NodeDocEditorProps) {
  const { isCollapsed, onToggleCollapse } = props;
  
  const { selectedNodeId, updateNodeDoc, deleteNodeDoc, hasUnsavedChanges } = useMermaidStore();
  const selectedDoc = useMermaidStore((state) => mermaidSelectors.getSelectedNodeDoc(state));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isMounted, setIsMounted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<{ show: boolean; src: string }>({
    show: false,
    src: "",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3, 4] },
        }),
        Image.configure({
          inline: true,
          allowBase64: true,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'custom-link',
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        }),
        Table.configure({ resizable: true }),
        TableRow,
        TableCell,
        TableHeader,
        Placeholder.configure({
          placeholder: "Enter documentation for this node...",
        }),
        Underline,
        TextStyle,
        Color,
        Highlight.configure({
          multicolor: true,
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
      ],
      content: selectedDoc?.content || "",
      editorProps: {
        attributes: {
          class: styles.contentEditor,
        },
        handleDOMEvents: {
          dblclick: (view, event) => {
            const target = event.target as HTMLElement;
            if (target.tagName === "IMG") {
              event.preventDefault();
              const img = target as HTMLImageElement;
              setImagePreview({
                show: true,
                src: img.src,
              });
              return true;
            }
            return false;
          },
        },
      },
      onUpdate: ({ editor }) => {
        if (selectedNodeId) {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          debounceTimerRef.current = setTimeout(() => {
            updateNodeDoc(selectedNodeId, editor.getHTML());
          }, 300);
        }
      },
    },
    [selectedNodeId]
  );

  useEffect(() => {
    if (editor && selectedDoc) {
      const currentContent = editor.getHTML();
      const newContent = selectedDoc.content;
      if (currentContent !== newContent) {
        editor.commands.setContent(newContent);
      }
    } else if (editor && !selectedDoc) {
      editor.commands.setContent("");
    }
  }, [selectedDoc, selectedNodeId, editor]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      editor?.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleInsertImageUrl = (url: string) => {
    try {
      new URL(url);
      editor?.chain().focus().setImage({ src: url }).run();
      setShowImageModal(false);
    } catch {
      setErrorMessage("Please enter a valid URL");
    }
  };

  const handleInsertLink = (url: string, text?: string) => {
    try {
      new URL(url);
      if (text?.trim()) {
        editor?.chain().focus().insertContent({
          type: 'text',
          text: text,
          marks: [{ type: 'link', attrs: { href: url } }],
        }).run();
      } else {
        editor?.chain().focus().setLink({ href: url }).run();
      }
      setShowLinkModal(false);
    } catch {
      setErrorMessage("Please enter a valid URL");
    }
  };

  const handleRemoveLink = () => {
    editor?.chain().focus().unsetLink().run();
    setShowLinkModal(false);
  };

  const handleDelete = () => {
    if (selectedNodeId) {
      setDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedNodeId) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      deleteNodeDoc(selectedNodeId);
    }
    setDeleteConfirm(false);
  };

  if (!isMounted) {
    return (
      <div className={`${styles.editorPanel} ${isCollapsed ? styles.collapsed : ""}`}>
        {!isCollapsed && (
          <div className={styles.panelHeader}>
            <div className={styles.nodeTitle}>
              <span className={styles.nodeLabel}>Loading Editor...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!selectedNodeId) {
    return (
      <div className={`${styles.editorPanel} ${isCollapsed ? styles.collapsed : ""}`}>
        {isCollapsed ? (
          <div className={styles.collapsedPanel}>
            <button onClick={onToggleCollapse} className={styles.expandButton} title="Expand Node Editor">
              <ChevronLeft size={18} className={styles.expandIcon} />
              <span className={styles.expandText}>Docs</span>
            </button>
          </div>
        ) : (
          <>
            <div className={styles.panelHeader}>
              <h3>Node Documentation</h3>
              <button onClick={onToggleCollapse} className={styles.collapseButton} title="Collapse Editor">
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

  if (!editor) {
    return null;
  }

  return (
    <div className={`${styles.editorPanel} ${isCollapsed ? styles.collapsed : ""}`}>
      {isCollapsed ? (
        <div className={styles.collapsedPanel}>
          <button onClick={onToggleCollapse} className={styles.expandButton} title="Expand Node Editor">
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
              <button onClick={handleDelete} className={styles.deleteButton} title="Delete documentation">
                <Trash2 size={16} />
              </button>
              <button onClick={onToggleCollapse} className={styles.collapseButton} title="Collapse Editor">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <EditorToolbar
            editor={editor}
            onImageUpload={() => fileInputRef.current?.click()}
            onImageUrl={() => setShowImageModal(true)}
            onLink={() => setShowLinkModal(true)}
            onTable={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />

          <div className={styles.editorContainer}>
            <EditorContent editor={editor} />
          </div>

          {showImageModal && (
            <ImageModal
              onInsert={handleInsertImageUrl}
              onClose={() => setShowImageModal(false)}
            />
          )}

          {showLinkModal && editor && (
            <LinkModal
              editor={editor}
              onInsert={handleInsertLink}
              onRemove={handleRemoveLink}
              onClose={() => setShowLinkModal(false)}
            />
          )}

          {deleteConfirm && (
            <DeleteConfirmModal
              nodeId={selectedNodeId}
              onConfirm={handleConfirmDelete}
              onCancel={() => setDeleteConfirm(false)}
            />
          )}

          {errorMessage && (
            <ErrorModal
              message={errorMessage}
              onClose={() => setErrorMessage("")}
            />
          )}

          {imagePreview.show && (
            <ImagePreviewModal
              src={imagePreview.src}
              onClose={() => setImagePreview({ show: false, src: "" })}
            />
          )}

          <SaveStatus hasUnsavedChanges={hasUnsavedChanges} />
        </>
      )}
    </div>
  );
}
