# Raw Components Complete List - HingeCraft Payment System

## Complete Flattened Checklist (All Components)

### Backend Node.js Files
1. ✅ `backend/src/server.js` - Express server with all endpoints
2. ✅ `backend/src/db.js` - Postgres connection pool
3. ✅ `backend/src/routesBuilder.js` - Builds payment routes from DB
4. ✅ `backend/src/listener.js` - LISTEN/NOTIFY handler
5. ✅ `backend/src/stripe.js` - Stripe API wrapper
6. ✅ `backend/src/nowpayments.js` - NowPayments API wrapper
7. ✅ `backend/src/reconcile.js` - Reconciliation job
8. ✅ `backend/worker.js` - Scheduled worker process
9. ✅ `backend/package.json` - Dependencies
10. ✅ `backend/Dockerfile` - Node container
11. ✅ `backend/docker-compose.yml` - Docker services
12. ✅ `backend/.env.example` - Environment template

### Database Migrations
13. ✅ `backend/migrations/001_create_payment_routes.sql`
14. ✅ `backend/migrations/002_add_provider_columns.sql`
15. ✅ `backend/migrations/003_create_payment_audit.sql`
16. ✅ `backend/migrations/004_notify_triggers.sql`
17. ✅ `backend/migrations/005_contribution_intent_prefill.sql`

### Wix Velo Backend Modules
18. ✅ `src/backend/charter-page-middleware.web.js` - Charter page logic
19. ✅ `src/backend/mission-support-middleware.web.js` - Mission Support logic
20. ✅ `src/backend/stripe.api.jsw` - Stripe integration
21. ✅ `src/backend/nowpayments.api.jsw` - NowPayments integration

### Frontend HTML Pages
22. ✅ `public/pages/charter-page-wix-ready.html` - Charter page (fixed)
23. ✅ `public/pages/mission-support-form.html` - Mission Support form

### Scripts & Utilities
24. ✅ `backend/scripts/run-migrations.sh` - Migration runner
25. ✅ `scripts/extract_database_urls.sql` - SQL extraction
26. ✅ `scripts/extract_database_urls_mongo.js` - MongoDB extraction
27. ✅ `scripts/extract_database_urls_docker_postgres.sh` - Docker extraction
28. ✅ `scripts/stripe_test_mode_setup.js` - Stripe test setup
29. ✅ `scripts/nowpayments_invoice_creator.js` - NowPayments invoice creator
30. ✅ `scripts/crawl_all_resources.js` - Resource crawler

### Documentation
31. ✅ `docs/T10-T30_PROMPTS.md` - Complete prompt set
32. ✅ `docs/T14-T30_COMPLETE_PROMPTS.md` - Extended prompts
33. ✅ `COMPLETE_SYSTEM_INTEGRATION.md` - Integration guide
34. ✅ `MIDDLEWARE_SYNC_COMPLETE.md` - Sync documentation
35. ✅ `FINAL_DEPLOYMENT_GUIDE.md` - Deployment steps
36. ✅ `403_ERROR_FIX_COMPLETE.md` - Error fix documentation
37. ✅ `API_ENDPOINT_FIX.md` - Endpoint fix details
38. ✅ `DEPLOYMENT_CHECKLIST.md` - Deployment checklist
39. ✅ `STRIPE_DEV_KEYS_SETUP.md` - Stripe keys guide
40. ✅ `VELO_BACKEND_CONSISTENCY.md` - Backend consistency
41. ✅ `README_CURRENCY_ROUTING_FIX.md` - Currency routing fix
42. ✅ `DATABASE_CONFLICTS_RESOLVED.md` - DB conflict resolution

### Database Tables (Postgres)
43. ✅ `payment_routes` - Canonical routes JSON
44. ✅ `payment_audit` - Audit trail
45. ✅ `payments` - Main payment records (with provider columns)
46. ✅ `external_payments` - External provider records (with provider columns)
47. ✅ `wallets` - Crypto wallet addresses
48. ✅ `contribution_intent` - Payment intents (with prefill support)
49. ✅ `crypto_payments` - Crypto payment records
50. ✅ `stripe_payments` - Stripe payment records

### Database Triggers
51. ✅ `notify_hc_routes()` - Trigger function
52. ✅ Trigger on `payments` table
53. ✅ Trigger on `external_payments` table
54. ✅ Trigger on `wallets` table

### API Endpoints
55. ✅ `GET /health` - Health check
56. ✅ `GET /routes` - Get payment routes
57. ✅ `POST /mission-support/micro-payment` - Micro payment ($1/$2/$5)
58. ✅ `POST /mission-support/other` - Create prefill token
59. ✅ `GET /prefill/:id` - Get prefill data
60. ✅ `POST /charter/generate-payment` - Generate payment URL
61. ✅ `POST /admin/refresh` - Force route rebuild

### Wix Velo Functions
62. ✅ `/_functions/charter-page-middleware/onReady`
63. ✅ `/_functions/charter-page-middleware/cryptoButtonClick`
64. ✅ `/_functions/charter-page-middleware/fiatButtonClick`
65. ✅ `/_functions/charter-page-middleware/getCumulativeTotal`
66. ✅ `/_functions/mission-support-middleware/microPayment`
67. ✅ `/_functions/mission-support-middleware/otherAmount`
68. ✅ `/_functions/mission-support-middleware/getPrefill`
69. ✅ `/_functions/stripe.api/getPublishableKey`
70. ✅ `/_functions/stripe.api/createCheckoutSession`
71. ✅ `/_functions/nowpayments.api/createNowPaymentsInvoice`
72. ✅ `/_functions/nowpayments.api/getInvoiceStatus`

### Frontend Helpers
73. ✅ `callVeloFunction()` - HTTP helper for Wix functions
74. ✅ `updatePaymentButtonForRail()` - Button URL updater
75. ✅ `PAYMENT_ROUTES` - Currency mapping structure

### Environment Variables
76. ✅ `DATABASE_URL` - Postgres connection
77. ✅ `STRIPE_SECRET` - Stripe secret key
78. ✅ `STRIPE_PUBLISHABLE` - Stripe publishable key (optional)
79. ✅ `NOWPAYMENTS_API_KEY` - NowPayments API key
80. ✅ `NOWPAYMENTS_IPN_SECRET` - NowPayments webhook secret
81. ✅ `BASE_URL` - Site base URL
82. ✅ `WIX_WEBHOOK_ENDPOINTS` - Comma-separated webhook URLs
83. ✅ `WEBHOOK_SECRET` - Webhook verification secret
84. ✅ `ADMIN_TOKEN` - Admin endpoint token

### Testing & Validation
85. ✅ Unit test structure (Jest-ready)
86. ✅ Integration test structure
87. ✅ E2E test structure (Cypress-ready)
88. ✅ Health check endpoint
89. ✅ Error logging to payment_audit
90. ✅ Console logging for debugging

### Monitoring & Observability
91. ✅ Structured logging
92. ✅ Payment audit trail
93. ✅ Route version tracking
94. ✅ Reconciliation job logging
95. ✅ Error monitoring ready (Sentry-compatible)

### Security
96. ✅ Input validation
97. ✅ SQL injection prevention (parameterized queries)
98. ✅ Secret management (env variables)
99. ✅ Webhook signature verification (ready)
100. ✅ Admin token authentication

---

## Total: 100 Components

All components are created and ready for deployment. The system is complete and functional.
