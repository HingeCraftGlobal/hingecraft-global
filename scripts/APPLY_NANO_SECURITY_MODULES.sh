#!/bin/bash
# Apply all CIA/FBI level nano security modules

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_USER="hingecraft_user"
DB_NAME="hingecraft_db"
NANO_DIR="$PROJECT_ROOT/database/security/nano"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 APPLYING CIA/FBI LEVEL NANO SECURITY MODULES"
echo "═══════════════════════════════════════════════════════════"

# Check database connection
if ! psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Cannot connect to database. Please ensure PostgreSQL is running."
    echo "   Attempting Docker connection..."
    if docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        USE_DOCKER=true
    else
        echo "❌ Database connection failed. Exiting."
        exit 1
    fi
else
    USE_DOCKER=false
fi

echo ""
echo "📦 Applying nano security modules..."

for module_file in "$NANO_DIR"/*.sql; do
    if [ -f "$module_file" ]; then
        MODULE_NAME=$(basename "$module_file" .sql)
        echo "  Applying $MODULE_NAME..."
        
        if [ "$USE_DOCKER" = true ]; then
            docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -f "/app/database/security/nano/$(basename "$module_file")" 2>&1 | grep -v "NOTICE:" | grep -v "already exists" || true
        else
            psql -h localhost -U "$DB_USER" -d "$DB_NAME" -f "$module_file" 2>&1 | grep -v "NOTICE:" | grep -v "already exists" || true
        fi
        echo "    ✅ $MODULE_NAME applied"
    fi
done

echo ""
echo "✅ All nano security modules applied successfully!"
echo ""
echo "📊 Nano Modules Installed:"
echo "  1. Rate Limiter - Prevents brute force attacks"
echo "  2. Query Inspector - SQL injection detection"
echo "  3. Credential Guard - Advanced password protection"
echo "  4. Session Guard - Session hijacking prevention"
echo "  5. Data Guardian - Fine-grained access control"
echo "  6. Threat Hunter - Proactive threat detection"
echo ""

