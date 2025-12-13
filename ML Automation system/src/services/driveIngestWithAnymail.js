/**
 * Enhanced Drive Ingestion with AnyMail Auto-Enrichment
 * Automatically enriches leads from Google Drive with AnyMail data
 */

const driveIngest = require('./driveIngest');
const anymailEnhanced = require('./anymailEnhanced');
const db = require('../utils/database');
const logger = require('../utils/logger');

class DriveIngestWithAnymail {
  /**
   * Process Drive file with automatic AnyMail enrichment
   */
  async processDriveFileWithAnymail(fileId) {
    try {
      logger.info(`Starting Drive ingestion with AnyMail enrichment for file ${fileId}`);

      // Step 1: Process file (download, parse, store rows)
      const ingestResult = await driveIngest.processDriveFile(fileId);
      const ingestId = ingestResult.ingest_id;

      // Step 2: Get all rows that need enrichment
      const rowsResult = await db.query(
        `SELECT * FROM drive_rows WHERE ingest_id = $1 ORDER BY row_number`,
        [ingestId]
      );

      const rows = rowsResult.rows;
      logger.info(`Found ${rows.length} rows to enrich with AnyMail`);

      // Step 3: Batch enrich with AnyMail
      const enrichedRows = await this.enrichRowsWithAnymail(rows);

      // Step 4: Update drive_rows with enriched data
      await this.updateRowsWithEnrichment(enrichedRows);

      // Step 5: Create leads from enriched rows
      await this.createLeadsFromEnrichedRows(ingestId, enrichedRows);

      logger.info(`AnyMail enrichment completed for ${enrichedRows.length} rows`);

      return {
        success: true,
        ingest_id: ingestId,
        rows_enriched: enrichedRows.length,
        rows_total: rows.length
      };
    } catch (error) {
      logger.error(`Error in Drive ingestion with AnyMail:`, error);
      throw error;
    }
  }

  /**
   * Enrich rows with AnyMail data
   */
  async enrichRowsWithAnymail(rows) {
    const enriched = [];
    const batchSize = 50; // AnyMail batch limit

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      try {
        // Extract emails from batch
        const emails = batch
          .map(row => {
            const data = row.parsed_data || {};
            return data.email || data.Email || data.EMAIL;
          })
          .filter(email => email);

        if (emails.length === 0) {
          logger.warn(`Batch ${i} has no emails to enrich`);
          continue;
        }

        // Enrich with AnyMail
        const enrichmentResults = await this.batchEnrichWithAnymail(emails);

        // Map enrichment results back to rows
        for (const row of batch) {
          const rowEmail = (row.parsed_data || {}).email || 
                          (row.parsed_data || {}).Email || 
                          (row.parsed_data || {}).EMAIL;
          
          if (rowEmail && enrichmentResults[rowEmail.toLowerCase()]) {
            enriched.push({
              ...row,
              anymail_data: enrichmentResults[rowEmail.toLowerCase()],
              enriched: true
            });
          } else {
            enriched.push({
              ...row,
              anymail_data: null,
              enriched: false
            });
          }
        }

        logger.info(`Enriched batch ${i / batchSize + 1}: ${enrichmentResults.length} results`);
      } catch (error) {
        logger.error(`Error enriching batch ${i}:`, error);
        // Continue with other batches
        batch.forEach(row => {
          enriched.push({
            ...row,
            anymail_data: null,
            enriched: false
          });
        });
      }
    }

