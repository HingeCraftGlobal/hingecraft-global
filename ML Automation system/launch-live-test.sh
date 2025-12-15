#!/bin/bash

# Live Test Launch Script
# Memory-optimized Docker deployment

set -e

echo "🚀 Launching HingeCraft Automation System - Live Test"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found. Please install Docker Compose first.${NC}"
    exit 1
fi

# Load environment
if [ -f .env.docker ]; then
    echo -e "${GREEN}✅ Loading Docker environment...${NC}"
    export $(cat .env.docker | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  .env.docker not found. Using defaults.${NC}"
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

# Build images
echo -e "${GREEN}🔨 Building Docker images...${NC}"
docker-compose build --no-cache

# Start services
echo -e "${GREEN}🚀 Starting services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check service status
echo -e "${GREEN}📊 Service Status:${NC}"
docker-compose ps

# Check memory usage
echo -e "${GREEN}💾 Memory Usage:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""
echo -e "${GREEN}✅ System launched successfully!${NC}"
echo ""
echo "📋 Next Steps:"
echo "   1. Upload test-live-single-email.csv to Google Drive folder"
echo "   2. Run testSingleEmail() in Google Apps Script"
echo "   3. Check email at chandlerferguson319@gmail.com"
echo ""
echo "📊 Monitor:"
echo "   - Logs: docker-compose logs -f"
echo "   - Memory: docker stats"
echo "   - Stop: docker-compose down"
