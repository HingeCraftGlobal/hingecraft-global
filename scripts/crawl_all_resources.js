/**
 * HingeCraft Resource Crawler
 * Extracts and verifies thousands of links from:
 * - Database exports
 * - Repository files
 * - Site pages
 * 
 * Usage: node crawl_all_resources.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PQueue = require('p-queue');
const { JSDOM } = require('jsdom');
const cheerio = require('cheerio');

// Configuration
const CONCURRENCY = 10;
const TIMEOUT = 15000;
const MAX_REDIRECTS = 10;

// Output files
const OUTPUT_DIR = '/tmp/hingecraft_resources';
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Extract URLs from CSV/JSON files
 */
function extractUrlsFromFiles() {
  const urls = new Set();
  const files = [
    '/tmp/hingecraft_payments.csv',
    '/tmp/hingecraft_wallets.csv',
    '/tmp/hingecraft_external_payments.csv',
    '/tmp/hingecraft_crypto_payments.csv',
    '/tmp/hingecraft_stripe_payments.csv',
    '/tmp/hingecraft_payments.json',
    '/tmp/hingecraft_wallets.json',
    '/tmp/hingecraft_external_payments.json',
    '/tmp/hingecraft_crypto_payments.json',
    '/tmp/hingecraft_stripe_payments.json'
  ];
  
  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Extract HTTP/HTTPS URLs
      const urlRegex = /https?:\/\/[^\s"<>{}|\\^`\[\]]+/gi;
      const matches = content.match(urlRegex);
      
      if (matches) {
        matches.forEach(url => {
          // Normalize URL (remove tracking params)
          const normalized = normalizeUrl(url);
          if (normalized) urls.add(normalized);
        });
      }
      
      // If JSON, parse and extract from objects
      if (file.endsWith('.json')) {
        const data = JSON.parse(content);
        extractUrlsFromObject(data, urls);
      }
    } catch (error) {
      console.warn(`⚠️  Could not process ${file}:`, error.message);
    }
  });
  
  return Array.from(urls);
}

/**
 * Extract URLs from nested objects
 */
function extractUrlsFromObject(obj, urls) {
  if (typeof obj !== 'object' || obj === null) return;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && /^https?:\/\//.test(value)) {
      const normalized = normalizeUrl(value);
      if (normalized) urls.add(normalized);
    } else if (typeof value === 'object') {
      extractUrlsFromObject(value, urls);
    }
  }
}

/**
 * Normalize URL (remove tracking params, etc.)
 */
function normalizeUrl(url) {
  try {
    const u = new URL(url);
    // Remove common tracking params
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'fbclid', 'gclid'];
    trackingParams.forEach(param => u.searchParams.delete(param));
    
    return u.toString();
  } catch (e) {
    return null;
  }
}

/**
 * Extract URLs from repository files
 */
function extractUrlsFromRepo(repoPath = './') {
  const urls = new Set();
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      // Skip node_modules, .git, etc.
      if (file.startsWith('.') || file === 'node_modules') return;
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (/\.(html|js|jsx|ts|tsx|json|md)$/i.test(file)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Extract HTTP/HTTPS URLs
          const urlRegex = /https?:\/\/[^\s"<>{}|\\^`\[\]]+/gi;
          const matches = content.match(urlRegex);
          
          if (matches) {
            matches.forEach(url => {
              const normalized = normalizeUrl(url);
              if (normalized) urls.add(normalized);
            });
          }
        } catch (error) {
          // Skip binary or unreadable files
        }
      }
    });
  }
  
  walkDir(repoPath);
  return Array.from(urls);
}

/**
 * Check URL health
 */
async function checkUrl(url) {
  try {
    const response = await axios.head(url, {
      maxRedirects: MAX_REDIRECTS,
      timeout: TIMEOUT,
      validateStatus: () => true // Don't throw on any status
    });
    
    return {
      url,
      status: response.status,
      finalUrl: response.request.res.responseUrl || url,
      redirects: response.request.res.responseUrl !== url,
      headers: {
        'content-type': response.headers['content-type'],
        'server': response.headers['server']
      },
      success: response.status >= 200 && response.status < 400
    };
  } catch (error) {
    return {
      url,
      status: null,
      error: error.message,
      code: error.code,
      success: false
    };
  }
}

/**
 * Main crawler function
 */
async function crawlAllResources() {
  console.log('🔍 Starting HingeCraft resource crawl...\n');
  
  // Step 1: Extract URLs from database exports
  console.log('📊 Extracting URLs from database exports...');
  const dbUrls = extractUrlsFromFiles();
  console.log(`   Found ${dbUrls.length} URLs in database exports`);
  
  // Step 2: Extract URLs from repository
  console.log('📁 Extracting URLs from repository...');
  const repoUrls = extractUrlsFromRepo('./');
  console.log(`   Found ${repoUrls.length} URLs in repository`);
  
  // Step 3: Combine and dedupe
  const allUrls = Array.from(new Set([...dbUrls, ...repoUrls]));
  console.log(`\n✅ Total unique URLs: ${allUrls.length}\n`);
  
  // Step 4: Check URLs
  console.log('🔗 Checking URL health...');
  const queue = new PQueue({ concurrency: CONCURRENCY });
  const results = [];
  
  for (const url of allUrls) {
    queue.add(async () => {
      const result = await checkUrl(url);
      results.push(result);
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${url.substring(0, 60)}...`);
    });
  }
  
  await queue.onIdle();
  
  // Step 5: Save results
  const report = {
    total: allUrls.length,
    checked: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    urls: results
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'resource_report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // CSV export
  const csv = [
    'url,status,final_url,success,error',
    ...results.map(r => [
      r.url,
      r.status || '',
      r.finalUrl || '',
      r.success,
      r.error || ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'resource_report.csv'),
    csv
  );
  
  console.log(`\n✅ Crawl complete!`);
  console.log(`   Successful: ${report.successful}`);
  console.log(`   Failed: ${report.failed}`);
  console.log(`   Reports saved to: ${OUTPUT_DIR}/`);
}

// Run crawler
crawlAllResources().catch(console.error);
