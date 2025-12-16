#!/bin/bash

# HingeCraft ML Automation System - Quick Start Script

echo "🚀 HingeCraft ML Automation System - Quick Start"
echo "================================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✓ PostgreSQL found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Setup database
echo ""
echo "🗄️  Setting up database..."
node database/setup.js

# Create logs directory
mkdir -p logs

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update config/api_keys.js with your API credentials"
echo "2. Start the server: npm start"
echo "3. Visit http://localhost:3001/auth/google to authorize Google Drive access"
echo ""
echo "📚 See README.md for detailed documentation"
