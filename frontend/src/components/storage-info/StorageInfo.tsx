/**
 * Storage Information Display Component
 * Shows current storage usage and available space
 */

import { HardDrive } from "lucide-react";
import styles from "./storage-info.module.css";

interface StorageInfoProps {
  usage: number;
  quota: number;
  available: number;
  usagePercent: number;
}

export function StorageInfo(props: StorageInfoProps) {
  const { usage, quota, available, usagePercent } = props;

  // Format bytes to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Determine warning level
  const getWarningLevel = (percent: number): 'safe' | 'warning' | 'danger' => {
    if (percent < 70) return 'safe';
    if (percent < 90) return 'warning';
    return 'danger';
  };

  const warningLevel = getWarningLevel(usagePercent);

  return (
    <div className={styles.storageInfo}>
      <div className={styles.header}>
        <HardDrive size={16} />
        <span className={styles.title}>Storage</span>
      </div>
      
      <div className={styles.progressContainer}>
        <div 
          className={`${styles.progressBar} ${styles[warningLevel]}`}
          style={{ width: `${Math.min(usagePercent, 100)}%` }}
        />
      </div>

      <div className={styles.details}>
        <div className={styles.stat}>
          <span className={styles.label}>Used:</span>
          <span className={styles.value}>{formatBytes(usage)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Available:</span>
          <span className={styles.value}>{formatBytes(available)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Total:</span>
          <span className={styles.value}>{formatBytes(quota)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Usage:</span>
          <span className={`${styles.value} ${styles[warningLevel]}`}>
            {usagePercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {warningLevel === 'warning' && (
        <div className={styles.warningMessage}>
          Storage is getting full. Consider exporting and cleaning up old projects.
        </div>
      )}

      {warningLevel === 'danger' && (
        <div className={styles.dangerMessage}>
          ⚠️ Storage is almost full! Export important data and remove old projects.
        </div>
      )}
    </div>
  );
}

