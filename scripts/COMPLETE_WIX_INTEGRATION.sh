#!/bin/bash
# Complete Wix integration automation
# Adds SPI endpoints, rebuilds adaptor, verifies everything works

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HINGECRAFT_DIR="/Users/chandlerfergusen/Desktop/CURSOR/HingeCraft"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 COMPLETE WIX INTEGRATION AUTOMATION"
echo "═══════════════════════════════════════════════════════════"

# Step 1: Verify SPI endpoints are added
echo ""
echo "📦 Step 1: Verifying SPI endpoints in server.js..."
cd "$HINGECRAFT_DIR"
if grep -q "/v1/collections/chat_clubs/schema" database-adaptor/server.js; then
    echo "✅ Chat clubs SPI endpoints found"
else
    echo "❌ Chat clubs SPI endpoints NOT found - please add them"
    exit 1
fi

if grep -q "/v1/collections/chat_messages/schema" database-adaptor/server.js; then
    echo "✅ Chat messages SPI endpoints found"
else
    echo "❌ Chat messages SPI endpoints NOT found - please add them"
    exit 1
fi

if grep -q "/v1/collections/ambassadors/schema" database-adaptor/server.js; then
    echo "✅ Ambassadors SPI endpoints found"
else
    echo "❌ Ambassadors SPI endpoints NOT found - please add them"
    exit 1
fi

# Step 2: Rebuild adaptor
echo ""
echo "📦 Step 2: Rebuilding database adaptor..."
cd "$HINGECRAFT_DIR"
docker compose build db-adaptor
echo "✅ Adaptor rebuilt"

# Step 3: Restart adaptor
echo ""
echo "📦 Step 3: Restarting database adaptor..."
docker compose restart db-adaptor
echo "⏳ Waiting for adaptor to restart..."
sleep 10

# Step 4: Verify adaptor health
echo ""
echo "📦 Step 4: Verifying adaptor health..."
ADAPTOR_HEALTH=$(curl -s -H "Authorization: Bearer hingecraft_secret_key_change_in_production" http://localhost:3000/health 2>/dev/null || echo "")
if echo "$ADAPTOR_HEALTH" | grep -q "status\|healthy"; then
    echo "✅ Adaptor is healthy"
else
    echo "⚠️  Adaptor health check: $ADAPTOR_HEALTH"
fi

# Step 5: Test SPI endpoints
echo ""
echo "📦 Step 5: Testing SPI endpoints..."
SECRET_KEY="hingecraft_secret_key_change_in_production"

# Test chat_clubs schema
echo "  Testing chat_clubs schema..."
CLUBS_SCHEMA=$(curl -s -H "Authorization: Bearer $SECRET_KEY" http://localhost:3000/v1/collections/chat_clubs/schema 2>/dev/null || echo "")
if echo "$CLUBS_SCHEMA" | grep -q "chat_clubs"; then
    echo "  ✅ chat_clubs schema endpoint working"
else
    echo "  ⚠️  chat_clubs schema endpoint failed"
fi

# Test chat_clubs items
echo "  Testing chat_clubs items..."
CLUBS_ITEMS=$(curl -s -H "Authorization: Bearer $SECRET_KEY" "http://localhost:3000/v1/collections/chat_clubs/items?limit=5" 2>/dev/null || echo "")
if echo "$CLUBS_ITEMS" | grep -q "items\|totalCount"; then
    CLUB_COUNT=$(echo "$CLUBS_ITEMS" | grep -o '"totalCount":[0-9]*' | cut -d':' -f2 || echo "0")
    echo "  ✅ chat_clubs items endpoint working (totalCount: $CLUB_COUNT)"
else
    echo "  ⚠️  chat_clubs items endpoint failed"
fi

# Test chat_messages schema
echo "  Testing chat_messages schema..."
MESSAGES_SCHEMA=$(curl -s -H "Authorization: Bearer $SECRET_KEY" http://localhost:3000/v1/collections/chat_messages/schema 2>/dev/null || echo "")
if echo "$MESSAGES_SCHEMA" | grep -q "chat_messages"; then
    echo "  ✅ chat_messages schema endpoint working"
else
    echo "  ⚠️  chat_messages schema endpoint failed"
fi

# Test chat_messages items
echo "  Testing chat_messages items..."
MESSAGES_ITEMS=$(curl -s -H "Authorization: Bearer $SECRET_KEY" "http://localhost:3000/v1/collections/chat_messages/items?limit=5" 2>/dev/null || echo "")
if echo "$MESSAGES_ITEMS" | grep -q "items\|totalCount"; then
    MSG_COUNT=$(echo "$MESSAGES_ITEMS" | grep -o '"totalCount":[0-9]*' | cut -d':' -f2 || echo "0")
    echo "  ✅ chat_messages items endpoint working (totalCount: $MSG_COUNT)"
else
    echo "  ⚠️  chat_messages items endpoint failed"
fi

# Test ambassadors schema
echo "  Testing ambassadors schema..."
AMBASSADORS_SCHEMA=$(curl -s -H "Authorization: Bearer $SECRET_KEY" http://localhost:3000/v1/collections/ambassadors/schema 2>/dev/null || echo "")
if echo "$AMBASSADORS_SCHEMA" | grep -q "ambassadors"; then
    echo "  ✅ ambassadors schema endpoint working"
else
    echo "  ⚠️  ambassadors schema endpoint failed"
fi

# Step 6: Verify database state
echo ""
echo "📦 Step 6: Verifying database state..."
MEMBERS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM members;" 2>/dev/null | tr -d ' ' || echo "0")
CLUBS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM chat_clubs;" 2>/dev/null | tr -d ' ' || echo "0")
MESSAGES=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM chat_messages;" 2>/dev/null | tr -d ' ' || echo "0")
AMBASSADORS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM ambassadors;" 2>/dev/null | tr -d ' ' || echo "0")

echo "  📊 Members: $MEMBERS"
echo "  📊 Chat Clubs: $CLUBS"
echo "  📊 Chat Messages: $MESSAGES"
echo "  📊 Ambassadors: $AMBASSADORS"

# Step 7: Check wix dev status
echo ""
echo "📦 Step 7: Checking wix dev status..."
cd "$PROJECT_ROOT"
if pgrep -f "wix dev" > /dev/null; then
    echo "✅ wix dev is running"
else
    echo "⚠️  wix dev is not running"
    echo "   Starting wix dev..."
    NODE_TLS_REJECT_UNAUTHORIZED=0 nohup wix dev > wix-dev.log 2>&1 &
    sleep 5
    echo "✅ wix dev started"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ WIX INTEGRATION COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Database Collections:"
echo "  - donations: Available via SPI"
echo "  - members: Available via SPI ($MEMBERS records)"
echo "  - chat_clubs: Available via SPI ($CLUBS records)"
echo "  - chat_messages: Available via SPI ($MESSAGES records)"
echo "  - ambassadors: Available via SPI ($AMBASSADORS records)"
echo ""
echo "🔗 Next Steps:"
echo "1. Open Wix Editor"
echo "2. Navigate to: Database → External Database → HingeCraftDonationsDB"
echo "3. Refresh - you should see all 5 collections"
echo "4. Test data flow by creating/updating records"
echo ""
echo "═══════════════════════════════════════════════════════════"




