# Docker Database Setup - Complete Guide

## Quick Start

### 1. Start Docker Services

```bash
cd backend
docker-compose up --build -d
```

This starts:
- PostgreSQL database (port 5432)
- Node.js API server (port 3000)
- Worker process (reconciliation)

### 2. Run Migrations

```bash
./scripts/run-migrations.sh
```

Or manually:
```bash
docker exec -i hingecraft-payment-db psql -U hingecraft_user -d hingecraft < migrations/001_create_payment_routes.sql
docker exec -i hingecraft-payment-db psql -U hingecraft_user -d hingecraft < migrations/002_add_provider_columns.sql
docker exec -i hingecraft-payment-db psql -U hingecraft_user -d hingecraft < migrations/003_create_payment_audit.sql
docker exec -i hingecraft-payment-db psql -U hingecraft_user -d hingecraft < migrations/004_notify_triggers.sql
docker exec -i hingecraft-payment-db psql -U hingecraft_user -d hingecraft < migrations/005_contribution_intent_prefill.sql
```

### 3. Verify Database

```bash
# Connect to database
docker exec -it hingecraft-payment-db psql -U hingecraft_user -d hingecraft

# Check tables
\dt

# Should show:
# - payment_routes
# - payment_audit
# - payments (with new columns)
# - external_payments (with new columns)
# - wallets
# - contribution_intent

# Check triggers
\df notify_hc_routes

# Should show: notify_hc_routes() returns trigger
```

### 4. Test Database Listener

```bash
# Check backend logs
docker logs -f hingecraft-payment-api

# Should show:
# ✅ Database listener started (LISTEN hc_routes_changed)
```

### 5. Test Route Building

```bash
# Insert test payment
docker exec -it hingecraft-payment-db psql -U hingecraft_user -d hingecraft -c "
INSERT INTO external_payments (gateway, provider_url, currency, amount) 
VALUES ('stripe', 'https://checkout.stripe.com/test', 'USD', 1);
"

# Check backend logs - should see:
# 📢 PG NOTIFY received: hc_routes_changed
# 🔄 Rebuilding payment routes after notification...
# ✅ Payment routes built - version X
```

## Database Connection

### From Backend
- Connection string: `postgresql://hingecraft_user:changeme@db:5432/hingecraft`
- Set in `backend/.env`: `DATABASE_URL=...`

### From Host Machine
- Host: `localhost`
- Port: `5432`
- User: `hingecraft_user`
- Password: `changeme` (or set in docker-compose.yml)
- Database: `hingecraft`

## Tables Created

### payment_routes
- Stores canonical payment routes JSON
- Versioned (increments on each rebuild)
- Single source of truth for currency → URL mapping

### payment_audit
- Audit trail for all payment operations
- Tracks errors, reconciliations, admin actions

### Updated Tables
- `payments`: Added `provider`, `provider_id`, `provider_url`, `reconciled`
- `external_payments`: Added `provider`, `provider_id`, `provider_url`, `reconciled`, `reconciled_at`
- `contribution_intent`: Added `expires_at`, `used`, `used_at` (for prefill)

## Triggers

### notify_hc_routes()
- Fires on INSERT/UPDATE/DELETE to:
  - `payments`
  - `external_payments`
  - `wallets`
- Sends `pg_notify('hc_routes_changed')`
- Backend listener receives notification and rebuilds routes

## Verification Checklist

- [ ] Docker containers running (`docker ps`)
- [ ] Database accessible (`docker exec -it hingecraft-payment-db psql -U hingecraft_user -d hingecraft`)
- [ ] All tables exist (`\dt`)
- [ ] Triggers exist (`\df notify_hc_routes`)
- [ ] Backend listener started (check logs)
- [ ] Test insert triggers notification (check logs)
- [ ] Routes rebuild after insert (check payment_routes table)

## Troubleshooting

### Database not accessible
```bash
# Check container is running
docker ps | grep hingecraft-payment-db

# Check logs
docker logs hingecraft-payment-db

# Restart if needed
docker-compose restart db
```

### Migrations failed
```bash
# Check if tables exist
docker exec -it hingecraft-payment-db psql -U hingecraft_user -d hingecraft -c "\dt"

# Run migrations manually
docker exec -i hingecraft-payment-db psql -U hingecraft_user -d hingecraft < migrations/001_create_payment_routes.sql
```

### Listener not working
```bash
# Check backend logs
docker logs hingecraft-payment-api

# Should see: "Database listener started"
# If not, check DATABASE_URL in .env
```

### Routes not rebuilding
```bash
# Manually trigger rebuild
curl -X POST http://localhost:3000/admin/refresh

# Check payment_routes table
docker exec -it hingecraft-payment-db psql -U hingecraft_user -d hingecraft -c "SELECT version, generated_at FROM payment_routes ORDER BY version DESC LIMIT 1;"
```
