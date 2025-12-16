#!/bin/bash

# Update all files to use HTTPS instead of HTTP for localhost
# Wix requires HTTPS connections

cd [PROJECT_ROOT]/HingeCraft

echo "Updating all files to use HTTPS for Wix connection..."

# Update markdown files
find . -name "*.md" -type f -exec sed -i '' \
  -e 's|http://localhost:3000|https://multiracial-zavier-acculturative.ngrok-free.dev
  -e 's|localhost:3000|YOUR_NGROK_URL.ngrok.io|g' \
  -e 's|http://localhost|https://multiracial-zavier-acculturative.ngrok-free.dev
  {} \;

# Add warnings about HTTPS requirement
find . -name "*.md" -type f -exec grep -l "Endpoint URL" {} \; | while read file; do
  if ! grep -q "REQUIRES HTTPS" "$file"; then
    sed -i '' '/Endpoint URL/a\
\
**⚠️ IMPORTANT**: Wix requires HTTPS. Use ngrok tunnel (https://multiracial-zavier-acculturative.ngrok-free.dev
' "$file"
  fi
done

echo "✅ All files updated to use HTTPS"
echo "⚠️ Remember: Wix requires HTTPS - use ngrok or production URL"














