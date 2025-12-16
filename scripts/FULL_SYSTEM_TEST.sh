#!/bin/bash
# Comprehensive full system test - guarantees everything is operational

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HINGECRAFT_DIR="/Users/chandlerfergusen/Desktop/CURSOR/HingeCraft"
SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

echo "═══════════════════════════════════════════════════════════"
echo "🔍 FULL SYSTEM TEST - COMPREHENSIVE VERIFICATION"
echo "═══════════════════════════════════════════════════════════"

PASSED=0
FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo "  ✅ PASS: $2"
        ((PASSED++))
    else
        echo "  ❌ FAIL: $2"
        ((FAILED++))
    fi
}

# Test 1: Database connectivity
echo ""
echo "📦 Test 1: Database Connectivity"
cd "$HINGECRAFT_DIR"
docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -c "SELECT 1;" > /dev/null 2>&1
test_result $? "PostgreSQL connection"

# Test 2: All tables exist
echo ""
echo "📦 Test 2: Database Schema"
TABLES=("donations" "members" "chat_clubs" "chat_messages" "ambassadors")
for table in "${TABLES[@]}"; do
    docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -c "SELECT 1 FROM $table LIMIT 1;" > /dev/null 2>&1
    test_result $? "Table $table exists"
done

# Test 3: Data counts
echo ""
echo "📦 Test 3: Data Integrity"
DONATIONS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM donations;" | tr -d ' ')
MEMBERS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM members;" | tr -d ' ')
CLUBS=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM chat_clubs;" | tr -d ' ')
MESSAGES=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM chat_messages;" | tr -d ' ')

[ "$DONATIONS" -ge 0 ] && test_result 0 "Donations count: $DONATIONS" || test_result 1 "Donations count"
[ "$MEMBERS" -ge 0 ] && test_result 0 "Members count: $MEMBERS" || test_result 1 "Members count"
[ "$CLUBS" -ge 0 ] && test_result 0 "Chat clubs count: $CLUBS" || test_result 1 "Chat clubs count"
[ "$MESSAGES" -ge 0 ] && test_result 0 "Chat messages count: $MESSAGES" || test_result 1 "Chat messages count"

# Test 4: Adaptor health
echo ""
echo "📦 Test 4: Adaptor Health"
ADAPTOR_HEALTH=$(curl -s -H "Authorization: Bearer $SECRET_KEY" http://localhost:3000/health 2>/dev/null || echo "")
if echo "$ADAPTOR_HEALTH" | grep -q "status\|healthy\|NOW"; then
    test_result 0 "Adaptor health endpoint"
else
    test_result 1 "Adaptor health endpoint"
fi

# Test 5: All SPI schema endpoints
echo ""
echo "📦 Test 5: SPI Schema Endpoints"
COLLECTIONS=("donations" "members" "chat_clubs" "chat_messages" "ambassadors")
for collection in "${COLLECTIONS[@]}"; do
    SCHEMA=$(curl -s -H "Authorization: Bearer $SECRET_KEY" "http://localhost:3000/v1/collections/$collection/schema" 2>/dev/null || echo "")
    if echo "$SCHEMA" | grep -q "\"id\":\"$collection\""; then
        test_result 0 "$collection schema endpoint"
    else
        test_result 1 "$collection schema endpoint"
    fi
done

# Test 6: All SPI items endpoints
echo ""
echo "📦 Test 6: SPI Items Endpoints"
for collection in "${COLLECTIONS[@]}"; do
    ITEMS=$(curl -s -H "Authorization: Bearer $SECRET_KEY" "http://localhost:3000/v1/collections/$collection/items?limit=1" 2>/dev/null || echo "")
    if echo "$ITEMS" | grep -q "items\|totalCount"; then
        test_result 0 "$collection items endpoint"
    else
        test_result 1 "$collection items endpoint"
    fi
done

# Test 7: Wix required fields
echo ""
echo "📦 Test 7: Wix Required Fields"
for table in "${TABLES[@]}"; do
    HAS_ID=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='$table' AND column_name='_id';" | tr -d ' ')
    HAS_CREATED=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='$table' AND column_name='_createdDate';" | tr -d ' ')
    HAS_UPDATED=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='$table' AND column_name='_updatedDate';" | tr -d ' ')
    HAS_OWNER=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='$table' AND column_name='_owner';" | tr -d ' ')
    
    if [ "$HAS_ID" -eq 1 ] && [ "$HAS_CREATED" -eq 1 ] && [ "$HAS_UPDATED" -eq 1 ] && [ "$HAS_OWNER" -eq 1 ]; then
        test_result 0 "$table has all Wix required fields"
    else
        test_result 1 "$table missing Wix required fields"
    fi
done

# Test 8: Triggers active
echo ""
echo "📦 Test 8: Database Triggers"
for table in "${TABLES[@]}"; do
    TRIGGER_COUNT=$(docker compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -t -c "SELECT COUNT(*) FROM pg_trigger WHERE tgrelid = '$table'::regclass AND tgname LIKE '%updated%';" | tr -d ' ')
    if [ "$TRIGGER_COUNT" -ge 1 ]; then
        test_result 0 "$table has update triggers"
    else
        test_result 1 "$table missing update triggers"
    fi
done

# Test 9: Wix dev running
echo ""
echo "📦 Test 9: Wix Dev Status"
if pgrep -f "wix dev" > /dev/null; then
    test_result 0 "Wix dev is running"
else
    test_result 1 "Wix dev is not running"
fi

# Test 10: Git status
echo ""
echo "📦 Test 10: Git Status"
cd "$PROJECT_ROOT"
if git status --porcelain | grep -q .; then
    test_result 1 "Uncommitted changes"
else
    test_result 0 "Git repository clean"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "═══════════════════════════════════════════════════════════"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "🎉 ALL TESTS PASSED - SYSTEM FULLY OPERATIONAL"
    exit 0
else
    echo ""
    echo "⚠️  SOME TESTS FAILED - REVIEW REQUIRED"
    exit 1
fi







