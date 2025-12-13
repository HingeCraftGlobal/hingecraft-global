#!/bin/bash

# Full Pipeline Test Runner
# Runs both automated and interactive tests

set -e

echo "🧪 Full Pipeline Test Suite"
echo "============================"
echo ""

# Check if database is accessible
echo "📊 Checking database connection..."
docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation -c "SELECT NOW();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database connection: OK"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Check if migration is applied
echo "📋 Checking database migration..."
MIGRATION_CHECK=$(docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_bounces');" | tr -d ' ')

if [ "$MIGRATION_CHECK" = "t" ]; then
    echo "✅ Database migration: Applied"
else
    echo "⚠️  Database migration not applied"
    echo "   Run: docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation < database/004_bounce_thread_audit_tables.sql"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run automated test
echo ""
echo "🤖 Running automated pipeline test..."
echo "-----------------------------------"
node tests/pipeline-step-by-step-test.js

AUTO_TEST_RESULT=$?

# Ask if user wants interactive test
echo ""
read -p "Run interactive test? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "👤 Running interactive pipeline test..."
    echo "--------------------------------------"
    node scripts/test-pipeline-interactive.js
    
    INTERACTIVE_TEST_RESULT=$?
else
    INTERACTIVE_TEST_RESULT=0
fi

# Summary
echo ""
echo "============================"
echo "📊 Test Summary"
echo "============================"
echo ""

if [ $AUTO_TEST_RESULT -eq 0 ]; then
    echo "✅ Automated test: PASSED"
else
    echo "❌ Automated test: FAILED"
fi

if [ $INTERACTIVE_TEST_RESULT -eq 0 ]; then
    echo "✅ Interactive test: PASSED"
else
    echo "❌ Interactive test: FAILED"
fi

echo ""
if [ $AUTO_TEST_RESULT -eq 0 ] && [ $INTERACTIVE_TEST_RESULT -eq 0 ]; then
    echo "🎉 All tests passed! Pipeline is ready for production."
    exit 0
else
    echo "⚠️  Some tests failed. Please review and fix issues."
    exit 1
fi
