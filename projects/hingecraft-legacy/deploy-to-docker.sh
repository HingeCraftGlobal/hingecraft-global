#!/bin/bash

# HingeCraft Docker Deployment Script
# This script builds and pushes Docker images to Docker Hub

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    # Use safer method to load .env
    set -a
    source .env
    set +a
else
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Check required variables
if [ -z "$DOCKER_USERNAME" ]; then
    echo -e "${RED}Error: DOCKER_USERNAME not set in .env${NC}"
    exit 1
fi

if [ -z "$DOCKER_TOKEN" ]; then
    echo -e "${RED}Error: DOCKER_TOKEN not set in .env${NC}"
    exit 1
fi

# Docker repository (using departmentsai/wix as specified)
REPO="${DOCKER_USERNAME}/wix"
DB_ADAPTOR_IMAGE="${REPO}-db-adaptor"
PYTHON_SERVER_IMAGE="${REPO}-python-server"
VERSION="${1:-latest}"

echo -e "${GREEN}=== HingeCraft Docker Deployment ===${NC}"
echo "Docker Username: $DOCKER_USERNAME"
echo "Repository: $REPO"
echo "Version: $VERSION"
echo ""

# Login to Docker Hub
echo -e "${YELLOW}Logging in to Docker Hub...${NC}"
echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USERNAME" --password-stdin

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Docker login failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Logged in successfully${NC}"
echo ""

# Build Database Adaptor
echo -e "${YELLOW}Building database adaptor image...${NC}"
docker build -t "${DB_ADAPTOR_IMAGE}:${VERSION}" \
    -t "${DB_ADAPTOR_IMAGE}:latest" \
    -f database-adaptor/Dockerfile \
    ./database-adaptor

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Database adaptor build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Database adaptor built successfully${NC}"
echo ""

# Build Python Server
echo -e "${YELLOW}Building Python server image...${NC}"
docker build -t "${PYTHON_SERVER_IMAGE}:${VERSION}" \
    -t "${PYTHON_SERVER_IMAGE}:latest" \
    -f python-server/Dockerfile \
    ./python-server

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Python server build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python server built successfully${NC}"
echo ""

# Push Database Adaptor
echo -e "${YELLOW}Pushing database adaptor to Docker Hub...${NC}"
docker push "${DB_ADAPTOR_IMAGE}:${VERSION}"
docker push "${DB_ADAPTOR_IMAGE}:latest"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Database adaptor push failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Database adaptor pushed successfully${NC}"
echo ""

# Push Python Server
echo -e "${YELLOW}Pushing Python server to Docker Hub...${NC}"
docker push "${PYTHON_SERVER_IMAGE}:${VERSION}"
docker push "${PYTHON_SERVER_IMAGE}:latest"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Python server push failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python server pushed successfully${NC}"
echo ""

# Summary
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo "Images pushed to Docker Hub:"
echo "  - ${DB_ADAPTOR_IMAGE}:${VERSION}"
echo "  - ${DB_ADAPTOR_IMAGE}:latest"
echo "  - ${PYTHON_SERVER_IMAGE}:${VERSION}"
echo "  - ${PYTHON_SERVER_IMAGE}:latest"
echo ""
echo "View images at:"
echo "  - https://hub.docker.com/r/${DB_ADAPTOR_IMAGE}"
echo "  - https://hub.docker.com/r/${PYTHON_SERVER_IMAGE}"
echo ""

# Logout (optional)
read -p "Logout from Docker Hub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker logout
    echo -e "${GREEN}✓ Logged out${NC}"
fi

echo -e "${GREEN}Done!${NC}"

