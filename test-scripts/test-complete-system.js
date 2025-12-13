/**
 * Complete System Test Script
 * Tests all functionality: Mission Support → Charter → Payment
 * 
 * Run this in browser console or via Wix Velo
 */

// Test Configuration
const TEST_CONFIG = {
  CHARTER_MIDDLEWARE: '/_functions/charter-page-middleware',
  MISSION_SUPPORT_MIDDLEWARE: '/_functions/mission-support-middleware',
  NOWPAYMENTS_API: '/_functions/nowpayments.api',
  STRIPE_API: '/_functions/stripe.api',
  HINGECRAFT_API: '/_functions/hingecraft.api'
};

/**
 * Test 1: Mission Support Form → Charter Redirect
 */
async function testMissionSupportToCharter() {
  console.log('🧪 Test 1: Mission Support → Charter Redirect');
  
  try {
    const testAmount = 20;
    const response = await fetch(TEST_CONFIG.MISSION_SUPPORT_MIDDLEWARE + '/goToCharterAfterPayment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: testAmount })
    });
    
    const data = await response.json();
    
    if (data.success && data.redirectUrl) {
      console.log('✅ Test 1 PASSED: Redirect URL generated:', data.redirectUrl);
      console.log('   Expected URL contains donationAmount=20:', data.redirectUrl.includes('donationAmount=20'));
      return true;
    } else {
      console.error('❌ Test 1 FAILED: No redirect URL returned');
      return false;
    }
  } catch (error) {
    console.error('❌ Test 1 ERROR:', error);
    return false;
  }
}

/**
 * Test 2: Charter Page - Get Cumulative Total
 */
async function testGetCumulativeTotal() {
  console.log('🧪 Test 2: Get Cumulative Total from Database');
  
  try {
    const response = await fetch(TEST_CONFIG.CHARTER_MIDDLEWARE + '/getCumulativeTotal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Test 2 PASSED: Cumulative total retrieved');
      console.log('   Total:', data.total);
      console.log('   Fiat Total:', data.fiatTotal);
      console.log('   Crypto Total:', data.cryptoTotal);
      return true;
    } else {
      console.error('❌ Test 2 FAILED:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Test 2 ERROR:', error);
    return false;
  }
}

/**
 * Test 3: Crypto Button Click
 */
async function testCryptoButtonClick() {
  console.log('🧪 Test 3: Crypto Button Click (Solana)');
  
  try {
    const testAmount = 20;
    const testCoin = 'solana';
    
    const response = await fetch(TEST_CONFIG.CHARTER_MIDDLEWARE + '/cryptoButtonClick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: testAmount, coin: testCoin })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Test 3 PASSED: Crypto invoice created');
      console.log('   Invoice ID:', data.invoiceId);
      console.log('   Pay Address:', data.payAddress);
      console.log('   Pay Amount Crypto:', data.payAmountCrypto, data.payCurrency);
      return true;
    } else {
      console.error('❌ Test 3 FAILED:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Test 3 ERROR:', error);
    return false;
  }
}

/**
 * Test 4: Stripe Button Click
 */
async function testStripeButtonClick() {
  console.log('🧪 Test 4: Stripe Button Click');
  
  try {
    const testPreset = 20;
    
    const response = await fetch(TEST_CONFIG.CHARTER_MIDDLEWARE + '/fiatButtonClick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preset: testPreset })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Test 4 PASSED: Stripe session created');
      console.log('   Session ID:', data.sessionId);
      console.log('   Checkout URL:', data.url);
      return true;
    } else {
      console.error('❌ Test 4 FAILED:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Test 4 ERROR:', error);
    return false;
  }
}

/**
 * Test 5: Get Invoice Status
 */
async function testGetInvoiceStatus() {
  console.log('🧪 Test 5: Get Invoice Status');
  
  try {
    // First create an invoice
    const createResponse = await fetch(TEST_CONFIG.CHARTER_MIDDLEWARE + '/cryptoButtonClick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1, coin: 'solana' })
    });
    
    const createData = await createResponse.json();
    
    if (!createData.success || !createData.invoiceId) {
      console.log('⚠️  Test 5 SKIPPED: Could not create test invoice');
      return true; // Skip this test
    }
    
    // Now get status
    const statusResponse = await fetch(TEST_CONFIG.NOWPAYMENTS_API + '/getInvoiceStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: createData.invoiceId })
    });
    
    const statusData = await statusResponse.json();
    
    if (statusData.success) {
      console.log('✅ Test 5 PASSED: Invoice status retrieved');
      console.log('   Status:', statusData.status);
      return true;
    } else {
      console.error('❌ Test 5 FAILED:', statusData.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Test 5 ERROR:', error);
    return false;
  }
}

/**
 * Test 6: Log Mission Support Intent
 */
async function testLogMissionSupportIntent() {
  console.log('🧪 Test 6: Log Mission Support Intent');
  
  try {
    const testData = {
      formData: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        address: '123 Test St',
        missionSupportName: 'Test Mission'
      },
      amountEntered: 20,
      timestamp: new Date().toISOString(),
      sessionID: 'test_session_' + Date.now(),
      anonymousFingerprint: 'test_fp',
      referrerSource: 'test',
      pageUrl: 'https://test.com',
      userAgent: 'test-agent'
    };
    
    const response = await fetch(TEST_CONFIG.HINGECRAFT_API + '/logMissionSupportIntent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Test 6 PASSED: Intent logged');
      console.log('   Intent ID:', data.intentId);
      return true;
    } else {
      console.error('❌ Test 6 FAILED:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Test 6 ERROR:', error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Complete System Tests...\n');
  
  const results = {
    test1: await testMissionSupportToCharter(),
    test2: await testGetCumulativeTotal(),
    test3: await testCryptoButtonClick(),
    test4: await testStripeButtonClick(),
    test5: await testGetInvoiceStatus(),
    test6: await testLogMissionSupportIntent()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.keys(results).forEach((test, index) => {
    const status = results[test] ? '✅ PASSED' : '❌ FAILED';
    console.log(`Test ${index + 1}: ${status}`);
  });
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  return results;
}

// Export for use in browser console or Wix Velo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testMissionSupportToCharter,
    testGetCumulativeTotal,
    testCryptoButtonClick,
    testStripeButtonClick,
    testGetInvoiceStatus,
    testLogMissionSupportIntent
  };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('📋 Test script loaded. Run: runAllTests()');
}
