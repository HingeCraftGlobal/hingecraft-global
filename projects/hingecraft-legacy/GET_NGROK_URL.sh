#!/bin/bash

# Get ngrok HTTPS URL automatically

echo "Getting ngrok URL..."

# Wait for ngrok to be ready
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -oE 'https://[a-zA-Z0-9-]+\.(ngrok-free\.app|ngrok\.io)' | head -1)
    if [ -n "$NGROK_URL" ]; then
        echo "✅ ngrok URL found: $NGROK_URL"
        echo ""
        echo "=== WIX CONFIGURATION ==="
        echo "Connection Name: HingeCraftDonationsDB"
        echo "Endpoint URL: $NGROK_URL"
        echo "Secret Key: 04f1ddd99fdfdc3e89cdd0d714b735feda43fa3aecfd39df946e4e24de163c1b"
        echo ""
        echo "$NGROK_URL" > NGROK_URL.txt
        echo "✅ URL saved to NGROK_URL.txt"
        exit 0
    fi
    sleep 1
done

echo "⚠ ngrok URL not found"
echo "Make sure ngrok is running: ngrok http 3000"
echo "Then check: http://localhost:4040"














