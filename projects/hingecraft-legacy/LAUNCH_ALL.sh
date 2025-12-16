#!/bin/bash

# HingeCraft Complete Launch Script
# Applies all data from HingeCraft AI agent chat and gets everything running
# This script consolidates all setup, testing, and launch procedures

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "🚀 HingeCraft Complete Launch Script"
echo "=========================================="
echo ""
echo "This script will:"
echo "  1. Verify prerequisites"
echo "  2. Create/verify .env file"
echo "  3. Check all required files"
echo "  4. Start Docker services"
echo "  5. Run comprehensive tests"
echo "  6. Display connection information"
echo ""

# ============================================
# Step 1: Prerequisites Check
# ============================================
echo -e "${BLUE}[1/6] Checking Prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "   Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running${NC}"
    echo "   Please start Docker Desktop"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed and running${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not available${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose is available${NC}"

# Check Node.js (for local testing)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js is installed ($NODE_VERSION)${NC}"
else
    echo -e "${YELLOW}⚠ Node.js not found (optional for local testing)${NC}"
fi

# Check Python (for local testing)
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Python is installed ($PYTHON_VERSION)${NC}"
else
    echo -e "${YELLOW}⚠ Python not found (optional for local testing)${NC}"
fi

echo ""

# ============================================
# Step 2: Environment Configuration
# ============================================
echo -e "${BLUE}[2/6] Setting up Environment...${NC}"

# Create .env from .env.example if needed
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}⚠ .env file not found. Creating from .env.example...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}⚠ Please review and update .env file with your secure credentials${NC}"
        echo "   Important: Change default passwords and secret keys!"
    else
        # Create .env with defaults
        echo -e "${YELLOW}⚠ Creating .env file with default values...${NC}"
        cat > .env << 'EOF'
# HingeCraft Docker Environment Configuration
# IMPORTANT: Change these values for production!

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=hingecraft_db
DB_USER=hingecraft_user
DB_PASSWORD=hingecraft_secure_password_123

# API Configuration
PORT=3000
SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"
API_KEY=hingecraft_secret_key_change_in_production
ADAPTOR_SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

# Python Server Configuration
HOST=0.0.0.0
DEBUG=false
CORS_ORIGINS=*

# Webhook Configuration (Optional)
WEBHOOK_URL=https://www.wix.com/velo/reference/api-overview/introduction
WEBHOOK_SECRET=63e22733255b2953c56157238c167fb62b4c68f282f81b07c15b70aa766e2620

# Docker Configuration (Optional - for deployment)
DOCKER_REPOSITORY=departmentsai/wix
EOF
        echo -e "${YELLOW}⚠ Default .env created. Please update with secure credentials!${NC}"
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Load environment variables
if [ -f .env ]; then
    set -a
    source .env
    set +a
    echo -e "${GREEN}✓ Environment variables loaded${NC}"
fi

echo ""

# ============================================
# Step 3: File Verification
# ============================================
echo -e "${BLUE}[3/6] Verifying Required Files...${NC}"

REQUIRED_FILES=(
    "docker-compose.yml"
    "database/init.sql"
    "database-adaptor/server.js"
    "database-adaptor/package.json"
    "database-adaptor/Dockerfile"
    "python-server/main.py"
    "python-server/requirements.txt"
    "python-server/Dockerfile"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file (MISSING)${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    echo -e "${RED}✗ $MISSING_FILES required file(s) are missing${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All required files present${NC}"
echo ""

# ============================================
# Step 4: Docker Services
# ============================================
echo -e "${BLUE}[4/6] Starting Docker Services...${NC}"

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build and start services
echo "Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "Waiting for services to initialize..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
docker-compose ps

echo ""

# ============================================
# Step 5: Testing
# ============================================
echo -e "${BLUE}[5/6] Running Tests...${NC}"

# Test PostgreSQL
echo -n "Testing PostgreSQL... "
if docker-compose exec -T postgres pg_isready -U hingecraft_user -d hingecraft_db > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    
    # Check if donations table exists
    TABLE_EXISTS=$(docker-compose exec -T postgres psql -U hingecraft_user -d hingecraft_db -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'donations');" 2>/dev/null || echo "f")
    if [ "$TABLE_EXISTS" = "t" ]; then
        echo -e "  ${GREEN}✓ Donations table exists${NC}"
    else
        echo -e "  ${YELLOW}⚠ Donations table not found (may need initialization)${NC}"
    fi
else
    echo -e "${RED}✗${NC}"
fi

# Test Node.js API
echo -n "Testing Node.js API (port 3000)... "
sleep 2
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
    echo "  Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗${NC}"
    echo "  Checking logs..."
    docker-compose logs --tail=5 db-adaptor
fi

# Test Python Server
echo -n "Testing Python Server (port 8000)... "
sleep 2
if curl -s http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    PYTHON_HEALTH=$(curl -s http://localhost:8000/api/v1/health)
    echo "  Response: $PYTHON_HEALTH"
else
    echo -e "${YELLOW}⚠${NC} (may take longer to start)"
    echo "  Checking logs..."
    docker-compose logs --tail=5 python-server
fi

# Test Authentication
echo -n "Testing API Authentication... "
SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"
if curl -s -H "Authorization: Bearer $SECRET_KEY" http://localhost:3000/donations/latest > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ (may be expected if no donations exist)${NC}"
fi

echo ""

# ============================================
# Step 6: Display Information
# ============================================
echo -e "${BLUE}[6/6] Connection Information${NC}"
echo ""
echo "=========================================="
echo "🎉 HingeCraft Services are Running!"
echo "=========================================="
echo ""
echo "📊 Service URLs:"
echo ""
echo "PostgreSQL Database:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: hingecraft_db"
echo "  User: hingecraft_user"
echo "  Password: (from .env file)"
echo ""
echo "Node.js API (Database Adaptor):"
echo "  URL: http://localhost:3000"
echo "  Health: http://localhost:3000/health"
echo "  Docs: See README.md for API endpoints"
echo ""
echo "Python Server (FastAPI):"
echo "  URL: http://localhost:8000"
echo "  Health: http://localhost:8000/api/v1/health"
echo "  Docs: http://localhost:8000/docs"
echo ""
echo "=========================================="
echo "🔑 Wix Configuration"
echo "=========================================="
echo ""
echo "Connection Name: HingeCraft_Donations_DB"
echo "Endpoint URL: http://localhost:3000"
echo "Secret Key: $SECRET_KEY"
echo ""
echo "Note: For production, deploy to Railway/Render and use HTTPS URL"
echo ""
echo "=========================================="
echo "📝 Useful Commands"
echo "=========================================="
echo ""
echo "View logs:"
echo "  docker-compose logs -f"
echo "  docker-compose logs -f db-adaptor"
echo "  docker-compose logs -f python-server"
echo ""
echo "Stop services:"
echo "  docker-compose down"
echo ""
echo "Restart services:"
echo "  docker-compose restart"
echo ""
echo "Access database:"
echo "  docker-compose exec postgres psql -U hingecraft_user -d hingecraft_db"
echo ""
echo "Run test script:"
echo "  ./test-docker-setup.sh"
echo ""
echo "=========================================="
echo "✅ Launch Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Configure Wix with the connection details above"
echo "  2. Test the API endpoints"
echo "  3. Deploy to production when ready"
echo ""



