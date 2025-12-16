# HingeCraft Docker Setup Guide

## Complete Offline/Serverless Database Setup

This guide sets up a complete Docker-based database system that runs offline and is serverless-ready.

## Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- Git (for cloning repository)

## Quick Start

### Step 1: Clone Repository

```bash
gh repo clone departments-commits/hingecraft-global
cd hingecraft-global
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your secure credentials
nano .env  # or use your preferred editor
```

**Important**: Change the default passwords in `.env`:
- `DB_PASSWORD`: Strong password for PostgreSQL
- `ADAPTOR_SECRET_KEY`: Secret key for API authentication

### Step 3: Start Docker Services

```bash
# Start all services (database + API)
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Step 4: Verify Setup

```bash
# Test database connection
docker-compose exec postgres psql -U hingecraft_user -d hingecraft_db -c "SELECT COUNT(*) FROM donations;"

# Test API health
curl http://localhost:3000/health

# Test API with authentication
curl -H "Authorization: Bearer YOUR_SECRET_KEY" http://localhost:3000/donations/latest
```

## Configuration for Wix

### Connection Details

Once Docker is running, use these values in Wix:

**Connection Name**: `HingeCraftDonationsDB`

**Endpoint URL**: 
- **Local Development**: `http://localhost:3000` (for testing)
- **Production/Deployed**: `https://your-deployed-api-url.com` (see deployment section)

**Secret Key**: The value from your `.env` file (`ADAPTOR_SECRET_KEY`)

### Update Wix Backend Code

In `velo-backend-api.js`, update:

```javascript
const EXTERNAL_DB_ENDPOINT = 'http://localhost:3000'; // Local
// OR for production:
// const EXTERNAL_DB_ENDPOINT = 'https://your-deployed-api-url.com';
const EXTERNAL_DB_SECRET_KEY = 'YOUR_SECRET_KEY_FROM_ENV';
const USE_EXTERNAL_DB = true;
```

## Docker Services

### 1. PostgreSQL Database
- **Container**: `hingecraft-postgres`
- **Port**: `5432`
- **Database**: `hingecraft_db`
- **User**: `hingecraft_user`
- **Password**: From `.env` file

### 2. Database Adaptor API
- **Container**: `hingecraft-db-adaptor`
- **Port**: `3000`
- **Endpoints**: See API documentation below

## API Endpoints

All endpoints require authentication via:
- Header: `Authorization: Bearer {SECRET_KEY}`
- OR Header: `X-API-Key: {SECRET_KEY}`

### Health Check (No Auth Required)
```
GET /health
```

### Get Latest Donation
```
GET /donations/latest
Headers: Authorization: Bearer {SECRET_KEY}
```

### Create Donation
```
POST /donations
Headers: Authorization: Bearer {SECRET_KEY}
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
```

### Get All Donations
```
GET /donations?limit=100&offset=0
Headers: Authorization: Bearer {SECRET_KEY}
```

### Get Donation by ID
```
GET /donations/{id}
Headers: Authorization: Bearer {SECRET_KEY}
```

### Update Donation
```
PATCH /donations/{id}
Headers: Authorization: Bearer {SECRET_KEY}
Body: {
  "payment_status": "completed",
  "metadata": {}
}
```

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
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f db-adaptor
```

### Restart Services
```bash
docker-compose restart
```

### Access Database Directly
```bash
# PostgreSQL CLI
docker-compose exec postgres psql -U hingecraft_user -d hingecraft_db

# Run SQL commands
docker-compose exec postgres psql -U hingecraft_user -d hingecraft_db -c "SELECT * FROM donations;"
```

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U hingecraft_user hingecraft_db > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U hingecraft_user hingecraft_db < backup.sql
```

### Reset Database
```bash
# Stop and remove volumes (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d
```

## Production Deployment

### Option 1: Deploy to Cloud (Recommended)

#### Deploy API to:
- **Railway**: `railway.app`
- **Render**: `render.com`
- **Fly.io**: `fly.io`
- **Heroku**: `heroku.com`
- **AWS ECS/Fargate**: `aws.amazon.com`

#### Steps:
1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables:
   - `DB_HOST`: Your PostgreSQL host (or use managed DB)
   - `DB_PASSWORD`: Database password
   - `SECRET_KEY`: API secret key
4. Deploy

#### Update Wix:
- Use deployed API URL as `EXTERNAL_DB_ENDPOINT`
- Use same `SECRET_KEY` in Wix backend

### Option 2: Self-Hosted Server

1. Install Docker on your server
2. Clone repository
3. Configure `.env`
4. Run `docker-compose up -d`
5. Set up reverse proxy (nginx) for HTTPS
6. Use server URL in Wix

## Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U hingecraft_user
```

### API Not Responding
```bash
# Check API logs
docker-compose logs db-adaptor

# Test health endpoint
curl http://localhost:3000/health

# Restart API
docker-compose restart db-adaptor
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml
# Update postgres port: "5433:5432"
# Update API port: "3001:3000"
```

### Reset Everything
```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove images
docker-compose rm -f

# Start fresh
docker-compose up -d
```

## Security Notes

1. **Change Default Passwords**: Always change default values in `.env`
2. **Use Strong Secrets**: Generate strong random strings for `SECRET_KEY`
3. **HTTPS in Production**: Always use HTTPS for production deployments
4. **Firewall**: Restrict database port (5432) to internal network only
5. **Backup Regularly**: Set up automated backups for production

## Next Steps

1. ✅ Docker services running
2. ✅ API accessible at `http://localhost:3000`
3. ✅ Database initialized with schema
4. ⬜ Configure Wix with endpoint URL and secret key
5. ⬜ Test donation flow end-to-end
6. ⬜ Deploy to production (if needed)

## Support

For issues:
- Check Docker logs: `docker-compose logs -f`
- Verify environment variables: `cat .env`
- Test API: `curl http://localhost:3000/health`
- Check database: `docker-compose exec postgres psql -U hingecraft_user -d hingecraft_db`





