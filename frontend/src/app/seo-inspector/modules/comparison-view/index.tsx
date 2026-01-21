import styles from './index.module.css';

interface ComparisonViewProps {
  initial: string;
  rendered: string;
}

export default function ComparisonView({ initial, rendered }: ComparisonViewProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.header_left}>
          <span>What Googlebot sees (Initial HTML)</span>
          <span className={styles.badge_raw}>RAW SNAPSHOT</span>
        </div>
        <div className={styles.header_right}>
          <span>What users see (After JS Rendering)</span>
          <span className={styles.badge_rendered}>DOM RENDERED</span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.panel_left}>
          <pre className={styles.code}>
            {initial}
          </pre>
        </div>
        <div className={styles.panel_right}>
          <pre className={styles.code}>
            {rendered}
          </pre>
        </div>
      </div>
    </div>
  );
}

