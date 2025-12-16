# HingeCraft Python Server Pipeline

Modular Python server built with FastAPI for HingeCraft donations and membership management.

## Architecture

```
python-server/
├── main.py                 # FastAPI app entry point
├── config.py              # Configuration management
├── database.py            # Database connection pool
├── api/                   # API routes
│   ├── __init__.py
│   ├── health.py          # Health check endpoints
│   └── donations.py       # Donation endpoints
├── middleware/            # Middleware
│   └── auth.py           # Authentication
└── services/              # Business logic
    ├── donation_service.py
    └── health_service.py
```

## Features

- ✅ Modular architecture with clear separation of concerns
- ✅ FastAPI with async/await support
- ✅ PostgreSQL database integration (asyncpg)
- ✅ API key authentication
- ✅ Health check endpoints
- ✅ CORS support
- ✅ Docker-ready

## Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=hingecraft_db
export DB_USER=hingecraft_user
export DB_PASSWORD=your_password
export SECRET_KEY=your_secret_key

# Run server
python main.py
```

### Docker

```bash
# From project root
docker-compose up python-server

# Or build and run
cd python-server
docker build -t hingecraft-python-server .
docker run -p 8000:8000 hingecraft-python-server
```

## API Endpoints

### Health (No Auth Required)
- `GET /api/v1/health` - Health check
- `GET /api/v1/health/ready` - Readiness check
- `GET /api/v1/health/live` - Liveness check

### Donations (Auth Required)
- `GET /api/v1/donations/latest` - Get latest donation
- `POST /api/v1/donations` - Create donation
- `GET /api/v1/donations` - List donations (with pagination)
- `GET /api/v1/donations/{id}` - Get donation by ID
- `PATCH /api/v1/donations/{id}` - Update donation

## Authentication

All donation endpoints require authentication via:
- `Authorization: Bearer {API_KEY}` header, or
- `X-API-Key: {API_KEY}` header

Set `API_KEY` in environment variables.

## Environment Variables

```env
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hingecraft_db
DB_USER=hingecraft_user
DB_PASSWORD=your_password

# Security
SECRET_KEY=your_secret_key
API_KEY=your_api_key

# CORS
CORS_ORIGINS=*
```

## Testing

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Get latest donation (with auth)
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:8000/api/v1/donations/latest

# Create donation
curl -X POST http://localhost:8000/api/v1/donations \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"amount": 50.00, "is_other_amount": true}'
```

## Development

The server uses a modular architecture:
- **API Layer**: FastAPI routes and request/response models
- **Service Layer**: Business logic and data operations
- **Database Layer**: Connection pool and query execution
- **Middleware**: Authentication and request processing

## Production

For production deployment:
1. Set `DEBUG=false`
2. Use strong `SECRET_KEY` and `API_KEY`
3. Configure proper `CORS_ORIGINS`
4. Use managed PostgreSQL database
5. Deploy with Docker or cloud platform



