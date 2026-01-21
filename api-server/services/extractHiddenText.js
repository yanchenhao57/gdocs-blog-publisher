/**
 * Extract hidden text from HTML
 * Detects text that is hidden via CSS (display:none, visibility:hidden, aria-hidden)
 * This is important for SEO as search engines may ignore or penalize hidden content
 * 
 * @param {string} html - Raw HTML string
 * @returns {{hiddenTextLength: number, hiddenElementsCount: number, examples: string[]}}
 */
export function extractHiddenText(html) {
  if (!html || typeof html !== 'string') {
    return {
      hiddenTextLength: 0,
      hiddenElementsCount: 0,
      examples: [],
    };
  }

  let cleanHtml = html;

  // Remove script, style, noscript first (these are expected to be hidden)
  cleanHtml = cleanHtml.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
  cleanHtml = cleanHtml.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  cleanHtml = cleanHtml.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ');
  cleanHtml = cleanHtml.replace(/<!--[\s\S]*?-->/g, ' ');

  const hiddenPatterns = [
    {
      name: 'display:none',
      regex: /<([a-z][a-z0-9]*)\b[^>]*display\s*:\s*none[^>]*>([\s\S]*?)<\/\1>/gi,
    },
    {
      name: 'visibility:hidden',
      regex: /<([a-z][a-z0-9]*)\b[^>]*visibility\s*:\s*hidden[^>]*>([\s\S]*?)<\/\1>/gi,
    },
    {
      name: 'aria-hidden="true"',
      regex: /<([a-z][a-z0-9]*)\b[^>]*aria-hidden\s*=\s*["']true["'][^>]*>([\s\S]*?)<\/\1>/gi,
    },
    {
      name: 'hidden attribute',
      regex: /<([a-z][a-z0-9]*)\b[^>]*\bhidden\b[^>]*>([\s\S]*?)<\/\1>/gi,
    },
  ];

  let totalHiddenLength = 0;
  let hiddenElementsCount = 0;
  const examples = [];

  hiddenPatterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    
    while ((match = regex.exec(cleanHtml)) !== null) {
      hiddenElementsCount++;
      
      let content = match[2] || match[0];
      
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
      
      if (content.length > 10) { // Only count meaningful content
        totalHiddenLength += content.length;
        
        // Save first 3 examples for debugging
        if (examples.length < 3) {
          examples.push({
            type: pattern.name,
            preview: content.substring(0, 100),
            length: content.length,
          });
        }
      }
    }
  });

  return {
    hiddenTextLength: totalHiddenLength,
    hiddenElementsCount,
    examples: examples.map(ex => `[${ex.type}] ${ex.preview}... (${ex.length} chars)`),
  };
}

/**
 * Calculate hidden content ratio
 * @param {number} hiddenTextLength - Length of hidden text
 * @param {number} totalTextLength - Total text length (including hidden)
 * @returns {number} - Ratio (0-1)
 */
export function calculateHiddenRatio(hiddenTextLength, totalTextLength) {
  if (totalTextLength === 0) return 0;
  return Math.min(hiddenTextLength / (totalTextLength + hiddenTextLength), 1);
}
