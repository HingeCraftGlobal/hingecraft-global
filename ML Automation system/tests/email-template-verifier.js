/**
 * Email Template Verifier using GPT
 * Scans and verifies all email templates across the system
 * Uses OpenAI API to validate templates for quality, compliance, and effectiveness
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// Load OpenAI API key
let openai = null;
const API_KEY_PATH = '/Users/chandlerfergusen/Desktop/CURSOR/api_keys/openai.json';

try {
  if (fs.existsSync(API_KEY_PATH)) {
    const keyData = JSON.parse(fs.readFileSync(API_KEY_PATH, 'utf8'));
    const apiKey = keyData.apiKey || keyData.key || keyData.OPENAI_API_KEY;
    if (apiKey) {
      openai = new OpenAI({ apiKey });
    }
  }
} catch (error) {
  console.warn('OpenAI API key not found, template verification will be skipped');
}

const VERIFICATION_RESULTS = {
  templates: [],
  verified: 0,
  issues: [],
  recommendations: []
};

/**
 * Verify template with GPT
 */
async function verifyTemplateWithGPT(template, context) {
  if (!openai) {
    return { verified: false, reason: 'OpenAI API key not available' };
  }

  try {
    const prompt = `You are an email marketing expert. Analyze this email template for a lead automation system.

Template Context:
- Type: ${context.type || 'sequence email'}
- Stage: ${context.stage || 'welcome'}
- Purpose: ${context.purpose || 'lead nurturing'}
- Audience: ${context.audience || 'B2B leads'}

Email Template:
Subject: ${template.subject || 'N/A'}
Body: ${template.body || template.html || 'N/A'}

Please analyze this template and provide:
1. Quality score (1-10)
2. Compliance check (CAN-SPAM, GDPR considerations)
3. Effectiveness assessment
4. Personalization opportunities
5. Call-to-action clarity
6. Tone and brand consistency
7. Specific improvements

Respond in JSON format:
{
  "quality_score": number,
  "compliance": { "can_spam": boolean, "gdpr": boolean, "issues": [] },
  "effectiveness": { "score": number, "strengths": [], "weaknesses": [] },
  "personalization": { "score": number, "opportunities": [] },
  "cta_clarity": number,
  "tone_consistency": number,
  "improvements": [],
  "overall_verdict": "pass" | "needs_improvement" | "fail"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert email marketing consultant specializing in B2B lead automation and email sequence optimization.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    return { verified: true, analysis };
  } catch (error) {
    return { verified: false, error: error.message };
  }
}

/**
 * Find all email templates in codebase
 */
function findEmailTemplates() {
  const templates = [];
  const srcDir = path.join(__dirname, '../src');

  // Search for templates in code
  function searchInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Look for template definitions
      if (line.match(/template|subject.*:|html.*:|body.*:/i)) {
        // Try to extract template object
        const templateMatch = content.match(/subject.*?['"](.*?)['"]|html.*?['"](.*?)['"]|body.*?['"](.*?)['"]/gi);
        if (templateMatch) {
          templates.push({
            file: path.relative(process.cwd(), filePath),
            line: index + 1,
            code: line.trim(),
            context: content.substring(Math.max(0, index - 5), Math.min(content.length, index + 10))
          });
        }
      }
    });
  }

  function searchDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && !['node_modules', '.git'].includes(file)) {
        searchDirectory(filePath);
      } else if (file.endsWith('.js')) {
        searchInFile(filePath);
      }
    });
  }

  searchDirectory(srcDir);
  return templates;
}

/**
 * Get templates from database
 */
async function getTemplatesFromDatabase() {
  const db = require('../src/utils/database');
  const templates = [];

  try {
    // Get sequences and their steps
    const sequences = await db.query('SELECT * FROM sequences WHERE is_active = true');
    for (const seq of sequences.rows) {
      const steps = await db.query(
        'SELECT * FROM sequence_steps WHERE sequence_id = $1 ORDER BY step_number',
        [seq.id]
      );

      for (const step of steps.rows) {
        templates.push({
          source: 'database',
          sequence_id: seq.id,
          sequence_name: seq.name,
          sequence_type: seq.sequence_type,
          step_number: step.step_number,
          delay_hours: step.delay_hours,
          subject: step.subject_template,
          body: step.body_template,
          template_id: step.template_id,
          conditions: step.conditions
        });
      }
    }
  } catch (error) {
    console.error('Error fetching templates from database:', error);
  }

  return templates;
}

/**
 * Main verification function
 */
async function verifyAllTemplates() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📧 Email Template Verification with GPT');
  console.log('═══════════════════════════════════════════════════════\n');

  if (!openai) {
    console.log('⚠️  OpenAI API key not found. Please provide your API key.');
    console.log('   Expected location: /Users/chandlerfergusen/Desktop/CURSOR/api_keys/openai.json');
    console.log('   Format: { "apiKey": "sk-..." }');
    return;
  }

  // Get templates from database
  console.log('📊 Step 1: Loading templates from database...');
  const dbTemplates = await getTemplatesFromDatabase();
  console.log(`   ✅ Found ${dbTemplates.length} templates in database\n`);

  // Get templates from code
  console.log('📊 Step 2: Scanning codebase for templates...');
  const codeTemplates = findEmailTemplates();
  console.log(`   ✅ Found ${codeTemplates.length} template references in code\n`);

  // Verify each template
  console.log('📊 Step 3: Verifying templates with GPT...');
  console.log('─────────────────────────────────────────────\n');

  for (let i = 0; i < dbTemplates.length; i++) {
    const template = dbTemplates[i];
    console.log(`[${i + 1}/${dbTemplates.length}] Verifying: ${template.sequence_name} - Step ${template.step_number}`);

    const context = {
      type: 'sequence_email',
      stage: template.sequence_type,
      purpose: `Step ${template.step_number} of ${template.sequence_name} sequence`,
      audience: 'B2B leads'
    };

    const templateData = {
      subject: template.subject,
      body: template.body,
      html: template.body
    };

    const verification = await verifyTemplateWithGPT(templateData, context);

    if (verification.verified && verification.analysis) {
      const analysis = verification.analysis;
      VERIFICATION_RESULTS.templates.push({
        template,
        analysis,
        verified: true
      });

      console.log(`   ✅ Quality Score: ${analysis.quality_score}/10`);
      console.log(`   ✅ Compliance: ${analysis.compliance.can_spam && analysis.compliance.gdpr ? 'PASS' : 'NEEDS REVIEW'}`);
      console.log(`   ✅ Verdict: ${analysis.overall_verdict}`);

      if (analysis.overall_verdict !== 'pass') {
        VERIFICATION_RESULTS.issues.push({
          template: `${template.sequence_name} - Step ${template.step_number}`,
          issues: analysis.improvements
        });
      }
    } else {
      VERIFICATION_RESULTS.templates.push({
        template,
        verified: false,
        error: verification.error || verification.reason
      });
      console.log(`   ⚠️  Verification failed: ${verification.error || verification.reason}`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Generate report
  generateVerificationReport();
}

/**
 * Generate verification report
 */
function generateVerificationReport() {
  const reportPath = path.join(__dirname, '../email-template-verification-report.json');
  const reportHtmlPath = path.join(__dirname, '../email-template-verification-report.html');

  const stats = {
    total: VERIFICATION_RESULTS.templates.length,
    verified: VERIFICATION_RESULTS.templates.filter(t => t.verified).length,
    passed: VERIFICATION_RESULTS.templates.filter(t => t.verified && t.analysis?.overall_verdict === 'pass').length,
    needsImprovement: VERIFICATION_RESULTS.templates.filter(t => t.verified && t.analysis?.overall_verdict === 'needs_improvement').length,
    failed: VERIFICATION_RESULTS.templates.filter(t => t.verified && t.analysis?.overall_verdict === 'fail').length,
    issues: VERIFICATION_RESULTS.issues.length
  };

  const report = {
    summary: stats,
    timestamp: new Date().toISOString(),
    templates: VERIFICATION_RESULTS.templates,
    issues: VERIFICATION_RESULTS.issues
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generate HTML report
  const htmlReport = generateHtmlReport(stats, report);
  fs.writeFileSync(reportHtmlPath, htmlReport);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 VERIFICATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total Templates: ${stats.total}`);
  console.log(`Verified: ${stats.verified}`);
  console.log(`Passed: ${stats.passed}`);
  console.log(`Needs Improvement: ${stats.needsImprovement}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Issues Found: ${stats.issues}`);
  console.log('');
  console.log(`📄 Reports saved:`);
  console.log(`   JSON: ${reportPath}`);
  console.log(`   HTML: ${reportHtmlPath}`);
  console.log('═══════════════════════════════════════════════════════');
}

