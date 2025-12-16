# HingeCraft Global - Backend Contribution

Complete backend system for HingeCraft Global membership and donation management, featuring both Node.js and Python server implementations.

## 🚀 Quick Start

### Docker Setup (Recommended)

```bash
# Clone repository
git clone https://github.com/departments-commits/website-path-for-backend-contribution.git
cd website-path-for-backend-contribution

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start all services
docker-compose up -d

# Verify services
curl http://localhost:3000/health  # Node.js API
curl http://localhost:8000/api/v1/health  # Python Server
```

## 📋 What's Included

### Backend Services

1. **Node.js Database Adaptor** (Port 3000)
   - Express.js REST API
   - PostgreSQL integration
   - Wix external database adaptor

2. **Python Server Pipeline** (Port 8000)
   - FastAPI async server
   - Modular architecture
   - High-performance async PostgreSQL

3. **PostgreSQL Database** (Port 5432)
   - Shared database for both services
   - Auto-initialized schema
   - Persistent data storage

### Frontend Integration

- **Charter Page** (`charter-page.html`) - Membership tier selection
- **Payment Integration** (`payment-page-integration.js`) - Donation capture
- **Wix Backend API** (`velo-backend-api.js`) - Wix Velo integration

## 🏗️ Architecture

```
┌─────────────────┐
│   Wix Frontend  │
│  (Charter Page) │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
    ┌────▼────┐      ┌─────▼─────┐
    │ Node.js │      │  Python   │
    │   API   │      │  Server   │
    │  :3000  │      │   :8000   │
    └────┬────┘      └─────┬─────┘
         │                 │
         └────────┬─────────┘
                  │
         ┌────────▼────────┐
         │   PostgreSQL    │
         │   Database      │
         │     :5432       │
         └─────────────────┘
```

## 🔧 Services

### Node.js API (Port 3000)

**Endpoints:**
- `GET /health` - Health check
- `GET /donations/latest` - Get latest donation
- `POST /donations` - Create donation
- `GET /donations` - List donations
- `GET /donations/:id` - Get donation by ID
- `PATCH /donations/:id` - Update donation

**Documentation:** See `database-adaptor/README.md`

### Python Server (Port 8000)

**Endpoints:**
- `GET /api/v1/health` - Health check
- `GET /api/v1/donations/latest` - Get latest donation
- `POST /api/v1/donations` - Create donation
- `GET /api/v1/donations` - List donations
- `GET /api/v1/donations/{id}` - Get donation by ID
- `PATCH /api/v1/donations/{id}` - Update donation

**Documentation:** See `python-server/README.md` and `PYTHON_SERVER_GUIDE.md`

## 📚 Documentation

- **[DOCKER_OPERATIONAL_GUIDE.md](./DOCKER_OPERATIONAL_GUIDE.md)** - Complete Docker setup guide
- **[PYTHON_SERVER_GUIDE.md](./PYTHON_SERVER_GUIDE.md)** - Python server documentation
- **[DATABASE_CONNECTION_SETUP.md](./DATABASE_CONNECTION_SETUP.md)** - Wix database connection
- **[DEPLOYMENT_RECOMMENDATIONS.md](./DEPLOYMENT_RECOMMENDATIONS.md)** - Deployment options
- **[RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)** - Railway deployment guide
- **[GIT_PUSH_GUIDE.md](./GIT_PUSH_GUIDE.md)** - Git workflow

## 🔑 Environment Variables

Create `.env` file:

```env
# Database
DB_PASSWORD=your_secure_password_here

# API Authentication
ADAPTOR_SECRET_KEY=your_secret_key_here

# Optional
DEBUG=false
```

## 🧪 Testing

### Health Checks
```bash
# Node.js API
curl http://localhost:3000/health

# Python Server
curl http://localhost:8000/api/v1/health
```

### Create Donation
```bash
# Node.js API
curl -X POST http://localhost:3000/donations \
     -H "Authorization: Bearer YOUR_SECRET_KEY" \
     -H "Content-Type: application/json" \
     -d '{"amount": 50.00, "is_other_amount": true}'

# Python Server
curl -X POST http://localhost:8000/api/v1/donations \
     -H "Authorization: Bearer YOUR_SECRET_KEY" \
     -H "Content-Type: application/json" \
     -d '{"amount": 50.00, "is_other_amount": true}'
```

## 🚀 Deployment

### Local Development
```bash
docker-compose up -d
```

### Production (Railway)
See **[RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)**

### Production (Render/Fly.io)
See **[DEPLOYMENT_RECOMMENDATIONS.md](./DEPLOYMENT_RECOMMENDATIONS.md)**

## 📊 Database Schema

The `donations` table includes:
- `id` - Unique identifier
- `amount` - Donation amount
- `currency` - Currency code (default: USD)
- `is_other_amount` - Custom amount flag
- `source` - Source of donation
- `payment_status` - Payment status
- `member_email` - Member email
- `member_name` - Member name
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp
- `metadata` - JSON metadata

See `database/init.sql` for complete schema.

## 🔒 Security

- ✅ API key authentication required
- ✅ Environment variables for secrets
- ✅ `.env` excluded from git
- ✅ HTTPS in production
- ✅ CORS configuration

## 🛠️ Development

### Project Structure

```
.
├── docker-compose.yml          # Docker services
├── database/                   # Database schema
│   └── init.sql
├── database-adaptor/           # Node.js API
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── python-server/              # Python FastAPI server
│   ├── main.py
│   ├── api/
│   ├── services/
│   └── middleware/
├── charter-page.html           # Wix charter page
├── payment-page-integration.js # Payment integration
└── velo-backend-api.js         # Wix backend API
```

## 📝 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🔗 Links

- **Repository**: `https://github.com/departments-commits/website-path-for-backend-contribution`
- **Wix Site**: `https://www.hingecraft-global.ai`

---

**Status**: ✅ Production Ready
