# Python Server Pipeline - Complete Guide

## Overview

The HingeCraft project now includes a **modular Python server pipeline** built with FastAPI, providing an alternative to the Node.js database adaptor.

## Architecture

### Modular Design

```
python-server/
├── main.py                    # FastAPI application entry point
├── config.py                  # Configuration management (Pydantic)
├── database.py                # Async PostgreSQL connection pool
├── api/                       # API routes module
│   ├── __init__.py           # Router aggregation
│   ├── health.py             # Health check endpoints
│   └── donations.py          # Donation CRUD endpoints
├── middleware/                # Request middleware
│   └── auth.py               # API key authentication
└── services/                  # Business logic layer
    ├── donation_service.py   # Donation operations
    └── health_service.py     # Health monitoring
```

### Key Features

- ✅ **FastAPI**: Modern, fast async web framework
- ✅ **Async PostgreSQL**: Using asyncpg for high performance
- ✅ **Modular Architecture**: Clear separation of concerns
- ✅ **Type Safety**: Pydantic models for validation
- ✅ **Authentication**: API key middleware
- ✅ **Health Checks**: Ready/live/health endpoints
- ✅ **Docker Ready**: Containerized deployment

## Running the Server

### Option 1: Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL + Node.js API + Python Server)
docker-compose up -d

# View Python server logs
docker-compose logs -f python-server

# Access Python server
curl http://localhost:8000/api/v1/health
```

### Option 2: Local Development

```bash
cd python-server

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=hingecraft_db
export DB_USER=hingecraft_user
export DB_PASSWORD=your_password
export API_KEY=your_secret_key

# Run server
python main.py

# Or with uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### Health Endpoints (No Auth)

```bash
# Health check
GET /api/v1/health
# Response: {"status": "healthy", "database": "connected", "timestamp": "..."}

# Readiness check
GET /api/v1/health/ready

# Liveness check
GET /api/v1/health/live
```

### Donation Endpoints (Auth Required)

```bash
# Get latest donation
GET /api/v1/donations/latest
Headers: Authorization: Bearer {API_KEY}

# Create donation
POST /api/v1/donations
Headers: Authorization: Bearer {API_KEY}
Body: {
  "amount": 50.00,
  "is_other_amount": true,
  "source": "payment_page"
}

# List donations (with pagination)
GET /api/v1/donations?limit=100&offset=0
Headers: Authorization: Bearer {API_KEY}

# Get donation by ID
GET /api/v1/donations/{id}
Headers: Authorization: Bearer {API_KEY}

# Update donation
PATCH /api/v1/donations/{id}
Headers: Authorization: Bearer {API_KEY}
Body: {
  "payment_status": "completed",
  "member_email": "user@example.com"
}
```

## Authentication

The Python server uses API key authentication:

1. **Authorization Header** (preferred):
   ```
   Authorization: Bearer {API_KEY}
   ```

2. **X-API-Key Header** (alternative):
   ```
   X-API-Key: {API_KEY}
   ```

Set `API_KEY` environment variable to match your secret key.

## Configuration

### Environment Variables

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=hingecraft_db
DB_USER=hingecraft_user
DB_PASSWORD=your_secure_password

# Security
SECRET_KEY=your_secret_key
API_KEY=your_api_key

# CORS
CORS_ORIGINS=*
```

### Docker Compose Integration

The Python server is automatically configured in `docker-compose.yml`:

- **Port**: `8000`
- **Database**: Connects to shared PostgreSQL
- **Network**: `hingecraft-network`
- **Depends on**: PostgreSQL health check

## Comparison: Node.js vs Python Server

| Feature | Node.js API | Python Server |
|---------|-------------|---------------|
| **Port** | 3000 | 8000 |
| **Framework** | Express.js | FastAPI |
| **Database** | pg (sync) | asyncpg (async) |
| **Performance** | Good | Excellent (async) |
| **Type Safety** | JavaScript | Pydantic models |
| **API Style** | REST | REST + OpenAPI docs |

Both servers:
- ✅ Use the same PostgreSQL database
- ✅ Provide identical API endpoints
- ✅ Support the same authentication
- ✅ Can run simultaneously

## Testing

### Health Check
```bash
curl http://localhost:8000/api/v1/health
```

### Create Donation
```bash
curl -X POST http://localhost:8000/api/v1/donations \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 50.00,
       "is_other_amount": true,
       "source": "payment_page"
     }'
```

### Get Latest Donation
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:8000/api/v1/donations/latest
```

## Production Deployment

### Option 1: Docker Compose
```bash
docker-compose up -d python-server
```

### Option 2: Standalone Docker
```bash
cd python-server
docker build -t hingecraft-python-server .
docker run -p 8000:8000 \
  -e DB_HOST=your_db_host \
  -e DB_PASSWORD=your_password \
  -e API_KEY=your_key \
  hingecraft-python-server
```

### Option 3: Cloud Platform
- Deploy to Railway, Render, or Fly.io
- Use managed PostgreSQL
- Set environment variables
- Auto-deploy from GitHub

## Integration with Wix

The Python server can be used as an alternative to the Node.js adaptor:

1. **Update Wix Configuration**:
   - Endpoint URL: `https://your-python-server-url.com`
   - Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b

2. **Update `velo-backend-api.js`**:
   ```javascript
   const EXTERNAL_DB_ENDPOINT = 'https://your-python-server-url.com';
   const EXTERNAL_DB_SECRET_KEY = 'your_api_key';
   ```

## Development Workflow

1. **Make changes** to Python server code
2. **Rebuild Docker image**:
   ```bash
   docker-compose build python-server
   docker-compose up -d python-server
   ```
3. **Test endpoints** with curl or Postman
4. **View logs**:
   ```bash
   docker-compose logs -f python-server
   ```

## Next Steps

- ✅ Python server implemented
- ✅ Docker integration complete
- ✅ API endpoints functional
- ⬜ Add unit tests
- ⬜ Add API documentation (Swagger/OpenAPI)
- ⬜ Performance optimization
- ⬜ Production deployment

---

**Status**: ✅ Operational and ready for use!



