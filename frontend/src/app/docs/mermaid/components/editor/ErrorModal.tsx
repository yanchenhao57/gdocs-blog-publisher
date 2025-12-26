"use client";

import styles from "../index.module.css";

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

export function ErrorModal(props: ErrorModalProps) {
  const { message, onClose } = props;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Error</h3>
        <div className={styles.modalContent}>
          <p>{message}</p>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.confirmButton} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

