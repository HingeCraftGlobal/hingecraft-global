#!/bin/bash
# Check Docker Status and Provide Instructions

echo "═══════════════════════════════════════════════════════════"
echo "🐳 DOCKER STATUS CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo ""
    echo "Please install Docker Desktop:"
    echo "  macOS: https://www.docker.com/products/docker-desktop"
    echo "  Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

echo "✅ Docker is installed: $(docker --version)"
echo ""

# Check if Docker daemon is running
if ! docker info &>/dev/null; then
    echo "❌ Docker daemon is not running"
    echo ""
    echo "Please start Docker Desktop:"
    echo "  1. Open Docker Desktop application"
    echo "  2. Wait for Docker to fully start (whale icon in menu bar)"
    echo "  3. Run this script again: ./CHECK_DOCKER.sh"
    echo ""
    echo "Or start Docker from command line:"
    echo "  macOS: open -a Docker"
    echo ""
    exit 1
fi

echo "✅ Docker daemon is running"
echo ""

# Check Docker Compose
if docker compose version &>/dev/null; then
    echo "✅ Docker Compose is available: $(docker compose version)"
elif command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose is available: $(docker-compose --version)"
else
    echo "❌ Docker Compose is not available"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ ALL DOCKER PREREQUISITES MET"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Ready to launch! Run:"
echo "  ./LAUNCH_BREAKDOWN.sh"
echo "  or"
echo "  ./LAUNCH_ALL.sh"
echo ""

