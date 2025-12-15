#!/bin/bash
# Database Encryption Script
# Encrypts all sensitive database files with a key

set -e

ENCRYPTION_KEY="${DATABASE_ENCRYPTION_KEY:-}"
OUTPUT_DIR="${ENCRYPTED_DATABASE_DIR:-database/encrypted}"

if [ -z "$ENCRYPTION_KEY" ]; then
    echo "❌ ERROR: DATABASE_ENCRYPTION_KEY environment variable not set"
    echo "Usage: DATABASE_ENCRYPTION_KEY=your_key ./scripts/encrypt_database.sh"
    exit 1
fi

echo "🔐 Encrypting database files..."
echo "📁 Output directory: $OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Encrypt sensitive SQL files
find database -name "*.sql" -type f | while read file; do
    if [[ "$file" == *"init"* ]] || [[ "$file" == *"data"* ]] || [[ "$file" == *"insert"* ]]; then
        echo "🔒 Encrypting: $file"
        openssl enc -aes-256-cbc -salt -pbkdf2 \
            -in "$file" \
            -out "$OUTPUT_DIR/$(basename $file).enc" \
            -pass pass:"$ENCRYPTION_KEY" 2>/dev/null || {
            echo "⚠️  Warning: openssl not available, using gpg fallback"
            gpg --symmetric --cipher-algo AES256 --passphrase "$ENCRYPTION_KEY" -o "$OUTPUT_DIR/$(basename $file).enc" "$file" 2>/dev/null || {
                echo "❌ Error: No encryption tool available (openssl or gpg required)"
                exit 1
            }
        }
    fi
done

echo "✅ Database files encrypted"
echo "🔑 Key required to decrypt: DATABASE_ENCRYPTION_KEY"

