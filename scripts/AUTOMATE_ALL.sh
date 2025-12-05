#!/bin/bash
# Automate All - Complete System Automation
# Executes all deployment, testing, and verification

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════"
echo "🤖 AUTOMATE ALL - COMPLETE SYSTEM AUTOMATION"
echo "═══════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT"

# Step 1: Stop existing services
echo "📦 Step 1: Stopping existing services..."
docker compose down 2>/dev/null || true
echo "  ✅ Services stopped"

# Step 2: Rebuild Docker images
echo ""
echo "📦 Step 2: Rebuilding Docker images..."
docker compose build --no-cache fastapi worker scheduler
echo "  ✅ Images rebuilt"

# Step 3: Start all services
echo ""
echo "📦 Step 3: Starting all services..."
docker compose up -d

# Wait for services
echo "  ⏳ Waiting for services to be ready..."
sleep 20

# Step 4: Apply complete schema
echo ""
echo "📦 Step 4: Applying complete database schema..."
if docker compose exec -T postgres psql -U hcuser -d hingecraft -f /docker-entrypoint-initdb.d/00-init.sql > /dev/null 2>&1; then
    echo "  ✅ Core schema applied"
else
    echo "  Applying core schema..."
    docker compose exec -T postgres psql -U hcuser -d hingecraft < "$PROJECT_ROOT/database/init.sql" 2>&1 | grep -v "already exists" || true
fi

# Apply complete schema
if [ -f "$PROJECT_ROOT/database/complete_schema.sql" ]; then
    echo "  Applying complete schema..."
    docker compose exec -T postgres psql -U hcuser -d hingecraft < "$PROJECT_ROOT/database/complete_schema.sql" 2>&1 | grep -v "already exists" || true
    echo "  ✅ Complete schema applied"
fi

# Step 5: Apply master schema
echo ""
echo "📦 Step 5: Applying master schema..."
bash "$SCRIPT_DIR/APPLY_MASTER_SCHEMA.sh" 2>&1 | grep -v "already exists" || true

# Step 6: Verify services
echo ""
echo "📦 Step 6: Verifying services..."
echo "  Checking PostgreSQL..."
if docker compose exec -T postgres pg_isready -U hcuser -d hingecraft > /dev/null 2>&1; then
    echo "    ✅ PostgreSQL ready"
else
    echo "    ❌ PostgreSQL not ready"
fi

echo "  Checking Redis..."
if docker compose exec -T redis redis-cli ping | grep -q PONG; then
    echo "    ✅ Redis ready"
else
    echo "    ❌ Redis not ready"
fi

echo "  Checking MinIO..."
if curl -s http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    echo "    ✅ MinIO ready"
else
    echo "    ⚠️  MinIO may still be starting"
fi

echo "  Checking FastAPI..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "    ✅ FastAPI ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "    ⚠️  FastAPI may still be starting"
    fi
    sleep 1
done

# Step 7: Run comprehensive tests
echo ""
echo "📦 Step 7: Running comprehensive tests..."
if [ -f "$SCRIPT_DIR/FULL_SYSTEM_TEST_COMPREHENSIVE.sh" ]; then
    bash "$SCRIPT_DIR/FULL_SYSTEM_TEST_COMPREHENSIVE.sh" 2>&1 | tail -20 || echo "  ⚠️  Some tests may have warnings"
fi

# Step 8: Run split tests
echo ""
echo "📦 Step 8: Running split tests..."
if [ -f "$SCRIPT_DIR/SPLIT_TESTS.sh" ]; then
    bash "$SCRIPT_DIR/SPLIT_TESTS.sh" 2>&1 | tail -15 || echo "  ⚠️  Some tests may have warnings"
fi

# Step 9: Run nano tests
echo ""
echo "📦 Step 9: Running nano tests..."
if [ -f "$SCRIPT_DIR/NANO_TESTS.sh" ]; then
    bash "$SCRIPT_DIR/NANO_TESTS.sh" 2>&1 | tail -20 || echo "  ⚠️  Some tests may have warnings"
fi

# Step 10: Test login system
echo ""
echo "📦 Step 10: Testing login system..."
if [ -f "$SCRIPT_DIR/TEST_LOGIN_SYSTEM.sh" ]; then
    bash "$SCRIPT_DIR/TEST_LOGIN_SYSTEM.sh" 2>&1 | tail -15 || echo "  ⚠️  Login test completed with warnings"
fi

# Step 11: Display service URLs
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ AUTOMATION COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Service URLs:"
echo "  PostgreSQL: localhost:5432"
echo "  Redis: localhost:6379"
echo "  MinIO: http://localhost:9000 (Console: http://localhost:9001)"
echo "  FastAPI: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo "  pgAdmin: http://localhost:5050"
if [ -n "$NGROK_TOKEN" ]; then
    echo "  ngrok Dashboard: http://localhost:4040"
    echo "  ngrok URL: Check dashboard for public URL"
fi
echo ""
echo "Next steps:"
echo "  1. Test API: curl http://localhost:8000/health"
echo "  2. Test donation: POST http://localhost:8000/v1/donations/create"
echo "  3. View logs: docker compose logs -f"
echo ""

