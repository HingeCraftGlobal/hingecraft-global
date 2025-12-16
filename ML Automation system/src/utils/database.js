/**
 * Database connection and utilities
 */

const { Pool } = require('pg');
const config = require('../../config/api_keys');
const logger = require('./logger');

class Database {
  constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected database error:', err);
    });
  }

  /**
   * Execute query
   */
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      logger.error('Database query error:', { text, error: error.message });
      throw error;
    }
  }

  /**
   * Get client for transactions
   */
  async getClient() {
    return await this.pool.connect();
  }

  /**
   * Compute fingerprint for lead
   */
  async computeFingerprint(email, name, org, domain) {
    const result = await this.query(
      `SELECT compute_fingerprint($1, $2, $3, $4) as fingerprint`,
      [email || '', name || '', org || '', domain || '']
    );
    return result.rows[0].fingerprint;
  }

  /**
   * Find lead by fingerprint
   */
  async findLeadByFingerprint(fingerprint) {
    const result = await this.query(
      'SELECT * FROM leads WHERE fingerprint = $1 LIMIT 1',
      [fingerprint]
    );
    return result.rows[0] || null;
  }

  /**
   * Find lead by email
   */
  async findLeadByEmail(email) {
    const result = await this.query(
      'SELECT * FROM leads WHERE email = $1 LIMIT 1',
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  }

  /**
   * Insert lead
   */
  async insertLead(lead) {
    const fingerprint = await this.computeFingerprint(
      lead.email,
      `${lead.first_name} ${lead.last_name}`,
      lead.organization,
      lead.email?.split('@')[1]
    );

    const result = await this.query(
      `INSERT INTO leads (
        email, first_name, last_name, organization, title, phone, website,
        city, state, country, source, source_file_id, source_row_number,
        gs_id, persona_score, fm_stage, bpsd_tag, preferred_tone,
        fingerprint, raw_meta, tier
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        lead.email?.toLowerCase(),
        lead.first_name,
        lead.last_name,
        lead.organization,
        lead.title,
        lead.phone,
        lead.website,
        lead.city,
        lead.state,
        lead.country,
        lead.source || 'google_drive',
        lead.source_file_id,
        lead.source_row_number,
        lead.gs_id,
        lead.persona_score || 0,
        lead.fm_stage,
        lead.bpsd_tag || [],
        lead.preferred_tone,
        fingerprint,
        lead.raw_meta ? JSON.stringify(lead.raw_meta) : null,
        lead.tier || 1
      ]
    );

    return result.rows[0];
  }

  /**
   * Update lead
   */
  async updateLead(leadId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) return null;

    values.push(leadId);
    const result = await this.query(
      `UPDATE leads SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  /**
   * Insert staging lead
   */
  async insertStagingLead(stagingLead) {
    const result = await this.query(
      `INSERT INTO staging_leads (
        import_id, source, file_id, row_number, raw_row, normalized, fingerprint, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        stagingLead.import_id,
        stagingLead.source || 'google_drive',
        stagingLead.file_id,
        stagingLead.row_number,
        JSON.stringify(stagingLead.raw_row),
        JSON.stringify(stagingLead.normalized),
        stagingLead.fingerprint,
        stagingLead.status || 'pending'
      ]
    );

    return result.rows[0];
  }

  /**
   * Insert email log
   */
  async insertEmailLog(emailLog) {
    const result = await this.query(
      `INSERT INTO email_logs (
        lead_id, sequence_id, step_number, provider, provider_message_id,
        to_email, subject, template_id, status, sent_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        emailLog.lead_id,
        emailLog.sequence_id,
        emailLog.step_number,
        emailLog.provider,
        emailLog.provider_message_id,
        emailLog.to_email,
        emailLog.subject,
        emailLog.template_id,
        emailLog.status || 'queued',
        emailLog.sent_at || new Date(),
        emailLog.metadata ? JSON.stringify(emailLog.metadata) : null
      ]
    );

    return result.rows[0];
  }

  /**
   * Insert audit log
   */
  async insertAuditLog(auditLog) {
    await this.query(
      `INSERT INTO audit_log (actor, action, entity_type, entity_id, payload)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        auditLog.actor || 'system',
        auditLog.action,
        auditLog.entity_type,
        auditLog.entity_id,
        JSON.stringify(auditLog.payload || {})
      ]
    );
  }
}

module.exports = new Database();
