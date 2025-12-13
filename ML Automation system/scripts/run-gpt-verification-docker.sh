#!/bin/bash
# Run GPT Template Verification using Docker database connection

cd "$(dirname "$0")/.."

echo "═══════════════════════════════════════════════════════"
echo "📧 Running GPT Template Verification"
echo "═══════════════════════════════════════════════════════"
echo ""

# Export database connection for Docker
export PGHOST=localhost
export PGPORT=7543
export PGUSER=hingecraft_user
export PGPASSWORD=hingecraft_pass
export PGDATABASE=hingecraft_automation

# Run verification inside Docker container where database connection works
docker-compose exec automation node -e "
const path = require('path');
process.chdir('/app');
require('./tests/gpt-template-verifier.js');
" 2>&1
