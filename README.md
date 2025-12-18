# 🚀 HingeCraft Global - Enterprise Cloud Portal & Database System

## 🌟 **MAIN FEATURE: Production-Ready ML-Powered Cloud Portal**

> **The biggest addition to this repository** - A complete, production-ready, enterprise-grade ML-powered cloud portal with Docker database, automation system, and advanced data collection pipeline for marketing optimization.

---

## 🎯 **What is This?**

This is a **complete, production-ready enterprise cloud portal** built with:
- **Docker-based PostgreSQL database** with pgvector for semantic search
- **Advanced ML pipeline** (Go + Python microservices)
- **Automation system** that runs all workflows from this repository
- **200+ data segmentations** for marketing optimization
- **Multi-tenant architecture** with Row-Level Security
- **Production-grade** infrastructure ready for deployment

---

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│              ENTERPRISE CLOUD PORTAL SYSTEM                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Go Gateway   │───▶│ PostgreSQL   │───▶│ ML Pipeline  │  │
│  │ (Production) │    │ + pgvector   │    │ (Python)     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │          │
│         └───────────────────┼────────────────────┘          │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │  Redis Queue    │                      │
│                    │  (Celery Tasks) │                      │
│                    └─────────────────┘                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     AUTOMATION SYSTEM (Runs from this repo)          │  │
│  │  • HubSpot Integration                                │  │
│  │  • Email Automation (Anymail)                         │  │
│  │  • Google Services                                    │  │
│  │  • Data Collection Workflows                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  200+ DATA SEGMENTATIONS FOR MARKETING               │  │
│  │  • User behavior tracking                             │  │
│  │  • Profile metrics                                    │  │
│  │  • Engagement analytics                               │  │
│  │  • Custom metadata fields                            │  │
│  │  • ML-generated tags                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Quick Start - Install & Run**

### Prerequisites

- Docker Desktop installed and running
- Git
- 10GB+ free disk space

### One-Command Installation

```bash
# Clone the repository
git clone https://github.com/departments-commits/hingecraft-global.git
cd hingecraft-global/cloud-portal

# Run automated installer
./BUILD_ALL.sh

# Wait 2-5 minutes for ML models to load
# Verify installation
curl http://localhost:8080/health
```

### Manual Installation

```bash
# 1. Clone repository
git clone https://github.com/departments-commits/hingecraft-global.git
cd hingecraft-global/cloud-portal

# 2. Create environment file
cat > .env << EOL
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
GRAFANA_PASSWORD=$(openssl rand -base64 16)
EOL

# 3. Build and start services
docker-compose -f docker-compose.cloud.yml up -d --build

# 4. Initialize database
docker exec -i cloud_db psql -U admin -d cloud_db < database/schema.sql

# 5. Verify all services
docker-compose -f docker-compose.cloud.yml ps
curl http://localhost:8080/health
```

---

## 🎯 **Core Features**

### 1. **Advanced ML Pipeline**

- **Semantic Search**: Vector embeddings with pgvector (384 dimensions)
- **Auto-Summarization**: BART/T5 models for document summarization
- **Entity Extraction**: Named Entity Recognition (NER)
- **Multi-Modal Support**: Images (CLIP) and Audio (Whisper)
- **Asynchronous Processing**: Celery workers for background ML tasks

### 2. **Production-Ready Database**

- **PostgreSQL 15** with pgvector extension
- **Row-Level Security (RLS)** for multi-tenant isolation
- **JSONB columns** for flexible schema
- **Vector indexing** (HNSW) for fast similarity search
- **Document versioning** and audit logging
- **Data persistence** via Docker volumes

### 3. **Automation System**

The automation system runs **directly from this repository** and includes:

- **HubSpot Integration**: Automated CRM workflows
- **Email Automation**: Anymail integration for transactional emails
- **Google Services**: Calendar, Drive, Sheets integration
- **Data Collection**: Automated user data gathering
- **Workflow Orchestration**: Complete automation pipelines

**Location**: All automation scripts are in the root directory and `automation/` folder.

### 4. **200+ Data Segmentations for Marketing**

The system collects **200+ data points** across multiple dimensions:

#### User Profile Metrics
- Demographics (age, location, company)
- Engagement metrics (login frequency, session duration)
- Activity patterns (peak usage times, feature usage)
- Membership tier and status

