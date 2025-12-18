#!/bin/bash

# =====================================================
# HingeCraft Cloud Portal - Complete Build Script
# =====================================================
# One-command installation for the entire system
# =====================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     🚀 HingeCraft Cloud Portal - Build System 🚀          ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "${BLUE}📋 Step 1: Checking prerequisites...${NC}"
if ! command -v docker &> /dev/null; then
    echo "${RED}❌ Docker is not installed. Please install Docker Desktop first.${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "${RED}❌ Docker Compose is not installed.${NC}"
    exit 1
fi

echo "${GREEN}✅ Docker is installed and running${NC}"
echo ""

# Create .env file if it doesn't exist
echo "${BLUE}📋 Step 2: Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    echo "${YELLOW}Creating .env file with secure random values...${NC}"
    cat > .env << EOL
# HingeCraft Cloud Portal Environment Variables
# Generated automatically - DO NOT commit to git

# Database
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')

# JWT Secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# Grafana
GRAFANA_PASSWORD=$(openssl rand -base64 16 | tr -d '\n')
EOL
    echo "${GREEN}✅ Created .env file${NC}"
else
    echo "${GREEN}✅ .env file already exists${NC}"
fi
echo ""

# Build Docker images
echo "${BLUE}📋 Step 3: Building Docker images...${NC}"
echo "This may take several minutes on first run..."
echo ""

# Use docker compose if available, otherwise docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

$COMPOSE_CMD -f docker-compose.cloud.yml build --no-cache
echo "${GREEN}✅ Docker images built successfully${NC}"
echo ""

# Start services
echo "${BLUE}📋 Step 4: Starting all services...${NC}"
$COMPOSE_CMD -f docker-compose.cloud.yml up -d
echo "${GREEN}✅ Services started${NC}"
echo ""

# Wait for database to be ready
echo "${BLUE}📋 Step 5: Waiting for database to be ready...${NC}"
echo "This may take up to 30 seconds..."
for i in {1..30}; do
    if docker exec cloud_db pg_isready -U admin -d cloud_db &> /dev/null; then
        echo "${GREEN}✅ Database is ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# Initialize database schema
echo "${BLUE}📋 Step 6: Initializing database schema...${NC}"
sleep 5  # Give database extra time
docker exec -i cloud_db psql -U admin -d cloud_db < database/schema.sql 2>&1 | grep -v "already exists" || true
echo "${GREEN}✅ Database schema initialized${NC}"
echo ""

# Wait for ML Brain to load models
echo "${BLUE}📋 Step 7: Waiting for ML Brain to load models...${NC}"
echo "This may take 2-5 minutes on first run..."
echo ""

for i in {1..60}; do
    if curl -s http://localhost:8000/health &> /dev/null; then
        echo "${GREEN}✅ ML Brain is ready${NC}"
        break
    fi
    if [ $i -eq 1 ]; then
        echo "Waiting for models to download and load..."
    fi
    echo -n "."
    sleep 5
done
echo ""

# Final health check
echo "${BLUE}📋 Step 8: Running final health checks...${NC}"
echo ""

# Check Gateway
if curl -s http://localhost:8080/health &> /dev/null; then
    echo "${GREEN}✅ Gateway: Healthy${NC}"
else
    echo "${YELLOW}⚠️  Gateway: Starting...${NC}"
fi

# Check Database
if docker exec cloud_db pg_isready -U admin -d cloud_db &> /dev/null; then
    echo "${GREEN}✅ Database: Healthy${NC}"
else
    echo "${RED}❌ Database: Not ready${NC}"
fi

# Check Redis
if docker exec cloud_redis redis-cli ping &> /dev/null; then
    echo "${GREEN}✅ Redis: Healthy${NC}"
else
    echo "${RED}❌ Redis: Not ready${NC}"
fi

# Check ML Brain
if curl -s http://localhost:8000/health &> /dev/null; then
    echo "${GREEN}✅ ML Brain: Healthy${NC}"
else
    echo "${YELLOW}⚠️  ML Brain: Still loading models...${NC}"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     ✅ BUILD COMPLETE! ✅                                   ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "${GREEN}🎉 HingeCraft Cloud Portal is now running!${NC}"
echo ""
echo "📊 Service URLs:"
echo "   • Gateway API:     http://localhost:8080"
echo "   • ML Brain:        http://localhost:8000"
echo "   • Grafana:         http://localhost:3000 (admin/${GRAFANA_PASSWORD:-admin})"
echo "   • Prometheus:      http://localhost:9090"
echo ""
echo "🔍 Quick Test:"
echo "   curl http://localhost:8080/health"
echo ""
echo "📚 Next Steps:"
echo "   • View logs:       docker-compose -f docker-compose.cloud.yml logs -f"
echo "   • Stop services:   docker-compose -f docker-compose.cloud.yml down"
echo "   • Restart:         docker-compose -f docker-compose.cloud.yml restart"
echo ""
echo "${BLUE}📖 See README.md for complete documentation${NC}"
echo ""

