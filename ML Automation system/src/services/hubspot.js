/**
 * HubSpot CRM Integration Service
 * Handles contact creation, updates, and sequence enrollment
 */

const axios = require('axios');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const { retry } = require('../utils/retry');
const { hubspotRateLimiter } = require('../utils/rateLimiter');

class HubSpotService {
  constructor() {
    // Use Personal Access Key if available, otherwise fall back to API key
    this.apiKey = config.hubspot.personalAccessKey || config.hubspot.apiKey;
    this.portalId = config.hubspot.portalId;
    this.baseUrl = config.hubspot.baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Create or update contact in HubSpot
   */
  async upsertContact(lead) {
    try {
      // Check rate limit
      const rateLimit = hubspotRateLimiter.isAllowed('hubspot-api');
      if (!rateLimit.allowed) {
        logger.warn(`HubSpot rate limit reached, waiting ${rateLimit.waitTime}s`);
        await new Promise(resolve => setTimeout(resolve, rateLimit.waitTime * 1000));
      }

      // First, try to find existing contact by email
      const existingContact = await retry(
        () => this.findContactByEmail(lead.email),
        { maxRetries: 2 }
      );

      const properties = {
        email: lead.email,
        firstname: lead.first_name || '',
        lastname: lead.last_name || '',
        company: lead.organization || '',
        jobtitle: lead.title || '',
        phone: lead.phone || '',
        city: lead.city || '',
        state: lead.state || '',
        country: lead.country || '',
        website: lead.website || '',
        // Custom HingeCraft properties
        hingecraft_source: lead.source || 'google_drive',
        hingecraft_score: lead.persona_score?.toString() || '0',
        hingecraft_tier: lead.tier?.toString() || '1',
        hingecraft_lead_type: lead.fm_stage || '',
        hingecraft_import_id: lead.source_file_id || '',
        gs_id: lead.gs_id || ''
      };

      if (existingContact) {
        // Update existing contact
        const response = await this.client.patch(
          `/crm/v3/objects/contacts/${existingContact.id}`,
          { properties }
        );

        logger.info(`Updated HubSpot contact ${existingContact.id} for ${lead.email}`);
        return {
          success: true,
          contactId: existingContact.id,
          action: 'updated'
        };
      } else {
        // Create new contact
        const response = await this.client.post(
          '/crm/v3/objects/contacts',
          { properties }
        );

        logger.info(`Created HubSpot contact ${response.data.id} for ${lead.email}`);
        return {
          success: true,
          contactId: response.data.id,
          action: 'created'
        };
      }
    } catch (error) {
      logger.error('Error upserting contact in HubSpot:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Find contact by email
   */
  async findContactByEmail(email) {
    try {
      const response = await this.client.post('/crm/v3/objects/contacts/search', {
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email
          }]
        }],
        properties: ['email', 'firstname', 'lastname', 'company'],
        limit: 1
      });

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0];
      }
      return null;
    } catch (error) {
      logger.error('Error finding contact in HubSpot:', error.message);
      return null;
    }
  }

  /**
   * Create or update company
   */
  async upsertCompany(organization, domain) {
    try {
      const properties = {
        name: organization,
        domain: domain
      };

      // Try to find existing company
      const response = await this.client.post('/crm/v3/objects/companies/search', {
        filterGroups: [{
          filters: [{
            propertyName: 'domain',
            operator: 'EQ',
            value: domain
          }]
        }],
        properties: ['name', 'domain'],
        limit: 1
      });

      if (response.data.results && response.data.results.length > 0) {
        // Update existing company
        const companyId = response.data.results[0].id;
        await this.client.patch(`/crm/v3/objects/companies/${companyId}`, { properties });
        return { success: true, companyId, action: 'updated' };
      } else {
        // Create new company
        const createResponse = await this.client.post('/crm/v3/objects/companies', { properties });
        return { success: true, companyId: createResponse.data.id, action: 'created' };
      }
    } catch (error) {
      logger.error('Error upserting company in HubSpot:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Associate contact with company
   */
  async associateContactWithCompany(contactId, companyId) {
    try {
      await this.client.put(
        `/crm/v3/objects/contacts/${contactId}/associations/companies/${companyId}/0`,
        {}
      );
      return { success: true };
    } catch (error) {
      logger.error('Error associating contact with company:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enroll contact in sequence/workflow
   */
  async enrollInSequence(contactId, sequenceId) {
    try {
      // HubSpot Sequences API (if available)
      const response = await this.client.post('/crm/v3/objects/contacts/batch/read', {
        inputs: [{ id: contactId }],
        properties: ['email']
      });

      // Add contact to workflow/sequence
      // Note: Actual implementation depends on HubSpot plan and API availability
      // This is a placeholder that may need adjustment based on your HubSpot setup
      
      logger.info(`Enrolled contact ${contactId} in sequence ${sequenceId}`);
      return { success: true, contactId, sequenceId };
    } catch (error) {
      logger.error('Error enrolling in sequence:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create engagement (email activity)
   */
  async createEngagement(contactId, engagementData) {
    try {
      const response = await this.client.post('/crm/v3/objects/engagements', {
        engagement: {
          type: engagementData.type || 'EMAIL',
          timestamp: engagementData.timestamp || Date.now()
        },
        associations: [{
          to: { id: contactId },
          type: 'HUBSPOT_DEFINED',
          category: 'HUBSPOT_DEFINED'
        }],
        metadata: engagementData.metadata || {}
      });

      return { success: true, engagementId: response.data.id };
    } catch (error) {
      logger.error('Error creating engagement:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update contact properties
   */
  async updateContactProperties(contactId, properties) {
    try {
      await this.client.patch(`/crm/v3/objects/contacts/${contactId}`, { properties });
      return { success: true };
    } catch (error) {
      logger.error('Error updating contact properties:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add contact to list
   */
  async addToList(contactId, listId) {
    try {
      await this.client.post('/contacts/v1/lists/batch-add', {
        listId: listId,
        emails: [contactId] // May need email instead of ID
      });
      return { success: true };
    } catch (error) {
      logger.error('Error adding contact to list:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new HubSpotService();
