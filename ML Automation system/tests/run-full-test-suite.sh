#!/bin/bash

# HingeCraft ML Automation System - Full Test Suite
# Runs both stress test and codebase analysis

echo "🚀 HingeCraft ML Automation - Full Test Suite"
echo "═══════════════════════════════════════════════════════"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Step 1: Codebase Analysis
echo "📋 Step 1: Running Codebase Analysis..."
echo "─────────────────────────────────────────────"
node codebase-analyzer.js
ANALYSIS_EXIT=$?

echo ""
echo ""

# Step 2: Stress Test
echo "🧪 Step 2: Running Stress Test (100,000 resources)..."
echo "─────────────────────────────────────────────"
./run-stress-test.sh
STRESS_EXIT=$?

echo ""
echo ""

# Summary
echo "═══════════════════════════════════════════════════════"
echo "📊 TEST SUITE SUMMARY"
echo "═══════════════════════════════════════════════════════"

if [ $ANALYSIS_EXIT -eq 0 ]; then
    echo "✅ Codebase Analysis: PASSED"
else
    echo "❌ Codebase Analysis: FAILED"
fi

if [ $STRESS_EXIT -eq 0 ]; then
    echo "✅ Stress Test: PASSED"
else
    echo "❌ Stress Test: FAILED"
fi

echo ""
echo "📄 Reports Generated:"
echo "   - Codebase Analysis JSON: ../codebase-analysis-report.json"
echo "   - Codebase Analysis HTML: ../codebase-analysis-report.html"
echo "   - Stress Test JSON: ../stress-test-report.json"
echo "   - Stress Test HTML: ../stress-test-report.html"
echo ""

if [ $ANALYSIS_EXIT -eq 0 ] && [ $STRESS_EXIT -eq 0 ]; then
    echo "✅ All tests completed successfully"
    exit 0
else
    echo "⚠️  Some tests failed. Please review the reports."
    exit 1
fi
