#!/bin/bash

# HingeCraft Complete Auto-Deployment Script
# This script automates the entire deployment process:
# 1. Docker Hub login
# 2. Build and push Docker images
# 3. Start Docker Compose services
# 4. Health checks
# 5. Git push (if authenticated)

# Don't exit on error immediately - we want to see what's happening
set +e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== HingeCraft Complete Auto-Deployment ===${NC}"
echo ""

# Load environment variables from .env
echo -e "${BLUE}Loading environment variables...${NC}"
if [ -f .env ]; then
  # Use a safer method to load .env
  set -a
  source .env
  set +a
  echo -e "${GREEN}✓ .env file loaded${NC}"
else
  echo -e "${RED}Error: .env file not found${NC}"
  echo "Please create .env file based on .env.example"
  exit 1
fi

# Check Docker daemon (macOS compatible - no timeout command needed)
echo -e "${BLUE}Checking Docker daemon...${NC}"
if docker info > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Docker daemon is running${NC}"
else
  echo -e "${RED}Error: Docker daemon is not running or not responding${NC}"
  echo "Please start Docker Desktop and try again"
  echo ""
  echo "Trying to diagnose..."
  docker info 2>&1 | head -10
  exit 1
fi

# Check required variables
echo -e "${BLUE}Verifying configuration...${NC}"
if [ -z "$DOCKER_USERNAME" ]; then
  echo -e "${RED}Error: DOCKER_USERNAME not set in .env${NC}"
  exit 1
fi
echo -e "${GREEN}✓ DOCKER_USERNAME: $DOCKER_USERNAME${NC}"

if [ -z "$DOCKER_TOKEN" ]; then
  echo -e "${RED}Error: DOCKER_TOKEN not set in .env${NC}"
  exit 1
fi
echo -e "${GREEN}✓ DOCKER_TOKEN: [configured]${NC}"

if [ -z "$DOCKER_REPOSITORY" ]; then
  DOCKER_REPOSITORY="${DOCKER_USERNAME}/wix"
  echo -e "${YELLOW}⚠ DOCKER_REPOSITORY not set, using default: $DOCKER_REPOSITORY${NC}"
else
  echo -e "${GREEN}✓ DOCKER_REPOSITORY: $DOCKER_REPOSITORY${NC}"
fi

echo ""
echo -e "${YELLOW}--- Part 1: Docker Hub Deployment ---${NC}"
if [ ! -f "./deploy-to-docker.sh" ]; then
  echo -e "${RED}Error: deploy-to-docker.sh not found${NC}"
  exit 1
fi

chmod +x ./deploy-to-docker.sh
./deploy-to-docker.sh

DEPLOY_EXIT_CODE=$?
if [ $DEPLOY_EXIT_CODE -ne 0 ]; then
  echo -e "${RED}Error: Docker deployment failed (exit code: $DEPLOY_EXIT_CODE)${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}--- Part 2: Start Docker Compose Services ---${NC}"
echo -e "${BLUE}Stopping existing services...${NC}"
docker-compose down 2>/dev/null || true  # Stop any existing services
echo -e "${BLUE}Starting services...${NC}"
docker-compose up -d

COMPOSE_EXIT_CODE=$?
if [ $COMPOSE_EXIT_CODE -ne 0 ]; then
  echo -e "${RED}Error: Failed to start Docker Compose services (exit code: $COMPOSE_EXIT_CODE)${NC}"
  echo -e "${YELLOW}Checking Docker Compose logs...${NC}"
  docker-compose logs --tail=20
  exit 1
fi

echo -e "${GREEN}✓ Docker Compose services started${NC}"

# Wait for services to be ready
echo ""
echo -e "${YELLOW}--- Part 3: Waiting for services to be ready ---${NC}"
echo -e "${BLUE}Waiting 15 seconds for services to initialize...${NC}"
sleep 15

# Health checks
echo -e "\n${YELLOW}--- Part 4: Health Checks ---${NC}"

# Check Node.js API
echo -n "Checking Node.js API (port 3000)... "
if curl -s http://localhost:3000/health | grep -q "healthy" || curl -s http://localhost:3000/health | grep -q "ok"; then
  echo -e "${GREEN}✓ Healthy${NC}"
else
  echo -e "${YELLOW}⚠ Not responding yet (may need more time)${NC}"
fi

# Check Python Server
echo -n "Checking Python Server (port 8000)... "
if curl -s http://localhost:8000/api/v1/health 2>/dev/null | grep -q "healthy" || curl -s http://localhost:8000/health 2>/dev/null | grep -q "ok"; then
  echo -e "${GREEN}✓ Healthy${NC}"
else
  echo -e "${YELLOW}⚠ Not responding yet (may need more time)${NC}"
fi

# Check PostgreSQL
echo -n "Checking PostgreSQL (port 5432)... "
if docker-compose exec -T postgres pg_isready -U hingecraft_user -d hingecraft_db > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Healthy${NC}"
else
  echo -e "${YELLOW}⚠ Not ready yet${NC}"
fi

# Git push (optional - won't fail if not authenticated)
echo -e "\n${YELLOW}--- Part 5: Git Push (Optional) ---${NC}"
if git status > /dev/null 2>&1; then
  git add . 2>/dev/null || true
  git commit -m "HingeCraft: Automated deployment with departmentsai/wix Docker Hub" 2>/dev/null || true
  if git push -u origin main 2>/dev/null || git push 2>/dev/null; then
    echo -e "${GREEN}✓ Changes pushed to GitHub${NC}"
  else
    echo -e "${YELLOW}⚠ Git push skipped (not authenticated or no changes)${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Not a git repository or git not configured${NC}"
fi

# Summary
echo -e "\n${GREEN}=== Deployment Summary ===${NC}"
echo "Docker Username: $DOCKER_USERNAME"
echo "Docker Repository: $DOCKER_REPOSITORY"
echo ""
echo "Services:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Node.js API: http://localhost:3000"
echo "  - Python Server: http://localhost:8000"
echo ""
echo "Docker Images:"
echo "  - ${DOCKER_REPOSITORY}-db-adaptor:latest"
echo "  - ${DOCKER_REPOSITORY}-python-server:latest"
echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Configure Wix Secrets Manager with:"
echo "   - EXTERNAL_DB_ENDPOINT: http://localhost:3000"
echo "   - EXTERNAL_DB_SECRET_KEY: (from .env ADAPTOR_SECRET_KEY)"
echo "2. Set up Wix External Database connection"
echo "3. Add payment-page-integration.js to your Wix payment page"
echo "4. Test the donation flow"
