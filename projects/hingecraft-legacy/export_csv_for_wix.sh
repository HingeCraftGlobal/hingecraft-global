#!/bin/bash

# Export donations data to CSV format for Wix Content Manager import

set -e

OUTPUT_FILE="donations_wix_import.csv"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="donations_wix_import_${TIMESTAMP}.csv"

echo "=========================================="
echo "Exporting Donations to CSV for Wix Import"
echo "=========================================="
echo ""

# Check if database container is running
if ! docker ps | grep -q "hingecraft-postgres"; then
    echo "ERROR: PostgreSQL container is not running"
    echo "Start it with: docker-compose up -d"
    exit 1
fi

# Backup existing file if it exists
if [ -f "$OUTPUT_FILE" ]; then
    echo "Backing up existing file to: $BACKUP_FILE"
    cp "$OUTPUT_FILE" "$BACKUP_FILE"
fi

echo "Exporting data from database..."
echo ""

# Export with proper formatting for Wix
docker exec hingecraft-postgres psql -U hingecraft_user -d hingecraft_db -t -A -F',' -c "
SELECT 
    \"_id\", 
    TO_CHAR(\"_createdDate\", 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as \"_createdDate\", 
    TO_CHAR(\"_updatedDate\", 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as \"_updatedDate\", 
    \"_owner\", 
    id, 
    amount, 
    currency, 
    CASE WHEN is_other_amount THEN 'true' ELSE 'false' END as is_other_amount, 
    source, 
    payment_status, 
    COALESCE(payment_method, '') as payment_method, 
    COALESCE(transaction_id, '') as transaction_id, 
    COALESCE(member_email, '') as member_email, 
    COALESCE(member_name, '') as member_name, 
    TO_CHAR(created_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as created_at, 
    TO_CHAR(updated_at, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as updated_at, 
    COALESCE(metadata::text, '') as metadata 
FROM donations 
ORDER BY \"_createdDate\" DESC;
" | awk 'BEGIN {
    print "_id,_createdDate,_updatedDate,_owner,id,amount,currency,is_other_amount,source,payment_status,payment_method,transaction_id,member_email,member_name,created_at,updated_at,metadata"
} {
    print
}' > "$OUTPUT_FILE"

# Count records
TOTAL_RECORDS=$(tail -n +2 "$OUTPUT_FILE" | wc -l | tr -d ' ')

echo "✅ Export complete!"
echo ""
echo "File: $OUTPUT_FILE"
echo "Total records: $TOTAL_RECORDS"
echo ""
echo "CSV file is ready for Wix Content Manager import."
echo ""
echo "To import into Wix:"
echo "1. Go to Content Manager > Collections > donations"
echo "2. Click 'Import' or 'Import Items'"
echo "3. Select the file: $OUTPUT_FILE"
echo "4. Map the columns (Wix should auto-detect)"
echo "5. Click 'Import'"
echo ""













