/**
 * Template Router Service
 * Routes leads to appropriate email template set based on classification
 * Handles template personalization with mission_support_url and other variables
 */

const db = require('../utils/database');
const logger = require('../utils/logger');
const config = require('../../config/api_keys');

class TemplateRouter {
  /**
   * Get template set for lead based on classification
   */
  async getTemplateSetForLead(leadId) {
    try {
      const result = await db.query(
        'SELECT template_set, lead_type FROM leads WHERE id = $1',
        [leadId]
      );

      if (result.rows.length > 0) {
        return result.rows[0].template_set || 'set_three_b2b';
      }

      return 'set_three_b2b'; // Default
    } catch (error) {
      logger.error('Error getting template set for lead:', error);
      return 'set_three_b2b';
    }
  }

  /**
   * Get sequence for template set
   */
  async getSequenceForTemplateSet(templateSet) {
    try {
      const result = await db.query(
        'SELECT * FROM sequences WHERE sequence_type = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1',
        [templateSet]
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      return null;
    } catch (error) {
      logger.error('Error getting sequence for template set:', error);
      return null;
    }
  }

  /**
   * Personalize template with lead data and URLs
   */
  personalizeTemplate(template, lead, options = {}) {
    if (!template) return '';

    let personalized = template;

    // Standard variables
    personalized = personalized.replace(/\{\{first_name\}\}/g, lead.first_name || '');
    personalized = personalized.replace(/\{\{last_name\}\}/g, lead.last_name || '');
    personalized = personalized.replace(/\{\{name\}\}/g, `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'there');
    personalized = personalized.replace(/\{\{organization\}\}/g, lead.organization || lead.company || '');
    personalized = personalized.replace(/\{\{email\}\}/g, lead.email || '');
    personalized = personalized.replace(/\{\{city\}\}/g, lead.city || '');
    personalized = personalized.replace(/\{\{country\}\}/g, lead.country || '');

    // URL variables (from options or config)
    const missionSupportUrl = options.mission_support_url || config.app.missionSupportUrl || 'https://hingecraft.global/mission-support';
    const studentPageUrl = options.student_page_url || config.app.studentPageUrl || 'https://hingecraft.global/student';
    const buildLogUrl = options.build_log_url || config.app.buildLogUrl || 'https://hingecraft.global/build-log';
    const submitCreationUrl = options.submit_creation_url || config.app.submitCreationUrl || 'https://hingecraft.global/submit';
    const schoolUniqueLink = options.school_unique_link || `${missionSupportUrl}?school=${encodeURIComponent(lead.organization || '')}`;
    const unsubscribeUrl = options.unsubscribe_url || `${config.app.baseUrl || 'https://hingecraft.global'}/unsubscribe?email=${encodeURIComponent(lead.email || '')}`;
    const preferencesUrl = options.preferences_url || `${config.app.baseUrl || 'https://hingecraft.global'}/preferences?email=${encodeURIComponent(lead.email || '')}`;
    const ctaUrl = options.cta_url || missionSupportUrl;

    // Replace URL placeholders
    personalized = personalized.replace(/\{\{mission_support_url\}\}/g, missionSupportUrl);
    personalized = personalized.replace(/\{\{student_page_url\}\}/g, studentPageUrl);
    personalized = personalized.replace(/\{\{build_log_url\}\}/g, buildLogUrl);
    personalized = personalized.replace(/\{\{submit_creation_url\}\}/g, submitCreationUrl);
    personalized = personalized.replace(/\{\{school_unique_link\}\}/g, schoolUniqueLink);
    personalized = personalized.replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl);
    personalized = personalized.replace(/\{\{preferences_url\}\}/g, preferencesUrl);
    personalized = personalized.replace(/\{\{cta_url\}\}/g, ctaUrl);

    // Sender variables (for referral emails)
    personalized = personalized.replace(/\{\{sender_name\}\}/g, options.sender_name || 'The HingeCraft Team');
    personalized = personalized.replace(/\{\{sender_title\}\}/g, options.sender_title || '');
    personalized = personalized.replace(/\{\{school_name\}\}/g, lead.organization || lead.company || 'Your School');

    return personalized;
  }

  /**
   * Get template step for lead sequence
   */
  async getTemplateStep(sequenceId, stepNumber) {
    try {
      const result = await db.query(
        'SELECT * FROM sequence_steps WHERE sequence_id = $1 AND step_number = $2',
        [sequenceId, stepNumber]
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      return null;
    } catch (error) {
      logger.error('Error getting template step:', error);
      return null;
    }
  }

  /**
   * Route lead to appropriate template set and initialize sequence
   */
  async routeLeadToTemplate(leadId) {
    try {
      // Get lead data
      const leadResult = await db.query('SELECT * FROM leads WHERE id = $1', [leadId]);
      if (leadResult.rows.length === 0) {
        throw new Error(`Lead ${leadId} not found`);
      }

      const lead = leadResult.rows[0];

      // Get template set (should already be set by classifier, but verify)
      let templateSet = lead.template_set;
      if (!templateSet) {
        // Re-classify if needed
        const classification = await leadClassifier.classifyLead(lead);
        templateSet = classification.template_set;
        await leadClassifier.storeClassification(leadId, classification);
      }

      // Get sequence for template set
      const sequence = await this.getSequenceForTemplateSet(templateSet);
      if (!sequence) {
        throw new Error(`No sequence found for template set: ${templateSet}`);
      }

      // Initialize sequence
      const sequenceEngine = require('./sequenceEngine');
      await sequenceEngine.initializeSequence(leadId, templateSet);

      logger.info(`Lead ${leadId} routed to template set: ${templateSet}`);

      return {
        lead_id: leadId,
        template_set: templateSet,
        sequence_id: sequence.id,
        sequence_name: sequence.name
      };
    } catch (error) {
      logger.error('Error routing lead to template:', error);
      throw error;
    }
  }
}

module.exports = new TemplateRouter();
