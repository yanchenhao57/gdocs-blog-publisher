import { useState, FormEvent } from 'react';
import styles from './index.module.css';

interface InputStepProps {
  onAudit: (url: string) => void;
}

export default function InputStep({ onAudit }: InputStepProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAudit(url);
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Nav */}
      <nav className={styles.nav}>
        <div className={styles.nav_center}>
          <div className={styles.logo}>
            <svg className={styles.logo_icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className={styles.nav_title}>SEO Content Inspector</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.badge}>
            Step 1: URL Input
          </div>
          <h1 className={styles.title}>
            Audit what Googlebot sees.
          </h1>
          <p className={styles.description}>
            Verify if your client-side content is discoverable. Compare the initial HTML snapshot against the final rendered state to detect indexing risks.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.input_wrapper}>
              <input
                type="url"
                required
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={styles.input}
              />
              <button
                type="submit"
                className={styles.button}
              >
                Audit Page
              </button>
            </div>
            <div className={styles.hint}>
              <svg className={styles.hint_icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Provide a full URL including protocol (http/https).</span>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} SEO Content Inspector. Internal Tool.
      </footer>
    </div>
  );
}

