/**
 * @typedef {Object} FetchResult
 * @property {number} status - HTTP status code
 * @property {number} htmlSize - Size of HTML in bytes
 * @property {Object} headers - Relevant SEO headers
 */

/**
 * @typedef {Object} ContentResult
 * @property {number} textLength - Length of extracted text (all visible text)
 * @property {number} semanticTextLength - Length of semantic text (from main/article/p/h1-h6/li)
 * @property {number} hiddenTextLength - Length of hidden text (display:none, visibility:hidden, etc.)
 * @property {number} hiddenElementsCount - Number of hidden elements found
 * @property {number} paragraphCount - Number of paragraphs
 * @property {string} previewText - First 200 characters
 * @property {string} fullText - Full extracted text
 */

/**
 * @typedef {Object} RenderedContentResult
 * @property {boolean} enabled - Whether rendering was performed
 * @property {number} textLength - Length of rendered text (all visible text)
 * @property {number} semanticTextLength - Length of semantic text after rendering
 * @property {number} hiddenTextLength - Length of hidden text after rendering
 * @property {number} hiddenElementsCount - Number of hidden elements in rendered page
 * @property {number} paragraphCount - Number of paragraphs
 * @property {string} previewText - First 200 characters
 * @property {string} fullText - Full rendered text
 */

/**
 * @typedef {Object} SEOSignal
 * @property {boolean} exists - Whether the element exists
 * @property {string} [source] - Source of the element (html/rendered)
 */

/**
 * @typedef {Object} SEOSignals
 * @property {SEOSignal} title
 * @property {SEOSignal} metaDescription
 * @property {SEOSignal} h1
 * @property {SEOSignal} canonical
 * @property {number} hreflangCount
 */

/**
 * @typedef {Object} Diagnosis
 * @property {'HIGH'|'MEDIUM'|'LOW'} riskLevel
 * @property {string[]} issues
 * @property {string} summary
 * @property {string} recommendation
 */

/**
 * @typedef {Object} Metrics
 * @property {number} contentCoverage - Overall content coverage (htmlText / renderedText)
 * @property {number} semanticCoverage - Semantic content coverage (more accurate for SEO)
 * @property {number} htmlSemanticRatio - Ratio of semantic text in HTML (quality indicator)
 * @property {number} renderedSemanticRatio - Ratio of semantic text after rendering
 * @property {number} htmlHiddenRatio - Ratio of hidden text in HTML
 * @property {number} renderedHiddenRatio - Ratio of hidden text after rendering
 */

/**
 * @typedef {Object} AnalyzeResponse
 * @property {string} url
 * @property {FetchResult} fetch
 * @property {ContentResult} htmlContent
 * @property {RenderedContentResult} renderedContent
 * @property {Metrics} metrics
 * @property {SEOSignals} seoSignals
 * @property {Diagnosis} diagnosis
 */

export default {};

