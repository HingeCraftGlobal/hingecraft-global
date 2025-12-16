# Wix CSV Import Guide

## CSV Files Created

### 1. `donations_wix_import.csv`
- **Contains**: All current donations from your database
- **Format**: Ready for Wix Content Manager import
- **Records**: 3 donations (as of export)

### 2. `donations_wix_template.csv`
- **Contains**: Template with example data
- **Purpose**: Reference for CSV format and structure
- **Use**: When creating new donations manually

---

## How to Import CSV into Wix Content Manager

### Method 1: Import into External Database Collection

Since you're using an external database, you have two options:

#### Option A: Import via Wix Content Manager (Recommended)

1. **Open Wix Content Manager**
   - Go to your Wix site dashboard
   - Click **Content Manager** in the left sidebar
   - Find your **donations** collection (external database)

2. **Import Items**
   - Click on the **donations** collection
   - Look for **"Import"** or **"Import Items"** button (usually in the top right)
   - Click **"Import"**

3. **Select CSV File**
   - Click **"Choose File"** or **"Upload"**
   - Select `donations_wix_import.csv`
   - Wait for file to upload

4. **Map Columns**
   - Wix will show a column mapping screen
   - Verify that columns are mapped correctly:
     - `_id` → _id (Required)
     - `_createdDate` → _createdDate
     - `_updatedDate` → _updatedDate
     - `_owner` → _owner
     - All other fields should auto-map
   - If any columns don't match, manually map them

5. **Import Settings**
   - **Update existing items**: Choose based on your needs
     - If `_id` matches existing item, update it
     - If `_id` doesn't exist, create new item
   - **Skip errors**: Recommended to see what fails

6. **Start Import**
   - Click **"Import"** or **"Start Import"**
   - Wait for import to complete
   - Review any errors or warnings

#### Option B: Import via API (Programmatic)

You can also import via the API using a script:

```bash
# Import CSV via API
while IFS=',' read -r _id _createdDate _updatedDate _owner id amount currency is_other_amount source payment_status payment_method transaction_id member_email member_name created_at updated_at metadata; do
    # Skip header row
    [[ "$_id" == "_id" ]] && continue
    
    curl -X POST "https://multiracial-zavier-acculturative.ngrok-free.dev/donations" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b" \
      -d "{
        \"_id\": \"$_id\",
        \"_createdDate\": \"$_createdDate\",
        \"_updatedDate\": \"$_updatedDate\",
        \"_owner\": \"$_owner\",
        \"id\": \"$id\",
        \"amount\": $amount,
        \"currency\": \"$currency\",
        \"is_other_amount\": $is_other_amount,
        \"source\": \"$source\",
        \"payment_status\": \"$payment_status\",
        \"payment_method\": \"$payment_method\",
        \"transaction_id\": \"$transaction_id\",
        \"member_email\": \"$member_email\",
        \"member_name\": \"$member_name\",
        \"metadata\": $metadata
      }"
done < donations_wix_import.csv
```

---

## CSV File Structure

### Required Wix Fields (Must be present)

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `_id` | Text | ✅ Yes | Unique identifier (Primary Key) |
| `_createdDate` | Date & Time | ✅ Yes | Creation timestamp (ISO 8601 format) |
| `_updatedDate` | Date & Time | ✅ Yes | Last update timestamp (ISO 8601 format) |
| `_owner` | Text | ✅ Yes | Owner identifier (default: 'system') |

### Custom Fields

| Column | Type | Description |
|--------|------|-------------|
| `id` | Text | Alternative ID (maps to _id) |
| `amount` | Number | Donation amount (decimal) |
| `currency` | Text | Currency code (e.g., 'USD') |
| `is_other_amount` | Boolean | Whether it's a custom amount (true/false) |
| `source` | Text | Source of donation (e.g., 'payment_page') |
| `payment_status` | Text | Payment status (e.g., 'completed', 'pending') |
| `payment_method` | Text | Payment method (e.g., 'credit_card', 'paypal') |
| `transaction_id` | Text | Transaction ID from payment processor |
| `member_email` | Text | Member email address |
| `member_name` | Text | Member name |
| `created_at` | Date & Time | Creation timestamp (backward compatibility) |
| `updated_at` | Date & Time | Update timestamp (backward compatibility) |
| `metadata` | JSON | Additional metadata (JSON string) |

---

## Date Format

All date fields use **ISO 8601 format**:
- Format: `YYYY-MM-DDTHH:MM:SSZ`
- Example: `2025-12-01T14:49:01Z`

---

## Boolean Format

Boolean fields use lowercase:
- `true` for true values
- `false` for false values

---

## Regenerating the CSV

To export fresh data from the database:

```bash
cd [PROJECT_ROOT]/HingeCraft
chmod +x export_csv_for_wix.sh
./export_csv_for_wix.sh
```

This will:
- Export all current donations
- Create `donations_wix_import.csv`
- Backup any existing file
- Show total record count

---

## Troubleshooting Import Issues

### Issue: "Column not found" error
**Solution**: Ensure all Wix required columns (`_id`, `_createdDate`, `_updatedDate`, `_owner`) are present in the CSV.

### Issue: "Invalid date format" error
**Solution**: Verify dates are in ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`

### Issue: "Duplicate _id" error
**Solution**: 
- If updating existing items, ensure `_id` values match existing records
- If creating new items, ensure `_id` values are unique

### Issue: "Boolean value invalid" error
**Solution**: Ensure boolean fields use lowercase `true` or `false`

### Issue: Import fails silently
**Solution**:
1. Check Wix Content Manager for error messages
2. Verify external database connection is active
3. Check API logs: `docker logs hingecraft-db-adaptor`
4. Test API endpoint directly

---

## Sample CSV Row

```csv
_id,_createdDate,_updatedDate,_owner,id,amount,currency,is_other_amount,source,payment_status,payment_method,transaction_id,member_email,member_name,created_at,updated_at,metadata
14ae821b-7915-46bc-bd5d-f5c60264f47a,2025-12-01T14:49:01Z,2025-12-01T14:49:02Z,system,14ae821b-7915-46bc-bd5d-f5c60264f47a,25.50,USD,false,payment_page,verified,,,verify@test.com,Verification Test,2025-12-01T14:49:01Z,2025-12-01T14:49:02Z,
```

---

## Files Reference

- **`donations_wix_import.csv`**: Current database export (ready to import)
- **`donations_wix_template.csv`**: Template with example data
- **`export_csv_for_wix.sh`**: Script to regenerate CSV export

---

**Last Updated**: 2025-12-01  
**Status**: ✅ CSV files ready for import













