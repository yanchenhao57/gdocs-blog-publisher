# SEO Analyze API Documentation

## Overview

The `/api/analyze` endpoint analyzes a URL to detect what content is visible to search engines (Googlebot) versus what appears after JavaScript rendering. This helps identify SSR/SEO issues.

## Endpoint

```
POST /api/analyze
```

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "url": "https://www.example.com"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| url | string | Yes | Full URL including protocol (http:// or https://) |

## Response

### Success Response (200 OK)

```json
{
  "url": "https://www.example.com",
  "fetch": {
    "status": 200,
    "htmlSize": 477128,
    "headers": {
      "x-robots-tag": "index, follow",
      "content-type": "text/html;charset=utf-8"
    }
  },
  "htmlContent": {
    "textLength": 32,
    "paragraphCount": 1,
    "previewText": "First 200 characters of text...",
    "fullText": "Complete extracted text from HTML"
  },
  "renderedContent": {
    "enabled": false,
    "textLength": 0,
    "paragraphCount": 0,
    "previewText": "",
    "fullText": "(Playwright rendering not yet enabled)"
  },
  "metrics": {
    "contentCoverage": 0.007
  },
  "seoSignals": {
    "title": {
      "exists": true,
      "source": "html"
    },
    "metaDescription": {
      "exists": true,
      "source": "html"
    },
    "h1": {
      "exists": true,
      "source": "html"
    },
    "canonical": {
      "exists": true
    },
    "hreflangCount": 14
  },
  "diagnosis": {
    "riskLevel": "HIGH",
    "issues": [
      "MAIN_CONTENT_MISSING_IN_HTML",
      "CONTENT_RENDERED_BY_JS"
    ],
    "summary": "Main page content is not present in the initial HTML and only appears after JavaScript execution.",
    "recommendation": "Implement Server-Side Rendering (SSR) or Static Site Generation (SSG). Ensure critical page content is rendered directly in the HTML by the server."
  },
  "_meta": {
    "responseTime": "1234ms",
    "timestamp": "2024-01-09T10:30:00.000Z"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "error": "Invalid URL",
  "message": "Please provide a valid URL with protocol (http:// or https://)"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "error": "Fetch failed",
  "message": "Failed to fetch URL: Connection timeout",
  "diagnosis": {
    "riskLevel": "HIGH",
    "issues": ["FETCH_FAILED"],
    "summary": "Failed to fetch URL: Connection timeout",
    "recommendation": "Ensure the URL is accessible and the server is responding correctly."
  }
}
```

## Response Fields

### `fetch` Object
- `status` (number): HTTP status code from the request
- `htmlSize` (number): Size of HTML response in bytes
- `headers` (object): Relevant SEO headers (x-robots-tag, content-type, etc.)

### `htmlContent` Object
Represents content extracted from the initial HTML response (what Googlebot sees first):
- `textLength` (number): Total length of readable text
- `paragraphCount` (number): Estimated number of paragraphs
- `previewText` (string): First 200 characters
- `fullText` (string): Complete extracted text

### `renderedContent` Object
Represents content after JavaScript execution (what users see):
- `enabled` (boolean): Whether Playwright rendering was performed
- `textLength` (number): Total length of rendered text
- `paragraphCount` (number): Estimated number of paragraphs
- `previewText` (string): First 200 characters
- `fullText` (string): Complete rendered text

**Note**: Currently mocked. Will be implemented with Playwright.

### `metrics` Object
- `contentCoverage` (number): Ratio of HTML text to rendered text (0-1)
  - Values close to 1.0 indicate good SSR
  - Values close to 0.0 indicate client-side rendering issues

### `seoSignals` Object
Analysis of critical SEO elements:
- `title`: Whether `<title>` tag exists and where it's sourced from
- `metaDescription`: Whether meta description exists
- `h1`: Whether H1 heading exists and where it's sourced from
- `canonical`: Whether canonical link exists
- `hreflangCount`: Number of hreflang alternate links

### `diagnosis` Object
- `riskLevel` (string): One of: `"HIGH"`, `"MEDIUM"`, `"LOW"`
- `issues` (array): List of detected issues
- `summary` (string): Human-readable summary
- `recommendation` (string): Actionable recommendations

### Risk Level Logic

| Risk Level | Conditions |
|------------|------------|
| HIGH | - HTML text < 300 characters AND rendered text > 1000 characters<br>- Missing title tag |
| MEDIUM | - Content coverage < 30%<br>- Content coverage 30-50% |
| LOW | - Content coverage >= 50% |

## Usage Examples

### cURL

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com"}'
```

### JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://www.example.com'
  })
});

const data = await response.json();
console.log(data);
```

### Node.js Test Script

```javascript
import fetch from 'node-fetch';

async function testAnalyze(url) {
  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    const data = await response.json();
    console.log('Risk Level:', data.diagnosis.riskLevel);
    console.log('Coverage:', data.metrics.contentCoverage);
    console.log('Summary:', data.diagnosis.summary);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAnalyze('https://www.example.com');
```

## Health Check

```
GET /api/analyze/health
```

Returns:
```json
{
  "status": "ok",
  "service": "analyze",
  "timestamp": "2024-01-09T10:30:00.000Z"
}
```

## Implementation Status

✅ **Implemented**
- HTML fetching with Googlebot User-Agent
- Text extraction from HTML
- SEO signal detection (title, meta, h1, canonical, hreflang)
- Content coverage calculation
- Risk level diagnosis
- Comprehensive error handling

⏳ **Planned**
- Playwright rendering integration (currently mocked)
- Screenshot capture
- Performance metrics
- JavaScript error detection

## Code Structure

```
api-server/
├── routes/
│   └── analyze.js          # Main API route handler
├── services/
│   ├── fetchHtml.js        # HTML fetching with Googlebot UA
│   ├── extractText.js      # Text extraction from HTML
│   ├── renderWithPlaywright.js  # Browser rendering (mocked)
│   └── seoInspector.js     # SEO analysis and diagnosis
└── types/
    └── analyze.js          # TypeScript/JSDoc type definitions
```

## Notes

1. **Rate Limiting**: Not implemented. Consider adding for production.
2. **Caching**: No caching implemented. Each request performs a fresh analysis.
3. **Timeout**: Fetch timeout is set to 30 seconds.
4. **User-Agent**: Uses official Googlebot UA string.
5. **Playwright**: Currently disabled. Set `enabled: false` in `renderedContent`.

## Testing

Start the server:
```bash
npm run start
```

Test the endpoint:
```bash
node api-server/test-analyze.js
```

Or use the provided test script in this directory.

