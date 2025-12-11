/**
 * Sequence Engine
 * Manages email sequences and automation logic
 */

const db = require('../utils/database');
const anymail = require('./anymail');
const gmail = require('./gmail');
const hubspot = require('./hubspot');
const logger = require('../utils/logger');

class SequenceEngine {
  /**
   * Initialize sequence for a lead
   */
  async initializeSequence(leadId, sequenceType = 'welcome') {
    try {
      // Get or create sequence
      const sequence = await this.getOrCreateSequence(sequenceType);
      
      // Check if lead is already in a sequence
      const existing = await db.query(
        'SELECT * FROM lead_sequences WHERE lead_id = $1 AND status = $2',
        [leadId, 'active']
      );

      if (existing.rows.length > 0) {
        logger.info(`Lead ${leadId} already in active sequence`);
        return existing.rows[0];
      }

      // Get sequence steps
      const steps = await db.query(
        'SELECT * FROM sequence_steps WHERE sequence_id = $1 ORDER BY step_number ASC',
        [sequence.id]
      );

      if (steps.rows.length === 0) {
        throw new Error(`No steps found for sequence ${sequenceType}`);
      }

      // Calculate next action time
      const nextActionDue = new Date();
      nextActionDue.setHours(nextActionDue.getHours() + (steps.rows[0].delay_hours || 24));

      // Create lead sequence record
      const result = await db.query(
        `INSERT INTO lead_sequences (
          lead_id, sequence_id, current_step, status, next_action_due
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [leadId, sequence.id, 1, 'active', nextActionDue]
      );

      logger.info(`Initialized sequence ${sequenceType} for lead ${leadId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error initializing sequence:', error);
      throw error;
    }
  }

  /**
   * Get or create sequence by type
   */
  async getOrCreateSequence(sequenceType) {
    const result = await db.query(
      'SELECT * FROM sequences WHERE sequence_type = $1 LIMIT 1',
      [sequenceType]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Create default sequence
    const insertResult = await db.query(
      `INSERT INTO sequences (name, sequence_type, total_steps, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [`${sequenceType.charAt(0).toUpperCase() + sequenceType.slice(1)} Sequence`, sequenceType, 5, true]
    );

    // Create default steps
    await this.createDefaultSteps(insertResult.rows[0].id, sequenceType);

    return insertResult.rows[0];
  }

  /**
   * Create default sequence steps
   */
  async createDefaultSteps(sequenceId, sequenceType) {
    const defaultSteps = this.getDefaultSteps(sequenceType);

    for (const step of defaultSteps) {
      await db.query(
        `INSERT INTO sequence_steps (
          sequence_id, step_number, delay_hours, subject_template, body_template, conditions
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          sequenceId,
          step.step_number,
          step.delay_hours,
          step.subject_template,
          step.body_template,
          JSON.stringify(step.conditions || {})
        ]
      );
    }
  }

  /**
   * Get default steps for sequence type
   */
  getDefaultSteps(sequenceType) {
    const templates = {
      welcome: [
        {
          step_number: 1,
          delay_hours: 0,
          subject_template: 'Welcome to HingeCraft, {{first_name}}!',
          body_template: '<p>Hi {{first_name}},</p><p>Welcome to HingeCraft! We\'re excited to have you join our mission.</p>',
          conditions: {}
        },
        {
          step_number: 2,
          delay_hours: 24,
          subject_template: 'Join the Movement, {{first_name}}',
          body_template: '<p>Hi {{first_name}},</p><p>Ready to make an impact? Join thousands of others...</p>',
          conditions: { requires_open: false }
        }
      ]
    };

    return templates[sequenceType] || templates.welcome;
  }

  /**
   * Process pending sequence actions
   */
  async processPendingActions() {
    try {
      const now = new Date();
      
      // Get all lead sequences that are due for next action
      const result = await db.query(
        `SELECT ls.*, l.email, l.first_name, l.last_name, l.organization
         FROM lead_sequences ls
         JOIN leads l ON ls.lead_id = l.id
         WHERE ls.status = 'active'
           AND ls.next_action_due <= $1
         ORDER BY ls.next_action_due ASC
         LIMIT 100`,
        [now]
      );

      for (const leadSequence of result.rows) {
        try {
          await this.sendNextStep(leadSequence);
        } catch (error) {
          logger.error(`Error sending step for lead sequence ${leadSequence.id}:`, error);
        }
      }

      return { processed: result.rows.length };
    } catch (error) {
      logger.error('Error processing pending actions:', error);
      throw error;
    }
  }

  /**
   * Send next step in sequence
   */
  async sendNextStep(leadSequence) {
    try {
      // Get current step
      const stepResult = await db.query(
        'SELECT * FROM sequence_steps WHERE sequence_id = $1 AND step_number = $2',
        [leadSequence.sequence_id, leadSequence.current_step]
      );

      if (stepResult.rows.length === 0) {
        // Sequence complete
        await db.query(
          'UPDATE lead_sequences SET status = $1 WHERE id = $2',
          ['completed', leadSequence.id]
        );
        return;
      }

      const step = stepResult.rows[0];
      const lead = {
        email: leadSequence.email,
        first_name: leadSequence.first_name,
        last_name: leadSequence.last_name,
        organization: leadSequence.organization
      };

      // Check conditions
      if (!this.checkConditions(step.conditions, leadSequence)) {
        logger.info(`Conditions not met for step ${step.step_number}, skipping`);
        return;
      }

      // Personalize templates
      const subject = this.personalizeTemplate(step.subject_template, lead);
      const body = this.personalizeTemplate(step.body_template, lead);

      // Send email via Anymail (primary) or Gmail (fallback)
      let sendResult;
      try {
        sendResult = await anymail.sendEmail({
          to: lead.email,
          subject: subject,
          html: body
        });
      } catch (error) {
        logger.warn('Anymail send failed, trying Gmail:', error);
        sendResult = await gmail.sendEmail({
          to: lead.email,
          subject: subject,
          html: body
        });
      }

      if (sendResult.success) {
        // Log email
        await db.insertEmailLog({
          lead_id: leadSequence.lead_id,
          sequence_id: leadSequence.sequence_id,
          step_number: step.step_number,
          provider: sendResult.provider,
          provider_message_id: sendResult.messageId,
          to_email: lead.email,
          subject: subject,
          template_id: step.template_id,
          status: 'sent',
          sent_at: new Date()
        });

        // Update HubSpot engagement
        await hubspot.createEngagement(leadSequence.lead_id, {
          type: 'EMAIL',
          timestamp: Date.now(),
          metadata: {
            subject: subject,
            provider: sendResult.provider
          }
        });

        // Move to next step or complete
        const nextStep = step.step_number + 1;
        const nextStepResult = await db.query(
          'SELECT delay_hours FROM sequence_steps WHERE sequence_id = $1 AND step_number = $2',
          [leadSequence.sequence_id, nextStep]
        );

        if (nextStepResult.rows.length > 0) {
          const nextDelay = nextStepResult.rows[0].delay_hours || 24;
          const nextActionDue = new Date();
          nextActionDue.setHours(nextActionDue.getHours() + nextDelay);

          await db.query(
            `UPDATE lead_sequences 
             SET current_step = $1, next_action_due = $2, last_sent_at = $3
             WHERE id = $4`,
            [nextStep, nextActionDue, new Date(), leadSequence.id]
          );
        } else {
          // Sequence complete
          await db.query(
            'UPDATE lead_sequences SET status = $1 WHERE id = $2',
            ['completed', leadSequence.id]
          );
        }
      }
    } catch (error) {
      logger.error('Error sending next step:', error);
      throw error;
    }
  }

  /**
   * Check if conditions are met
   */
  checkConditions(conditions, leadSequence) {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    // Check requires_open
    if (conditions.requires_open) {
      // Check if previous email was opened
      // This would require checking email_logs
      // For now, return true
    }

    // Check requires_click
    if (conditions.requires_click) {
      // Check if previous email was clicked
      // This would require checking email_logs
      // For now, return true
    }

    return true;
  }

  /**
   * Personalize template
   */
  personalizeTemplate(template, lead) {
    let personalized = template;
    personalized = personalized.replace(/\{\{first_name\}\}/g, lead.first_name || '');
    personalized = personalized.replace(/\{\{last_name\}\}/g, lead.last_name || '');
    personalized = personalized.replace(/\{\{name\}\}/g, `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'there');
    personalized = personalized.replace(/\{\{organization\}\}/g, lead.organization || '');
    personalized = personalized.replace(/\{\{email\}\}/g, lead.email || '');
    return personalized;
  }
}

module.exports = new SequenceEngine();
