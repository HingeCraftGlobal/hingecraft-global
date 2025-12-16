#!/bin/bash
# Key Requirement Check
# Ensures encryption key is provided before accessing database files

check_key() {
    if [ -z "${DATABASE_ENCRYPTION_KEY:-}" ]; then
        echo "🔒 ACCESS DENIED"
        echo ""
        echo "❌ Database access requires encryption key"
        echo ""
        echo "Usage:"
        echo "  export DATABASE_ENCRYPTION_KEY=your_key"
        echo "  # Then run your database command"
        echo ""
        echo "🔑 Key Required for:"
        echo "  - Database initialization"
        echo "  - Data access"
        echo "  - File decryption"
        echo ""
        exit 1
    fi
    echo "✅ Key verified"
}

check_key



