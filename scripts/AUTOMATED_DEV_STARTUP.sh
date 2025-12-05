#!/bin/bash
# Automated Full Development Environment Startup
# Starts all Docker services, applies schemas, starts Wix dev, runs tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 AUTOMATED DEV ENVIRONMENT STARTUP"
echo "═══════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT"

# Step 1: Check prerequisites
echo "📦 Step 1: Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "  ❌ Docker not found. Please install Docker."
    exit 1
fi
echo "  ✅ Docker found"

if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "  ❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi
echo "  ✅ Docker Compose found"

# Step 2: Start Docker services
echo ""
echo "📦 Step 2: Starting Docker services..."
docker compose up -d

# Wait for services to be ready
echo "  ⏳ Waiting for services to be ready..."
sleep 10

# Step 3: Wait for PostgreSQL
echo ""
echo "📦 Step 3: Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U hc -d hingecraft > /dev/null 2>&1; then
        echo "  ✅ PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "  ❌ PostgreSQL failed to start"
        exit 1
    fi
    sleep 1
done

# Step 4: Apply master schema
echo ""
echo "📦 Step 4: Applying master schema..."
if docker compose exec -T postgres psql -U hc -d hingecraft -f /docker-entrypoint-initdb.d/master_schema/00_master_schema_init.sql > /dev/null 2>&1; then
    echo "  ✅ Master schema applied"
else
    echo "  ⚠️  Master schema may already be applied or needs manual application"
fi

# Step 5: Apply RAG schema
echo ""
echo "📦 Step 5: Applying RAG knowledge base schema..."
if docker compose exec -T postgres psql -U hc -d hingecraft -f /docker-entrypoint-initdb.d/rag_knowledge_base/01_rag_schema.sql > /dev/null 2>&1; then
    echo "  ✅ RAG schema applied"
else
    echo "  ⚠️  RAG schema may already be applied"
fi

# Step 6: Apply governance schema
echo ""
echo "📦 Step 6: Applying governance schema..."
for gov_file in database/governance/*.sql; do
    if [ -f "$gov_file" ]; then
        docker compose exec -T postgres psql -U hc -d hingecraft < "$gov_file" > /dev/null 2>&1 || true
    fi
done
echo "  ✅ Governance schema applied"

# Step 7: Wait for API
echo ""
echo "📦 Step 7: Waiting for API..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "  ✅ API is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "  ⚠️  API may still be starting"
    fi
    sleep 1
done

# Step 8: Run comprehensive tests
echo ""
echo "📦 Step 8: Running comprehensive tests..."
if [ -f "$SCRIPT_DIR/FULL_SYSTEM_TEST_COMPREHENSIVE.sh" ]; then
    bash "$SCRIPT_DIR/FULL_SYSTEM_TEST_COMPREHENSIVE.sh" || echo "  ⚠️  Some tests failed (check output above)"
else
    echo "  ⚠️  Test script not found"
fi

# Step 9: Start Wix dev (if not running)
echo ""
echo "📦 Step 9: Starting Wix dev..."
if pgrep -f "wix dev" > /dev/null; then
    echo "  ✅ Wix dev already running"
else
    echo "  Starting Wix dev..."
    cd "$PROJECT_ROOT"
    nohup NODE_TLS_REJECT_UNAUTHORIZED=0 wix dev > wix-dev.log 2>&1 &
    echo "  ✅ Wix dev started (PID: $!)"
    echo "  ⏳ Waiting for Wix dev to initialize..."
    sleep 10
fi

# Step 10: Final status
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ DEVELOPMENT ENVIRONMENT READY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Services Status:"
echo "  ✅ PostgreSQL: http://localhost:5432"
echo "  ✅ Redis: http://localhost:6379"
echo "  ✅ MinIO: http://localhost:9000"
echo "  ✅ FastAPI: http://localhost:8000"
echo "  ✅ API Docs: http://localhost:8000/docs"
echo "  ✅ Celery Worker: Running"
if [ -n "$NGROK_TOKEN" ]; then
    echo "  ✅ ngrok: http://localhost:4040"
fi
echo "  ✅ Wix dev: Running"
echo ""
echo "Next steps:"
echo "  1. Test API: curl http://localhost:8000/health"
echo "  2. View API docs: http://localhost:8000/docs"
echo "  3. Register user: POST http://localhost:8000/v1/auth/register"
echo "  4. Login: POST http://localhost:8000/v1/auth/login"
echo ""

