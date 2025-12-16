#!/bin/bash
# ============================================================
# DEPLOY HINGECRAFT GLOBAL TO WIX - RUN THIS IN YOUR TERMINAL
# ============================================================

echo "============================================================"
echo "HINGECRAFT GLOBAL - DEPLOY TO WIX"
echo "============================================================"
echo ""

cd [PROJECT_ROOT]/hingecraft-global

echo "Step 1: Starting Wix Dev Mode..."
echo "This will sync all 99 pages with SEO optimizations"
echo ""
echo "Run: wix dev"
echo ""
echo "Step 2: After sync completes, in a NEW terminal run:"
echo "   cd [PROJECT_ROOT]/hingecraft-global"
echo "   wix publish"
echo ""
echo "   When prompted, select: Local code"
echo ""
echo "============================================================"
echo "WHAT'S BEING DEPLOYED:"
echo "============================================================"
echo ""
echo "✓ 99 Wix pages with full SEO meta descriptions"
echo "✓ 99 JSON-LD schema markups"
echo "✓ 34 Complete SC legal documents"
echo "✓ 50+ competitive keywords integrated"
echo "✓ All dates updated to December 6, 2025"
echo ""
echo "============================================================"

# Start wix dev
wix dev



