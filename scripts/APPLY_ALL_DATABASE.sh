#!/bin/bash
# Master script to apply ALL HingeCraft database data
# Loads donations and members from all sources

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HINGECRAFT_DIR="/Users/chandlerfergusen/Desktop/CURSOR/HingeCraft"

echo "🚀 Applying ALL HingeCraft Database Data"
echo "=========================================="

# Detect Python environment (venv or system)
if [ -d "$PROJECT_ROOT/.venv" ]; then
    PYTHON_BIN="$PROJECT_ROOT/.venv/bin/python3"
    PIP_BIN="$PROJECT_ROOT/.venv/bin/pip"
    echo "✅ Using virtual environment: .venv"
elif [ -n "$VIRTUAL_ENV" ]; then
    PYTHON_BIN="$VIRTUAL_ENV/bin/python3"
    PIP_BIN="$VIRTUAL_ENV/bin/pip"
    echo "✅ Using virtual environment: $VIRTUAL_ENV"
else
    PYTHON_BIN="python3"
    PIP_BIN="pip3"
    echo "ℹ️  Using system Python"
fi

# Step 0: Ensure psycopg2-binary is installed
echo ""
echo "📦 Step 0: Checking psycopg2-binary..."
if ! "$PYTHON_BIN" -c "import psycopg2" 2>/dev/null; then
    echo "Installing psycopg2-binary..."
    "$PIP_BIN" install psycopg2-binary --quiet
    echo "✅ psycopg2-binary installed"
else
    echo "✅ psycopg2-binary already installed"
fi

# Step 1: Start Docker database (if not running)
echo ""
echo "📦 Step 1: Starting Docker database..."
cd "$HINGECRAFT_DIR"
if ! docker compose ps 2>/dev/null | grep -q "hingecraft-postgres.*Up"; then
    echo "Starting Docker containers..."
    docker compose up -d
    echo "⏳ Waiting for database to be ready..."
    sleep 5
else
    echo "✅ Database already running"
fi

# Step 2: Wait for database to be healthy
echo ""
echo "📦 Step 2: Waiting for database health check..."
timeout=30
counter=0
while ! docker compose exec -T postgres pg_isready -U hingecraft_user -d hingecraft_db > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Database health check timeout"
        exit 1
    fi
    echo "Waiting for database... ($counter/$timeout)"
    sleep 1
    counter=$((counter + 1))
done
echo "✅ Database is healthy"

# Step 3: Set environment variables
echo ""
echo "📦 Step 3: Setting database connection..."
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=hingecraft_db
export DB_USER=hingecraft_user
export DB_PASSWORD=hingecraft_secure_password_123

# Step 4: Run master load script
echo ""
echo "📦 Step 4: Loading all data..."
cd "$PROJECT_ROOT"
"$PYTHON_BIN" scripts/load_all_hingecraft_data.py

# Step 5: Verify data loaded
echo ""
echo "📦 Step 5: Verifying data..."
cd "$HINGECRAFT_DIR"
DONATIONS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM donations;" | tr -d ' ')
MEMBERS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM members;" | tr -d ' ')

echo ""
echo "="*60
echo "✅ DATABASE LOAD COMPLETE"
echo "="*60
echo "📊 Total Donations: $DONATIONS"
echo "👥 Total Members: $MEMBERS"
echo "="*60

# Step 6: Ensure adaptor has members SPI endpoints
echo ""
echo "📦 Step 6: Ensuring adaptor has members SPI endpoints..."
cd "$HINGECRAFT_DIR"
# Check if server.js has members endpoints
if grep -q "/v1/collections/members/schema" database-adaptor/server.js 2>/dev/null; then
    echo "✅ Members SPI endpoints found in adaptor"
    echo "Restarting database adaptor..."
    docker compose restart db-adaptor
    echo "⏳ Waiting for adaptor to restart..."
    sleep 5
else
    echo "⚠️  Members SPI endpoints not found in adaptor/server.js"
    echo "Please ensure HingeCraft/database-adaptor/server.js has members endpoints"
    echo "See: scripts/load_all_hingecraft_data.py for reference"
fi

# Step 7: Verify data loaded
echo ""
echo "📦 Step 7: Verifying data..."
cd "$HINGECRAFT_DIR"
DONATIONS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM donations;" 2>/dev/null | tr -d ' ' || echo "0")
MEMBERS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM members;" 2>/dev/null | tr -d ' ' || echo "0")

echo ""
echo "=========================================="
echo "✅ DATABASE LOAD COMPLETE"
echo "=========================================="
echo "📊 Total Donations: $DONATIONS"
echo "👥 Total Members: $MEMBERS"
echo "=========================================="

# Step 8: Test adaptor endpoints
echo ""
echo "📦 Step 8: Testing adaptor endpoints..."
ADAPTOR_HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null || echo "")
if [ -n "$ADAPTOR_HEALTH" ]; then
    echo "✅ Adaptor health check: OK"
else
    echo "⚠️  Adaptor health check failed - ensure adaptor is running"
fi

echo ""
echo "✅ All HingeCraft data applied successfully!"
echo ""
echo "Next steps:"
echo "1. Verify adaptor: curl http://localhost:3000/health"
echo "2. Test members schema: curl -H 'Authorization: Bearer YOUR_SECRET' http://localhost:3000/v1/collections/members/schema"
echo "3. Test members items: curl -H 'Authorization: Bearer YOUR_SECRET' 'http://localhost:3000/v1/collections/members/items?limit=5'"
echo "4. Sync to Wix: cd $PROJECT_ROOT && NODE_TLS_REJECT_UNAUTHORIZED=0 wix dev"
echo "5. Refresh Wix Editor - members collection should be available"

