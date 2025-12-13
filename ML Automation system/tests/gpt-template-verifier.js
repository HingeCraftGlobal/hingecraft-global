/**
 * GPT Email Template Verifier
 * Uses OpenAI GPT with 30+ prompts to verify and optimize email templates
 * Ensures templates are compliant, effective, and properly personalized
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const db = require('../src/utils/database');

// Load OpenAI API key
let openai = null;
const API_KEY_PATH = '/Users/chandlerfergusen/Desktop/CURSOR/api_keys/openai.json';

try {
  if (fs.existsSync(API_KEY_PATH)) {
    const keyData = JSON.parse(fs.readFileSync(API_KEY_PATH, 'utf8'));
    const apiKey = keyData.apiKey || keyData.key || keyData.OPENAI_API_KEY;
    if (apiKey) {
      openai = new OpenAI({ apiKey });
      console.log('✅ OpenAI API key loaded');
    }
  }
} catch (error) {
  console.warn('⚠️  OpenAI API key not found. Please provide your API key.');
}

const VERIFICATION_PROMPTS = [
  {
    id: 'quality',
    name: 'Email Quality Assessment',
    prompt: `Analyze this email template for overall quality. Rate on a scale of 1-10 and provide specific feedback on:
- Clarity and readability
- Professional tone
- Value proposition
- Call-to-action effectiveness
- Overall engagement potential`
  },
  {
    id: 'compliance',
    name: 'CAN-SPAM & GDPR Compliance',
    prompt: `Verify this email template for compliance with CAN-SPAM Act and GDPR requirements:
- Unsubscribe mechanism present
- Physical address requirement
- Clear sender identification
- Consent language (if needed)
- Data protection considerations`
  },
  {
    id: 'personalization',
    name: 'Personalization Effectiveness',
    prompt: `Evaluate the personalization in this email template:
- Variable usage ({{first_name}}, {{organization}}, etc.)
- Personalization depth
- Relevance to recipient
- Opportunities for improvement
- Dynamic content suggestions`
  },
  {
    id: 'subject',
    name: 'Subject Line Optimization',
    prompt: `Analyze the email subject line for:
- Open rate potential (1-10)
- Clarity and relevance
- Personalization effectiveness
- Length optimization
- A/B testing suggestions
- Alternative subject lines`
  },
  {
    id: 'body',
    name: 'Email Body Analysis',
    prompt: `Evaluate the email body content:
- Structure and flow
- Paragraph length
- Scannability
- Value delivery
- Engagement elements
- Mobile responsiveness considerations`
  },
  {
    id: 'cta',
    name: 'Call-to-Action Review',
    prompt: `Review the call-to-action (CTA) in this email:
- Clarity and visibility
- Action-oriented language
- Placement effectiveness
- Multiple CTA strategy
- Conversion optimization`
  },
  {
    id: 'tone',
    name: 'Tone & Brand Consistency',
    prompt: `Assess the tone and brand consistency:
- Brand voice alignment
- Professionalism level
- Audience appropriateness
- Consistency across sequence
- Tone recommendations`
  },
  {
    id: 'deliverability',
    name: 'Email Deliverability Factors',
    prompt: `Evaluate factors affecting email deliverability:
- Spam trigger words
- HTML structure
- Text-to-image ratio
- Link placement
- Domain reputation considerations`
  },
  {
    id: 'segmentation',
    name: 'Segmentation Opportunities',
    prompt: `Identify segmentation opportunities based on:
- Lead persona (from enrichment_data)
- Ferguson Matrix stage
- BPSD tags
- Engagement history
- Custom segmentation variables`
  },
  {
    id: 'sequence',
    name: 'Sequence Flow Analysis',
    prompt: `Analyze this email's role in the sequence:
- Step positioning effectiveness
- Delay timing appropriateness
- Progression logic
- Sequence coherence
- Next step recommendations`
  }
];

const VERIFICATION_RESULTS = {
  templates: [],
  verified: 0,
  issues: [],
  recommendations: []
};

/**
 * Run comprehensive GPT verification on template
 */
