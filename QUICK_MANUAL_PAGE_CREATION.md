# ⚡ Quick Manual Page Creation Guide

## 🎯 Fastest Method: Bulk Create in Wix Editor

**Time Estimate:** 30-45 minutes for all 34 pages

---

## Step 1: Open Wix Editor
1. Go to: https://editor.wix.com
2. Open your site

## Step 2: Create Legal Folder
1. Click **Pages** in left sidebar
2. Click **Add Page** → **Add Folder**
3. Name: **Legal**
4. Click **Save**

## Step 3: Use This Checklist (Copy-Paste Friendly)

### Corporate Governance (6 pages)
- [ ] Corporate Formation Charter → `/legal/corporate_formation_charter`
- [ ] Corporate Bylaws → `/legal/corporate_bylaws`
- [ ] Stakeholder Ethos & Ethics Charter → `/legal/stakeholder_ethos_ethics_charter`
- [ ] Board Member Agreement → `/legal/board_member_agreement`
- [ ] Corporate Risk Register → `/legal/corporate_risk_register`
- [ ] Corporate Social Responsibility → `/legal/corporate_social_responsibility`

### Platform Legal (7 pages)
- [ ] Cookie Policy → `/legal/cookie_policy`
- [ ] Terms of Service → `/legal/terms_of_service`
- [ ] End User License Agreement → `/legal/end_user_license_agreement`
- [ ] Acceptable Use Policy → `/legal/acceptable_use_policy`
- [ ] Export Compliance → `/legal/export_compliance`
- [ ] Service Level Agreement → `/legal/service_level_agreement`
- [ ] Refunds & Warranty Policy → `/legal/refunds_warranty_policy`

### Data & AI Governance (6 pages)
- [ ] Privacy Policy → `/legal/privacy_policy`
- [ ] Data Processing Agreement → `/legal/data_processing_agreement`
- [ ] AI Training Consent → `/legal/ai_training_consent`
- [ ] Sensitive Data Consent → `/legal/sensitive_data_consent`
- [ ] Algorithmic Transparency → `/legal/algorithmic_transparency`
- [ ] AI Safety & Governance → `/legal/ai_safety_governance`

### Marketplace & Licensing (5 pages)
- [ ] Creator Licensing Agreement → `/legal/creator_licensing_agreement`
- [ ] Marketplace Merchant Agreement → `/legal/marketplace_merchant_agreement`
- [ ] Manufacturing Agreement → `/legal/manufacturing_agreement`
- [ ] Attribution & Derivative Rights → `/legal/attribution_derivative_rights`
- [ ] Digital Asset & NFT Ownership → `/legal/digital_asset_nft_ownership`

### Hardware & Product (3 pages)
- [ ] Product Liability Disclosure → `/legal/product_liability_disclosure`
- [ ] Warranty & Repair Policy → `/legal/warranty_repair_policy`
- [ ] Materials Sourcing Compliance → `/legal/materials_sourcing_compliance`

### Membership & Community (3 pages)
- [ ] Membership Terms & Rights → `/legal/membership_terms_rights`
- [ ] Community Code of Conduct → `/legal/community_code_of_conduct`
- [ ] Academic Integrity Policy → `/legal/academic_integrity_policy`

### International (2 pages)
- [ ] Global Compliance Framework → `/legal/global_compliance_framework`
- [ ] Cross-Border Data Transfer → `/legal/crossborder_data_transfer`

### Movement & Charter (2 pages)
- [ ] Charter of Abundance → `/legal/charter_of_abundance`
- [ ] Pledge & Participation Agreement → `/legal/pledge_participation_agreement`

---

## Step 4: For Each Page (Quick Process)

1. **Add Page:**
   - Click **Add Page** → **Blank Page**
   - Name: [From checklist above]
   - URL: [From checklist above]

2. **Add Content:**
   - Drag **HTML** element onto page
   - Set Element ID: `legalContent`
   - Click element → **Settings** → **HTML Code**
   - Copy entire `<body>` content from: `src/pages/legal/[file].html`
   - Paste into HTML element
   - Click **Update**

3. **Configure SEO:**
   - Click page settings (gear icon)
   - Set SEO title: [Page Name] | HingeCraft Global
   - Set SEO description: [From HTML meta description]
   - Save

4. **Save Page:**
   - Click **Save** (top right)

**Repeat for all 34 pages**

---

## Step 5: Add to Navigation

1. Click **Menus** in left sidebar
2. Select your main menu
3. Click **Add Item** → **Page**
4. Select all Legal pages
5. Create dropdown: **Legal**
6. Save

---

## Step 6: Publish

1. Click **Publish** (top right)
2. All 34 pages will go live

---

## ⚡ Pro Tips for Speed

1. **Create all pages first** (just names/URLs) - 5 minutes
2. **Then add content** to all pages - 20 minutes
3. **Then configure SEO** for all pages - 10 minutes
4. **Then add to navigation** - 5 minutes

**Total: ~40 minutes**

---

## 📁 HTML Files Location

All HTML files are in: `src/pages/legal/`

File naming matches checklist order:
- `01-corporate-formation-charter.html`
- `02-corporate-bylaws.html`
- ... (through 34)

---

## ✅ After Creation

Once pages are created:
- ✅ .js code files will automatically attach
- ✅ Pages will appear in Wix Editor
- ✅ Ready to publish

---

**Status:** Ready for manual creation  
**Time:** ~30-45 minutes  
**Files:** All prepared and ready




