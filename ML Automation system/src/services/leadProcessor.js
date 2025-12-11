/**
 * Lead Processing Service
 * Handles lead extraction, normalization, deduplication, and enrichment
 */

const db = require('../utils/database');
const anymail = require('./anymail');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class LeadProcessor {
  /**
   * Normalize raw lead data from Google Drive file
   */
  normalizeLead(rawRow, metadata = {}) {
    const normalized = {
      email: this.normalizeEmail(rawRow.email || rawRow.Email || rawRow.EMAIL || ''),
      first_name: this.normalizeName(rawRow.first_name || rawRow.firstName || rawRow['First Name'] || rawRow['First Name'] || ''),
      last_name: this.normalizeName(rawRow.last_name || rawRow.lastName || rawRow['Last Name'] || rawRow['Last Name'] || ''),
      organization: this.normalizeText(rawRow.organization || rawRow.org || rawRow.company || rawRow.Organization || rawRow.Company || ''),
      title: this.normalizeText(rawRow.title || rawRow.job_title || rawRow['Job Title'] || rawRow.position || ''),
      phone: this.normalizePhone(rawRow.phone || rawRow.Phone || rawRow.telephone || ''),
      website: this.normalizeUrl(rawRow.website || rawRow.Website || rawRow.url || rawRow.domain || ''),
      city: this.normalizeText(rawRow.city || rawRow.City || ''),
      state: this.normalizeText(rawRow.state || rawRow.State || rawRow.province || ''),
      country: this.normalizeText(rawRow.country || rawRow.Country || ''),
      source: metadata.source || 'google_drive',
      source_file_id: metadata.file_id || '',
      source_row_number: metadata.row_number || 0,
      raw_meta: rawRow
    };

    // Extract domain from email if website is missing
    if (!normalized.website && normalized.email) {
      const domain = normalized.email.split('@')[1];
      if (domain) {
        normalized.website = `https://${domain}`;
      }
    }

    return normalized;
  }

  /**
   * Normalize email address
   */
  normalizeEmail(email) {
    if (!email) return '';
    return email.toLowerCase().trim();
  }

  /**
   * Normalize name
   */
  normalizeName(name) {
    if (!name) return '';
    return name.trim().replace(/\s+/g, ' ');
  }

  /**
   * Normalize text
   */
  normalizeText(text) {
    if (!text) return '';
    return text.trim();
  }

  /**
   * Normalize phone number
   */
  normalizePhone(phone) {
    if (!phone) return '';
    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '');
  }

  /**
   * Normalize URL
   */
  normalizeUrl(url) {
    if (!url) return '';
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }

  /**
   * Process leads from Google Drive file
   */
  async processFileLeads(fileData, fileId, importId) {
    const processedLeads = [];
    const errors = [];

    try {
      for (const row of fileData.rows) {
        try {
          // Normalize lead
          const normalized = this.normalizeLead(row.data, {
            file_id: fileId,
            row_number: row.rowNumber,
            source: 'google_drive'
          });

          // Validate required fields
          const validation = this.validateLead(normalized);
          if (!validation.valid) {
            errors.push({
              row: row.rowNumber,
              errors: validation.errors,
              data: normalized
            });
            continue;
          }

          // Compute fingerprint
          const domain = normalized.email.split('@')[1] || '';
          const fingerprint = await db.computeFingerprint(
            normalized.email,
            `${normalized.first_name} ${normalized.last_name}`,
            normalized.organization,
            domain
          );

          // Check for duplicates
          const existing = await db.findLeadByFingerprint(fingerprint);
          if (existing) {
            logger.info(`Duplicate lead found: ${normalized.email}`);
            // Update existing lead with new data
            await db.updateLead(existing.id, {
              source_file_id: fileId,
              raw_meta: normalized.raw_meta
            });
            processedLeads.push({ ...existing, action: 'updated' });
            continue;
          }

          // Check by email as well
          const existingByEmail = await db.findLeadByEmail(normalized.email);
          if (existingByEmail) {
            logger.info(`Duplicate lead found by email: ${normalized.email}`);
            await db.updateLead(existingByEmail.id, {
              source_file_id: fileId,
              raw_meta: normalized.raw_meta
            });
            processedLeads.push({ ...existingByEmail, action: 'updated' });
            continue;
          }

          // Insert staging lead
          const stagingLead = await db.insertStagingLead({
            import_id: importId,
            source: 'google_drive',
            file_id: fileId,
            row_number: row.rowNumber,
            raw_row: row.data,
            normalized: normalized,
            fingerprint: fingerprint,
            status: 'validated'
          });

          // Enrich lead if email is missing - use Anymail to find email
          if (!normalized.email && normalized.website) {
            logger.info(`Email missing for lead, attempting enrichment via Anymail: ${normalized.website}`);
            await this.enrichLead(normalized);
          }
          
          // Also try to find email if we have organization/name but no email
          if (!normalized.email && (normalized.organization || normalized.first_name || normalized.last_name)) {
            const domain = normalized.website ? normalized.website.replace(/^https?:\/\//, '').split('/')[0] : null;
            if (domain) {
              logger.info(`Attempting to find email via Anymail for: ${normalized.first_name} ${normalized.last_name} at ${domain}`);
              await this.enrichLead(normalized);
            }
          }

          // Insert into leads table
          const lead = await db.insertLead({
            ...normalized,
            fingerprint: fingerprint
          });

          processedLeads.push({ ...lead, action: 'created' });

        } catch (error) {
          logger.error(`Error processing row ${row.rowNumber}:`, error);
          errors.push({
            row: row.rowNumber,
            error: error.message,
            data: row.data
          });
        }
      }

      return {
        success: true,
        processed: processedLeads.length,
        errors: errors.length,
        leads: processedLeads,
        errorDetails: errors
      };

    } catch (error) {
      logger.error('Error processing file leads:', error);
      throw error;
    }
  }

  /**
   * Validate lead data
   */
  validateLead(lead) {
    const errors = [];

    // Email is required
    if (!lead.email || !this.isValidEmail(lead.email)) {
      errors.push('Invalid or missing email address');
    }

    // At least name or organization should be present
    if (!lead.first_name && !lead.last_name && !lead.organization) {
      errors.push('At least name or organization is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Enrich lead with missing email using Anymail
   * Collects emails from lead sheet data using Anymail API
   */
  async enrichLead(lead) {
    try {
      // Extract domain from website if available
      let domain = null;
      if (lead.website) {
        domain = lead.website.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
      }
      
      // If no domain, try to extract from organization name
      if (!domain && lead.organization) {
        // Try common domain patterns
        const orgLower = lead.organization.toLowerCase().replace(/\s+/g, '');
        domain = orgLower + '.com'; // Fallback pattern
      }
      
      if (!domain) {
        logger.warn('No domain available for email enrichment');
        return lead;
      }
      
      logger.info(`Finding email via Anymail for: ${lead.first_name} ${lead.last_name} at ${domain}`);
      
      const emailResult = await anymail.findEmail(
        domain,
        lead.first_name,
        lead.last_name,
        lead.organization
      );

      if (emailResult && emailResult.email) {
        lead.email = emailResult.email.toLowerCase().trim();
        lead.enrichment_data = {
          email_found: true,
          confidence: emailResult.confidence || 0,
          sources: emailResult.sources || [],
          enriched_at: new Date().toISOString(),
          enriched_via: 'anymail'
        };
        logger.info(`Email found via Anymail: ${lead.email} (confidence: ${emailResult.confidence})`);
      } else {
        logger.warn(`No email found via Anymail for ${lead.first_name} ${lead.last_name} at ${domain}`);
        lead.enrichment_data = {
          email_found: false,
          attempted_at: new Date().toISOString(),
          enriched_via: 'anymail'
        };
      }

      return lead;
    } catch (error) {
      logger.error('Error enriching lead via Anymail:', error);
      lead.enrichment_data = {
        email_found: false,
        error: error.message,
        attempted_at: new Date().toISOString()
      };
      return lead;
    }
  }
  
  /**
   * Batch enrich multiple leads using Anymail
   * More efficient for processing multiple leads at once
   */
  async batchEnrichLeads(leads) {
    try {
      const leadsToEnrich = leads.filter(lead => !lead.email && (lead.website || lead.organization));
      
      if (leadsToEnrich.length === 0) {
        return leads;
      }
      
      logger.info(`Batch enriching ${leadsToEnrich.length} leads via Anymail`);
      
      // Prepare contacts for batch find
      const contacts = leadsToEnrich.map(lead => {
        let domain = null;
        if (lead.website) {
          domain = lead.website.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
        } else if (lead.organization) {
          domain = lead.organization.toLowerCase().replace(/\s+/g, '') + '.com';
        }
        
        return {
          domain: domain,
          firstName: lead.first_name,
          lastName: lead.last_name,
          company: lead.organization,
          lead: lead
        };
      });
      
      // Use Anymail batch find
      const results = await anymail.batchFindEmails(contacts);
      
      // Update leads with found emails
      results.forEach((result, index) => {
        if (result && result.email) {
          const lead = leadsToEnrich[index];
          lead.email = result.email.toLowerCase().trim();
          lead.enrichment_data = {
            email_found: true,
            confidence: result.confidence || 0,
            sources: result.sources || [],
            enriched_at: new Date().toISOString(),
            enriched_via: 'anymail_batch'
          };
          logger.info(`Batch enriched: Found email ${lead.email} for ${lead.first_name} ${lead.last_name}`);
        }
      });
      
      return leads;
    } catch (error) {
      logger.error('Error batch enriching leads:', error);
      return leads;
    }
  }

  /**
   * Score lead based on data completeness and quality
   */
  scoreLead(lead) {
    let score = 0;

    // Email present: +30
    if (lead.email) score += 30;

    // Name present: +20
    if (lead.first_name || lead.last_name) score += 20;

    // Organization present: +15
    if (lead.organization) score += 15;

    // Title present: +10
    if (lead.title) score += 10;

    // Website present: +10
    if (lead.website) score += 10;

    // Phone present: +10
    if (lead.phone) score += 10;

    // Location data: +5
    if (lead.city || lead.state || lead.country) score += 5;

    return Math.min(100, score);
  }
}

module.exports = new LeadProcessor();
