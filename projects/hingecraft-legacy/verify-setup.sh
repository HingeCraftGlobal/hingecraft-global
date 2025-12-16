#!/bin/bash
# Verify Docker volumes and services setup

export PATH="/usr/local/bin:$PATH"
cd [PROJECT_ROOT]/HingeCraft

echo "🔍 Verifying Docker Setup..."
echo ""

echo "📦 Docker Volumes:"
echo "=================="
docker volume ls | grep -E "(hingecraft|NAME)" || echo "No volumes found"

echo ""
echo "🐳 Docker Containers:"
echo "====================="
docker compose ps 2>&1 || docker ps -a | grep hingecraft || echo "No containers found"

echo ""
echo "📋 Checking init.sql in volume:"
echo "================================"
if docker run --rm -v hingecraft_database_init:/data alpine ls -la /data/init.sql 2>/dev/null; then
    echo "✅ init.sql found in volume"
else
    echo "❌ init.sql not found in volume"
    echo "   Run: ./setup-volumes.sh"
fi

echo ""
echo "🌐 Service Health Checks:"
echo "========================="
if curl -s -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Database Adaptor: Running"
else
    echo "❌ Database Adaptor: Not responding"
fi

if curl -s -f http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    echo "✅ Python Server: Running"
else
    echo "❌ Python Server: Not responding"
fi

echo ""
echo "📊 Complete Status:"
echo "==================="
docker compose ps 2>&1


