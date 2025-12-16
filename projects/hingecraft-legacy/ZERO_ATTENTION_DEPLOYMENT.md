# Zero-Attention Docker Deployment for HingeCraft

## Overview

This deployment is configured for **zero-attention operation** - services automatically restart on failure, recover from crashes, and require no manual intervention.

## Key Features

✅ **Auto-restart**: All services use `restart: always`  
✅ **Health checks**: Services wait for dependencies to be healthy  
✅ **Pre-built images**: Uses images from Docker Hub (no local builds)  
✅ **Persistent data**: Database data survives container restarts  
✅ **Network isolation**: Services communicate via internal network  

## Quick Start

### 1. Start Services

```bash
cd [PROJECT_ROOT]/HingeCraft
docker compose up -d
```

### 2. Verify Services

```bash
# Check status
docker compose ps

# View logs
docker compose logs -f

# Health checks
curl http://localhost:3000/health  # Database Adaptor
curl http://localhost:8000/api/v1/health  # Python Server
```

## Service Configuration

### PostgreSQL Database
- **Port**: 5432
- **Database**: `hingecraft_db`
- **User**: `hingecraft_user`
- **Password**: From `.env` file (`DB_PASSWORD`)
- **Restart**: Always
- **Health Check**: Every 10 seconds

### Database Adaptor (Node.js/Express)
- **Port**: 3000
- **Image**: `departmentsai/wix-db-adaptor:latest`
- **Restart**: Always
- **Depends on**: PostgreSQL (waits for health check)
- **Endpoints**:
  - `GET /health` - Health check
  - `GET /export/json` - Export database
  - `POST /webhook` - Webhook endpoint for Wix

### Python Server (FastAPI)
- **Port**: 8000
- **Image**: `departmentsai/wix-python-server:latest`
- **Restart**: Always
- **Depends on**: PostgreSQL (waits for health check)
- **Endpoints**:
  - `GET /api/v1/health` - Health check
  - `GET /export/json` - Export database

## Zero-Attention Features

### Automatic Recovery

Services automatically restart if they:
- Crash or exit unexpectedly
- Are stopped manually (unless explicitly stopped)
- Encounter errors

### Startup Order

1. PostgreSQL starts first
2. Health check confirms PostgreSQL is ready
3. Database Adaptor starts (waits for PostgreSQL)
4. Python Server starts (waits for PostgreSQL)

### Data Persistence

- Database data stored in Docker volume: `hingecraft_postgres_data`
- Data survives container restarts, updates, and rebuilds
- Logs stored in `./database-adaptor/logs` and `./python-server/logs`

## Wix Integration

### External Database Connection

1. **Wix Secrets Manager**:
   - Add secret: `DB_API_ENDPOINT` = `http://your-server:3000`
   - Add secret: `DB_API_SECRET` = (from `.env` `ADAPTOR_SECRET_KEY`)

2. **Wix External Database**:
   - Connection URL: `http://your-server:3000`
   - Authentication: Use secret from Secrets Manager

3. **Payment Page Integration**:
   - Add `payment-page-integration.js` to Wix payment page
   - Configure `CONFIG` object with your endpoint and secrets

### Webhook Configuration

- **Webhook URL**: Configured in `.env` (`WEBHOOK_URL`)
- **Webhook Secret**: Configured in `.env` (`WEBHOOK_SECRET`)
- **Endpoint**: `POST /webhook` on Database Adaptor (port 3000)

## Maintenance Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f db-adaptor
docker compose logs -f python-server
docker compose logs -f postgres
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart db-adaptor
```

### Update Services

```bash
# Pull latest images
docker compose pull

# Restart with new images
docker compose up -d
```

### Stop Services

```bash
# Stop (containers remain, can restart)
docker compose stop

# Stop and remove containers (data preserved)
docker compose down

# Stop and remove everything including volumes (⚠️ deletes data)
docker compose down -v
```

## Troubleshooting

### Services Not Starting

1. **Check Docker Desktop**: Ensure Docker Desktop is running
2. **Check logs**: `docker compose logs`
3. **Check ports**: Ensure ports 3000, 8000, 5432 are not in use
4. **Check .env**: Verify all required environment variables are set

### Database Connection Issues

1. **Wait for PostgreSQL**: Services wait for PostgreSQL health check
2. **Check network**: `docker network ls` - verify `hingecraft_hingecraft-network` exists
3. **Check credentials**: Verify `DB_PASSWORD` in `.env` matches PostgreSQL config

### I/O Errors

If you see Docker I/O errors:
1. Restart Docker Desktop
2. Free up disk space
3. Run: `docker system prune -a` (⚠️ removes unused images)

## Monitoring

### Service Status

```bash
docker compose ps
```

Expected output:
```
NAME                        STATUS              PORTS
hingecraft-db-adaptor       Up (healthy)        0.0.0.0:3000->3000/tcp
hingecraft-postgres         Up (healthy)        0.0.0.0:5432->5432/tcp
hingecraft-python-server    Up                  0.0.0.0:8000->8000/tcp
```

### Health Checks

```bash
# Database Adaptor
curl http://localhost:3000/health

# Python Server
curl http://localhost:8000/api/v1/health

# Database (from inside container)
docker compose exec postgres pg_isready -U hingecraft_user
```

## Production Deployment

For production, ensure:

1. **Environment Variables**: All secrets in `.env` are secure
2. **Network Security**: Expose only necessary ports
3. **Backup Strategy**: Regular database backups
4. **Monitoring**: Set up monitoring/alerting for service health
5. **SSL/TLS**: Use reverse proxy (nginx/traefik) for HTTPS

## Auto-Start on System Boot

### macOS (Docker Desktop)

1. Docker Desktop → Settings → General
2. Enable "Start Docker Desktop when you log in"
3. Services will auto-start when Docker Desktop starts

### Linux (systemd)

Create `/etc/systemd/system/hingecraft.service`:

```ini
[Unit]
Description=HingeCraft Docker Services
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/HingeCraft
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable hingecraft
sudo systemctl start hingecraft
```

---

**Status**: ✅ Configured for zero-attention operation  
**Last Updated**: 2025-11-29


