#!/bin/bash
# Zero-Attention Service Startup Script for HingeCraft
# This script ensures all services start and stay running

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Starting HingeCraft Services (Zero-Attention Mode) ===${NC}"

# Load environment variables
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Check Docker
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running${NC}"
  exit 1
fi

# Login to Docker Hub (if needed)
echo -e "${YELLOW}Ensuring Docker Hub authentication...${NC}"
if [ -n "$DOCKER_TOKEN" ]; then
  echo "$DOCKER_TOKEN" | docker login -u "${DOCKER_USERNAME:-departmentsai}" --password-stdin > /dev/null 2>&1 || true
fi

# Pull latest images
echo -e "${YELLOW}Pulling latest images from Docker Hub...${NC}"
docker compose pull || echo -e "${YELLOW}Warning: Some images may not be available yet${NC}"

# Start services
echo -e "${YELLOW}Starting services...${NC}"
docker compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 10

# Check service status
echo -e "${GREEN}Service Status:${NC}"
docker compose ps

# Health checks
echo ""
echo -e "${YELLOW}Running health checks...${NC}"

# Check database adaptor
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Database Adaptor: Healthy${NC}"
else
  echo -e "${YELLOW}⚠ Database Adaptor: Starting... (may take a moment)${NC}"
fi

# Check Python server
if curl -f http://localhost:8000/api/v1/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Python Server: Healthy${NC}"
else
  echo -e "${YELLOW}⚠ Python Server: Starting... (may take a moment)${NC}"
fi

echo ""
echo -e "${GREEN}=== Services Started ===${NC}"
echo ""
echo "Services are configured with 'restart: always' - they will automatically:"
echo "  - Restart if they crash"
echo "  - Start on system reboot (if Docker Desktop auto-starts)"
echo "  - Recover from failures"
echo ""
echo "View logs: docker compose logs -f"
echo "Check status: docker compose ps"
echo "Stop services: docker compose down"



