# Custom Database Adaptor - Yes, We Built One!

## ✅ Yes, There IS a Custom Adaptor

We built a **custom database adaptor** specifically for HingeCraft to connect Wix to PostgreSQL.

---

## 📁 Custom Adaptor Location

**Directory**: `/Users/chandlerfergusen/Desktop/CURSOR/HingeCraft/database-adaptor/`

**Files**:
- `server.js` - Main Express.js API server (354 lines)
- `package.json` - Node.js dependencies
- `Dockerfile` - Docker configuration
- `README.md` - Documentation

---

## 🔧 What the Custom Adaptor Does

### Purpose
The custom adaptor is an **Express.js REST API** that:
- Connects Wix External Database to PostgreSQL
- Provides RESTful endpoints for donation operations
- Handles authentication via secret key
- Runs in Docker for easy deployment

### Key Features
- ✅ RESTful API for donations
- ✅ PostgreSQL database integration
- ✅ Authentication via Bearer token or API key
- ✅ Health check endpoint
- ✅ Error handling
- ✅ Auto-updating timestamps
- ✅ Docker-ready

---

## 🌐 API Endpoints (Custom Built)

### Health Check (No Auth)
```
GET /health
```

### Donation Operations (Auth Required)
```
GET /donations/latest          - Get latest donation
POST /donations                - Create new donation
GET /donations                 - List all donations
GET /donations/:id             - Get donation by ID
PATCH /donations/:id           - Update donation
```

### Export/Share
```
GET /export/json               - Export database as JSON
POST /webhook                  - Webhook endpoint for Wix
```

---

## 🐳 Docker Deployment

### Docker Image
- **Image Name**: `departmentsai/wix-db-adaptor:latest`
- **Docker Hub**: https://hub.docker.com/r/departmentsai/wix-db-adaptor
- **Port**: 3000
- **Status**: ✅ Built and pushed to Docker Hub

### Docker Compose
The adaptor runs as a service in `docker-compose.yml`:
```yaml
db-adaptor:
  image: departmentsai/wix-db-adaptor:latest
  container_name: hingecraft-db-adaptor
  ports:
    - "3000:3000"
```

---

## 🔐 Authentication

The custom adaptor uses **secret key authentication**:
- Header: `Authorization: Bearer {SECRET_KEY}`
- OR Header: `X-API-Key: {SECRET_KEY}`

**Current Secret Key**: `04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b`

---

## 📊 Database Schema

The adaptor connects to PostgreSQL with this schema:
- **Database**: `hingecraft_db`
- **Table**: `donations`
- **Fields**: id, amount, currency, is_other_amount, source, payment_status, etc.

---

## 🎯 Why Custom Adaptor?

Wix requires a **custom database adaptor** for External Database connections. The adaptor must:
1. ✅ Provide RESTful API endpoints
2. ✅ Handle authentication
3. ✅ Connect to your database (PostgreSQL)
4. ✅ Return data in expected format
5. ✅ Be accessible via HTTPS (for production)

**Our custom adaptor meets all these requirements!**

---

## 🚀 How It Works

```
Wix Website
    ↓
External Database Connection (Custom)
    ↓
Custom Database Adaptor API (http://localhost:3000)
    ↓
PostgreSQL Database (localhost:5432)
```

---

## ✅ Summary

**Yes, we built a custom database adaptor!**

- **Type**: Express.js REST API
- **Location**: `database-adaptor/server.js`
- **Deployed**: Docker Hub as `departmentsai/wix-db-adaptor:latest`
- **Port**: 3000
- **Status**: ✅ Built, tested, and ready to use

This is the **custom adaptor** that Wix connects to for the External Database feature!

---

**Last Updated**: 2025-11-29














