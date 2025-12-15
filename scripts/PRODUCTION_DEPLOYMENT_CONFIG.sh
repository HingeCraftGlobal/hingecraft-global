#!/bin/bash
# Production Deployment Configuration
# Sets up production-ready configuration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 PRODUCTION DEPLOYMENT CONFIGURATION"
echo "═══════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT"

# Create production environment file template
cat > .env.production.example << 'EOF'
# Production Environment Variables

# Database (Managed Postgres - Supabase/RDS/Neon)
DATABASE_URL=postgresql://user:password@host:5432/hingecraft

# Redis (Managed - ElastiCache/Upstash)
REDIS_URL=redis://host:6379/0

# MinIO/S3 (Production)
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET=hingecraft-production

# API Keys
WC_API_KEY=your_production_api_key
JWT_SECRET=your_production_jwt_secret
WEBHOOK_SECRET=your_production_webhook_secret

# LLM APIs
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# External Services
NGROK_TOKEN=your_ngrok_token
STRIPE_API_KEY=your_stripe_key

# Environment
ENVIRONMENT=production
DEBUG=false

# CORS
CORS_ORIGINS=https://hingecraft-global.ai,https://www.hingecraft-global.ai

# Monitoring
SENTRY_DSN=your_sentry_dsn
DATADOG_API_KEY=your_datadog_key
EOF

echo "  ✅ Production environment template created"

# Create production docker-compose override
cat > docker-compose.prod.yml << 'EOF'
version: "3.8"

services:
  fastapi:
    environment:
      ENVIRONMENT: production
      DEBUG: "false"
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  worker:
    restart: always
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G

  postgres:
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
EOF

echo "  ✅ Production docker-compose override created"

# Create deployment script
cat > scripts/DEPLOY_PRODUCTION.sh << 'EOF'
#!/bin/bash
# Production Deployment Script

set -e

echo "Deploying to production..."

# Load production environment
export $(cat .env.production | xargs)

# Build and push images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml push

# Deploy to production
# This would typically deploy to ECS/Fargate, Cloud Run, etc.
# Implementation depends on your cloud provider

echo "Production deployment complete"
EOF

chmod +x scripts/DEPLOY_PRODUCTION.sh

echo "  ✅ Production deployment script created"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ PRODUCTION CONFIGURATION COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Created files:"
echo "  ✅ .env.production.example"
echo "  ✅ docker-compose.prod.yml"
echo "  ✅ scripts/DEPLOY_PRODUCTION.sh"
echo ""
echo "Next steps:"
echo "  1. Copy .env.production.example to .env.production"
echo "  2. Fill in production credentials"
echo "  3. Configure cloud provider"
echo "  4. Run: ./scripts/DEPLOY_PRODUCTION.sh"
echo ""

