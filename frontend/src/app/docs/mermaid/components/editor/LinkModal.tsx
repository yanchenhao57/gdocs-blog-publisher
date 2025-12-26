"use client";

import { useState } from "react";
import { Editor } from "@tiptap/react";
import styles from "../index.module.css";

interface LinkModalProps {
  editor: Editor;
  onInsert: (url: string, text?: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function LinkModal(props: LinkModalProps) {
  const { editor, onInsert, onRemove, onClose } = props;
  
  const previousUrl = editor.getAttributes('link').href || '';
  const { from, to } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to, ' ');
  
  const [linkUrl, setLinkUrl] = useState(previousUrl);
  const [linkText, setLinkText] = useState(selectedText || '');

  const handleInsert = () => {
    if (!linkUrl.trim()) {
      return;
    }
    onInsert(linkUrl, linkText);
    setLinkUrl("");
    setLinkText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInsert();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className={styles.imageModal}>
      <div className={styles.imageModalContent}>
        <h4>{editor.isActive('link') ? 'Edit Link' : 'Insert Link'}</h4>
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://example.com"
          className={styles.imageUrlInput}
          style={{ marginBottom: '8px' }}
        />
        <input
          type="text"
          value={linkText}
          onChange={(e) => setLinkText(e.target.value)}
          placeholder="Link text (optional)"
          className={styles.imageUrlInput}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.imageModalButtons}>
          <button onClick={handleInsert} className={styles.imageModalButton}>
            {editor.isActive('link') ? 'Update' : 'Insert'}
          </button>
          {editor.isActive('link') && (
            <button onClick={onRemove} className={styles.imageModalButtonCancel}>
              Remove Link
            </button>
          )}
          <button onClick={onClose} className={styles.imageModalButtonCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

