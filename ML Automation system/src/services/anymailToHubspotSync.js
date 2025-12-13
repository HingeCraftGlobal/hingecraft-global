/**
 * AnyMail → HubSpot Sync Service
 * Syncs all contacts from AnyMail to HubSpot
 */

const axios = require('axios');
const config = require('../../config/api_keys');
const anymail = require('./anymail');
const hubspotOptimizedSync = require('./hubspotOptimizedSync');
const db = require('../utils/database');
const logger = require('../utils/logger');

class AnyMailToHubspotSync {
  constructor() {
    this.hubspotApiKey = config.hubspot.personalAccessKey;
    this.anymailApiKey = config.anymail.apiKey;
  }

  /**
   * Sync all contacts from AnyMail to HubSpot
   */
  async syncAllAnymailContactsToHubspot() {
    try {
      logger.info('Starting AnyMail → HubSpot sync...');

      // Step 1: Get all contacts from AnyMail (if AnyMail has export API)
      // Note: This depends on AnyMail API capabilities
      const anymailContacts = await this.getAllAnymailContacts();

      // Step 2: Transform AnyMail contacts to lead format
      const leads = anymailContacts.map(contact => ({
        email: contact.email,
        first_name: contact.first_name || contact.firstName,
        last_name: contact.last_name || contact.lastName,
        organization: contact.company || contact.organization,
        title: contact.title || contact.jobTitle,
        phone: contact.phone,
        website: contact.website,
        city: contact.city,
        state: contact.state,
        country: contact.country,
        source: 'anymail',
        anymail_contact_id: contact.id || contact.contact_id
      }));

      // Step 3: Create/update leads in database
      await this.createOrUpdateLeads(leads);

      // Step 4: Sync all leads to HubSpot
      const syncResult = await hubspotOptimizedSync.batchUpsertContacts(leads);

      logger.info(`AnyMail → HubSpot sync complete: ${syncResult.created + syncResult.updated} contacts synced`);

      return {
        success: true,
        anymail_contacts: anymailContacts.length,
        leads_created: leads.length,
        hubspot_synced: syncResult.created + syncResult.updated,
        failed: syncResult.failed
      };
    } catch (error) {
      logger.error('Error syncing AnyMail contacts to HubSpot:', error);
      throw error;
    }
  }

  /**
   * Get all contacts from AnyMail
   * Note: This depends on AnyMail API - adjust based on actual API
   */
  async getAllAnymailContacts() {
    try {
      // If AnyMail has a contacts/list API endpoint
      // This is a placeholder - adjust based on actual AnyMail API
      const response = await axios.get(`${config.anymail.baseUrl}/contacts`, {
        headers: {
          'Authorization': `Bearer ${this.anymailApiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          limit: 1000,
          offset: 0
        }
      });

      return response.data.contacts || response.data || [];
    } catch (error) {
      // If AnyMail doesn't have export API, get from database
      logger.warn('AnyMail export API not available, using database contacts');
      const result = await db.query(
        `SELECT DISTINCT 
          email, first_name, last_name, organization, title,
          phone, website, city, state, country
        FROM leads 
        WHERE source = 'anymail_webhook' OR source = 'anymail'
        ORDER BY created_at DESC`
      );
      return result.rows;
    }
  }

  /**
   * Create or update leads in database
   */
  async createOrUpdateLeads(leads) {
    for (const lead of leads) {
      try {
        await db.query(
          `INSERT INTO leads (
            email, first_name, last_name, organization, title,
            phone, website, city, state, country, source, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
          ON CONFLICT (email) DO UPDATE
          SET first_name = EXCLUDED.first_name,
              last_name = EXCLUDED.last_name,
              organization = EXCLUDED.organization,
              title = EXCLUDED.title,
              phone = EXCLUDED.phone,
              website = EXCLUDED.website,
              city = EXCLUDED.city,
              state = EXCLUDED.state,
              country = EXCLUDED.country,
              updated_at = NOW()`,
          [
            lead.email,
            lead.first_name,
            lead.last_name,
            lead.organization,
            lead.title,
            lead.phone,
            lead.website,
            lead.city,
            lead.state,
            lead.country,
            'anymail'
          ]
        );
      } catch (error) {
        logger.error(`Error creating/updating lead ${lead.email}:`, error);
      }
    }
  }
}

module.exports = new AnyMailToHubspotSync();
