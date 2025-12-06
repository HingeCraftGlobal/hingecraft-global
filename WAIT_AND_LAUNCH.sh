#!/bin/bash
# Wait for Docker and Launch
# Waits for Docker Desktop to start, then launches everything

set +e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "═══════════════════════════════════════════════════════════"
echo "⏳ WAITING FOR DOCKER DESKTOP TO START"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Start Docker Desktop
echo "Starting Docker Desktop..."
open -a Docker 2>/dev/null

# Wait for Docker to be ready (max 60 seconds)
echo "Waiting for Docker daemon to start..."
MAX_WAIT=60
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if docker info &>/dev/null; then
        echo "✅ Docker daemon is running!"
        break
    fi
    echo "  ⏳ Waiting... ($WAITED/$MAX_WAIT seconds)"
    sleep 2
    WAITED=$((WAITED + 2))
done

if ! docker info &>/dev/null; then
    echo ""
    echo "❌ Docker daemon did not start within $MAX_WAIT seconds"
    echo "Please start Docker Desktop manually and run: ./MASTER_LAUNCH.sh"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🚀 DOCKER READY - LAUNCHING SYSTEM"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Run master launch
if [ -f "MASTER_LAUNCH.sh" ]; then
    bash MASTER_LAUNCH.sh
else
    echo "Running docker compose up -d..."
    docker compose up -d
fi

echo ""
echo "✅ Launch process complete!"
echo ""

