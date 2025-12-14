# Deployment Script - Automated Setup

## Quick Deployment Script

Copy and paste this into your browser console after uploading files to Wix:

```javascript
// Master Deployment Script
(async function deployAllSystems() {
  console.log('🚀 Starting HingeCraft System Deployment...');
  
  const results = {
    steps: [],
    errors: []
  };
  
  // Step 1: Master Initialization
  try {
    console.log('📋 Step 1: Running master initialization...');
    const initResponse = await fetch('/_functions/master-initialization/masterInitialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const initResult = await initResponse.json();
    results.steps.push({ step: 'Master Initialization', success: initResult.success, data: initResult });
    console.log('✅ Master initialization complete');
  } catch (error) {
    results.steps.push({ step: 'Master Initialization', success: false, error: error.message });
    results.errors.push(`Initialization: ${error.message}`);
    console.error('❌ Initialization failed:', error);
  }
  
  // Step 2: Validate Setup
  try {
    console.log('🔍 Step 2: Validating system setup...');
    const validateResponse = await fetch('/_functions/system-utilities/validateSystemSetup', {
      method: 'GET'
    });
    const validateResult = await validateResponse.json();
    results.steps.push({ step: 'Setup Validation', success: validateResult.success, data: validateResult });
    console.log('✅ Setup validation complete');
  } catch (error) {
    results.steps.push({ step: 'Setup Validation', success: false, error: error.message });
    results.errors.push(`Validation: ${error.message}`);
    console.error('❌ Validation failed:', error);
  }
  
  // Step 3: Health Check
  try {
    console.log('💚 Step 3: Running health check...');
    const healthResponse = await fetch('/_functions/master-initialization/quickHealthCheck', {
      method: 'GET'
    });
    const healthResult = await healthResponse.json();
    results.steps.push({ step: 'Health Check', success: healthResult.success, data: healthResult });
    console.log('✅ Health check complete');
  } catch (error) {
    results.steps.push({ step: 'Health Check', success: false, error: error.message });
    results.errors.push(`Health Check: ${error.message}`);
    console.error('❌ Health check failed:', error);
  }
  
  // Step 4: Test Payment Flows
  try {
    console.log('🧪 Step 4: Testing payment flows...');
    const testResponse = await fetch('/_functions/comprehensive-testing/testAllPaymentFlows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const testResult = await testResponse.json();
    results.steps.push({ step: 'Payment Flow Tests', success: testResult.success, data: testResult });
    console.log('✅ Payment flow tests complete');
  } catch (error) {
    results.steps.push({ step: 'Payment Flow Tests', success: false, error: error.message });
    results.errors.push(`Payment Tests: ${error.message}`);
    console.error('❌ Payment tests failed:', error);
  }
  
  // Final Summary
  console.log('\n📊 Deployment Summary:');
  console.log('====================');
  results.steps.forEach((step, index) => {
    const icon = step.success ? '✅' : '❌';
    console.log(`${icon} Step ${index + 1}: ${step.step}`);
    if (step.error) {
      console.log(`   Error: ${step.error}`);
    }
  });
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    results.errors.forEach(error => console.log(`   - ${error}`));
  } else {
    console.log('\n🎉 All systems deployed successfully!');
  }
  
  return results;
})();
```

---

## Individual System Deployment

### Database Sync
```javascript
// Sync payment data
fetch('/_functions/database-sync/syncPaymentData', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log('Sync result:', data));
```

### RAG System
```javascript
// Index all pages
fetch('/_functions/rag-system/autoIndexAllPages', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log('Indexing result:', data));
```

### Health Check
```javascript
// Check all APIs
fetch('/_functions/api-health-check/checkAllAPIs', { method: 'GET' })
  .then(r => r.json())
  .then(data => console.log('API Health:', data));
```

---

## Manual Deployment Checklist

### Pre-Deployment
- [ ] All backend files uploaded to Wix
- [ ] All secrets configured in Wix Secrets Manager
- [ ] All database collections created
- [ ] Site is in Dev Mode

### Deployment Steps
1. [ ] Run master initialization
2. [ ] Verify health check passes
3. [ ] Test payment flows
4. [ ] Verify database sync
5. [ ] Publish site

### Post-Deployment
- [ ] Test on live site
- [ ] Verify webhooks are working
- [ ] Monitor system health
- [ ] Check error logs

---

**Last Updated:** December 13, 2025
