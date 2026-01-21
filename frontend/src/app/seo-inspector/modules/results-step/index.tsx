import { AuditResult } from "../types";
import ComparisonView from "../comparison-view";
import VisibilityTable from "../visibility-table";
import { exportReport } from "../../utils/exportReport";
import styles from "./index.module.css";

interface ResultsStepProps {
  data: AuditResult;
  onBack: () => void;
}

export default function ResultsStep({ data, onBack }: ResultsStepProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "high-risk":
        return {
          className: styles.status_high_risk,
          title:
            "High Risk: Main content is missing from the initial HTML response",
        };
      case "warning":
        return {
          className: styles.status_warning,
          title: "Warning: Significant content lag detected",
        };
      default:
        return {
          className: styles.status_optimal,
          title: "Optimal: Content is visible in the initial response",
        };
    }
  };

  const statusConfig = getStatusConfig(data.status);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.header_left}>
          <div className={styles.header_title}>SEO Content Inspector</div>
          <div className={styles.divider}></div>
          <nav className={styles.breadcrumb}>
            <span className={styles.breadcrumb_inactive}>Input URL</span>
            <svg
              className={styles.breadcrumb_icon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className={styles.breadcrumb_active}>Results</span>
          </nav>
        </div>
        <button onClick={onBack} className={styles.back_button}>
          <svg
            className={styles.back_icon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Analyze another URL</span>
        </button>
      </header>

      <main className={styles.main}>
        {/* Export Button */}
        <div className={styles.export_section}>
          <button
            onClick={() => exportReport(data, "html")}
            className={styles.export_button}
          >
            <svg
              className={styles.export_icon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export Report (HTML)</span>
          </button>
        </div>

        {/* Summary Banner */}
        <section className={`${styles.banner} ${statusConfig.className}`}>
          <div className={styles.banner_indicator}></div>
          <div>
            <h2 className={styles.banner_title}>{statusConfig.title}</h2>
            <p className={styles.banner_text}>
              The server response contains only structural shells. Googlebot may
              struggle to understand the page context if JavaScript execution
              times out or fails.
            </p>
          </div>
        </section>

        {/* Info Grid */}
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.card_label}>Analyzed URL</div>
            <div className={styles.card_value} title={data.url}>
              {data.url}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.card_label}>Fetch Status</div>
            <div className={styles.card_value_flex}>
              <span className={styles.status_ok}>{data.httpStatus} OK</span>
              <span className={styles.separator}>|</span>
              <span className={styles.card_value}>{data.responseSize}</span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.card_label}>Robots / Indexing</div>
            <div className={styles.card_value}>{data.robotsStatus}</div>
          </div>
          <div
            className={`${styles.card} ${
              data.coverage >= 0.8
                ? styles.card_highlight_good
                : styles.card_highlight
            }`}
          >
            <div className={styles.card_label}>HTML Content Coverage</div>
            <div className={styles.card_value_coverage}>
              <span
                className={
                  data.coverage >= 0.8
                    ? styles.coverage_percent_good
                    : styles.coverage_percent
                }
              >
                {(data.coverage * 100).toFixed(1)}%
              </span>
              <span className={styles.coverage_text}>
                of final rendered text
              </span>
            </div>
            <div className={styles.coverage_warning}>
              Critical indexing threshold below 10%
            </div>
          </div>

          {/* Semantic Coverage Card */}
          {data.semanticCoverage !== undefined && (
            <div
              className={`${styles.card} ${
                data.semanticCoverage >= 0.8
                  ? styles.card_highlight_good
                  : styles.card_highlight
              }`}
            >
              <div className={styles.card_label}>
                Semantic Content Coverage ⭐
              </div>
              <div className={styles.card_value_coverage}>
                <span
                  className={
                    data.semanticCoverage >= 0.8
                      ? styles.coverage_percent_good
                      : styles.coverage_percent
                  }
                >
                  {(data.semanticCoverage * 100).toFixed(1)}%
                </span>
                <span className={styles.coverage_text}>
                  of semantic content
                </span>
              </div>
              <div className={styles.coverage_info}>
                More accurate SEO metric
              </div>
            </div>
          )}

          {/* Hidden Content Card */}
          {data.htmlHiddenRatio !== undefined && (
            <div
              className={`${styles.card} ${
                data.htmlHiddenRatio > 0.2
                  ? styles.card_warning
                  : styles.card_info
              }`}
            >
              <div className={styles.card_label}>Hidden Content 🔒</div>
              <div className={styles.card_value_coverage}>
                <span
                  className={
                    data.htmlHiddenRatio > 0.2
                      ? styles.coverage_percent_warning
                      : styles.coverage_percent_info
                  }
                >
                  {(data.htmlHiddenRatio * 100).toFixed(1)}%
                </span>
                <span className={styles.coverage_text}>
                  {data.htmlHiddenElementsCount || 0} hidden elements
                </span>
              </div>
              <div className={styles.coverage_info}>
                {data.htmlHiddenRatio > 0.2
                  ? "⚠️ High hidden content may hurt SEO"
                  : data.htmlHiddenRatio > 0
                  ? "Acceptable for UI elements"
                  : "No hidden content detected"}
              </div>
            </div>
          )}
        </div>

        {/* SEO Element Visibility Table */}
        <div className={styles.table_section}>
          <VisibilityTable elements={data.seoElements} />
        </div>

        {/* Content Comparison */}
        <ComparisonView
          initial={data.initialHtmlText}
          rendered={data.renderedHtmlText}
        />

        {/* Explanation & Recommendation */}
        <section className={styles.recommendations}>
          <div className={styles.recommendation_dark}>
            <h3 className={styles.recommendation_title}>
              <svg
                className={styles.recommendation_icon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Technical Explanation</span>
            </h3>
            <div className={styles.recommendation_content}>
              <p>
                The initial server response for this URL contains a minimal HTML
                template with an empty{" "}
                <code className={styles.code}>#root</code> container. Virtually
                all meaningful content, including the primary H1 heading and
                main descriptive text, is injected asynchronously via
                JavaScript.
              </p>
              <p>
                Search engines use a two-pass indexing system. While Googlebot
                eventually renders JavaScript, any delay or failure in execution
                during the first pass means your content might not be indexed
                immediately, or at all if resource budgets are tight.
              </p>
            </div>
          </div>

          <div className={styles.recommendation_light}>
            <h3 className={styles.recommendation_title}>
              <svg
                className={styles.recommendation_icon_green}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Recommendation for Frontend</span>
            </h3>
            <div className={styles.recommendation_content}>
              <p className={styles.recommendation_strong}>
                Implement Server-Side Rendering (SSR) or Static Site Generation
                (SSG).
              </p>
              <p>
                Move key SEO metadata and primary page content into the initial
                HTML payload. At a minimum, ensure the Title, Meta Description,
                and H1 tags are populated by the server to provide immediate
                context to crawlers.
              </p>
              <div className={styles.code_block}>
                // Priority Action
                <br />
                $ yarn add @framework/ssr-plugin
                <br />$ config.enablePrerendering = true;
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
