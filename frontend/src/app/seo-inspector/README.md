# SEO Content Inspector

A powerful tool to audit and analyze what search engines see vs. what users see on your website. This tool helps identify SEO risks by comparing the initial HTML response with the final JavaScript-rendered content.

## Features

### 1. URL Input & Analysis
- Simple, intuitive interface for entering URLs to audit
- Real-time validation for proper URL formatting
- One-click audit initiation

### 2. Content Comparison View
- **Side-by-side comparison** of initial HTML vs. rendered HTML
- Color-coded panels for easy differentiation:
  - **Left Panel (Rose)**: Raw HTML snapshot (what Googlebot sees initially)
  - **Right Panel (Green)**: Fully rendered DOM (what users see after JavaScript execution)
- Scrollable code views with syntax highlighting

### 3. SEO Element Visibility Table
Track the visibility status of critical SEO elements:
- **Title tag**
- **Meta Description**
- **H1 headings**
- **H2 headings**
- **Canonical URL**
- **hreflang attributes**

Each element shows:
- Initial value in HTML
- Final rendered value after JavaScript
- Visibility status (Found/Missing)

### 4. Comprehensive Audit Results

**Summary Banner**
- Color-coded status indicator (High Risk / Warning / Optimal)
- Quick assessment of overall SEO health

**Key Metrics Dashboard**
- Analyzed URL
- HTTP fetch status and response size
- Robots/Indexing directives
- **HTML Content Coverage** - percentage of final content visible in initial HTML

### 5. Expert Recommendations

**Technical Explanation**
- Detailed analysis of why content visibility matters
- Explanation of search engine two-pass indexing system
- JavaScript rendering implications for SEO

**Frontend Recommendations**
- Actionable suggestions for improvement
- Server-Side Rendering (SSR) guidance
- Static Site Generation (SSG) best practices
- Code examples and implementation tips

## Technology Stack

- **Next.js 15** (App Router)
- **React 19** with TypeScript
- **CSS Modules** for component styling
- **Functional components** with typed props (following project conventions)

## File Structure

```
/frontend/src/app/seo-inspector/
├── page.tsx                      # Server component with metadata
├── SeoInspectorClient.tsx        # Main client component
├── README.md                     # This file
└── modules/
    ├── types.ts                  # TypeScript interfaces
    ├── mockData.ts               # Demo data for testing
    ├── InputStep.tsx             # URL input page
    ├── InputStep.module.css
    ├── ResultsStep.tsx           # Results display page
    ├── ResultsStep.module.css
    ├── ComparisonView.tsx        # HTML comparison component
    ├── ComparisonView.module.css
    ├── VisibilityTable.tsx       # SEO elements table
    └── VisibilityTable.module.css
```

## Usage

1. Navigate to `/seo-inspector` or use the navigation menu
2. Enter a full URL (including protocol: http:// or https://)
3. Click "Audit Page" to analyze
4. Review the comprehensive results:
   - Check the status banner for overall health
   - Compare initial vs. rendered HTML
   - Review SEO element visibility
   - Read technical explanations and recommendations
5. Export report (UI representation for now)
6. Click "Analyze another URL" to restart

## Design Philosophy

This tool follows the project's design patterns:
- **Clean, modern UI** with professional styling
- **Responsive layout** that works on all screen sizes
- **Accessibility-first** approach with semantic HTML
- **Performance-optimized** with CSS Modules
- **Type-safe** with comprehensive TypeScript coverage

## Future Enhancements

Potential features for future development:
- Real-time URL fetching and analysis (API integration)
- Historical audit tracking and comparison
- Batch URL analysis
- Custom SEO element configuration
- PDF report generation
- Integration with Google Search Console
- Lighthouse score integration
- Mobile vs. Desktop comparison

## Notes

Currently uses mock data for demonstration purposes. The tool provides a complete UI representation of the audit workflow and can be connected to a backend API for real-time URL analysis.

