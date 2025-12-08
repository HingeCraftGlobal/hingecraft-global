#!/bin/bash
# ============================================================
# PUSH SC LEGAL DOCUMENTS LIVE TO WIX
# HingeCraft Global, LLC - South Carolina Legal Package
# ============================================================

echo "============================================================"
echo "HINGECRAFT GLOBAL - SC LEGAL DOCUMENTS DEPLOYMENT"
echo "============================================================"
echo ""

cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global

# Step 1: Show updated pages
echo "STEP 1: Pages Updated with SC Legal Content"
echo "------------------------------------------------------------"
echo "21 existing Wix pages updated with new SC legal content:"
echo "  ✓ Terms Of Service"
echo "  ✓ Privacy Policy"
echo "  ✓ End User License Agreement"
echo "  ✓ Corporate Bylaws"
echo "  ✓ Corporate Social Responsibility"
echo "  ✓ Acceptable Use Policy"
echo "  ✓ Data Processing Agreement"
echo "  ✓ AI Training Consent"
echo "  ✓ Refunds Warranty Policy"
echo "  ✓ Licensing Agreement"
echo "  ✓ Community Code of Conduct"
echo "  ✓ Membership Terms Rights"
echo "  ✓ AI Safety Governance"
echo "  ✓ Algorithmic Transparency"
echo "  ✓ Attribution Derivative Rights"
echo "  ✓ Academic Integrity Policy"
echo "  ✓ Sensitive Data Consent"
echo "  ✓ Global Compliance Framework"
echo "  ✓ CrossBorder Data Transfer"
echo "  ✓ Charter of Abundance"
echo "  ✓ Ethos"
echo ""

echo "13 new pages created in src/pages/legal/:"
ls -la src/pages/legal/*_SC.js 2>/dev/null | awk '{print "  ✓ " $NF}'
echo ""

# Step 2: Start Wix Dev
echo "STEP 2: Starting Wix Dev Mode"
echo "------------------------------------------------------------"
echo "Run this command in your terminal:"
echo ""
echo "    cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global"
echo "    wix dev"
echo ""
echo "This will open the Local Editor to verify changes."
echo ""

# Step 3: Publish
echo "STEP 3: Publishing Live"
echo "------------------------------------------------------------"
echo "After verifying in the Local Editor, run:"
echo ""
echo "    wix publish"
echo ""
echo "Select 'Local code' when prompted to publish your changes."
echo ""

# Step 4: Verify
echo "STEP 4: Verification URLs"
echo "------------------------------------------------------------"
echo "After publishing, verify these pages are live:"
echo ""
echo "  https://www.hingecraft.com/terms-of-service"
echo "  https://www.hingecraft.com/privacy-policy"
echo "  https://www.hingecraft.com/ethos"
echo "  https://www.hingecraft.com/corporate-bylaws"
echo ""

echo "============================================================"
echo "COMPLETE LEGAL PACKAGE DOCUMENTATION"
echo "============================================================"
echo ""
echo "All 34 SC legal documents are located at:"
echo "  /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/COMPLETE_LEGAL_DOCS_SC/"
echo ""
echo "Index file: 00-INDEX-ALL-DOCUMENTS.html"
echo "Documentation: LEGAL_PACKAGE_DOCUMENTATION.md"
echo ""
echo "============================================================"
echo "READY TO DEPLOY"
echo "============================================================"



