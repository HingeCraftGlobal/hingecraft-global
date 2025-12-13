#!/bin/bash

# Full Sync Verification Script
# Verifies database, files, and services are all synced

set -e

echo "🔍 FULL SYSTEM SYNC VERIFICATION"
echo "=================================="
echo ""

# Set database connection
export DB_HOST=localhost
export DB_PORT=7543

# Check if server is running
if ! curl -s http://localhost:7101/health > /dev/null 2>&1; then
    echo "⚠️  Server not running. Starting verification without API..."
    USE_API=false
else
    echo "✅ Server is running"
    USE_API=true
fi

echo ""
echo "📊 Checking Database Sync..."
echo "----------------------------"

# Check database tables
TABLES=$(docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation -t -c "
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'leads', 'lead_sequences', 'email_logs', 'email_templates',
        'drive_ingests', 'drive_rows', 'lead_classifications',
        'email_bounces', 'email_threads', 'email_replies',
        'email_tracking', 'lead_segments', 'segment_conflicts',
        'audit_trace', 'domain_suppression', 'suppression_list'
    )
" | tr -d ' ')

REQUIRED_TABLES=16

if [ "$TABLES" -eq "$REQUIRED_TABLES" ]; then
    echo "✅ Database Tables: $TABLES/$REQUIRED_TABLES"
else
    echo "❌ Database Tables: $TABLES/$REQUIRED_TABLES (Missing: $((REQUIRED_TABLES - TABLES)))"
fi

# Check indexes
INDEXES=$(docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation -t -c "
    SELECT COUNT(*) 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname IN (
        'idx_leads_email', 'idx_leads_fingerprint',
        'idx_email_logs_lead_id', 'idx_email_logs_status',
        'idx_drive_ingests_status', 'idx_lead_sequences_status'
    )
" | tr -d ' ')

REQUIRED_INDEXES=6

if [ "$INDEXES" -ge "$REQUIRED_INDEXES" ]; then
    echo "✅ Database Indexes: $INDEXES+ (Required: $REQUIRED_INDEXES)"
else
    echo "❌ Database Indexes: $INDEXES (Required: $REQUIRED_INDEXES)"
fi

# Check triggers
TRIGGERS=$(docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation -t -c "
    SELECT COUNT(*) 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name IN (
        'trigger_pause_sequence_on_reply',
        'trigger_suppress_on_hard_bounce'
    )
" | tr -d ' ')

REQUIRED_TRIGGERS=2

if [ "$TRIGGERS" -eq "$REQUIRED_TRIGGERS" ]; then
    echo "✅ Database Triggers: $TRIGGERS/$REQUIRED_TRIGGERS"
else
    echo "❌ Database Triggers: $TRIGGERS/$REQUIRED_TRIGGERS"
fi

echo ""
echo "📁 Checking File Sync..."
echo "-----------------------"

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REQUIRED_FILES=(
    "src/services/bounceHandler.js"
    "src/services/threadHandler.js"
    "src/services/segmentReconciler.js"
    "src/services/auditTraceback.js"
    "src/services/hubspotEnhanced.js"
    "src/services/anymailEnhanced.js"
    "src/services/emailTracking.js"
    "src/services/monitoring.js"
    "src/services/pipelineTracker.js"
    "database/004_bounce_thread_audit_tables.sql"
    "tests/pipeline-step-by-step-test.js"
    "tests/test-pipeline-interactive.js"
)

EXISTING=0
MISSING=0

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        ((EXISTING++))
    else
        echo "  ❌ Missing: $file"
        ((MISSING++))
    fi
done

if [ "$MISSING" -eq 0 ]; then
    echo "✅ All Files: $EXISTING/${#REQUIRED_FILES[@]}"
else
    echo "❌ Files: $EXISTING/${#REQUIRED_FILES[@]} (Missing: $MISSING)"
fi

echo ""
echo "🔧 Checking Service Sync..."
echo "--------------------------"

# Check if services can be loaded
SERVICES=(
    "bounceHandler"
    "threadHandler"
    "segmentReconciler"
    "auditTraceback"
    "hubspotEnhanced"
    "anymailEnhanced"
    "emailTracking"
    "monitoring"
    "pipelineTracker"
)

LOADED=0
FAILED=0

for service in "${SERVICES[@]}"; do
    if node -e "try { require('./src/services/$service'); console.log('OK'); } catch(e) { console.log('FAIL'); process.exit(1); }" 2>/dev/null; then
        ((LOADED++))
    else
        echo "  ❌ Failed to load: $service"
        ((FAILED++))
    fi
done

if [ "$FAILED" -eq 0 ]; then
    echo "✅ All Services: $LOADED/${#SERVICES[@]}"
else
    echo "❌ Services: $LOADED/${#SERVICES[@]} (Failed: $FAILED)"
fi

echo ""
echo "📊 Summary"
echo "----------"

if [ "$TABLES" -eq "$REQUIRED_TABLES" ] && [ "$INDEXES" -ge "$REQUIRED_INDEXES" ] && [ "$TRIGGERS" -eq "$REQUIRED_TRIGGERS" ] && [ "$MISSING" -eq 0 ] && [ "$FAILED" -eq 0 ]; then
    echo "✅ ALL SYSTEMS SYNCED!"
    echo ""
    echo "🚀 Ready to launch pipeline tracker:"
    echo "   node scripts/launch-pipeline-tracker.js"
    exit 0
else
    echo "⚠️  Some issues detected. Please review above."
    exit 1
fi
