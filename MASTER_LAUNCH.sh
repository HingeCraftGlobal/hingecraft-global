#!/bin/bash
# Master Launch Script - Complete System Launch with Pre-checks
# This script checks Docker, then launches everything

set +e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 MASTER LAUNCH - HINGECRAFT COMPLETE SYSTEM"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Step 0: Check Docker
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 0: DOCKER PRE-CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "CHECK_DOCKER.sh" ]; then
    bash CHECK_DOCKER.sh
    DOCKER_STATUS=$?
    if [ $DOCKER_STATUS -ne 0 ]; then
        echo ""
        echo "❌ Docker check failed. Please start Docker Desktop and try again."
        echo ""
        exit 1
    fi
else
    echo "⚠️  CHECK_DOCKER.sh not found, skipping Docker check"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "LAUNCHING COMPLETE SYSTEM..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Choose launch method
if [ -f "LAUNCH_BREAKDOWN.sh" ]; then
    echo "Using detailed breakdown launch..."
    bash LAUNCH_BREAKDOWN.sh
elif [ -f "LAUNCH_ALL.sh" ]; then
    echo "Using standard launch..."
    bash LAUNCH_ALL.sh
else
    echo "⚠️  No launch script found, using docker compose directly..."
    docker compose up -d
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 MASTER LAUNCH COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Check service status: docker compose ps"
echo "  2. View logs: docker compose logs -f"
echo "  3. Test API: curl http://localhost:8000/health"
echo "  4. Access pgAdmin: http://localhost:5050"
echo ""