/**
 * Generate HTML report
 */
function generateHtmlReport(stats, report) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Email Template Verification Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .stat-card { background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50; }
    .stat-value { font-size: 2em; font-weight: bold; color: #4CAF50; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #4CAF50; color: white; }
    .pass { color: #4CAF50; }
    .needs-improvement { color: #ff9800; }
    .fail { color: #f44336; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📧 Email Template Verification Report</h1>
    <p><strong>Date:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
    
    <h2>📊 Summary</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.total}</div>
        <div>Total Templates</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.passed}</div>
        <div>Passed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.needsImprovement}</div>
        <div>Needs Improvement</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.failed}</div>
        <div>Failed</div>
      </div>
    </div>
    
    <h2>📋 Template Details</h2>
    <table>
      <tr><th>Template</th><th>Quality</th><th>Compliance</th><th>Verdict</th><th>Issues</th></tr>
      ${report.templates.map(t => `
        <tr>
          <td>${t.template.sequence_name || 'N/A'} - Step ${t.template.step_number || 'N/A'}</td>
          <td>${t.analysis?.quality_score || 'N/A'}/10</td>
          <td>${t.analysis?.compliance?.can_spam && t.analysis?.compliance?.gdpr ? '✅' : '⚠️'}</td>
          <td class="${t.analysis?.overall_verdict || 'unknown'}">${t.analysis?.overall_verdict || 'N/A'}</td>
          <td>${t.analysis?.improvements?.length || 0}</td>
        </tr>
      `).join('')}
    </table>
  </div>
</body>
</html>`;
}

// Run if executed directly
if (require.main === module) {
  verifyAllTemplates().catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

module.exports = { verifyAllTemplates, verifyTemplateWithGPT };
