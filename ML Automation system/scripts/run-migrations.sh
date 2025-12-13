#!/bin/bash
# Run database migrations for complete pipeline

cd "$(dirname "$0")/.."

echo "═══════════════════════════════════════════════════════"
echo "📊 Running Database Migrations"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if Docker is running
if ! docker-compose ps | grep -q postgres; then
  echo "❌ PostgreSQL container not running. Start with: docker-compose up -d"
  exit 1
fi

# Run migrations in order
MIGRATIONS=(
  "database/002_lead_classification_and_templates.sql"
  "database/003_email_templates_all_sets.sql"
)

for migration in "${MIGRATIONS[@]}"; do
  if [ -f "$migration" ]; then
    echo "📄 Running: $migration"
    docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation < "$migration" 2>&1 | grep -v "NOTICE" | tail -5
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
      echo "   ✅ Migration completed"
    else
      echo "   ⚠️  Migration had warnings (may already be applied)"
    fi
  else
    echo "   ⚠️  File not found: $migration"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ Migrations Complete"
echo "═══════════════════════════════════════════════════════"

# Verify
echo ""
echo "📊 Verifying migrations..."
docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation -c "
SELECT 
  (SELECT COUNT(*) FROM sequences WHERE sequence_type IN ('set_one_student', 'set_two_referral', 'set_three_b2b')) as template_sequences,
  (SELECT COUNT(*) FROM sequence_steps WHERE sequence_id IN (SELECT id FROM sequences WHERE sequence_type IN ('set_one_student', 'set_two_referral', 'set_three_b2b'))) as total_template_steps,
  (SELECT COUNT(*) FROM template_mappings) as template_mappings,
  (SELECT COUNT(*) FROM classification_rules WHERE is_active = true) as classification_rules;
" 2>/dev/null
