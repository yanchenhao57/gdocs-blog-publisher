import { SEOElement } from '../types';
import styles from './index.module.css';

interface VisibilityTableProps {
  elements: SEOElement[];
}

export default function VisibilityTable({ elements }: VisibilityTableProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>SEO Element Visibility</h3>
      </div>
      <table className={styles.table}>
        <thead>
          <tr className={styles.header_row}>
            <th className={styles.th}>Element</th>
            <th className={styles.th}>Initial Value (HTML)</th>
            <th className={styles.th}>Rendered Value (JS)</th>
            <th className={styles.th_center}>Initial Status</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {elements.map((el, i) => (
            <tr key={i} className={styles.row}>
              <td className={styles.td_name}>{el.name}</td>
              <td className={styles.td}>
                {el.initialValue ? (
                  <span className={styles.value} title={el.initialValue}>{el.initialValue}</span>
                ) : (
                  <span className={styles.undefined}>Undefined</span>
                )}
              </td>
              <td className={styles.td}>
                <span className={styles.value_rendered} title={el.renderedValue || ''}>
                  {el.renderedValue || '-'}
                </span>
              </td>
              <td className={styles.td_center}>
                {el.isVisible ? (
                  <div className={styles.badge_found}>
                    <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Found</span>
                  </div>
                ) : (
                  <div className={styles.badge_missing}>
                    <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Missing</span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

