#!/bin/bash
# Simple start script - adds Docker to PATH and starts services
# All data is stored in Docker volumes (zero host filesystem dependencies)

export PATH="/usr/local/bin:$PATH"
cd /Users/chandlerfergusen/Desktop/CURSOR/HingeCraft

echo "📦 Setting up Docker volumes (all data stored in Docker)..."
./setup-volumes-simple.sh

echo ""
echo "🚀 Starting HingeCraft services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "✅ Services started! Use './docker-helper.sh status' to check health"

