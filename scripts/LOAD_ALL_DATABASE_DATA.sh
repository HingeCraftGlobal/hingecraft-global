#!/bin/bash
# Load all database data and ensure Wix integration is functional

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HINGECRAFT_DIR="/Users/chandlerfergusen/Desktop/CURSOR/HingeCraft"
DB_USER="hingecraft_user"
DB_NAME="hingecraft_db"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 LOADING ALL DATABASE DATA AND VERIFYING WIX INTEGRATION"
echo "═══════════════════════════════════════════════════════════"

# Step 1: Ensure database is running
echo ""
echo "📦 Step 1: Ensuring database is running..."
cd "$PROJECT_ROOT"
docker compose up -d db
sleep 5

# Step 2: Check database health
echo ""
echo "📦 Step 2: Checking database health..."
for i in {1..30}; do
    if docker compose exec -T db pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        echo "✅ Database is healthy"
        break
    fi
    sleep 1
done

# Step 3: Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=hingecraft_db
export DB_USER=hingecraft_user
export DB_PASSWORD=hingecraft_secure_password_123

# Step 4: Load all data
echo ""
echo "📦 Step 4: Loading all database data..."

# Load registry/members data
if [ -f "$PROJECT_ROOT/scripts/load_all_hingecraft_data.py" ]; then
    echo "  Loading members/registry data..."
    python3 "$PROJECT_ROOT/scripts/load_all_hingecraft_data.py" 2>&1 | grep -E "(✅|❌|Error|Successfully)" || true
fi

# Load segmented data (chat clubs, messages, ambassadors)
if [ -f "$PROJECT_ROOT/scripts/load_all_segmented_data.py" ]; then
    echo "  Loading segmented data..."
    python3 "$PROJECT_ROOT/scripts/load_all_segmented_data.py" 2>&1 | grep -E "(✅|❌|Error|Successfully)" || true
fi

# Step 5: Verify data loaded
echo ""
echo "📦 Step 5: Verifying data loaded..."
echo "  Checking record counts..."

DONATIONS=$(docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM donations;" 2>/dev/null | tr -d ' ' || echo "0")
MEMBERS=$(docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM members;" 2>/dev/null | tr -d ' ' || echo "0")
CHAT_CLUBS=$(docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM chat_clubs;" 2>/dev/null | tr -d ' ' || echo "0")
CHAT_MESSAGES=$(docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM chat_messages;" 2>/dev/null | tr -d ' ' || echo "0")
AMBASSADORS=$(docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM ambassadors;" 2>/dev/null | tr -d ' ' || echo "0")

echo "  📊 Donations: $DONATIONS"
echo "  📊 Members: $MEMBERS"
echo "  📊 Chat Clubs: $CHAT_CLUBS"
echo "  📊 Chat Messages: $CHAT_MESSAGES"
echo "  📊 Ambassadors: $AMBASSADORS"

# Step 6: Verify database adaptor has all SPI endpoints
echo ""
echo "📦 Step 6: Verifying database adaptor SPI endpoints..."
cd "$HINGECRAFT_DIR"

REQUIRED_ENDPOINTS=(
    "/v1/collections/donations/schema"
    "/v1/collections/donations/items"
    "/v1/collections/members/schema"
    "/v1/collections/members/items"
    "/v1/collections/chat_clubs/schema"
    "/v1/collections/chat_clubs/items"
    "/v1/collections/chat_messages/schema"
    "/v1/collections/chat_messages/items"
    "/v1/collections/ambassadors/schema"
    "/v1/collections/ambassadors/items"
)

ALL_ENDPOINTS_PRESENT=true
for endpoint in "${REQUIRED_ENDPOINTS[@]}"; do
    if grep -q "$endpoint" database-adaptor/server.js 2>/dev/null; then
        echo "  ✅ $endpoint found"
    else
        echo "  ❌ $endpoint NOT FOUND"
        ALL_ENDPOINTS_PRESENT=false
    fi
done

# Step 7: Rebuild and restart adaptor if needed
if [ "$ALL_ENDPOINTS_PRESENT" = true ]; then
    echo ""
    echo "📦 Step 7: Rebuilding and restarting database adaptor..."
    docker compose build db-adaptor 2>&1 | tail -5
    docker compose restart db-adaptor
    echo "⏳ Waiting for adaptor to restart..."
    sleep 10
    
    # Check adaptor health
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "  ✅ Adaptor is healthy"
    else
        echo "  ⚠️  Adaptor health check failed (may need ngrok)"
    fi
else
    echo ""
    echo "⚠️  Some SPI endpoints are missing. Please update database-adaptor/server.js"
fi

# Step 8: Verify Wix dev status
echo ""
echo "📦 Step 8: Checking Wix dev status..."
if pgrep -f "wix dev" > /dev/null; then
    echo "  ✅ Wix dev is running"
else
    echo "  ⚠️  Wix dev is not running. Start with: cd $PROJECT_ROOT && NODE_TLS_REJECT_UNAUTHORIZED=0 wix dev"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ DATABASE DATA LOADING COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "  • Donations: $DONATIONS records"
echo "  • Members: $MEMBERS records"
echo "  • Chat Clubs: $CHAT_CLUBS records"
echo "  • Chat Messages: $CHAT_MESSAGES records"
echo "  • Ambassadors: $AMBASSADORS records"
echo ""
echo "🔗 Next Steps:"
echo "  1. Ensure ngrok is running: ngrok http 3000"
echo "  2. Update Wix Secrets Manager with ngrok URL"
echo "  3. Verify Wix SPI endpoints are accessible"
echo "  4. Test data sync in Wix Editor"
echo ""





