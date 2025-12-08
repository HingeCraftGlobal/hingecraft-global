/**
 * Update Database Adaptor for All New Tables
 * Adds SPI endpoints for all new database tables/components
 */

// List of all tables that need SPI endpoints
const ALL_TABLES = [
    // Existing collections
    'donations',
    'members',
    'chat_clubs',
    'chat_messages',
    'ambassadors',
    
    // New master schema tables
    'users',
    'designs',
    'assets',
    'wallets',
    'transactions',
    'microfactories',
    'content_articles',
    'analytics_events',
    'audit_logs',
    'consents',
    'community_groups',
    'community_events',
    'community_messages',
    'course_enrollments',
    'course_modules',
    'certifications',
    'carbon_offsets',
    'cms_posts',
    'content_comments',
    'content_contributions',
    'content_media',
    'content_revisions'
];

/**
 * Generate SPI endpoint handlers for a table
 */
function generateSPIEndpoints(tableName) {
    return {
        schema: async (req, res) => {
            try {
                // Get table schema from PostgreSQL
                const schema = await getTableSchema(tableName);
                res.json(schema);
            } catch (error) {
                console.error(`Error getting schema for ${tableName}:`, error);
                res.status(500).json({ error: error.message });
            }
        },
        items: async (req, res) => {
            try {
                const { limit = 100, offset = 0, sort = 'created_at', order = 'desc' } = req.query;
                
                // Get items from PostgreSQL
                const items = await getTableItems(tableName, { limit, offset, sort, order });
                res.json({
                    items,
                    total: items.length,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                });
            } catch (error) {
                console.error(`Error getting items for ${tableName}:`, error);
                res.status(500).json({ error: error.message });
            }
        }
    };
}

/**
 * Get table schema from PostgreSQL
 */
async function getTableSchema(tableName) {
    const query = `
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
    `;
    
    const result = await db.query(query, [tableName]);
    
    const fields = result.rows.map(row => ({
        key: row.column_name,
        type: mapPostgresTypeToWixType(row.data_type),
        required: row.is_nullable === 'NO' && !row.column_default,
        maxLength: row.character_maximum_length
    }));
    
    return {
        id: tableName,
        displayName: formatTableName(tableName),
        fields
    };
}

/**
 * Get table items from PostgreSQL
 */
async function getTableItems(tableName, options) {
    const { limit, offset, sort, order } = options;
    
    // Ensure _id and _updatedDate exist (add if needed)
    const query = `
        SELECT 
            COALESCE(_id, id::text, gen_random_uuid()::text) as _id,
            *,
            COALESCE(_updatedDate, updated_at, created_at, NOW()) as _updatedDate,
            COALESCE(_createdDate, created_at, NOW()) as _createdDate
        FROM ${tableName}
        ORDER BY ${sort} ${order}
        LIMIT $1 OFFSET $2;
    `;
    
    const result = await db.query(query, [limit, offset]);
    return result.rows;
}

/**
 * Map PostgreSQL types to Wix types
 */
function mapPostgresTypeToWixType(pgType) {
    const typeMap = {
        'uuid': 'text',
        'text': 'text',
        'varchar': 'text',
        'character varying': 'text',
        'integer': 'number',
        'bigint': 'number',
        'numeric': 'number',
        'decimal': 'number',
        'real': 'number',
        'double precision': 'number',
        'boolean': 'boolean',
        'timestamp': 'datetime',
        'timestamp with time zone': 'datetime',
        'date': 'date',
        'jsonb': 'object',
        'json': 'object',
        'array': 'array'
    };
    
    return typeMap[pgType] || 'text';
}

/**
 * Format table name for display
 */
function formatTableName(tableName) {
    return tableName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Register all SPI endpoints
 */
function registerAllEndpoints(app) {
    ALL_TABLES.forEach(tableName => {
        const endpoints = generateSPIEndpoints(tableName);
        
        // Register schema endpoint
        app.get(`/v1/collections/${tableName}/schema`, endpoints.schema);
        
        // Register items endpoint
        app.get(`/v1/collections/${tableName}/items`, endpoints.items);
        
        console.log(`✅ Registered SPI endpoints for ${tableName}`);
    });
    
    console.log(`✅ Registered SPI endpoints for ${ALL_TABLES.length} tables`);
}

module.exports = {
    registerAllEndpoints,
    generateSPIEndpoints,
    getTableSchema,
    getTableItems,
    ALL_TABLES
};

