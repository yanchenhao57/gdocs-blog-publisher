import styles from "./index.module.css";

interface LoadingStepProps {
  url: string;
}

export default function LoadingStep({ url }: LoadingStepProps) {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.navCenter}>
          <div className={styles.logo}>
            <svg
              className={styles.logoIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <span className={styles.navTitle}>SEO Content Inspector</span>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.spinner}>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
          </div>

          <h2 className={styles.title}>Analyzing Page...</h2>
          <p className={styles.url}>{url}</p>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>1</div>
              <span>Fetching HTML with Googlebot UA</span>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>2</div>
              <span>Extracting text content</span>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>3</div>
              <span>Analyzing SEO signals</span>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>4</div>
              <span>Calculating risk level</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

