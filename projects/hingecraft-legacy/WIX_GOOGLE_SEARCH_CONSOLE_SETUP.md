# Google Search Console Setup Guide for Wix

## 📋 Overview

This guide will walk you through connecting your HingeCraft Global Wix site to Google Search Console so you can monitor search performance, submit sitemaps, and optimize your site's visibility in Google search results.

---

## 🎯 Prerequisites

- A Google account
- Access to your Wix site editor
- Your Wix site must be published (not just in preview mode)
- Your site URL: `https://www.hingecraft-global.ai` (or your actual domain)

---

## 📝 Step-by-Step Setup

### Step 1: Access Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with your Google account
3. Click **"Add Property"** or **"Start now"** if this is your first time

### Step 2: Add Your Property

You have two options to verify ownership:

#### Option A: Domain Property (Recommended)
1. Select **"Domain"** property type
2. Enter your domain: `hingecraft-global.ai` (without https:// or www)
3. Click **"Continue"**

#### Option B: URL Prefix Property
1. Select **"URL prefix"** property type
2. Enter your full URL: `https://www.hingecraft-global.ai`
3. Click **"Continue"**

### Step 3: Verify Ownership

Google will provide several verification methods. For Wix sites, use one of these:

#### Method 1: HTML Tag (Easiest for Wix)

1. **In Google Search Console:**
   - Select **"HTML tag"** verification method
   - Copy the meta tag provided (looks like: `<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />`)

2. **In Wix Editor:**
   - Go to **Settings** → **SEO (Google)**
   - Scroll to **"Google Search Console"** section
   - Paste the verification code in the **"Google Search Console Verification"** field
   - Click **"Save"**
   - **Publish your site** (important!)

3. **Back in Google Search Console:**
   - Click **"Verify"**
   - You should see a success message

#### Method 2: DNS Record (If you have domain access)

1. In Google Search Console, select **"DNS record"** method
2. Add the TXT record to your domain's DNS settings
3. Wait for DNS propagation (can take up to 48 hours)
4. Click **"Verify"** in Google Search Console

#### Method 3: HTML File Upload (Not recommended for Wix)

This method requires file upload access, which Wix doesn't provide directly.

### Step 4: Submit Your Sitemap

After verification, submit your sitemap to help Google index your pages:

1. **In Google Search Console:**
   - Go to **"Sitemaps"** in the left sidebar
   - Enter your sitemap URL: `https://www.hingecraft-global.ai/sitemap.xml`
   - Click **"Submit"**

   **Note:** Wix automatically generates sitemaps. The URL is usually:
   - `https://your-site.wixsite.com/your-site/sitemap.xml` (for free Wix sites)
   - `https://www.yourdomain.com/sitemap.xml` (for custom domain sites)

2. **Verify Sitemap:**
   - Google will process your sitemap
   - Check back in a few hours to see if pages are being indexed

### Step 5: Request Indexing (Optional)

To speed up indexing of your homepage:

1. In Google Search Console, go to **"URL Inspection"** (top search bar)
2. Enter your homepage URL: `https://www.hingecraft-global.ai`
3. Click **"Request Indexing"**
4. Google will crawl and index your page (usually within a few hours)

---

## 🔧 Wix-Specific Settings

### Enable SEO in Wix

1. **In Wix Editor:**
   - Go to **Settings** → **SEO (Google)**
   - Make sure **"Enable SEO"** is turned ON

### Set Up SEO Basics

1. **Homepage SEO Settings:**
   - Go to **Pages** → Select your homepage
   - Click **"SEO"** tab
   - Set your page title (see `WIX_HOMEPAGE_SEO_SETUP.md` for details)
   - Add meta description
   - Add keywords (optional)

2. **Site-Wide SEO:**
   - Go to **Settings** → **SEO (Google)**
   - Set default site title
   - Set default meta description
   - Add site keywords

### Connect Google Analytics (Optional but Recommended)

1. **In Wix Editor:**
   - Go to **Settings** → **Marketing Integrations**
   - Click **"Connect"** next to Google Analytics
   - Enter your Google Analytics tracking ID (starts with `G-` or `UA-`)
   - Click **"Save"**

---

## ✅ Verification Checklist

After setup, verify everything is working:

- [ ] Property added in Google Search Console
- [ ] Ownership verified successfully
- [ ] Sitemap submitted and processed
- [ ] Homepage SEO title set (see `WIX_HOMEPAGE_SEO_SETUP.md`)
- [ ] Meta description added
- [ ] Site published in Wix
- [ ] URL Inspection shows your homepage
- [ ] Request indexing completed (optional)

---

## 📊 What to Monitor

Once connected, you can monitor:

1. **Performance:**
   - Search queries that bring users to your site
   - Click-through rates (CTR)
   - Average position in search results
   - Impressions

2. **Coverage:**
   - Which pages are indexed
   - Any indexing errors
   - Sitemap status

3. **Enhancements:**
   - Mobile usability
   - Core Web Vitals
   - Rich results eligibility

---

## 🐛 Troubleshooting

### Verification Failed

**Problem:** Verification fails even after adding the meta tag.

**Solutions:**
1. Make sure you **published** your Wix site after adding the verification code
2. Wait a few minutes for changes to propagate
3. Try clearing your browser cache
4. Use a different verification method (DNS record)

### Sitemap Not Found

**Problem:** Google can't find your sitemap.

**Solutions:**
1. Check if Wix has generated a sitemap (usually automatic)
2. Try the sitemap URL in your browser to verify it exists
3. For custom domains, the sitemap URL might be different
4. Contact Wix support if sitemap is missing

### Pages Not Indexing

**Problem:** Your pages aren't showing up in Google search.

**Solutions:**
1. Make sure your site is published (not in preview mode)
2. Check if pages are blocked by robots.txt (unlikely with Wix)
3. Request indexing manually via URL Inspection
4. Wait 1-2 weeks for Google to crawl (normal timeframe)
5. Ensure pages have unique, descriptive content

---

## 📚 Additional Resources

- [Google Search Console Help](https://support.google.com/webmasters)
- [Wix SEO Guide](https://support.wix.com/en/article/improving-your-seo-in-wix)
- [Google Search Console Documentation](https://developers.google.com/search-console)

---

## 🎯 Next Steps

After setting up Google Search Console:

1. ✅ Set your homepage title (see `WIX_HOMEPAGE_SEO_SETUP.md`)
2. ✅ Add meta descriptions to all pages
3. ✅ Monitor performance weekly
4. ✅ Fix any indexing errors
5. ✅ Optimize based on search query data

---

**Last Updated:** 2025-01-27  
**Status:** Complete Setup Guide













