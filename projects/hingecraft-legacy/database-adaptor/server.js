const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hingecraft_db',
  user: process.env.DB_USER || 'hingecraft_user',
  password: process.env.DB_PASSWORD || 'hingecraft_secure_password_123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(cors());
app.use(express.json());

// Secret key for authentication
const SECRET_KEY = process.env.SECRET_KEY || process.env.API_KEY || 'hingecraft_secret_key_change_in_production';

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];
  
  const providedKey = authHeader?.replace('Bearer ', '') || apiKey;
  
  if (!providedKey || providedKey !== SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Invalid secret key.' });
  }
  
  next();
};

// Apply authentication to ALL routes including health check (API is private)
app.use(authenticate);

// Health check endpoint (now requires authentication - API is private)
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// GET /donations/latest - Get latest donation (with Wix required fields)
app.get('/donations/latest', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        "_id" as _id,
        "_createdDate" as _createdDate,
        "_updatedDate" as _updatedDate,
        "_owner" as _owner,
        id, amount, currency, is_other_amount, 
        source, payment_status, payment_method, transaction_id,
        member_email, member_name, created_at, updated_at, metadata
      FROM donations 
      ORDER BY "_createdDate" DESC 
      LIMIT 1`
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No donations found' });
    }
    
    // Map to Wix format
    // IMPORTANT: pg driver LOWERCASES column names, so "_createdDate" becomes "_createddate"
    const donation = result.rows[0];
    
    // Wix REQUIRED fields - pg driver lowercases quoted identifiers
    // Access using lowercase keys that pg driver returns
    const wixId = donation._id || donation.id;
    const wixCreatedDate = donation._createddate || donation._createdDate || donation.created_at;
    const wixUpdatedDate = donation._updateddate || donation._updatedDate || donation.updated_at;
    const wixOwner = donation._owner || 'system';
    
    // Build response with Wix fields FIRST (required by Wix)
    // These fields MUST be present for Wix to recognize read-write access
    const response = {
      _id: wixId,
      _createdDate: wixCreatedDate,
      _updatedDate: wixUpdatedDate,
      _owner: wixOwner,
      // Additional fields
      id: donation.id || wixId,
      amount: donation.amount,
      currency: donation.currency,
      is_other_amount: donation.is_other_amount,
      source: donation.source,
      payment_status: donation.payment_status,
      payment_method: donation.payment_method,
      transaction_id: donation.transaction_id,
      member_email: donation.member_email,
      member_name: donation.member_name,
      created_at: donation.created_at || wixCreatedDate,
      updated_at: donation.updated_at || wixUpdatedDate,
      metadata: donation.metadata
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching latest donation:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// POST /donations - Create new donation (with Wix required fields)
app.post('/donations', async (req, res) => {
  try {
    const {
      _id,  // Wix field
      _owner = 'system',  // Wix field
      amount,
      currency = 'USD',
      is_other_amount = false,
      source = 'payment_page',
      payment_status = 'completed',
      payment_method,
      transaction_id,
      member_email,
      member_name,
      metadata
    } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be greater than 0' });
    }
    
    // Generate IDs if not provided
    const donationId = _id || uuidv4();
    const now = new Date();
    
    const result = await pool.query(
      `INSERT INTO donations (
        "_id", "_createdDate", "_updatedDate", "_owner",
        id, amount, currency, is_other_amount, source, payment_status,
        payment_method, transaction_id, member_email, member_name, 
        created_at, updated_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING "_id", "_createdDate", "_updatedDate", "_owner", id, amount, currency, is_other_amount, 
        source, payment_status, payment_method, transaction_id, member_email, member_name, 
        created_at, updated_at, metadata`,
      [
        donationId, now, now, _owner,  // Wix fields
        donationId, amount, currency, is_other_amount, source, payment_status,  // Custom fields
        payment_method, transaction_id, member_email, member_name,  // More custom fields
        now, now, metadata ? JSON.stringify(metadata) : null  // Timestamps and metadata
      ]
    );
    
    // Map to Wix format - pg driver lowercases column names
    const donation = result.rows[0];
    const response = {
      _id: donation._id || donation.id,
      _createdDate: donation._createddate || donation._createdDate || donation.created_at,
      _updatedDate: donation._updateddate || donation._updatedDate || donation.updated_at,
      _owner: donation._owner || 'system',
      id: donation.id || donation._id,
      amount: donation.amount,
      currency: donation.currency,
      is_other_amount: donation.is_other_amount,
      source: donation.source,
      payment_status: donation.payment_status,
      payment_method: donation.payment_method,
      transaction_id: donation.transaction_id,
      member_email: donation.member_email,
      member_name: donation.member_name,
      created_at: donation.created_at || donation._createddate || donation._createdDate,
      updated_at: donation.updated_at || donation._updateddate || donation._updatedDate,
      metadata: donation.metadata
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating donation:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Transaction ID already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// GET /donations - Get all donations with optional limit (Wix format)
app.get('/donations', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM donations');
    const total = parseInt(countResult.rows[0].count);
    
    // Get donations with Wix required fields
    const result = await pool.query(
      `SELECT 
        "_id", "_createdDate", "_updatedDate", "_owner",
        id, amount, currency, is_other_amount, 
        source, payment_status, payment_method, transaction_id,
        member_email, member_name, created_at, updated_at, metadata
      FROM donations 
      ORDER BY "_createdDate" DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    // Map to Wix format - pg driver lowercases column names
    const donations = result.rows.map(donation => ({
      _id: donation._id || donation.id,
      _createdDate: donation._createddate || donation._createdDate || donation.created_at,
      _updatedDate: donation._updateddate || donation._updatedDate || donation.updated_at,
      _owner: donation._owner || 'system',
      id: donation.id || donation._id,
      amount: donation.amount,
      currency: donation.currency,
      is_other_amount: donation.is_other_amount,
      source: donation.source,
      payment_status: donation.payment_status,
      payment_method: donation.payment_method,
      transaction_id: donation.transaction_id,
      member_email: donation.member_email,
      member_name: donation.member_name,
      created_at: donation.created_at || donation._createddate || donation._createdDate,
      updated_at: donation.updated_at || donation._updateddate || donation._updatedDate,
      metadata: donation.metadata
    }));
    
    // Wix expects items array format OR direct array
    // Try items format first (Wix SPI standard)
    res.json({
      items: donations,
      totalCount: total,
      hasNext: (offset + limit) < total,
      hasPrev: offset > 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// GET /donations/:id - Get donation by ID (Wix format)
app.get('/donations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try both _id and id fields
    const result = await pool.query(
      `SELECT 
        "_id", "_createdDate", "_updatedDate", "_owner",
        id, amount, currency, is_other_amount, 
        source, payment_status, payment_method, transaction_id,
        member_email, member_name, created_at, updated_at, metadata
      FROM donations 
      WHERE "_id" = $1 OR id = $1 
      LIMIT 1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    // Map to Wix format - pg driver lowercases column names
    const donation = result.rows[0];
    res.json({
      _id: donation._id || donation.id,
      _createdDate: donation._createddate || donation._createdDate || donation.created_at,
      _updatedDate: donation._updateddate || donation._updatedDate || donation.updated_at,
      _owner: donation._owner || 'system',
      id: donation.id || donation._id,
      amount: donation.amount,
      currency: donation.currency,
      is_other_amount: donation.is_other_amount,
      source: donation.source,
      payment_status: donation.payment_status,
      payment_method: donation.payment_method,
      transaction_id: donation.transaction_id,
      member_email: donation.member_email,
      member_name: donation.member_name,
      created_at: donation.created_at || donation._createddate || donation._createdDate,
      updated_at: donation.updated_at || donation._updateddate || donation._updatedDate,
      metadata: donation.metadata
    });
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// PATCH /donations/:id - Update donation (Wix format)
app.patch('/donations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const allowedFields = [
      'payment_status', 'payment_method', 'transaction_id', 
      'member_email', 'member_name', 'metadata',
      '_owner'  // Allow updating Wix _owner field
    ];
    
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if (field === '_owner') {
          updateFields.push(`"_owner" = $${paramCount}`);
        } else {
          updateFields.push(`${field} = $${paramCount}`);
        }
        values.push(field === 'metadata' ? JSON.stringify(updates[field]) : updates[field]);
        paramCount++;
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    // Always update _updatedDate and updated_at
    updateFields.push(`"_updatedDate" = $${paramCount}`);
    values.push(new Date());
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    paramCount++;
    
    values.push(id);
    
    const query = `
      UPDATE donations 
      SET ${updateFields.join(', ')} 
      WHERE "_id" = $${paramCount} OR id = $${paramCount}
      RETURNING "_id", "_createdDate", "_updatedDate", "_owner", id, amount, currency, is_other_amount, 
        source, payment_status, payment_method, transaction_id, member_email, member_name, 
        created_at, updated_at, metadata
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    // Map to Wix format - pg driver lowercases column names
    const donation = result.rows[0];
    const response = {
      _id: donation._id || donation.id,
      _createdDate: donation._createddate || donation._createdDate || donation.created_at,
      _updatedDate: donation._updateddate || donation._updatedDate || donation.updated_at,
      _owner: donation._owner || 'system',
      id: donation.id || donation._id,
      amount: donation.amount,
      currency: donation.currency,
      is_other_amount: donation.is_other_amount,
      source: donation.source,
      payment_status: donation.payment_status,
      payment_method: donation.payment_method,
      transaction_id: donation.transaction_id,
      member_email: donation.member_email,
      member_name: donation.member_name,
      created_at: donation.created_at || donation._createddate || donation._createdDate,
      updated_at: donation.updated_at || donation._updateddate || donation._updatedDate,
      metadata: donation.metadata
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating donation:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// GET /export/json - Export entire database as JSON (for download/share)
app.get('/export/json', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM donations ORDER BY created_at DESC');
    
    const exportData = {
      timestamp: new Date().toISOString(),
      total_donations: result.rows.length,
      donations: result.rows
    };
    
    res.json({
      ok: true,
      data: exportData
    });
  } catch (error) {
    console.error('Error exporting database:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// ============================================
// WIX SPI COLLECTION ENDPOINTS
// ============================================
// Wix may call these endpoints when using external database collections
// These endpoints follow Wix SPI (Service Plugin Interface) format

// GET /v1/collections/donations/items - Wix SPI format for collection items
app.get('/v1/collections/donations/items', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM donations');
    const total = parseInt(countResult.rows[0].count);
    
    // Get donations with Wix required fields
    const result = await pool.query(
      `SELECT 
        "_id", "_createdDate", "_updatedDate", "_owner",
        id, amount, currency, is_other_amount, 
        source, payment_status, payment_method, transaction_id,
        member_email, member_name, created_at, updated_at, metadata
      FROM donations 
      ORDER BY "_createdDate" DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    // Map to Wix format
    const donations = result.rows.map(donation => ({
      _id: donation._id || donation.id,
      _createdDate: donation._createddate || donation._createdDate || donation.created_at,
      _updatedDate: donation._updateddate || donation._updatedDate || donation.updated_at,
      _owner: donation._owner || 'system',
      id: donation.id || donation._id,
      amount: donation.amount,
      currency: donation.currency,
      is_other_amount: donation.is_other_amount,
      source: donation.source,
      payment_status: donation.payment_status,
      payment_method: donation.payment_method,
      transaction_id: donation.transaction_id,
      member_email: donation.member_email,
      member_name: donation.member_name,
      created_at: donation.created_at || donation._createddate || donation._createdDate,
      updated_at: donation.updated_at || donation._updateddate || donation._updatedDate,
      metadata: donation.metadata
    }));
    
    // Wix SPI standard format
    res.json({
      items: donations,
      totalCount: total,
      hasNext: (offset + limit) < total,
      hasPrev: offset > 0
    });
  } catch (error) {
    console.error('Error fetching donations (SPI):', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// GET /v1/collections/donations/schema - Wix SPI schema endpoint
// This endpoint MUST return the exact Wix SPI format for external database collections
app.get('/v1/collections/donations/schema', authenticate, async (req, res) => {
  try {
    // Wix SPI standard schema format - CRITICAL for read-write access
    const schema = {
      collection: {
        id: 'donations',
        fields: {
          // Wix REQUIRED fields for read-write access - MUST be present
          _id: { 
            type: 'text', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          _createdDate: { 
            type: 'datetime', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: false  // Auto-set by database
            } 
          },
          _updatedDate: { 
            type: 'datetime', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: false  // Auto-updated by database
            } 
          },
          _owner: { 
            type: 'text', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          // Custom fields
          id: { 
            type: 'text', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          amount: { 
            type: 'number', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          currency: { 
            type: 'text', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          is_other_amount: { 
            type: 'boolean', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          source: { 
            type: 'text', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          payment_status: { 
            type: 'text', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          payment_method: { 
            type: 'text', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          transaction_id: { 
            type: 'text', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          member_email: { 
            type: 'text', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          member_name: { 
            type: 'text', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          created_at: { 
            type: 'datetime', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          updated_at: { 
            type: 'datetime', 
            capabilities: { 
              sortable: true, 
              queryable: true, 
              settable: true 
            } 
          },
          metadata: { 
            type: 'object', 
            capabilities: { 
              queryable: true, 
              settable: true 
            } 
          }
        },
        capabilities: {
          query: { 
            supportedOperators: [
              'eq', 'ne', 'gt', 'ge', 'lt', 'le', 
              'hasSome', 'hasAll', 'contains', 
              'startsWith', 'endsWith', 'between', 
              'isEmpty', 'isNotEmpty'
            ] 
          },
          count: true,
          insert: true,
          update: true,
          remove: true,
          get: true,
          find: true
        }
      }
    };
    
    console.log('✅ Schema endpoint called - returning Wix SPI format');
    res.json(schema);
  } catch (error) {
    console.error('❌ Error fetching schema:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// ============================================
// MEMBERS COLLECTION (Wix SPI)
// ============================================

// GET /v1/collections/members/items - Wix SPI format for members registry
app.get('/v1/collections/members/items', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const countResult = await pool.query('SELECT COUNT(*) FROM members');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT 
        "_id", "_createdDate", "_updatedDate", "_owner",
        first_name, last_name, twin_name, membership_id,
        city, region, country, registry_date, source_file,
        created_at, updated_at, metadata
      FROM members 
      ORDER BY "_createdDate" DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const members = result.rows.map(m => ({
      _id: m._id || m.membership_id,
      _createdDate: m._createddate || m._createdDate || m.created_at,
      _updatedDate: m._updateddate || m._updatedDate || m.updated_at,
      _owner: m._owner || 'system',
      first_name: m.first_name,
      last_name: m.last_name,
      twin_name: m.twin_name,
      membership_id: m.membership_id || m._id,
      city: m.city,
      region: m.region,
      country: m.country,
      registry_date: m.registry_date,
      source_file: m.source_file,
      created_at: m.created_at || m._createddate || m._createdDate,
      updated_at: m.updated_at || m._updateddate || m._updatedDate,
      metadata: m.metadata
    }));

    res.json({
      items: members,
      totalCount: total,
      hasNext: (offset + limit) < total,
      hasPrev: offset > 0
    });
  } catch (error) {
    console.error('Error fetching members (SPI):', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// GET /v1/collections/members/schema - Wix SPI schema endpoint
app.get('/v1/collections/members/schema', authenticate, async (req, res) => {
  try {
    const schema = {
      collection: {
        id: 'members',
        fields: {
          _id: {
            type: 'text',
            capabilities: { sortable: true, queryable: true, settable: true }
          },
          _createdDate: {
            type: 'datetime',
            capabilities: { sortable: true, queryable: true, settable: false }
          },
          _updatedDate: {
            type: 'datetime',
            capabilities: { sortable: true, queryable: true, settable: false }
          },
          _owner: {
            type: 'text',
            capabilities: { sortable: true, queryable: true, settable: true }
          },
          first_name: {
            type: 'text',
            capabilities: { sortable: true, queryable: true, settable: true }
          },
          last_name: {
            type: 'text',
            capabilities: { sortable: true, queryable: true, settable: true }
          },
          twin_name: {
            type: 'text',
            capabilities: { sortable: true, queryable: true, settable: true }
          },
          membership_id: {
            type: 'text',
            capabilities: { sortable: true, queryable: true, settable: true }
          },
          city: {
            type: 'text',
            capabilities: { sortable: true, queryable: true, settable: true }
          },
          region: {
            type: 'text',
            capabilities: { sortable: true, queryable: true, settable: true }
          },
          country: {
            type: 'text',
            capabilities: { sortable: true, queryable: true, settable: true }
          },
          registry_date: {
            type: 'text',
            capabilities: { sortable: true, queryable: true, settable: true }
          },
          source_file: {
            type: 'text',
            capabilities: { sortable: true, queryable: true, settable: true }
          },
          created_at: {
            type: 'datetime',
            capabilities: { sortable: true, queryable: true, settable: true }
          },
          updated_at: {
            type: 'datetime',
            capabilities: { sortable: true, queryable: true, settable: true }
          },
          metadata: {
            type: 'object',
            capabilities: { queryable: true, settable: true }
          }
        },
        capabilities: {
          query: {
            supportedOperators: [
              'eq', 'ne', 'gt', 'ge', 'lt', 'le',
              'hasSome', 'hasAll', 'contains',
              'startsWith', 'endsWith', 'between',
              'isEmpty', 'isNotEmpty'
            ]
          },
          count: true,
          insert: true,
          update: true,
          remove: true,
          get: true,
          find: true
        }
      }
    };

    console.log('✅ Members schema endpoint called - returning Wix SPI format');
    res.json(schema);
  } catch (error) {
    console.error('❌ Error fetching members schema:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// ============================================
// CHAT CLUBS COLLECTION (Wix SPI)
// ============================================

// GET /v1/collections/chat_clubs/items - Wix SPI format for chat clubs
app.get('/v1/collections/chat_clubs/items', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const countResult = await pool.query('SELECT COUNT(*) FROM chat_clubs');
    const total = parseInt(countResult.rows[0].count);
    
    const result = await pool.query(
      `SELECT 
        "_id", "_createdDate", "_updatedDate", "_owner",
        club_name, category, member_count, status, description, source, metadata
      FROM chat_clubs 
      ORDER BY "_createdDate" DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const clubs = result.rows.map(club => ({
      _id: club._id,
      _createdDate: club._createddate || club._createdDate,
      _updatedDate: club._updateddate || club._updatedDate,
      _owner: club._owner || 'system',
      club_name: club.club_name,
      category: club.category,
      member_count: club.member_count,
      status: club.status,
      description: club.description,
      source: club.source,
      metadata: club.metadata
    }));
    
    res.json({
      items: clubs,
      totalCount: total,
      hasNext: (offset + limit) < total,
      hasPrev: offset > 0
    });
  } catch (error) {
    console.error('Error fetching chat clubs (SPI):', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// GET /v1/collections/chat_clubs/schema - Wix SPI schema endpoint
app.get('/v1/collections/chat_clubs/schema', authenticate, async (req, res) => {
  try {
    const schema = {
      collection: {
        id: 'chat_clubs',
        fields: {
          _id: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          _createdDate: { type: 'datetime', capabilities: { sortable: true, queryable: true, settable: false } },
          _updatedDate: { type: 'datetime', capabilities: { sortable: true, queryable: true, settable: false } },
          _owner: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          club_name: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          category: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          member_count: { type: 'number', capabilities: { sortable: true, queryable: true, settable: true } },
          status: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          description: { type: 'text', capabilities: { queryable: true, settable: true } },
          source: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          metadata: { type: 'object', capabilities: { queryable: true, settable: true } }
        },
        capabilities: {
          query: { supportedOperators: ['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'hasSome', 'hasAll', 'contains', 'startsWith', 'endsWith', 'between', 'isEmpty', 'isNotEmpty'] },
          count: true, insert: true, update: true, remove: true, get: true, find: true
        }
      }
    };
    console.log('✅ Chat Clubs Schema endpoint called - returning Wix SPI format');
    res.json(schema);
  } catch (error) {
    console.error('❌ Error fetching chat clubs schema:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// ============================================
// CHAT MESSAGES COLLECTION (Wix SPI)
// ============================================

// GET /v1/collections/chat_messages/items - Wix SPI format for chat messages
app.get('/v1/collections/chat_messages/items', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const countResult = await pool.query('SELECT COUNT(*) FROM chat_messages');
    const total = parseInt(countResult.rows[0].count);
    
    const result = await pool.query(
      `SELECT 
        "_id", "_createdDate", "_updatedDate", "_owner",
        member_name, twin_name, country, room, message, message_type, source, metadata
      FROM chat_messages 
      ORDER BY "_createdDate" DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const messages = result.rows.map(msg => ({
      _id: msg._id,
      _createdDate: msg._createddate || msg._createdDate,
      _updatedDate: msg._updateddate || msg._updatedDate,
      _owner: msg._owner || 'system',
      member_name: msg.member_name,
      twin_name: msg.twin_name,
      country: msg.country,
      room: msg.room,
      message: msg.message,
      message_type: msg.message_type,
      source: msg.source,
      metadata: msg.metadata
    }));
    
    res.json({
      items: messages,
      totalCount: total,
      hasNext: (offset + limit) < total,
      hasPrev: offset > 0
    });
  } catch (error) {
    console.error('Error fetching chat messages (SPI):', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// GET /v1/collections/chat_messages/schema - Wix SPI schema endpoint
app.get('/v1/collections/chat_messages/schema', authenticate, async (req, res) => {
  try {
    const schema = {
      collection: {
        id: 'chat_messages',
        fields: {
          _id: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          _createdDate: { type: 'datetime', capabilities: { sortable: true, queryable: true, settable: false } },
          _updatedDate: { type: 'datetime', capabilities: { sortable: true, queryable: true, settable: false } },
          _owner: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          member_name: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          twin_name: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          country: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          room: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          message: { type: 'text', capabilities: { queryable: true, settable: true } },
          message_type: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          source: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          metadata: { type: 'object', capabilities: { queryable: true, settable: true } }
        },
        capabilities: {
          query: { supportedOperators: ['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'hasSome', 'hasAll', 'contains', 'startsWith', 'endsWith', 'between', 'isEmpty', 'isNotEmpty'] },
          count: true, insert: true, update: true, remove: true, get: true, find: true
        }
      }
    };
    console.log('✅ Chat Messages Schema endpoint called - returning Wix SPI format');
    res.json(schema);
  } catch (error) {
    console.error('❌ Error fetching chat messages schema:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// ============================================
// AMBASSADORS COLLECTION (Wix SPI)
// ============================================

// GET /v1/collections/ambassadors/items - Wix SPI format for ambassadors
app.get('/v1/collections/ambassadors/items', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const countResult = await pool.query('SELECT COUNT(*) FROM ambassadors');
    const total = parseInt(countResult.rows[0].count);
    
    const result = await pool.query(
      `SELECT 
        "_id", "_createdDate", "_updatedDate", "_owner",
        ambassador_name, email, country, city, campaign_name, program_type, status, impact_metrics, source, metadata
      FROM ambassadors 
      ORDER BY "_createdDate" DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const ambassadors = result.rows.map(amb => ({
      _id: amb._id,
      _createdDate: amb._createddate || amb._createdDate,
      _updatedDate: amb._updateddate || amb._updatedDate,
      _owner: amb._owner || 'system',
      ambassador_name: amb.ambassador_name,
      email: amb.email,
      country: amb.country,
      city: amb.city,
      campaign_name: amb.campaign_name,
      program_type: amb.program_type,
      status: amb.status,
      impact_metrics: amb.impact_metrics,
      source: amb.source,
      metadata: amb.metadata
    }));
    
    res.json({
      items: ambassadors,
      totalCount: total,
      hasNext: (offset + limit) < total,
      hasPrev: offset > 0
    });
  } catch (error) {
    console.error('Error fetching ambassadors (SPI):', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// GET /v1/collections/ambassadors/schema - Wix SPI schema endpoint
app.get('/v1/collections/ambassadors/schema', authenticate, async (req, res) => {
  try {
    const schema = {
      collection: {
        id: 'ambassadors',
        fields: {
          _id: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          _createdDate: { type: 'datetime', capabilities: { sortable: true, queryable: true, settable: false } },
          _updatedDate: { type: 'datetime', capabilities: { sortable: true, queryable: true, settable: false } },
          _owner: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          ambassador_name: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          email: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          country: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          city: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          campaign_name: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          program_type: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          status: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          impact_metrics: { type: 'object', capabilities: { queryable: true, settable: true } },
          source: { type: 'text', capabilities: { sortable: true, queryable: true, settable: true } },
          metadata: { type: 'object', capabilities: { queryable: true, settable: true } }
        },
        capabilities: {
          query: { supportedOperators: ['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'hasSome', 'hasAll', 'contains', 'startsWith', 'endsWith', 'between', 'isEmpty', 'isNotEmpty'] },
          count: true, insert: true, update: true, remove: true, get: true, find: true
        }
      }
    };
    console.log('✅ Ambassadors Schema endpoint called - returning Wix SPI format');
    res.json(schema);
  } catch (error) {
    console.error('❌ Error fetching ambassadors schema:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// POST /webhook - Webhook endpoint for Wix Velo API integration
// Reference: https://www.wix.com/velo/reference/api-overview/introduction
app.post('/webhook', authenticate, async (req, res) => {
  try {
    const { event, data } = req.body;
    
    // Verify webhook secret
    const providedSecret = req.headers['x-webhook-secret'];
    const expectedSecret = process.env.WEBHOOK_SECRET;
    
    if (expectedSecret && providedSecret !== expectedSecret) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }
    
    // Log webhook receipt
    console.log('Webhook received:', {
      event,
      timestamp: new Date().toISOString(),
      source: 'Wix Velo API',
      data: data ? Object.keys(data) : 'no data'
    });
    
    // Process webhook event
    switch (event) {
      case 'donation.created':
        console.log('Webhook: Donation created:', data);
        // Store webhook event in database if needed
        if (data && data.id) {
          await pool.query(
            'UPDATE donations SET metadata = COALESCE(metadata, \'{}\'::jsonb) || $1::jsonb WHERE id = $2',
            [JSON.stringify({ webhook_received: new Date().toISOString(), event: 'donation.created' }), data.id]
          );
        }
        break;
      case 'donation.updated':
        console.log('Webhook: Donation updated:', data);
        if (data && data.id) {
          await pool.query(
            'UPDATE donations SET metadata = COALESCE(metadata, \'{}\'::jsonb) || $1::jsonb WHERE id = $2',
            [JSON.stringify({ webhook_received: new Date().toISOString(), event: 'donation.updated' }), data.id]
          );
        }
        break;
      case 'donation.completed':
        console.log('Webhook: Donation completed:', data);
        if (data && data.id) {
          await pool.query(
            'UPDATE donations SET payment_status = $1, metadata = COALESCE(metadata, \'{}\'::jsonb) || $2::jsonb WHERE id = $3',
            ['completed', JSON.stringify({ webhook_received: new Date().toISOString(), event: 'donation.completed' }), data.id]
          );
        }
        break;
      case 'wix.velo.event':
        // Handle Wix Velo specific events
        console.log('Webhook: Wix Velo event:', data);
        break;
      default:
        console.log('Webhook: Unknown event:', event);
    }
    
    res.json({ 
      ok: true, 
      message: 'Webhook processed', 
      event, 
      timestamp: new Date().toISOString(),
      source: 'HingeCraft Serverless Docker Database Adaptor'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`HingeCraft Database Adaptor API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});


