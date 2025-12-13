#!/bin/bash

# Run all database migrations
# Usage: ./scripts/run-migrations.sh

set -e

DB_CONTAINER="${DB_CONTAINER:-hingecraft-payment-db}"
DB_USER="${DB_USER:-hingecraft_user}"
DB_NAME="${DB_NAME:-hingecraft}"

echo "🔄 Running database migrations..."

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    echo "❌ Container ${DB_CONTAINER} is not running"
    echo "   Start it with: docker-compose up -d db"
    exit 1
fi

# Run migrations in order
for migration in migrations/00*.sql; do
    if [ -f "$migration" ]; then
        echo "📄 Running $(basename $migration)..."
        docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" < "$migration"
        echo "   ✅ Complete"
    fi
done

echo "✅ All migrations complete!"
