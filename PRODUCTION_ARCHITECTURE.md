# Production Architecture - Dev → Prod
## Complete Architecture Specification

**Date:** December 5, 2025  
**Status:** ✅ READY FOR DEPLOYMENT

---

## A. Local / Dev Environment (Docker + ngrok)

### Docker Compose Services ✅

#### 1. fastapi-donation-service ✅
- **Image:** Custom build from `./api`
- **Port:** 8000
- **Purpose:** HingeCraft Automation/Donation API
- **Features:**
  - FastAPI backend
  - Wix integration endpoints
  - Donation processing
  - Webhook handling
  - Authentication

#### 2. postgres ✅
- **Image:** postgres:15
- **Port:** 5432
- **Purpose:** Primary relational database
- **Features:**
  - Complete schema (17 tables)
  - Master schema (10 layers)
  - RAG knowledge base
  - Governance tables
  - Security modules

#### 3. redis ✅
- **Image:** redis:7
- **Port:** 6379
- **Purpose:** Celery broker, caching, rate limits
- **Features:**
  - Task queue backend
  - Session storage
  - Rate limiting
  - Caching layer

#### 4. minio ✅
- **Image:** minio/minio
- **Ports:** 9000 (API), 9001 (Console)
- **Purpose:** S3-compatible asset store
- **Features:**
  - Object storage
  - File uploads
  - Asset management
  - S3 API compatibility

#### 5. worker ✅
- **Image:** Custom build from `./api`
- **Purpose:** Celery/APScheduler background workers
- **Features:**
  - Blockchain confirmation worker
  - Compliance worker
  - Receipt worker
  - NFT worker
  - Sweep worker

#### 6. ngrok ✅
- **Image:** wernight/ngrok
- **Port:** 4040 (dashboard)
- **Purpose:** Tunnel for Wix callbacks during dev
- **Features:**
  - Public URL generation
  - Request inspection
  - Webhook testing
  - HTTPS tunnel

#### 7. pgadmin ✅
- **Image:** dpage/pgadmin4
- **Port:** 5050
- **Purpose:** Database admin UI
- **Features:**
  - Database management
  - Query interface
  - Schema browser
  - User management

### Usage:
```bash
docker compose up --build
```

### ngrok Setup:
1. Get ngrok token from https://dashboard.ngrok.com
2. Set `NGROK_TOKEN` in `.env`
3. Access ngrok dashboard at http://localhost:4040
4. Use ngrok URL in Wix dev settings

---

## B. Production Architecture (Recommended)

### Primary Database Options:

#### Option 1: Supabase (Recommended for Start)
- **Postgres:** Managed PostgreSQL
- **Storage:** Built-in S3-compatible storage
- **Auth:** Built-in authentication
- **Features:**
  - Row-level security
  - Real-time subscriptions
  - Edge functions
  - Easy team access
  - Free tier available

#### Option 2: AWS RDS
- **Postgres:** Multi-AZ RDS PostgreSQL
- **Storage:** S3 for assets
- **Features:**
  - High availability
  - Automated backups
  - Point-in-time recovery
  - VPC security

#### Option 3: Neon / PlanetScale
- **Postgres:** Serverless PostgreSQL
- **Features:**
  - Auto-scaling
  - Branching for dev/staging
  - Global distribution

### Backend Options:

#### Option 1: ECS Fargate (AWS)
- **Container:** FastAPI on Docker
- **Features:**
  - Auto-scaling
  - Load balancing
  - Health checks
  - Service discovery

#### Option 2: Cloud Run (GCP)
- **Container:** Serverless containers
- **Features:**
  - Pay per request
  - Auto-scaling to zero
  - Built-in HTTPS
  - Easy deployment

#### Option 3: Lambda + API Gateway (AWS)
- **Serverless:** Function-based
- **Features:**
  - Pay per request
  - Auto-scaling
  - Integrated with AWS services
  - Cost-effective for low traffic

### Queue/Workers:

#### Option 1: ElastiCache Redis + Celery
- **Redis:** Managed Redis
- **Workers:** ECS Fargate tasks
- **Features:**
  - Reliable task queue
  - Retry logic
  - Monitoring

#### Option 2: Cloud Tasks (GCP)
- **Serverless:** Managed job queue
- **Features:**
  - No infrastructure
  - Built-in retries
  - Rate limiting

### Object Storage:

#### Option 1: AWS S3
- **Storage:** Object storage
- **Features:**
  - 99.999999999% durability
  - Lifecycle policies
  - Versioning
  - CDN integration

#### Option 2: Supabase Storage
- **Storage:** Built-in storage
- **Features:**
  - S3-compatible API
  - Built-in CDN
  - Easy integration

### Auth & Team Access:

#### Option 1: Supabase Auth
- **Features:**
  - Built-in authentication
  - Social logins
  - Row-level security
  - Easy team access

#### Option 2: Auth0
- **Features:**
  - Enterprise SSO
  - Multi-factor auth
  - User management
  - Analytics

#### Option 3: Google Workspace SSO
- **Features:**
  - Enterprise integration
  - Single sign-on
  - User provisioning
  - Security policies

### Analytics & BI:

#### Option 1: Metabase
- **Features:**
  - Self-hosted BI
  - SQL queries
  - Dashboards
  - Team collaboration

#### Option 2: Supabase + Metabase
- **Features:**
  - Integrated analytics
  - Real-time dashboards
  - Easy setup

#### Option 3: BigQuery + Data Studio
- **Features:**
  - Data warehouse
  - Advanced analytics
  - ML integration
  - Scalable

### Monitoring:

#### Option 1: Prometheus + Grafana
- **Features:**
  - Metrics collection
  - Custom dashboards
  - Alerting
  - Open source

