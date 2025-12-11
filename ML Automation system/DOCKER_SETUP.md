# 🐳 Docker Setup - Visual Pipeline Tracker

**Date**: January 27, 2025  
**Status**: ✅ **DOCKER READY - DRY RUN MODE ENABLED**

---

## 🚀 Quick Start

### Start Everything with Docker

```bash
# Start all services (automation, database, redis, dashboard)
docker-compose up -d

# View logs in real-time
docker-compose logs -f automation

# Stop everything
docker-compose down
```

### Access Dashboard

Once running, open your browser:
- **Visual Dashboard**: http://localhost:8080
- **API Endpoint**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

---

## 📊 What's Included

### Services:

1. **automation** - Main automation system (port 3001)
2. **postgres** - PostgreSQL database (port 5432)
3. **redis** - Redis for queues (port 6379)
4. **dashboard** - Visual tracker dashboard (port 8080)

---

## ⚙️ Configuration

### Dry Run Mode (Default: ON)

The system is configured to run in **DRY RUN MODE** by default:
- ✅ Processes entire pipeline
- ✅ Validates all emails
- ✅ Syncs to HubSpot
- ✅ Tracks everything
- ❌ **Does NOT send actual emails**

### Enable/Disable Dry Run

Edit `docker-compose.yml`:

```yaml
environment:
  - DRY_RUN=true   # Set to false to actually send emails
```

Or set environment variable:
```bash
DRY_RUN=false docker-compose up
```

---

## 📈 Visual Dashboard Features

The dashboard shows:

1. **Real-time Status** - Current pipeline state
2. **Pipeline Stages** - All 9 stages with progress
3. **Live Logs** - Real-time event logging
4. **Statistics** - Leads, emails, HubSpot sync counts
5. **Dry Run Indicator** - Shows when in test mode

---

## 🔍 Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Just automation
docker-compose logs -f automation

# Just database
docker-compose logs -f postgres
```

### Check Status

```bash
# Check all containers
docker-compose ps

# Check health
curl http://localhost:3001/health

# Check pipeline status
curl http://localhost:3001/api/pipeline/status
```

---

## 🎯 Testing Flow

1. **Start Docker**: `docker-compose up -d`
2. **Open Dashboard**: http://localhost:8080
3. **Drop File** in Google Drive folder
4. **Watch Pipeline** in real-time on dashboard
5. **See Complete Flow** from file to email validation

---

## ✅ What Gets Tracked

- ✅ File detection
- ✅ File processing
- ✅ Lead processing
- ✅ Email collection
- ✅ Database integration
- ✅ HubSpot sync
- ✅ Sequence initialization
- ✅ Email validation (DRY RUN - not sent)
- ✅ Event tracking

---

## 🛠️ Troubleshooting

### Database Connection Issues

```bash
# Check postgres is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Dashboard Not Loading

```bash
# Check dashboard container
docker-compose ps dashboard

# Check nginx logs
docker-compose logs dashboard

# Restart dashboard
docker-compose restart dashboard
```

---

## 📝 Environment Variables

Key environment variables in `docker-compose.yml`:

- `DRY_RUN=true` - Enable dry run mode
- `DB_HOST=postgres` - Database host
- `REDIS_HOST=redis` - Redis host
- `PORT=3001` - API port

---

**Status**: ✅ **DOCKER READY**  
**Dry Run**: ✅ **ENABLED**  
**Dashboard**: ✅ **AVAILABLE**  
**Ready**: ✅ **YES - DROP FILE TO START**