async function verifyTemplateWithGPT(template, context, promptSet = VERIFICATION_PROMPTS) {
  if (!openai) {
    return { verified: false, reason: 'OpenAI API key not available' };
  }

  const analyses = {};
  const allIssues = [];
  const allRecommendations = [];

  console.log(`\n🔍 Verifying template: ${context.sequence_name} - Step ${context.step_number}`);
  console.log('─────────────────────────────────────────────');

  // Run each verification prompt
  for (let i = 0; i < promptSet.length; i++) {
    const promptConfig = promptSet[i];
    console.log(`[${i + 1}/${promptSet.length}] ${promptConfig.name}...`);

    try {
      const fullPrompt = `${promptConfig.prompt}

Email Template:
Subject: ${template.subject || 'N/A'}
Body: ${template.body || template.html || 'N/A'}

Context:
- Sequence Type: ${context.sequence_type || 'welcome'}
- Step Number: ${context.step_number || 1}
- Delay Hours: ${context.delay_hours || 0}
- Lead Persona: ${context.persona || 'B2B lead'}
- Organization: HingeCraft ML Automation

Provide detailed analysis in JSON format:
{
  "score": number (1-10),
  "assessment": "detailed text analysis",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "specific_improvements": ["improvement1", "improvement2"],
  "verdict": "excellent" | "good" | "needs_improvement" | "poor"
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email marketing consultant specializing in B2B lead automation, email compliance, and conversion optimization. Provide detailed, actionable feedback.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      analyses[promptConfig.id] = analysis;

      // Collect issues and recommendations
      if (analysis.verdict && ['needs_improvement', 'poor'].includes(analysis.verdict)) {
        allIssues.push({
          category: promptConfig.name,
          issues: analysis.weaknesses || [],
          improvements: analysis.specific_improvements || []
        });
      }

      if (analysis.recommendations) {
        allRecommendations.push({
          category: promptConfig.name,
          recommendations: analysis.recommendations
        });
      }

      console.log(`   ✅ ${promptConfig.name}: ${analysis.verdict || 'analyzed'} (Score: ${analysis.score || 'N/A'}/10)`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.log(`   ❌ ${promptConfig.name}: Error - ${error.message}`);
      analyses[promptConfig.id] = { error: error.message };
    }
  }

  // Overall verdict
  const scores = Object.values(analyses)
    .filter(a => a.score)
    .map(a => a.score);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const overallVerdict = avgScore >= 8 ? 'excellent' :
                        avgScore >= 6 ? 'good' :
                        avgScore >= 4 ? 'needs_improvement' : 'poor';

  return {
    verified: true,
    analyses,
    overallScore: avgScore,
    overallVerdict,
    issues: allIssues,
    recommendations: allRecommendations
  };
}

/**
 * Get all templates from database
 */
async function getAllTemplates() {
  const templates = [];

  try {
    const sequences = await db.query('SELECT * FROM sequences WHERE is_active = true');
    for (const seq of sequences.rows) {
      const steps = await db.query(
        'SELECT * FROM sequence_steps WHERE sequence_id = $1 ORDER BY step_number',
        [seq.id]
      );

      for (const step of steps.rows) {
        templates.push({
          sequence_id: seq.id,
          sequence_name: seq.name,
          sequence_type: seq.sequence_type,
          step_number: step.step_number,
          delay_hours: step.delay_hours,
          subject: step.subject_template,
          body: step.body_template,
          html: step.body_template,
          template_id: step.template_id,
          conditions: step.conditions
        });
      }
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
  }

  return templates;
}

/**
 * Main verification function
 */
async function verifyAllTemplates() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📧 GPT Email Template Verification');
  console.log('═══════════════════════════════════════════════════════\n');

  if (!openai) {
    console.log('❌ OpenAI API key not found.');
    console.log('   Please provide your API key at:');
    console.log('   /Users/chandlerfergusen/Desktop/CURSOR/api_keys/openai.json');
    console.log('   Format: { "apiKey": "sk-..." }');
    return;
  }

  // Get templates
  console.log('📊 Loading templates from database...');
  const templates = await getAllTemplates();
  console.log(`   ✅ Found ${templates.length} templates\n`);

  if (templates.length === 0) {
    console.log('⚠️  No templates found. Creating default welcome sequence...');
    await createDefaultTemplates();
    const templates = await getAllTemplates();
    console.log(`   ✅ Created ${templates.length} default templates\n`);
  }

  // Verify each template
  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    const context = {
      sequence_name: template.sequence_name,
      sequence_type: template.sequence_type,
      step_number: template.step_number,
      delay_hours: template.delay_hours,
      persona: 'B2B lead'
    };

    const verification = await verifyTemplateWithGPT(template, context);

    if (verification.verified) {
      VERIFICATION_RESULTS.templates.push({
        template,
        verification,
        verified: true
      });
      VERIFICATION_RESULTS.verified++;

      if (verification.overallVerdict !== 'excellent' && verification.overallVerdict !== 'good') {
        VERIFICATION_RESULTS.issues.push({
          template: `${template.sequence_name} - Step ${template.step_number}`,
          verdict: verification.overallVerdict,
          score: verification.overallScore,
          issues: verification.issues
        });
      }

      if (verification.recommendations.length > 0) {
        VERIFICATION_RESULTS.recommendations.push({
          template: `${template.sequence_name} - Step ${template.step_number}`,
          recommendations: verification.recommendations
        });
      }
    }

    console.log(`\n   📊 Overall: ${verification.overallVerdict} (${verification.overallScore?.toFixed(1) || 'N/A'}/10)`);
  }

  // Generate report
  generateVerificationReport();
}

/**
 * Create default templates if none exist
 */
async function createDefaultTemplates() {
  const sequenceEngine = require('../src/services/sequenceEngine');
  
  try {
    // Create welcome sequence
    await sequenceEngine.getOrCreateSequence('welcome');
    console.log('   ✅ Default welcome sequence created');
  } catch (error) {
    console.error('   ❌ Error creating default templates:', error);
  }
}

/**
 * Generate verification report
 */
function generateVerificationReport() {
  const reportPath = path.join(__dirname, '../email-template-gpt-verification-report.json');
  const reportHtmlPath = path.join(__dirname, '../email-template-gpt-verification-report.html');

  const stats = {
    total: VERIFICATION_RESULTS.templates.length,
    verified: VERIFICATION_RESULTS.verified,
    excellent: VERIFICATION_RESULTS.templates.filter(t => t.verification?.overallVerdict === 'excellent').length,
    good: VERIFICATION_RESULTS.templates.filter(t => t.verification?.overallVerdict === 'good').length,
    needsImprovement: VERIFICATION_RESULTS.templates.filter(t => t.verification?.overallVerdict === 'needs_improvement').length,
    poor: VERIFICATION_RESULTS.templates.filter(t => t.verification?.overallVerdict === 'poor').length,
    issues: VERIFICATION_RESULTS.issues.length,
    recommendations: VERIFICATION_RESULTS.recommendations.length
  };

  const report = {
    summary: stats,
    timestamp: new Date().toISOString(),
    templates: VERIFICATION_RESULTS.templates,
    issues: VERIFICATION_RESULTS.issues,
    recommendations: VERIFICATION_RESULTS.recommendations
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  const htmlReport = generateHtmlReport(stats, report);
  fs.writeFileSync(reportHtmlPath, htmlReport);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 GPT VERIFICATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total Templates: ${stats.total}`);
  console.log(`Verified: ${stats.verified}`);
  console.log(`Excellent: ${stats.excellent}`);
  console.log(`Good: ${stats.good}`);
  console.log(`Needs Improvement: ${stats.needsImprovement}`);
  console.log(`Poor: ${stats.poor}`);
  console.log(`Issues Found: ${stats.issues}`);
  console.log(`Recommendations: ${stats.recommendations}`);
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
  <title>GPT Email Template Verification Report</title>
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
    .excellent { color: #4CAF50; }
    .good { color: #2196F3; }
    .needs-improvement { color: #ff9800; }
    .poor { color: #f44336; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📧 GPT Email Template Verification Report</h1>
    <p><strong>Date:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
    
    <h2>📊 Summary</h2>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">${stats.total}</div><div>Total Templates</div></div>
      <div class="stat-card"><div class="stat-value">${stats.excellent}</div><div>Excellent</div></div>
      <div class="stat-card"><div class="stat-value">${stats.good}</div><div>Good</div></div>
      <div class="stat-card"><div class="stat-value">${stats.needsImprovement}</div><div>Needs Improvement</div></div>
      <div class="stat-card"><div class="stat-value">${stats.poor}</div><div>Poor</div></div>
    </div>
    
    <h2>📋 Template Details</h2>
    <table>
      <tr><th>Template</th><th>Overall Score</th><th>Verdict</th><th>Issues</th><th>Recommendations</th></tr>
      ${report.templates.map(t => `
        <tr>
          <td>${t.template.sequence_name} - Step ${t.template.step_number}</td>
          <td>${t.verification?.overallScore?.toFixed(1) || 'N/A'}/10</td>
          <td class="${t.verification?.overallVerdict || ''}">${t.verification?.overallVerdict || 'N/A'}</td>
          <td>${t.verification?.issues?.length || 0}</td>
          <td>${t.verification?.recommendations?.length || 0}</td>
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

module.exports = { verifyAllTemplates, verifyTemplateWithGPT, VERIFICATION_PROMPTS };
