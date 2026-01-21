/**
 * Test script for the updated /api/analyze endpoint
 * Tests the new semantic text analysis features
 */

const testUrl = 'https://www.notta.ai/en';

async function testAnalyzeAPI() {
  console.log('🧪 Testing /api/analyze endpoint with semantic text analysis\n');
  console.log(`📍 Test URL: ${testUrl}\n`);

  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: testUrl }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ API Response received\n');
    console.log('═'.repeat(70));
    console.log('📊 METRICS SUMMARY');
    console.log('═'.repeat(70));
    
    console.log('\n📄 HTML Content (Initial):');
    console.log(`   Total Text Length:    ${data.htmlContent.textLength} chars`);
    console.log(`   Semantic Text Length: ${data.htmlContent.semanticTextLength} chars`);
    console.log(`   Hidden Text Length:   ${data.htmlContent.hiddenTextLength} chars 🔒`);
    console.log(`   Hidden Elements:      ${data.htmlContent.hiddenElementsCount} elements`);
    console.log(`   Paragraph Count:      ${data.htmlContent.paragraphCount}`);
    
    console.log('\n🎨 Rendered Content (After JS):');
    console.log(`   Enabled:              ${data.renderedContent.enabled}`);
    console.log(`   Total Text Length:    ${data.renderedContent.textLength} chars`);
    console.log(`   Semantic Text Length: ${data.renderedContent.semanticTextLength} chars`);
    console.log(`   Hidden Text Length:   ${data.renderedContent.hiddenTextLength} chars 🔒`);
    console.log(`   Hidden Elements:      ${data.renderedContent.hiddenElementsCount} elements`);
    console.log(`   Paragraph Count:      ${data.renderedContent.paragraphCount}`);
    
    console.log('\n📈 Coverage Metrics:');
    console.log(`   Content Coverage:     ${(data.metrics.contentCoverage * 100).toFixed(1)}%`);
    console.log(`   Semantic Coverage:    ${(data.metrics.semanticCoverage * 100).toFixed(1)}% ⭐ (More accurate for SEO)`);
    console.log(`   HTML Semantic Ratio:  ${(data.metrics.htmlSemanticRatio * 100).toFixed(1)}%`);
    console.log(`   Rendered Semantic:    ${(data.metrics.renderedSemanticRatio * 100).toFixed(1)}%`);
    console.log(`   HTML Hidden Ratio:    ${(data.metrics.htmlHiddenRatio * 100).toFixed(1)}% 🔒`);
    console.log(`   Rendered Hidden:      ${(data.metrics.renderedHiddenRatio * 100).toFixed(1)}% 🔒`);
    
    console.log('\n🔍 SEO Signals:');
    console.log(`   Title:                ${data.seoSignals.title.exists ? '✅' : '❌'} (${data.seoSignals.title.source || 'N/A'})`);
    console.log(`   Meta Description:     ${data.seoSignals.metaDescription.exists ? '✅' : '❌'} (${data.seoSignals.metaDescription.source || 'N/A'})`);
    console.log(`   H1:                   ${data.seoSignals.h1.exists ? '✅' : '❌'} (${data.seoSignals.h1.source || 'N/A'})`);
    console.log(`   Canonical:            ${data.seoSignals.canonical.exists ? '✅' : '❌'}`);
    console.log(`   Hreflang Count:       ${data.seoSignals.hreflangCount}`);
    
    console.log('\n⚠️  Diagnosis:');
    console.log(`   Risk Level:           ${data.diagnosis.riskLevel}`);
    console.log(`   Issues:               ${data.diagnosis.issues.join(', ')}`);
    console.log(`   Summary:              ${data.diagnosis.summary}`);
    
    console.log('\n' + '═'.repeat(70));
    console.log('💡 INTERPRETATION');
    console.log('═'.repeat(70));
    
    const semanticDiff = data.htmlContent.semanticTextLength - data.renderedContent.semanticTextLength;
    const semanticCoverage = data.metrics.semanticCoverage;
    
    if (semanticCoverage >= 0.8) {
      console.log('\n✅ EXCELLENT: Semantic content is well-represented in initial HTML');
      console.log('   Search engines can easily index your main content.');
    } else if (semanticCoverage >= 0.5) {
      console.log('\n⚠️  WARNING: Significant semantic content is loaded via JavaScript');
      console.log('   Consider moving more core content to server-side rendering.');
    } else {
      console.log('\n🔴 CRITICAL: Most semantic content is missing from initial HTML');
      console.log('   This will severely impact SEO. Implement SSR/SSG immediately.');
    }
    
    console.log(`\n📊 Semantic Text Analysis:`);
    console.log(`   - Initial HTML has ${data.htmlContent.semanticTextLength} chars of semantic content`);
    console.log(`   - After rendering: ${data.renderedContent.semanticTextLength} chars`);
    console.log(`   - Difference: ${Math.abs(semanticDiff)} chars ${semanticDiff > 0 ? 'lost' : 'gained'} after JS execution`);
    
    console.log(`\n🔒 Hidden Content Analysis:`);
    console.log(`   - Initial HTML: ${data.htmlContent.hiddenTextLength} chars hidden in ${data.htmlContent.hiddenElementsCount} elements`);
    console.log(`   - After rendering: ${data.renderedContent.hiddenTextLength} chars hidden in ${data.renderedContent.hiddenElementsCount} elements`);
    
    if (data.htmlContent.hiddenTextLength > 1000) {
      console.log(`   ⚠️  WARNING: Significant hidden content detected (${data.htmlContent.hiddenTextLength} chars)`);
      console.log(`   Search engines may ignore or penalize hidden content.`);
    } else if (data.htmlContent.hiddenTextLength > 0) {
      console.log(`   ℹ️  Small amount of hidden content detected (acceptable for UI elements)`);
    } else {
      console.log(`   ✅ No hidden content detected`);
    }
    
    console.log('\n✅ Test completed successfully!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run test
testAnalyzeAPI();
