# HingeCraft Mission Support System

**Complete Mission Support donation system with Card and Crypto payment options**

---

## 📁 Project Structure

```
hingecraft-global/
├── backend-functions/      # Backend .jsw files (for Wix upload)
│   ├── hingecraft.api.web.jsw
│   ├── nowpayments.api.jsw
│   ├── createNowPaymentsInvoice.jsw
│   ├── email-templates.jsw
│   ├── reconciliation-worker.jsw
│   ├── notion-crm-sync.jsw
│   └── webhooks/
│       └── nowpayments.jsw
│
├── frontend-pages/          # Frontend HTML/JS files (for Wix pages)
│   ├── mission-support-form.html
│   ├── charter-page.html
│   └── charter-page-other-amount.js
│
├── database-schema/        # Database SQL files
│   └── init.sql
│
├── documentation/         # All documentation
│   ├── FINAL_DEPLOYMENT_CHECKLIST.md
│   ├── NOWPAYMENTS_DEPLOYMENT_GUIDE.md
│   ├── 1000_NANO_TASKS.json
│   └── ... (40+ docs)
│
├── deployment-scripts/     # Deployment automation
│   ├── push-to-wix-dev.sh
│   └── push-to-git.sh
│
├── src/backend/           # Wix backend structure (auto-synced)
└── public/pages/          # Wix frontend structure (auto-synced)
```

---

## 🚀 Quick Start

### 1. Deploy Backend Functions

Upload files from `backend-functions/` to Wix Editor → Backend folder

### 2. Setup Frontend Pages

Add HTML elements to Wix pages and paste content from `frontend-pages/`

### 3. Run Database Migration

Execute `database-schema/init.sql` on your database

### 4. Configure Secrets

Add all secrets to Wix Secrets Manager (see `documentation/NOWPAYMENTS_CREDENTIALS_TEMPLATE.md`)

---

## 📚 Documentation

- **Deployment Guide:** `documentation/FINAL_DEPLOYMENT_CHECKLIST.md`
- **Quick Start:** `documentation/README_DEPLOYMENT.md`
- **NOWPayments Setup:** `documentation/NOWPAYMENTS_DEPLOYMENT_GUIDE.md`
- **Task Breakdown:** `documentation/1000_NANO_TASKS.json`

---

## ✅ Status

**Implementation:** ✅ Complete  
**Integration:** ✅ Verified  
**Deployment:** ⏳ Ready

All files organized, committed to Git, and ready for Wix deployment.
