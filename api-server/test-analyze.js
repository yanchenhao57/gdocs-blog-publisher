#!/usr/bin/env node

/**
 * Test script for the /api/analyze endpoint
 * Usage: node api-server/test-analyze.js [URL]
 */

import fetch from 'node-fetch';

const API_BASE = process.env.API_URL || 'http://localhost:3000';
const testUrl = process.argv[2] || 'https://example.com';

console.log('🧪 Testing /api/analyze endpoint\n');
console.log(`📍 API Base: ${API_BASE}`);
console.log(`🌐 Test URL: ${testUrl}\n`);

async function testAnalyze(url) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Sending request...');
    
    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    const requestTime = Date.now() - startTime;
    console.log(`✅ Response received in ${requestTime}ms\n`);
    
    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const errorData = await response.json();
      console.error('Error details:', JSON.stringify(errorData, null, 2));
      return;
    }
    
    const data = await response.json();
    
    // Print summary
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 ANALYSIS RESULTS');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log(`🌐 URL: ${data.url}`);
    console.log(`📦 HTTP Status: ${data.fetch.status}`);
    console.log(`📏 HTML Size: ${(data.fetch.htmlSize / 1024).toFixed(2)} KB`);
    console.log(`📝 HTML Text Length: ${data.htmlContent.textLength} chars`);
    console.log(`🎨 Rendered (${data.renderedContent.enabled ? 'enabled' : 'disabled'}): ${data.renderedContent.textLength} chars`);
    console.log(`📊 Content Coverage: ${(data.metrics.contentCoverage * 100).toFixed(1)}%`);
    
    console.log('\n🔍 SEO SIGNALS:');
    console.log(`   Title: ${data.seoSignals.title.exists ? '✅' : '❌'} (${data.seoSignals.title.source || 'N/A'})`);
    console.log(`   Meta Description: ${data.seoSignals.metaDescription.exists ? '✅' : '❌'} (${data.seoSignals.metaDescription.source || 'N/A'})`);
    console.log(`   H1: ${data.seoSignals.h1.exists ? '✅' : '❌'} (${data.seoSignals.h1.source || 'N/A'})`);
    console.log(`   Canonical: ${data.seoSignals.canonical.exists ? '✅' : '❌'}`);
    console.log(`   Hreflang Links: ${data.seoSignals.hreflangCount}`);
    
    console.log('\n⚠️  DIAGNOSIS:');
    console.log(`   Risk Level: ${getRiskIcon(data.diagnosis.riskLevel)} ${data.diagnosis.riskLevel}`);
    console.log(`   Issues: ${data.diagnosis.issues.join(', ') || 'None'}`);
    console.log(`   Summary: ${data.diagnosis.summary}`);
    console.log(`   Recommendation: ${data.diagnosis.recommendation}`);
    
    console.log('\n📄 HTML PREVIEW (first 200 chars):');
    console.log(`   "${data.htmlContent.previewText}"`);
    
    if (data._meta) {
      console.log(`\n⏱️  Server Response Time: ${data._meta.responseTime}`);
    }
    
    console.log('\n═══════════════════════════════════════════════════\n');
    
    // Optionally print full JSON
    if (process.argv.includes('--full')) {
      console.log('📋 Full Response:');
      console.log(JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

function getRiskIcon(level) {
  switch (level) {
    case 'HIGH': return '🔴';
    case 'MEDIUM': return '🟡';
    case 'LOW': return '🟢';
    default: return '⚪';
  }
}

// Run test
console.log('Starting test...\n');
testAnalyze(testUrl);

