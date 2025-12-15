/**
 * ONE-TIME SETUP: Creates all necessary custom HubSpot properties via API.
 * This is run manually once to set up the database structure.
 */
function createHubSpotProperties() {
  const config = getConfig();
  
  const propertiesToCreate = [
    // Contact Properties - AnyMail & Enrichment
    { objectType: 'contacts', name: 'anymail_source_type', label: 'AnyMail Source Type', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'last_contact_sent_date', label: 'Last Contact Sent Date', type: 'datetime', fieldType: 'date', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_emails_sent', label: 'Automation Emails Sent', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'send_email_ready', label: 'Send Email Ready', type: 'bool', fieldType: 'booleancheckbox', groupName: 'contactinformation', options: [{ label: 'True', value: 'true', displayOrder: 0 }, { label: 'False', value: 'false', displayOrder: 1 }] },
    
    // Contact Properties - Sequence Management (CRITICAL for 24-hour timing)
    { objectType: 'contacts', name: 'automation_next_email_step', label: 'Automation Next Email Step', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_next_send_timestamp', label: 'Automation Next Send Timestamp', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_template_set', label: 'Automation Template Set', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_lead_type', label: 'Automation Lead Type', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    
    // Contact Properties - Source Tracking
    { objectType: 'contacts', name: 'automation_source', label: 'Automation Source', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_source_file_id', label: 'Automation Source File ID', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_ingested_at', label: 'Automation Ingested At', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'automation_anymail_enriched', label: 'Automation AnyMail Enriched', type: 'bool', fieldType: 'booleancheckbox', groupName: 'contactinformation', options: [{ label: 'Enriched', value: 'true', displayOrder: 0 }, { label: 'Not Enriched', value: 'false', displayOrder: 1 }] },
    { objectType: 'contacts', name: 'automation_last_email_sent', label: 'Automation Last Email Sent', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    
    // Contact Properties - Segmented Data fields (up to 5)
    { objectType: 'contacts', name: 'original_sheet_data_segment_1', label: 'Segment Data 1 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'original_sheet_data_segment_2', label: 'Segment Data 2 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'original_sheet_data_segment_3', label: 'Segment Data 3 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'original_sheet_data_segment_4', label: 'Segment Data 4 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'original_sheet_data_segment_5', label: 'Segment Data 5 (Source Sheet)', type: 'string', fieldType: 'text', groupName: 'contactinformation' },
    
    // Company Properties
    { objectType: 'companies', name: 'original_sheet_url', label: 'Original Sheet URL', type: 'string', fieldType: 'text', groupName: 'companyinformation' },
    { objectType: 'companies', name: 'email_finder_status', label: 'Email Finder Status', type: 'string', fieldType: 'text', groupName: 'companyinformation' },
    
    // Tracking Properties (GA4 & Email Tracking)
    { objectType: 'contacts', name: 'total_emails_opened', label: 'Total Emails Opened', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'total_clicks', label: 'Total Clicks', type: 'number', fieldType: 'number', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'sequence_replied', label: 'Sequence Replied', type: 'bool', fieldType: 'booleancheckbox', groupName: 'contactinformation', options: [{ label: 'Replied', value: 'true', displayOrder: 0 }, { label: 'No Reply', value: 'false', displayOrder: 1 }] },
    { objectType: 'contacts', name: 'last_email_opened_at', label: 'Last Email Opened At', type: 'datetime', fieldType: 'date', groupName: 'contactinformation' },
    { objectType: 'contacts', name: 'last_link_clicked_at', label: 'Last Link Clicked At', type: 'datetime', fieldType: 'date', groupName: 'contactinformation' }
  ];

  Logger.log('Starting HubSpot Property Creation...');

  propertiesToCreate.forEach(prop => {
    const url = `${config.HUBSPOT_API_BASE}/crm/v3/properties/${prop.objectType}`;
    const payload = {
      name: prop.name,
      label: prop.label,
      type: prop.type,
      fieldType: prop.fieldType,
      groupName: prop.groupName
    };
    
    // Add options array for boolean properties (required by HubSpot API)
    if (prop.options) {
      payload.options = prop.options;
    }
    
    try {
      hubspotApiRequest(url, 'post', payload);
      Logger.log(`✅ Created/Updated property: ${prop.name} on ${prop.objectType}`);
    } catch (e) {
      // Error code 409 means the property already exists, which is acceptable for setup.
      if (!e.toString().includes('409')) {
        Logger.log(`❌ Failed to create property ${prop.name}: ${e.toString()}`);
      } else {
        Logger.log(`⚠️ Property ${prop.name} already exists. Skipping.`);
      }
    }
  });
  
  Logger.log('✅ HubSpot Property Creation complete.');
}

/**
 * Helper function to make HubSpot API requests
 */
function hubspotApiRequest(url, method, payload) {
  const config = getConfig();
  const options = {
    method: method,
    headers: {
      'Authorization': `Bearer ${config.HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (payload) {
    options.payload = JSON.stringify(payload);
  }
  
  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  
  if (responseCode >= 200 && responseCode < 300) {
    return JSON.parse(response.getContentText());
  } else {
    throw new Error(`HubSpot API error: ${responseCode} - ${response.getContentText()}`);
  }
}

/**
 * Wrapper function to make createHubSpotProperties easier to find and run
 * This function appears in the Apps Script function dropdown
 */
function runHubSpotSetup() {
  Logger.log('🚀 Running HubSpot Setup...');
  Logger.log('📝 This will create all required HubSpot properties');
  createHubSpotProperties();
  Logger.log('✅ HubSpot Setup complete!');
}

/**
 * Get configuration (shared with Code.gs)
 */
function getConfig() {
  return {
    HUBSPOT_ACCESS_TOKEN: PropertiesService.getScriptProperties().getProperty('HUBSPOT_TOKEN') || 'pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39',
    HUBSPOT_API_BASE: 'https://api.hubapi.com'
  };
}


