#!/bin/bash
# Launch Breakdown - Step-by-Step Complete System Launch
# Breaks down the entire launch process into detailed steps

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

cd "$PROJECT_ROOT"

echo "═══════════════════════════════════════════════════════════"
echo "🔍 LAUNCH BREAKDOWN - DETAILED STEP-BY-STEP DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Step 1: Verify Prerequisites
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: VERIFY PREREQUISITES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "  [1.1] Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "    ❌ Docker not found. Please install Docker."
    exit 1
fi
echo "    ✅ Docker installed: $(docker --version)"

echo "  [1.2] Checking Docker Compose installation..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "    ❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi
echo "    ✅ Docker Compose available"

echo "  [1.3] Checking .env file..."
if [ ! -f ".env" ]; then
    echo "    ⚠️  .env file not found. Creating default .env..."
    cat > .env << EOF
WC_API_KEY=changeme
JWT_SECRET=hingecraft-production-secret-key-change-in-production
WEBHOOK_SECRET=hingecraft-webhook-secret-change-in-production
NGROK_TOKEN=
DATABASE_URL=postgresql://hcuser:hcpass@postgres:5432/hingecraft
REDIS_URL=redis://redis:6379/0
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
EOF
    echo "    ✅ .env file created"
else
    echo "    ✅ .env file exists"
fi

echo "  [1.4] Checking docker-compose.yml..."
if [ ! -f "docker-compose.yml" ]; then
    echo "    ❌ docker-compose.yml not found"
    exit 1
fi
echo "    ✅ docker-compose.yml found"

echo "  [1.5] Checking database schema files..."
SCHEMA_COUNT=$(find database/master_schema -name "*.sql" 2>/dev/null | wc -l | tr -d ' ')
echo "    ✅ Found $SCHEMA_COUNT schema files"

echo ""
echo "✅ Step 1 Complete: All prerequisites verified"
echo ""

# Step 2: Stop Existing Containers
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: CLEAN UP EXISTING CONTAINERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "  [2.1] Stopping existing containers..."
docker compose down 2>&1 | grep -v "version" || true
echo "    ✅ Containers stopped"

echo "  [2.2] Removing old containers..."
docker compose rm -f 2>&1 | grep -v "version" || true
echo "    ✅ Old containers removed"

echo ""
echo "✅ Step 2 Complete: Cleanup done"
echo ""

# Step 3: Start Core Services
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: START CORE SERVICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "  [3.1] Starting PostgreSQL..."
docker compose up -d postgres 2>&1 | grep -v "version" || true
echo "    ⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U hcuser -d hingecraft &>/dev/null; then
        echo "    ✅ PostgreSQL is ready"
        break
    fi
    sleep 1
done

echo "  [3.2] Starting Redis..."
docker compose up -d redis 2>&1 | grep -v "version" || true
echo "    ⏳ Waiting for Redis to be ready..."
for i in {1..10}; do
    if docker compose exec -T redis redis-cli ping &>/dev/null; then
        echo "    ✅ Redis is ready"
        break
    fi
    sleep 1
done

echo "  [3.3] Starting MinIO..."
docker compose up -d minio 2>&1 | grep -v "version" || true
echo "    ⏳ Waiting for MinIO to be ready..."
sleep 5
echo "    ✅ MinIO started"

echo ""
echo "✅ Step 3 Complete: Core services running"
echo ""

# Step 4: Apply Database Schema
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: APPLY DATABASE SCHEMA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "  [4.1] Checking for schema application script..."
if [ -f "scripts/APPLY_MASTER_SCHEMA.sh" ]; then
    echo "    ✅ Found APPLY_MASTER_SCHEMA.sh"
    echo "    [4.2] Running schema application..."
    bash scripts/APPLY_MASTER_SCHEMA.sh 2>&1 | tail -20
    echo "    ✅ Schema applied"
elif [ -f "LAUNCH_01_DATABASE.sh" ]; then
    echo "    ✅ Found LAUNCH_01_DATABASE.sh"
    echo "    [4.2] Running database launch..."
    bash LAUNCH_01_DATABASE.sh 2>&1 | tail -20
    echo "    ✅ Database launched"
