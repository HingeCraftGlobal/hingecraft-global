# Wix Embed Instructions for SC Legal Documents

## Quick Embed Method

For each legal page in Wix Editor:

### Step 1: Add HTML Embed Element
1. Open page in Wix Editor
2. Click **Add (+)** → **Embed** → **HTML iframe**
3. Drag element to desired position on page

### Step 2: Configure Element
1. Click on the HTML element
2. Click **Enter Code**
3. Copy/paste the HTML content from the corresponding file in `COMPLETE_LEGAL_DOCS_SC/`
4. Click **Update**

### Step 3: Set Element ID
1. Right-click on the element
2. Click **View Properties**
3. Set ID to: `legalContent`

### Step 4: Save and Publish
1. Click **Save**
2. Click **Publish**

---

## Document Quick Reference

| Document | File to Copy |
|----------|--------------|
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
| AI Training Consent | `15-AI-Training-Use-Consent.html` |
| Refunds/Warranty | `16-Refunds-Warranty-Return-Policy.html` |
| IP Licensing | `17-Intellectual-Property-Creator-Licensing.html` |
| Code of Conduct | `18-Community-Code-of-Conduct.html` |
| Product Liability | `19-Product-Liability-Safety-Disclosure.html` |
| Membership Terms | `20-Membership-Terms-Rights.html` |
| Manufacturing Agreement | `21-Manufacturing-Production-Agreement.html` |
| Merchant Agreement | `22-Marketplace-Merchant-Agreement.html` |
| Ethical Sourcing | `23-Materials-Sourcing-Ethical-Compliance.html` |
| AI Safety | `24-AI-Safety-Bias-Governance.html` |
| Algorithmic Transparency | `25-Algorithmic-Transparency-Accountability.html` |
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

## Alternative: Velo Code Method

If you prefer to use Velo code instead of embeds, the `.js` files in `src/pages/` have been updated with the content already. Just run:

```bash
cd /Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global
wix dev
# Then in a new terminal:
wix publish
# Select "Local code" when prompted
```

---

## Files Location

All HTML files: `/Users/chandlerfergusen/Desktop/CURSOR/hingecraft-global/COMPLETE_LEGAL_DOCS_SC/`

Index: `00-INDEX-ALL-DOCUMENTS.html`



