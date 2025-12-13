#!/bin/bash
# Run Master Automation Verification Script

cd "$(dirname "$0")/.."

echo "═══════════════════════════════════════════════════════"
echo "🔍 MASTER AUTOMATION VERIFICATION"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check database connection
if ! docker-compose ps | grep -q postgres; then
  echo "❌ PostgreSQL container not running"
  exit 1
fi

# Run verification
DB_HOST=localhost \
DB_PORT=7543 \
DB_NAME=hingecraft_automation \
DB_USER=hingecraft_user \
DB_PASSWORD=hingecraft_password \
node tests/master-automation-verification.js

exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo ""
  echo "✅ All verifications passed!"
else
  echo ""
  echo "⚠️  Some verifications failed. Check report for details."
fi

exit $exit_code