#### Behavioral Tracking
- Document upload patterns
- Search query analytics
- Content interaction metrics
- Feature adoption rates

#### ML-Generated Insights
- Auto-generated tags (200+ categories)
- Content similarity clusters
- User interest profiles
- Predictive engagement scores

#### Custom Metadata Fields
- Company metadata (JSONB)
- Member metadata (JSONB)
- Document metadata (JSONB)
- Access log analytics

#### Marketing Optimization Data
- Conversion funnels
- User journey mapping
- A/B test results
- Campaign performance metrics
- Retention analytics
- Churn prediction signals

**All data is stored in JSONB columns** allowing for flexible, schema-less data collection that can be queried and analyzed for marketing optimization.

---

## 📊 **Database Architecture**

### Multi-Tenant Design

- **Companies Table**: Multi-company isolation
- **Members Table**: User authentication and profiles
- **Member Vault**: Flexible JSONB data storage with vector embeddings
- **Roles Table**: Role-Based Access Control (RBAC)
- **Access Logs**: Complete audit trail
- **Document Versions**: Full versioning system

### Data Collection Points

The system collects data through:

1. **API Endpoints**: All user interactions logged
2. **ML Processing**: Automatic tagging and categorization
3. **Access Logs**: Every request tracked
4. **Metadata Fields**: Custom JSONB data storage
5. **Behavioral Analytics**: Usage patterns and engagement

---

## 🔧 **Technology Stack**

### Backend
- **Go 1.23** (Gin Gonic) - API Gateway
- **Python 3.11** (FastAPI) - ML Brain Service
- **Celery** - Asynchronous task processing
- **PostgreSQL 15** - Primary database
- **pgvector** - Vector similarity search
- **Redis** - Queue and cache

### ML/AI
- **Sentence Transformers** (all-MiniLM-L6-v2)
- **Transformers** (BART, T5)
- **CLIP** (Image embeddings)
- **Whisper** (Audio transcription)
- **spaCy** (NER)

### Infrastructure
- **Docker** & **Docker Compose**
- **Production mode** (Gin release mode)
- **Health checks** and monitoring
- **Automated backups**
- **Data persistence** via volumes

---

## 📁 **Project Structure**

```
hingecraft-global/
├── cloud-portal/              ⭐ MAIN FEATURE - Cloud Portal
│   ├── go-gateway/           # Go API Gateway (Production)
│   │   ├── main.go          # Gateway application
│   │   ├── Dockerfile        # Multi-stage build
│   │   └── go.mod           # Dependencies
│   ├── ml-service/           # Python ML Brain & Workers
│   │   ├── main.py         # FastAPI ML service
│   │   ├── worker.py        # Celery worker
│   │   ├── requirements.txt # Python dependencies
│   │   └── Dockerfile       # ML service build
│   ├── database/             # PostgreSQL schema & migrations
│   │   ├── schema.sql      # Complete database schema
│   │   └── init.sql        # Initialization script
│   ├── docker-compose.cloud.yml  # Production orchestration
│   ├── BUILD_ALL.sh          # One-command installation
│   ├── scripts/              # Utility scripts
│   └── NEXT_STEPS.md         # Usage guide
│
├── automation/               # Automation system (runs from here)
│   ├── hubspot/             # HubSpot integration
│   ├── email/               # Email automation
│   └── workflows/           # Automation workflows
│
├── frontend/                 # Frontend files
├── backend/                  # Backend services
└── README.md                 # This file
```

---

## 🎯 **API Endpoints**

### Public Endpoints
- `GET /health` - Health check
- `POST /api/v1/auth/signup` - Create account
- `POST /api/v1/auth/login` - Login and get token

### Protected Endpoints (Require Bearer Token)
- `POST /api/v1/vault/collect` - Upload data
- `GET /api/v1/vault/search?q=query` - Semantic search
- `GET /api/v1/vault/status/:id` - Check processing status
- `GET /api/v1/admin/health` - Admin metrics

---

## 📈 **Production Status**

✅ **Fully Operational**
- Gateway: Production mode active
- Database: Persistent and healthy
- Redis: AOF persistence enabled
- ML Brain: Models loaded and ready
- ML Worker: Processing tasks

