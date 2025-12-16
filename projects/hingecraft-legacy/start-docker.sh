#!/bin/bash

# HingeCraft Docker Startup Script
# Ensures all services are running and ready for website testing

echo "=========================================="
echo "Starting HingeCraft Docker Services"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠ .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "⚠ Please edit .env file with your credentials before continuing"
        echo ""
        echo "Required values:"
        echo "  DB_PASSWORD=your_secure_password"
        echo "  ADAPTOR_SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"
        echo ""
        read -p "Press Enter after editing .env file..."
    else
        echo "✗ .env.example not found"
        exit 1
    fi
fi

# Start services
echo "Starting Docker services..."
docker-compose up -d

echo ""
echo "Waiting for services to initialize..."
sleep 10

# Check services
echo ""
echo "Checking service status..."
docker-compose ps

echo ""
echo "=========================================="
echo "Service URLs"
echo "=========================================="
echo ""
echo "PostgreSQL Database:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: hingecraft_db"
echo "  User: hingecraft_user"
echo "  Password: (from .env file)"
echo ""
echo "Node.js API:"
echo "  URL: http://localhost:3000"
echo "  Health: http://localhost:3000/health"
echo ""
echo "Python Server:"
echo "  URL: http://localhost:8000"
echo "  Health: http://localhost:8000/api/v1/health"
echo ""

# Get secret key for Wix configuration
SECRET_KEY="04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"

echo "=========================================="
echo "Wix Configuration"
echo "=========================================="
echo ""
echo "Connection Name: HingeCraft_Donations_DB"
echo "Endpoint URL: http://localhost:3000"
echo "Secret Key: $SECRET_KEY"
echo ""
echo "Note: For production, use a tunnel (ngrok) or deploy to Railway/Render"
echo ""

# Test health endpoints
echo "Testing health endpoints..."
echo ""

if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✓ Node.js API is healthy"
else
    echo "✗ Node.js API is not responding"
fi

if curl -s http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    echo "✓ Python Server is healthy"
else
    echo "✗ Python Server is not responding"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Services are running. You can now:"
echo "1. Test the APIs using the URLs above"
echo "2. Configure Wix with the connection details"
echo "3. Run test-docker-setup.sh for full verification"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"
echo ""



