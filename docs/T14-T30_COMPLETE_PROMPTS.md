# T14-T30 Complete Prompts - HingeCraft Payment Orchestration

## T14 — Unified Middleware Architecture (4 paragraphs)

**Paragraph 1 — Single Source of Truth:**
The middleware must use your Docker-hosted PostgreSQL database as the single source of truth for all payment routes, wallet addresses, and session state. No Wix storage is used for persistence—all data flows through the Docker DB. The middleware architecture consists of three layers: (1) Wix Velo web modules that call backend HTTP endpoints, (2) Node.js Express backend that reads/writes to Docker Postgres, (3) Postgres triggers that NOTIFY the backend when routes need rebuilding. This ensures Mission Support form, Charter page, and all payment processors stay synchronized through the database.

**Paragraph 2 — Mission Support → Charter Prefill Flow:**
When a user enters "Other" amount on Mission Support form, the frontend calls POST /mission-support/other with {amount, userInfo}. The backend creates a prefill token in the ContributionIntent table with expires_at = now + 10 minutes. The backend returns redirectUrl: /charter?prefill=<token>&donationAmount=<amount>. The Charter page, on load, calls GET /prefill/<token> to retrieve the amount, then pre-fills the Contribution selector. After retrieval, the backend marks the prefill token as used=true. This ensures seamless flow from Mission Support to Charter with zero state loss.

**Paragraph 3 — Currency Selector Auto-Routing:**
When a user selects a currency on the Charter page, the frontend calls POST /charter/generate-payment with {amount, currency}. The backend determines if currency is fiat (USD, EUR, etc.) or crypto (BTC, ETH, SOL, etc.). For fiat, it creates a Stripe checkout session using your Stripe dev key (stored in env, never in code). For crypto, it creates a NowPayments invoice using the NowPayments URL from your database. The backend saves the provider_url to external_payments, updates payments table, triggers pg_notify('hc_routes_changed'), and returns {url: provider_url} to the frontend. The frontend immediately updates the main CTA button's href to this URL, ensuring instant redirect capability.

**Paragraph 4 — Route Rebuild & Sync:**
Whenever external_payments, payments, or wallets tables change, Postgres triggers fire pg_notify('hc_routes_changed'). The Node backend listener receives the notification, debounces for 2 seconds (to coalesce rapid updates), then calls buildPaymentRoutes() which queries all payment URLs and wallets, normalizes currencies, and writes a new version to payment_routes table. After rebuild, the backend POSTs to WIX_WEBHOOK_ENDPOINTS to notify Wix pages. Wix pages either receive the webhook (via HTTP Function) or poll GET /routes every 30 seconds to get the latest routes version. This guarantees all pages always have current payment URLs.

---

## T15 — Stripe Micro-Payment Handler (4 paragraphs)

**Paragraph 1 — Objective:**
Implement POST /mission-support/micro-payment endpoint that accepts amount (must be 1, 2, or 5) and immediately creates a Stripe checkout session. The endpoint validates the amount, creates a payment record in the payments table, calls Stripe API to create a session, saves session.id and session.url to external_payments, updates payments.provider_url, and triggers route rebuild. Return {url: session.url} to the frontend for immediate redirect.

**Paragraph 2 — Implementation:**
The endpoint reads STRIPE_SECRET from environment (you will set this locally, never in code). It uses the Stripe Node SDK to create a checkout session with line_items containing the exact amount, metadata including source: 'mission_support_micro' and preset_amount, and success/cancel URLs pointing to your site. Use idempotency key hc_micro_<payment_id> to prevent duplicate sessions. On success, save to external_payments with gateway='stripe', provider='stripe', provider_id=session.id, provider_url=session.url, then trigger pg_notify('hc_routes_changed').

**Paragraph 3 — Error Handling:**
If Stripe API fails (network error, invalid key, rate limit), catch the error, log to payment_audit with action='stripe_session_failed', and return {success: false, error: message} to frontend. Frontend displays user-friendly error and allows retry. For transient errors (5xx), implement exponential backoff retry (3 attempts: 1s, 2s, 4s delays). For permanent errors (4xx), fail immediately and log.

**Paragraph 4 — Acceptance:**
Calling POST /mission-support/micro-payment with amount=1,2,or 5 returns a valid Stripe checkout URL. The URL redirects to Stripe's hosted checkout page. After payment, Stripe webhook updates the payment status in the database. Test with Stripe test card 4242 4242 4242 4242 and verify payment appears in Stripe Dashboard and database.

