/**
 * Segmentation Analysis Script
 * Uses OpenAI or Gemini to analyze and triangulate segmentation criteria
 */

require('dotenv').config();
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const config = require('../config/api_keys');

// Initialize AI clients
let openai = null;
let gemini = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

if (process.env.GEMINI_API_KEY) {
  gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80) + '\n');
}

// Target market data (from your database)
const targetMarkets = {
  set_one_student: {
    name: 'Student Market',
    description: 'Students interested in creativity, sustainable design, and innovation',
    characteristics: ['Educational background', 'Age 16-25', 'Interest in design', 'Sustainability focus'],
    templates: 5
  },
  set_two_referral: {
    name: 'Referral Market',
    description: 'Partners and referral sources for business development',
    characteristics: ['Business partnerships', 'Network connections', 'B2B relationships'],
    templates: 1
  },
  set_three_b2b: {
    name: 'B2B Market',
    description: 'Business-to-business prospects for enterprise solutions',
    characteristics: ['Company decision makers', 'Enterprise size', 'B2B focus'],
    templates: 5
  }
};

async function analyzeWithOpenAI(market) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }
  
  const prompt = `Analyze the following target market and provide detailed segmentation criteria:

Market: ${market.name}
Description: ${market.description}
Characteristics: ${market.characteristics.join(', ')}

Provide:
1. Primary segmentation criteria (demographics, firmographics, psychographics)
2. Secondary segmentation criteria
3. Behavioral indicators
4. Qualification scoring factors
5. Recommended lead scoring weights

Format as JSON with clear criteria and weights.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    log(`OpenAI Error: ${error.message}`, 'red');
    return null;
  }
}

async function analyzeWithGemini(market) {
  if (!gemini) {
    throw new Error('Gemini API key not configured');
  }
  
  const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `Analyze the following target market and provide detailed segmentation criteria:

Market: ${market.name}
Description: ${market.description}
Characteristics: ${market.characteristics.join(', ')}

Provide:
1. Primary segmentation criteria (demographics, firmographics, psychographics)
2. Secondary segmentation criteria
3. Behavioral indicators
4. Qualification scoring factors
5. Recommended lead scoring weights

Format as JSON with clear criteria and weights.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { raw: text };
  } catch (error) {
    log(`Gemini Error: ${error.message}`, 'red');
    return null;
  }
}

async function triangulateSegmentation(market) {
  logSection(`Analyzing: ${market.name}`);
  
  let openaiResult = null;
  let geminiResult = null;
  
  // Try OpenAI
  if (openai) {
    log('Analyzing with OpenAI...', 'yellow');
    try {
      openaiResult = await analyzeWithOpenAI(market);
      if (openaiResult) {
        log('✓ OpenAI analysis complete', 'green');
      }
    } catch (error) {
      log(`⚠ OpenAI failed: ${error.message}`, 'yellow');
    }
  }
  
  // Try Gemini
  if (gemini) {
    log('Analyzing with Gemini...', 'yellow');
    try {
      geminiResult = await analyzeWithGemini(market);
      if (geminiResult) {
        log('✓ Gemini analysis complete', 'green');
      }
    } catch (error) {
      log(`⚠ Gemini failed: ${error.message}`, 'yellow');
    }
  }
  
  // Triangulate results
  if (openaiResult && geminiResult) {
    log('Triangulating results...', 'yellow');
    return {
      market: market.name,
      openai: openaiResult,
      gemini: geminiResult,
      triangulated: mergeResults(openaiResult, geminiResult),
      confidence: 'high'
    };
  } else if (openaiResult) {
    return {
      market: market.name,
      openai: openaiResult,
      confidence: 'medium'
    };
  } else if (geminiResult) {
    return {
      market: market.name,
      gemini: geminiResult,
      confidence: 'medium'
    };
  } else {
    throw new Error('Both AI services failed');
  }
}

