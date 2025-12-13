/**
 * HubSpot Optimized Sync Service
 * Minimizes API calls by using batch operations and smart caching
 * Designed to work within 250,000 API calls/day limit
 */

const axios = require('axios');
const config = require('../../config/api_keys');
const logger = require('../utils/logger');
const db = require('../utils/database');
const { retry } = require('../utils/retry');
const { hubspotRateLimiter } = require('../utils/rateLimiter');

class HubSpotOptimizedSync {
  constructor() {
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
    
    // Cache to minimize API calls
    this.cache = {
      contacts: new Map(), // email -> contactId
      properties: new Set(), // property names
      lastSync: null
    };
    
    // API call counter
    this.apiCallCount = 0;
    this.maxCallsPerDay = 250000;
  }

  /**
   * Check rate limit and track API calls
   */
  async checkRateLimit() {
    const rateLimit = hubspotRateLimiter.isAllowed('hubspot-api');
    if (!rateLimit.allowed) {
      logger.warn(`HubSpot rate limit reached, waiting ${rateLimit.waitTime}s`);
      await new Promise(resolve => setTimeout(resolve, rateLimit.waitTime * 1000));
    }
    this.apiCallCount++;
    if (this.apiCallCount % 100 === 0) {
      logger.info(`HubSpot API calls: ${this.apiCallCount}/${this.maxCallsPerDay}`);
    }
  }