---

## T16 — NowPayments URL Routing from Database (4 paragraphs)

**Paragraph 1 — Objective:**
Ensure all crypto currency selections (BTC, ETH, SOL, XLM, etc.) route to the correct NowPayments invoice URL stored in your HingeCraft database. The middleware must never hardcode NowPayments URLs—it always queries external_payments table where gateway='nowpayments' to find the most recent invoice_url for that currency. If no invoice exists, it creates one via NowPayments API and saves it to the database for future use.

**Paragraph 2 — Implementation:**
When POST /charter/generate-payment receives currency=BTC (or other crypto), the backend queries: SELECT provider_url FROM external_payments WHERE gateway='nowpayments' AND currency='BTC' ORDER BY created_at DESC LIMIT 1. If a URL exists and is not expired, return it immediately. If not, call nowpaymentsSvc.createInvoice() to create a new invoice, save the invoice_url to external_payments, update payments table, trigger route rebuild, and return the new URL. This ensures crypto payments always use valid, database-backed URLs.

**Paragraph 3 — Wallet Fallback:**
If NowPayments invoice creation fails or the API is unavailable, fall back to direct wallet routing. Query wallets table: SELECT wallet_address FROM wallets WHERE coin='BTC' ORDER BY created_at DESC LIMIT 1. Construct a wallet: URL scheme (e.g., wallet:bc1q...) and return it. Log the fallback to payment_audit. The frontend can display the wallet address and QR code for manual payment. This ensures crypto payments always have a valid route even if NowPayments is down.

**Paragraph 4 — Acceptance:**
Selecting any crypto currency on Charter page returns a valid payment URL (either NowPayments invoice URL or wallet address). The URL is stored in the database and appears in GET /routes response. Test by creating a NowPayments invoice manually, saving it to external_payments, then selecting that currency—verify the URL matches.

---

## T17 — Middleware Synchronization Layer (4 paragraphs)

**Paragraph 1 — Objective:**
Build a synchronization layer that ensures Mission Support form, Charter page, Docker database, and payment providers (Stripe/NowPayments) all stay in sync. When any component updates (new payment created, wallet added, route changed), the change must propagate to all other components within 2 seconds via database triggers and webhook notifications.

**Paragraph 2 — Implementation:**
The sync layer uses Postgres LISTEN/NOTIFY. When payments, external_payments, or wallets tables change, triggers fire pg_notify('hc_routes_changed'). The Node backend listener receives the notification, debounces for 2 seconds (coalesces rapid updates), rebuilds payment_routes, increments version, and POSTs to WIX_WEBHOOK_ENDPOINTS. Wix pages receive webhook via HTTP Function /functions/hingecraftRoutesUpdate which sets a flag in Wix Data. Pages poll this flag on $w.onReady() and re-fetch GET /routes if flag is set. This ensures sub-2-second sync across all components.

**Paragraph 3 — Atomic Updates:**
All database writes use transactions to ensure atomicity. When creating a Stripe session, the backend: (1) BEGIN transaction, (2) INSERT into payments, (3) INSERT into external_payments, (4) COMMIT. If any step fails, ROLLBACK. This prevents orphaned records. After COMMIT, the trigger fires and routes rebuild. This guarantees database consistency.

**Paragraph 4 — Acceptance:**
Create a payment via Mission Support form, verify it appears in payments and external_payments tables, verify payment_routes version increments, verify Wix webhook receives notification, verify Charter page shows updated route. All within 2 seconds. Test by rapid-fire creating 10 payments and verify only one route rebuild occurs (debounced).

---

## T18 — Prefill Token Lifecycle (4 paragraphs)

**Paragraph 1 — Objective:**
Implement prefill token system where Mission Support "Other" amount creates a token in ContributionIntent table, Charter page retrieves it, and token is marked used. Tokens expire after 10 minutes and are single-use. This ensures "Other → Charter prefill" flow works reliably.

**Paragraph 2 — Implementation:**
POST /mission-support/other creates a prefill record: _id=prefill_<timestamp>_<random>, amount_entered=<amount>, expires_at=now+10min, used=false, source='mission_support_other'. Returns redirectUrl with ?prefill=<id>. Charter page calls GET /prefill/<id> which validates expiry and used flag, returns {amount}, then marks used=true. If token expired or used, return 410 Gone. Frontend displays amount in Contribution selector.

