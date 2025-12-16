#!/bin/bash
# Docker Helper Script - Works from Python virtual environment
# This script adds Docker to PATH and runs docker commands

# Add Docker to PATH
export PATH="/usr/local/bin:$PATH"

# Change to HingeCraft directory
cd [PROJECT_ROOT]/HingeCraft

# Run the requested command or default to status
if [ "$1" = "up" ]; then
    echo "🚀 Starting services..."
    docker compose up -d
    sleep 3
    docker compose ps
elif [ "$1" = "down" ]; then
    echo "🛑 Stopping services..."
    docker compose down
elif [ "$1" = "logs" ]; then
    echo "📋 Viewing logs..."
    docker compose logs -f
elif [ "$1" = "status" ] || [ -z "$1" ]; then
    echo "📊 Service Status:"
    docker compose ps
    echo ""
    echo "🔍 Health Checks:"
    curl -s http://localhost:3000/health 2>/dev/null && echo "✅ Database Adaptor: Healthy" || echo "❌ Database Adaptor: Not responding"
    curl -s http://localhost:8000/api/v1/health 2>/dev/null && echo "✅ Python Server: Healthy" || echo "❌ Python Server: Not responding"
else
    # Pass through any other command
    docker compose "$@"
fi


