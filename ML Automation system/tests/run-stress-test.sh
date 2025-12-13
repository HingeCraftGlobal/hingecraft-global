#!/bin/bash

# HingeCraft ML Automation System - Stress Test Runner
# Runs comprehensive stress test with 100,000 resources

echo "🚀 HingeCraft ML Automation - Stress Test Runner"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if containers are running
echo "📦 Checking Docker containers..."
if ! docker-compose ps | grep -q "hingecraft-automation.*Up"; then
    echo "⚠️  Automation container is not running. Starting containers..."
    cd "$(dirname "$0")/.."
    docker-compose up -d
    echo "⏳ Waiting for containers to be ready..."
    sleep 10
fi

# Check database connection
echo "🔌 Checking database connection..."
cd "$(dirname "$0")/.."
if ! docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_automation -c "SELECT 1" > /dev/null 2>&1; then
    echo "❌ Database connection failed. Please check database configuration."
    exit 1
fi

echo "✅ All checks passed"
echo ""

# Run stress test
echo "🧪 Starting stress test..."
echo ""

cd "$(dirname "$0")"
node stress-test.js

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Stress test completed successfully"
    echo ""
    echo "📊 View reports:"
    echo "   - JSON: $(pwd)/../stress-test-report.json"
    echo "   - HTML: $(pwd)/../stress-test-report.html"
    echo ""
else
    echo ""
    echo "❌ Stress test failed with exit code: $EXIT_CODE"
    echo ""
fi

exit $EXIT_CODE
