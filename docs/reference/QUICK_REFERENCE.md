# Quick Reference Card - HingeCraft System

## 🚀 Quick Start

### Initialize Everything
```javascript
POST /_functions/master-initialization/masterInitialize
```

### Health Check
```javascript
GET /_functions/master-initialization/quickHealthCheck
```

### System Status
```javascript
GET /_functions/system-utilities/getSystemStatus
```

---

## 📋 Essential Endpoints

### Database
```
POST /_functions/database-sync/syncPaymentData
GET  /_functions/database-sync/getDatabaseStats
```

### Testing
```
POST /_functions/comprehensive-testing/testAllPaymentFlows
```

### Health
```
GET /_functions/api-health-check/checkAllAPIs
```

### RAG
```
POST /_functions/rag-system/queryRAG
Body: { "query": "your question", "limit": 5 }
```

---

## 🔑 Required Secrets

```
STRIPE_SECRET_KEY_TEST
STRIPE_PUBLISHABLE_KEY_TEST
NOWPAYMENTS_API_KEY
SENDGRID_API_KEY
```

---

## 📊 Database Collections

1. Donations
2. CryptoPayments
3. StripePayments
4. ContributionIntent
5. Members
6. PaymentRoutes

---

## 🧪 Test Payment Flows

```javascript
// Test all flows
POST /_functions/comprehensive-testing/testAllPaymentFlows

// Test specific flow
POST /_functions/charter-page-middleware/fiatButtonClick
Body: { "amount": 10, "paymentMethod": "card" }
```

---

## 🔍 Troubleshooting

### "Function not accessible"
→ Upload `.web.js` file and publish

### "Collection does not exist"
→ Create collection in Wix Database

### "API key not found"
→ Add secret in Wix Secrets Manager

### "Payment not syncing"
→ Run `syncPaymentData()`

---

## 📞 Support

**Full Docs:**
- `COMPLETE_DEPLOYMENT_GUIDE.md`
- `ALL_SYSTEMS_SUMMARY.md`
- `SYSTEM_BUILD_COMPLETE.md`

**Validation:**
```javascript
GET /_functions/system-utilities/validateSystemSetup
```

---

**Last Updated:** December 13, 2025





