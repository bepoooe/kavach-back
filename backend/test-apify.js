/**
 * Test script for Apify integration with privacy policy analysis
 */

require('dotenv').config();
const { EnhancedPolicyService } = require('./dist/services/enhanced-policy-service');
const { GeminiPrivacyAnalyzer } = require('./dist/services/gemini-analyzer');

async function testApifyIntegration() {
  console.log('🧪 Testing Apify Integration for Privacy Policy Analysis\n');

  try {
    // Test websites
    const testUrls = [
      'https://www.google.com',
      'https://www.facebook.com', 
      'https://www.amazon.com'
    ];

    console.log('🔧 Initializing services...');
    const enhancedService = new EnhancedPolicyService();
    const analyzer = new GeminiPrivacyAnalyzer();
    console.log('✅ Services initialized successfully\n');

    for (const url of testUrls) {
      console.log(`🔍 Testing enhanced analysis for: ${url}`);
      
      try {
        // Test comprehensive content gathering
        console.log('  📄 Getting comprehensive privacy content...');
        const comprehensiveContent = await enhancedService.getComprehensivePrivacyContent(url);
        
        console.log(`  ✅ Found ${comprehensiveContent.metadata.totalPages} pages`);
        console.log(`  📊 Total content: ${comprehensiveContent.metadata.totalWordCount} words`);
        console.log(`  🔧 Scraping method: ${comprehensiveContent.metadata.scrapingMethod}`);
        
        if (comprehensiveContent.additional.length > 0) {
          console.log(`  🔗 Additional pages found:`);
          comprehensiveContent.additional.forEach((page, idx) => {
            console.log(`    ${idx + 1}. ${page.title} (${page.url})`);
          });
        }

        // Test Gemini analysis
        console.log('  🤖 Running AI analysis...');
        const analysis = await analyzer.analyzePrivacyPolicy(
          comprehensiveContent.allContent.substring(0, 50000), // Limit for testing
          url,
          true // Enhanced mode
        );

        console.log(`  📊 Analysis Results:`);
        console.log(`    Safety: ${analysis.safety}`);
        console.log(`    Summary: ${analysis.summary}`);
        
        if (analysis.keyFindings) {
          console.log(`    Key Findings: ${analysis.keyFindings.join(', ')}`);
        }
        
        if (analysis.dataCollectionScore !== undefined) {
          console.log(`    Scores:`);
          console.log(`      Data Collection: ${analysis.dataCollectionScore}/100`);
          console.log(`      Third Party: ${analysis.thirdPartyScore}/100`);
          console.log(`      User Rights: ${analysis.userRightsScore}/100`);
          console.log(`      Transparency: ${analysis.transparencyScore}/100`);
        }

        console.log(`  ✅ Analysis completed successfully\n`);

      } catch (error) {
        console.error(`  ❌ Error testing ${url}:`, error.message);
        
        // Try fallback
        console.log(`  🔄 Trying fallback method...`);
        try {
          const fallbackContent = await enhancedService.getPrivacyContentWithFallback(url);
          console.log(`  ✅ Fallback successful: ${fallbackContent.text.length} chars`);
        } catch (fallbackError) {
          console.error(`  ❌ Fallback also failed:`, fallbackError.message);
        }
        console.log();
      }
    }

    console.log('🎉 Apify integration testing completed!');

  } catch (error) {
    console.error('❌ Test setup failed:', error);
  }
}

// Test specific Apify features
async function testApifyFeatures() {
  console.log('\n🔬 Testing specific Apify features...\n');

  try {
    const { ApifyScraper } = require('./dist/services/apify-scraper');
    const apifyScraper = new ApifyScraper();

    // Test finding privacy pages
    const testUrl = 'https://www.google.com';
    console.log(`🔍 Testing privacy page discovery for: ${testUrl}`);
    
    const privacyUrls = await apifyScraper.findPrivacyPages(testUrl);
    console.log(`✅ Found ${privacyUrls.length} privacy-related URLs:`);
    privacyUrls.forEach((url, idx) => {
      console.log(`  ${idx + 1}. ${url}`);
    });

    if (privacyUrls.length > 0) {
      // Test scraping those pages
      console.log(`\n📄 Testing content scraping for found URLs...`);
      const scrapedContent = await apifyScraper.scrapePrivacyPolicyPages(testUrl, privacyUrls.slice(0, 2));
      
      console.log(`✅ Scraped ${scrapedContent.length} pages successfully:`);
      scrapedContent.forEach((content, idx) => {
        console.log(`  ${idx + 1}. ${content.title} - ${content.text.length} chars`);
      });
    }

  } catch (error) {
    console.error('❌ Apify features test failed:', error.message);
  }
}

// Check environment setup
async function checkEnvironment() {
  console.log('🔍 Checking environment setup...\n');

  const requiredVars = {
    'GEMINI_API_KEY': process.env.GEMINI_API_KEY,
    'APIFY_API_KEY': process.env.APIFY_API_KEY
  };

  for (const [varName, value] of Object.entries(requiredVars)) {
    if (value) {
      console.log(`✅ ${varName}: Set (${value.substring(0, 10)}...)`);
    } else {
      console.log(`❌ ${varName}: Not set`);
    }
  }
  console.log();
}

// Run all tests
async function runAllTests() {
  await checkEnvironment();
  await testApifyIntegration();
  await testApifyFeatures();
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testApifyIntegration,
  testApifyFeatures,
  checkEnvironment
};
