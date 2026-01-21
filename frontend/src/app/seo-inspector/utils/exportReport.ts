import { AuditResult } from '../modules/types';

/**
 * Export SEO audit report as markdown file
 */
export function exportReportAsMarkdown(data: AuditResult) {
  const timestamp = new Date(data.timestamp).toLocaleString();
  
  // Build markdown content
  const markdown = `# SEO Content Inspector Report

**Generated:** ${timestamp}  
**URL:** ${data.url}

---

## Executive Summary

**Risk Level:** ${getRiskLevelText(data.status)}  
**HTTP Status:** ${data.httpStatus}  
**Response Size:** ${data.responseSize}  
**HTML Content Coverage:** ${(data.coverage * 100).toFixed(1)}% of final rendered text

---

## SEO Element Visibility

| Element | Initial Value (HTML) | Rendered Value (JS) | Status |
|---------|---------------------|---------------------|--------|
${data.seoElements.map(el => {
  const initial = el.initialValue || '_Undefined_';
  const rendered = el.renderedValue || '-';
  const status = el.isVisible ? '✅ Found' : '❌ Missing';
  return `| ${el.name} | ${escapeMarkdown(initial)} | ${escapeMarkdown(rendered)} | ${status} |`;
}).join('\n')}

---

## Content Analysis

### What Googlebot Sees (Initial HTML)

\`\`\`
${data.initialHtmlText.substring(0, 1000)}${data.initialHtmlText.length > 1000 ? '...' : ''}
\`\`\`

**Total Length:** ${data.initialHtmlText.length} characters

### What Users See (After JS Rendering)

\`\`\`
${data.renderedHtmlText.substring(0, 1000)}${data.renderedHtmlText.length > 1000 ? '...' : ''}
\`\`\`

**Total Length:** ${data.renderedHtmlText.length} characters

---

## Recommendations

### ${data.status === 'high-risk' ? '🔴 High Risk' : data.status === 'warning' ? '🟡 Medium Risk' : '🟢 Low Risk'}

${getRecommendationText(data)}

---

## Technical Details

- **Analyzed URL:** ${data.url}
- **Robots/Indexing:** ${data.robotsStatus}
- **Report Generated:** ${timestamp}
- **Tool:** SEO Content Inspector

---

*This report was generated automatically by SEO Content Inspector to help identify potential SEO issues with client-side rendered content.*
`;

  return markdown;
}

/**
 * Export report as HTML file
 */
