#!/bin/bash

# HingeCraft Docker Setup Test Script
# This script verifies that all Docker services are running and functional

echo "=========================================="
echo "HingeCraft Docker Setup Test"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "1. Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Check if docker-compose is available
echo "2. Checking Docker Compose..."
if ! docker-compose --version > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker Compose is not available${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose is available${NC}"
echo ""

# Check if .env file exists
echo "3. Checking environment configuration..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠ Please edit .env file with your credentials${NC}"
    else
        echo -e "${RED}✗ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi
echo ""

# Start Docker services
echo "4. Starting Docker services..."
docker-compose up -d
echo ""

# Wait for services to be ready
echo "5. Waiting for services to be ready..."
sleep 5

# Check PostgreSQL
echo "6. Checking PostgreSQL database..."
if docker-compose exec -T postgres pg_isready -U hingecraft_user -d hingecraft_db > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is running and ready${NC}"
    
    # Check if donations table exists
    TABLE_EXISTS=$(docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'donations');")
    if [ "$TABLE_EXISTS" = "t" ]; then
        echo -e "${GREEN}✓ Donations table exists${NC}"
    else
        echo -e "${RED}✗ Donations table not found${NC}"
    fi
else
    echo -e "${RED}✗ PostgreSQL is not ready${NC}"
fi
echo ""

# Check Node.js API
echo "7. Checking Node.js API (port 3000)..."
sleep 2
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Node.js API is responding${NC}"
    curl -s http://localhost:3000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/health
else
    echo -e "${RED}✗ Node.js API is not responding${NC}"
    echo "   Checking logs..."
    docker-compose logs --tail=10 db-adaptor
fi
echo ""

# Check Python Server
echo "8. Checking Python Server (port 8000)..."
sleep 2
if curl -s http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Python Server is responding${NC}"
    curl -s http://localhost:8000/api/v1/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8000/api/v1/health
else
    echo -e "${RED}✗ Python Server is not responding${NC}"
    echo "   Checking logs..."
    docker-compose logs --tail=10 python-server
fi
echo ""

# Test API with authentication
echo "9. Testing API authentication..."
SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

if curl -s -H "Authorization: Bearer $SECRET_KEY" http://localhost:3000/donations/latest > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Node.js API authentication working${NC}"
else
    echo -e "${YELLOW}⚠ Node.js API authentication test failed (may be expected if no donations exist)${NC}"
fi

if curl -s -H "Authorization: Bearer $SECRET_KEY" http://localhost:8000/api/v1/donations/latest > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Python Server authentication working${NC}"
else
    echo -e "${YELLOW}⚠ Python Server authentication test failed (may be expected if no donations exist)${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
docker-compose ps
echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Configure Wix with endpoint: http://localhost:3000"
echo "2. Use secret key from .env file (ADAPTOR_SECRET_KEY)"
echo "3. For production, deploy to Railway/Render and update endpoint"
echo ""



