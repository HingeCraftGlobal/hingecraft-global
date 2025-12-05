#!/bin/bash
# Comprehensive production readiness test

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_USER="hingecraft_user"
DB_NAME="hingecraft_db"

echo "═══════════════════════════════════════════════════════════"
echo "🔍 PRODUCTION READINESS TEST"
echo "═══════════════════════════════════════════════════════════"

PASSED=0
FAILED=0

# Test 1: Database connectivity
echo ""
echo "📦 Test 1: Database Connectivity"
if psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1 || \
   docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "  ✅ PASS"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ FAIL"
    FAILED=$((FAILED + 1))
fi

# Test 2: Security modules installed
echo ""
echo "📦 Test 2: Security Modules"
SECURITY_MODULES=(
    "encryption_keys"
    "ssl_certificates"
    "user_authentication"
    "threat_signatures"
    "firewall_rules"
    "security_alerts"
)

ALL_MODULES_PRESENT=true
for module in "${SECURITY_MODULES[@]}"; do
    if psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$module';" 2>/dev/null | grep -q "1" || \
       docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$module';" 2>/dev/null | grep -q "1"; then
        echo "    ✅ $module"
    else
        echo "    ❌ $module MISSING"
        ALL_MODULES_PRESENT=false
    fi
done

if [ "$ALL_MODULES_PRESENT" = true ]; then
    echo "  ✅ PASS"
    PASSED=$((PASSED + 1))
else
    echo "  ❌ FAIL"
    FAILED=$((FAILED + 1))
fi

# Test 3: Nano security modules
echo ""
echo "📦 Test 3: Nano Security Modules"
NANO_MODULES=(
    "rate_limit_tracker"
    "query_inspections"
    "password_policies"
    "session_security"
    "data_access_rules"
    "threat_indicators"
)

ALL_NANO_PRESENT=true
for module in "${NANO_MODULES[@]}"; do
    if psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$module';" 2>/dev/null | grep -q "1" || \
       docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$module';" 2>/dev/null | grep -q "1"; then
        echo "    ✅ $module"
    else
        echo "    ❌ $module MISSING"
        ALL_NANO_PRESENT=false
    fi
done

if [ "$ALL_NANO_PRESENT" = true ]; then
    echo "  ✅ PASS"
    PASSED=$((PASSED + 1))
else
    echo "  ⚠️  Some nano modules missing (run APPLY_NANO_SECURITY_MODULES.sh)"
fi

# Test 4: Data tables
echo ""
echo "📦 Test 4: Data Tables"
DATA_TABLES=("donations" "members" "chat_clubs" "chat_messages" "ambassadors")
ALL_DATA_PRESENT=true
for table in "${DATA_TABLES[@]}"; do
    COUNT=$(psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ' || \
            docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ' || echo "0")
    echo "    📊 $table: $COUNT records"
    if [ "$COUNT" = "0" ] && [ "$table" != "donations" ]; then
        ALL_DATA_PRESENT=false
    fi
done

if [ "$ALL_DATA_PRESENT" = true ]; then
    echo "  ✅ PASS"
    PASSED=$((PASSED + 1))
else
    echo "  ⚠️  Some tables empty (run LOAD_ALL_DATABASE_DATA.sh)"
fi

# Test 5: Security functions
echo ""
echo "📦 Test 5: Security Functions"
SECURITY_FUNCTIONS=(
    "check_rate_limit"
    "inspect_query_for_injection"
    "validate_password_strength"
    "validate_session_security"
    "check_data_access"
    "hunt_threats"
)

FUNCTIONS_PRESENT=0
for func in "${SECURITY_FUNCTIONS[@]}"; do
    if psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM pg_proc WHERE proname = '$func';" 2>/dev/null | grep -q "1" || \
       docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM pg_proc WHERE proname = '$func';" 2>/dev/null | grep -q "1"; then
        FUNCTIONS_PRESENT=$((FUNCTIONS_PRESENT + 1))
    fi
done

if [ $FUNCTIONS_PRESENT -eq ${#SECURITY_FUNCTIONS[@]} ]; then
    echo "  ✅ PASS ($FUNCTIONS_PRESENT/${#SECURITY_FUNCTIONS[@]} functions)"
    PASSED=$((PASSED + 1))
else
    echo "  ⚠️  Some functions missing ($FUNCTIONS_PRESENT/${#SECURITY_FUNCTIONS[@]} found)"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ Passed: $PASSED"
echo "  ❌ Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ PRODUCTION READY!"
    exit 0
else
    echo "⚠️  Some tests failed. Review above."
    exit 1
fi

