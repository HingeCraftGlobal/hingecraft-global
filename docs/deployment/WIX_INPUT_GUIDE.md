# HingeCraft Global - Wix Input Guide

## Quick Launch Commands

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
wix dev
# Then in new terminal:
wix publish
```

---

## Method 1: Wix CLI (Automatic)

All 99 page files in `src/pages/` are already configured with:
- SEO meta descriptions
- JSON-LD schema markups
- Legal document content (for legal pages)

Just run `wix dev` then `wix publish` to sync everything.

---

## Method 2: Manual Input via Wix Editor

### For Legal Documents (HTML Embed):

1. **Open Wix Editor**: https://editor.wix.com
2. **Go to the page** you want to add legal content
3. **Add Element**: Click + → Embed → HTML iframe
4. **Enter Code**: Copy HTML from `COMPLETE_LEGAL_DOCS_SC/[document].html`
5. **Set Element ID**: Right-click → Properties → ID: `legalContent`
6. **Save & Publish**

### Legal Document Files:

| Document | File |
|----------|------|
| Corporate Formation | `01-Corporate-Formation-Charter.html` |
| Operating Agreement | `02-Operating-Agreement-Bylaws.html` |
| Stakeholder Ethics | `03-Stakeholder-Ethos-Ethics-Charter.html` |
| Board Member Agreement | `04-Board-Member-Agreement.html` |
| Risk Register | `05-Corporate-Risk-Register-Mitigation-Protocol.html` |
| CSR Compliance | `06-Corporate-Social-Responsibility-Compliance.html` |
| Terms of Service | `07-Universal-Terms-of-Service.html` |
| EULA | `08-End-User-License-Agreement.html` |
| Acceptable Use | `09-Acceptable-Use-Safety-Policy.html` |
| Export Compliance | `10-Export-Compliance-ITAR-EAR.html` |
| SLA | `11-Service-Level-Agreement.html` |
| Privacy Policy | `12-Privacy-Policy-GDPR-CCPA-COPPA.html` |
| DPA | `13-Data-Processing-Agreement.html` |
| Cookie Policy | `14-Cookie-Tracking-Policy.html` |
| AI Training | `15-AI-Training-Use-Consent.html` |
| Refunds/Warranty | `16-Refunds-Warranty-Return-Policy.html` |
| IP Licensing | `17-Intellectual-Property-Creator-Licensing.html` |
| Code of Conduct | `18-Community-Code-of-Conduct.html` |
| Product Liability | `19-Product-Liability-Safety-Disclosure.html` |
| Membership Terms | `20-Membership-Terms-Rights.html` |
| Manufacturing | `21-Manufacturing-Production-Agreement.html` |
| Merchant Agreement | `22-Marketplace-Merchant-Agreement.html` |
| Ethical Sourcing | `23-Materials-Sourcing-Ethical-Compliance.html` |
| AI Safety | `24-AI-Safety-Bias-Governance.html` |
| Algorithm Transparency | `25-Algorithmic-Transparency-Accountability.html` |
| NFT Terms | `26-Digital-Asset-NFT-Ownership.html` |
| Attribution Rights | `27-Attribution-Distribution-Derivative-Rights.html` |
| Academic Use | `28-Academic-Integrity-Institutional-Use.html` |
| Youth Consent | `29-Sensitive-Data-Youth-Consent.html` |
| Global Compliance | `30-Global-Compliance-Framework.html` |
| Data Transfer | `31-Cross-Border-Data-Transfer-Hosting.html` |
| Abundance Charter | `32-Charter-of-Abundance-Resilience-Governance.html` |
| Collective Impact | `33-Pledge-Participation-Collective-Impact.html` |
| Employee Handbook | `34-Employee-Handbook-Policies.html` |

---

## Method 3: SEO via Wix Dashboard

### For SEO Settings:

1. **Open Wix Dashboard**: https://manage.wix.com
2. **Go to**: Marketing & SEO → SEO Tools
3. **Select Page** to edit
4. **Enter SEO Data** from `seo_markups/[page]_seo.json`:
   - Title
   - Description
   - Keywords

### JSON-LD Structured Data:

1. **Go to**: Settings → Custom Code
2. **Add Code** to `<head>`:
   - Copy JSON-LD from the SEO file
   - Wrap in `<script type="application/ld+json">`

Example:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "HingeCraft Global",
  ...
}
</script>
```

---

## File Locations

```
/hingecraft-global/
├── COMPLETE_LEGAL_DOCS_SC/     # 34 legal HTML documents
├── seo_markups/                # 99 SEO JSON files
├── src/pages/                  # 99 Wix page .js files
└── WIX_INPUT_GUIDE.md          # This guide
```

---

## All Dates: December 6, 2025
## All URLs: HTTPS Only
## Jurisdiction: South Carolina, USA

---

© 2025 HingeCraft Global, LLC



