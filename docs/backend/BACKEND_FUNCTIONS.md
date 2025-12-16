# Backend Functions Reference

## Overview

All Wix Velo backend functions for HingeCraft Global system.

## File Structure

### Core Middleware
- `charter-page-middleware.jsw` - Charter page functionality
- `charter-page-middleware.web.js` - HTTP endpoint for charter page
- `mission-support-middleware.jsw` - Mission support form handling
- `mission-support-middleware.web.js` - HTTP endpoint for mission support

### Payment Processing
- `stripe.api.jsw` - Stripe payment integration
- `nowpayments.api.jsw` - NOWPayments crypto integration
- `createNowPaymentsInvoice.jsw` - Crypto invoice creation

### Email & Notifications
- `email-templates.jsw` - SendGrid email templates

### CRM & Sync
- `notion-crm-sync.jsw` - Notion CRM synchronization
- `reconciliation-worker.jsw` - Payment reconciliation

### Webhooks
- `webhooks/nowpayments.jsw` - NOWPayments webhook handler

### Utilities
- `create-legal-pages.jsw` - Legal page generation
- `hingecraft.api.web.jsw` - Main API handler

## Usage

### Direct Import (`.jsw` files)
```javascript
import { functionName } from 'backend/module-name';
```

### HTTP Endpoint (`.web.js` files)
```javascript
fetch('/_functions/module-name/functionName', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

## Documentation

See individual files for detailed function documentation.
