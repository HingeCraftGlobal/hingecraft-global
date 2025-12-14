/**
 * Google Drive → AnyMail Sync Service
 * When file is dropped in Google Drive, sends all prospects to AnyMail
 */

const driveIngestWithAnymail = require('./driveIngestWithAnymail');
const anymail = require('./anymail');
const anymailEnhanced = require('./anymailEnhanced');
const db = require('../utils/database');
const logger = require('../utils/logger');

class DriveToAnymailSync {
  /**
   * Process Drive file and send all prospects to AnyMail
   * This is the trigger when file is dropped in Google Drive
   */
  async processDriveFileAndSendToAnymail(fileId) {
    try {
      logger.info(`Processing Drive file ${fileId} and sending to AnyMail`);

      // Step 1: Process file with AnyMail enrichment
      const ingestResult = await driveIngestWithAnymail.processDriveFileWithAnymail(fileId);
      const ingestId = ingestResult.ingest_id;

      // Step 2: Get all leads created from this file
      const leadsResult = await db.query(
        `SELECT * FROM leads WHERE source_file_id = $1 OR drive_row_id IN (
          SELECT id FROM drive_rows WHERE ingest_id = $1
        )`,
        [ingestId]
      );

      const leads = leadsResult.rows;
      logger.info(`Found ${leads.length} leads to send to AnyMail`);

      // Step 3: Send all leads to AnyMail (batch)
      const anymailResults = await this.sendLeadsToAnymail(leads);

      // Step 4: Sync all AnyMail contacts to HubSpot
      await this.syncAnymailContactsToHubSpot(leads);

      return {
        success: true,
        ingest_id: ingestId,
        leads_processed: leads.length,
        anymail_sent: anymailResults.sent,
        hubspot_synced: leads.length
      };

      // Sync to HubSpot for list maintenance
      const hubspotListMaintenance = require('./hubspotListMaintenance');
      await hubspotListMaintenance.syncAllDataForListMaintenance();
      };
    } catch (error) {
      logger.error('Error processing Drive file and sending to AnyMail:', error);
      throw error;
    }
  }

  /**
   * Send leads to AnyMail (batch upload)
   */
  async sendLeadsToAnymail(leads) {
    try {
      const batchSize = 50;
      const sent = [];
      const failed = [];

      for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        
        try {
          // Prepare contacts for AnyMail
          const contacts = batch.map(lead => ({
            email: lead.email,
            first_name: lead.first_name,
            last_name: lead.last_name,
            company: lead.organization,
            title: lead.title,
            phone: lead.phone,
            website: lead.website,
            city: lead.city,
            state: lead.state,
            country: lead.country
          }));

          // Send batch to AnyMail (using AnyMail API for bulk upload)
          // This would use AnyMail's contact import API
          const result = await anymailEnhanced.sendBatch(contacts, {
            templateId: null, // Will be set based on lead type
            from: null // Will be set based on lead type
          }, {
            tracking: true
          });

          if (result.success) {
            sent.push(...batch.map(l => l.id));
            logger.info(`Sent batch ${i / batchSize + 1} to AnyMail: ${batch.length} contacts`);
          } else {
            failed.push(...batch.map(l => ({ leadId: l.id, error: result.error })));
          }
        } catch (error) {
          logger.error(`Error sending batch ${i / batchSize + 1} to AnyMail:`, error);
          failed.push(...batch.map(l => ({ leadId: l.id, error: error.message })));
        }
      }

      return { sent: sent.length, failed: failed.length, details: { sent, failed } };
    } catch (error) {
      logger.error('Error sending leads to AnyMail:', error);
      throw error;
    }
  }

  /**
   * Sync all AnyMail contacts to HubSpot
   */
  async syncAnymailContactsToHubSpot(leads) {
    try {
      const hubspotOptimizedSync = require('./hubspotOptimizedSync');
      
      // Sync all leads to HubSpot
      const syncResult = await hubspotOptimizedSync.batchUpsertContacts(leads);
      
      logger.info(`Synced ${syncResult.created + syncResult.updated} contacts to HubSpot from AnyMail`);
      
      return {
        success: true,
        created: syncResult.created,
        updated: syncResult.updated,
        failed: syncResult.failed
      };
    } catch (error) {
      logger.error('Error syncing AnyMail contacts to HubSpot:', error);
      throw error;
    }
  }
}

module.exports = new DriveToAnymailSync();
