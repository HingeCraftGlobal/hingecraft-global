/**
 * Main Orchestrator Service
 * Coordinates the entire automation pipeline: Drive → Process → HubSpot → Email → Sequence
 */

const googleDrive = require('./services/googleDrive');
const leadProcessor = require('./services/leadProcessor');
const hubspot = require('./services/hubspot');
const sequenceEngine = require('./services/sequenceEngine');
const emailWaveSender = require('./services/emailWaveSender');
const systemWatcher = require('./services/systemWatcher');
const fileProcessor = require('./services/fileProcessor');
const driveIngest = require('./services/driveIngest');
const leadClassifier = require('./services/leadClassifier');
const db = require('./utils/database');
const logger = require('./utils/logger');
const { v4: uuidv4 } = require('uuid');

class Orchestrator {
  /**
   * Main pipeline: Process file from Google Drive
   * NEW FLOW: Drive → Parse → AnyMail → HubSpot → Classify → Template Routing → Email
   */
  async processDriveFile(fileId) {
    try {
      logger.info(`Starting NEW integrated pipeline for file ${fileId}`);

      // Use new driveIngest service which handles:
      // 1. File download & parsing
      // 2. AnyMail enrichment
      // 3. HubSpot sync
      // 4. Lead classification
      // 5. Template routing & sequence initialization
      const result = await driveIngest.processDriveFile(fileId);

      // Also create import_batch record for backward compatibility
      const importId = uuidv4();
      await db.query(
        `INSERT INTO import_batches (id, source, file_id, filename, status, total_rows, processed_rows)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (file_id) DO UPDATE
         SET status = EXCLUDED.status, processed_rows = EXCLUDED.processed_rows`,
        [
          importId,
          'google_drive',
          fileId,
          result.filename,
          'completed',
          result.total_rows,
          result.processed
        ]
      );

      logger.info(`NEW pipeline completed for file ${fileId}: ${result.processed} leads processed`);

      return {
        success: true,
        import_id: importId,
        ingest_id: result.ingest_id,
        file: result.filename,
        total_rows: result.total_rows,
        processed: result.processed,
        anymail_enriched: result.anymail_enriched || 0,
        hubspot_synced: result.hubspot_synced || 0
      };
    } catch (error) {
      logger.error(`Error in NEW pipeline for file ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * LEGACY pipeline: Process file from Google Drive (kept for backward compatibility)
   */
  async processDriveFileLegacy(fileId) {
    try {
      logger.info(`Starting LEGACY pipeline for file ${fileId}`);

      // Step 1: Get file metadata
      const fileMetadata = await googleDrive.getFileMetadata(fileId);
      logger.info(`Processing file: ${fileMetadata.name}`);

      // Step 2: Create import batch record
      const importId = uuidv4();
      await db.query(
        `INSERT INTO import_batches (id, source, file_id, filename, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [importId, 'google_drive', fileId, fileMetadata.name, 'processing']
      );

      // Step 3: Read and parse file
      const fileProcessStart = Date.now();
      systemWatcher.updatePipelineStage(pipelineId, 'fileProcessing', 'started');
      
      const fileData = await googleDrive.processFile(fileId);
      logger.info(`File contains ${fileData.totalRows} rows`);
      
      const fileType = fileProcessor.detectFileType(fileMetadata.name, fileMetadata.mimeType);
      systemWatcher.watchFileProcessing(fileId, fileType, fileData.totalRows, fileData.headers.length);
      systemWatcher.updatePipelineStage(pipelineId, 'fileProcessing', 'completed', {
        fileType,
        rowCount: fileData.totalRows,
        columnCount: fileData.headers.length,
        duration: Date.now() - fileProcessStart
      });

      // Step 4: Process leads
      const leadProcessStart = Date.now();
      systemWatcher.updatePipelineStage(pipelineId, 'leadProcessing', 'started');
      
      const processResult = await leadProcessor.processFileLeads(fileData, fileId, importId);
      logger.info(`Processed ${processResult.processed} leads, ${processResult.errors} errors`);
      
      systemWatcher.watchLeadProcessing(
        processResult.processed,
        processResult.errors,
        processResult.enriched || 0,
        processResult.validated || 0
      );
      systemWatcher.updatePipelineStage(pipelineId, 'leadProcessing', 'completed', {
        processed: processResult.processed,
        errors: processResult.errors,
        duration: Date.now() - leadProcessStart
      });

      // Step 5: Email Collection (Anymail)
      const emailCollectionStart = Date.now();
      systemWatcher.updatePipelineStage(pipelineId, 'emailCollection', 'started');
      
      // Collect emails from leads (Anymail enrichment happens in leadProcessor)
      const totalEmails = processResult.leads.filter(l => l.email).length;
      const enrichedEmails = processResult.enriched || 0;
      
      systemWatcher.watchEmailCollection(enrichedEmails, enrichedEmails, totalEmails);
      systemWatcher.updatePipelineStage(pipelineId, 'emailCollection', 'completed', {
        totalEmails,
        enrichedEmails,
        duration: Date.now() - emailCollectionStart
      });

      // Step 6: Database Integration
      const dbStart = Date.now();
      systemWatcher.updatePipelineStage(pipelineId, 'databaseIntegration', 'started');
      
      // Leads are already in database from leadProcessor, just track it
      systemWatcher.watchDatabaseOperation('insert', 'leads', processResult.processed, 0);
      systemWatcher.updatePipelineStage(pipelineId, 'databaseIntegration', 'completed', {
        leadsInserted: processResult.processed,
        duration: Date.now() - dbStart
      });

      // Step 7: Sync to HubSpot and collect all emails for wave sending
      const hubspotStart = Date.now();
      systemWatcher.updatePipelineStage(pipelineId, 'hubspotSync', 'started');
      
      const syncResults = [];
      const qualifiedLeads = []; // Leads ready for email sequences
      
      for (const lead of processResult.leads) {
        try {
          const syncStart = Date.now();
          // Sync to HubSpot
          const hubspotResult = await hubspot.upsertContact(lead);
          
          if (hubspotResult.success) {
            const syncDuration = Date.now() - syncStart;
            systemWatcher.watchHubSpotSync(hubspotResult.contactId, lead.id, 'synced', syncDuration);
            
            // Store HubSpot sync record
            await db.query(
              `INSERT INTO hubspot_sync (lead_id, hubspot_contact_id, sync_status, last_sync_at)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (hubspot_contact_id) DO UPDATE
               SET lead_id = EXCLUDED.lead_id, last_sync_at = EXCLUDED.last_sync_at`,
              [lead.id, hubspotResult.contactId, 'synced', new Date()]
            );

            // Initialize sequence and collect for wave sending
            const score = leadProcessor.scoreLead(lead);
            if (score >= 65 && lead.email) { // Only start sequence for qualified leads with email
              await sequenceEngine.initializeSequence(lead.id, 'welcome');
              qualifiedLeads.push({
                ...lead,
                hubspot_contact_id: hubspotResult.contactId,
                score: score
              });
            }

            syncResults.push({
              lead_id: lead.id,
              email: lead.email,
              hubspot_contact_id: hubspotResult.contactId,
              sequence_initialized: score >= 65
            });
          }
        } catch (error) {
          logger.error(`Error syncing lead ${lead.id} to HubSpot:`, error);
          systemWatcher.watchHubSpotSync(null, lead.id, 'failed', 0);
          syncResults.push({
            lead_id: lead.id,
            email: lead.email,
            error: error.message
          });
        }
      }
      
      systemWatcher.updatePipelineStage(pipelineId, 'hubspotSync', 'completed', {
        synced: syncResults.filter(r => r.hubspot_contact_id).length,
        failed: syncResults.filter(r => r.error).length,
        duration: Date.now() - hubspotStart
      });

      // Step 5b: Send initial welcome emails in waves (if any qualified leads)
      let emailResults = { sent: 0, failed: 0, waves: 0 };
      if (qualifiedLeads.length > 0) {
        logger.info(`Sending welcome emails to ${qualifiedLeads.length} qualified leads in waves`);
        
        // Get welcome email template
        const welcomeTemplate = {
          subject: 'Welcome to HingeCraft, {{first_name}}!',
          html: `
            <p>Hi {{first_name}},</p>
            <p>Welcome to HingeCraft! We're excited to have you join our mission.</p>
            <p>We're building something special, and we'd love for you to be part of it.</p>
            <p>Best regards,<br>The HingeCraft Team</p>
          `,
          template_id: 'welcome_1'
        };

        // Collect all emails from leads
        const emails = await emailWaveSender.collectEmailsFromLeads(
          qualifiedLeads.map(lead => ({
            ...lead,
            sequence_id: null, // Will be set by sequence engine
            step_number: 1
          })),
          welcomeTemplate
        );

        // Send in waves
        emailResults = await emailWaveSender.sendInWaves(emails);
        logger.info(`Wave sending complete: ${emailResults.sent} sent, ${emailResults.failed} failed across ${emailResults.waves} waves`);
      }

      // Step 10: Event Tracking
      const trackingStart = Date.now();
      systemWatcher.updatePipelineStage(pipelineId, 'eventTracking', 'started');
      
      // Update import batch status
      await db.query(
        `UPDATE import_batches 
         SET status = $1, total_rows = $2, processed_rows = $3, finished_at = $4
         WHERE id = $5`,
        ['completed', fileData.totalRows, processResult.processed, new Date(), importId]
      );

      // Audit log
      await db.insertAuditLog({
        action: 'file_processed',
        entity_type: 'import_batch',
        entity_id: importId,
        payload: {
          file_id: fileId,
          filename: fileMetadata.name,
          total_rows: fileData.totalRows,
          processed: processResult.processed,
          errors: processResult.errors,
          synced_to_hubspot: syncResults.filter(r => r.hubspot_contact_id).length
        }
      });
      
      systemWatcher.updatePipelineStage(pipelineId, 'eventTracking', 'completed', {
        duration: Date.now() - trackingStart
      });

      // Complete pipeline tracking
      const summary = {
        total_rows: fileData.totalRows,
        processed: processResult.processed,
        errors: processResult.errors,
        hubspot_synced: syncResults.filter(r => r.hubspot_contact_id).length,
        sequences_initialized: sequencesInitialized,
        emails_sent: emailResults.sent || 0,
        emails_failed: emailResults.failed || 0,
        email_waves: emailResults.waves || 0
      };
      
      systemWatcher.completePipelineTracking(pipelineId, summary);
      logger.info(`Pipeline completed for file ${fileId}`);

      return {
        success: true,
        pipeline_id: pipelineId,
        import_id: importId,
        file: fileMetadata.name,
        total_rows: fileData.totalRows,
        processed: processResult.processed,
        errors: processResult.errors,
        hubspot_synced: syncResults.filter(r => r.hubspot_contact_id).length,
        sequences_initialized: sequencesInitialized,
        emails_sent: emailResults.sent || 0,
        emails_failed: emailResults.failed || 0,
        email_waves: emailResults.waves || 0,
        sync_results: syncResults
      };

    } catch (error) {
      logger.error(`Error in pipeline for file ${fileId}:`, error);
      
      // Mark pipeline as failed
      if (pipelineId) {
        systemWatcher.updatePipelineStage(pipelineId, 'fileProcessing', 'failed', {
          error: error.message
        });
        systemWatcher.completePipelineTracking(pipelineId, { error: error.message });
      }
      
      // Update import batch with error
      try {
        if (importId) {
          await db.query(
            `UPDATE import_batches SET status = $1, error_message = $2 WHERE id = $3`,
            ['error', error.message, importId]
          );
        } else if (fileId) {
          await db.query(
            `UPDATE import_batches SET status = $1, error_message = $2 WHERE file_id = $3`,
            ['error', error.message, fileId]
          );
        }
      } catch (updateError) {
        logger.error('Error updating import batch:', updateError);
      }

      throw error;
    }
  }

  /**
   * Scan Google Drive folder and process new files
   */
  async scanAndProcessFolder(folderId = null) {
    try {
      logger.info('Scanning Google Drive folder for new files');

      // Get files from folder
      const files = await googleDrive.scanFolder(folderId);

      // Process each file
      const results = [];
      for (const file of files) {
        try {
          // Check if file was already processed
          const existing = await db.query(
            'SELECT id FROM import_batches WHERE file_id = $1 AND status = $2',
            [file.id, 'completed']
          );

          if (existing.rows.length > 0) {
            logger.info(`File ${file.name} already processed, skipping`);
            continue;
          }

          // Process file
          const result = await this.processDriveFile(file.id);
          results.push(result);
        } catch (error) {
          logger.error(`Error processing file ${file.name}:`, error);
          results.push({
            file_id: file.id,
            filename: file.name,
            error: error.message
          });
        }
      }

      return {
        success: true,
        files_scanned: files.length,
        files_processed: results.length,
        results: results
      };
    } catch (error) {
      logger.error('Error scanning folder:', error);
      throw error;
    }
  }

  /**
   * Process pending sequence actions (run periodically)
   */
  async processSequences() {
    try {
      logger.info('Processing pending sequence actions');
      const result = await sequenceEngine.processPendingActions();
      logger.info(`Processed ${result.processed} sequence actions`);
      return result;
    } catch (error) {
      logger.error('Error processing sequences:', error);
      throw error;
    }
  }

  /**
   * Handle webhook from Google Drive
   */
  async handleDriveWebhook(webhookData) {
    try {
      logger.info('Received Google Drive webhook:', webhookData);

      const fileId = webhookData.fileId || webhookData.resource?.id;
      if (!fileId) {
        logger.warn('No file ID in webhook data');
        return { success: false, error: 'No file ID' };
      }

      // Process file
      const result = await this.processDriveFile(fileId);
      return result;
    } catch (error) {
      logger.error('Error handling Drive webhook:', error);
      throw error;
    }
  }
}

module.exports = new Orchestrator();
