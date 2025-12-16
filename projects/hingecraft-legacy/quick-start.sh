#!/bin/bash
# Quick start script - bypasses volume setup issues

export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft

echo "🚀 Quick Start - HingeCraft Services"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found in PATH"
    echo "Trying /usr/local/bin/docker..."
    if [ -f "/usr/local/bin/docker" ]; then
        export PATH="/usr/local/bin:$PATH"
    else
        echo "❌ Docker not found. Please ensure Docker Desktop is running."
        exit 1
    fi
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is available"
echo ""

# Check if init.sql exists
if [ ! -f "database/init.sql" ]; then
    echo "⚠️  Warning: database/init.sql not found"
    echo "Creating minimal init.sql..."
    mkdir -p database
    cat > database/init.sql << 'EOF'
-- Minimal HingeCraft database initialization
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    donor_name VARCHAR(255),
    donor_email VARCHAR(255),
    donor_country VARCHAR(100),
    donor_city_org VARCHAR(255),
    one_line VARCHAR(500),
    letter_text TEXT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_donor_email ON donations(donor_email);
EOF
    echo "✅ Created database/init.sql"
fi

echo "📦 Starting services..."
echo ""

# Stop any existing containers
docker compose down 2>/dev/null || true

# Start services
if docker compose up -d; then
    echo ""
    echo "✅ Services started!"
    echo ""
    echo "Waiting for services to be healthy..."
    sleep 5
    
    echo ""
    echo "📊 Service Status:"
    docker compose ps
    
    echo ""
    echo "🔍 Health Checks:"
    echo "  - Database: http://localhost:5432"
    echo "  - API (Node.js): http://localhost:3000/health"
    echo "  - API (Python): http://localhost:8000/api/v1/health"
    echo ""
    echo "📝 View logs: docker compose logs -f"
    echo "🛑 Stop services: docker compose down"
else
    echo ""
    echo "❌ Failed to start services"
    echo "Check logs with: docker compose logs"
    exit 1
fi

