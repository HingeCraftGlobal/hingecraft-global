# ⚡ Quick Upload Reference

**Quick reference for uploading files to Wix Editor**

---

## 📦 Backend Functions (7 files)

**Location:** Wix Editor → Dev Mode → Backend → Web Modules

| File Name | Source Path | Upload As |
|-----------|-------------|-----------|
| `hingecraft.api.web.jsw` | `backend-functions/hingecraft.api.web.jsw` | `backend/hingecraft.api.web.jsw` |
| `nowpayments.api.jsw` | `backend-functions/nowpayments.api.jsw` | `backend/nowpayments.api.jsw` |
| `createNowPaymentsInvoice.jsw` | `backend-functions/createNowPaymentsInvoice.jsw` | `backend/createNowPaymentsInvoice.jsw` |
| `email-templates.jsw` | `backend-functions/email-templates.jsw` | `backend/email-templates.jsw` |
| `reconciliation-worker.jsw` | `backend-functions/reconciliation-worker.jsw` | `backend/reconciliation-worker.jsw` |
| `notion-crm-sync.jsw` | `backend-functions/notion-crm-sync.jsw` | `backend/notion-crm-sync.jsw` |
| `nowpayments.jsw` | `backend-functions/webhooks/nowpayments.jsw` | `backend/webhooks/nowpayments.jsw` |

**Note:** Create `webhooks` folder in Backend if it doesn't exist.

---

## 🌐 Frontend Pages (2 files)

**Location:** Wix Editor → Pages → [Page Name] → Add HTML Element

| Page | File | Element ID |
|------|------|------------|
| `/payment` (Mission Support) | `frontend-pages/mission-support-form.html` | `missionSupportForm` or `root` |
| `/charter` | `frontend-pages/charter-page.html` | (existing or new) |

---

## 🔐 Secrets (10 secrets)

**Location:** Wix Editor → Dev Mode → Secrets Manager

| Secret Name | Value |
|-------------|-------|
| `NOWPAYMENTS_API_KEY` | `JEH3VG9-648MJPE-HPETPZ7-QVCSBES` |
| `NOWPAYMENTS_IPN_SECRET` | `8TnzsveF28gelMuvXFMxgPW5YUXYkcL9` |
| `NOWPAYMENTS_BASE_URL` | `https://api.nowpayments.io/v1` |
| `BASE_URL` | `https://www.hingecraft-global.ai` |
| `KYC_THRESHOLD_USD` | `1000` |
| `CRYPTO_CONFIRMATIONS_REQUIRED` | `3` |
| `EXTERNAL_DB_ENDPOINT` | (Your DB endpoint) |
| `EXTERNAL_DB_SECRET_KEY` | (Your DB secret) |
| `SENDGRID_API_KEY` | (Your SendGrid key) |
| `EMAIL_FROM` | `no-reply@hingecraft-global.ai` |

---

## 🗄️ Database

**File:** `database-schema/init.sql`

**Tables to create:**
- `contribution_intents`
- `crypto_payments`
- `webhook_logs`
- `kyc_verifications`

---

## ✅ Quick Checklist

- [ ] Upload 7 backend functions
- [ ] Upload 1 webhook file (to `backend/webhooks/`)
- [ ] Add 2 frontend pages (HTML elements)
- [ ] Configure 10 secrets
- [ ] Run database migration
- [ ] Configure NOWPayments webhook URL

---

## 🆘 Quick Troubleshooting

**Functions not appearing?**
- Check file extension is `.jsw`
- Verify Dev Mode is enabled
- Check for syntax errors

**Secrets not accessible?**
- Verify secret names match exactly
- Check secret values are correct
- Test in backend function

**Webhook not working?**
- Verify URL: `https://www.hingecraft-global.ai/_functions/webhooks/nowpayments`
- Check IPN secret matches
- Verify events enabled in NOWPayments dashboard

---

**For detailed instructions, see:** `WIX_UPLOAD_CHECKLIST.md` or `NEXT_STEPS_GUIDE.md`

