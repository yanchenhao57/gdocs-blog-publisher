/**
 * Extract semantic text from HTML using regex
 * Focuses on semantic tags: main, article, section, p, h1-h6, li
 * Filters out hidden elements (display:none, visibility:hidden, aria-hidden)
 * 
 * @param {string} html - Raw HTML string
 * @returns {number} - Length of semantic text
 */
export function extractSemanticText(html) {
  if (!html || typeof html !== 'string') {
    return 0;
  }

  let cleanHtml = html;

  // Step 1: Remove script, style, noscript first
  cleanHtml = cleanHtml.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
  cleanHtml = cleanHtml.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  cleanHtml = cleanHtml.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ');
  cleanHtml = cleanHtml.replace(/<!--[\s\S]*?-->/g, ' ');

  // Step 2: Extract content from semantic tags
  const semanticTags = [
    'main',
    'article',
    'section',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'li',
  ];

  const chunks = [];

  semanticTags.forEach((tag) => {
    // Match opening and closing tags with content
    const regex = new RegExp(
      `<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`,
      'gi'
    );
    let match;

    while ((match = regex.exec(cleanHtml)) !== null) {
      // Skip if element is hidden (SEO bots ignore these)
      if (
        match[0].includes('display:none') ||
        match[0].includes('display: none') ||
        match[0].includes('visibility:hidden') ||
        match[0].includes('visibility: hidden') ||
        match[0].includes('aria-hidden="true"')
      ) {
        continue;
      }

      let content = match[1];

      // Remove nested HTML tags
      content = content.replace(/<[^>]+>/g, ' ');

      // Decode HTML entities
      content = content
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–');

      // Clean whitespace
      content = content.replace(/\s+/g, ' ').trim();

      // Only keep chunks with meaningful content (> 20 chars to avoid button text, etc.)
      if (content.length > 20) {
        chunks.push(content);
      }
    }
  });

  const semanticText = chunks.join(' ');
  return semanticText.length;
}

/**
 * Calculate semantic content ratio
 * @param {number} semanticTextLength - Length of semantic text
 * @param {number} totalTextLength - Total text length
 * @returns {number} - Ratio (0-1)
 */
export function calculateSemanticRatio(semanticTextLength, totalTextLength) {
  if (totalTextLength === 0) return 0;
  return Math.min(semanticTextLength / totalTextLength, 1);
}
