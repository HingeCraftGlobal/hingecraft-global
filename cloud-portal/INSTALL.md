# 🚀 Complete Installation Guide - HingeCraft Cloud Portal

## Quick Start (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/HingeCraftGlobal/hingecraft-global.git
cd hingecraft-global/cloud-portal

# 2. Run the automated installer
./BUILD_ALL.sh

# 3. Wait 2-5 minutes for ML models to load
# 4. Test the installation
curl http://localhost:8080/health
```

That's it! The system is now running.

---

## What Gets Installed

### Docker Services
1. **PostgreSQL Database** (Port 5433)
   - pgvector extension for semantic search
   - Row-Level Security (RLS)
   - Persistent data storage

2. **Redis** (Port 6379)
   - Queue management for ML tasks
   - Caching layer
   - Persistent storage

3. **Go API Gateway** (Port 8080)
   - Production-ready API
   - JWT authentication
   - Rate limiting

4. **ML Brain Service** (Port 8000)
   - FastAPI application
   - Sentence Transformers model
   - Vector embeddings

5. **ML Worker** (Background)
   - Celery worker
   - Async ML processing

6. **Prometheus** (Port 9090)
   - Metrics collection

7. **Grafana** (Port 3000)
   - Dashboards and visualization

---

## Manual Installation

If you prefer manual setup:

### Prerequisites
- Docker Desktop installed and running
- 10GB+ free disk space
- Git

### Step-by-Step

```bash
# 1. Clone repository
git clone https://github.com/HingeCraftGlobal/hingecraft-global.git
cd hingecraft-global/cloud-portal

# 2. Create environment file
cat > .env << EOL
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
GRAFANA_PASSWORD=$(openssl rand -base64 16)
EOL

# 3. Build services
docker-compose -f docker-compose.cloud.yml build

# 4. Start services
docker-compose -f docker-compose.cloud.yml up -d

# 5. Wait for database (30 seconds)
sleep 30

# 6. Initialize database schema
docker exec -i cloud_db psql -U admin -d cloud_db < database/schema.sql

# 7. Verify installation
docker-compose -f docker-compose.cloud.yml ps
curl http://localhost:8080/health
```

---

## Verify Installation

```bash
# Check all services are running
docker-compose -f docker-compose.cloud.yml ps

# Test API Gateway
curl http://localhost:8080/health

# Test ML Brain (wait 2-5 minutes for models to load)
curl http://localhost:8000/health

# Check database
docker exec cloud_db psql -U admin -d cloud_db -c "SELECT COUNT(*) FROM companies;"

# Check Redis
docker exec cloud_redis redis-cli ping
```

---

## Create Your First Account

```bash
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "SecurePassword123!"
  }'
```

---

## Access Services

- **API Gateway**: http://localhost:8080
- **ML Brain**: http://localhost:8000
- **Grafana**: http://localhost:3000 (admin/password from .env)
- **Prometheus**: http://localhost:9090

---

## Troubleshooting

### Services won't start
```bash
# Check Docker is running
docker info

# Check logs
docker-compose -f docker-compose.cloud.yml logs

# Restart services
docker-compose -f docker-compose.cloud.yml restart
```

### Database connection errors
```bash
# Wait longer for database
sleep 60

# Check database logs
docker logs cloud_db

# Verify database is ready
docker exec cloud_db pg_isready -U admin -d cloud_db
```

### ML Brain not loading
```bash
# Check ML Brain logs (models download takes time)
docker logs cloud_ml_brain -f

# Wait up to 5 minutes for first-time model download
```

---

## Stopping Services

```bash
# Stop all services
docker-compose -f docker-compose.cloud.yml down

# Stop and remove volumes (WARNING: deletes data)
docker-compose -f docker-compose.cloud.yml down -v
```

---

## Next Steps

- See `README.md` for API documentation
- See `NEXT_STEPS.md` for usage guide
- See `PRODUCTION_CONFIG.md` for production deployment

---

**🎉 Installation complete!**