**Paragraph 3 — Security:**
Prefill tokens are unguessable (UUID-like format). Server validates expiry and used flag before returning data. After retrieval, token is immediately marked used to prevent replay. If token is invalid, return 410 Gone with clear error message. Log all prefill operations to payment_audit.

**Paragraph 4 — Acceptance:**
Enter "Other" amount on Mission Support, submit, redirect to Charter, verify amount appears in Contribution selector, verify token is marked used in database, verify second attempt to use same token returns 410. Test expiry by manually setting expires_at to past time and verify 410 response.

---

## T19 — Currency Normalization & Routing Matrix (4 paragraphs)

**Paragraph 1 — Objective:**
Build a currency normalization layer that maps all user input (USD, usd, $, EUR, eur, BTC, btc, bitcoin, etc.) to ISO 4217 codes and determines payment provider (Stripe for fiat, NowPayments for crypto). The normalization must handle case variations, currency symbols, and common aliases.

**Paragraph 2 — Implementation:**
Create currencyMap: {USD: {type:'fiat', provider:'stripe'}, EUR: {type:'fiat', provider:'stripe'}, BTC: {type:'crypto', provider:'nowpayments'}, ETH: {type:'crypto', provider:'nowpayments'}, SOL: {type:'crypto', provider:'nowpayments'}, XLM: {type:'crypto', provider:'nowpayments'}}. Normalize input: toUpperCase(), strip symbols, map aliases (bitcoin→BTC, ethereum→ETH). If currency not in map, default to USD. Use normalized currency to determine provider and route to correct endpoint.

**Paragraph 3 — Routing Logic:**
When currency is normalized, check currencyMap[currency].type. If 'fiat', call Stripe endpoint. If 'crypto', call NowPayments endpoint. If provider unavailable, use fallback (wallet address for crypto, error message for fiat). Log routing decisions to payment_audit for debugging.

**Paragraph 4 — Acceptance:**
Test with inputs: 'USD', 'usd', '$', 'EUR', 'eur', 'BTC', 'btc', 'bitcoin', 'ETH', 'ethereum', 'SOL', 'solana', 'XLM', 'stellar'. Verify all normalize correctly and route to appropriate provider. Verify invalid currencies default to USD.

---

## T20 — Error-Proofing & onReady Fix (4 paragraphs)

**Paragraph 1 — Objective:**
Completely eliminate the TypeError: (0 , charter_page_middleware_web.onReady) is not a function error by ensuring middleware functions are exported correctly and called via HTTP endpoints, not direct imports. The frontend must never import middleware modules directly—it must always call /_functions/[module-name]/[function-name] via fetch.

**Paragraph 2 — Implementation:**
In charter-page-middleware.web.js, ensure all functions use export async function functionName(). In the frontend HTML, never use import statements for middleware. Instead, use the callVeloFunction() helper that calls /_functions/charter-page-middleware/onReady via POST. The helper detects CloudFront 403 errors and provides helpful error messages. This eliminates the import/export mismatch that caused the original error.

**Paragraph 3 — Self-Healing:**
Add a self-healing layer: before allowing user to click payment button, the frontend validates that paymentButtonUrl is set and is a valid HTTPS URL. If not set, it calls the backend to generate a payment URL. If URL is invalid, it disables the button and shows an error. This prevents users from clicking broken buttons.

**Paragraph 4 — Acceptance:**
Load Charter page, verify no TypeError in console, verify onReady() is called via HTTP and returns success, verify payment buttons are functional, verify currency selector updates button URL correctly. Test in Wix Preview and Live site—both must work.

---

## T21 — Docker Database Schema & Migrations (4 paragraphs)

**Paragraph 1 — Objective:**
Provide complete SQL migrations to create all required tables in your Docker Postgres database: payment_routes (canonical routes JSON), payment_audit (audit trail), and add provider columns to existing payments/external_payments tables. Also create triggers for NOTIFY events.

**Paragraph 2 — Implementation:**
Migration 001 creates payment_routes table with version, routes (JSONB), generated_at. Migration 002 adds provider, provider_id, provider_url, reconciled columns to payments and external_payments. Migration 003 creates payment_audit table. Migration 004 creates notify_hc_routes() trigger function and adds triggers to payments, external_payments, wallets tables. Migration 005 ensures ContributionIntent supports prefill (expires_at, used, used_at columns).

