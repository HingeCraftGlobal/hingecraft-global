# Complete Database Setup Guide

## Overview

This guide provides complete setup instructions for the HingeCraft database system, including Docker-based offline/serverless deployment.

## Quick Start

### Option 1: Docker (Recommended - Offline/Serverless)

```bash
# 1. Clone repository
gh repo clone departments-commits/hingecraft-global
cd hingecraft-global

# 2. Configure environment
cp .env.example .env
# Edit .env with secure credentials

# 3. Start services
docker-compose up -d

# 4. Verify
curl http://localhost:3000/health
```

**See `DOCKER_SETUP.md` for complete Docker guide.**

### Option 2: Manual PostgreSQL Setup

1. Install PostgreSQL locally
2. Run `database/init.sql` to create schema
3. Configure `database-adaptor/.env`
4. Start API: `cd database-adaptor && npm start`

## Database Schema

The system uses PostgreSQL with a single `donations` table:

**Table**: `donations`

**Fields**:
- `id` (VARCHAR) - Primary key (UUID)
- `amount` (DECIMAL) - Donation amount
- `currency` (VARCHAR) - Currency code
- `is_other_amount` (BOOLEAN) - Custom amount flag
- `source` (VARCHAR) - Source identifier
- `payment_status` (VARCHAR) - Payment status
- `payment_method` (VARCHAR) - Payment method
- `transaction_id` (VARCHAR) - Unique transaction ID
- `member_email` (VARCHAR) - Member email
- `member_name` (VARCHAR) - Member name
- `created_at` (TIMESTAMP) - Creation time
- `updated_at` (TIMESTAMP) - Last update time
- `metadata` (JSONB) - Additional data

**Indexes**:
- `idx_donations_created_at` - For latest donation queries
- `idx_donations_transaction_id` - For transaction lookups
- `idx_donations_payment_status` - For status filtering
- `idx_donations_member_email` - For member queries

See `database-schema.sql` for complete SQL.

## Wix Configuration

### Step 1: Set Up External Database Connection

1. Go to Wix Editor → Database → External Database
2. Click "Connect External Database"
3. Select "Custom"
4. Enter:
   - **Connection Name**: `HingeCraftDonationsDB`
   - **Endpoint URL**: 
     - Local: `http://localhost:3000` (with tunnel)
     - Production: `https://your-api-url.com`
   - **Secret Key**: From `.env` file

### Step 2: Update Backend Code

In `velo-backend-api.js`:

```javascript
const EXTERNAL_DB_ENDPOINT = 'http://localhost:3000'; // or production URL
const EXTERNAL_DB_SECRET_KEY = 'your_secret_key_from_env';
const USE_EXTERNAL_DB = true;
```

### Step 3: Test Connection

```javascript
// In Wix backend console
import { getLatestDonation } from 'backend/hingecraft-api';
const result = await getLatestDonation();
console.log(result);
```

## API Endpoints

All endpoints require authentication via `Authorization: Bearer {SECRET_KEY}` header.

### 1. Health Check
```
GET /health
Response: { status: "healthy", database: "connected", timestamp: "..." }
```

### 2. Get Latest Donation
```
GET /donations/latest
Response: { id, amount, currency, is_other_amount, created_at }
```

### 3. Create Donation
```
POST /donations
Body: {
  "amount": 50.00,
  "currency": "USD",
  "is_other_amount": true,
  "source": "payment_page",
  "payment_status": "completed",
  "payment_method": "card",
  "transaction_id": "txn_123",
  "member_email": "user@example.com",
  "member_name": "John Doe",
  "metadata": {}
}
Response: { id, amount, created_at }
```

### 4. Get All Donations
```
GET /donations?limit=100&offset=0
Response: { donations: [...], total: 100, limit: 100, offset: 0 }
```

### 5. Get Donation by ID
```
GET /donations/:id
Response: { id, amount, currency, ... }
```

### 6. Update Donation
```
PATCH /donations/:id
Body: { "payment_status": "completed", "metadata": {} }
Response: { id, payment_status, updated_at }
```

## Docker Services

### PostgreSQL Database
- **Image**: `postgres:15-alpine`
- **Port**: `5432`
- **Database**: `hingecraft_db`
- **User**: `hingecraft_user`
- **Password**: From `.env` (`DB_PASSWORD`)

### Database Adaptor API
- **Image**: Custom (Node.js)
- **Port**: `3000`
- **Endpoints**: See API documentation above

## Management Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Access Database
```bash
docker-compose exec postgres psql -U hingecraft_user -d hingecraft_db
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U hingecraft_user hingecraft_db > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U hingecraft_user hingecraft_db < backup.sql
```

## Production Deployment

### Deploy API to Cloud

**Recommended Platforms**:
- Railway: `railway.app`
- Render: `render.com`
- Fly.io: `fly.io`
- Heroku: `heroku.com`
- AWS ECS/Fargate: `aws.amazon.com`

**Steps**:
1. Push code to GitHub
2. Connect to deployment platform
3. Set environment variables
4. Deploy
5. Update Wix with production URL

### Use Managed PostgreSQL

**Recommended Services**:
- AWS RDS
- Google Cloud SQL
- Azure Database
- Supabase
- Neon
- Railway PostgreSQL

**Steps**:
1. Create managed PostgreSQL instance
2. Get connection string
3. Update `database-adaptor/.env` with connection details
4. Deploy API
5. Configure Wix

## Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Use strong random strings for `SECRET_KEY`
- [ ] Enable HTTPS in production
- [ ] Restrict database port to internal network
- [ ] Use Wix Secrets Manager for credentials
- [ ] Set up automated backups
- [ ] Monitor API logs
- [ ] Implement rate limiting (if needed)

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U hingecraft_user
```

### API Issues
```bash
# Check API logs
docker-compose logs db-adaptor

# Test health endpoint
curl http://localhost:3000/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_SECRET_KEY" http://localhost:3000/donations/latest
```

### Wix Connection Issues
- Verify endpoint URL is accessible
- Check secret key matches
- Test API directly with curl
- Check CORS settings (if needed)
- Use tunnel service for local development

## File Structure

```
hingecraft-global/
├── docker-compose.yml          # Docker services configuration
├── .env.example                # Environment variables template
├── database/
│   ├── init.sql                # Database schema (auto-runs in Docker)
│   └── schema.sql              # Alternative schema file
├── database-adaptor/
│   ├── server.js               # Express API server
│   ├── package.json            # Node.js dependencies
│   ├── Dockerfile              # Docker image definition
│   └── .env.example            # API environment template
└── velo-backend-api.js         # Wix backend code
```

## Next Steps

1. ✅ Set up Docker environment
2. ✅ Configure `.env` file
3. ✅ Start Docker services
4. ✅ Verify API is running
5. ✅ Configure Wix database connection
6. ✅ Update Wix backend code
7. ✅ Test donation flow
8. ⬜ Deploy to production (if needed)

## Additional Resources

- **Docker Setup**: `DOCKER_SETUP.md`
- **Connection Setup**: `DATABASE_CONNECTION_SETUP.md`
- **Database Schema**: `database-schema.sql`
- **API Code**: `database-adaptor/server.js`
- **Project Setup**: `PROJECT_SETUP.md`

## Support

For issues:
1. Check Docker logs: `docker-compose logs -f`
2. Verify environment: `cat .env`
3. Test API: `curl http://localhost:3000/health`
4. Check database: `docker-compose exec postgres psql -U hingecraft_user -d hingecraft_db`





