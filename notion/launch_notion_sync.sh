#!/bin/bash
# Automated Launch Script for HingeCraft Notion Sync
# This script sets up and launches the Notion sync service

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Launching HingeCraft Notion Sync Service..."
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env from template..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Created .env file"
        echo "⚠️  Please update .env with your Notion credentials"
    else
        echo "❌ env.example not found!"
        exit 1
    fi
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
if [ -f "requirements.txt" ]; then
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
else
    pip install -q notion-client python-dotenv requests
fi

# Check Docker (optional)
if command -v docker &> /dev/null; then
    echo "🐳 Docker detected - Docker monitoring enabled"
else
    echo "⚠️  Docker not found - Docker monitoring will be disabled"
fi

# Create necessary directories
mkdir -p sync monitoring webhooks triggers data

# Run initial sync
echo ""
echo "🔄 Running initial sync..."
python3 sync/hingecraft_notion_sync.py --initial-sync || python3 sync/hingecraft_notion_sync.py

# Start monitoring service
echo ""
echo "✅ Initial sync complete!"
echo ""
echo "🔄 Starting 24/7 monitoring service..."
echo "   Press Ctrl+C to stop"
echo ""

# Run monitoring service
python3 sync/hingecraft_notion_sync.py

