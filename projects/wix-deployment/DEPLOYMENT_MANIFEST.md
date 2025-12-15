# Backend Functions Deployment Manifest

**Generated:** Tue Dec  9 09:23:29 MST 2025
**Status:** Ready for Upload

## Files to Upload

### Core Functions
- [ ] `hingecraft.api.web.jsw` → `backend/hingecraft.api.web.jsw`
- [ ] `nowpayments.api.jsw` → `backend/nowpayments.api.jsw`
- [ ] `createNowPaymentsInvoice.jsw` → `backend/createNowPaymentsInvoice.jsw`
- [ ] `email-templates.jsw` → `backend/email-templates.jsw`
- [ ] `reconciliation-worker.jsw` → `backend/reconciliation-worker.jsw`
- [ ] `notion-crm-sync.jsw` → `backend/notion-crm-sync.jsw`

### Webhook
- [ ] `webhooks/nowpayments.jsw` → `backend/webhooks/nowpayments.jsw`

## Upload Order

1. Core API functions first
2. Webhook last

## Verification

After uploading, verify:
- [ ] All functions visible in Functions list
- [ ] No syntax errors
- [ ] Functions can be called from frontend