export function exportReportAsHTML(data: AuditResult) {
  const timestamp = new Date(data.timestamp).toLocaleString();
  const riskColor = data.status === 'high-risk' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#10b981';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Content Inspector Report - ${data.url}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1e293b; padding: 40px; background: #f8fafc; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #0f172a; margin-bottom: 10px; font-size: 2rem; }
    h2 { color: #334155; margin-top: 40px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
    h3 { color: #475569; margin-top: 30px; margin-bottom: 15px; }
    .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 30px; }
    .summary { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 30px 0; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
    .summary-item { background: white; padding: 15px; border-radius: 6px; }
    .summary-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
    .summary-value { font-size: 1.125rem; font-weight: 600; color: #0f172a; }
    .risk-badge { display: inline-block; padding: 8px 16px; border-radius: 6px; font-weight: 600; color: white; background: ${riskColor}; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; color: #475569; }
    .status-found { color: #10b981; font-weight: 600; }
    .status-missing { color: #ef4444; font-weight: 600; }
    pre { background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 6px; overflow-x: auto; font-size: 0.875rem; line-height: 1.5; }
    .recommendation { background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #94a3b8; font-size: 0.875rem; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 SEO Content Inspector Report</h1>
    <div class="meta">
      <strong>Generated:</strong> ${timestamp}<br>
      <strong>URL:</strong> ${data.url}
    </div>

    <div class="summary">
      <h2 style="margin-top: 0; border: none;">Executive Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">Risk Level</div>
          <div class="summary-value"><span class="risk-badge">${getRiskLevelText(data.status)}</span></div>
        </div>
        <div class="summary-item">
          <div class="summary-label">HTTP Status</div>
          <div class="summary-value">${data.httpStatus} OK</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Response Size</div>
          <div class="summary-value">${data.responseSize}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Content Coverage</div>
          <div class="summary-value" style="color: ${data.coverage >= 0.8 ? '#10b981' : '#ef4444'}">${(data.coverage * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>

    <h2>SEO Element Visibility</h2>
    <table>
      <thead>
        <tr>
          <th>Element</th>
          <th>Initial Value (HTML)</th>
          <th>Rendered Value (JS)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.seoElements.map(el => `
          <tr>
            <td><strong>${el.name}</strong></td>
            <td>${escapeHTML(el.initialValue || 'Undefined')}</td>
            <td>${escapeHTML(el.renderedValue || '-')}</td>
            <td class="${el.isVisible ? 'status-found' : 'status-missing'}">${el.isVisible ? '✅ Found' : '❌ Missing'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>Content Comparison</h2>
    <h3>What Googlebot Sees (Initial HTML)</h3>
    <pre>${escapeHTML(data.initialHtmlText.substring(0, 1000))}${data.initialHtmlText.length > 1000 ? '\n...(truncated)' : ''}</pre>
    <p><strong>Total Length:</strong> ${data.initialHtmlText.length} characters</p>

    <h3>What Users See (After JS Rendering)</h3>
    <pre>${escapeHTML(data.renderedHtmlText.substring(0, 1000))}${data.renderedHtmlText.length > 1000 ? '\n...(truncated)' : ''}</pre>
    <p><strong>Total Length:</strong> ${data.renderedHtmlText.length} characters</p>

    <h2>Recommendations</h2>
    <div class="recommendation">
      <h3 style="margin-top: 0;">${getRiskLevelText(data.status)}</h3>
      <p>${getRecommendationText(data)}</p>
    </div>

    <div class="footer">
      <p><strong>Technical Details</strong></p>
      <p>Analyzed URL: ${data.url}</p>
      <p>Robots/Indexing: ${data.robotsStatus}</p>
      <p>Report Generated: ${timestamp}</p>
      <p>Tool: SEO Content Inspector</p>
    </div>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export report (main function)
 */
export function exportReport(data: AuditResult, format: 'markdown' | 'html' = 'html') {
  const sanitizedUrl = data.url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (format === 'markdown') {
    const markdown = exportReportAsMarkdown(data);
    downloadFile(markdown, `seo-report-${sanitizedUrl}-${timestamp}.md`, 'text/markdown');
  } else {
    const html = exportReportAsHTML(data);
    downloadFile(html, `seo-report-${sanitizedUrl}-${timestamp}.html`, 'text/html');
  }
}

// Helper functions
function getRiskLevelText(status: string): string {
  switch (status) {
    case 'high-risk': return 'HIGH RISK';
    case 'warning': return 'MEDIUM RISK';
    case 'optimal': return 'LOW RISK';
    default: return status.toUpperCase();
  }
}

function getRecommendationText(data: AuditResult): string {
  if (data.status === 'high-risk') {
    return 'Critical SEO issues detected. The initial HTML contains minimal content, which may prevent search engines from properly indexing this page. Implement Server-Side Rendering (SSR) or Static Site Generation (SSG) to ensure critical content is available in the initial HTML response.';
  } else if (data.status === 'warning') {
    return 'Some SEO concerns detected. While the page has some content in the initial HTML, a significant portion is loaded via JavaScript. Consider moving more critical content to the server-side rendering to improve search engine visibility.';
  } else {
    return 'Good SEO implementation. The page content is well-represented in the initial HTML response, making it easily accessible to search engines. Continue to maintain this approach for optimal search engine indexing.';
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

