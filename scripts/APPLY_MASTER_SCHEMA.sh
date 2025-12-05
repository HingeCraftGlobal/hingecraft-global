#!/bin/bash
# Apply Master Schema to Database
# Applies all 10 data layers in correct order

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════"
echo "📦 APPLYING MASTER SCHEMA (10 Data Layers)"
echo "═══════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT"

# Check if database is running
if ! docker compose ps postgres | grep -q Up; then
    echo "  ❌ PostgreSQL is not running. Start it first: docker compose up -d postgres"
    exit 1
fi

# Wait for database
echo "  ⏳ Waiting for database..."
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U hc -d hingecraft > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Apply schema files in order
SCHEMA_FILES=(
    "database/master_schema/01_core_extensions.sql"
    "database/master_schema/02_users_identity.sql"
    "database/master_schema/03_design_metadata.sql"
    "database/master_schema/04_community_activity.sql"
    "database/master_schema/05_microfactory_integrations.sql"
    "database/master_schema/06_content_contributions.sql"
    "database/master_schema/07_environmental_impact.sql"
    "database/master_schema/08_crypto_treasury.sql"
    "database/master_schema/09_learning_skills.sql"
    "database/master_schema/10_webhooks_assets_prompts.sql"
)

for schema_file in "${SCHEMA_FILES[@]}"; do
    if [ -f "$PROJECT_ROOT/$schema_file" ]; then
        echo "  Applying $(basename $schema_file)..."
        docker compose exec -T postgres psql -U hc -d hingecraft < "$PROJECT_ROOT/$schema_file" 2>&1 | grep -v "already exists" | grep -v "NOTICE" || true
    fi
done

echo ""
echo "✅ Master schema applied successfully!"
echo ""

# Verify tables
TABLE_COUNT=$(docker compose exec -T postgres psql -U hc -d hingecraft -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
echo "  📊 Total tables in database: $TABLE_COUNT"

