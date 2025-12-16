#!/bin/bash
# Pull all database data for HingeCraft project

set -e

echo "📊 Pulling all HingeCraft database data..."

cd "$(dirname "$0")"

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "⚠️  Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if PostgreSQL container is running
if ! docker ps | grep -q "hingecraft_postgres\|postgres"; then
    echo "⚠️  PostgreSQL container is not running. Starting it..."
    ./LAUNCH_01_DATABASE.sh
    sleep 5
fi

# Export all data
echo "📤 Exporting all database data..."

docker exec -i hingecraft_postgres psql -U hcuser -d hingecraft -c "
\copy (SELECT * FROM donations ORDER BY created_at DESC) TO '/tmp/donations_export.csv' CSV HEADER;
\copy (SELECT * FROM wallets ORDER BY created_at DESC) TO '/tmp/wallets_export.csv' CSV HEADER;
\copy (SELECT * FROM crypto_transactions ORDER BY created_at DESC) TO '/tmp/crypto_transactions_export.csv' CSV HEADER;
\copy (SELECT * FROM treasury_operations ORDER BY created_at DESC) TO '/tmp/treasury_operations_export.csv' CSV HEADER;
\copy (SELECT * FROM exchange_rates ORDER BY recorded_at DESC) TO '/tmp/exchange_rates_export.csv' CSV HEADER;
"

# Copy exports to local directory
mkdir -p database/exports
docker cp hingecraft_postgres:/tmp/donations_export.csv database/exports/
docker cp hingecraft_postgres:/tmp/wallets_export.csv database/exports/
docker cp hingecraft_postgres:/tmp/crypto_transactions_export.csv database/exports/
docker cp hingecraft_postgres:/tmp/treasury_operations_export.csv database/exports/
docker cp hingecraft_postgres:/tmp/exchange_rates_export.csv database/exports/

echo "✅ All data exported to database/exports/"

# Generate summary
echo "📋 Generating data summary..."
python3 << 'EOF'
import csv
import os
from pathlib import Path

exports_dir = Path("database/exports")
summary = []

for csv_file in exports_dir.glob("*.csv"):
    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        summary.append({
            'file': csv_file.name,
            'rows': len(rows)
        })

print("\n📊 Database Export Summary:")
print("=" * 50)
for item in summary:
    print(f"{item['file']}: {item['rows']} rows")
print("=" * 50)

EOF

echo "✅ Data pull complete!"




