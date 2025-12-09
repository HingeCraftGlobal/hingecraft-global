#!/bin/bash

# Prepare Frontend Pages for Wix Deployment
# Copies frontend pages to deployment-ready folder with instructions

echo "=== 🌐 Frontend Pages Deployment Helper ==="
echo ""

OUTPUT_DIR="deployment-ready/frontend-pages"
mkdir -p "$OUTPUT_DIR"

# Copy frontend pages
echo "📦 Copying frontend pages..."
echo ""

if [ -f "frontend-pages/mission-support-form.html" ]; then
    cp "frontend-pages/mission-support-form.html" "$OUTPUT_DIR/mission-support-form.html"
    size=$(wc -c < "frontend-pages/mission-support-form.html" | tr -d ' ')
    echo "✅ Copied: mission-support-form.html ($(numfmt --to=iec-i --suffix=B $size 2>/dev/null || echo "${size}B"))"
else
    echo "⚠️  Missing: mission-support-form.html"
fi

if [ -f "frontend-pages/charter-page.html" ]; then
    cp "frontend-pages/charter-page.html" "$OUTPUT_DIR/charter-page.html"
    size=$(wc -c < "frontend-pages/charter-page.html" | tr -d ' ')
    echo "✅ Copied: charter-page.html ($(numfmt --to=iec-i --suffix=B $size 2>/dev/null || echo "${size}B"))"
else
    echo "⚠️  Missing: charter-page.html"
fi

if [ -f "frontend-pages/charter-page-other-amount.js" ]; then
    cp "frontend-pages/charter-page-other-amount.js" "$OUTPUT_DIR/charter-page-other-amount.js"
    size=$(wc -c < "frontend-pages/charter-page-other-amount.js" | tr -d ' ')
    echo "✅ Copied: charter-page-other-amount.js ($(numfmt --to=iec-i --suffix=B $size 2>/dev/null || echo "${size}B"))"
else
    echo "⚠️  Missing: charter-page-other-amount.js"
fi

echo ""
echo "=========================================="

# Create deployment instructions
cat > "$OUTPUT_DIR/DEPLOYMENT_INSTRUCTIONS.md" << 'EOF'
# Frontend Pages Deployment Instructions

**Location:** Wix Editor → Pages → [Page Name] → Add HTML Element

---

## Mission Support Page (`/payment`)

### Steps:

1. Open Wix Editor → Pages → Payment Page
2. Click "Add" → "HTML Element"
3. Set Element ID: `missionSupportForm` or `root`
4. Open `mission-support-form.html`
5. Copy **entire content** from the file
6. Paste into HTML Element
7. Click "Save"
8. Verify form displays correctly

### Verification:

- [ ] Form displays correctly
- [ ] All form fields visible
- [ ] Payment method selector works
- [ ] Form validation works
- [ ] No console errors

---

## Charter Page (`/charter`)

### Steps:

1. Open Wix Editor → Pages → Charter Page
2. Click "Add" → "HTML Element" (or use existing element)
3. Open `charter-page.html`
4. Copy **entire content** from the file
5. Paste into HTML Element
6. Click "Save"
7. Verify page displays correctly

### Verification:

- [ ] Page displays correctly
- [ ] Donation amount displays when URL parameter present
- [ ] Checkout button appears
- [ ] No console errors

---

## Additional Files

### charter-page-other-amount.js

This file contains supporting JavaScript for the Charter page.  
It should be included automatically in `charter-page.html`.

If needed separately:
1. Add as Custom Code → JavaScript
2. Or include in HTML Element

---

## Troubleshooting

**Form not displaying?**
- Verify HTML Element is added to page
- Check Element ID is set correctly
- Ensure entire content is copied (including `<script>` tags)
- Check browser console for errors

**Form validation not working?**
- Verify backend functions are uploaded
- Check function names match exactly
- Verify secrets are configured
- Check network tab for API errors

**Payment redirect not working?**
- Verify payment method selector works
- Check redirect URLs are correct
- Verify backend functions are accessible
- Check console for errors

---

**Status:** Ready for Deployment  
**Next Action:** Add HTML elements to Wix pages
EOF

echo "✅ Deployment instructions created: $OUTPUT_DIR/DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo "📋 Files ready in: $OUTPUT_DIR/"
echo ""
echo "=== ✅ Preparation Complete ==="

