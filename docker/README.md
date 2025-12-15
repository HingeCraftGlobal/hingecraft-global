# HingeCraft Global - Docker Configuration

This directory contains Docker configuration files for HingeCraft Global.

## 📁 Docker Files Location

All Docker files are located in the following locations:

### Root Level
- `Dockerfile` - Main application Dockerfile
- `docker-compose.yml` - Main docker-compose configuration

### ML Automation
- `ml-automation/Dockerfile` - ML automation service Dockerfile
- `ml-automation/docker-compose.yml` - ML automation docker-compose

### API
- `api/Dockerfile` - API service Dockerfile

## 🚀 Quick Start

### Start All Services
```bash
docker-compose up -d
```

### Start Database Only
```bash
docker-compose up -d postgres
```

### Start ML Automation
```bash
cd ml-automation
docker-compose up -d
```

## 📦 Services

### Main Services (docker-compose.yml)
- **postgres** - PostgreSQL database
- **api** - API service
- **ml-automation** - ML automation service

### ML Automation Services (ml-automation/docker-compose.yml)
- **ml-automation** - ML automation service
- **postgres** - ML automation database

## 🔧 Configuration

All Docker files are tracked in git:
- **5 Docker files** tracked
- All services configured
- Database volumes configured
- Environment variables configured

## 📝 Notes

- Database data is stored in Docker volumes
- See `database/README.md` for database setup
- Environment variables in `.env` files (not in git)

---

**Last Updated:** December 15, 2024  
**Status:** ✅ All Docker files organized and tracked
