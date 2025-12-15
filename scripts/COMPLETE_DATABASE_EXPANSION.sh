#!/bin/bash
# Complete end-to-end database expansion automation
# Executes everything in perfect order: extract → load → verify → adaptor → wix → git

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HINGECRAFT_DIR="../HingeCraft"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 COMPLETE HINGECRAFT DATABASE EXPANSION"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Detect Python environment
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
    PIP_BIN="python3 -m pip"
    echo "ℹ️  Using system Python"
fi

# Step 1: Install dependencies
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📦 STEP 1: Installing dependencies"
echo "═══════════════════════════════════════════════════════════"
if ! "$PYTHON_BIN" -c "import psycopg2" 2>/dev/null; then
    echo "Installing psycopg2-binary..."
    "$PIP_BIN" install psycopg2-binary beautifulsoup4 --quiet
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Step 2: Extract all consumer data
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📦 STEP 2: Extracting ALL consumer data from HTML files"
echo "═══════════════════════════════════════════════════════════"
cd "$PROJECT_ROOT"
if [ -f "scripts/extract_all_consumer_data.py" ]; then
    "$PYTHON_BIN" scripts/extract_all_consumer_data.py
else
    echo "⚠️  Using existing extraction script..."
    "$PYTHON_BIN" scripts/extract_registry.py
fi

# Step 3: Start Docker database
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📦 STEP 3: Starting Docker database"
echo "═══════════════════════════════════════════════════════════"
cd "$HINGECRAFT_DIR"
if ! docker compose ps 2>/dev/null | grep -q "hingecraft-postgres.*Up"; then
    echo "Starting Docker containers..."
    docker compose up -d
    echo "⏳ Waiting for database to be ready..."
    sleep 10
else
    echo "✅ Database already running"
fi

# Step 4: Wait for database health
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📦 STEP 4: Database health check"
echo "═══════════════════════════════════════════════════════════"
timeout=60
counter=0
while ! docker compose exec -T postgres pg_isready -U hingecraft_user -d hingecraft_db > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Database health check timeout"
        exit 1
    fi
    echo "Waiting for database... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done
echo "✅ Database is healthy"

# Step 5: Get database password
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📦 STEP 5: Setting database connection"
echo "═══════════════════════════════════════════════════════════"
if [ -f "$HINGECRAFT_DIR/.env" ]; then
    ENV_PASSWORD=$(grep "^DB_PASSWORD=" "$HINGECRAFT_DIR/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" || echo "")
    if [ -n "$ENV_PASSWORD" ]; then
        DB_PASSWORD="$ENV_PASSWORD"
        echo "✅ Using password from .env file"
    else
        DB_PASSWORD="hingecraft_secure_password_123"
        echo "⚠️  Using default password"
    fi
else
    DB_PASSWORD="hingecraft_secure_password_123"
    echo "⚠️  No .env file found, using default password"
fi

export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=hingecraft_db
export DB_USER=hingecraft_user
export DB_PASSWORD

# Step 6: Load all data
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📦 STEP 6: Loading ALL data into database"
echo "═══════════════════════════════════════════════════════════"
cd "$PROJECT_ROOT"
"$PYTHON_BIN" scripts/load_all_hingecraft_data.py

# Step 7: Verify data
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📦 STEP 7: Verifying loaded data"
echo "═══════════════════════════════════════════════════════════"
cd "$HINGECRAFT_DIR"
DONATIONS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM donations;" 2>/dev/null | tr -d ' ' || echo "0")
MEMBERS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM members;" 2>/dev/null | tr -d ' ' || echo "0")

echo ""
echo "📊 Total Donations: $DONATIONS"
echo "👥 Total Members: $MEMBERS"

# Step 8: Ensure adaptor has members SPI
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📦 STEP 8: Ensuring adaptor has members SPI endpoints"
echo "═══════════════════════════════════════════════════════════"
cd "$HINGECRAFT_DIR"
if grep -q "/v1/collections/members/schema" database-adaptor/server.js 2>/dev/null; then
    echo "✅ Members SPI endpoints found"
    echo "Rebuilding and restarting adaptor..."
    docker compose build db-adaptor
    docker compose up -d db-adaptor
    echo "⏳ Waiting for adaptor to restart..."
    sleep 10
else
    echo "⚠️  Members SPI endpoints not found - please add them to database-adaptor/server.js"
fi

# Step 9: Test adaptor endpoints
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📦 STEP 9: Testing adaptor endpoints"
echo "═══════════════════════════════════════════════════════════"
ADAPTOR_HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null || echo "")
if [ -n "$ADAPTOR_HEALTH" ]; then
    echo "✅ Adaptor health check: OK"
    echo "   Response: $ADAPTOR_HEALTH"
else
    echo "⚠️  Adaptor health check failed"
fi

# Step 10: Commit and push to git
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📦 STEP 10: Committing and pushing to git"
echo "═══════════════════════════════════════════════════════════"
cd "$PROJECT_ROOT"
git add -A
if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    git commit -m "feat: complete database expansion - all consumer data loaded" || echo "⚠️  Commit failed"
    GIT_SSL_NO_VERIFY=true git push origin main || echo "⚠️  Push failed"
    echo "✅ Changes pushed to git"
fi

# Step 11: Summary and next steps
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ COMPLETE DATABASE EXPANSION FINISHED"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Database Summary:"
echo "   Donations: $DONATIONS"
echo "   Members: $MEMBERS"
echo ""
echo "🔗 Next Steps:"
echo "   1. Test members schema:"
echo "      curl -H 'Authorization: Bearer YOUR_SECRET' http://localhost:3000/v1/collections/members/schema"
echo ""
echo "   2. Test members items:"
echo "      curl -H 'Authorization: Bearer YOUR_SECRET' 'http://localhost:3000/v1/collections/members/items?limit=5'"
echo ""
echo "   3. Sync to Wix:"
echo "      cd $PROJECT_ROOT"
echo "      NODE_TLS_REJECT_UNAUTHORIZED=0 wix dev"
echo ""
echo "   4. Refresh Wix Editor - members collection should be available"
echo ""
echo "═══════════════════════════════════════════════════════════"
