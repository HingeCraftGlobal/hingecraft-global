/**
 * Unified HubSpot Sync Service
 * Combines all sync operations to ensure complete data flow
 */

const hubspotOptimizedSync = require('./hubspotOptimizedSync');
const hubspotCompleteSetup = require('./hubspotCompleteSetup');
const hubspotDashboardSync = require('./hubspotDashboardSync');
const db = require('../utils/database');
const logger = require('../utils/logger');
const axios = require('axios');
const config = require('../../config/api_keys');

class HubSpotUnifiedSync {
  constructor() {
    this.apiKey = config.hubspot.personalAccessKey;
    this.client = axios.create({
      baseURL: config.hubspot.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Complete unified sync - ensures all data flows to HubSpot
   */
  async completeUnifiedSync() {
    try {
      logger.info('🚀 Starting COMPLETE UNIFIED HubSpot Sync');
      
      // Step 1: Ensure all properties exist
      logger.info('📋 Step 1: Ensuring all properties exist...');
      const propertiesResult = await hubspotCompleteSetup.createAllProperties();
      logger.info(`✅ Properties: ${propertiesResult.created} created, ${propertiesResult.existing} existing`);

      // Step 2: Sync all leads to contacts
      logger.info('');
      logger.info('📋 Step 2: Syncing all leads to HubSpot contacts...');
      const leadsResult = await hubspotOptimizedSync.syncAllLeadsOptimized();
      logger.info(`✅ Leads: ${leadsResult.created + leadsResult.updated}/${leadsResult.total} synced`);

      // Step 3: Update all contacts with complete automation data
      logger.info('');
      logger.info('📋 Step 3: Updating contacts with automation data...');
      const updateResult = await hubspotOptimizedSync.updateAllContactsWithAutomationData();
      logger.info(`✅ Contacts: ${updateResult.updated} updated`);

      // Step 4: Sync segments as lists
      logger.info('');
      logger.info('📋 Step 4: Syncing segments to HubSpot lists...');
      const segmentsResult = await this.syncSegmentsToLists();
      logger.info(`✅ Segments: ${segmentsResult.synced} synced as lists`);

      // Step 5: Sync pipeline runs
      logger.info('');
      logger.info('📋 Step 5: Syncing pipeline runs...');
      const pipelineResult = await hubspotOptimizedSync.syncPipelineRunsOptimized();
      if (!pipelineResult.skipped) {
        logger.info(`✅ Pipeline Runs: ${pipelineResult.synced} synced`);
      }

      // Step 6: Verify contacts are visible
      logger.info('');
      logger.info('📋 Step 6: Verifying contacts in HubSpot...');
      const verificationResult = await this.verifyContactsInHubSpot();
      logger.info(`✅ Verification: ${verificationResult.count} contacts found in HubSpot`);

      return {
        success: true,
        properties: propertiesResult,
        leads: leadsResult,
        contacts: updateResult,
        segments: segmentsResult,
        pipeline: pipelineResult,
        verification: verificationResult,
        apiCallsUsed: hubspotOptimizedSync.apiCallCount || 0
      };
    } catch (error) {
      logger.error('Error in unified sync:', error);
      throw error;
    }
  }

  /**
   * Sync segments to HubSpot lists
   */
  async syncSegmentsToLists() {
    try {
      // Get all unique segments
      const segmentsResult = await db.query(`
        SELECT DISTINCT 
          segment_name,
          segment_type,
          COUNT(*) as lead_count
        FROM lead_segments
        GROUP BY segment_name, segment_type
        ORDER BY lead_count DESC
      `);

      const segments = segmentsResult.rows;
      const synced = [];

      for (const segment of segments) {
        try {
          // Get leads in this segment
          const leadsResult = await db.query(`
            SELECT l.email, l.first_name, l.last_name,
                   COALESCE(dr.hubspot_contact_id, 
                     (SELECT hubspot_contact_id FROM hubspot_sync WHERE lead_id = l.id LIMIT 1)
                   ) as hubspot_contact_id
            FROM leads l
            JOIN lead_segments ls ON l.id = ls.lead_id
            LEFT JOIN drive_rows dr ON l.drive_row_id = dr.id
            WHERE ls.segment_name = $1 AND ls.segment_type = $2
            AND COALESCE(dr.hubspot_contact_id, 
              (SELECT hubspot_contact_id FROM hubspot_sync WHERE lead_id = l.id LIMIT 1)
            ) IS NOT NULL
          `, [segment.segment_name, segment.segment_type]);

          const contacts = leadsResult.rows.filter(r => r.hubspot_contact_id);
          
          if (contacts.length === 0) continue;

          // Create list name
          const listName = `Automation: ${segment.segment_name} (${segment.segment_type})`;

          // Check if list exists
          let listId = null;
          try {
            const searchResponse = await this.client.get('/contacts/v1/lists', {
              params: { name: listName }
            });
            const lists = searchResponse.data.lists || [];
            if (lists.length > 0) {
              listId = lists[0].listId;
            }
          } catch (error) {
            // List doesn't exist, will create
          }

          // Create list if doesn't exist
          if (!listId) {
            const createResponse = await this.client.post('/contacts/v1/lists', {
              name: listName,
              dynamic: false
            });
            listId = createResponse.data.listId;
          }

          // Add contacts to list (batch)
          const contactIds = contacts.map(c => c.hubspot_contact_id);
          const batchSize = 100;
          for (let i = 0; i < contactIds.length; i += batchSize) {
            const batch = contactIds.slice(i, i + batchSize);
            await this.client.post(`/contacts/v1/lists/${listId}/add`, {
              vids: batch
            });
          }

          synced.push({
            segment_name: segment.segment_name,
            segment_type: segment.segment_type,
            list_id: listId,
            list_name: listName,
            contact_count: contacts.length
          });

          logger.info(`Synced segment ${segment.segment_name} as list ${listName} with ${contacts.length} contacts`);
        } catch (error) {
          logger.error(`Error syncing segment ${segment.segment_name}:`, error.message);
        }
      }

      return { success: true, synced: synced.length, lists: synced };
    } catch (error) {
      logger.error('Error syncing segments:', error);
      throw error;
    }
  }

  /**
   * Verify contacts are visible in HubSpot
   */
  async verifyContactsInHubSpot() {
    try {
      // Get contacts from HubSpot
      const response = await this.client.get('/crm/v3/objects/contacts', {
        params: {
          limit: 100,
          properties: 'email,firstname,lastname,automation_lead_type,automation_sequence_status'
        }
      });

      const contacts = response.data.results || [];
      
      // Get database leads count
      const dbResult = await db.query('SELECT COUNT(*) as count FROM leads');
      const dbCount = parseInt(dbResult.rows[0].count) || 0;

      return {
        success: true,
        count: contacts.length,
        dbCount: dbCount,
        sample: contacts.slice(0, 5).map(c => ({
          email: c.properties.email,
          name: `${c.properties.firstname || ''} ${c.properties.lastname || ''}`.trim(),
          leadType: c.properties.automation_lead_type
        }))
      };
    } catch (error) {
      logger.error('Error verifying contacts:', error);
      return { success: false, count: 0 };
    }
  }

  /**
   * Ensure all leads have HubSpot contact IDs
   */
  async ensureAllLeadsSynced() {
    try {
      // Get leads without HubSpot contact IDs
      const result = await db.query(`
        SELECT l.*
        FROM leads l
        LEFT JOIN drive_rows dr ON l.drive_row_id = dr.id
        LEFT JOIN hubspot_sync hs ON l.id = hs.lead_id
        WHERE dr.hubspot_contact_id IS NULL 
          AND hs.hubspot_contact_id IS NULL
        LIMIT 100
      `);

      const unsyncedLeads = result.rows;
      
      if (unsyncedLeads.length === 0) {
        logger.info('All leads are synced to HubSpot');
        return { synced: 0, total: 0 };
      }

      logger.info(`Found ${unsyncedLeads.length} leads to sync`);

      // Sync these leads
      const syncResult = await hubspotOptimizedSync.batchUpsertContacts(unsyncedLeads);
      
      return {
        synced: syncResult.created + syncResult.updated,
        failed: syncResult.failed,
        total: unsyncedLeads.length
      };
    } catch (error) {
      logger.error('Error ensuring leads synced:', error);
      throw error;
    }
  }
}

module.exports = new HubSpotUnifiedSync();
