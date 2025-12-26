"use client";

import { Check, Clock } from "lucide-react";
import styles from "../index.module.css";

interface SaveStatusProps {
  hasUnsavedChanges: boolean;
}

export function SaveStatus(props: SaveStatusProps) {
  const { hasUnsavedChanges } = props;

  return (
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
  );
}

