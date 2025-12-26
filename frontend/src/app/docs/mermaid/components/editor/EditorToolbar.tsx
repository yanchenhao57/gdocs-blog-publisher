"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  X,
  Image as ImageIcon,
  Link2,
  Table as TableIcon,
  Code,
  Minus,
  RotateCcw,
  RotateCw,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  CheckSquare,
  Code2,
  Highlighter,
  Palette,
  Type,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import styles from "../index.module.css";

interface EditorToolbarProps {
  editor: Editor;
  onImageUpload: () => void;
  onImageUrl: () => void;
  onLink: () => void;
  onTable: () => void;
}

export function EditorToolbar(props: EditorToolbarProps) {
  const { editor, onImageUpload, onImageUrl, onLink, onTable } = props;
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowHeadingMenu(false);
        setShowColorPicker(false);
        setShowHighlightPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const colors = [
    { name: 'Default', value: null },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
  ];

  const highlights = [
    { name: 'None', value: null },
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Purple', value: '#e9d5ff' },
  ];

  return (
    <div className={styles.toolbar} ref={toolbarRef}>
      {/* History */}
      <div className={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className={styles.toolbarButton}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className={styles.toolbarButton}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <RotateCw size={16} />
        </button>
      </div>

      <div className={styles.toolbarDivider}></div>

      {/* Headings */}
      <div className={styles.toolbarGroup}>
        <div className={styles.dropdownWrapper}>
          <button
            onClick={() => setShowHeadingMenu(!showHeadingMenu)}
            className={`${styles.toolbarButton} ${
              editor.isActive('heading') ? styles.active : ''
            }`}
            title="Headings"
          >
            <Type size={16} />
          </button>
          {showHeadingMenu && (
            <div className={styles.dropdownMenu}>
              <button
                onClick={() => {
                  editor.chain().focus().setParagraph().run();
                  setShowHeadingMenu(false);
                }}
                className={`${styles.dropdownItem} ${
                  editor.isActive('paragraph') ? styles.active : ''
                }`}
              >
                <span style={{ fontSize: '14px' }}>Normal</span>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                  setShowHeadingMenu(false);
                }}
                className={`${styles.dropdownItem} ${
                  editor.isActive('heading', { level: 2 }) ? styles.active : ''
                }`}
              >
                <Heading2 size={16} />
                <span style={{ fontSize: '18px', fontWeight: 600 }}>Heading 2</span>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 3 }).run();
                  setShowHeadingMenu(false);
                }}
                className={`${styles.dropdownItem} ${
                  editor.isActive('heading', { level: 3 }) ? styles.active : ''
                }`}
              >
                <Heading3 size={16} />
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Heading 3</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.toolbarDivider}></div>

      {/* Text Formatting */}
      <div className={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${styles.toolbarButton} ${editor.isActive('bold') ? styles.active : ""}`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${styles.toolbarButton} ${editor.isActive('italic') ? styles.active : ""}`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${styles.toolbarButton} ${editor.isActive('underline') ? styles.active : ""}`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`${styles.toolbarButton} ${editor.isActive('strike') ? styles.active : ""}`}
          title="Strikethrough"
        >
          <Minus size={16} />
        </button>
      </div>

      <div className={styles.toolbarDivider}></div>

      {/* Text Color & Highlight */}
      <div className={styles.toolbarGroup}>
        <div className={styles.dropdownWrapper}>
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            className={styles.toolbarButton}
            title="Text Color"
          >
            <Palette size={16} />
          </button>
          {showColorPicker && (
            <div className={styles.colorPicker}>
              <div className={styles.colorGrid}>
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      if (color.value) {
                        editor.chain().focus().setColor(color.value).run();
                      } else {
                        editor.chain().focus().unsetColor().run();
                      }
                      setShowColorPicker(false);
                    }}
                    className={styles.colorButton}
                    style={{
                      backgroundColor: color.value || '#ffffff',
                      border: color.value ? 'none' : '1px solid #e5e7eb',
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={styles.dropdownWrapper}>
          <button
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
            }}
            className={`${styles.toolbarButton} ${editor.isActive('highlight') ? styles.active : ""}`}
            title="Highlight"
          >
            <Highlighter size={16} />
          </button>
          {showHighlightPicker && (
            <div className={styles.colorPicker}>
              <div className={styles.colorGrid}>
                {highlights.map((highlight) => (
                  <button
                    key={highlight.name}
                    onClick={() => {
                      if (highlight.value) {
                        editor.chain().focus().toggleHighlight({ color: highlight.value }).run();
                      } else {
                        editor.chain().focus().unsetHighlight().run();
                      }
                      setShowHighlightPicker(false);
                    }}
                    className={styles.colorButton}
                    style={{
                      backgroundColor: highlight.value || '#ffffff',
                      border: highlight.value ? 'none' : '1px solid #e5e7eb',
                    }}
                    title={highlight.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.toolbarDivider}></div>

      {/* Text Alignment */}
      <div className={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'left' }) ? styles.active : ""}`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'center' }) ? styles.active : ""}`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'right' }) ? styles.active : ""}`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      <div className={styles.toolbarDivider}></div>

      {/* Lists */}
      <div className={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${styles.toolbarButton} ${editor.isActive('bulletList') ? styles.active : ""}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${styles.toolbarButton} ${editor.isActive('orderedList') ? styles.active : ""}`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`${styles.toolbarButton} ${editor.isActive('taskList') ? styles.active : ""}`}
          title="Task List"
        >
          <CheckSquare size={16} />
        </button>
      </div>

      <div className={styles.toolbarDivider}></div>

      {/* Code & Quote */}
      <div className={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`${styles.toolbarButton} ${editor.isActive('code') ? styles.active : ""}`}
          title="Inline Code"
        >
          <Code size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`${styles.toolbarButton} ${editor.isActive('codeBlock') ? styles.active : ""}`}
          title="Code Block"
        >
          <Code2 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${styles.toolbarButton} ${editor.isActive('blockquote') ? styles.active : ""}`}
          title="Quote"
        >
          <Quote size={16} />
        </button>
      </div>

      <div className={styles.toolbarDivider}></div>

      {/* Media */}
      <div className={styles.toolbarGroup}>
        <button
          onClick={onImageUpload}
          className={styles.toolbarButton}
          title="Upload Image"
        >
          <ImageIcon size={16} />
        </button>
        <button
          onClick={onLink}
          className={`${styles.toolbarButton} ${editor.isActive('link') ? styles.active : ""}`}
          title="Insert Link"
        >
          <Link2 size={16} />
        </button>
        <button
          onClick={onTable}
          className={styles.toolbarButton}
          title="Insert Table"
        >
          <TableIcon size={16} />
        </button>
      </div>

      <div className={styles.toolbarDivider}></div>

      {/* Clear */}
      <div className={styles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className={styles.toolbarButton}
          title="Clear Format"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
