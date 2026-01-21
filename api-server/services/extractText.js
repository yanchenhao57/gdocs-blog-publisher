import { extractSemanticText } from './extractSemanticText.js';
import { extractHiddenText } from './extractHiddenText.js';

/**
 * Extract readable text from HTML
 * Removes script, style, noscript tags and HTML tags
 * @param {string} html - Raw HTML string
 * @returns {{textLength: number, semanticTextLength: number, hiddenTextLength: number, hiddenElementsCount: number, paragraphCount: number, previewText: string, fullText: string}}
 */
export function extractText(html) {
  if (!html || typeof html !== "string") {
    return {
      textLength: 0,
      semanticTextLength: 0,
      hiddenTextLength: 0,
      hiddenElementsCount: 0,
      paragraphCount: 0,
      previewText: "",
      fullText: "",
    };
  }

  let text = html;

  // Remove script tags and their content (including inline scripts)
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");

  // Remove style tags and their content
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");

  // Remove noscript tags and their content
  text = text.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ");

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, " ");

  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");

  // Remove excessive whitespace
  text = text.replace(/\s+/g, " ").trim();

  // Calculate paragraph count (split by double newlines or sentence boundaries)
  const paragraphs = text.split(/[.!?]\s+/).filter((p) => p.trim().length > 20);
  const paragraphCount = paragraphs.length;

  const textLength = text.length;
  const previewText = text.substring(0, 200);

  // Extract semantic text length
  const semanticTextLength = extractSemanticText(html);

  // Extract hidden text info
  const hiddenInfo = extractHiddenText(html);

  return {
    textLength,
    semanticTextLength,
    hiddenTextLength: hiddenInfo.hiddenTextLength,
    hiddenElementsCount: hiddenInfo.hiddenElementsCount,
    paragraphCount,
    previewText,
    fullText: text,
  };
}
