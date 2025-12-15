# HingeCraft Global - Payment & Membership System

**Production-Ready Wix Velo Application**

[![Status](https://img.shields.io/badge/status-production--ready-success)](https://github.com/departments-commits/hingecraft-global)
[![Wix Dev](https://img.shields.io/badge/wix--dev-active-blue)](https://www.wix.com/velo)

---

## 🚀 Quick Start

### **For Developers:**
```bash
# Clone repository
git clone https://github.com/departments-commits/hingecraft-global.git
cd hingecraft-global

# Start Wix Dev Mode
wix dev
```

### **For Deployment:**
See [docs/deployment/COMPLETE_DEPLOYMENT_GUIDE.md](docs/deployment/COMPLETE_DEPLOYMENT_GUIDE.md)

---

## 📋 Project Overview

HingeCraft Global is a comprehensive payment and membership system built on Wix Velo, supporting:

- **Payment Methods:** Stripe (Card/ACH), NOWPayments (Crypto)
- **Membership Tiers:** BASIC ($1), PREMIER ($2-$20), VIP ($30+)
- **Crypto Minimum:** $30 enforced across all payment flows
- **Data Flow:** Mission Support Form → Charter Page → Payment Processing
- **Database:** 7 collections for payments, members, intents, and content

---

## 📁 Repository Structure

```
hingecraft-global/
├── src/backend/          # Velo backend functions (32 files)
├── public/pages/         # Frontend HTML pages
├── docs/                 # Documentation (organized by category)
│   ├── deployment/       # Deployment guides
│   ├── database/         # Database documentation
│   ├── api/              # API integration docs
│   ├── troubleshooting/  # Troubleshooting guides
│   ├── guides/           # User guides
│   └── reference/        # Quick reference
├── scripts/              # Utility scripts
├── legal-pages/          # Legal page HTML files
└── database/             # Database schemas
```

---

## 🔧 Core Features

### **Payment Processing:**
- ✅ Stripe custom invoices (instant, no email)
- ✅ NOWPayments crypto invoices
- ✅ ACH payment support
- ✅ $30 crypto minimum enforcement
- ✅ Webhook handling for payment completion

### **Data Flow:**
- ✅ Mission Support Form → Charter Page redirect
- ✅ Amount and payment method persistence
- ✅ Auto-matching tier/years from amount
- ✅ Prefill token system for "other" amounts

### **Database:**
- ✅ 7 required collections
- ✅ Real-time cumulative totals
- ✅ Contribution tracking
- ✅ Membership management

---

## 📚 Documentation

### **Essential Guides:**
- [Complete Deployment Guide](docs/deployment/COMPLETE_DEPLOYMENT_GUIDE.md)
- [Database Schema](docs/database/DATABASE_SCHEMA_COMPLETE.md)
- [API Configuration](docs/api/WIX_SECRETS_CONFIGURATION.md)
- [Troubleshooting Guide](docs/troubleshooting/TROUBLESHOOTING_GUIDE.md)

### **Quick Reference:**
- [Quick Reference](docs/reference/QUICK_REFERENCE.md)
- [All Redirect URLs](docs/reference/ALL_REDIRECT_URLS.md)
- [Example Usage](docs/reference/EXAMPLE_USAGE.md)

### **Full Documentation Index:**
See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## 🧪 Testing

### **In Wix Local Editor:**
```javascript
// Quick health check
fetch('/_functions/master-initialization/quickHealthCheck')
  .then(r => r.json())
  .then(data => console.log('Health:', data));

// Complete troubleshooting
fetch('/_functions/system-troubleshoot/troubleshootSystem')
  .then(r => r.json())
  .then(data => console.log('System Status:', data));
```

---

## 🔑 Required Secrets (Wix Secrets Manager)

- `STRIPE_SECRET_KEY_TEST` - Stripe test secret key
- `STRIPE_PUBLISHABLE_KEY_TEST` - Stripe test publishable key
- `NOWPAYMENTS_API_KEY` - NOWPayments API key (optional)
- `SENDGRID_API_KEY` - SendGrid API key (optional)

See [API Configuration Guide](docs/api/WIX_SECRETS_CONFIGURATION.md) for details.

---

## 📊 Database Collections

1. **Donations** - Fiat payment records
2. **CryptoPayments** - Crypto payment records
3. **StripePayments** - Stripe invoice records
4. **ContributionIntent** - Form intents and prefill tokens
5. **Members** - Membership records
6. **PaymentRoutes** - Payment method configurations
7. **PageContent** - RAG system content index

See [Database Schema](docs/database/DATABASE_SCHEMA_COMPLETE.md) for complete details.

---

## 🚀 Current Status

**✅ All Systems Operational:**
- Payment processing (Stripe + NOWPayments)
- Crypto minimum ($30) enforcement
- Redirect flow (Mission Support → Charter)
- Data persistence
- Error handling
- System troubleshooting

**📝 Latest Updates:**
- Crypto minimum restriction implemented
- Mission support form fixes complete
- System troubleshooting added
- Repository organization in progress

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting Guide](docs/troubleshooting/TROUBLESHOOTING_GUIDE.md)
2. Run `troubleshootSystem()` in Wix
3. Review [Documentation Index](DOCUMENTATION_INDEX.md)

---

## 📄 License

Proprietary - HingeCraft Global

---

**Last Updated:** December 13, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
