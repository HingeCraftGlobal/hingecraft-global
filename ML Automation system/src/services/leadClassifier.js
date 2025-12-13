/**
 * Lead Classification Service
 * Classifies leads into three categories: Priority Donor, Warm Prospect, Cold/Nurture
 * Based on signals from email domain, job title, company, source, etc.
 */

const db = require('../utils/database');
const logger = require('../utils/logger');

class LeadClassifier {
  constructor() {
    this.rules = null;
    this.aspirationalCompanies = null;
  }

  /**
   * Load classification rules from database
   */
  async loadRules() {
    if (this.rules) return this.rules;

    try {
      const result = await db.query(
        'SELECT * FROM classification_rules WHERE is_active = true ORDER BY priority ASC'
      );
      this.rules = result.rows;
      return this.rules;
    } catch (error) {
      logger.error('Error loading classification rules:', error);
      return [];
    }
  }

  /**
   * Load aspirational companies list
   */
  async loadAspirationalCompanies() {
    if (this.aspirationalCompanies) return this.aspirationalCompanies;

    try {
      // Check if aspirational_companies table exists
      const tableCheck = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'aspirational_companies'
        )
      `);

      if (tableCheck.rows[0].exists) {
        const result = await db.query('SELECT name, domain FROM aspirational_companies WHERE is_active = true');
        this.aspirationalCompanies = result.rows.map(r => ({
          name: r.name.toLowerCase(),
          domain: r.domain ? r.domain.toLowerCase() : null
        }));
      } else {
        this.aspirationalCompanies = [];
      }
      return this.aspirationalCompanies;
    } catch (error) {
      logger.warn('Aspirational companies table not found, skipping:', error.message);
      this.aspirationalCompanies = [];
      return this.aspirationalCompanies;
    }
  }

  /**
   * Classify a lead based on available data
   * @param {Object} lead - Lead data {email, first_name, last_name, organization, title, source, etc.}
   * @returns {Object} {type: 'priority_donor'|'warm_prospect'|'cold_nurture', score: 0-100, signals: {}}
   */
  async classifyLead(lead) {
    try {
      await this.loadRules();
      await this.loadAspirationalCompanies();

      let score = 0;
      const signals = {
        domain: null,
        title: null,
        company: null,
        source: null,
        matched_rules: []
      };

      // Extract email domain
      const emailDomain = lead.email ? lead.email.split('@')[1]?.toLowerCase() : null;
      signals.domain = emailDomain;

      // Extract normalized title
      const title = (lead.title || lead.job_title || '').toLowerCase().trim();
      signals.title = title;

      // Extract normalized company
      const company = (lead.organization || lead.company || '').toLowerCase().trim();
      signals.company = company;

      // Extract source
      const source = (lead.source || '').toLowerCase();
      signals.source = source;

      // Apply rules
      for (const rule of this.rules) {
        const match = await this.applyRule(rule, { emailDomain, title, company, source, lead });
        if (match.matched) {
          score += rule.score_weight;
          signals.matched_rules.push({
            rule_name: rule.rule_name,
            score_added: rule.score_weight
          });
        }
      }

      // Determine classification type
      let type = 'cold_nurture';
      if (score >= 80) {
        type = 'priority_donor';
      } else if (score >= 40) {
        type = 'warm_prospect';
      }

      // Get template set for this classification
      const templateSet = await this.getTemplateSetForType(type);

      logger.info(`Lead classified: ${lead.email} → ${type} (score: ${score})`);

      return {
        type,
        score,
        signals,
        template_set: templateSet
      };
    } catch (error) {
      logger.error('Error classifying lead:', error);
      // Default to cold_nurture on error
      return {
        type: 'cold_nurture',
        score: 0,
        signals: {},
        template_set: 'set_three_b2b'
      };
    }
  }

  /**
   * Apply a single classification rule
   */
  async applyRule(rule, context) {
    const { emailDomain, title, company, source, lead } = context;
    const config = rule.rule_config;

    try {
      switch (rule.rule_type) {
        case 'domain_whitelist':
          if (emailDomain && config.domains) {
            const domains = config.domains.map(d => d.toLowerCase());
            return { matched: domains.includes(emailDomain) };
          }
          break;

        case 'title_keywords':
          if (title && config.keywords) {
            const keywords = config.keywords.map(k => k.toLowerCase());
            const matched = keywords.some(k => title.includes(k));
            return { matched };
          }
          break;

        case 'source_weight':
          if (source && config.sources) {
            const sources = config.sources.map(s => s.toLowerCase());
            return { matched: sources.some(s => source.includes(s)) };
          }
          break;

        case 'company_match':
          if (company && config.match_type === 'db_lookup') {
            const aspirational = await this.loadAspirationalCompanies();
            const matched = aspirational.some(ac => 
              ac.name === company || 
              (ac.domain && emailDomain && ac.domain === emailDomain)
            );
            return { matched };
          }
          break;

        default:
          logger.warn(`Unknown rule type: ${rule.rule_type}`);
      }
    } catch (error) {
      logger.error(`Error applying rule ${rule.rule_name}:`, error);
    }

    return { matched: false };
  }

  /**
   * Get template set for lead type
   */
  async getTemplateSetForType(leadType) {
    try {
      const result = await db.query(
        'SELECT template_set FROM template_mappings WHERE lead_type = $1 AND is_active = true ORDER BY priority ASC LIMIT 1',
        [leadType]
      );

      if (result.rows.length > 0) {
        return result.rows[0].template_set;
      }

      // Default mapping
      const defaults = {
        'priority_donor': 'set_one_student',
        'warm_prospect': 'set_two_referral',
        'cold_nurture': 'set_three_b2b'
      };

      return defaults[leadType] || 'set_three_b2b';
    } catch (error) {
      logger.error('Error getting template set:', error);
      return 'set_three_b2b';
    }
  }

  /**
   * Store classification in database
   */
  async storeClassification(leadId, classification) {
    try {
      // Insert into lead_classifications table
      await db.query(
        `INSERT INTO lead_classifications (
          lead_id, classification_type, classification_score, classification_signals, classified_by
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          leadId,
          classification.type,
          classification.score,
          JSON.stringify(classification.signals),
          'system'
        ]
      );

      // Update leads table
      await db.query(
        `UPDATE leads 
         SET lead_type = $1, lead_score = $2, classification_signals = $3, template_set = $4
         WHERE id = $5`,
        [
          classification.type,
          classification.score,
          JSON.stringify(classification.signals),
          classification.template_set,
          leadId
        ]
      );

      logger.info(`Classification stored for lead ${leadId}: ${classification.type}`);
    } catch (error) {
      logger.error('Error storing classification:', error);
      throw error;
    }
  }

  /**
   * Batch classify multiple leads
   */
  async batchClassify(leads) {
    const results = [];
    for (const lead of leads) {
      try {
        const classification = await this.classifyLead(lead);
        if (lead.id) {
          await this.storeClassification(lead.id, classification);
        }
        results.push({
          lead_id: lead.id,
          email: lead.email,
          classification
        });
      } catch (error) {
        logger.error(`Error classifying lead ${lead.email}:`, error);
        results.push({
          lead_id: lead.id,
          email: lead.email,
          error: error.message
        });
      }
    }
    return results;
  }
}

module.exports = new LeadClassifier();
