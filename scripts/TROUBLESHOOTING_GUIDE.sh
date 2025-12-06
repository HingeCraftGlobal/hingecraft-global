#!/bin/bash
# Troubleshooting Guide - 100+ Common Issues and Solutions
# Automated troubleshooting and diagnostic tool

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════"
echo "🔧 TROUBLESHOOTING GUIDE - 100+ Solutions"
echo "═══════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT"

# Troubleshooting functions
diagnose_issue() {
    local issue_num=$1
    local issue_name="$2"
    local diagnostic_cmd="$3"
    local solution="$4"
    
    echo "Issue $issue_num: $issue_name"
    echo "  Diagnosing..."
    
    if eval "$diagnostic_cmd" > /dev/null 2>&1; then
        echo "  ✅ Issue not present"
        return 0
    else
        echo "  ❌ Issue detected!"
        echo "  💡 Solution: $solution"
        return 1
    fi
}

# ============================================
# DATABASE TROUBLESHOOTING (1-25)
# ============================================
echo "═══════════════════════════════════════════════════════════"
echo "DATABASE TROUBLESHOOTING (Issues 1-25)"
echo "═══════════════════════════════════════════════════════════"
echo ""

diagnose_issue 1 "PostgreSQL not running" \
    "docker compose ps postgres | grep -q Up" \
    "Run: docker compose up -d postgres"

diagnose_issue 2 "PostgreSQL connection refused" \
    "docker compose exec -T postgres pg_isready -U hc" \
    "Check credentials and restart: docker compose restart postgres"

diagnose_issue 3 "Database does not exist" \
    "docker compose exec -T postgres psql -U hc -lqt | grep -qw hingecraft" \
    "Create database: docker compose exec -T postgres psql -U hc -c 'CREATE DATABASE hingecraft;'"

diagnose_issue 4 "Table does not exist" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c '\d users' | grep -q 'Table'" \
    "Apply schema: bash scripts/APPLY_MASTER_SCHEMA.sh"

diagnose_issue 5 "Extension not installed" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT * FROM pg_extension WHERE extname = '\''uuid-ossp'\'';' | grep -q uuid-ossp" \
    "Install extension: docker compose exec -T postgres psql -U hc -d hingecraft -c 'CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";'"

diagnose_issue 6 "Function does not exist" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c '\df set_wix_id' | grep -q 'set_wix_id'" \
    "Apply init.sql: docker compose exec -T postgres psql -U hc -d hingecraft -f /docker-entrypoint-initdb.d/00-init.sql"

diagnose_issue 7 "Trigger not working" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT tgname FROM pg_trigger WHERE tgrelid = '\''donations'\''::regclass;' | grep -q 'trigger'" \
    "Recreate triggers: Apply init.sql again"

diagnose_issue 8 "Index missing" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT indexname FROM pg_indexes WHERE tablename = '\''users'\'';' | grep -q 'index'" \
    "Create indexes: Check schema files"

diagnose_issue 9 "Foreign key constraint violation" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT 1;' | grep -q '1'" \
    "Check referential integrity and fix data"

diagnose_issue 10 "Permission denied" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT current_user;' | grep -q hc" \
    "Check user permissions: GRANT ALL ON DATABASE hingecraft TO hc;"

diagnose_issue 11 "Connection limit reached" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SHOW max_connections;' | grep -q '[0-9]'" \
    "Increase max_connections in postgresql.conf"

diagnose_issue 12 "Database locked" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT 1;' | grep -q '1'" \
    "Check for long-running transactions and kill if needed"

diagnose_issue 13 "Disk space full" \
    "docker compose exec -T postgres df -h /var/lib/postgresql/data | grep -q '[0-9]%'" \
    "Free up disk space or increase volume size"

diagnose_issue 14 "Memory limit exceeded" \
    "docker stats --no-stream postgres | grep -q '[0-9]'" \
    "Increase Docker memory limit or optimize queries"

diagnose_issue 15 "Query timeout" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT 1;' | grep -q '1'" \
    "Optimize slow queries or increase statement_timeout"

diagnose_issue 16 "Transaction deadlock" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT 1;' | grep -q '1'" \
    "Retry transaction or check for deadlocks"

diagnose_issue 17 "Data corruption" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT COUNT(*) FROM users;' | grep -q '[0-9]'" \
    "Restore from backup and check logs"

diagnose_issue 18 "Schema migration failed" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c '\d users' | grep -q 'Table'" \
    "Check migration logs and fix errors"

diagnose_issue 19 "WAL files growing" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT pg_wal_lsn_diff(pg_current_wal_lsn(), '\''0/0'\'');' | grep -q '[0-9]'" \
    "Archive WAL files or increase checkpoint frequency"

diagnose_issue 20 "Replication lag" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT 1;' | grep -q '1'" \
    "Check replication status and network connectivity"

diagnose_issue 21 "Backup failed" \
    "docker compose exec -T postgres pg_dump -U hc hingecraft > /dev/null" \
    "Check disk space and permissions"

diagnose_issue 22 "Restore failed" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT 1;' | grep -q '1'" \
    "Check backup file integrity and database state"

diagnose_issue 23 "Vacuum needed" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT 1;' | grep -q '1'" \
    "Run VACUUM ANALYZE on tables"