function mergeResults(openai, gemini) {
  // Merge and reconcile results from both AI services
  const merged = {
    primaryCriteria: [],
    secondaryCriteria: [],
    behavioralIndicators: [],
    scoringFactors: []
  };
  
  // Extract and merge criteria
  if (openai.primaryCriteria) {
    merged.primaryCriteria.push(...openai.primaryCriteria);
  }
  if (gemini.primaryCriteria) {
    merged.primaryCriteria.push(...gemini.primaryCriteria);
  }
  
  // Deduplicate and prioritize
  merged.primaryCriteria = [...new Set(merged.primaryCriteria)];
  
  return merged;
}

async function generateSegmentationRules(results) {
  logSection('Generating Segmentation Rules');
  
  const rules = [];
  
  for (const result of results) {
    const marketKey = Object.keys(targetMarkets).find(
      key => targetMarkets[key].name === result.market
    );
    
    if (result.triangulated) {
      rules.push({
        market: marketKey,
        criteria: result.triangulated.primaryCriteria,
        scoring: result.triangulated.scoringFactors,
        confidence: result.confidence
      });
    }
  }
  
  return rules;
}

async function saveSegmentationRules(rules) {
  const outputPath = path.join(__dirname, '..', 'database', 'segmentation-rules.json');
  fs.writeFileSync(outputPath, JSON.stringify(rules, null, 2));
  log(`✓ Segmentation rules saved: ${outputPath}`, 'green');
  
  // Also create SQL for database
  const sqlPath = path.join(__dirname, '..', 'database', 'segmentation-rules.sql');
  let sql = '-- Segmentation Rules Generated by AI Analysis\n\n';
  sql += 'CREATE TABLE IF NOT EXISTS segmentation_rules (\n';
  sql += '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n';
  sql += '  market_key VARCHAR(50) NOT NULL,\n';
  sql += '  criteria JSONB NOT NULL,\n';
  sql += '  scoring JSONB NOT NULL,\n';
  sql += '  confidence VARCHAR(20),\n';
  sql += '  created_at TIMESTAMPTZ DEFAULT NOW()\n';
  sql += ');\n\n';
  
  for (const rule of rules) {
    sql += `INSERT INTO segmentation_rules (market_key, criteria, scoring, confidence) VALUES (\n`;
    sql += `  '${rule.market}',\n`;
    sql += `  '${JSON.stringify(rule.criteria)}'::jsonb,\n`;
    sql += `  '${JSON.stringify(rule.scoring)}'::jsonb,\n`;
    sql += `  '${rule.confidence}'\n`;
    sql += `);\n\n`;
  }
  
  fs.writeFileSync(sqlPath, sql);
  log(`✓ SQL file created: ${sqlPath}`, 'green');
}

async function main() {
  console.clear();
  log('\n🤖 SEGMENTATION ANALYSIS - AI TRIANGULATION\n', 'cyan');
  
  if (!openai && !gemini) {
    log('❌ No AI API keys configured. Set OPENAI_API_KEY or GEMINI_API_KEY', 'red');
    process.exit(1);
  }
  
  const results = [];
  
  // Analyze each target market
  for (const [key, market] of Object.entries(targetMarkets)) {
    try {
      const result = await triangulateSegmentation(market);
      results.push(result);
    } catch (error) {
      log(`❌ Failed to analyze ${market.name}: ${error.message}`, 'red');
    }
  }
  
  // Generate rules
  const rules = await generateSegmentationRules(results);
  
  // Save results
  await saveSegmentationRules(rules);
  
  // Summary
  logSection('Analysis Summary');
  log(`Markets Analyzed: ${results.length}`, 'green');
  log(`Rules Generated: ${rules.length}`, 'green');
  log(`High Confidence: ${results.filter(r => r.confidence === 'high').length}`, 'green');
  
  console.log('\n');
}

if (require.main === module) {
  main().catch(error => {
    log(`Fatal Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main };


