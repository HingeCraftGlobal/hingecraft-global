# Example Usage - Code Snippets

## 🔧 Common Operations

### **1. Initialize System**
```javascript
// Run master initialization
const response = await fetch('/_functions/master-initialization/masterInitialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const result = await response.json();
console.log('Initialization:', result);
```

### **2. Check System Health**
```javascript
// Quick health check
const health = await fetch('/_functions/master-initialization/quickHealthCheck')
  .then(r => r.json());
console.log('Health:', health);
```

### **3. Get Database Stats**
```javascript
// Get comprehensive statistics
const stats = await fetch('/_functions/database-sync/getDatabaseStats')
  .then(r => r.json());
console.log('Total donations:', stats.amounts.grandTotal);
```

### **4. Sync Payment Data**
```javascript
// Sync data between collections
const sync = await fetch('/_functions/database-sync/syncPaymentData', {
  method: 'POST'
}).then(r => r.json());
console.log('Synced:', sync.synced);
```

### **5. Query RAG System**
```javascript
// Search indexed content
const results = await fetch('/_functions/rag-system/queryRAG', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'membership tiers',
    limit: 5
  })
}).then(r => r.json());
console.log('Results:', results.results);
```

### **6. Test Payment Flows**
```javascript
// Test all payment flows
const tests = await fetch('/_functions/comprehensive-testing/testAllPaymentFlows', {
  method: 'POST'
}).then(r => r.json());
console.log('Tests:', tests.tests);
```

### **7. Validate Setup**
```javascript
// Validate system setup
const validation = await fetch('/_functions/system-utilities/validateSystemSetup')
  .then(r => r.json());
console.log('Validation:', validation.checks);
```

### **8. Get System Status**
```javascript
// Get complete system status
const status = await fetch('/_functions/system-utilities/getSystemStatus')
  .then(r => r.json());
console.log('Status:', status);
```

---

## 💳 Payment Operations

### **Create Stripe Invoice**
```javascript
// Via Charter page middleware
const invoice = await fetch('/_functions/charter-page-middleware/fiatButtonClick', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 10,
    paymentMethod: 'card',
    tier: 'PREMIER',
    years: 2
  })
}).then(r => r.json());
console.log('Invoice URL:', invoice.invoiceUrl);
```

### **Create Crypto Invoice**
```javascript
// Via Charter page middleware
const crypto = await fetch('/_functions/charter-page-middleware/cryptoButtonClick', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 50,
    coin: 'SOL'
  })
}).then(r => r.json());
console.log('Payment URL:', crypto.paymentUrl);
```

### **Handle Mission Support Form**
```javascript
// Submit mission support form
const result = await fetch('/_functions/mission-support-middleware/handleUserInputDonation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    address: '123 Main St',
    amount: '5',
    paymentMethod: 'card'
  })
}).then(r => r.json());
console.log('Result:', result);
```

---

## 📊 Database Operations

### **Get Cumulative Total**
```javascript
// Get total donations
const total = await fetch('/_functions/charter-page-middleware/getCumulativeTotal')
  .then(r => r.json());
console.log('Total:', total.total);
```

### **Verify Collections**
```javascript
// Verify all collections exist
const collections = await fetch('/_functions/database-sync/verifyAllCollections')
  .then(r => r.json());
console.log('Collections:', collections.collections);
```

### **Cleanup Expired Prefills**
```javascript
// Clean up expired tokens
const cleanup = await fetch('/_functions/database-sync/cleanupExpiredPrefills', {
  method: 'POST'
}).then(r => r.json());
console.log('Cleaned:', cleanup.cleaned);
```

---

## 🔍 Monitoring Operations

### **Check API Health**
```javascript
// Check all APIs
const apis = await fetch('/_functions/api-health-check/checkAllAPIs')
  .then(r => r.json());
console.log('APIs:', apis.apis);
```

### **Get System Metrics**
```javascript
// Get comprehensive metrics
const metrics = await fetch('/_functions/api-health-check/getSystemMetrics')
  .then(r => r.json());
console.log('Metrics:', metrics);
```

---

## 🧪 Testing Operations

### **Test Database Sync**
```javascript
// Test database synchronization
const syncTest = await fetch('/_functions/comprehensive-testing/testDatabaseSync', {
  method: 'POST'
}).then(r => r.json());
console.log('Sync test:', syncTest);
```

### **Test Cumulative Total**
```javascript
// Test total calculation
const totalTest = await fetch('/_functions/comprehensive-testing/testCumulativeTotal', {
  method: 'POST'
}).then(r => r.json());
console.log('Total test:', totalTest);
```

---

## 📚 RAG Operations

### **Index Page Content**
```javascript
// Index a page for RAG
const index = await fetch('/_functions/rag-system/indexPageContent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pageUrl: '/charter',
    pageContent: '<html>...</html>',
    metadata: {
      title: 'Charter of Abundance'
    }
  })
}).then(r => r.json());
console.log('Indexed:', index);
```

### **Get All Indexed Pages**
```javascript
// List all indexed pages
const pages = await fetch('/_functions/rag-system/getAllIndexedPages')
  .then(r => r.json());
console.log('Pages:', pages.pages);
```

### **Auto-Index All Pages**
```javascript
// Auto-index all site pages
const autoIndex = await fetch('/_functions/rag-system/autoIndexAllPages', {
  method: 'POST'
}).then(r => r.json());
console.log('Indexed:', autoIndex.indexed);
```

---

## 🔄 Data Initialization

### **Initialize Collections**
```javascript
// Initialize all collections
const init = await fetch('/_functions/data-initialization/initializeAllCollections', {
  method: 'POST'
}).then(r => r.json());
console.log('Initialized:', init.initialized);
```

### **Create Sample Data**
```javascript
// Create test data
const sample = await fetch('/_functions/data-initialization/createSampleData', {
  method: 'POST'
}).then(r => r.json());
console.log('Created:', sample.created);
```

---

## 💬 Chat Operations

### **Initialize Chat**
```javascript
// Initialize chat connection
const chat = await fetch('/_functions/chat-integration/initializeChat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    userName: 'John Doe',
    channel: 'mission-support'
  })
}).then(r => r.json());
console.log('Chat:', chat);
```

### **Send Chat Message**
```javascript
// Send a message
const message = await fetch('/_functions/chat-integration/sendChatMessage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello!',
    userId: 'user123',
    channel: 'mission-support'
  })
}).then(r => r.json());
console.log('Message sent:', message);
```

---

## 🌐 Frontend Integration

### **Call from HTML/React**
```javascript
// Using callVeloFunction helper (from charter-page-final.html)
const result = await callVeloFunction(
  VELO_CONFIG.CHARTER_MIDDLEWARE,
  'fiatButtonClick',
  { amount: 10, paymentMethod: 'card' }
);
```

### **Direct Fetch**
```javascript
// Direct fetch call
const response = await fetch('/_functions/charter-page-middleware/fiatButtonClick', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 10, paymentMethod: 'card' })
});
const data = await response.json();
```

---

**Last Updated:** December 13, 2025





