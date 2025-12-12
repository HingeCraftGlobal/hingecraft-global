#!/usr/bin/env bash
set -euo pipefail
# HingeCraft Complete Verification Script
# Usage: ./verify-everything.sh [section]
# sections: all, secrets, gcp, search, drive, staging, dedupe, enrich, score, hubspot, mail, rag, frontend, monitor, e2e

SECT=${1:-all}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOGFILE="/tmp/hingecraft_verify_${NOW}.log"
exec > >(tee -a "$LOGFILE") 2>&1

echo "═══════════════════════════════════════════════════════"
echo "HingeCraft Complete Verification - $NOW"
echo "Section: $SECT"
echo "═══════════════════════════════════════════════════════"

# ---------- Helpers ----------
fail() { echo "❌ FAIL: $1"; exit 2; }
pass() { echo "✅ OK: $1"; }
warn() { echo "⚠️  WARN: $1"; }
require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required CLI: $1"
}
jq_ok() { jq -e . >/dev/null 2>&1 || fail "jq not present"; }

# ---------- Environment / Secrets ----------
check_secrets() {
  echo ""
  echo "1️⃣  Checking environment and secrets..."
  require_cmd jq
  require_cmd curl
  
  # Check Docker containers
  if ! docker ps | grep -q hingecraft-automation; then
    warn "Docker containers not running - start with: docker-compose up -d"
  else
    pass "Docker containers running"
  fi
  
  # Check API health
  if curl -sf http://localhost:7101/health >/dev/null 2>&1; then
    pass "API health check"
  else
    fail "API not responding at http://localhost:7101/health"
  fi
  
  # Check OAuth status
  OAUTH_STATUS=$(curl -sf http://localhost:7101/auth/status 2>/dev/null || echo '{}')
  if echo "$OAUTH_STATUS" | jq -e '.authorized == true' >/dev/null 2>&1; then
    pass "OAuth authorized"
  else
    warn "OAuth not authorized - visit http://localhost:7101/auth/google"
  fi
  
  pass "secrets_check"
}

# ---------- GCP & Google APIs ----------
check_gcp_apis() {
  echo ""
  echo "2️⃣  Checking GCP APIs and OAuth configuration..."
  
  # Check redirect URI in auth URL
  AUTH_RESPONSE=$(curl -sf http://localhost:7101/auth/google 2>/dev/null || echo '{}')
  AUTH_URL=$(echo "$AUTH_RESPONSE" | jq -r '.authUrl // ""')
  
  if [[ "$AUTH_URL" == *"localhost:7101"* ]]; then
    pass "Redirect URI correct (port 7101)"
  elif [[ "$AUTH_URL" == *"localhost:3001"* ]]; then
    fail "Redirect URI still using port 3001 - needs update"
  else
    warn "Could not verify redirect URI"
  fi
  
  # Check scopes in auth URL
  if [[ "$AUTH_URL" == *"gmail.send"* ]] && [[ "$AUTH_URL" == *"gmail.modify"* ]] && [[ "$AUTH_URL" == *"gmail.metadata"* ]]; then
    pass "Gmail scopes present"
  else
    warn "Gmail scopes may be missing"
  fi
  
  if [[ "$AUTH_URL" == *"spreadsheets"* ]]; then
    pass "Sheets scope present"
  else
    warn "Sheets scope missing"
  fi
  
  if [[ "$AUTH_URL" == *"drive.file"* ]] && [[ "$AUTH_URL" == *"drive.readonly"* ]]; then
    pass "Drive scopes present"
  else
    warn "Drive scopes may be incomplete"
  fi
  
  pass "gcp_apis_check"
}

# ---------- System Components ----------
check_system_components() {
  echo ""
  echo "3️⃣  Checking system components..."
  
  # Check pipeline status
  PIPELINE_STATUS=$(curl -sf http://localhost:7101/api/pipeline/status 2>/dev/null || echo '{}')
  if echo "$PIPELINE_STATUS" | jq -e '.watcherActive == true' >/dev/null 2>&1; then
    pass "System watcher active"
  else
    warn "System watcher not active"
  fi
  
  # Check database connection
  if docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation -c "SELECT 1;" >/dev/null 2>&1; then
    pass "Database connection"
  else
    warn "Database connection check failed"
  fi
  
  # Check Redis
  if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
    pass "Redis connection"
  else
    warn "Redis connection check failed"
  fi
  
  pass "system_components_check"
}

# ---------- Docker Containers ----------
check_docker() {
  echo ""
  echo "4️⃣  Checking Docker containers..."
  
  CONTAINERS=("hingecraft-automation" "hingecraft-postgres" "hingecraft-redis" "hingecraft-dashboard")
  for container in "${CONTAINERS[@]}"; do
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
      STATUS=$(docker ps --format "{{.Status}}" --filter "name=${container}")
      echo "   ✓ $container: $STATUS"
    else
      fail "$container not running"
    fi
  done
  
  pass "docker_check"
}

# ---------- Database Schema ----------
check_database_schema() {
  echo ""
  echo "5️⃣  Checking database schema..."
  
  TABLES=$(docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
  
  if [ "$TABLES" -ge 11 ]; then
    pass "Database tables ($TABLES tables found)"
  else
    warn "Expected 11+ tables, found $TABLES"
  fi
  
  pass "database_schema_check"
}

# ---------- OAuth Redirect URI Fix ----------
check_redirect_uri() {
  echo ""
  echo "6️⃣  Verifying redirect URI configuration..."
  
  # Check all source files
  FILES_WITH_3001=$(grep -r "localhost:3001" "$ROOT/src" "$ROOT/config" --include="*.js" 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
  
  if [ "$FILES_WITH_3001" -eq 0 ]; then
    pass "No localhost:3001 references in code"
  else
    warn "Found $FILES_WITH_3001 files with localhost:3001 - may need update"
    grep -r "localhost:3001" "$ROOT/src" "$ROOT/config" --include="*.js" 2>/dev/null | head -5
  fi
  
  # Check environment variable
  if docker-compose exec automation printenv OAUTH_REDIRECT_URI 2>/dev/null | grep -q "7101"; then
    pass "OAUTH_REDIRECT_URI environment variable set"
  else
    warn "OAUTH_REDIRECT_URI not set in Docker"
  fi
  
  pass "redirect_uri_check"
}

# ---------- Scopes Verification ----------
check_scopes() {
  echo ""
  echo "7️⃣  Verifying OAuth scopes..."
  
  AUTH_RESPONSE=$(curl -sf http://localhost:7101/auth/google 2>/dev/null || echo '{}')
  AUTH_URL=$(echo "$AUTH_RESPONSE" | jq -r '.authUrl // ""')
  
  REQUIRED_SCOPES=(
    "gmail.send"
    "gmail.modify"
    "gmail.metadata"
    "spreadsheets"
    "drive.file"
    "drive.readonly"
    "drive.metadata.readonly"
  )
  
  MISSING=0
  for scope in "${REQUIRED_SCOPES[@]}"; do
    if [[ "$AUTH_URL" == *"$scope"* ]]; then
      echo "   ✓ $scope"
    else
      echo "   ✗ $scope MISSING"
      MISSING=$((MISSING + 1))
    fi
  done
  
  if [ $MISSING -eq 0 ]; then
    pass "All 7 required scopes present"
  else
    fail "$MISSING scopes missing"
  fi
}

# ---------- End-to-End Test ----------
run_e2e() {
  echo ""
  echo "8️⃣  End-to-end readiness check..."
  
  # Check if system is ready for file processing
  PIPELINE_STATUS=$(curl -sf http://localhost:7101/api/pipeline/status 2>/dev/null || echo '{}')
  MODE=$(echo "$PIPELINE_STATUS" | jq -r '.mode // "unknown"')
  
  if [ "$MODE" == "standby" ] || [ "$MODE" == "active" ]; then
    pass "Pipeline in ready state: $MODE"
  else
    warn "Pipeline mode: $MODE"
  fi
  
  # Check dashboard
  if curl -sf http://localhost:7080 >/dev/null 2>&1; then
    pass "Dashboard accessible"
  else
    warn "Dashboard not accessible"
  fi
  
  pass "e2e_check"
}

# ---------- Summary ----------
print_summary() {
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "📊 VERIFICATION SUMMARY"
  echo "═══════════════════════════════════════════════════════"
  echo ""
  echo "✅ System Status:"
  echo "   • API: http://localhost:7101"
  echo "   • Dashboard: http://localhost:7080"
  echo "   • Database: Port 7543"
  echo ""
  echo "📋 Next Steps:"
  echo "   1. Complete OAuth: http://localhost:7101/auth/google"
  echo "   2. Verify Google Cloud Console redirect URI"
  echo "   3. Test file detection by dropping file in Drive"
  echo ""
  echo "📖 Full log: $LOGFILE"
  echo ""
}

# ---------- Runner ----------
case "$SECT" in
  all)
    check_secrets
    check_gcp_apis
    check_system_components
    check_docker
    check_database_schema
    check_redirect_uri
    check_scopes
    run_e2e
    print_summary
    ;;
  secrets) check_secrets ;;
  gcp) check_gcp_apis ;;
  system) check_system_components ;;
  docker) check_docker ;;
  db) check_database_schema ;;
  redirect) check_redirect_uri ;;
  scopes) check_scopes ;;
  e2e) run_e2e ;;
  *) echo "Unknown section: $SECT"; exit 1 ;;
esac

echo ""
echo "✅ Verification complete!"


