#!/bin/bash
# Status check script - shows detailed service information

export PATH="/usr/local/bin:$PATH"
cd [PROJECT_ROOT]/HingeCraft

echo "📊 Docker Compose Status:"
echo "========================"
docker compose ps

echo ""
echo "🔍 Health Checks:"
echo "=================="

# Check Database Adaptor
echo -n "Database Adaptor (port 3000): "
if curl -s -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Healthy"
    curl -s http://localhost:3000/health | head -1
else
    echo "❌ Not responding"
fi

# Check Python Server
echo -n "Python Server (port 8000): "
if curl -s -f http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    echo "✅ Healthy"
    curl -s http://localhost:8000/api/v1/health | head -1
else
    echo "❌ Not responding"
fi

echo ""
echo "📋 Recent Logs (last 5 lines per service):"
echo "=========================================="
docker compose logs --tail=5 2>&1


