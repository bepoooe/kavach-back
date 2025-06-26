// Simple test for the running Express server
const http = require('http');

// Test data
const testUrl = 'https://www.google.com';

// Test the privacy policy find endpoint
function testFindPrivacyPolicy() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/privacy-policy/find?url=${encodeURIComponent(testUrl)}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Find Privacy Policy Test Result:');
          console.log(JSON.stringify(result, null, 2));
          resolve(result);
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.end();
  });
}

// Test the privacy policy analysis endpoint
function testAnalyzePrivacyPolicy() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      url: testUrl,
      enhanced: false // Start with simple analysis
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/privacy-policy/analyze',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Analyze Privacy Policy Test Result:');
          console.log(JSON.stringify(result, null, 2));
          resolve(result);
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.error('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Kavach Backend API\n');
  console.log(`📊 Test URL: ${testUrl}\n`);

  try {
    // Test 1: Find privacy policy URL
    console.log('🔍 Test 1: Finding privacy policy URL...');
    await testFindPrivacyPolicy();
    console.log('\n');

    // Test 2: Analyze privacy policy
    console.log('🤖 Test 2: Analyzing privacy policy...');
    await testAnalyzePrivacyPolicy();
    console.log('\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

if (require.main === module) {
  runTests();
}
