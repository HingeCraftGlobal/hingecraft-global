#!/bin/bash
# Verify Wix integration - test all endpoints and confirm readiness

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HINGECRAFT_DIR="/Users/chandlerfergusen/Desktop/CURSOR/HingeCraft"

# Get secret key
if [ -f "$HINGECRAFT_DIR/.env" ]; then
    SECRET_KEY=$(grep "^DB_PASSWORD\|^ADAPTOR_SECRET_KEY\|^SECRET_KEY" "$HINGECRAFT_DIR/.env" 2>/dev/null | head -1 | cut -d'=' -f2 | tr -d '"' | tr -d "'" || echo "")
fi
SECRET_KEY="${SECRET_KEY:-hingecraft_secret_key_change_in_production}"

echo "═══════════════════════════════════════════════════════════"
echo "🔍 VERIFYING WIX INTEGRATION"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Step 1: Check database
echo "📦 Step 1: Checking database..."
cd "$HINGECRAFT_DIR"
DONATIONS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM donations;" 2>/dev/null | tr -d ' ' || echo "0")
MEMBERS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM members;" 2>/dev/null | tr -d ' ' || echo "0")

echo "   ✅ Donations: $DONATIONS"
echo "   ✅ Members: $MEMBERS"
echo ""

# Step 2: Check adaptor health
echo "📦 Step 2: Checking adaptor health..."
ADAPTOR_HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null || echo "")
if echo "$ADAPTOR_HEALTH" | grep -q "healthy\|status"; then
    echo "   ✅ Adaptor is running"
else
    echo "   ⚠️  Adaptor health check returned: $ADAPTOR_HEALTH"
fi
echo ""

# Step 3: Test donations schema endpoint
echo "📦 Step 3: Testing donations schema endpoint..."
DONATIONS_SCHEMA=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
    http://localhost:3000/v1/collections/donations/schema 2>/dev/null || echo "")
if echo "$DONATIONS_SCHEMA" | grep -q "collection\|donations"; then
    echo "   ✅ Donations schema endpoint working"
else
    echo "   ⚠️  Donations schema check failed"
    echo "   Response: ${DONATIONS_SCHEMA:0:200}"
fi
echo ""

# Step 4: Test donations items endpoint
echo "📦 Step 4: Testing donations items endpoint..."
DONATIONS_ITEMS=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
    "http://localhost:3000/v1/collections/donations/items?limit=3" 2>/dev/null || echo "")
if echo "$DONATIONS_ITEMS" | grep -q "items\|totalCount"; then
    ITEM_COUNT=$(echo "$DONATIONS_ITEMS" | grep -o '"totalCount":[0-9]*' | cut -d':' -f2 || echo "0")
    echo "   ✅ Donations items endpoint working (totalCount: $ITEM_COUNT)"
else
    echo "   ⚠️  Donations items check failed"
    echo "   Response: ${DONATIONS_ITEMS:0:200}"
fi
echo ""

# Step 5: Test members schema endpoint
echo "📦 Step 5: Testing members schema endpoint..."
MEMBERS_SCHEMA=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
    http://localhost:3000/v1/collections/members/schema 2>/dev/null || echo "")
if echo "$MEMBERS_SCHEMA" | grep -q "collection\|members"; then
    echo "   ✅ Members schema endpoint working"
else
    echo "   ⚠️  Members schema check failed"
    echo "   Response: ${MEMBERS_SCHEMA:0:200}"
fi
echo ""

# Step 6: Test members items endpoint
echo "📦 Step 6: Testing members items endpoint..."
MEMBERS_ITEMS=$(curl -s -H "Authorization: Bearer $SECRET_KEY" \
    "http://localhost:3000/v1/collections/members/items?limit=5" 2>/dev/null || echo "")
if echo "$MEMBERS_ITEMS" | grep -q "items\|totalCount"; then
    MEMBER_COUNT=$(echo "$MEMBERS_ITEMS" | grep -o '"totalCount":[0-9]*' | cut -d':' -f2 || echo "0")
    echo "   ✅ Members items endpoint working (totalCount: $MEMBER_COUNT)"
    echo "   Sample member data:"
    echo "$MEMBERS_ITEMS" | python3 -m json.tool 2>/dev/null | head -20 || echo "$MEMBERS_ITEMS" | head -10
else
    echo "   ⚠️  Members items check failed"
    echo "   Response: ${MEMBERS_ITEMS:0:200}"
fi
echo ""

# Step 7: Check wix dev status
echo "📦 Step 7: Checking wix dev status..."
if pgrep -f "wix dev" > /dev/null; then
    echo "   ✅ wix dev is running"
    if [ -f "$PROJECT_ROOT/wix-dev.log" ]; then
        echo "   Recent logs:"
        tail -5 "$PROJECT_ROOT/wix-dev.log" 2>/dev/null | sed 's/^/      /' || echo "      (no recent logs)"
    fi
else
    echo "   ⚠️  wix dev is not running"
    echo "   Start with: cd $PROJECT_ROOT && NODE_TLS_REJECT_UNAUTHORIZED=0 wix dev"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════"
echo "📊 VERIFICATION SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo "Database:"
echo "  Donations: $DONATIONS"
echo "  Members: $MEMBERS"
echo ""
echo "Adaptor:"
echo "  Health: $(if [ -n "$ADAPTOR_HEALTH" ]; then echo "✅ Running"; else echo "⚠️  Not responding"; fi)"
echo "  Donations Schema: $(if echo "$DONATIONS_SCHEMA" | grep -q "collection"; then echo "✅"; else echo "⚠️"; fi)"
echo "  Donations Items: $(if echo "$DONATIONS_ITEMS" | grep -q "items"; then echo "✅"; else echo "⚠️"; fi)"
echo "  Members Schema: $(if echo "$MEMBERS_SCHEMA" | grep -q "collection"; then echo "✅"; else echo "⚠️"; fi)"
echo "  Members Items: $(if echo "$MEMBERS_ITEMS" | grep -q "items"; then echo "✅"; else echo "⚠️"; fi)"
echo ""
echo "Wix Dev:"
echo "  Status: $(if pgrep -f "wix dev" > /dev/null; then echo "✅ Running"; else echo "⚠️  Not running"; fi)"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🔗 Next Steps:"
echo "1. Open Wix Editor"
echo "2. Navigate to: Database → External Database → HingeCraftDonationsDB"
echo "3. Verify members collection appears with $MEMBERS records"
echo "4. Test Payment → Charter → Checkout flow"
echo ""
echo "═══════════════════════════════════════════════════════════"







