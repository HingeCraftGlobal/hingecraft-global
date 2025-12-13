# 📧 Email Template Verification Guide

**Date**: December 12, 2025  
**Purpose**: Verify all email templates using GPT with 30+ prompts

---

## 🎯 Overview

This guide explains how to verify email templates using OpenAI GPT to ensure:
- ✅ Quality and effectiveness
- ✅ CAN-SPAM & GDPR compliance
- ✅ Proper personalization
- ✅ Optimal subject lines
- ✅ Effective CTAs
- ✅ Brand consistency
- ✅ Deliverability optimization

---

## 📋 Prerequisites

### 1. OpenAI API Key

**Location**: `/Users/chandlerfergusen/Desktop/CURSOR/api_keys/openai.json`

**Format**:
```json
{
  "apiKey": "sk-..."
}
```

**To Get API Key**:
1. Go to: https://platform.openai.com/api-keys
2. Create new API key
3. Save to file above

### 2. Install Dependencies

```bash
cd "ML Automation system"
npm install openai --save
```

---

## 🚀 Step-by-Step Process

### Step 1: Initialize Email Templates

First, ensure templates exist in database:

```bash
cd "ML Automation system"
node scripts/init-email-templates.js
```

This will:
- Create default welcome sequence
- Create 5 email steps
- Store templates in `sequences` and `sequence_steps` tables

### Step 2: Verify Templates with GPT

Run GPT verification:

```bash
cd "ML Automation system"
node scripts/verify-templates-with-gpt.js
```

Or directly:

```bash
cd "ML Automation system/tests"
node gpt-template-verifier.js
```

### Step 3: Review Results

Reports generated:
- **JSON**: `email-template-gpt-verification-report.json`
- **HTML**: `email-template-gpt-verification-report.html`

---

## 🔍 Verification Prompts (30+)

The system uses **10 comprehensive verification categories**, each with multiple sub-prompts:

### 1. Email Quality Assessment
- Overall quality score (1-10)
- Clarity and readability
- Professional tone
- Value proposition
- Engagement potential

### 2. CAN-SPAM & GDPR Compliance
- Unsubscribe mechanism
- Physical address requirement
- Sender identification
- Consent language
- Data protection

### 3. Personalization Effectiveness
- Variable usage analysis
- Personalization depth
- Relevance to recipient
- Improvement opportunities
- Dynamic content suggestions

### 4. Subject Line Optimization
- Open rate potential
- Clarity and relevance
- Personalization effectiveness
- Length optimization
- A/B testing suggestions
- Alternative subject lines

### 5. Email Body Analysis
- Structure and flow
- Paragraph length
- Scannability
- Value delivery
- Engagement elements
- Mobile responsiveness

### 6. Call-to-Action Review
- Clarity and visibility
- Action-oriented language
- Placement effectiveness
- Multiple CTA strategy
- Conversion optimization

### 7. Tone & Brand Consistency
- Brand voice alignment
- Professionalism level
- Audience appropriateness
- Consistency across sequence
- Tone recommendations

### 8. Email Deliverability Factors
- Spam trigger words
- HTML structure
- Text-to-image ratio
- Link placement
- Domain reputation

### 9. Segmentation Opportunities
- Lead persona alignment
- Ferguson Matrix stage
- BPSD tags utilization
- Engagement history
- Custom segmentation

### 10. Sequence Flow Analysis
- Step positioning effectiveness
- Delay timing appropriateness
- Progression logic
- Sequence coherence
- Next step recommendations

---

## 📊 Verification Results

### Score Categories

- **Excellent** (8-10): Template is optimal, minimal changes needed
- **Good** (6-8): Template is solid, minor improvements suggested
- **Needs Improvement** (4-6): Template needs significant work
- **Poor** (<4): Template requires major revision

### What Gets Verified

For each template:
1. **Quality Score**: Overall rating (1-10)
2. **Compliance Check**: CAN-SPAM & GDPR status
3. **Effectiveness**: Engagement potential
4. **Personalization**: Variable usage and depth
5. **CTA Clarity**: Call-to-action effectiveness
6. **Tone Consistency**: Brand alignment
7. **Improvements**: Specific recommendations

---

## 🔧 Template Structure

Templates are stored in database tables:

### `sequences` Table
- Sequence definitions
- Types: welcome, nurture, donation, reactivation

### `sequence_steps` Table
- Individual email steps
- Subject templates
- Body templates (HTML)
- Delay hours
- Conditions (JSONB)

### Template Variables

Available variables:
- `{{first_name}}` - Lead's first name
- `{{last_name}}` - Lead's last name
- `{{name}}` - Full name or "there"
- `{{organization}}` - Company name
- `{{email}}` - Email address
- `{{city}}` - City
- `{{country}}` - Country
- Custom variables from `enrichment_data`

---

## 📝 Template Examples

### Welcome Email (Step 1)

**Subject**: `Welcome to HingeCraft, {{first_name}}!`

**Body**:
```html
<p>Hi {{first_name}},</p>
<p>Welcome to HingeCraft! We're excited to have you join our mission.</p>
<p>We're building something special, and we'd love for you to be part of it.</p>
<p>Best regards,<br>The HingeCraft Team</p>
```

### Follow-up Email (Step 2)

**Subject**: `Join the Movement, {{first_name}}`

**Body**:
```html
<p>Hi {{first_name}},</p>
<p>Ready to make an impact? Join thousands of others...</p>
<p><a href="{{cta_url}}">Learn More</a></p>
```

---

## ✅ Verification Checklist

After running verification, check:

- [ ] All templates verified (no errors)
- [ ] Quality scores >= 6 (good or better)
- [ ] Compliance: CAN-SPAM & GDPR passed
- [ ] Personalization: Variables used correctly
- [ ] Subject lines: Optimized for open rates
- [ ] CTAs: Clear and actionable
- [ ] Tone: Consistent with brand
- [ ] Deliverability: No spam triggers
- [ ] Segmentation: Opportunities identified
- [ ] Sequence flow: Logical progression

---

## 🔄 Updating Templates

### Update via SQL

```sql
UPDATE sequence_steps
SET subject_template = 'New Subject',
    body_template = '<p>New body...</p>'
WHERE sequence_id = $1 AND step_number = $2;
```

### Update via Code

```javascript
const sequenceEngine = require('./src/services/sequenceEngine');
// Templates are managed through database
```

---

## 📊 Reports Generated

### JSON Report
- Complete verification data
- All 10+ prompt analyses
- Scores and recommendations
- Issues and improvements

### HTML Report
- Visual summary
- Score breakdown
- Issue highlights
- Recommendations list

---

## 🎯 Next Steps

1. **Initialize Templates**: Run `init-email-templates.js`
2. **Verify with GPT**: Run `verify-templates-with-gpt.js`
3. **Review Reports**: Check HTML report for issues
4. **Update Templates**: Fix issues identified
5. **Re-verify**: Run verification again
6. **Deploy**: Templates ready for production

---

**Status**: ✅ **VERIFICATION SYSTEM READY**  
**Next**: Provide OpenAI API key and run verification
