/**
 * Get OpenAI API Key from Database
 * Searches various tables for OpenAI API key
 */

const db = require('../src/utils/database');

async function getOpenAIKeyFromDB() {
  console.log('🔍 Searching database for OpenAI API key...\n');

  try {
    // Check audit_log for API keys
    console.log('1. Checking audit_log table...');
    const auditLogs = await db.query(`
      SELECT action, payload, created_at 
      FROM audit_log 
      WHERE payload::text LIKE '%openai%' 
         OR payload::text LIKE '%OpenAI%' 
         OR payload::text LIKE '%sk-%'
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    if (auditLogs.rows.length > 0) {
      console.log(`   Found ${auditLogs.rows.length} potential matches`);
      for (const row of auditLogs.rows) {
        const payload = row.payload;
        if (payload && typeof payload === 'object') {
          const payloadStr = JSON.stringify(payload);
          if (payloadStr.includes('sk-')) {
            // Try to extract key
            const keyMatch = payloadStr.match(/sk-[a-zA-Z0-9]{20,}/);
            if (keyMatch) {
              console.log(`   ✅ Found OpenAI key in audit_log (action: ${row.action})`);
              return keyMatch[0];
            }
          }
        }
      }
    } else {
      console.log('   No matches found');
    }

    // Check leads enrichment_data
    console.log('\n2. Checking leads.enrichment_data...');
    const leads = await db.query(`
      SELECT enrichment_data 
      FROM leads 
      WHERE enrichment_data::text LIKE '%openai%' 
         OR enrichment_data::text LIKE '%sk-%'
      LIMIT 5
    `);

    if (leads.rows.length > 0) {
      for (const row of leads.rows) {
        if (row.enrichment_data) {
          const dataStr = JSON.stringify(row.enrichment_data);
          const keyMatch = dataStr.match(/sk-[a-zA-Z0-9]{20,}/);
          if (keyMatch) {
            console.log('   ✅ Found OpenAI key in leads.enrichment_data');
            return keyMatch[0];
          }
        }
      }
    } else {
      console.log('   No matches found');
    }

    // Check if there's a system_config table (might not be in schema)
    console.log('\n3. Checking for system_config or api_keys table...');
    try {
      const configTables = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND (table_name LIKE '%config%' 
               OR table_name LIKE '%key%' 
               OR table_name LIKE '%setting%'
               OR table_name LIKE '%api%')
        ORDER BY table_name
      `);

      if (configTables.rows.length > 0) {
        console.log(`   Found ${configTables.rows.length} potential config tables:`);
        for (const table of configTables.rows) {
          console.log(`   - ${table.table_name}`);
          
          // Try to query each table
          try {
            const result = await db.query(`SELECT * FROM ${table.table_name} LIMIT 1`);
            if (result.rows.length > 0) {
              const rowStr = JSON.stringify(result.rows[0]);
              const keyMatch = rowStr.match(/sk-[a-zA-Z0-9]{20,}/);
              if (keyMatch) {
                console.log(`   ✅ Found OpenAI key in ${table.table_name}`);
                return keyMatch[0];
              }
            }
          } catch (err) {
            // Table might not have readable structure
          }
        }
      } else {
        console.log('   No config tables found');
      }
    } catch (err) {
      console.log('   Error checking for config tables:', err.message);
    }

    // Check all JSONB columns for the key
    console.log('\n4. Searching all JSONB columns...');
    const jsonbColumns = await db.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND data_type = 'jsonb'
      ORDER BY table_name, column_name
    `);

    if (jsonbColumns.rows.length > 0) {
      console.log(`   Found ${jsonbColumns.rows.length} JSONB columns`);
      for (const col of jsonbColumns.rows) {
        try {
          const result = await db.query(`
            SELECT ${col.column_name} 
            FROM ${col.table_name} 
            WHERE ${col.column_name}::text LIKE '%sk-%'
            LIMIT 1
          `);
          
          if (result.rows.length > 0 && result.rows[0][col.column_name]) {
            const dataStr = JSON.stringify(result.rows[0][col.column_name]);
            const keyMatch = dataStr.match(/sk-[a-zA-Z0-9]{20,}/);
            if (keyMatch) {
              console.log(`   ✅ Found OpenAI key in ${col.table_name}.${col.column_name}`);
              return keyMatch[0];
            }
          }
        } catch (err) {
          // Skip if query fails
        }
      }
    }

    console.log('\n❌ OpenAI API key not found in database');
    return null;

  } catch (error) {
    console.error('❌ Error searching database:', error);
    return null;
  }
}

// Run if executed directly
if (require.main === module) {
  getOpenAIKeyFromDB()
    .then(key => {
      if (key) {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✅ OpenAI API Key Found!');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`Key: ${key.substring(0, 7)}...${key.substring(key.length - 4)}`);
        console.log('\nSaving to file...');
        
        // Save to file
        const fs = require('fs');
        const path = require('path');
        const keyPath = '/Users/chandlerfergusen/Desktop/CURSOR/api_keys/openai.json';
        const keyDir = path.dirname(keyPath);
        
        if (!fs.existsSync(keyDir)) {
          fs.mkdirSync(keyDir, { recursive: true });
        }
        
        fs.writeFileSync(keyPath, JSON.stringify({ apiKey: key }, null, 2));
        console.log(`✅ Saved to: ${keyPath}`);
        console.log('\n🚀 Ready to run GPT verification!');
      } else {
        console.log('\n⚠️  OpenAI API key not found in database.');
        console.log('   Please provide it manually or check another location.');
      }
      process.exit(key ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { getOpenAIKeyFromDB };
