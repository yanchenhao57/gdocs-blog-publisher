"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import styles from "../index.module.css";

interface ImagePreviewModalProps {
  src: string;
  onClose: () => void;
}

export function ImagePreviewModal(props: ImagePreviewModalProps) {
  const { src, onClose } = props;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className={styles.imagePreviewOverlay} onClick={onClose}>
      <div className={styles.imagePreviewContainer}>
        <button
          className={styles.imagePreviewClose}
          onClick={onClose}
          title="Close (ESC)"
        >
          <X size={24} />
        </button>
        <img
          src={src}
          alt="Preview"
          className={styles.imagePreviewContent}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