  /**
   * Batch create/update contacts (up to 100 at a time)
   * Uses HubSpot batch API to minimize calls
   * Smart: Checks for existing contacts first, then batch creates/updates
   */
  async batchUpsertContacts(leads) {
    try {
      const results = {
        created: [],
        updated: [],
        failed: []
      };

      // Prepare batches (max 100 per batch)
      const batches = [];
      for (let i = 0; i < leads.length; i += 100) {
        batches.push(leads.slice(i, i + 100));
      }

      // Process each batch
      for (const batch of batches) {
        try {
          // Step 1: Check which contacts already exist using batch search
          await this.checkRateLimit();
          const emails = batch.map(l => l.email?.toLowerCase()).filter(Boolean);
          
          const existingContacts = new Map();
          if (emails.length > 0) {
            try {
              // Use search API with email filter (1 call for batch)
              const searchResponse = await this.client.post(
                '/crm/v3/objects/contacts/search',
                {
                  filterGroups: [{
                    filters: [{
                      propertyName: 'email',
                      operator: 'IN',
                      values: emails
                    }]
                  }],
                  properties: ['email'],
                  limit: 100
                }
              );
              
              if (searchResponse.data.results) {
                searchResponse.data.results.forEach(contact => {
                  if (contact.properties?.email) {
                    const email = contact.properties.email.toLowerCase();
                    existingContacts.set(email, contact.id);
                    this.cache.contacts.set(email, contact.id);
                  }
                });
              }
            } catch (e) {
              // Search failed, will create all as new (wasteful but works)
              logger.warn('Batch search failed, will attempt creates (some may fail if duplicates exist)');
            }
          }

          // Step 2: Separate into creates and updates
          const toCreate = [];
          const toUpdate = [];

          batch.forEach((lead, index) => {
            const email = lead.email?.toLowerCase();
            if (!email) {
              results.failed.push({ leadId: lead.id, error: 'No email' });
              return;
            }

            const properties = {
              email: email,
              firstname: lead.first_name || '',
              lastname: lead.last_name || '',
              company: lead.organization || '',
              jobtitle: lead.title || '',
              phone: lead.phone || '',
              website: lead.website || '',
              city: lead.city || '',
              state: lead.state || '',
              country: lead.country || '',
              // Automation properties
              automation_lead_type: lead.lead_type || '',
              automation_template_set: lead.template_set || '',
              automation_lead_score: lead.lead_score?.toString() || '0',
              automation_source: lead.source || 'google_drive',
              automation_ingested_at: lead.created_at ? new Date(lead.created_at).getTime() : null,
              automation_emails_sent: lead.automation_emails_sent?.toString() || '0',
              automation_emails_opened: lead.automation_emails_opened?.toString() || '0',
              automation_emails_clicked: lead.automation_emails_clicked?.toString() || '0',
              automation_emails_replied: lead.automation_emails_replied?.toString() || '0',
              automation_sequence_status: lead.automation_sequence_status || '',
              automation_sequence_step: lead.automation_sequence_step?.toString() || '0'
            };

            const existingId = existingContacts.get(email) || this.cache.contacts.get(email);
            if (existingId) {
              toUpdate.push({ id: existingId, properties, leadId: lead.id, email });
            } else {
              toCreate.push({ properties, leadId: lead.id, email });
            }
          });

          // Step 3: Batch create new contacts (1 API call per 100)
          if (toCreate.length > 0) {
            const createBatches = [];
            for (let i = 0; i < toCreate.length; i += 100) {
              createBatches.push(toCreate.slice(i, i + 100));
            }

            for (const createBatch of createBatches) {
              try {
                await this.checkRateLimit();
                const createResponse = await this.client.post(
                  '/crm/v3/objects/contacts/batch/create',
                  { inputs: createBatch.map(item => item.properties) }
                );

                if (createResponse.data.results) {
                  createResponse.data.results.forEach((result, idx) => {
                    if (result.id) {
                      const item = createBatch[idx];
                      results.created.push({
                        leadId: item.leadId,
                        contactId: result.id,
                        email: item.email
                      });
                      this.cache.contacts.set(item.email, result.id);
                    }
                  });
                }
              } catch (error) {
                // Fallback to individual creates
                for (const item of createBatch) {
                  const result = await this.upsertContactByEmail(item.email, item.properties);
                  if (result.success) {
                    results.created.push({
                      leadId: item.leadId,
                      contactId: result.contactId,
                      email: item.email
                    });
                  } else {
                    results.failed.push({
                      leadId: item.leadId,
                      email: item.email,
                      error: result.error
                    });
                  }
                }
              }
            }
          }

          // Step 4: Batch update existing contacts (1 API call per 100)
          if (toUpdate.length > 0) {
            const updateBatches = [];
            for (let i = 0; i < toUpdate.length; i += 100) {
              updateBatches.push(toUpdate.slice(i, i + 100));
            }

            for (const updateBatch of updateBatches) {
              try {
                await this.checkRateLimit();
                await this.client.post(
                  '/crm/v3/objects/contacts/batch/update',
                  { inputs: updateBatch.map(item => ({ id: item.id, properties: item.properties })) }
                );

                updateBatch.forEach(item => {
                  results.updated.push({
                    leadId: item.leadId,
                    contactId: item.id,
                    email: item.email
                  });
                });
              } catch (error) {
                // Fallback to individual updates
                for (const item of updateBatch) {
                  try {
                    await this.checkRateLimit();
                    await this.client.patch(
                      `/crm/v3/objects/contacts/${item.id}`,
                      { properties: item.properties }
                    );
                    results.updated.push({
                      leadId: item.leadId,
                      contactId: item.id,
                      email: item.email
                    });
                  } catch (e) {
                    results.failed.push({
                      leadId: item.leadId,
                      email: item.email,
                      error: e.message
                    });
                  }
                }
              }
            }
          }

        } catch (error) {
          logger.error('Error processing batch:', error.message);
          // Mark entire batch as failed
          batch.forEach(lead => {
            results.failed.push({
              leadId: lead.id,
              email: lead.email,
              error: error.message
            });
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('Error in batch upsert contacts:', error);
      throw error;
    }
  }

  /**
   * Upsert single contact by email (with caching)
   */
  async upsertContactByEmail(email, properties) {
    try {
      // Check cache first
      const cachedContactId = this.cache.contacts.get(email.toLowerCase());
      if (cachedContactId) {
        // Update existing contact (1 API call)
        await this.checkRateLimit();
        await this.client.patch(
          `/crm/v3/objects/contacts/${cachedContactId}`,
          { properties }
        );
        return { success: true, contactId: cachedContactId, action: 'updated' };
      }

      // Try to find existing contact (1 API call)
      await this.checkRateLimit();
      const searchResult = await this.client.post(
        '/crm/v3/objects/contacts/search',
        {
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: email.toLowerCase()
            }]
          }],
          limit: 1
        }
      );

      if (searchResult.data.results && searchResult.data.results.length > 0) {
        // Update existing (1 API call)
        const contactId = searchResult.data.results[0].id;
        await this.checkRateLimit();
        await this.client.patch(
          `/crm/v3/objects/contacts/${contactId}`,
          { properties }
        );
        this.cache.contacts.set(email.toLowerCase(), contactId);
        return { success: true, contactId, action: 'updated' };
      } else {
        // Create new (1 API call)
        await this.checkRateLimit();
        const createResult = await this.client.post(
          '/crm/v3/objects/contacts',
          { properties }
        );
        const contactId = createResult.data.id;
        this.cache.contacts.set(email.toLowerCase(), contactId);
        return { success: true, contactId, action: 'created' };
      }
    } catch (error) {
      logger.error(`Error upserting contact ${email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Batch update contact properties (minimizes API calls)
   */
  async batchUpdateContactProperties(updates) {
    try {
      // Group updates by contact ID to minimize calls
      const updatesByContact = {};
      updates.forEach(update => {
        if (!updatesByContact[update.contactId]) {
          updatesByContact[update.contactId] = {};
        }
        Object.assign(updatesByContact[update.contactId], update.properties);
      });

      const results = {
        updated: 0,
        failed: 0
      };

      // Use batch update API (1 call per 100 contacts)
      const contactIds = Object.keys(updatesByContact);
      for (let i = 0; i < contactIds.length; i += 100) {
        const batch = contactIds.slice(i, i + 100).map(contactId => ({
          id: contactId,
          properties: updatesByContact[contactId]
        }));

        try {
          await this.checkRateLimit();
          await this.client.post(
            '/crm/v3/objects/contacts/batch/update',
            { inputs: batch }
          );
          results.updated += batch.length;
        } catch (error) {
          logger.error('Batch update failed:', error.message);
          results.failed += batch.length;
        }
      }

      return results;
    } catch (error) {
      logger.error('Error in batch update properties:', error);
      throw error;
    }
  }

  /**
   * Sync all leads from database (optimized)
   */
  async syncAllLeadsOptimized() {
    try {
      logger.info('Starting optimized lead sync...');

      // Get all leads
      const leadsResult = await db.query(`
        SELECT 
          l.*,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id) as email_count,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'opened') as emails_opened,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'clicked') as emails_clicked,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'replied') as emails_replied,
          (SELECT status FROM lead_sequences WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as sequence_status,
          (SELECT current_step FROM lead_sequences WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as sequence_step
        FROM leads l
        ORDER BY l.created_at DESC
        LIMIT 10000
      `);

      const leads = leadsResult.rows;
      logger.info(`Found ${leads.length} leads to sync`);

      // Prepare leads with all automation data
      const leadsWithData = leads.map(lead => ({
        ...lead,
        automation_emails_sent: parseInt(lead.email_count) || 0,
        automation_emails_opened: parseInt(lead.emails_opened) || 0,
        automation_emails_clicked: parseInt(lead.emails_clicked) || 0,
        automation_emails_replied: parseInt(lead.emails_replied) || 0,
        automation_sequence_status: lead.sequence_status || '',
        automation_sequence_step: parseInt(lead.sequence_step) || 0
      }));

      // Batch upsert (minimizes API calls)
      const result = await this.batchUpsertContacts(leadsWithData);

      logger.info(`Sync complete: ${result.created.length} created, ${result.updated.length} updated, ${result.failed.length} failed`);
      logger.info(`Total API calls used: ${this.apiCallCount}`);

      return {
        success: true,
        total: leads.length,
        created: result.created.length,
        updated: result.updated.length,
        failed: result.failed.length,
        apiCallsUsed: this.apiCallCount,
        details: result
      };
    } catch (error) {
      logger.error('Error syncing all leads:', error);
      throw error;
    }
  }

  /**
   * Sync pipeline runs (as custom objects, if permissions allow)
   */
  async syncPipelineRunsOptimized() {
    try {
      const ingestsResult = await db.query(`
        SELECT 
          di.*,
          COUNT(dr.id) as total_rows,
          COUNT(dr.id) FILTER (WHERE dr.processed = TRUE) as processed_rows,
          COUNT(DISTINCT l.id) as leads_created,
          COUNT(DISTINCT el.id) as emails_sent
        FROM drive_ingests di
        LEFT JOIN drive_rows dr ON di.id = dr.ingest_id
        LEFT JOIN leads l ON l.source_file_id::text = di.id::text
        LEFT JOIN email_logs el ON el.lead_id = l.id
        GROUP BY di.id
        ORDER BY di.inserted_at DESC
        LIMIT 100
      `);

      // Only sync if we have custom object permissions (check first)
      try {
        await this.checkRateLimit();
        await this.client.get('/crm/v3/schemas/pipeline_run');
        // Schema exists, proceed with sync
      } catch (error) {
        if (error.response?.status === 404) {
          logger.info('Custom objects not available, skipping pipeline runs sync');
          return { success: true, skipped: true, reason: 'Custom objects not configured' };
        }
        throw error;
      }

      const results = {
        synced: 0,
        failed: 0
      };

      // Batch create custom objects (if possible)
      for (const ingest of ingestsResult.rows) {
        try {
          await this.checkRateLimit();
          await this.client.post('/crm/v3/objects/pipeline_run', {
            properties: {
              name: `Pipeline Run: ${ingest.filename || ingest.id}`,
              status: ingest.status,
              file_name: ingest.filename || 'Unknown',
              total_rows: ingest.total_rows || 0,
              processed_rows: ingest.processed_rows || 0,
              leads_created: ingest.leads_created || 0,
              emails_sent: ingest.emails_sent || 0,
              started_at: ingest.inserted_at ? new Date(ingest.inserted_at).getTime() : Date.now()
            }
          });
          results.synced++;
        } catch (error) {
          results.failed++;
        }
      }

      return results;
    } catch (error) {
      logger.error('Error syncing pipeline runs:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Full optimized sync - minimizes API calls
   */
  async fullSyncOptimized() {
    try {
      logger.info('🚀 Starting FULL OPTIMIZED HubSpot Sync');
      logger.info(`API Call Budget: ${this.maxCallsPerDay} calls/day`);
      logger.info('Using batch operations to minimize calls...');
      logger.info('');

      const startTime = Date.now();
      this.apiCallCount = 0;

      // Step 1: Sync all leads (uses batch API - very efficient)
      logger.info('📋 Step 1: Syncing all leads...');
      const leadsResult = await this.syncAllLeadsOptimized();
      logger.info(`✅ Leads: ${leadsResult.created + leadsResult.updated}/${leadsResult.total} synced`);
      logger.info(`   API Calls: ${this.apiCallCount}`);

      // Step 2: Update contacts with sequence/email data (batch update)
      logger.info('');
      logger.info('📋 Step 2: Updating contacts with automation data...');
      const updateResult = await this.updateAllContactsWithAutomationData();
      logger.info(`✅ Contacts updated: ${updateResult.updated}`);
      logger.info(`   API Calls: ${this.apiCallCount}`);

      // Step 3: Sync pipeline runs (optional, if custom objects available)
      logger.info('');
      logger.info('📋 Step 3: Syncing pipeline runs...');
      const pipelineResult = await this.syncPipelineRunsOptimized();
      if (!pipelineResult.skipped) {
        logger.info(`✅ Pipeline runs: ${pipelineResult.synced} synced`);
      } else {
        logger.info(`⚠️  Pipeline runs: ${pipelineResult.reason}`);
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      logger.info('');
      logger.info('='.repeat(70));
      logger.info('✅ FULL SYNC COMPLETE!');
      logger.info('');
      logger.info('📊 Summary:');
      logger.info(`   Leads Synced: ${leadsResult.created + leadsResult.updated}`);
      logger.info(`   Contacts Updated: ${updateResult.updated}`);
      logger.info(`   Total API Calls: ${this.apiCallCount}/${this.maxCallsPerDay}`);
      logger.info(`   API Call Usage: ${((this.apiCallCount / this.maxCallsPerDay) * 100).toFixed(2)}%`);
      logger.info(`   Duration: ${duration}s`);
      logger.info('');

      return {
        success: true,
        leads: leadsResult,
        contacts: updateResult,
        pipeline: pipelineResult,
        apiCallsUsed: this.apiCallCount,
        apiCallUsage: (this.apiCallCount / this.maxCallsPerDay * 100).toFixed(2) + '%',
        duration: duration + 's'
      };
    } catch (error) {
      logger.error('Error in full optimized sync:', error);
      throw error;
    }
  }

  /**
   * Update all contacts with automation data (batch operation)
   */
  async updateAllContactsWithAutomationData() {
    try {
      // Get all leads with their automation data
      const result = await db.query(`
        SELECT 
          l.id as lead_id,
          l.email,
          COALESCE(
            dr.hubspot_contact_id,
            (SELECT hubspot_contact_id FROM hubspot_sync WHERE lead_id = l.id LIMIT 1)
          ) as hubspot_contact_id,
          l.lead_type,
          l.template_set,
          l.lead_score,
          (SELECT status FROM lead_sequences WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as sequence_status,
          (SELECT current_step FROM lead_sequences WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as sequence_step,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id) as emails_sent,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'opened') as emails_opened,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'clicked') as emails_clicked,
          (SELECT COUNT(*) FROM email_logs WHERE lead_id = l.id AND status = 'replied') as emails_replied
        FROM leads l
        LEFT JOIN drive_rows dr ON l.drive_row_id = dr.id
        WHERE COALESCE(
          dr.hubspot_contact_id,
          (SELECT hubspot_contact_id FROM hubspot_sync WHERE lead_id = l.id LIMIT 1)
        ) IS NOT NULL
        LIMIT 10000
      `);

      const updates = result.rows
        .filter(row => row.hubspot_contact_id)
        .map(row => ({
          contactId: row.hubspot_contact_id,
          properties: {
            automation_lead_type: row.lead_type || '',
            automation_template_set: row.template_set || '',
            automation_lead_score: row.lead_score?.toString() || '0',
            automation_sequence_status: row.sequence_status || '',
            automation_sequence_step: row.sequence_step?.toString() || '0',
            automation_emails_sent: row.emails_sent?.toString() || '0',
            automation_emails_opened: row.emails_opened?.toString() || '0',
            automation_emails_clicked: row.emails_clicked?.toString() || '0',
            automation_emails_replied: row.emails_replied?.toString() || '0'
          }
        }));

      // Batch update (minimizes API calls)
      const updateResult = await this.batchUpdateContactProperties(updates);

      return {
        success: true,
        updated: updateResult.updated,
        failed: updateResult.failed
      };
    } catch (error) {
      logger.error('Error updating contacts with automation data:', error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      await this.checkRateLimit();
      const response = await this.client.get('/crm/v3/objects/contacts?limit=1');
      return { success: true, status: response.status };
    } catch (error) {
      return { success: false, status: error.response?.status, error: error.message };
    }
  }
}

module.exports = new HubSpotOptimizedSync();
