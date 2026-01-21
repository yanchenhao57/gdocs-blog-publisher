import { extractSemanticText } from './extractSemanticText.js';
import { extractHiddenText } from './extractHiddenText.js';

/**
 * Render page with Playwright
 * @param {string} url - The URL to render
 * @returns {Promise<{enabled: boolean, textLength: number, semanticTextLength: number, hiddenTextLength: number, hiddenElementsCount: number, paragraphCount: number, previewText: string, fullText: string}>}
 */
export async function renderWithPlaywright(url) {
  try {
    console.log(`[Playwright] Starting render for: ${url}`);
    
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      viewport: { width: 1920, height: 1080 },
    });
    
    const page = await context.newPage();
    
    // Navigate and wait for network idle
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait a bit more for any lazy-loaded content
    await page.waitForTimeout(2000);
    
    // Extract both text and HTML content from body
    const { bodyText, bodyHTML } = await page.evaluate(() => {
      return {
        bodyText: document.body.innerText,
        bodyHTML: document.body.innerHTML,
      };
    });
    
    await browser.close();
    
    console.log(`[Playwright] Render complete, extracted ${bodyText.length} characters`);
    
    const result = processRenderedText(bodyText, bodyHTML);
    return {
      ...result,
      enabled: true,
    };
  } catch (error) {
    console.error(`[Playwright] Render failed:`, error.message);
    
    // Return fallback data on error
    return {
      enabled: false,
      textLength: 0,
      semanticTextLength: 0,
      hiddenTextLength: 0,
      hiddenElementsCount: 0,
      paragraphCount: 0,
      previewText: '',
      fullText: `(Rendering failed: ${error.message})`,
    };
  }
}

/**
 * Process rendered text from browser
 * @param {string} text - Raw text from browser
 * @param {string} html - Rendered HTML from browser
 * @returns {{textLength: number, semanticTextLength: number, hiddenTextLength: number, hiddenElementsCount: number, paragraphCount: number, previewText: string, fullText: string}}
 */
function processRenderedText(text, html) {
  if (!text) {
    return {
      textLength: 0,
      semanticTextLength: 0,
      hiddenTextLength: 0,
      hiddenElementsCount: 0,
      paragraphCount: 0,
      previewText: '',
      fullText: '',
    };
  }
  
  // Clean up text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Count paragraphs
  const lines = text.split('\n').filter(line => line.trim().length > 20);
  const paragraphCount = lines.length;
  
  // Extract semantic text length from rendered HTML
  const semanticTextLength = extractSemanticText(html || '');
  
  // Extract hidden text info from rendered HTML
  const hiddenInfo = extractHiddenText(html || '');
  
  return {
    textLength: cleanText.length,
    semanticTextLength,
    hiddenTextLength: hiddenInfo.hiddenTextLength,
    hiddenElementsCount: hiddenInfo.hiddenElementsCount,
    paragraphCount,
    previewText: cleanText.substring(0, 200),
    fullText: cleanText,
  };
}

