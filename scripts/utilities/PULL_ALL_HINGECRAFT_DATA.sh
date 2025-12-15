#!/bin/bash
# Pull All HingeCraft Data from Databases
# Gathers all data related to HingeCraft project for Notion sync

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_ROOT/database/all_data_export"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "═══════════════════════════════════════════════════════════"
echo "📦 PULLING ALL HINGECRAFT DATA"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Create data export directory
mkdir -p "$DATA_DIR"

cd "$PROJECT_ROOT"

# Check if database is running
if ! docker compose ps postgres | grep -q Up; then
    echo "  ⚠️  PostgreSQL is not running. Starting it..."
    docker compose up -d postgres
    sleep 10
fi

# Wait for database
echo "  ⏳ Waiting for database..."
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U hcuser -d hingecraft > /dev/null 2>&1; then
        echo "  ✅ Database is ready"
        break
    fi
    sleep 1
done

echo ""
echo "📊 Step 1: Exporting Donations Data..."
docker compose exec -T postgres psql -U hcuser -d hingecraft -c "
COPY (
    SELECT json_agg(row_to_json(t))
    FROM (
        SELECT * FROM donations ORDER BY created_at DESC
    ) t
) TO STDOUT;
" > "$DATA_DIR/donations_export_$TIMESTAMP.json" 2>/dev/null || echo "  ⚠️  Donations table may not exist yet"

echo "📊 Step 2: Exporting Users Data..."
docker compose exec -T postgres psql -U hcuser -d hingecraft -c "
COPY (
    SELECT json_agg(row_to_json(t))
    FROM (
        SELECT id, email, display_name, role, membership_tier, created_at, updated_at
        FROM users ORDER BY created_at DESC
    ) t
) TO STDOUT;
" > "$DATA_DIR/users_export_$TIMESTAMP.json" 2>/dev/null || echo "  ⚠️  Users table may not exist yet"

echo "📊 Step 3: Exporting Designs Data..."
docker compose exec -T postgres psql -U hcuser -d hingecraft -c "
COPY (
    SELECT json_agg(row_to_json(t))
    FROM (
        SELECT id, title, description, visibility, created_at, created_by
        FROM designs ORDER BY created_at DESC
    ) t
) TO STDOUT;
" > "$DATA_DIR/designs_export_$TIMESTAMP.json" 2>/dev/null || echo "  ⚠️  Designs table may not exist yet"

echo "📊 Step 4: Exporting All Tables List..."
docker compose exec -T postgres psql -U hcuser -d hingecraft -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
" > "$DATA_DIR/all_tables_$TIMESTAMP.txt" 2>/dev/null

echo "📊 Step 5: Exporting Database Schema..."
docker compose exec -T postgres pg_dump -U hcuser -d hingecraft --schema-only > "$DATA_DIR/schema_export_$TIMESTAMP.sql" 2>/dev/null || echo "  ⚠️  Schema export failed"

echo "📊 Step 6: Creating Complete Data Summary..."
cat > "$DATA_DIR/COMPLETE_DATA_SUMMARY_$TIMESTAMP.json" << EOF
{
  "export_timestamp": "$TIMESTAMP",
  "database": "hingecraft",
  "tables_exported": [
    "donations",
    "users",
    "designs"
  ],
  "export_files": {
    "donations": "$DATA_DIR/donations_export_$TIMESTAMP.json",
    "users": "$DATA_DIR/users_export_$TIMESTAMP.json",
    "designs": "$DATA_DIR/designs_export_$TIMESTAMP.json",
    "schema": "$DATA_DIR/schema_export_$TIMESTAMP.sql",
    "tables_list": "$DATA_DIR/all_tables_$TIMESTAMP.txt"
  },
  "source_files": {
    "complete_export": "$PROJECT_ROOT/database/COMPLETE_DATABASE_EXPORT.json",
    "donations_csv": "$PROJECT_ROOT/database/donations_export.csv",
    "charter_list": "$PROJECT_ROOT/database/charter_list_provided.csv",
    "chat_clubs": "$PROJECT_ROOT/database/chat_clubs_provided.csv",
    "chat_messages": "$PROJECT_ROOT/database/chat_messages_provided.csv"
  }
}
EOF

echo ""
echo "✅ Data export complete!"
echo ""
echo "📁 Export Location: $DATA_DIR"
echo "📄 Files Created:"
ls -lh "$DATA_DIR" | tail -n +2 | awk '{print "    • " $9 " (" $5 ")"}'
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ ALL HINGECRAFT DATA PULLED"
echo "═══════════════════════════════════════════════════════════"

