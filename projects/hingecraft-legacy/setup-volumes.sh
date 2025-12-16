#!/bin/bash
# Setup Docker volumes with initialization data
# This ensures all data is stored in Docker volumes, not on host filesystem

export PATH="/usr/local/bin:$PATH"
cd [PROJECT_ROOT]/HingeCraft

echo "📦 Setting up Docker volumes with all data..."

# Create volumes if they don't exist
docker volume create hingecraft_database_init 2>/dev/null || true
docker volume create hingecraft_postgres_data 2>/dev/null || true
docker volume create hingecraft_db_adaptor_logs 2>/dev/null || true
docker volume create hingecraft_python_server_logs 2>/dev/null || true

# Copy init.sql into the database_init volume
echo "📋 Copying init.sql into Docker volume..."
if [ -f "database/init.sql" ]; then
    # Use a simpler approach - create a temp container to copy the file
    docker run --rm \
      -v "$(pwd)/database/init.sql:/source/init.sql:ro" \
      -v hingecraft_database_init:/target \
      alpine:latest sh -c "cp /source/init.sql /target/init.sql 2>/dev/null && chmod 644 /target/init.sql && echo 'File copied successfully'" || {
        echo "⚠️  Warning: Could not copy init.sql to volume (will use bind mount as fallback)"
        # Fallback: use bind mount in docker-compose
    }
else
    echo "⚠️  Warning: database/init.sql not found"
fi

echo "✅ All volumes created and initialized"
echo ""
echo "Volumes created:"
echo "  - hingecraft_postgres_data (database data)"
echo "  - hingecraft_database_init (init scripts)"
echo "  - hingecraft_db_adaptor_logs (API logs)"
echo "  - hingecraft_python_server_logs (Python logs)"
echo ""
echo "All data is now stored in Docker volumes!"

