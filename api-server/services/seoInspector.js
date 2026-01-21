/**
 * Analyze SEO signals from HTML
 * @param {string} html - Raw HTML string
 * @param {string} renderedHtml - Rendered HTML (optional)
 * @returns {Object} SEO signals
 */
export function analyzeSEOSignals(html, renderedHtml = '') {
  const signals = {
    title: { exists: false, source: null },
    metaDescription: { exists: false, source: null },
    h1: { exists: false, source: null },
    canonical: { exists: false },
    hreflangCount: 0,
  };

  // Check title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1].trim()) {
    signals.title.exists = true;
    signals.title.source = 'html';
  }

  // Check meta description - more flexible matching
  const metaDescMatch = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                        html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
  if (metaDescMatch && metaDescMatch[1] && metaDescMatch[1].trim()) {
    signals.metaDescription.exists = true;
    signals.metaDescription.source = 'html';
  }

  // Check H1 - first check in HTML
  const h1MatchHtml = html.match(/<h1[^>]*>/i);
  if (h1MatchHtml) {
    signals.h1.exists = true;
    signals.h1.source = 'html';
  } else if (renderedHtml) {
    // If not in HTML, check rendered
    const h1MatchRendered = renderedHtml.match(/<h1[^>]*>/i);
    if (h1MatchRendered) {
      signals.h1.exists = true;
      signals.h1.source = 'rendered';
    }
  }

  // Check canonical - more flexible matching
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);
  signals.canonical.exists = !!canonicalMatch;

  // Count hreflang - more flexible matching (either rel then hreflang, or hreflang then rel)
  const hreflangMatches = html.match(/<link[^>]*\s+hreflang=["'][^"']+["'][^>]*>/gi);
  signals.hreflangCount = hreflangMatches ? hreflangMatches.length : 0;

  return signals;
}

/**
 * Calculate content coverage metric
 * @param {number} htmlTextLength - Length of text in initial HTML
 * @param {number} renderedTextLength - Length of text after rendering
 * @returns {number} Coverage ratio (0-1)
 */
export function calculateContentCoverage(htmlTextLength, renderedTextLength) {
  if (renderedTextLength === 0) {
    return htmlTextLength > 0 ? 1.0 : 0.0;
  }
  return Math.min(htmlTextLength / renderedTextLength, 1.0);
}

/**
 * Diagnose SEO risk level and provide recommendations
 * @param {number} coverage - Content coverage ratio
 * @param {number} htmlTextLength - Length of HTML text
 * @param {number} renderedTextLength - Length of rendered text
 * @param {Object} seoSignals - SEO signals
 * @returns {Object} Diagnosis with risk level, issues, summary, and recommendations
 */
export function diagnose(coverage, htmlTextLength, renderedTextLength, seoSignals) {
  const issues = [];
  let riskLevel = 'LOW';
  let summary = '';
  let recommendation = '';

  // Determine risk level
  if (htmlTextLength < 300 && renderedTextLength > 1000) {
    riskLevel = 'HIGH';
    issues.push('MAIN_CONTENT_MISSING_IN_HTML');
    issues.push('CONTENT_RENDERED_BY_JS');
    summary = 'Main page content is not present in the initial HTML and only appears after JavaScript execution.';
    recommendation = 'Implement Server-Side Rendering (SSR) or Static Site Generation (SSG). Ensure critical page content (title, meta description, H1, primary text) is rendered directly in the HTML by the server.';
  } else if (coverage < 0.3) {
    riskLevel = 'MEDIUM';
    issues.push('LOW_CONTENT_COVERAGE');
    issues.push('HEAVY_CLIENT_SIDE_RENDERING');
    summary = 'Less than 30% of the final page content is present in the initial HTML response. Search engines may have difficulty indexing this content.';
    recommendation = 'Move more content into the initial HTML payload. Consider using SSR for above-the-fold content and critical SEO elements.';
  } else if (coverage < 0.5) {
    riskLevel = 'MEDIUM';
    issues.push('MODERATE_CONTENT_COVERAGE');
    summary = 'Approximately 30-50% of content is present in initial HTML. Some SEO risk exists but is manageable.';
    recommendation = 'Continue to improve initial HTML content coverage. Prioritize rendering critical content server-side.';
  } else {
    riskLevel = 'LOW';
    summary = 'Good content coverage in initial HTML. Search engines should have no difficulty indexing this page.';
    recommendation = 'Current implementation is SEO-friendly. Maintain this approach for new pages.';
  }

  // Check for missing critical SEO elements
  if (!seoSignals.title.exists) {
    riskLevel = 'HIGH';
    issues.push('MISSING_TITLE_TAG');
    summary = 'Critical: Missing title tag. ' + summary;
  }

  if (!seoSignals.metaDescription.exists) {
    if (!issues.includes('MISSING_META_DESCRIPTION')) {
      issues.push('MISSING_META_DESCRIPTION');
    }
  }

  if (!seoSignals.h1.exists) {
    if (!issues.includes('MISSING_H1')) {
      issues.push('MISSING_H1');
    }
  } else if (seoSignals.h1.source === 'rendered') {
    issues.push('H1_ONLY_IN_RENDERED_DOM');
  }

  return {
    riskLevel,
    issues,
    summary,
    recommendation,
  };
}

