#!/bin/bash
# Export All HTML Files for Legal Pages

cd "$(dirname "$0")/.."

OUTPUT_DIR="ALL_LEGAL_PAGES_HTML"
mkdir -p "$OUTPUT_DIR"

echo "📦 Exporting All Legal Page HTML Files..."
echo ""

count=0
for html_file in src/pages/legal/*.html; do
    if [ -f "$html_file" ]; then
        filename=$(basename "$html_file")
        cp "$html_file" "$OUTPUT_DIR/"
        echo "✅ Exported: $filename"
        count=$((count + 1))
    fi
done

echo ""
echo "✅ Exported $count HTML files to: $OUTPUT_DIR/"
echo ""
echo "📋 Files exported:"
ls -1 "$OUTPUT_DIR" | head -34


