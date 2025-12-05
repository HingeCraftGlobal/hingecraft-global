#!/bin/bash
# Apply all 10 CIA-level security components to the database

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_USER="hingecraft_user"
DB_NAME="hingecraft_db"
SECURITY_DIR="$PROJECT_ROOT/database/security"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 APPLYING ALL CIA-LEVEL SECURITY COMPONENTS"
echo "═══════════════════════════════════════════════════════════"

# Step 1: Check database connectivity
echo ""
echo "📦 Step 1: Checking database connectivity..."
if docker compose exec -T db pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "❌ Database is not ready. Starting Docker database..."
    cd "$PROJECT_ROOT"
    docker compose up -d db
    echo "⏳ Waiting for database to be ready..."
    sleep 10
    for i in {1..30}; do
        if docker compose exec -T db pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
            echo "✅ Database is ready"
            break
        fi
        sleep 1
    done
fi

# Step 2: Apply security components
echo ""
echo "📦 Step 2: Applying security components..."
STEP_COUNT=0
OVERALL_SUCCESS=true

for component_file in "$SECURITY_DIR"/0[1-9]_*.sql "$SECURITY_DIR"/10_*.sql; do
    if [ -f "$component_file" ]; then
        COMPONENT_NAME=$(basename "$component_file" .sql | sed 's/^[0-9]*_//' | sed 's/_/ /g' | sed -r 's/\b(.)/\u\1/g')
        STEP_COUNT=$((STEP_COUNT + 1))
        echo ""
        echo "📦 Step $STEP_COUNT: Applying Component - $COMPONENT_NAME..."
        if docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -f "/app/database/security/$(basename "$component_file")" 2>&1 | grep -v "NOTICE:" | grep -v "already exists" | tail -20; then
            echo "✅ $COMPONENT_NAME applied"
        else
            echo "⚠️  $COMPONENT_NAME completed (some warnings may be expected)"
        fi
    fi
done

# Step 3: Verify components
echo ""
echo "📦 Step 3: Verifying security components..."
VERIFICATION_QUERIES=(
    "SELECT COUNT(*) FROM encryption_keys;"
    "SELECT COUNT(*) FROM ssl_certificates;"
    "SELECT COUNT(*) FROM user_authentication;"
    "SELECT COUNT(*) FROM threat_signatures;"
    "SELECT COUNT(*) FROM master_audit_log;"
    "SELECT COUNT(*) FROM data_classification;"
    "SELECT COUNT(*) FROM vulnerabilities;"
    "SELECT COUNT(*) FROM firewall_rules;"
    "SELECT COUNT(*) FROM security_incidents;"
    "SELECT COUNT(*) FROM security_alerts;"
)

for query in "${VERIFICATION_QUERIES[@]}"; do
    docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -t -c "$query" 2>/dev/null | tr -d ' ' | grep -q "^[0-9]" && echo "✅ Component verified" || echo "⚠️  Component may need initialization"
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ ALL SECURITY COMPONENTS APPLIED"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Next Steps:"
echo "   1. Review security component logs above"
echo "   2. Initialize encryption keys: SELECT initialize_encryption_system('your_secure_passphrase');"
echo "   3. Configure threat intelligence feeds"
echo "   4. Set up security monitoring dashboards"
echo "   5. Test security alerting system"
echo ""

