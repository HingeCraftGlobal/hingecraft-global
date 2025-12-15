#!/bin/bash
# Complete database segmentation automation
# Extracts, segments, and loads ALL HingeCraft data into structured tables

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HINGECRAFT_DIR="/Users/chandlerfergusen/Desktop/CURSOR/HingeCraft"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 COMPLETE DATABASE SEGMENTATION"
echo "═══════════════════════════════════════════════════════════"

# Detect Python environment
if [ -d "$PROJECT_ROOT/.venv" ]; then
    PYTHON_BIN="$PROJECT_ROOT/.venv/bin/python3"
    PIP_BIN="$PROJECT_ROOT/.venv/bin/pip"
elif [ -n "$VIRTUAL_ENV" ]; then
    PYTHON_BIN="$VIRTUAL_ENV/bin/python3"
    PIP_BIN="$VIRTUAL_ENV/bin/pip"
else
    PYTHON_BIN="python3"
    PIP_BIN="python3 -m pip"
fi

# Step 1: Install dependencies
echo ""
echo "📦 Step 1: Installing dependencies..."
$PIP_BIN install psycopg2-binary beautifulsoup4 requests --quiet 2>/dev/null || true

# Step 2: Start Docker database
echo ""
echo "📦 Step 2: Starting Docker database..."
cd "$HINGECRAFT_DIR"
if ! docker compose ps 2>/dev/null | grep -q "hingecraft-postgres.*Up"; then
    docker compose up -d
    sleep 10
fi

# Step 3: Wait for database health
echo ""
echo "📦 Step 3: Database health check..."
timeout=60
counter=0
while ! docker compose exec -T postgres pg_isready -U hingecraft_user -d hingecraft_db > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Database health check timeout"
        exit 1
    fi
    sleep 2
    counter=$((counter + 2))
done
echo "✅ Database is healthy"

# Step 4: Get database password
echo ""
echo "📦 Step 4: Setting database connection..."
if [ -f "$HINGECRAFT_DIR/.env" ]; then
    ENV_PASSWORD=$(grep "^DB_PASSWORD=" "$HINGECRAFT_DIR/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" || echo "")
    if [ -n "$ENV_PASSWORD" ]; then
        DB_PASSWORD="$ENV_PASSWORD"
    else
        DB_PASSWORD="hingecraft_secure_password_123"
    fi
else
    DB_PASSWORD="hingecraft_secure_password_123"
fi

export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=hingecraft_db
export DB_USER=hingecraft_user
export DB_PASSWORD

# Step 5: Apply schema updates
echo ""
echo "📦 Step 5: Applying schema updates..."
cd "$HINGECRAFT_DIR"
docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -f /docker-entrypoint-initdb.d/init.sql > /dev/null 2>&1 || echo "Schema already applied"

# Step 6: Extract data
echo ""
echo "📦 Step 6: Extracting data..."
cd "$PROJECT_ROOT"
$PYTHON_BIN scripts/extract_provided_data.py

# Step 7: Load segmented data
echo ""
echo "📦 Step 7: Loading segmented data..."
cd "$PROJECT_ROOT"
$PYTHON_BIN scripts/load_all_segmented_data.py

# Step 8: Verify
echo ""
echo "📦 Step 8: Verifying data..."
cd "$HINGECRAFT_DIR"
MEMBERS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM members;" 2>/dev/null | tr -d ' ' || echo "0")
CLUBS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM chat_clubs;" 2>/dev/null | tr -d ' ' || echo "0")
MESSAGES=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM chat_messages;" 2>/dev/null | tr -d ' ' || echo "0")

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ SEGMENTATION COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo "📊 Members: $MEMBERS"
echo "📊 Chat Clubs: $CLUBS"
echo "📊 Chat Messages: $MESSAGES"
echo "═══════════════════════════════════════════════════════════"

# Step 9: Restart adaptor
echo ""
echo "📦 Step 9: Restarting adaptor..."
cd "$HINGECRAFT_DIR"
docker compose restart db-adaptor
sleep 5

echo ""
echo "✅ Complete database segmentation finished!"
echo ""
echo "Next: Add SPI endpoints for new tables in database-adaptor/server.js"