**Paragraph 3 — Backfill:**
Provide SQL to backfill provider_url from existing external_payments.provider_payload JSON fields. Extract invoice_url, payment_url, checkout_url from JSON and populate provider_url column. This ensures existing data is migrated correctly.

**Paragraph 4 — Acceptance:**
Run all migrations in order, verify tables exist, verify triggers fire on INSERT/UPDATE, verify payment_routes table can store JSONB routes, verify backfill populates provider_url correctly.

---

## T22 — Node Backend Endpoints (4 paragraphs)

**Paragraph 1 — Objective:**
Implement all Express endpoints: GET /routes, POST /mission-support/micro-payment, POST /mission-support/other, GET /prefill/:id, POST /charter/generate-payment, POST /admin/refresh. All endpoints read from/write to Docker Postgres, use environment variables for secrets, and return consistent JSON responses.

**Paragraph 2 — Implementation:**
Each endpoint validates input, queries/updates database, calls Stripe or NowPayments APIs as needed, saves results to database, triggers route rebuild if needed, and returns {success: true/false, data/error}. Use try/catch for error handling, log to payment_audit on failures, return appropriate HTTP status codes (200 success, 400 bad request, 404 not found, 500 server error).

**Paragraph 3 — Security:**
All endpoints validate input (amount ranges, currency formats, token formats). Admin endpoints require ADMIN_TOKEN header. Webhook endpoints verify WEBHOOK_SECRET header. Never expose secrets in responses. Log all operations to payment_audit for audit trail.

**Paragraph 4 — Acceptance:**
Test each endpoint with valid and invalid inputs, verify database updates correctly, verify error handling works, verify secrets are never exposed in logs or responses. Use Postman or curl to test locally.

---

## T23 — Wix Velo Integration (4 paragraphs)

**Paragraph 1 — Objective:**
Update Wix Velo middleware (charter-page-middleware.web.js and mission-support-middleware.web.js) to call backend HTTP endpoints instead of direct database access where possible. Ensure all functions are exported correctly and accessible via /_functions/[module]/[function] paths.

**Paragraph 2 — Implementation:**
mission-support-middleware.web.js exports: microPayment(amount), otherAmount(amount, userInfo), getPrefill(prefillId). charter-page-middleware.web.js exports: onReady(), cryptoButtonClick(amount, coin), fiatButtonClick(amount, paymentMethod), getCumulativeTotal(). All functions return {success, data/error}. Frontend calls these via callVeloFunction() helper which uses fetch to /_functions/[module]/[function].

**Paragraph 3 — Prefill Integration:**
charter-page-middleware.web.js onReady() checks for ?prefill=<id> in URL, calls mission-support-middleware.getPrefill(id) to retrieve amount, and returns it in the response. Frontend uses this to pre-fill Contribution selector. This ensures seamless Mission Support → Charter flow.

**Paragraph 4 — Acceptance:**
Deploy middleware to Wix, test each function endpoint, verify prefill flow works end-to-end, verify no TypeError errors, verify currency routing updates button URLs correctly.

---

## T24 — Reconciliation Job (4 paragraphs)

**Paragraph 1 — Objective:**
Implement scheduled reconciliation job that runs every 15 minutes, queries external_payments for pending payments, calls Stripe/NowPayments APIs to get current status, compares with database status, and updates database if mismatched. Log all reconciliations to payment_audit.

**Paragraph 2 — Implementation:**
worker.js uses node-cron to schedule reconcile.runOnce() every 15 minutes. reconcile.js queries external_payments WHERE status='pending' AND created_at > now - 24 hours. For each, if gateway='stripe', call stripe.retrieveSession(provider_id). If gateway='nowpayments', call nowpayments.getInvoiceStatus(provider_id). Compare status, update database if different, log to payment_audit.

**Paragraph 3 — Mismatch Handling:**
If provider says "paid" but database says "pending", update database to "completed" and log reconciliation. If provider says "failed" but database says "pending", update to "failed" and notify user if possible. If provider returns 404 (payment not found), mark as "error" and log.

**Paragraph 4 — Acceptance:**
Run reconciliation manually, verify it queries providers correctly, verify database updates on status changes, verify payment_audit entries are created. Test with Stripe test mode payments and verify reconciliation works.

