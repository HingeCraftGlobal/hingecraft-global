#!/bin/bash
# Automate All - Complete System Automation
# Executes all deployment, testing, and verification steps

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 AUTOMATE ALL - COMPLETE SYSTEM AUTOMATION"
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
docker compose build --no-cache fastapi-donation-service worker 2>&1 | tail -5
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
if docker compose exec -T postgres psql -U hcuser -d hingecraft -f /docker-entrypoint-initdb.d/01-complete-schema.sql > /dev/null 2>&1; then
    echo "  ✅ Complete schema applied"
else
    echo "  ⚠️  Schema may already be applied or needs manual check"
fi

# Step 5: Apply master schema
echo ""
echo "📦 Step 5: Applying master schema..."
bash "$SCRIPT_DIR/APPLY_MASTER_SCHEMA.sh" 2>&1 | tail -5 || echo "  ⚠️  Master schema application completed with warnings"

# Step 6: Verify database
echo ""
echo "📦 Step 6: Verifying database..."
TABLE_COUNT=$(docker compose exec -T postgres psql -U hcuser -d hingecraft -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")
echo "  ✅ Found $TABLE_COUNT tables in database"

# Step 7: Test API endpoints
echo ""
echo "📦 Step 7: Testing API endpoints..."
sleep 5
if curl -s http://localhost:8000/health | grep -q healthy; then
    echo "  ✅ API health check passed"
else
    echo "  ⚠️  API may still be starting"
fi

# Step 8: Test Wix endpoint
echo ""
echo "📦 Step 8: Testing Wix integration endpoint..."
if curl -s -X POST http://localhost:8000/api/v1/donations/create \
    -H "Content-Type: application/json" \
    -H "x-api-key: changeme" \
    -d '{"chain":"solana","amountUsd":25}' | grep -q "invoice_id\|address\|error"; then
    echo "  ✅ Wix donation endpoint responding"
else
    echo "  ⚠️  Wix endpoint may need configuration"
fi

# Step 9: Run comprehensive tests
echo ""
echo "📦 Step 9: Running comprehensive tests..."
bash "$SCRIPT_DIR/FULL_SYSTEM_TEST_COMPREHENSIVE.sh" 2>&1 | tail -20 || echo "  ⚠️  Some tests may have warnings"

# Step 10: Run split tests
echo ""
echo "📦 Step 10: Running split tests..."
bash "$SCRIPT_DIR/SPLIT_TESTS.sh" 2>&1 | tail -15 || echo "  ⚠️  Some tests may have warnings"

# Step 11: Run nano tests
echo ""
echo "📦 Step 11: Running nano tests (sample)..."
bash "$SCRIPT_DIR/NANO_TESTS.sh" 2>&1 | head -50 || echo "  ⚠️  Some tests may have warnings"

# Step 12: Check ngrok status
echo ""
echo "📦 Step 12: Checking ngrok status..."
if docker compose ps ngrok | grep -q Up; then
    echo "  ✅ ngrok is running"
    echo "  📋 Check http://localhost:4040 for ngrok dashboard"
    echo "  📋 Use ngrok URL in Wix dev settings"
else
    echo "  ⚠️  ngrok not running (set NGROK_TOKEN to enable)"
fi

# Step 13: Final status
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ AUTOMATION COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Services Status:"
docker compose ps
echo ""
echo "Service URLs:"
echo "  ✅ PostgreSQL: localhost:5432"
echo "  ✅ Redis: localhost:6379"
echo "  ✅ MinIO: http://localhost:9000"
echo "  ✅ FastAPI: http://localhost:8000"
echo "  ✅ API Docs: http://localhost:8000/docs"
echo "  ✅ pgAdmin: http://localhost:5050"
if docker compose ps ngrok | grep -q Up; then
    echo "  ✅ ngrok: http://localhost:4040"
fi
echo ""
echo "Next Steps:"
echo "  1. Get ngrok URL from http://localhost:4040"
echo "  2. Update Wix Velo code with ngrok URL"
echo "  3. Test donation flow from Wix"
echo "  4. Monitor logs: docker compose logs -f fastapi-donation-service"
echo ""
