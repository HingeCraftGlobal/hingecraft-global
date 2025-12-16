# Docker Volumes - All Data in Docker

## Overview

**All data is now stored in Docker volumes** - nothing is stored on your host filesystem. This ensures:
- ✅ Complete data isolation
- ✅ Easy backup and migration
- ✅ Zero host filesystem dependencies
- ✅ Data persists across container restarts

## Volumes Created

### 1. `hingecraft_postgres_data`
- **Purpose**: PostgreSQL database data
- **Location**: `/var/lib/postgresql/data` in container
- **Contains**: All database tables, data, indexes
- **Persistence**: Survives container restarts, updates, and rebuilds

### 2. `hingecraft_database_init`
- **Purpose**: Database initialization scripts
- **Location**: `/docker-entrypoint-initdb.d` in container
- **Contains**: `init.sql` (schema creation script)
- **Usage**: Automatically executed on first database start

### 3. `hingecraft_db_adaptor_logs`
- **Purpose**: Database Adaptor API logs
- **Location**: `/app/logs` in container
- **Contains**: Application logs, error logs, access logs

### 4. `hingecraft_python_server_logs`
- **Purpose**: Python FastAPI server logs
- **Location**: `/app/logs` in container
- **Contains**: Application logs, error logs, API logs

## Volume Management

### View All Volumes

```bash
export PATH="/usr/local/bin:$PATH"
docker volume ls | grep hingecraft
```

### Inspect a Volume

```bash
# View volume details
docker volume inspect hingecraft_postgres_data

# View volume location on host (macOS)
docker volume inspect hingecraft_postgres_data | grep Mountpoint
```

### Backup a Volume

```bash
# Backup PostgreSQL data
docker run --rm \
  -v hingecraft_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup-$(date +%Y%m%d).tar.gz -C /data .

# Backup logs
docker run --rm \
  -v hingecraft_db_adaptor_logs:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/db-adaptor-logs-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore a Volume

```bash
# Stop services first
docker compose down

# Restore PostgreSQL data
docker run --rm \
  -v hingecraft_postgres_data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/postgres-backup-YYYYMMDD.tar.gz"

# Start services
docker compose up -d
```

### Remove All Volumes (⚠️ Deletes All Data)

```bash
# Stop and remove containers
docker compose down

# Remove volumes
docker volume rm hingecraft_postgres_data \
  hingecraft_database_init \
  hingecraft_db_adaptor_logs \
  hingecraft_python_server_logs
```

## Volume Setup

The `setup-volumes.sh` script automatically:
1. Creates all required volumes
2. Copies `init.sql` into the `database_init` volume
3. Ensures proper permissions

Run it manually if needed:
```bash
./setup-volumes.sh
```

## Data Location on Host

On macOS, Docker volumes are stored at:
```
~/Library/Containers/com.docker.docker/Data/vms/0/data/docker/volumes/
```

**You should never access this directly** - use Docker commands instead.

## Benefits of Docker Volumes

1. **Isolation**: Data is completely isolated from host filesystem
2. **Portability**: Easy to move between machines
3. **Backup**: Simple backup/restore process
4. **Performance**: Optimized for Docker workloads
5. **Security**: Data is managed by Docker, not exposed on host

## Accessing Data

### View Database Data

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U hingecraft_user -d hingecraft_db

# Query donations table
SELECT * FROM donations ORDER BY created_at DESC LIMIT 10;
```

### View Logs

```bash
# View Database Adaptor logs
docker compose exec db-adaptor ls -la /app/logs
docker compose exec db-adaptor cat /app/logs/app.log

# View Python Server logs
docker compose exec python-server ls -la /app/logs
docker compose exec python-server cat /app/logs/app.log
```

### Export Database

```bash
# Export to JSON (via API)
curl http://localhost:3000/export/json > donations-backup.json

# Export SQL dump
docker compose exec postgres pg_dump -U hingecraft_user hingecraft_db > backup.sql
```

## Initialization

The `init.sql` script is automatically copied into the `database_init` volume on first setup. It contains:
- Database schema (donations table)
- Indexes for performance
- Triggers for auto-updating timestamps

This script runs automatically when PostgreSQL starts for the first time.

## Troubleshooting

### Volume Not Found

If you see volume errors:
```bash
./setup-volumes.sh
docker compose up -d
```

### Data Not Persisting

Check volume is mounted:
```bash
docker compose exec postgres ls -la /var/lib/postgresql/data
```

### Out of Space

Check volume sizes:
```bash
docker system df -v
```

Clean up unused volumes:
```bash
docker volume prune
```

---

**All data is now safely stored in Docker volumes!** 🎉