---

## T25 — Testing & Validation (4 paragraphs)

**Paragraph 1 — Objective:**
Provide comprehensive tests: unit tests for routesBuilder logic, integration tests for endpoints, E2E tests for Mission Support → Charter flow. Use Jest for unit tests, docker-compose for integration tests, Cypress for E2E.

**Paragraph 2 — Implementation:**
Unit tests mock database queries and assert routesBuilder produces correct JSON structure. Integration tests start docker-compose, run migrations, seed test data, call endpoints, verify database updates. E2E tests load Wix pages, fill forms, submit, verify redirects work.

**Paragraph 3 — Test Coverage:**
Aim for >80% coverage on middleware modules. Test error cases: invalid amounts, expired tokens, API failures, network errors. Test edge cases: rapid currency changes, concurrent payments, token reuse attempts.

**Paragraph 4 — Acceptance:**
Run npm test, verify all tests pass, run integration tests, verify endpoints work, run E2E tests, verify full user flows work. Document test results in test_results/ directory.

---

## T26 — Deployment & Production Readiness (4 paragraphs)

**Paragraph 1 — Objective:**
Provide deployment checklist: build Docker images, configure environment variables, run migrations, start containers, verify health endpoints, test endpoints, configure Wix webhooks, deploy Wix middleware, test end-to-end.

**Paragraph 2 — Implementation:**
docker-compose up --build builds and starts all services. Run migrations via psql or migration script. Set all environment variables in .env file. Verify GET /health returns 200. Test each endpoint. Configure WIX_WEBHOOK_ENDPOINTS to point to Wix HTTP Functions. Deploy Wix middleware files. Test Mission Support → Charter → Payment flow.

**Paragraph 3 — Monitoring:**
Add healthcheck endpoints, log all operations, set up error alerts (Sentry or similar), monitor reconciliation job success rate, track route rebuild frequency. Create dashboards for payment volume, success rate, error rate.

**Paragraph 4 — Acceptance:**
Deploy to staging, run full test suite, verify all flows work, check logs for errors, verify monitoring is active. Only promote to production after staging verification.

---

## T27 — Documentation & Runbooks (4 paragraphs)

**Paragraph 1 — Objective:**
Create comprehensive documentation: architecture.md (system overview), api.md (endpoint documentation), deployment.md (deployment steps), troubleshooting.md (common issues and fixes), runbooks/ (operational procedures).

**Paragraph 2 — Implementation:**
docs/architecture.md describes the three-layer architecture (Wix → Node → Postgres), data flow diagrams, sync mechanisms. docs/api.md documents all endpoints with request/response examples. docs/deployment.md provides step-by-step deployment instructions. docs/troubleshooting.md lists common errors and solutions. runbooks/ contains procedures for: handling payment failures, rotating keys, rolling back routes, debugging sync issues.

**Paragraph 3 — Developer Onboarding:**
docs/onboarding.md explains how to set up local environment, run migrations, test endpoints, deploy to staging. Include prerequisites, setup steps, test procedures, common pitfalls.

**Paragraph 4 — Acceptance:**
New developer can follow docs and set up local environment in <30 minutes. All procedures are documented and tested. Runbooks are actionable and complete.

---

## T28 — Security & Compliance (4 paragraphs)

**Paragraph 1 — Objective:**
Ensure all secrets are stored in environment variables, never in code or database. Implement input validation, SQL injection prevention, rate limiting, webhook signature verification. Add audit logging for all sensitive operations.

**Paragraph 2 — Implementation:**
All API keys read from process.env. Use parameterized queries (never string concatenation) for SQL. Validate all inputs (amounts, currencies, tokens). Rate limit endpoints (100 req/min per IP). Verify webhook signatures from Stripe and NowPayments. Log all payment operations, admin actions, and errors to payment_audit.

**Paragraph 3 — Key Rotation:**
Provide procedures for rotating Stripe keys, NowPayments keys, webhook secrets. Document steps: generate new key, update env, test, deploy, verify, revoke old key. Ensure zero downtime during rotation.

**Paragraph 4 — Acceptance:**
Scan codebase for hardcoded secrets (none found). Test input validation rejects malicious inputs. Test rate limiting works. Test webhook signature verification. Verify audit logs capture all operations.

---

## T29 — Performance & Scaling (4 paragraphs)

