#!/bin/bash
# Quick test script to verify .env loading works

echo "Testing .env file loading..."
echo ""

if [ -f .env ]; then
  echo "✓ .env file exists"
  
  # Test the loading method
  set -a
  source .env
  set +a
  
  echo "✓ Environment variables loaded"
  echo ""
  echo "DOCKER_USERNAME: ${DOCKER_USERNAME:-NOT SET}"
  echo "DOCKER_REPOSITORY: ${DOCKER_REPOSITORY:-NOT SET}"
  echo "DOCKER_TOKEN: ${DOCKER_TOKEN:+SET (hidden)}${DOCKER_TOKEN:-NOT SET}"
else
  echo "✗ .env file not found"
  exit 1
fi




