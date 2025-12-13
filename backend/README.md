# HingeCraft Payment Orchestration Backend

Complete Node.js backend for HingeCraft payment system.

## Quick Start

1. **Set environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Stripe key, NowPayments key, etc.
   ```

2. **Start Docker services:**
   ```bash
   docker-compose up --build
   ```

3. **Run migrations:**
   ```bash
   ./scripts/run-migrations.sh
   ```

4. **Test endpoints:**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/routes
   ```

## Endpoints

- `GET /health` - Health check
- `GET /routes` - Get canonical payment routes
- `POST /mission-support/micro-payment` - Create Stripe session for $1/$2/$5
- `POST /mission-support/other` - Create prefill token for "Other" amount
- `GET /prefill/:id` - Get prefill data
- `POST /charter/generate-payment` - Generate payment URL based on currency
- `POST /admin/refresh` - Force rebuild routes

## Environment Variables

See `.env.example` for all required variables.

**Required:**
- `DATABASE_URL` - Postgres connection string
- `STRIPE_SECRET` - Stripe secret key (test or live)
- `NOWPAYMENTS_API_KEY` - NowPayments API key
- `BASE_URL` - Your site base URL

**Optional:**
- `WIX_WEBHOOK_ENDPOINTS` - Comma-separated Wix webhook URLs
- `WEBHOOK_SECRET` - Secret for webhook verification
- `ADMIN_TOKEN` - Token for admin endpoints

## Database

Uses Docker Postgres. Migrations are in `migrations/` directory.

Run migrations:
```bash
docker exec -i hingecraft-payment-db psql -U hingecraft_user -d hingecraft < migrations/001_create_payment_routes.sql
# ... repeat for all migrations
```

## Development

```bash
# Install dependencies
npm install

# Start in dev mode (with nodemon)
npm run dev

# Run tests
npm test

# Run worker
npm run worker
```

## Production

```bash
# Build and start
docker-compose up --build -d

# View logs
docker logs -f hingecraft-payment-api
docker logs -f hingecraft-payment-worker

# Stop
docker-compose down
```

## Architecture

- **Express server** - Handles HTTP requests
- **Postgres database** - Stores all payment data
- **LISTEN/NOTIFY** - Real-time route updates
- **Worker process** - Scheduled reconciliation
- **Route builder** - Creates canonical payment routes

See `docs/T14-T30_COMPLETE_PROMPTS.md` for full architecture details.
