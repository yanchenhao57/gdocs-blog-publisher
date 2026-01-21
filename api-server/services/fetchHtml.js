import fetch from 'node-fetch';

/**
 * Fetch HTML content using Googlebot User-Agent
 * @param {string} url - The URL to fetch
 * @returns {Promise<{status: number, htmlSize: number, headers: Object, html: string}>}
 */
export async function fetchHtml(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  try {
    const response = await fetch(url, {
      headers,
      redirect: 'follow',
      timeout: 30000,
    });

    const html = await response.text();
    const htmlSize = Buffer.byteLength(html, 'utf8');

    // Extract relevant SEO headers
    const relevantHeaders = {};
    const seoHeaders = ['x-robots-tag', 'content-type', 'content-language', 'link'];
    
    seoHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        relevantHeaders[header] = value;
      }
    });

    return {
      status: response.status,
      htmlSize,
      headers: relevantHeaders,
      html,
    };
  } catch (error) {
    console.error('Error fetching HTML:', error);
    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
}

