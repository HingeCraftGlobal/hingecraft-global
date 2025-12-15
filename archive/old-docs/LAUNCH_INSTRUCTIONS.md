# Complete Launch Instructions - Step by Step

## Quick Start

### 1. Start Docker Desktop
```bash
# macOS
open -a Docker

# Wait for Docker to fully start (check menu bar icon)
```

### 2. Verify Docker
```bash
./CHECK_DOCKER.sh
```

### 3. Launch Everything
```bash
# Option A: Master Launch (Recommended)
./MASTER_LAUNCH.sh

# Option B: Detailed Breakdown
./LAUNCH_BREAKDOWN.sh

# Option C: Standard Launch
./LAUNCH_ALL.sh

# Option D: Direct Docker Compose
docker compose up -d
```

## Detailed Breakdown

### Phase 1: Prerequisites ✅
- [x] Docker installed
- [x] Docker Compose available
- [x] .env file created
- [x] docker-compose.yml configured
- [x] Database schema files ready (11 files)
- [x] Agent files ready (116 files)

### Phase 2: Docker Services
Services will be started in this order:

1. **PostgreSQL** (port 5432)
   - Database: hingecraft
   - User: hcuser
   - Password: hcpass

2. **Redis** (port 6379)
   - Queue and caching

3. **MinIO** (ports 9000, 9001)
   - Object storage
   - Access: minio/minio123

4. **FastAPI** (port 8000)
   - REST API backend
   - Health: http://localhost:8000/health
   - Docs: http://localhost:8000/docs

5. **Celery Worker**
   - Background task processing

6. **Celery Scheduler**
   - Scheduled tasks

7. **pgAdmin** (port 5050)
   - Database admin UI
   - Email: admin@hingecraft.ai
   - Password: admin123

8. **ngrok** (port 4040, optional)
   - Wix development tunnel
   - Requires NGROK_TOKEN in .env

### Phase 3: Database Schema Application
- Master schema (10 layers)
- RAG knowledge base
- Governance rules
- Security modules

### Phase 4: Agent Verification
- Legal Agent (31 files)
- Marketing Agent (26 files)
- Engineering Agent (20 files)
- Education Agent (20 files)
- Community Agent (19 files)
- Crypto Agent (needs creation)

### Phase 5: Service Verification
- Health checks
- API endpoints
- Database connectivity
- Service status

## Verification Commands

### Check Docker Status
```bash
docker info
docker compose ps
```

### Check Service Health
```bash
# FastAPI
curl http://localhost:8000/health

# PostgreSQL
docker compose exec postgres pg_isready -U hcuser

# Redis
docker compose exec redis redis-cli ping
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f fastapi
docker compose logs -f postgres
docker compose logs -f worker
```

### Database Access
```bash
# Connect to database
docker compose exec postgres psql -U hcuser -d hingecraft

# List tables
docker compose exec postgres psql -U hcuser -d hingecraft -c "\dt"

# Check schema
docker compose exec postgres psql -U hcuser -d hingecraft -c "\dn"
```

## Troubleshooting

### Docker Daemon Not Running
**Error**: `Cannot connect to the Docker daemon`

**Solution**:
1. Start Docker Desktop: `open -a Docker`
2. Wait for Docker to fully start
3. Verify: `docker info`

### Port Already in Use
**Error**: `port is already allocated`

**Solution**:
1. Find process: `lsof -i :8000` (or other port)
2. Stop process or change port in docker-compose.yml
3. Restart: `docker compose down && docker compose up -d`

### Database Connection Failed
**Error**: `connection refused` or `database does not exist`

**Solution**:
1. Wait for PostgreSQL to start: `docker compose logs postgres`
2. Check health: `docker compose exec postgres pg_isready -U hcuser`
3. Apply schema: `./scripts/APPLY_MASTER_SCHEMA.sh`

### FastAPI Not Starting
**Error**: `fastapi container exits`

**Solution**:
1. Check logs: `docker compose logs fastapi`
2. Verify .env file exists
3. Check dependencies: `docker compose exec fastapi pip list`
4. Rebuild: `docker compose build fastapi`

### Missing .env File
**Error**: `env file .env not found`

**Solution**:
1. Create .env file (already done)
2. Verify: `cat .env`
3. Restart: `docker compose restart fastapi`

## Post-Launch Tasks

### 1. Apply Database Schema
```bash
./scripts/APPLY_MASTER_SCHEMA.sh
```

### 2. Test Login System
```bash
./scripts/TEST_LOGIN_SYSTEM.sh
```

### 3. Run Comprehensive Tests
```bash
./scripts/FULL_SYSTEM_TEST_COMPREHENSIVE.sh
```

### 4. Start Wix Development
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 wix dev
```

## Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| FastAPI | http://localhost:8000 | N/A |
| API Docs | http://localhost:8000/docs | N/A |
| pgAdmin | http://localhost:5050 | admin@hingecraft.ai / admin123 |
| MinIO | http://localhost:9001 | minio / minio123 |
| ngrok | http://localhost:4040 | N/A |

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `MASTER_LAUNCH.sh` | Complete launch with pre-checks |
| `CHECK_DOCKER.sh` | Verify Docker is running |
| `LAUNCH_BREAKDOWN.sh` | Detailed step-by-step launch |
| `LAUNCH_ALL.sh` | Standard complete launch |
| `LAUNCH_01_DATABASE.sh` | Database launch only |
| `LAUNCH_02_AGENTS.sh` | Agents verification only |
| `LAUNCH_03_SERVICES.sh` | Services launch only |
| `LAUNCH_04_EXPANSION.sh` | Expansion verification only |

## Status Summary

✅ **Ready to Launch**
- All prerequisites met
- All scripts created
- All configurations in place
- Docker services configured

⏳ **Waiting For**
- Docker Desktop to be started
- User to run launch script

🚀 **Next Action**
```bash
./MASTER_LAUNCH.sh
```