#### Option 2: Datadog
- **Features:**
  - APM
  - Infrastructure monitoring
  - Log management
  - Alerting

#### Option 3: CloudWatch (AWS)
- **Features:**
  - Integrated monitoring
  - Logs
  - Metrics
  - Alarms

### Treasury / Security:

#### Hot Wallet:
- **HSM:** AWS KMS / GCP KMS
- **Features:**
  - Key management
  - Signing operations
  - Audit logging

#### Cold Storage:
- **Hardware Wallets:** Ledger / Trezor
- **Multisig:** 3-of-5 recommended
- **Features:**
  - Offline storage
  - Multi-signature
  - Hardware security

### Backups:

#### Database:
- **Automated:** Daily snapshots
- **Point-in-Time Recovery:** 7-30 days
- **Cross-Region:** Disaster recovery

#### Object Storage:
- **Versioning:** Enabled
- **Lifecycle Policies:** Archive to cold storage
- **Replication:** Cross-region

---

## C. Why This Pattern?

### Dev Benefits:
- ✅ Fast iteration with Docker + ngrok
- ✅ Local testing without production dependencies
- ✅ Easy team collaboration
- ✅ Cost-effective development

### Production Benefits:
- ✅ Managed services reduce operational overhead
- ✅ Auto-scaling handles traffic spikes
- ✅ High availability and reliability
- ✅ Team-accessible with proper auth
- ✅ Compliance-ready (SOC 2, GDPR)

### JSONB Flexibility:
- ✅ Store flexible vault data
- ✅ LLM outputs and prompts
- ✅ Design metadata
- ✅ No rigid schema changes needed

### Security:
- ✅ PII encryption at app layer
- ✅ Audit trail for compliance
- ✅ Separation of concerns
- ✅ Role-based access control

---

## D. Migration Path: Dev → Prod

### Phase 1: Dev Environment ✅
- [x] Docker Compose setup
- [x] Local database
- [x] ngrok for Wix callbacks
- [x] Basic monitoring

### Phase 2: Staging Environment ⏳
- [ ] Deploy to cloud (Supabase + Cloud Run)
- [ ] Set up staging database
- [ ] Configure staging URLs
- [ ] Test Wix integration
- [ ] Set up monitoring

### Phase 3: Production Environment ⏳
- [ ] Deploy to production cloud
- [ ] Set up production database
- [ ] Configure production URLs
- [ ] Set up backups
- [ ] Configure monitoring
- [ ] Set up alerting
- [ ] Team access setup
- [ ] Security hardening

---

## E. Recommended Production Stack

### Quick Launch (Managed):
**Supabase + Vercel**
- Postgres: Supabase
- Storage: Supabase Storage
- Auth: Supabase Auth
- Backend: Vercel Edge Functions
- Frontend: Vercel
- **Benefits:** Fast setup, team access, cost-effective

### Enterprise / Scale:
**AWS Stack**
- Database: RDS PostgreSQL (Multi-AZ)
- Storage: S3
- Backend: ECS Fargate
- Queue: ElastiCache Redis
- Workers: ECS Fargate
- Monitoring: CloudWatch + Datadog
- **Benefits:** Scalable, enterprise-grade, full control

### GCP Stack:
- Database: Cloud SQL PostgreSQL
- Storage: Cloud Storage
- Backend: Cloud Run
- Queue: Cloud Tasks
- Monitoring: Cloud Monitoring
- **Benefits:** Serverless, auto-scaling, integrated

---

## F. Team Access Setup

### Secrets Management:
- **Vault:** HashiCorp Vault or AWS Secrets Manager
- **Environment Variables:** Stored securely
- **API Keys:** Rotated regularly

### SSO Integration:
- **Okta:** Enterprise SSO
- **Google Workspace:** Team SSO
- **Auth0:** Flexible auth

### Admin Tools:
- **Metabase:** BI and analytics
- **Hasura:** GraphQL API
- **pgAdmin:** Database management
- **Custom Admin Panel:** Role-based access

---

## G. Compliance Checklist

### Data Protection:
- [x] PII encryption at rest
- [x] Encryption in transit (HTTPS)
- [x] Audit logging (7 years)
- [x] Data retention policies
- [x] GDPR/CCPA compliance

### Security:
- [x] HMAC webhook signatures
- [x] API key authentication
- [x] Role-based access control
- [x] Rate limiting
- [x] SQL injection protection

### Financial:
- [x] OFAC/AML checks
- [x] KYC document security
- [x] Treasury management
- [x] Transaction audit trail
- [x] Receipt generation

---

## H. Performance & Scaling

### Database:
- [x] Indexes on key columns
- [ ] Partitioning for large tables (future)
- [ ] Read replicas (future)
- [ ] Connection pooling (PgBouncer)

### Caching:
- [x] Redis for sessions
- [x] Redis for rate limiting
- [ ] CDN for static assets (future)
- [ ] Application-level caching (future)

### Monitoring:
- [x] Health checks
- [x] Logging
- [ ] Performance metrics (future)
- [ ] Cost tracking (future)

---

## ✅ Current Status

### Dev Environment: ✅ COMPLETE
- [x] Docker Compose configured
- [x] All services running
- [x] ngrok integrated
- [x] Complete schema applied
- [x] Wix integration ready

### Production Ready: ⏳ PENDING
- [ ] Cloud deployment
- [ ] Managed database
- [ ] Production URLs
- [ ] Team access
- [ ] Monitoring setup

---

**Next Steps:**
1. Test dev environment thoroughly
2. Deploy to staging (Supabase + Cloud Run)
3. Test staging with Wix
4. Deploy to production
5. Set up team access and monitoring



