"use client";

import { Trash2, X } from "lucide-react";
import styles from "../index.module.css";

interface DeleteConfirmModalProps {
  nodeId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal(props: DeleteConfirmModalProps) {
  const { nodeId, onConfirm, onCancel } = props;

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Delete Documentation</h3>
        <div className={styles.modalContent}>
          <p>Are you sure you want to delete documentation for node:</p>
          <p className={styles.nodeIdHighlight}>"{nodeId}"</p>
          <p className={styles.warningText}>This action cannot be undone.</p>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            <X size={16} />
            Cancel
          </button>
          <button className={styles.deleteButtonModal} onClick={onConfirm}>
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

