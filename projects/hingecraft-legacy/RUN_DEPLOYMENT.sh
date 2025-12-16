#!/bin/bash
# Simplified deployment runner with better error handling

cd [PROJECT_ROOT]/HingeCraft

echo "=========================================="
echo "HingeCraft Deployment Script"
echo "=========================================="
echo ""

# Test .env loading first
echo "[1/5] Testing .env file..."
if ./test-env-load.sh; then
    echo "✓ .env file loads correctly"
else
    echo "✗ .env file has issues"
    exit 1
fi

echo ""
echo "[2/5] Checking Docker..."
if docker info > /dev/null 2>&1; then
    echo "✓ Docker is running"
else
    echo "✗ Docker is not running - please start Docker Desktop"
    exit 1
fi

echo ""
echo "[3/5] Running deployment script..."
echo "This may take several minutes..."
echo ""

# Run the main deployment script
./auto-deploy-all.sh

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "=========================================="
    echo "✓ Deployment completed successfully!"
    echo "=========================================="
else
    echo "=========================================="
    echo "✗ Deployment failed (exit code: $EXIT_CODE)"
    echo "=========================================="
    echo ""
    echo "Check the output above for error details."
fi

exit $EXIT_CODE




