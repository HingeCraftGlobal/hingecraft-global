# HingeCraft Global - Complete Payment & Membership System

## 🚀 Quick Start

### 1. Upload Backend Files
Upload all files from `src/backend/` to Wix Dev Mode → Backend → Functions

### 2. Run Master Initialization
```javascript
POST /_functions/master-initialization/masterInitialize
```

### 3. Verify Health
```javascript
GET /_functions/master-initialization/quickHealthCheck
```

### 4. Publish Site
Publish to Test Site or Live Site in Wix Editor

---

## 📋 System Overview

**HingeCraft Global** is a complete payment and membership system built for Wix, featuring:

- 💳 **Stripe Integration** - Card and ACH payments
- ₿ **Crypto Payments** - NOWPayments integration (SOL, XLM, BTC, ETH)
- 📧 **Email Notifications** - SendGrid integration
- 💬 **Chat System** - Real-time chat functionality
- 📚 **RAG System** - Content indexing and retrieval
- 🔄 **Database Sync** - Automated data synchronization
- 🧪 **Testing Suite** - Comprehensive test coverage
- 📊 **Health Monitoring** - API and system health checks

---

## 🏗️ Architecture

```
Frontend (HTML/React)
    ↓
HTTP Endpoints (.web.js) OR Direct Imports (.jsw)
    ↓
Backend Functions
    ├─ Payment Processing (Stripe/NOWPayments)
    ├─ Database Operations (Wix Collections)
    ├─ Email Notifications (SendGrid)
    └─ System Management
    ↓
Webhook Handlers
    ↓
Data Sync
    ↓
Member Creation
```

---

## 📁 Project Structure

```
hingecraft-global/
├── src/backend/          # Backend functions
│   ├── *.jsw            # Direct import modules
│   ├── *.web.js         # HTTP-callable modules
│   └── webhooks/        # Webhook handlers
├── public/pages/        # Frontend HTML pages
├── Documentation/       # Complete documentation
└── README.md           # This file
```

---

## 🔑 Required Configuration

### Secrets (Wix Secrets Manager)
- `STRIPE_SECRET_KEY_TEST`
- `STRIPE_PUBLISHABLE_KEY_TEST`
- `NOWPAYMENTS_API_KEY`
- `SENDGRID_API_KEY`
- `EMAIL_FROM` (optional)

### Database Collections (6 required)
- `Donations`
- `CryptoPayments`
- `StripePayments`
- `ContributionIntent`
- `Members`
- `PaymentRoutes`

---

## 📚 Documentation

### Essential Guides
- **[COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md)** - Step-by-step deployment
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference card
- **[ALL_SYSTEMS_SUMMARY.md](./ALL_SYSTEMS_SUMMARY.md)** - System overview

### Technical Docs
- **[DATABASE_COLLECTIONS_SETUP.md](./DATABASE_COLLECTIONS_SETUP.md)** - Database setup
- **[WIX_SECRETS_CONFIGURATION.md](./WIX_SECRETS_CONFIGURATION.md)** - API keys
- **[COMPLETE_SYSTEM_FLOW.md](./COMPLETE_SYSTEM_FLOW.md)** - User flows

### Status & Reference
- **[FINAL_SYSTEM_STATUS.md](./FINAL_SYSTEM_STATUS.md)** - Current status
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history
- **[FRONTEND_INTEGRATION_CHECK.md](./FRONTEND_INTEGRATION_CHECK.md)** - Frontend integration

---

## 🧪 Testing

### Run All Tests
```javascript
POST /_functions/comprehensive-testing/testAllPaymentFlows
```

### Test Individual Systems
```javascript
// Database sync
POST /_functions/database-sync/syncPaymentData

// Health check
GET /_functions/api-health-check/checkAllAPIs

// System validation
GET /_functions/system-utilities/validateSystemSetup
```

---

## 🔧 System Endpoints

### Master Initialization
- `POST /_functions/master-initialization/masterInitialize`
- `GET /_functions/master-initialization/quickHealthCheck`

### Database Sync
- `POST /_functions/database-sync/verifyAllCollections`
- `POST /_functions/database-sync/syncPaymentData`
- `GET /_functions/database-sync/getDatabaseStats`

### RAG System
- `POST /_functions/rag-system/indexPageContent`
- `POST /_functions/rag-system/queryRAG`
- `POST /_functions/rag-system/autoIndexAllPages`

### Health & Monitoring
- `GET /_functions/api-health-check/checkAllAPIs`
- `GET /_functions/system-utilities/getSystemStatus`
- `GET /_functions/system-utilities/validateSystemSetup`

### Testing
- `POST /_functions/comprehensive-testing/testAllPaymentFlows`
- `POST /_functions/comprehensive-testing/testDatabaseSync`

---

## 🛠️ Troubleshooting

### "Function not accessible"
→ Upload `.web.js` file and publish site

### "Collection does not exist"
→ Create collection in Wix Database (see DATABASE_COLLECTIONS_SETUP.md)

### "API key not found"
→ Add secret in Wix Secrets Manager (see WIX_SECRETS_CONFIGURATION.md)

### "Payment not syncing"
→ Run `syncPaymentData()` endpoint

---

## 📊 System Status

**Current Version:** 2.0.0  
**Status:** ✅ Production Ready  
**Systems:** 9 complete  
**Files:** 18 backend + 6 documentation  
**Functions:** 35+  
**Endpoints:** 25+

---

## 🤝 Support

For detailed setup instructions, see:
- `COMPLETE_DEPLOYMENT_GUIDE.md` - Full deployment guide
- `QUICK_REFERENCE.md` - Quick commands
- `ALL_SYSTEMS_SUMMARY.md` - System details

---

## 📝 License

Proprietary - HingeCraft Global

---

**Last Updated:** December 13, 2025  
**Maintained by:** HingeCraft Development Team
