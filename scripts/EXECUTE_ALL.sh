#!/bin/bash
# Execute All - Run All Tests and Verifications
# Executes all 600 agent tasks framework and comprehensive testing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════════════════════"
echo "🚀 EXECUTE ALL - Complete System Execution"
echo "═══════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT"

# Execute all test suites
echo "Executing all test suites..."
echo ""

# 1. Split Tests
echo "1. Running Split Tests..."
bash "$SCRIPT_DIR/SPLIT_TESTS.sh" 2>&1 | tail -20
echo ""

# 2. Nano Tests
echo "2. Running Nano Tests (100+ tests)..."
bash "$SCRIPT_DIR/NANO_TESTS.sh" 2>&1 | tail -30
echo ""

# 3. Comprehensive System Test
echo "3. Running Comprehensive System Test..."
bash "$SCRIPT_DIR/FULL_SYSTEM_TEST_COMPREHENSIVE.sh" 2>&1 | tail -30
echo ""

# 4. Login System Test
echo "4. Testing Login System..."
bash "$SCRIPT_DIR/TEST_LOGIN_SYSTEM.sh" 2>&1 | tail -20
echo ""

# 5. Troubleshooting Guide
echo "5. Running Troubleshooting Diagnostics..."
bash "$SCRIPT_DIR/TROUBLESHOOTING_GUIDE.sh" 2>&1 | tail -30
echo ""

# 6. Building Mechanics
echo "6. Running Building Mechanics..."
bash "$SCRIPT_DIR/BUILDING_MECHANICS.sh" 2>&1 | tail -30
echo ""

# 7. Execute All 600 Tasks Framework
echo "7. Executing Agent Task Framework..."
bash "$SCRIPT_DIR/EXECUTE_ALL_600_TASKS.sh" 2>&1 | tail -30
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ ALL TESTS AND EXECUTIONS COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Summary:"
echo "  ✅ Split tests executed"
echo "  ✅ Nano tests executed (100+)"
echo "  ✅ Comprehensive system test executed"
echo "  ✅ Login system test executed"
echo "  ✅ Troubleshooting diagnostics executed"
echo "  ✅ Building mechanics executed"
echo "  ✅ Agent task framework executed"
echo ""

