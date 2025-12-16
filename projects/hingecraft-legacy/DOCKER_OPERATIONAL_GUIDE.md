# Docker Operational Guide - HingeCraft

Complete guide to get your Docker setup running and operational for Wix integration.

## 🚀 Quick Start

### 1. Prerequisites
- Docker Desktop installed and running
- Git (for cloning/pushing)

### 2. Initial Setup

```bash
# Navigate to project directory
cd [PROJECT_ROOT]/HingeCraft

# Create environment file
cp .env.example .env

# Edit .env with your secure credentials
# DB_PASSWORD=your_secure_password_here
# ADAPTOR_SECRET_KEY=your_secret_key_here
```

### 3. Start Docker Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Verify Everything Works

```bash
# Test health endpoint (no auth required)
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","database":"connected","timestamp":"..."}

# Test with authentication
curl -H "Authorization: Bearer your_secret_key_here" \
     http://localhost:3000/donations/latest
```

## 📋 Service Details

### PostgreSQL Database
- **Port**: `5432`
- **Database**: `hingecraft_db`
- **User**: `hingecraft_user`
- **Password**: From `.env` file
- **Data Persistence**: Docker volume `postgres_data`

### Database Adaptor API
- **Port**: `3000`
- **Health Check**: `http://localhost:3000/health`
- **Authentication**: Required for all endpoints except `/health`
- **Secret Key**: From `.env` file (`ADAPTOR_SECRET_KEY`)

## 🔧 Common Operations

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f db-adaptor
docker-compose logs -f postgres
```

### Rebuild After Changes
```bash
# Rebuild API service
docker-compose build db-adaptor
docker-compose up -d db-adaptor
```

### Access Database
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U hingecraft_user -d hingecraft_db

# Run SQL commands
docker-compose exec postgres psql -U hingecraft_user -d hingecraft_db -c "SELECT * FROM donations;"
```

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U hingecraft_user hingecraft_db > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T postgres psql -U hingecraft_user hingecraft_db < backup_20240101.sql
```

## 🌐 Connecting Wix to Docker (Local Development)

Since Wix runs in the cloud and can't access `localhost`, you need a tunnel:

### Option 1: ngrok (Recommended)

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://multiracial-zavier-acculturative.ngrok-free.dev)
# Use this URL in Wix configuration
```

### Option 2: localtunnel

```bash
# Install
npm install -g localtunnel

# Start tunnel
lt --port 3000

# Copy the URL provided
```

### Wix Configuration (with Tunnel)

1. Go to Wix Editor → Database → External Database
2. Click "Connect External Database" → Select "Custom"
3. Enter:
   - **Connection Name**: `HingeCraftDonationsDB`
   - **Endpoint URL**: `https://multiracial-zavier-acculturative.ngrok-free.dev` (from tunnel)
   - **Secret Key**: Your `ADAPTOR_SECRET_KEY` from `.env`

4. Update `velo-backend-api.js`:
   ```javascript
   const EXTERNAL_DB_ENDPOINT = 'https://multiracial-zavier-acculturative.ngrok-free.dev';
   const EXTERNAL_DB_SECRET_KEY = 'your_secret_key_from_env';
   ```

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Get Latest Donation
```bash
curl -H "Authorization: Bearer YOUR_SECRET_KEY" \
     http://localhost:3000/donations/latest
```

### Create Donation
```bash
curl -X POST http://localhost:3000/donations \
     -H "Authorization: Bearer YOUR_SECRET_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 50.00,
       "is_other_amount": true,
       "source": "payment_page"
     }'
```

### List All Donations
```bash
curl -H "Authorization: Bearer YOUR_SECRET_KEY" \
     http://localhost:3000/donations
```

## 🔍 Troubleshooting

### Services Won't Start
```bash
# Check Docker is running
docker ps

# Check logs for errors
docker-compose logs

# Verify ports aren't in use
lsof -i :3000
lsof -i :5432
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U hingecraft_user
```

### API Not Responding
```bash
# Check API logs
docker-compose logs db-adaptor

# Verify environment variables
docker-compose exec db-adaptor env | grep -E "DB_|SECRET"

# Restart API
docker-compose restart db-adaptor
```

### Authentication Errors
- Verify `ADAPTOR_SECRET_KEY` in `.env` matches what you're sending
- Check header format: `Authorization: Bearer YOUR_KEY`
- Ensure secret key is set in both `.env` and Wix configuration

## 📊 Monitoring

### Check Service Status
```bash
docker-compose ps
```

### View Resource Usage
```bash
docker stats
```

### Database Size
```bash
docker-compose exec postgres psql -U hingecraft_user -d hingecraft_db \
  -c "SELECT pg_size_pretty(pg_database_size('hingecraft_db'));"
```

## 🔒 Security Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use strong passwords** - Generate random strings
3. **Change default secrets** - Don't use example values in production
4. **Keep tunnel secure** - ngrok free tier shows URLs publicly
5. **Use HTTPS in production** - Deploy to Railway/Render for production

## 🚀 Production Deployment

For production with Wix, deploy to:
- **Railway** (recommended) - See `RAILWAY_DEPLOY.md`
- **Render** - See `DEPLOYMENT_RECOMMENDATIONS.md`
- **Fly.io** - See `DEPLOYMENT_RECOMMENDATIONS.md`

Docker local setup is for **development only**.

## 📝 Next Steps

1. ✅ Docker services running
2. ✅ Health check passing
3. ✅ API responding
4. ⬜ Set up tunnel (ngrok) for Wix testing
5. ⬜ Configure Wix with tunnel URL
6. ⬜ Test donation flow
7. ⬜ Deploy to production (Railway) when ready

---

**Status**: Ready for development and testing! 🎉




