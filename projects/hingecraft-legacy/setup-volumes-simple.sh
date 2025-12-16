#!/bin/bash
# Simplified volume setup - creates volumes without copying files
# The init.sql will be mounted directly from host (read-only)

export PATH="/usr/local/bin:$PATH"
cd [PROJECT_ROOT]/HingeCraft

echo "📦 Creating Docker volumes..."

# Create volumes (they'll be created automatically by docker-compose if they don't exist)
# But we create them explicitly here for clarity
docker volume create hingecraft_postgres_data 2>/dev/null && echo "✅ Created postgres_data volume" || echo "ℹ️  postgres_data volume already exists"
docker volume create hingecraft_db_adaptor_logs 2>/dev/null && echo "✅ Created db_adaptor_logs volume" || echo "ℹ️  db_adaptor_logs volume already exists"
docker volume create hingecraft_python_server_logs 2>/dev/null && echo "✅ Created python_server_logs volume" || echo "ℹ️  python_server_logs volume already exists"

echo ""
echo "✅ Volumes ready!"
echo ""
echo "Note: init.sql will be mounted directly from ./database/init.sql (read-only)"
echo "This ensures the database schema is always up-to-date."


