"use client";

import { useState } from "react";
import styles from "../index.module.css";

interface ImageModalProps {
  onInsert: (url: string) => void;
  onClose: () => void;
}

export function ImageModal(props: ImageModalProps) {
  const { onInsert, onClose } = props;
  const [imageUrl, setImageUrl] = useState("");

  const handleInsert = () => {
    if (!imageUrl.trim()) {
      return;
    }
    onInsert(imageUrl);
    setImageUrl("");
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
        <h4>Insert Image URL</h4>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className={styles.imageUrlInput}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className={styles.imageModalButtons}>
          <button onClick={handleInsert} className={styles.imageModalButton}>
            Insert
          </button>
          <button onClick={onClose} className={styles.imageModalButtonCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

