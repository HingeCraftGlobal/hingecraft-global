#!/bin/bash
# Database Decryption Script
# Decrypts database files using encryption key

set -e

ENCRYPTION_KEY="${DATABASE_ENCRYPTION_KEY:-}"
ENCRYPTED_DIR="${ENCRYPTED_DATABASE_DIR:-database/encrypted}"
OUTPUT_DIR="${DECRYPTED_DATABASE_DIR:-database/decrypted}"

if [ -z "$ENCRYPTION_KEY" ]; then
    echo "❌ ERROR: DATABASE_ENCRYPTION_KEY environment variable required"
    echo ""
    echo "Usage:"
    echo "  DATABASE_ENCRYPTION_KEY=your_key ./scripts/decrypt_database.sh"
    echo ""
    echo "🔑 Access Key Required"
    exit 1
fi

if [ ! -d "$ENCRYPTED_DIR" ]; then
    echo "⚠️  No encrypted files found in $ENCRYPTED_DIR"
    echo "📝 Files may not be encrypted, or encryption directory is different"
    exit 0
fi

echo "🔓 Decrypting database files..."
echo "📁 Encrypted directory: $ENCRYPTED_DIR"
echo "📁 Output directory: $OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Decrypt files
find "$ENCRYPTED_DIR" -name "*.enc" -type f | while read file; do
    output_file="$OUTPUT_DIR/$(basename $file .enc)"
    echo "🔓 Decrypting: $(basename $file)"
    
    openssl enc -aes-256-cbc -d -pbkdf2 \
        -in "$file" \
        -out "$output_file" \
        -pass pass:"$ENCRYPTION_KEY" 2>/dev/null || {
        gpg --decrypt --passphrase "$ENCRYPTION_KEY" -o "$output_file" "$file" 2>/dev/null || {
            echo "❌ Error: Failed to decrypt $(basename $file)"
            echo "   Check that encryption key is correct"
            exit 1
        }
    }
done

echo "✅ Database files decrypted to $OUTPUT_DIR"
echo "🔒 Remember to secure decrypted files after use"

