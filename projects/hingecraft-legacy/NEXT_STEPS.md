# Next Steps - After Running start.sh

## If Services Are Starting

The `start.sh` script may take 30-60 seconds to fully start all services. Here's what to do:

### 1. Check Status

```bash
./check-status.sh
```

Or manually:
```bash
export PATH="/usr/local/bin:$PATH"
docker compose ps
```

### 2. View Logs (if services aren't starting)

```bash
export PATH="/usr/local/bin:$PATH"
docker compose logs -f
```

Press `Ctrl+C` to exit logs view.

### 3. Test Endpoints

Once services are running:

```bash
# Database Adaptor
curl http://localhost:3000/health

# Python Server  
curl http://localhost:8000/api/v1/health
```

## Common Issues

### Services Show "Starting" or "Restarting"

This is normal - services need time to:
1. Pull images (first time only)
2. Start PostgreSQL
3. Wait for PostgreSQL health check
4. Start Database Adaptor
5. Start Python Server

**Wait 1-2 minutes**, then check again:
```bash
./check-status.sh
```

### "Cannot connect to Docker daemon"

Docker Desktop might not be running:
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in menu bar)
3. Run `./start.sh` again

### Port Already in Use

If you see port errors:
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :8000
lsof -i :5432

# Stop existing containers
export PATH="/usr/local/bin:$PATH"
docker compose down
```

### Images Not Found

If images aren't pulling:
```bash
export PATH="/usr/local/bin:$PATH"
docker compose pull
docker compose up -d
```

## Expected Output

When everything is working, you should see:

```
NAME                        STATUS              PORTS
hingecraft-db-adaptor       Up                  0.0.0.0:3000->3000/tcp
hingecraft-postgres         Up (healthy)        0.0.0.0:5432->5432/tcp
hingecraft-python-server    Up                  0.0.0.0:8000->8000/tcp
```

And health checks should return:
```json
{"status":"ok","service":"database-adaptor"}
{"status":"ok","service":"python-server"}
```

## Quick Commands Reference

```bash
# Start services
./start.sh

# Check status
./check-status.sh

# View logs
export PATH="/usr/local/bin:$PATH"
docker compose logs -f

# Stop services
export PATH="/usr/local/bin:$PATH"
docker compose down

# Restart services
export PATH="/usr/local/bin:$PATH"
docker compose restart
```

---

**If services are still not starting after 2 minutes, check the logs for errors.**


