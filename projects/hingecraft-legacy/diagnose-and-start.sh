#!/bin/bash
# Diagnostic and startup script - bypasses hanging issues

set -e

export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft

echo "🔍 HingeCraft Diagnostic & Startup"
echo "=================================="
echo ""

# Step 1: Check Docker
echo "1️⃣ Checking Docker..."
if command -v docker &> /dev/null; then
    echo "   ✅ Docker found: $(which docker)"
    docker --version
else
    echo "   ❌ Docker not found in PATH"
    if [ -f "/usr/local/bin/docker" ]; then
        echo "   ✅ Found at /usr/local/bin/docker"
        export PATH="/usr/local/bin:$PATH"
    else
        echo "   ❌ Docker not found. Please install Docker Desktop."
        exit 1
    fi
fi

# Step 2: Check Docker daemon
echo ""
echo "2️⃣ Checking Docker daemon..."
if docker info &> /dev/null; then
    echo "   ✅ Docker daemon is running"
else
    echo "   ❌ Docker daemon not running"
    echo "   Please start Docker Desktop and try again"
    exit 1
fi

# Step 3: Check docker-compose
echo ""
echo "3️⃣ Checking docker compose..."
if docker compose version &> /dev/null; then
    echo "   ✅ Docker Compose found"
    docker compose version
else
    echo "   ❌ Docker Compose not found"
    exit 1
fi

# Step 4: Check init.sql
echo ""
echo "4️⃣ Checking database init file..."
if [ -f "database/init.sql" ]; then
    echo "   ✅ database/init.sql exists"
    echo "   📄 File size: $(wc -l < database/init.sql) lines"
else
    echo "   ⚠️  database/init.sql not found - will create minimal version"
    mkdir -p database
    cat > database/init.sql << 'EOF'
-- HingeCraft Donations Database
CREATE TABLE IF NOT EXISTS donations (
    id VARCHAR(255) PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    is_other_amount BOOLEAN DEFAULT FALSE,
    source VARCHAR(100) DEFAULT 'payment_page',
    payment_status VARCHAR(50) DEFAULT 'completed',
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255) UNIQUE,
    member_email VARCHAR(255),
    member_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
EOF
    echo "   ✅ Created minimal database/init.sql"
fi

# Step 5: Validate docker-compose.yml
echo ""
echo "5️⃣ Validating docker-compose.yml..."
if docker compose config &> /dev/null; then
    echo "   ✅ docker-compose.yml is valid"
else
    echo "   ❌ docker-compose.yml has errors:"
    docker compose config 2>&1 | head -20
    exit 1
fi

# Step 6: Stop existing containers
echo ""
echo "6️⃣ Stopping existing containers (if any)..."
docker compose down 2>/dev/null || true
echo "   ✅ Cleaned up"

# Step 7: Start services
echo ""
echo "7️⃣ Starting services..."
echo "   This may take a minute to pull images..."
if docker compose up -d; then
    echo "   ✅ Services started"
else
    echo "   ❌ Failed to start services"
    echo ""
    echo "   Checking logs..."
    docker compose logs --tail=50
    exit 1
fi

# Step 8: Wait and check status
echo ""
echo "8️⃣ Waiting for services to initialize..."
sleep 8

echo ""
echo "9️⃣ Service Status:"
docker compose ps

echo ""
echo "🔟 Health Check:"
echo "   Checking services..."

# Check PostgreSQL
if docker compose exec -T postgres pg_isready -U hingecraft_user -d hingecraft_db &> /dev/null; then
    echo "   ✅ PostgreSQL: Healthy"
else
    echo "   ⚠️  PostgreSQL: Starting..."
fi

# Check Node.js API
if curl -f -s http://localhost:3000/health &> /dev/null; then
    echo "   ✅ Database Adaptor (Node.js): Healthy"
else
    echo "   ⚠️  Database Adaptor: Starting... (may take 30-60 seconds)"
fi

# Check Python API
if curl -f -s http://localhost:8000/api/v1/health &> /dev/null; then
    echo "   ✅ Python Server: Healthy"
else
    echo "   ⚠️  Python Server: Starting... (may take 30-60 seconds)"
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📊 Quick Commands:"
echo "   Status:    docker compose ps"
echo "   Logs:      docker compose logs -f"
echo "   Stop:      docker compose down"
echo "   Restart:   docker compose restart"
echo ""
echo "🌐 Endpoints:"
echo "   Database:     localhost:5432"
echo "   Node.js API:  http://localhost:3000/health"
echo "   Python API:   http://localhost:8000/api/v1/health"
echo ""

