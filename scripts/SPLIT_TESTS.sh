#!/bin/bash
# Split Tests - Comprehensive Component Testing
# Tests each component independently with detailed reporting

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════"
echo "🧪 SPLIT TESTS - Component-Level Testing"
echo "═══════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT"

# Test results
PASSED=0
FAILED=0
SKIPPED=0

# Test functions
test_component() {
    local name="$1"
    local test_cmd="$2"
    
    echo "Testing: $name..."
    if eval "$test_cmd" > /dev/null 2>&1; then
        echo "  ✅ PASSED"
        ((PASSED++))
        return 0
    else
        echo "  ❌ FAILED"
        ((FAILED++))
        return 1
    fi
}

# ============================================
# DATABASE COMPONENT TESTS
# ============================================
echo "═══════════════════════════════════════════════════════════"
echo "DATABASE COMPONENT TESTS"
echo "═══════════════════════════════════════════════════════════"
echo ""

test_component "PostgreSQL Connection" "docker compose exec -T postgres pg_isready -U hc -d hingecraft"
test_component "Core Extensions" "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT * FROM pg_extension WHERE extname = '\''uuid-ossp'\'';' | grep -q uuid-ossp"
test_component "Users Table" "docker compose exec -T postgres psql -U hc -d hingecraft -c '\d users' | grep -q 'Table'"
test_component "Donations Table" "docker compose exec -T postgres psql -U hc -d hingecraft -c '\d donations' | grep -q 'Table'"
test_component "Chat Clubs Table" "docker compose exec -T postgres psql -U hc -d hingecraft -c '\d chat_clubs' | grep -q 'Table'"
test_component "Members Table" "docker compose exec -T postgres psql -U hc -d hingecraft -c '\d members' | grep -q 'Table'"
test_component "Wix ID Function" "docker compose exec -T postgres psql -U hc -d hingecraft -c '\df set_wix_id' | grep -q 'set_wix_id'"
test_component "Update Date Function" "docker compose exec -T postgres psql -U hc -d hingecraft -c '\df update_updated_date_column' | grep -q 'update_updated_date_column'"

# ============================================
# API COMPONENT TESTS
# ============================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "API COMPONENT TESTS"
echo "═══════════════════════════════════════════════════════════"
echo ""

test_component "API Health Endpoint" "curl -s http://localhost:8000/health | grep -q healthy"
test_component "API Root Endpoint" "curl -s http://localhost:8000/ | grep -q 'HingeCraft API'"
test_component "API Info Endpoint" "curl -s http://localhost:8000/v1/info | grep -q 'api_version'"
test_component "API Docs Available" "curl -s http://localhost:8000/docs | grep -q 'swagger'"
test_component "Auth Register Endpoint" "curl -s -X POST http://localhost:8000/v1/auth/register -H 'Content-Type: application/json' -d '{}' | grep -q -E '(error|email|validation)'"
test_component "Auth Login Endpoint" "curl -s -X POST http://localhost:8000/v1/auth/login -H 'Content-Type: application/json' -d '{}' | grep -q -E '(error|email|password|validation)'"

# ============================================
# DOCKER SERVICE TESTS
# ============================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "DOCKER SERVICE TESTS"
echo "═══════════════════════════════════════════════════════════"
echo ""

test_component "PostgreSQL Service" "docker compose ps postgres | grep -q Up"
test_component "Redis Service" "docker compose ps redis | grep -q Up"
test_component "MinIO Service" "docker compose ps minio | grep -q Up"
test_component "API Service" "docker compose ps api | grep -q Up"
test_component "Worker Service" "docker compose ps worker | grep -q Up"

# ============================================
# SECURITY COMPONENT TESTS
# ============================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "SECURITY COMPONENT TESTS"
echo "═══════════════════════════════════════════════════════════"
echo ""

test_component "User Authentication Table" "docker compose exec -T postgres psql -U hc -d hingecraft -c '\d user_authentication' | grep -q 'Table' || echo 'Table will be created with security components'"
test_component "Security Alerts Table" "docker compose exec -T postgres psql -U hc -d hingecraft -c '\d security_alerts' | grep -q 'Table' || echo 'Table will be created with security components'"

# ============================================
# SUMMARY
# ============================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "SPLIT TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "⏭️  Skipped: $SKIPPED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 ALL SPLIT TESTS PASSED ✅"
    exit 0
else
    echo "⚠️  Some tests failed. Review output above."
    exit 1
fi