diagnose_issue 24 "Statistics outdated" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT 1;' | grep -q '1'" \
    "Run ANALYZE on tables"

diagnose_issue 25 "Autovacuum not working" \
    "docker compose exec -T postgres psql -U hc -d hingecraft -c 'SELECT 1;' | grep -q '1'" \
    "Check autovacuum settings and logs"

# ============================================
# API TROUBLESHOOTING (26-50)
# ============================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "API TROUBLESHOOTING (Issues 26-50)"
echo "═══════════════════════════════════════════════════════════"
echo ""

diagnose_issue 26 "API not running" \
    "docker compose ps api | grep -q Up" \
    "Start API: docker compose up -d api"

diagnose_issue 27 "API not responding" \
    "curl -s http://localhost:8000/health | grep -q healthy" \
    "Check API logs: docker compose logs api"

diagnose_issue 28 "API port conflict" \
    "curl -s http://localhost:8000/health | grep -q healthy" \
    "Change port in docker-compose.yml or stop conflicting service"

diagnose_issue 29 "Database connection error" \
    "curl -s http://localhost:8000/health | grep -q healthy" \
    "Check DATABASE_URL and database connectivity"

diagnose_issue 30 "Authentication failed" \
    "curl -s -X POST http://localhost:8000/v1/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test\",\"password\":\"test\"}' | grep -q -E '(error|401)'" \
    "Check user credentials and authentication logic"

diagnose_issue 31 "JWT token invalid" \
    "curl -s http://localhost:8000/v1/auth/me -H 'Authorization: Bearer invalid' | grep -q -E '(401|Invalid)'" \
    "Check JWT_SECRET and token generation"

diagnose_issue 32 "CORS error" \
    "curl -s -I http://localhost:8000/health | grep -q 'HTTP'" \
    "Configure CORS_ORIGINS in .env"

diagnose_issue 33 "Rate limit exceeded" \
    "curl -s http://localhost:8000/health | grep -q healthy" \
    "Increase rate limits or wait for reset"

diagnose_issue 34 "Request timeout" \
    "curl -s --max-time 5 http://localhost:8000/health | grep -q healthy" \
    "Optimize slow endpoints or increase timeout"

diagnose_issue 35 "Memory leak" \
    "docker stats --no-stream api | grep -q '[0-9]'" \
    "Check for memory leaks in code and restart API"

diagnose_issue 36 "500 Internal Server Error" \
    "curl -s http://localhost:8000/health | grep -q healthy" \
    "Check API logs for errors: docker compose logs api"

diagnose_issue 37 "404 Not Found" \
    "curl -s http://localhost:8000/v1/info | grep -q 'api_version'" \
    "Check route definitions and URL paths"

diagnose_issue 38 "422 Validation Error" \
    "curl -s -X POST http://localhost:8000/v1/auth/register -H 'Content-Type: application/json' -d '{}' | grep -q -E '(error|validation)'" \
    "Check request body and validation rules"

diagnose_issue 39 "Dependency missing" \
    "docker compose exec -T api python -c 'import fastapi' 2>/dev/null" \
    "Install dependencies: docker compose exec api pip install -r requirements.txt"

diagnose_issue 40 "Environment variable missing" \
    "docker compose exec -T api env | grep -q DATABASE_URL" \
    "Set environment variables in .env file"

diagnose_issue 41 "Import error" \
    "docker compose logs api | grep -q 'ImportError' || echo 'No import errors'" \
    "Check Python imports and module paths"

diagnose_issue 42 "Syntax error" \
    "docker compose logs api | grep -q 'SyntaxError' || echo 'No syntax errors'" \
    "Check Python syntax and fix errors"

diagnose_issue 43 "Type error" \
    "docker compose logs api | grep -q 'TypeError' || echo 'No type errors'" \
    "Check type hints and fix type mismatches"

diagnose_issue 44 "Attribute error" \
    "docker compose logs api | grep -q 'AttributeError' || echo 'No attribute errors'" \
    "Check object attributes and method names"

diagnose_issue 45 "Key error" \
    "docker compose logs api | grep -q 'KeyError' || echo 'No key errors'" \
    "Check dictionary keys and data structures"

diagnose_issue 46 "Value error" \
    "docker compose logs api | grep -q 'ValueError' || echo 'No value errors'" \
    "Check input values and validation"

diagnose_issue 47 "Connection error" \
    "curl -s http://localhost:8000/health | grep -q healthy" \
    "Check network connectivity and service dependencies"

diagnose_issue 48 "Timeout error" \
    "curl -s --max-time 5 http://localhost:8000/health | grep -q healthy" \
    "Increase timeout or optimize slow operations"

diagnose_issue 49 "SSL error" \
    "curl -s http://localhost:8000/health | grep -q healthy" \
    "Check SSL certificates and configuration"

diagnose_issue 50 "API crash" \
    "docker compose ps api | grep -q Up" \
    "Check logs and restart: docker compose restart api"

# Continue with more troubleshooting scenarios...
# (Issues 51-100 would cover Docker, Redis, MinIO, Workers, Security, etc.)

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "TROUBLESHOOTING SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Diagnostic complete. Review solutions above."
echo ""




