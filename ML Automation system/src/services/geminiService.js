/**
 * Google Gemini AI Service
 * Provides DRAG analysis, SEO training, sorting, and processing capabilities
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const db = require('../utils/database');

class GeminiService {
  constructor() {
    this.apiKey = config.gemini?.apiKey || process.env.GEMINI_API_KEY || 'AIzaSyAngHYLqf83H-hT7tqYhaEaEMq01FFyN2U';
    this.projectId = config.gemini?.projectId || process.env.GEMINI_PROJECT_ID || '560092674546';
    this.clientId = config.gemini?.clientId || process.env.GEMINI_CLIENT_ID || 'gen-lang-client-0591481817';
    
    if (!this.apiKey) {
      logger.warn('Gemini API key not configured');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      logger.info('✅ Gemini AI service initialized');
    } catch (error) {
      logger.error('Error initializing Gemini:', error);
    }
  }

  /**
   * DRAG Analysis (Data Retrieval Augmented Generation)
   * Analyzes leads and retrieves relevant context for better processing
   */
  async dragAnalysis(lead, context = {}) {
    try {
      if (!this.model) {
        logger.warn('Gemini model not initialized, skipping DRAG analysis');
        return { enriched: false, reason: 'Model not initialized' };
      }

      const prompt = `
Analyze this lead using DRAG (Data Retrieval Augmented Generation) methodology:

Lead Data:
- Name: ${lead.first_name || ''} ${lead.last_name || ''}
- Email: ${lead.email || ''}
- Company: ${lead.organization || ''}
- Title: ${lead.title || ''}
- Location: ${lead.city || ''}, ${lead.state || ''}, ${lead.country || ''}
- Lead Type: ${lead.lead_type || 'Unknown'}
- Lead Score: ${lead.lead_score || 0}

Context:
${JSON.stringify(context, null, 2)}

Perform DRAG analysis:
1. Retrieve relevant patterns from similar leads
2. Augment with industry insights
3. Generate actionable recommendations
4. Identify optimal engagement strategy

Return JSON with:
- enriched_data: Additional insights
- recommendations: Action items
- confidence_score: 0-100
- next_steps: Suggested actions
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON from response
      let analysis = {};
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // If JSON parsing fails, extract key info from text
        analysis = {
          enriched_data: text,
          recommendations: ['Review lead manually'],
          confidence_score: 50,
          next_steps: ['Standard follow-up']
        };
      }

      // Store analysis in database
      await db.query(
        `INSERT INTO lead_analysis (lead_id, analysis_type, analysis_data, created_at)
         VALUES ($1, 'drag_analysis', $2, NOW())
         ON CONFLICT (lead_id, analysis_type) DO UPDATE
         SET analysis_data = $2, updated_at = NOW()`,
        [lead.id, JSON.stringify(analysis)]
      );

      logger.info(`DRAG analysis completed for lead ${lead.id}`);
      return { enriched: true, analysis };
    } catch (error) {
      logger.error('Error in DRAG analysis:', error);
      return { enriched: false, error: error.message };
    }
  }

  /**
   * SEO Training - Analyze and optimize content for SEO
   */
  async seoTraining(content, targetKeywords = []) {
    try {
      if (!this.model) {
        return { optimized: false, reason: 'Model not initialized' };
      }

      const prompt = `
Analyze and optimize this content for SEO:

Content:
${content}

Target Keywords: ${targetKeywords.join(', ') || 'None specified'}

Provide SEO optimization:
1. Keyword density analysis
2. Meta description suggestions
3. Title tag optimization
4. Content structure improvements
5. Internal linking opportunities
6. Schema markup suggestions

Return JSON with:
- optimized_content: Improved content
- keyword_density: Analysis
- meta_description: Suggested meta
- title_suggestion: Optimized title
- seo_score: 0-100
- recommendations: SEO improvements
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let seoAnalysis = {};
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          seoAnalysis = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        seoAnalysis = {
          optimized_content: content,
          seo_score: 50,
          recommendations: ['Review content manually']
        };
      }

      return { optimized: true, seoAnalysis };
    } catch (error) {
      logger.error('Error in SEO training:', error);
      return { optimized: false, error: error.message };
    }
  }

  /**
   * Smart Sorting - AI-powered lead sorting and prioritization
   */
  async smartSort(leads) {
    try {
      if (!this.model || leads.length === 0) {
        return leads;
      }

      const prompt = `
Sort and prioritize these leads using AI analysis:

Leads:
${JSON.stringify(leads.map(l => ({
  id: l.id,
  name: `${l.first_name} ${l.last_name}`,
  email: l.email,
  company: l.organization,
  lead_type: l.lead_type,
  lead_score: l.lead_score,
  location: `${l.city}, ${l.state}`,
  created_at: l.created_at
})), null, 2)}

Sort by:
1. Lead quality score (AI-calculated)
2. Engagement potential
3. Company size indicators
4. Geographic relevance
5. Industry fit

Return JSON array with sorted lead IDs and priority scores.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let sortedIds = [];
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          sortedIds = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Fallback: sort by lead_score
        return leads.sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0));
      }

      // Reorder leads based on AI sorting
      const leadMap = new Map(leads.map(l => [l.id, l]));
      const sorted = sortedIds
        .map(item => leadMap.get(item.id || item))
        .filter(Boolean);

      // Add any leads not in sorted list
      const sortedIdsSet = new Set(sortedIds.map(item => item.id || item));
      leads.forEach(lead => {
        if (!sortedIdsSet.has(lead.id)) {
          sorted.push(lead);
        }
      });

      return sorted;
    } catch (error) {
      logger.error('Error in smart sort:', error);
      // Fallback: sort by lead_score
      return leads.sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0));
    }
  }

  /**
   * Process leads with Gemini AI
   * Combines DRAG analysis, sorting, and enrichment
   */
  async processLeads(leads) {
    try {
      logger.info(`Processing ${leads.length} leads with Gemini AI`);

      // Step 1: Smart sorting
      const sortedLeads = await this.smartSort(leads);
      logger.info(`✅ Leads sorted by AI priority`);

      // Step 2: DRAG analysis for top leads
      const topLeads = sortedLeads.slice(0, Math.min(10, sortedLeads.length));
      const analysisResults = [];

      for (const lead of topLeads) {
        const analysis = await this.dragAnalysis(lead, {
          position: sortedLeads.indexOf(lead) + 1,
          total: sortedLeads.length
        });
        analysisResults.push({ leadId: lead.id, analysis });
      }

      logger.info(`✅ DRAG analysis completed for ${topLeads.length} top leads`);

      return {
        sorted: sortedLeads,
        analyzed: analysisResults,
        total: leads.length
      };
    } catch (error) {
      logger.error('Error processing leads with Gemini:', error);
      return {
        sorted: leads,
        analyzed: [],
        total: leads.length,
        error: error.message
      };
    }
  }

  /**
   * Analyze email template for SEO and engagement
   */
  async analyzeEmailTemplate(template) {
    try {
      if (!this.model) {
        return { analyzed: false };
      }

      const seoResult = await this.seoTraining(template.body || template.content, [
        'lead generation',
        'automation',
        'business growth'
      ]);

      return {
        analyzed: true,
        seo: seoResult.seoAnalysis,
        template_id: template.id
      };
    } catch (error) {
      logger.error('Error analyzing email template:', error);
      return { analyzed: false, error: error.message };
    }
  }
}

module.exports = new GeminiService();
