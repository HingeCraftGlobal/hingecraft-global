#!/bin/bash
# Execute Full Launch - Complete Process
# This script executes the full launch process step by step

set +e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 EXECUTING FULL LAUNCH PROCESS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Step 1: Verify Readiness
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: VERIFY SYSTEM READINESS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "VERIFY_COMPLETE_READINESS.sh" ]; then
    bash VERIFY_COMPLETE_READINESS.sh
    VERIFY_STATUS=$?
    if [ $VERIFY_STATUS -ne 0 ]; then
        echo ""
        echo "⚠️  Verification found issues, but continuing..."
    fi
else
    echo "⚠️  VERIFY_COMPLETE_READINESS.sh not found, skipping verification"
fi
echo ""

# Step 2: Start Docker Desktop
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: START DOCKER DESKTOP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Attempting to start Docker Desktop..."
open -a Docker 2>/dev/null || echo "⚠️  Could not start Docker Desktop automatically"
echo "⏳ Waiting 10 seconds for Docker to start..."
sleep 10
echo ""

# Step 3: Check Docker Status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: CHECK DOCKER STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "CHECK_DOCKER.sh" ]; then
    bash CHECK_DOCKER.sh
    DOCKER_STATUS=$?
    if [ $DOCKER_STATUS -ne 0 ]; then
        echo ""
        echo "❌ Docker check failed. Please ensure Docker Desktop is running."
        echo "   Then run: ./MASTER_LAUNCH.sh"
        exit 1
    fi
else
    echo "⚠️  CHECK_DOCKER.sh not found, checking Docker manually..."
    if docker info &>/dev/null; then
        echo "✅ Docker daemon is running"
    else
        echo "❌ Docker daemon is not running"
        exit 1
    fi
fi
echo ""

# Step 4: Execute Master Launch
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: EXECUTE MASTER LAUNCH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "MASTER_LAUNCH.sh" ]; then
    echo "Running MASTER_LAUNCH.sh..."
    bash MASTER_LAUNCH.sh
    LAUNCH_STATUS=$?
    if [ $LAUNCH_STATUS -eq 0 ]; then
        echo ""
        echo "✅ Master launch completed successfully"
    else
        echo ""
        echo "⚠️  Master launch completed with warnings or errors"
    fi
else
    echo "⚠️  MASTER_LAUNCH.sh not found, using docker compose directly..."
    docker compose up -d
fi
echo ""

# Step 5: Verify Services
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: VERIFY SERVICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Checking service status..."
sleep 5
docker compose ps
echo ""

# Step 6: Health Checks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: HEALTH CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Checking FastAPI health..."
sleep 5
if curl -f http://localhost:8000/health &>/dev/null 2>&1; then
    echo "✅ FastAPI is healthy"
    curl -s http://localhost:8000/health | head -3
else
    echo "⚠️  FastAPI health check failed (may need more time to start)"
fi
echo ""

# Final Summary
echo "═══════════════════════════════════════════════════════════"
echo "🎉 FULL LAUNCH PROCESS COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Check service logs: docker compose logs -f"
echo "  2. Access FastAPI: http://localhost:8000"
echo "  3. Access pgAdmin: http://localhost:5050"
echo "  4. Check Wix pages: https://www.hingecraft-global.ai"
echo ""

