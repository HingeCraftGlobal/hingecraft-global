/**
 * Email Template Loader Service
 * Loads all email templates from database for all target markets
 * Makes templates available to the system
 */

const db = require('../utils/database');
const logger = require('../utils/logger');

class EmailTemplateLoader {
  constructor() {
    this.templates = null;
    this.loaded = false;
  }

  /**
   * Load all email templates from database
   */
  async loadAllTemplates() {
    try {
      if (this.loaded && this.templates) {
        return this.templates;
      }

      logger.info('📧 Loading all email templates from database...');

      // Get all sequences with their steps
      const result = await db.query(`
        SELECT 
          s.sequence_type,
          s.name as sequence_name,
          s.total_steps,
          ss.step_number,
          ss.subject_template,
          ss.body_template,
          ss.template_id,
          ss.delay_hours,
          ss.conditions
        FROM sequences s
        JOIN sequence_steps ss ON s.id = ss.sequence_id
        WHERE s.sequence_type IN ('set_one_student', 'set_two_referral', 'set_three_b2b')
          AND s.is_active = true
        ORDER BY s.sequence_type, ss.step_number
      `);

      const templates = result.rows;
      logger.info(`Found ${templates.length} email templates`);

      // Organize by template set
      const organized = {
        'set_one_student': {},
        'set_two_referral': {},
        'set_three_b2b': {}
      };

      templates.forEach(template => {
        const set = template.sequence_type;
        const step = template.step_number;
        
        if (!organized[set]) {
          organized[set] = {};
        }

        organized[set][`step_${step}`] = {
          step: step,
          subject: template.subject_template,
          body: template.body_template,
          template_id: template.template_id,
          delay_hours: template.delay_hours,
          conditions: template.conditions || {}
        };
      });

      this.templates = organized;
      this.loaded = true;

      logger.info('✅ All email templates loaded');
      return this.templates;
    } catch (error) {
      logger.error('Error loading templates:', error);
      throw error;
    }
  }

  /**
   * Get template for specific set and step
   */
  async getTemplate(templateSet, step) {
    try {
      if (!this.loaded) {
        await this.loadAllTemplates();
      }

      const setTemplates = this.templates[templateSet];
      if (!setTemplates) {
        logger.warn(`Template set ${templateSet} not found`);
        return null;
      }

      const stepKey = `step_${step}`;
      const template = setTemplates[stepKey];

      if (!template) {
        // Fallback to first step
        const firstStep = Object.keys(setTemplates)[0];
        logger.warn(`Step ${step} not found for ${templateSet}, using ${firstStep}`);
        return setTemplates[firstStep] || null;
      }

      return template;
    } catch (error) {
      logger.error(`Error getting template ${templateSet} step ${step}:`, error);
      return null;
    }
  }

  /**
   * Get all templates for a set
   */
  async getTemplatesForSet(templateSet) {
    try {
      if (!this.loaded) {
        await this.loadAllTemplates();
      }

      return this.templates[templateSet] || {};
    } catch (error) {
      logger.error(`Error getting templates for set ${templateSet}:`, error);
      return {};
    }
  }

  /**
   * Get template summary
   */
  async getTemplateSummary() {
    try {
      if (!this.loaded) {
        await this.loadAllTemplates();
      }

      const summary = {};
      Object.keys(this.templates).forEach(set => {
        summary[set] = {
          count: Object.keys(this.templates[set]).length,
          steps: Object.keys(this.templates[set]).map(key => parseInt(key.replace('step_', '')))
        };
      });

      return summary;
    } catch (error) {
      logger.error('Error getting template summary:', error);
      return {};
    }
  }
}

module.exports = new EmailTemplateLoader();