✅ **Tested & Verified**
- Stress tested: 100% success rate
- Throughput: 128+ requests/second
- Data persistence: Verified
- Security: Row-Level Security enabled

---

## 🔄 **Automation System**

The automation system **runs from this repository** and includes:

### What It Does
- **Automated workflows** for all business processes
- **Data collection** from multiple sources
- **Marketing automation** (HubSpot, email campaigns)
- **Integration** with Google services
- **Scheduled tasks** via Celery

### How It Runs
All automation scripts are executable from the repository root:
```bash
# Run automation workflows
./automation/workflows/run_all.sh

# HubSpot integration
./automation/hubspot/sync.sh

# Email automation
./automation/email/send_campaign.sh
```

---

## 📊 **200+ Data Segmentations**

The system automatically collects and segments user data across **200+ dimensions**:

### Categories
1. **Demographics** (20+ fields)
2. **Behavioral** (50+ metrics)
3. **Engagement** (30+ signals)
4. **Content** (40+ tags)
5. **ML-Generated** (60+ insights)
6. **Custom Metadata** (Unlimited JSONB fields)

### Marketing Use Cases
- **Segmentation**: Target users by behavior, engagement, interests
- **Personalization**: Customize experiences based on data
- **Optimization**: A/B test campaigns using segmentation data
- **Analytics**: Deep insights into user patterns
- **Predictive**: ML-powered churn and conversion prediction

---

## 🚀 **Deployment**

### Local Development
```bash
cd cloud-portal
./BUILD_ALL.sh
```

### Production Deployment
```bash
# Set production environment variables
export GIN_MODE=release
export POSTGRES_PASSWORD=your_secure_password
export JWT_SECRET=your_jwt_secret

# Launch
docker-compose -f docker-compose.cloud.yml up -d
```

### Cloud Deployment
- Compatible with AWS, GCP, Azure
- Docker Swarm ready
- Kubernetes manifests available
- Auto-scaling configured

---

## 📚 **Documentation**

- `cloud-portal/NEXT_STEPS.md` - Complete usage guide
- `cloud-portal/PRODUCTION_CONFIG.md` - Production setup
- `cloud-portal/STRESS_TEST_RESULTS.md` - Performance testing
- `cloud-portal/README.md` - Portal documentation
- `cloud-portal/SYSTEM_MANIFEST.md` - Technical architecture

---

## 🔒 **Security**

- **Argon2id** password hashing
- **JWT** authentication
- **Row-Level Security** (RLS) for data isolation
- **Application-level encryption** at rest
- **TLS/SSL** ready (Traefik + Let's Encrypt)
- **Non-root containers**
- **Firewall** configuration (UFW)
- **Fail2Ban** integration

---

## 📊 **Monitoring & Observability**

- **Prometheus** metrics collection
- **Grafana** dashboards
- **OpenTelemetry** distributed tracing
- **Jaeger** trace visualization
- **Health checks** for all services
- **Automated alerts**

---

## 🎉 **What's Included**

This repository includes:

✅ **Complete Cloud Portal** - Production-ready ML-powered system
✅ **Docker Database** - PostgreSQL with pgvector
✅ **Automation System** - Runs all workflows from this repo
✅ **200+ Segmentations** - Advanced data collection for marketing
✅ **ML Pipeline** - Semantic search, summarization, NER
✅ **Production Mode** - Fully configured and tested
✅ **Installation Scripts** - One-command setup
✅ **Complete Documentation** - Every aspect documented

---

## 🤝 **Contributing**

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 **License**

See LICENSE file for details.

---

## 🆘 **Support**

- **Documentation**: See `cloud-portal/` directory
- **Issues**: GitHub Issues
- **Health Check**: `curl http://localhost:8080/health`

---

## 🎯 **Quick Links**

- [Installation Guide](cloud-portal/BUILD_ALL.sh)
- [API Documentation](cloud-portal/NEXT_STEPS.md)
- [Production Config](cloud-portal/PRODUCTION_CONFIG.md)
- [Stress Test Results](cloud-portal/STRESS_TEST_RESULTS.md)

---

**🚀 Ready to deploy? Run `./cloud-portal/BUILD_ALL.sh` and you're live!**

---

*Last Updated: December 17, 2025*
*Status: Production Ready ✅*