**Paragraph 1 — Objective:**
Ensure system handles 1000+ concurrent users, sub-200ms response times for /routes endpoint, efficient database queries with proper indexes, connection pooling, and horizontal scaling capability.

**Paragraph 2 — Implementation:**
Add database indexes on provider_id, provider_url, currency columns. Use connection pooling (pg Pool with max=20). Cache payment_routes in memory with TTL (refresh on version change). Use Redis for distributed caching if scaling horizontally. Optimize routesBuilder to use single query with JOINs instead of multiple queries.

**Paragraph 3 — Load Testing:**
Use artillery or k6 to simulate 1000 concurrent users hitting /routes, /charter/generate-payment endpoints. Measure response times, database load, memory usage. Identify bottlenecks and optimize.

**Paragraph 4 — Acceptance:**
/routes responds in <200ms under load. Database queries use indexes (EXPLAIN shows index usage). System handles 1000 concurrent users without errors. Memory usage stays stable.

---

## T30 — Final Handover & Signoff (4 paragraphs)

**Paragraph 1 — Objective:**
Package all code, migrations, tests, documentation into release package. Provide verification checklist for QA signoff. Create handover document with system overview, key contacts, escalation procedures.

**Paragraph 2 — Implementation:**
Create hingecraft_payment_release_v1.zip containing: backend/ (all Node files), migrations/ (all SQL), docs/ (all documentation), tests/ (all test files), docker-compose.yml, .env.example, README.md. Create verification_signoff.md with checkboxes for: routes mapping works, micro-payments work, prefill flow works, currency routing works, reconciliation works, webhooks work, no errors in logs.

**Paragraph 3 — Handover Meeting:**
Schedule handover meeting to walk through architecture, demonstrate flows, answer questions, provide access credentials (secrets stored securely), explain monitoring and alerting.

**Paragraph 4 — Acceptance:**
QA completes verification checklist, all items checked, system deployed to production, monitoring active, team trained, documentation complete. Release marked "production ready".

---

## Raw Components List (Complete)

1. Backend Node.js Express server (server.js)
2. Database connection module (db.js)
3. Payment routes builder (routesBuilder.js)
4. Database listener (listener.js)
5. Stripe service wrapper (stripe.js)
6. NowPayments service wrapper (nowpayments.js)
7. Reconciliation job (reconcile.js)
8. Worker process (worker.js)
9. Docker Compose configuration
10. Dockerfile for Node backend
11. Package.json with dependencies
12. SQL migrations (001-005)
13. Environment variables template (.env.example)
14. Wix Velo middleware (charter-page-middleware.web.js)
15. Wix Velo middleware (mission-support-middleware.web.js)
16. Frontend helper (callVeloFunction in charter-page-wix-ready.html)
17. Payment routes table (payment_routes)
18. Payment audit table (payment_audit)
19. Database triggers (notify_hc_routes)
20. ContributionIntent prefill support
21. GET /routes endpoint
22. POST /mission-support/micro-payment endpoint
23. POST /mission-support/other endpoint
24. GET /prefill/:id endpoint
25. POST /charter/generate-payment endpoint
26. POST /admin/refresh endpoint
27. Health check endpoint (GET /health)
28. Webhook notification system
29. Currency normalization map
30. Error handling and logging
31. Idempotency keys for Stripe
32. Retry logic with exponential backoff
33. Database transaction support
34. Route versioning system
35. Debounced route rebuilds
36. Wix webhook HTTP Functions
37. Prefill token validation
38. Wallet fallback routing
39. Reconciliation scheduler
40. Payment status polling
41. Admin token authentication
42. Input validation middleware
43. CORS configuration
44. Structured logging
45. Error monitoring (Sentry-ready)
46. Metrics collection (Prometheus-ready)
47. Test suite (Jest)
48. Integration tests
49. E2E tests (Cypress)
50. Documentation (architecture, API, deployment, troubleshooting, runbooks)

---

## Next Steps

1. **Set environment variables** in backend/.env (Stripe key, NowPayments key, etc.)
2. **Run migrations** against your Docker Postgres
3. **Start backend** with docker-compose up
4. **Deploy Wix middleware** files to Wix Editor
5. **Configure Wix webhooks** to point to your backend
6. **Test end-to-end** flows

All code is ready—just add your secrets to environment variables and deploy!