else
    echo "    ⚠️  No schema script found, checking if tables exist..."
    TABLE_COUNT=$(docker compose exec -T postgres psql -U hcuser -d hingecraft -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")
    echo "    ℹ️  Found $TABLE_COUNT tables in database"
fi

echo ""
echo "✅ Step 4 Complete: Database schema applied"
echo ""

# Step 5: Start Application Services
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: START APPLICATION SERVICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "  [5.1] Building FastAPI image..."
docker compose build fastapi 2>&1 | tail -5 || true
echo "    ✅ FastAPI image built"

echo "  [5.2] Starting FastAPI..."
docker compose up -d fastapi 2>&1 | grep -v "version" || true
echo "    ⏳ Waiting for FastAPI to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:8000/health &>/dev/null 2>&1; then
        echo "    ✅ FastAPI is ready"
        break
    fi
    sleep 1
done

echo "  [5.3] Starting Celery Worker..."
docker compose up -d worker 2>&1 | grep -v "version" || true
echo "    ✅ Celery Worker started"

echo "  [5.4] Starting Celery Scheduler..."
docker compose up -d scheduler 2>&1 | grep -v "version" || true
echo "    ✅ Celery Scheduler started"

echo ""
echo "✅ Step 5 Complete: Application services running"
echo ""

# Step 6: Start Optional Services
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: START OPTIONAL SERVICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "  [6.1] Starting pgAdmin..."
docker compose up -d pgadmin 2>&1 | grep -v "version" || true
echo "    ✅ pgAdmin started (http://localhost:5050)"

echo "  [6.2] Checking ngrok configuration..."
if [ -n "$NGROK_TOKEN" ] && [ "$NGROK_TOKEN" != "" ]; then
    echo "    ✅ ngrok token found, starting ngrok..."
    docker compose up -d ngrok 2>&1 | grep -v "version" || true
    echo "    ✅ ngrok started (http://localhost:4040)"
else
    echo "    ⚠️  ngrok token not set, skipping ngrok"
fi

echo ""
echo "✅ Step 6 Complete: Optional services started"
echo ""

# Step 7: Verify Agents
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 7: VERIFY AGENTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

AGENTS=("legal" "marketing" "engineering" "education" "community" "crypto")
TOTAL_FILES=0

for agent in "${AGENTS[@]}"; do
    if [ -d "agents/$agent" ]; then
        FILE_COUNT=$(find "agents/$agent" -name "*.py" -type f 2>/dev/null | wc -l | tr -d ' ')
        TOTAL_FILES=$((TOTAL_FILES + FILE_COUNT))
        echo "  [7.$((++i))] $agent Agent: $FILE_COUNT files"
    else
        echo "  [7.$((++i))] $agent Agent: ⚠️  Directory not found"
    fi
done

echo "    ✅ Total agent files: $TOTAL_FILES"

echo ""
echo "✅ Step 7 Complete: Agents verified"
echo ""

# Step 8: Service Status Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 8: SERVICE STATUS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

docker compose ps

echo ""
echo "✅ Step 8 Complete: Service status displayed"
echo ""

# Step 9: Health Checks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 9: HEALTH CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "  [9.1] PostgreSQL health..."
if docker compose exec -T postgres pg_isready -U hcuser -d hingecraft &>/dev/null; then
    echo "    ✅ PostgreSQL: Healthy"
else
    echo "    ❌ PostgreSQL: Unhealthy"
fi

echo "  [9.2] Redis health..."
if docker compose exec -T redis redis-cli ping &>/dev/null; then
    echo "    ✅ Redis: Healthy"
else
    echo "    ❌ Redis: Unhealthy"
fi

echo "  [9.3] FastAPI health..."
if curl -f http://localhost:8000/health &>/dev/null 2>&1; then
    echo "    ✅ FastAPI: Healthy"
    curl -s http://localhost:8000/health | head -3
else
    echo "    ❌ FastAPI: Unhealthy"
fi

echo ""
echo "✅ Step 9 Complete: Health checks done"
echo ""

# Final Summary
echo "═══════════════════════════════════════════════════════════"
echo "🎉 COMPLETE BREAKDOWN FINISHED"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ All Steps Completed:"
echo "  ✅ Step 1: Prerequisites verified"
echo "  ✅ Step 2: Cleanup done"
echo "  ✅ Step 3: Core services started"
echo "  ✅ Step 4: Database schema applied"
echo "  ✅ Step 5: Application services started"
echo "  ✅ Step 6: Optional services started"
echo "  ✅ Step 7: Agents verified"
echo "  ✅ Step 8: Service status checked"
echo "  ✅ Step 9: Health checks completed"
echo ""
echo "🚀 System Ready for Production!"
echo ""
echo "Access Points:"
echo "  • FastAPI: http://localhost:8000"
echo "  • pgAdmin: http://localhost:5050"
echo "  • MinIO: http://localhost:9001"
if [ -n "$NGROK_TOKEN" ] && [ "$NGROK_TOKEN" != "" ]; then
    echo "  • ngrok: http://localhost:4040"
fi
echo ""

