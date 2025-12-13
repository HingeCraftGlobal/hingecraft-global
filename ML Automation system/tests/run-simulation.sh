#!/bin/bash

# End-to-End Simulation Runner
# Tests complete automation flow from start to finish

echo "🚀 HingeCraft ML Automation - End-to-End Simulation"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if system is running
echo "📦 Checking system status..."
if ! curl -s http://localhost:7101/health > /dev/null 2>&1; then
    echo "❌ System is not running. Please start Docker containers first."
    echo "   Run: docker-compose up -d"
    exit 1
fi

echo "✅ System is running"
echo ""

# Run simulation
echo "🧪 Starting end-to-end simulation..."
echo "═══════════════════════════════════════════════════════"
echo ""

cd "$(dirname "$0")"
node end-to-end-simulation.js

EXIT_CODE=$?

echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Simulation completed successfully"
    echo ""
    echo "📊 View reports:"
    echo "   - JSON: $(pwd)/../simulation-report.json"
    echo "   - HTML: $(pwd)/../simulation-report.html"
    echo ""
else
    echo "❌ Simulation failed with exit code: $EXIT_CODE"
    echo ""
fi

exit $EXIT_CODE
