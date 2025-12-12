/**
 * Batch Email Processor
 * Processes and sends emails in waves for all leads from a file
 */

const emailWaveSender = require('./emailWaveSender');
const db = require('../utils/database');
const logger = require('../utils/logger');
const leadProcessor = require('./leadProcessor');

class BatchEmailProcessor {
  /**
   * Process all leads from a file and send initial emails in waves
   * @param {Array} leads - Array of processed leads
   * @param {String} sequenceType - Type of sequence to initialize
   * @returns {Object} Results with sending statistics
   */
  async processAndSendInitialEmails(leads, sequenceType = 'welcome') {
    try {
      logger.info(`Processing ${leads.length} leads for initial email sending`);
      
      // Filter qualified leads (score >= 65 and has email)
      const qualifiedLeads = leads.filter(lead => {
        const score = leadProcessor.scoreLead(lead);
        return score >= 65 && lead.email;
      });
      
      if (qualifiedLeads.length === 0) {
        logger.info('No qualified leads for email sending');
        return {
          total: leads.length,
          qualified: 0,
          sent: 0,
          failed: 0,
          waves: 0
        };
      }
      
      logger.info(`${qualifiedLeads.length} qualified leads ready for email sending`);
      
      // Get email template for sequence type
      const template = this.getEmailTemplate(sequenceType);
      
      // Collect all emails from leads
      const emails = await emailWaveSender.collectEmailsFromLeads(
        qualifiedLeads.map(lead => ({
          ...lead,
          sequence_id: lead.sequence_id || null,
          step_number: 1
        })),
        template
      );
      
      // Send in waves
      const waveResults = await emailWaveSender.sendInWaves(emails);
      
      logger.info(`Batch email processing complete: ${waveResults.sent} sent, ${waveResults.failed} failed`);
      
      return {
        total: leads.length,
        qualified: qualifiedLeads.length,
        sent: waveResults.sent,
        failed: waveResults.failed,
        waves: waveResults.waves,
        waveResults: waveResults.waveResults
      };
    } catch (error) {
      logger.error('Error in batch email processing:', error);
      throw error;
    }
  }
  
  /**
   * Get email template for sequence type
   */
  getEmailTemplate(sequenceType) {
    const templates = {
      welcome: {
        subject: 'Welcome to HingeCraft, {{first_name}}!',
        html: `
          <p>Hi {{first_name}},</p>
          <p>Welcome to HingeCraft! We're excited to have you join our mission.</p>
          <p>We're building something special, and we'd love for you to be part of it.</p>
          <p>Best regards,<br>The HingeCraft Team</p>
        `,
        template_id: 'welcome_1'
      },
      nurture: {
        subject: 'Join the Movement, {{first_name}}',
        html: `
          <p>Hi {{first_name}},</p>
          <p>Ready to make an impact? Join thousands of others in our mission.</p>
          <p>Best regards,<br>The HingeCraft Team</p>
        `,
        template_id: 'nurture_1'
      }
    };
    
    return templates[sequenceType] || templates.welcome;
  }
}

module.exports = new BatchEmailProcessor();





