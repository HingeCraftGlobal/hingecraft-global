/**
 * Google Drive Ingestion Service
 * Handles file detection, parsing, AnyMail enrichment, and HubSpot sync
 */

const googleDrive = require('./googleDrive');
const fileProcessor = require('./fileProcessor');
const anymail = require('./anymail');
const hubspot = require('./hubspot');
const hubspotEnhanced = require('./hubspotEnhanced');
const leadClassifier = require('./leadClassifier');
const auditTraceback = require('./auditTraceback');
const db = require('../utils/database');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class DriveIngest {
  /**
   * Process a file from Google Drive
   */
  async processDriveFile(fileId) {
    try {
      logger.info(`Starting Drive ingestion for file ${fileId}`);

      // Step 1: Get file metadata
      const fileMetadata = await googleDrive.getFileMetadata(fileId);
      logger.info(`Processing file: ${fileMetadata.name}`);

      // Step 2: Create ingest record
      const ingestId = uuidv4();
      await db.query(
        `INSERT INTO drive_ingests (
          id, drive_file_id, filename, mime_type, size, status, raw_metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          ingestId,
          fileId,
          fileMetadata.name,
          fileMetadata.mimeType,
          fileMetadata.size || 0,
          'processing',
          JSON.stringify(fileMetadata)
        ]
      );

      await this.logIngestAudit(ingestId, 'file_detected', { fileMetadata });

      // Step 3: Download and parse file
      const fileData = await this.downloadAndParseFile(fileId, fileMetadata);
      logger.info(`File contains ${fileData.rows.length} rows`);

      // Step 4: Store rows in database
      const rowIds = await this.storeRows(ingestId, fileData.rows);

      // Step 5: Update ingest with row count
      await db.query(
        'UPDATE drive_ingests SET total_rows = $1 WHERE id = $2',
        [fileData.rows.length, ingestId]
      );

      // Step 6: Process rows (AnyMail → HubSpot → Classification)
      await this.processRows(ingestId, rowIds);

      // Step 7: Mark ingest as completed
      await db.query(
        'UPDATE drive_ingests SET status = $1, processed_at = NOW() WHERE id = $2',
        ['completed', ingestId]
      );

      await this.logIngestAudit(ingestId, 'ingest_completed', {
        total_rows: fileData.rows.length,
        processed: rowIds.length
      });

      logger.info(`Drive ingestion completed for file ${fileId}`);

      return {
        success: true,
        ingest_id: ingestId,
        file_id: fileId,
        filename: fileMetadata.name,
        total_rows: fileData.rows.length,
        processed: rowIds.length
      };
    } catch (error) {
      logger.error(`Error processing Drive file ${fileId}:`, error);
      
      // Mark ingest as failed
      try {
        await db.query(
          'UPDATE drive_ingests SET status = $1 WHERE drive_file_id = $2',
          ['failed', fileId]
        );
      } catch (updateError) {
        logger.error('Error updating ingest status:', updateError);
      }

      throw error;
    }
  }

  /**
   * Download and parse file from Google Drive
   */
  async downloadAndParseFile(fileId, metadata) {
    try {
      // Download file
      const fileData = await googleDrive.processFile(fileId);
      
      // Detect file type
      const fileType = fileProcessor.detectFileType(metadata.name, metadata.mimeType);
      
      // Parse file
      const parsed = fileProcessor.processFile(fileData, metadata.name, metadata.mimeType);

      return {
        headers: parsed.headers || [],
        rows: parsed.rows || []
      };
    } catch (error) {
      logger.error('Error downloading/parsing file:', error);
      throw error;
    }
  }

  /**
   * Store parsed rows in database
   */
  async storeRows(ingestId, rows) {
    const rowIds = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const result = await db.query(
          `INSERT INTO drive_rows (
            ingest_id, row_index, raw, normalized, processed
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING id`,
          [
            ingestId,
            i,
            JSON.stringify(row.data || row),
            null, // Will be populated during normalization
            false
          ]
        );
        rowIds.push(result.rows[0].id);
      } catch (error) {
        logger.error(`Error storing row ${i}:`, error);
      }
    }

    return rowIds;
  }

  /**
   * Process rows: Normalize → AnyMail → HubSpot → Classification
   */
  async processRows(ingestId, rowIds) {
    let anymailEnriched = 0;
    let hubspotSynced = 0;

    for (const rowId of rowIds) {
      try {
        // Get row
        const rowResult = await db.query('SELECT * FROM drive_rows WHERE id = $1', [rowId]);
        if (rowResult.rows.length === 0) continue;

        const row = rowResult.rows[0];

        // Step 1: Normalize row
        const normalized = this.normalizeRow(row.raw);
        await db.query(
          'UPDATE drive_rows SET normalized = $1 WHERE id = $2',
          [JSON.stringify(normalized), rowId]
        );

        // Step 2: AnyMail enrichment
        if (normalized.name || normalized.company) {
          try {
            const enrichData = await anymail.enrichEmail(normalized);
            if (enrichData && enrichData.email) {
              normalized.email = enrichData.email;
              normalized.anymail_data = enrichData;
              await db.query(
                'UPDATE drive_rows SET normalized = $1, anymail_status = $2 WHERE id = $3',
                [JSON.stringify(normalized), 'success', rowId]
              );
              anymailEnriched++;
            } else {
              await db.query(
                'UPDATE drive_rows SET anymail_status = $1 WHERE id = $2',
                ['no_email_found', rowId]
              );
            }
          } catch (error) {
            logger.warn(`AnyMail enrichment failed for row ${rowId}:`, error.message);
            await db.query(
              'UPDATE drive_rows SET anymail_status = $1 WHERE id = $2',
              ['failed', rowId]
            );
          }
        }

        // Step 3: Create/update HubSpot contact (if email exists)
        if (normalized.email) {
          try {
            // Use enhanced HubSpot service with full verification
            const leadData = {
              id: null, // Will be set after lead creation
              email: normalized.email,
              first_name: normalized.first_name,
              last_name: normalized.last_name,
              organization: normalized.company,
              title: normalized.title,
              phone: normalized.phone,
              website: normalized.website,
              city: normalized.city,
              state: normalized.state,
              country: normalized.country,
              source: 'google_drive',
              source_file_id: fileId
            };
            
            // First create lead in our DB, then sync to HubSpot
            const leadResult = await db.query(
              `INSERT INTO leads (
                email, first_name, last_name, organization, title, phone, website,
                city, state, country, source, drive_ingest_id, drive_row_id, raw_meta
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
              ON CONFLICT (email) DO UPDATE
              SET updated_at = NOW(), first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
                  organization = EXCLUDED.organization, title = EXCLUDED.title
              RETURNING id`,
              [
                normalized.email,
                normalized.first_name,
                normalized.last_name,
                normalized.company,
                normalized.title,
                normalized.phone,
                normalized.website,
                normalized.city,
                normalized.state,
                normalized.country,
                'google_drive',
                ingestId,
                rowId,
                JSON.stringify(row.raw)
              ]
            );

            const leadId = leadResult.rows[0].id;
            leadData.id = leadId;

            // Now sync to HubSpot with enhanced service
            let hubspotContact = null;
            try {
              hubspotContact = await hubspotEnhanced.upsertContact(leadData);
              
              if (hubspotContact && hubspotContact.success && hubspotContact.contactId) {
                await db.query(
                  'UPDATE drive_rows SET hubspot_contact_id = $1 WHERE id = $2',
                  [hubspotContact.contactId, rowId]
                );
                hubspotSynced++;
              }
            } catch (hubspotError) {
              logger.error(`HubSpot sync failed for row ${rowId}:`, hubspotError);
              // Continue processing even if HubSpot sync fails
            }

            // Step 5: Classify lead (regardless of HubSpot sync result)
            const classification = await leadClassifier.classifyLead({
              email: normalized.email,
              first_name: normalized.first_name,
              last_name: normalized.last_name,
              organization: normalized.company,
              title: normalized.title,
              source: 'google_drive'
            });

            // Store classification
            await leadClassifier.storeClassification(leadId, classification);

            // Step 6: Initialize appropriate sequence based on classification
            await this.initializeSequenceForLead(leadId, classification.template_set);

            await db.query(
              'UPDATE drive_rows SET lead_id = $1, processed = $2, processed_at = NOW() WHERE id = $3',
              [leadId, true, rowId]
            );
          } catch (error) {
            logger.error(`HubSpot sync failed for row ${rowId}:`, error);
            await this.logIngestAudit(ingestId, 'hubspot_fail', {
              row_id: rowId,
              error: error.message
            });
          }
        } else {
          logger.warn(`Row ${rowId} has no email, skipping HubSpot sync`);
        }
      } catch (error) {
        logger.error(`Error processing row ${rowId}:`, error);
      }
    }

    // Update ingest stats
    await db.query(
      'UPDATE drive_ingests SET anymail_enriched = $1, hubspot_synced = $2 WHERE id = $3',
      [anymailEnriched, hubspotSynced, ingestId]
    );

    return {
      anymail_enriched: anymailEnriched,
      hubspot_synced: hubspotSynced
    };
  }

  /**
   * Normalize row data
   */
  normalizeRow(rawRow) {
    const normalized = {
      first_name: this.extractFirstName(rawRow),
      last_name: this.extractLastName(rawRow),
      company: this.extractCompany(rawRow),
      title: this.extractTitle(rawRow),
      email: this.extractEmail(rawRow),
      phone: this.extractPhone(rawRow),
      website: this.extractWebsite(rawRow),
      city: this.extractField(rawRow, ['city', 'City', 'CITY']),
      state: this.extractField(rawRow, ['state', 'State', 'STATE', 'province']),
      country: this.extractField(rawRow, ['country', 'Country', 'COUNTRY'])
    };

    return normalized;
  }

  extractFirstName(row) {
    return this.extractField(row, ['first_name', 'firstName', 'First Name', 'first', 'fname', 'given_name']);
  }

  extractLastName(row) {
    return this.extractField(row, ['last_name', 'lastName', 'Last Name', 'last', 'lname', 'surname', 'family_name']);
  }

  extractCompany(row) {
    return this.extractField(row, ['company', 'Company', 'COMPANY', 'organization', 'Organization', 'org', 'employer']);
  }

  extractTitle(row) {
    return this.extractField(row, ['title', 'Title', 'TITLE', 'job_title', 'Job Title', 'position', 'role']);
  }

  extractEmail(row) {
    return this.extractField(row, ['email', 'Email', 'EMAIL', 'e-mail', 'email_address']);
  }

  extractPhone(row) {
    const phone = this.extractField(row, ['phone', 'Phone', 'PHONE', 'telephone', 'mobile', 'cell']);
    return phone ? phone.replace(/\D/g, '') : null;
  }

  extractWebsite(row) {
    let website = this.extractField(row, ['website', 'Website', 'WEBSITE', 'url', 'URL', 'domain']);
    if (website && !website.startsWith('http')) {
      website = 'https://' + website;
    }
    return website;
  }

  extractField(row, possibleKeys) {
    for (const key of possibleKeys) {
      if (row[key] && row[key].trim()) {
        return row[key].trim();
      }
    }
    return null;
  }

  /**
   * Initialize sequence for lead based on template set
   */
  async initializeSequenceForLead(leadId, templateSet) {
    try {
      const sequenceEngine = require('./sequenceEngine');
      
      // Map template set to sequence type
      const sequenceTypeMap = {
        'set_one_student': 'set_one_student',
        'set_two_referral': 'set_two_referral',
        'set_three_b2b': 'set_three_b2b'
      };

      const sequenceType = sequenceTypeMap[templateSet] || 'set_three_b2b';
      
      await sequenceEngine.initializeSequence(leadId, sequenceType);
      logger.info(`Sequence ${sequenceType} initialized for lead ${leadId}`);
    } catch (error) {
      logger.error(`Error initializing sequence for lead ${leadId}:`, error);
    }
  }

  /**
   * Log ingest audit event
   */
  async logIngestAudit(ingestId, action, payload) {
    try {
      await db.query(
        'INSERT INTO drive_ingest_audit (ingest_id, action, payload) VALUES ($1, $2, $3)',
        [ingestId, action, JSON.stringify(payload)]
      );
    } catch (error) {
      logger.error('Error logging ingest audit:', error);
    }
  }
}

module.exports = new DriveIngest();
