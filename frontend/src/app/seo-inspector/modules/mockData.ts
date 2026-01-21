import { AuditResult } from "./types";

export const MOCK_AUDIT_RESULT: AuditResult = {
  url: "https://example-js-app.com/dashboard",
  timestamp: new Date().toISOString(),
  status: "high-risk",
  httpStatus: 200,
  responseSize: "12.4 KB",
  robotsStatus: "Indexable (Follow, Index)",
  coverage: 0.7,
  initialHtmlText: `<!DOCTYPE html>
<html>
<head>
    <title>App Loading...</title>
</head>
<body>
    <div id="root"></div>
    <script src="/static/js/bundle.js"></script>
    <!-- No visible content in initial response -->
</body>
</html>`,
  renderedHtmlText: `<div id="root">
    <header>
        <nav>Dashboard | Analytics | Settings</nav>
    </header>
    <main>
        <h1>Performance Overview</h1>
        <p>Welcome to your internal metrics dashboard. Below you will find real-time data ingestion rates and system health indicators for the cluster.</p>
        <section>
            <h2>Active Nodes</h2>
            <ul>
                <li>Node A - Stable</li>
                <li>Node B - Throttled</li>
                <li>Node C - Stable</li>
            </ul>
        </section>
        <footer>System Status: Online</footer>
    </main>
</div>`,
  seoElements: [
    {
      name: "Title",
      initialValue: "App Loading...",
      renderedValue: "Performance Overview | Dashboard",
      isVisible: false,
    },
    {
      name: "Meta Description",
      initialValue: null,
      renderedValue:
        "Comprehensive view of cluster performance and node health metrics.",
      isVisible: false,
    },
    {
      name: "H1",
      initialValue: null,
      renderedValue: "Performance Overview",
      isVisible: false,
    },
    {
      name: "H2",
      initialValue: null,
      renderedValue: "Active Nodes",
      isVisible: false,
    },
    {
      name: "Canonical",
      initialValue: "https://example-js-app.com/dashboard",
      renderedValue: "https://example-js-app.com/dashboard",
      isVisible: true,
    },
    {
      name: "hreflang",
      initialValue: "en",
      renderedValue: "en",
      isVisible: true,
    },
  ],
};

