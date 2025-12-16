#!/bin/bash
# Quick script to push Docker images after restarting Docker Desktop

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Pushing HingeCraft Images to Docker Hub ===${NC}"
echo ""

# Check Docker
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running${NC}"
  echo "Please start Docker Desktop and try again"
  exit 1
fi

# Login
echo -e "${YELLOW}Logging in to Docker Hub...${NC}"
echo "dckr_pat_k8ZdXrNQIvCKXjN3wSbwd8PyZUQ" | docker login -u departmentsai --password-stdin

if [ $? -ne 0 ]; then
  echo -e "${RED}Login failed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Logged in successfully${NC}"
echo ""

# Push database adaptor
echo -e "${YELLOW}Pushing database adaptor...${NC}"
docker push departmentsai/wix-db-adaptor:latest

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Database adaptor pushed successfully${NC}"
else
  echo -e "${RED}✗ Failed to push database adaptor${NC}"
  exit 1
fi

echo ""

# Push Python server
echo -e "${YELLOW}Pushing Python server...${NC}"
docker push departmentsai/wix-python-server:latest

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Python server pushed successfully${NC}"
else
  echo -e "${RED}✗ Failed to push Python server${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}=== All images pushed successfully! ===${NC}"
echo ""
echo "Next steps:"
echo "1. Run: ./auto-deploy-all.sh"
echo "2. Or start services: docker-compose up -d"