    return enriched;
  }

  /**
   * Batch enrich emails with AnyMail
   */
  async batchEnrichWithAnymail(emails) {
    try {
      // Use AnyMail API to find/enrich emails
      const results = {};
      
      for (const email of emails) {
        try {
          // Call AnyMail find API
          const response = await anymailEnhanced.findEmail({
            domain: email.split('@')[1],
            firstName: null, // Will be filled from row data
            lastName: null
          });

          if (response && response.email) {
            results[email.toLowerCase()] = {
              email: response.email,
              firstName: response.firstName,
              lastName: response.lastName,
              company: response.company,
              title: response.title,
              phone: response.phone,
              website: response.website,
              city: response.city,
              state: response.state,
              country: response.country,
              verified: response.verified || false,
              confidence: response.confidence || 0
            };
          }
        } catch (error) {
          logger.warn(`Failed to enrich ${email}:`, error.message);
          results[email.toLowerCase()] = null;
        }
      }

      return results;
    } catch (error) {
      logger.error('Error in batch AnyMail enrichment:', error);
      return {};
    }
  }

  /**
   * Update drive_rows with AnyMail enrichment data
   */
  async updateRowsWithEnrichment(enrichedRows) {
    for (const row of enrichedRows) {
      try {
        const enrichedData = {
          ...(row.parsed_data || {}),
          ...(row.anymail_data || {})
        };

        await db.query(
          `UPDATE drive_rows 
           SET parsed_data = $1,
               anymail_enriched = $2,
               anymail_data = $3
           WHERE id = $4`,
          [
            enrichedData,
            row.enriched || false,
            row.anymail_data ? JSON.stringify(row.anymail_data) : null,
            row.id
          ]
        );
      } catch (error) {
        logger.error(`Error updating row ${row.id}:`, error);
      }
    }
  }

  /**
   * Create leads from enriched rows
   */
  async createLeadsFromEnrichedRows(ingestId, enrichedRows) {
    const { v4: uuidv4 } = require('uuid');
    const hubspotEnhanced = require('./hubspotEnhanced');

    for (const row of enrichedRows) {
      try {
        const data = row.parsed_data || {};
        const anymailData = row.anymail_data || {};

        // Merge data (AnyMail takes precedence for enrichment fields)
        const leadData = {
          email: anymailData.email || data.email || data.Email || data.EMAIL,
          first_name: anymailData.firstName || data.first_name || data.firstName || data['First Name'],
          last_name: anymailData.lastName || data.last_name || data.lastName || data['Last Name'],
          organization: anymailData.company || data.organization || data.company || data.Company,
          title: anymailData.title || data.title || data.Title,
          phone: anymailData.phone || data.phone || data.Phone,
          website: anymailData.website || data.website || data.Website,
          city: anymailData.city || data.city || data.City,
          state: anymailData.state || data.state || data.State,
          country: anymailData.country || data.country || data.Country,
          source: 'google_drive',
          source_file_id: ingestId,
          drive_row_id: row.id,
          anymail_verified: anymailData.verified || false,
          anymail_confidence: anymailData.confidence || 0
        };

        if (!leadData.email) {
          logger.warn(`Row ${row.id} has no email, skipping lead creation`);
          continue;
        }

        // Create lead
        const leadId = uuidv4();
        await db.query(
          `INSERT INTO leads (
            id, email, first_name, last_name, organization, title,
            phone, website, city, state, country, source, source_file_id,
            drive_row_id, anymail_verified, anymail_confidence, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())`,
          [
            leadId,
            leadData.email,
            leadData.first_name,
            leadData.last_name,
            leadData.organization,
            leadData.title,
            leadData.phone,
            leadData.website,
            leadData.city,
            leadData.state,
            leadData.country,
            leadData.source,
            leadData.source_file_id,
            leadData.drive_row_id,
            leadData.anymail_verified,
            leadData.anymail_confidence
          ]
        );

        // Sync to HubSpot
        try {
          await hubspotEnhanced.upsertContact(leadData);
          logger.info(`Lead ${leadId} created and synced to HubSpot`);
        } catch (hubspotError) {
          logger.error(`Failed to sync lead ${leadId} to HubSpot:`, hubspotError);
        }
      } catch (error) {
        logger.error(`Error creating lead from row ${row.id}:`, error);
      }
    }
  }
}

module.exports = new DriveIngestWithAnymail();
