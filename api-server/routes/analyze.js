import express from 'express';
import { fetchHtml } from '../services/fetchHtml.js';
import { extractText } from '../services/extractText.js';
import { renderWithPlaywright } from '../services/renderWithPlaywright.js';
import { calculateSemanticRatio } from '../services/extractSemanticText.js';
import { calculateHiddenRatio } from '../services/extractHiddenText.js';
import { 
  analyzeSEOSignals, 
  calculateContentCoverage, 
  diagnose 
} from '../services/seoInspector.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Analyze a URL for SEO and SSR content detection
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { url } = req.body;

    // Validate input
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'URL is required and must be a string',
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid URL with protocol (http:// or https://)',
      });
    }

    console.log(`[Analyze] Starting analysis for: ${url}`);

    // Step 1: Fetch HTML with Googlebot UA
    let fetchResult;
    try {
      fetchResult = await fetchHtml(url);
    } catch (error) {
      console.error('[Analyze] Fetch failed:', error);
      return res.status(500).json({
        error: 'Fetch failed',
        message: error.message,
        diagnosis: {
          riskLevel: 'HIGH',
          issues: ['FETCH_FAILED'],
          summary: `Failed to fetch URL: ${error.message}`,
          recommendation: 'Ensure the URL is accessible and the server is responding correctly.',
        },
      });
    }

    console.log(`[Analyze] Fetched ${fetchResult.htmlSize} bytes (HTTP ${fetchResult.status})`);

    // Step 2: Extract text from HTML
    const htmlContent = extractText(fetchResult.html);
    console.log(`[Analyze] Extracted ${htmlContent.textLength} characters from HTML`);

    // Step 3: Render with Playwright (currently mocked)
    const renderedContent = await renderWithPlaywright(url);
    console.log(`[Analyze] Rendered content: ${renderedContent.enabled ? 'enabled' : 'disabled'}`);

    // Step 4: Analyze SEO signals
    const seoSignals = analyzeSEOSignals(fetchResult.html);
    console.log('[Analyze] SEO signals analyzed');

    // Step 5: Calculate metrics
    const contentCoverage = calculateContentCoverage(
      htmlContent.textLength,
      renderedContent.enabled ? renderedContent.textLength : htmlContent.textLength
    );

    // Calculate semantic coverage (more accurate SEO metric)
    const semanticCoverage = renderedContent.enabled
      ? calculateContentCoverage(
          htmlContent.semanticTextLength,
          renderedContent.semanticTextLength
        )
      : 1.0;

    // Calculate semantic ratios (quality of content)
    const htmlSemanticRatio = calculateSemanticRatio(
      htmlContent.semanticTextLength,
      htmlContent.textLength
    );

    const renderedSemanticRatio = renderedContent.enabled
      ? calculateSemanticRatio(
          renderedContent.semanticTextLength,
          renderedContent.textLength
        )
      : htmlSemanticRatio;

    // Calculate hidden content ratios
    const htmlHiddenRatio = calculateHiddenRatio(
      htmlContent.hiddenTextLength,
      htmlContent.textLength
    );

    const renderedHiddenRatio = renderedContent.enabled
      ? calculateHiddenRatio(
          renderedContent.hiddenTextLength,
          renderedContent.textLength
        )
      : htmlHiddenRatio;

    console.log(`[Analyze] Metrics - Coverage: ${contentCoverage.toFixed(3)}, Semantic: ${semanticCoverage.toFixed(3)}, Hidden: ${htmlContent.hiddenTextLength}/${htmlContent.hiddenElementsCount} elements`);

    // Step 6: Diagnose
    const diagnosis = diagnose(
      contentCoverage,
      htmlContent.textLength,
      renderedContent.enabled ? renderedContent.textLength : htmlContent.textLength,
      seoSignals
    );

    const responseTime = Date.now() - startTime;
    console.log(`[Analyze] Completed in ${responseTime}ms - Risk: ${diagnosis.riskLevel}`);

    // Step 7: Build response
    const response = {
      url,
      fetch: {
        status: fetchResult.status,
        htmlSize: fetchResult.htmlSize,
        headers: fetchResult.headers,
      },
      htmlContent: {
        textLength: htmlContent.textLength,
        semanticTextLength: htmlContent.semanticTextLength,
        hiddenTextLength: htmlContent.hiddenTextLength,
        hiddenElementsCount: htmlContent.hiddenElementsCount,
        paragraphCount: htmlContent.paragraphCount,
        previewText: htmlContent.previewText,
        fullText: htmlContent.fullText,
      },
      renderedContent: {
        enabled: renderedContent.enabled,
        textLength: renderedContent.textLength,
        semanticTextLength: renderedContent.semanticTextLength,
        hiddenTextLength: renderedContent.hiddenTextLength,
        hiddenElementsCount: renderedContent.hiddenElementsCount,
        paragraphCount: renderedContent.paragraphCount,
        previewText: renderedContent.previewText,
        fullText: renderedContent.fullText,
      },
      metrics: {
        contentCoverage: Math.round(contentCoverage * 1000) / 1000,
        semanticCoverage: Math.round(semanticCoverage * 1000) / 1000,
        htmlSemanticRatio: Math.round(htmlSemanticRatio * 1000) / 1000,
        renderedSemanticRatio: Math.round(renderedSemanticRatio * 1000) / 1000,
        htmlHiddenRatio: Math.round(htmlHiddenRatio * 1000) / 1000,
        renderedHiddenRatio: Math.round(renderedHiddenRatio * 1000) / 1000,
      },
      seoSignals,
      diagnosis,
      _meta: {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('[Analyze] Unexpected error:', error);
    
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
      diagnosis: {
        riskLevel: 'HIGH',
        issues: ['ANALYSIS_ERROR'],
        summary: `An unexpected error occurred during analysis: ${error.message}`,
        recommendation: 'Please try again or contact support if the issue persists.',
      },
    });
  }
});

/**
 * GET /api/analyze/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'analyze',
    timestamp: new Date().toISOString(),
  });
});

export default router;

