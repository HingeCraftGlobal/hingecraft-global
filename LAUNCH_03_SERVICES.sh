#!/bin/bash
# Launch 03: Services - Deploy All Docker Services
# Ensures all services are running and functional

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 LAUNCH 03: SERVICES - DEPLOY ALL DOCKER SERVICES"
echo "═══════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT"

# Step 1: Start all services
echo "📦 Step 1: Starting All Services..."
docker compose up -d
sleep 15

# Step 2: Verify PostgreSQL
echo ""
echo "📦 Step 2: Verifying PostgreSQL..."
if docker compose ps postgres | grep -q Up; then
    if docker compose exec -T postgres pg_isready -U hcuser > /dev/null 2>&1; then
        echo "  ✅ PostgreSQL: Running and healthy"
    else
        echo "  ⚠️  PostgreSQL: Running but not ready"
    fi
else
    echo "  ❌ PostgreSQL: Not running"
    exit 1
fi

# Step 3: Verify Redis
echo ""
echo "📦 Step 3: Verifying Redis..."
if docker compose ps redis | grep -q Up; then
    if docker compose exec -T redis redis-cli ping | grep -q PONG; then
        echo "  ✅ Redis: Running and responding"
    else
        echo "  ⚠️  Redis: Running but not responding"
    fi
else
    echo "  ❌ Redis: Not running"
    exit 1
fi

# Step 4: Verify MinIO
echo ""
echo "📦 Step 4: Verifying MinIO..."
if docker compose ps minio | grep -q Up; then
    if curl -s http://localhost:9000/minio/health/live > /dev/null 2>&1; then
        echo "  ✅ MinIO: Running and healthy"
    else
        echo "  ⚠️  MinIO: Running but health check failed"
    fi
else
    echo "  ❌ MinIO: Not running"
    exit 1
fi

# Step 5: Verify FastAPI
echo ""
echo "📦 Step 5: Verifying FastAPI..."
if docker compose ps fastapi-donation-service | grep -q Up; then
    sleep 5
    if curl -s http://localhost:8000/health | grep -q healthy; then
        echo "  ✅ FastAPI: Running and healthy"
    else
        echo "  ⚠️  FastAPI: Running but health check failed"
    fi
else
    echo "  ❌ FastAPI: Not running"
    exit 1
fi

# Step 6: Verify Worker
echo ""
echo "📦 Step 6: Verifying Celery Worker..."
if docker compose ps worker | grep -q Up; then
    echo "  ✅ Celery Worker: Running"
else
    echo "  ⚠️  Celery Worker: Not running"
fi

# Step 7: Verify pgAdmin
echo ""
echo "📦 Step 7: Verifying pgAdmin..."
if docker compose ps pgadmin | grep -q Up; then
    echo "  ✅ pgAdmin: Running"
else
    echo "  ⚠️  pgAdmin: Not running"
fi

# Step 8: Verify ngrok
echo ""
echo "📦 Step 8: Verifying ngrok..."
if docker compose ps ngrok | grep -q Up; then
    echo "  ✅ ngrok: Running"
    echo "  📋 Check http://localhost:4040 for ngrok URL"
else
    echo "  ⚠️  ngrok: Not running (set NGROK_TOKEN to enable)"
fi

# Step 9: Test API endpoints
echo ""
echo "📦 Step 9: Testing API Endpoints..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "  ✅ Health endpoint: Responding"
    
    # Test donations endpoint
    RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/donations/create \
        -H "Content-Type: application/json" \
        -H "x-api-key: changeme" \
        -d '{"chain":"solana","amountUsd":25}' 2>&1)
    
    if echo "$RESPONSE" | grep -q "invoice_id\|address\|error"; then
        echo "  ✅ Donations endpoint: Responding"
    else
        echo "  ⚠️  Donations endpoint: May need configuration"
    fi
else
    echo "  ❌ API endpoints: Not responding"
fi

# Final summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ SERVICES LAUNCH COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Service Status:"
docker compose ps
echo ""
echo "Service URLs:"
echo "  • PostgreSQL: localhost:5432"
echo "  • Redis: localhost:6379"
echo "  • MinIO: http://localhost:9000"
echo "  • FastAPI: http://localhost:8000"
echo "  • API Docs: http://localhost:8000/docs"
echo "  • pgAdmin: http://localhost:5050"
if docker compose ps ngrok | grep -q Up; then
    echo "  • ngrok: http://localhost:4040"
fi
echo ""

