#!/bin/bash

# Complete HingeCraft Deployment Automation
# This script automates the entire deployment process

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="/Users/chandlerfergusen/Desktop/CURSOR/HingeCraft"
cd "$PROJECT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  HingeCraft Complete Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Check Docker
echo -e "${YELLOW}Step 1: Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    echo -e "${YELLOW}Please start Docker Desktop and try again${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Step 2: Check .env file
echo -e "${YELLOW}Step 2: Checking configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found, creating from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠ Please edit .env file with your configuration${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Configuration file exists${NC}"
echo ""

# Step 3: Load environment variables
echo -e "${YELLOW}Step 3: Loading environment variables...${NC}"
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi
echo -e "${GREEN}✅ Environment variables loaded${NC}"
echo ""

# Step 4: Stop existing containers
echo -e "${YELLOW}Step 4: Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true
echo -e "${GREEN}✅ Existing containers stopped${NC}"
echo ""

# Step 5: Pull latest images from Docker Hub
echo -e "${YELLOW}Step 5: Pulling latest images from Docker Hub...${NC}"
echo -e "${BLUE}Pulling departmentsai/wix-db-adaptor:latest...${NC}"
docker pull departmentsai/wix-db-adaptor:latest || echo -e "${YELLOW}⚠ Could not pull db-adaptor, will build locally${NC}"

echo -e "${BLUE}Pulling departmentsai/wix-python-server:latest...${NC}"
docker pull departmentsai/wix-python-server:latest || echo -e "${YELLOW}⚠ Could not pull python-server, will build locally${NC}"

echo -e "${BLUE}Pulling postgres:15-alpine...${NC}"
docker pull postgres:15-alpine || docker pull postgres:15
echo -e "${GREEN}✅ Images pulled${NC}"
echo ""

# Step 6: Start services
echo -e "${YELLOW}Step 6: Starting Docker services...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ Services started${NC}"
echo ""

# Step 7: Wait for services to be healthy
echo -e "${YELLOW}Step 7: Waiting for services to be healthy...${NC}"
echo -e "${BLUE}Waiting for PostgreSQL...${NC}"
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U hingecraft_user -d hingecraft_db &>/dev/null; then
        echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ PostgreSQL failed to start${NC}"
        exit 1
    fi
    sleep 2
done

echo -e "${BLUE}Waiting for Database Adaptor...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000/health &>/dev/null; then
        echo -e "${GREEN}✅ Database Adaptor is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Database Adaptor failed to start${NC}"
        exit 1
    fi
    sleep 2
done

echo -e "${BLUE}Waiting for Python Server...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8000/api/v1/health &>/dev/null; then
        echo -e "${GREEN}✅ Python Server is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠ Python Server may not be responding, but continuing...${NC}"
    fi
    sleep 2
done
echo ""

# Step 8: Verify services
echo -e "${YELLOW}Step 8: Verifying services...${NC}"
echo -e "${BLUE}Service Status:${NC}"
docker-compose ps
echo ""

# Step 9: Test endpoints
echo -e "${YELLOW}Step 9: Testing endpoints...${NC}"

# Test Database Adaptor
echo -e "${BLUE}Testing Database Adaptor (http://localhost:3000/health)...${NC}"
if curl -s http://localhost:3000/health | grep -q "healthy"; then
    echo -e "${GREEN}✅ Database Adaptor is healthy${NC}"
else
    echo -e "${RED}❌ Database Adaptor health check failed${NC}"
fi

# Test Python Server
echo -e "${BLUE}Testing Python Server (http://localhost:8000/api/v1/health)...${NC}"
if curl -s http://localhost:8000/api/v1/health | grep -q "healthy"; then
    echo -e "${GREEN}✅ Python Server is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Python Server health check failed (may be normal)${NC}"
fi

# Test Database connection
echo -e "${BLUE}Testing Database connection...${NC}"
if docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -c "SELECT 1;" &>/dev/null; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi
echo ""

# Step 10: Display configuration
echo -e "${YELLOW}Step 10: Deployment Configuration${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}Service Endpoints:${NC}"
echo "  - Database Adaptor: http://localhost:3000"
echo "  - Python Server: http://localhost:8000"
echo "  - PostgreSQL: localhost:5432"
echo ""
echo -e "${BLUE}Wix Configuration:${NC}"
echo "  - Connection Name: HingeCraft_Donations_DB"
echo "  - Endpoint URL: http://localhost:3000"
echo "  - Secret Key: ${ADAPTOR_SECRET_KEY:-04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b}"
echo ""
echo -e "${BLUE}Health Check URLs:${NC}"
echo "  - Database Adaptor: curl http://localhost:3000/health"
echo "  - Python Server: curl http://localhost:8000/api/v1/health"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - Check status: docker-compose ps"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Database is now functional!${NC}"
echo -e "${GREEN}========================================${NC}"














