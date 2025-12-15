
const CONFIG = {
  // HubSpot Configuration
  HUBSPOT_ACCESS_TOKEN: 'pat-na2-a716f71a-1dfc-4004-9485-3e7df1919c39', // Your Private App Token
  HUBSPOT_PORTAL_ID: '244560986',
  HUBSPOT_API_BASE: 'https://api.hubapi.com',
  
  // AnyMail Configuration
  ANYMAIL_API_KEY: 'pRUtyDRHSPageC2jHGbnWGpD',
  ANYMAIL_API_BASE: 'https://api.anymail.com/v1',
  ANYMAIL_WEBHOOK_URL: 'https://your-domain.com/api/webhooks/anymail', // Your backend webhook
  
  // Google Drive Configuration
  MONITORED_FOLDER_ID: '1MpKKqjpabi10iDh1vWliaiLQsj8wktiz', // Your Drive folder ID
  MONITORED_FOLDER_NAME: 'HubSpot_Leads_Input',
  
  // Gmail Configuration
  GMAIL_FROM_ADDRESS: 'marketingecraft@gmail.com',
  GMAIL_FROM_NAME: 'HingeCraft',
  
  // Email Templates (from database)
  TEMPLATES: {
    'set_one_student': {
      step_1: {
        subject: "You're Invited: Help Build the Future of Creativity + Sustainable Design",
        body: getStudentTemplate1()
      },
      step_2: {
        subject: "You're now part of a growing creative movement — here's what's happening",
        body: getStudentTemplate2()
      },
      step_3: {
        subject: "Follow the journey: See what students are building",
        body: getStudentTemplate3()
      },
      step_4: {
        subject: "Your turn: Join the creative challenge",
        body: getStudentTemplate4()
      },
      step_5: {
        subject: "Keep building: Resources and next steps",
        body: getStudentTemplate5()
      }
    },
    'set_two_referral': {
      step_1: {
        subject: "Partnership Opportunity: Join Our Network",
        body: getReferralTemplate1()
      }
    },
    'set_three_b2b': {
      step_1: {
        subject: "Partnership Opportunity: Let's Build Together",
        body: getB2BTemplate1()
      },
      step_2: {
        subject: "Why HingeCraft? The Value Proposition",
        body: getB2BTemplate2()
      },
      step_3: {
        subject: "Success Stories: What Partners Are Saying",
        body: getB2BTemplate3()
      },
      step_4: {
        subject: "Next Steps: How to Get Started",
        body: getB2BTemplate4()
      },
      step_5: {
        subject: "Final Call: Don't Miss This Opportunity",
        body: getB2BTemplate5()
      }
    }
  }
};

// ============================================
// PHASE 1: TRIGGER AND DATA INGESTION
// ============================================

/**
 * Installable Trigger: onNewFileAdded
 * DEPRECATED: Use checkFolderForNewFiles with time-driven trigger instead
 * This function is kept for backward compatibility but redirects to checkFolderForNewFiles
 */
function onNewFileAdded(e) {
  try {
    Logger.log('⚠️ onNewFileAdded called - redirecting to checkFolderForNewFiles');
    Logger.log('⚠️ RECOMMENDATION: Use time-driven trigger on checkFolderForNewFiles instead');
    
    // Redirect to the main function
    checkFolderForNewFiles();
    
  } catch (error) {
    Logger.log(`Error in onNewFileAdded: ${error.toString()}`);
    sendErrorNotification(error);
  }
}

/**
 * Time-Driven Trigger: checkFolderForNewFiles
 * Runs every 5 minutes to check for new files
 * Backup trigger in case onChange doesn't fire
 */
function checkFolderForNewFiles() {
  try {
    Logger.log('🔍 Checking folder for new files...');
    
    // Get folder ID from Script Properties (preferred) or use CONFIG
    const scriptProperties = PropertiesService.getScriptProperties();
    const folderId = scriptProperties.getProperty('MONITORED_FOLDER_ID') || CONFIG.MONITORED_FOLDER_ID;
    
    if (!folderId) {
      Logger.log('⚠️ MONITORED_FOLDER_ID not configured. Please set it in Script Properties.');
      Logger.log('📝 To fix: Go to Project Settings → Script Properties → Add MONITORED_FOLDER_ID');
      // Still run sequence manager even if folder check fails
      sequenceManager();
      return;
    }
    
    try {
      const folder = DriveApp.getFolderById(folderId);
      const folderName = folder.getName();
      Logger.log(`📁 Accessing folder: ${folderName} (${folderId})`);
      
      // NEW: Bulk Processing Workflow
      // Step 1: Prepare bulk payload from all new files
      Logger.log('📦 Preparing bulk AnyMail payload from all new files...');
      const bulkData = prepareAnyMailBulkPayload();
      
      if (bulkData.payload && bulkData.payload.length > 0) {
        Logger.log(`✅ Prepared ${bulkData.payload.length} unique contacts for bulk enrichment`);
        
        // Step 2: Run bulk AnyMail enrichment
        Logger.log('📧 Running bulk AnyMail enrichment...');
        const enrichedResults = runAnyMailBulkEnrichment(bulkData.payload);
        
        if (enrichedResults && enrichedResults.length > 0) {
          Logger.log(`✅ Enriched ${enrichedResults.length} contacts`);
          
          // Step 3: Process bulk results, segment, and push to HubSpot
          Logger.log('📦 Processing bulk results and pushing to HubSpot...');
          const processResults = processBulkResults(enrichedResults, bulkData.rowData);
          
          Logger.log(`✅ Bulk processing complete: ${processResults.processed} processed, ${processResults.created} created, ${processResults.updated} updated`);
          
          // Mark all processed files
          const processedFileIds = getProcessedFileIds();
          const newFileIds = [...new Set(bulkData.rowData.map(r => r.file_id))];
          newFileIds.forEach(fileId => {
            if (!processedFileIds.includes(fileId)) {
              markFileAsProcessed(fileId);
            }
          });
        } else {
          Logger.log('⚠️ No enriched results from AnyMail bulk API');
        }
      } else {
        Logger.log('✅ No new contacts to process');
      }
      
    } catch (folderError) {
      Logger.log(`❌ Error accessing folder: ${folderError.toString()}`);
      Logger.log(`📝 Folder ID: ${folderId}`);
      Logger.log('💡 Possible issues:');
      Logger.log('   1. Folder ID is incorrect');
      Logger.log('   2. Script does not have permission to access the folder');
      Logger.log('   3. Folder does not exist or was deleted');
      Logger.log('📝 To fix:');
      Logger.log('   1. Get the correct folder ID from the folder URL');
      Logger.log('   2. Share the folder with the script\'s service account');
      Logger.log('   3. Update MONITORED_FOLDER_ID in Script Properties');
      // Continue to sequence manager even if folder access fails
    }
    
    // After processing files, run sequence manager for follow-up emails
    Logger.log('📧 Running sequence manager for follow-up emails...');
    sequenceManager();
    
    // Also scan drafts for outbound tracking
    Logger.log('📧 Scanning drafts for outbound tracking...');
    try {
      scanDraftsForOutbound();
    } catch (draftError) {
      Logger.log(`⚠️ Error scanning drafts: ${draftError.toString()}`);
    }
    
  } catch (error) {
    Logger.log(`❌ Error in checkFolderForNewFiles: ${error.toString()}`);
    Logger.log('📧 Attempting to run sequence manager anyway...');
    try {
      sequenceManager();
      scanDraftsForOutbound();
    } catch (seqError) {
      Logger.log(`❌ Error in sequenceManager: ${seqError.toString()}`);
    }
  }
}

/**
 * Process Drive file: Read, parse, segment, enrich
 */
function processDriveFile(fileId, fileName, mimeType) {
  try {
    Logger.log(`📄 Processing file: ${fileName}`);
    
    // Step 1: Read file content
    const fileData = readDriveFile(fileId, mimeType);
    if (!fileData || fileData.length === 0) {
      Logger.log('No data found in file');
      return;
    }
    
    Logger.log(`Found ${fileData.length} rows`);
    
    // Step 2: Process each row (BATCH PROCESSING FOR THOUSANDS OF LEADS)
    const results = {
      processed: 0,
      enriched: 0,
      synced: 0,
      errors: []
    };
    
    const BATCH_SIZE = 100; // Process in batches to avoid timeout
    const totalRows = fileData.length;
    Logger.log(`Processing ${totalRows} rows in batches of ${BATCH_SIZE}`);
    
    for (let batchStart = 0; batchStart < totalRows; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, totalRows);
      Logger.log(`Processing batch: rows ${batchStart + 1} to ${batchEnd} of ${totalRows}`);
      
      for (let i = batchStart; i < batchEnd; i++) {
        try {
          const row = fileData[i];
          
          // Step 3: Initial segmentation
          const segmented = segmentRowData(row);
          
          // Step 4: Enrichment with AnyMail
          const enriched = enrichWithAnyMail(segmented);
          
          // Step 5: Sync to HubSpot
          const synced = syncToHubSpot(enriched);
          
          // Store file_id for reference
          enriched.file_id = fileId;
          
          if (synced.success) {
            results.processed++;
            if (enriched.email) results.enriched++;
            if (synced.contactId) results.synced++;
          }
          
          // Small delay to avoid rate limits
          if (i % 10 === 0) {
            Utilities.sleep(100); // 100ms delay every 10 rows
          }
          
        } catch (error) {
          Logger.log(`Error processing row ${i}: ${error.toString()}`);
          results.errors.push({ row: i, error: error.toString() });
        }
      }
      
      // Log progress after each batch
      Logger.log(`Batch complete: ${results.processed}/${totalRows} processed`);
      
      // If we're not at the end, add a longer pause between batches
      if (batchEnd < totalRows) {
        Utilities.sleep(1000); // 1 second pause between batches
      }
    }
    
    Logger.log(`✅ Processing complete: ${results.processed} processed, ${results.enriched} enriched, ${results.synced} synced`);
    
    // Step 6: Trigger sequence manager for time-based sequences (B2B/Student)
    // and process referral sequences (individual triggers)
    Logger.log('📧 Triggering sequence management...');
    sequenceManager(); // Handles both time-based and referral sequences
    
  } catch (error) {
    Logger.log(`Error processing file: ${error.toString()}`);
    sendErrorNotification(error);
  }
}

/**
 * Read Drive file (CSV or Google Sheet)
 */
function readDriveFile(fileId, mimeType) {
  try {
    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      // Google Sheet
      const sheet = SpreadsheetApp.openById(fileId).getActiveSheet();
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      
      return data.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
    } else if (mimeType === 'text/csv' || mimeType.includes('csv')) {
      // CSV file
      const file = DriveApp.getFileById(fileId);
      const content = file.getBlob().getDataAsString();
      const lines = content.split('\n');
      const headers = lines[0].split(',');
      
      return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
        });
        return obj;
      });
    }
    
    return [];
  } catch (error) {
    Logger.log(`Error reading file: ${error.toString()}`);
    return [];
  }
}

/**
 * Segment row data - extract Company URL and other fields
 */
function segmentRowData(row) {
  const segmented = {
    // Standard fields
    first_name: row['First Name'] || row['first_name'] || row['First Name'] || '',
    last_name: row['Last Name'] || row['last_name'] || row['Last Name'] || '',
    company: row['Company'] || row['company'] || row['Organization'] || row['organization'] || '',
    title: row['Title'] || row['title'] || row['Job Title'] || row['job_title'] || '',
    phone: row['Phone'] || row['phone'] || '',
    website: row['Website'] || row['website'] || row['Company URL'] || row['company_url'] || '',
    city: row['City'] || row['city'] || '',
    state: row['State'] || row['state'] || '',
    country: row['Country'] || row['country'] || '',
    
    // Segmented data fields (all other columns)
    segmented_data: {}
  };
  
  // Extract all other columns as segmented data
  Object.keys(row).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (!['first name', 'last name', 'company', 'organization', 'title', 'job title', 
          'phone', 'website', 'company url', 'city', 'state', 'country', 'email'].includes(lowerKey)) {
      segmented.segmented_data[key] = row[key];
    }
  });
  
  return segmented;
}

// ============================================
// PHASE 2: ANYMAIL ENRICHMENT
// ============================================

/**
 * Enrich contact with AnyMail API
 */
function enrichWithAnyMail(segmented) {
  try {
    if (!segmented.website) {
      Logger.log('No website URL, skipping AnyMail enrichment');
      return { ...segmented, email: null };
    }
    
    Logger.log(`🔍 Enriching with AnyMail: ${segmented.website}`);
    
    // Extract domain from website
    const domain = extractDomain(segmented.website);
    if (!domain) {
      return { ...segmented, email: null };
    }
    
    // Call AnyMail API with webhook
    const url = `${CONFIG.ANYMAIL_API_BASE}/find`;
    const payload = {
      domain: domain,
      first_name: segmented.first_name,
      last_name: segmented.last_name,
      company: segmented.company
    };
    
    const options = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${CONFIG.ANYMAIL_API_KEY}`,
        'Content-Type': 'application/json',
        'x-webhook-url': CONFIG.ANYMAIL_WEBHOOK_URL // Auto-configured webhook
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.email) {
      Logger.log(`✅ Email found: ${result.email}`);
      return {
        ...segmented,
        email: result.email,
        anymail_source_type: result.verified ? 'verified' : 'guessed',
        anymail_enriched: true
      };
    }
    
    return { ...segmented, email: null, anymail_enriched: false };
    
  } catch (error) {
    Logger.log(`Error enriching with AnyMail: ${error.toString()}`);
    return { ...segmented, email: null, anymail_enriched: false };
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    if (!url) return null;
    if (!url.startsWith('http')) url = 'https://' + url;
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

// ============================================
// PHASE 3: HUBSPOT CRM UPDATE
// ============================================

/**
 * Sync enriched data to HubSpot
 */
function syncToHubSpot(enriched) {
  try {
    if (!enriched.email && !enriched.company) {
      Logger.log('No email or company, skipping HubSpot sync');
      return { success: false };
    }
    
    Logger.log(`📊 Syncing to HubSpot: ${enriched.email || enriched.company}`);
    
    // Step 1: Create/Update Company
    let companyId = null;
    if (enriched.company) {
      companyId = createOrUpdateCompany(enriched);
    }
    
    // Step 2: Create/Update Contact
    const contactId = createOrUpdateContact(enriched, companyId);
    
    if (contactId) {
      Logger.log(`✅ Synced to HubSpot: Contact ${contactId}`);
      return { success: true, contactId: contactId, companyId: companyId };
    }
    
    return { success: false };
    
  } catch (error) {
    Logger.log(`Error syncing to HubSpot: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Create or update HubSpot company
 */
function createOrUpdateCompany(data) {
  try {
    const url = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/companies`;
    
    // Search for existing company
    const searchUrl = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/companies/search`;
    const searchPayload = {
      filterGroups: [{
        filters: [{
          propertyName: 'domain',
          operator: 'EQ',
          value: extractDomain(data.website) || data.company.toLowerCase()
        }]
      }],
      properties: ['domain'],
      limit: 1
    };
    
    const searchOptions = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(searchPayload)
    };
    
    const searchResponse = UrlFetchApp.fetch(searchUrl, searchOptions);
    const searchResult = JSON.parse(searchResponse.getContentText());
    
    const properties = {
      name: data.company,
      domain: extractDomain(data.website) || '',
      original_sheet_url: `https://drive.google.com/file/d/${data.file_id || ''}/view`,
      email_finder_status: data.anymail_enriched ? 'found' : 'pending'
    };
    
    if (searchResult.results && searchResult.results.length > 0) {
      // Update existing company
      const companyId = searchResult.results[0].id;
      const updateUrl = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/companies/${companyId}`;
      const updateOptions = {
        method: 'patch',
        headers: {
          'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({ properties: properties })
      };
      
      UrlFetchApp.fetch(updateUrl, updateOptions);
      return companyId;
    } else {
      // Create new company
      const createOptions = {
        method: 'post',
        headers: {
          'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({ properties: properties })
      };
      
      const createResponse = UrlFetchApp.fetch(url, createOptions);
      const createResult = JSON.parse(createResponse.getContentText());
      return createResult.id;
    }
    
  } catch (error) {
    Logger.log(`Error creating/updating company: ${error.toString()}`);
    return null;
  }
}

/**
 * Create or update HubSpot contact
 */
function createOrUpdateContact(data, companyId) {
  try {
    if (!data.email) {
      Logger.log('No email, cannot create contact');
      return null;
    }
    
    const url = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/contacts`;
    
    // Search for existing contact
    const searchUrl = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`;
    const searchPayload = {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: data.email.toLowerCase()
        }]
      }],
      properties: ['email'],
      limit: 1
    };
    
    const searchOptions = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(searchPayload)
    };
    
    const searchResponse = UrlFetchApp.fetch(searchUrl, searchOptions);
    const searchResult = JSON.parse(searchResponse.getContentText());
    
    // Determine template set and lead type through qualification
    // Enhanced qualification to properly distinguish B2B vs Students
    const qualification = qualifyLeadFromData(data);
    const templateSet = qualification.templateSet;
    const leadType = qualification.leadType;
    const currentTime = new Date().getTime();
    
    Logger.log(`Qualified lead: ${data.email || data.first_name} → ${leadType} (${templateSet})`);
    
    // Build properties
    const properties = {
      email: data.email.toLowerCase(),
      firstname: data.first_name || '',
      lastname: data.last_name || '',
      company: data.company || '',
      jobtitle: data.title || '',
      phone: data.phone || '',
      website: data.website || '',
      city: data.city || '',
      state: data.state || '',
      country: data.country || '',
      
      // Automation properties
      automation_source: 'google_drive',
      automation_source_file_id: data.file_id || '',
      automation_ingested_at: currentTime.toString(),
      anymail_source_type: data.anymail_source_type || '',
      automation_anymail_enriched: data.anymail_enriched ? 'true' : 'false',
      send_email_ready: (data.email && data.anymail_enriched) ? 'true' : 'false',
      
      // Sequence Management Properties (CRITICAL for 24-hour timing)
      automation_template_set: templateSet,
      automation_lead_type: leadType,
      automation_next_email_step: '1', // Start at step 1
      automation_next_send_timestamp: currentTime.toString(), // Send immediately (timestamp < now)
      automation_emails_sent: '0'
    };
    
    // Add segmented data
    if (data.segmented_data) {
      Object.keys(data.segmented_data).forEach((key, index) => {
        const propName = `original_sheet_data_segment_${index + 1}`;
        properties[propName] = data.segmented_data[key] || '';
      });
    }
    
    if (searchResult.results && searchResult.results.length > 0) {
      // Update existing contact
      const contactId = searchResult.results[0].id;
      const updateUrl = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}`;
      const updateOptions = {
        method: 'patch',
        headers: {
          'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({ properties: properties })
      };
      
      UrlFetchApp.fetch(updateUrl, updateOptions);
      
      // Associate with company if provided
      if (companyId) {
        associateContactWithCompany(contactId, companyId);
      }
      
      return contactId;
    } else {
      // Create new contact
      const createOptions = {
        method: 'post',
        headers: {
          'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({ properties: properties })
      };
      
      const createResponse = UrlFetchApp.fetch(url, createOptions);
      const createResult = JSON.parse(createResponse.getContentText());
      const contactId = createResult.id;
      
      // Associate with company if provided
      if (companyId) {
        associateContactWithCompany(contactId, companyId);
      }
      
      return contactId;
    }
    
  } catch (error) {
    Logger.log(`Error creating/updating contact: ${error.toString()}`);
    return null;
  }
}

/**
 * Associate contact with company
 */
function associateContactWithCompany(contactId, companyId) {
  try {
    const url = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}/associations/companies/${companyId}/0`;
    const options = {
      method: 'put',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    UrlFetchApp.fetch(url, options);
  } catch (error) {
    Logger.log(`Error associating contact with company: ${error.toString()}`);
  }
}

// ============================================
// PHASE 4: EMAIL SENDING (Gmail API)
// ============================================

/**
 * Trigger email sending for ready contacts
 * Pulls from HubSpot "Ready to Send" list and sends emails
 */
function triggerEmailSending() {
  try {
    Logger.log('📧 Triggering email sending from HubSpot list...');
    
    // Get contacts from "Ready to Send" list
    const contacts = getContactsFromHubSpotList('Ready to Send');
    
    if (contacts.length === 0) {
      Logger.log('No contacts in "Ready to Send" list');
      return;
    }
    
    Logger.log(`Found ${contacts.length} contacts ready to send`);
    
    // Process each contact
    let sent = 0;
    let failed = 0;
    
    for (const contact of contacts.slice(0, 50)) { // Limit to 50 per run
      try {
        const result = sendPersonalizedEmail(contact);
        if (result.success) {
          sent++;
          // Update HubSpot
          updateContactAfterEmailSend(contact, result);
        } else {
          failed++;
        }
      } catch (error) {
        Logger.log(`Error sending email to ${contact.properties.email}: ${error.toString()}`);
        failed++;
      }
    }
    
    Logger.log(`✅ Email sending complete: ${sent} sent, ${failed} failed`);
    
  } catch (error) {
    Logger.log(`Error in triggerEmailSending: ${error.toString()}`);
  }
}

/**
 * Get contacts from HubSpot list
 */
function getContactsFromHubSpotList(listName) {
  try {
    // First, find the list
    const listsUrl = `${CONFIG.HUBSPOT_API_BASE}/contacts/v1/lists`;
    const listsOptions = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    const listsResponse = UrlFetchApp.fetch(listsUrl, listsOptions);
    const listsResult = JSON.parse(listsResponse.getContentText());
    
    const list = listsResult.lists?.find(l => l.name === listName);
    if (!list) {
      Logger.log(`List "${listName}" not found`);
      return [];
    }
    
    // Get contacts from list
    const contactsUrl = `${CONFIG.HUBSPOT_API_BASE}/contacts/v1/lists/${list.listId}/contacts/all`;
    const contactsOptions = {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    const contactsResponse = UrlFetchApp.fetch(contactsUrl, contactsOptions);
    const contactsResult = JSON.parse(contactsResponse.getContentText());
    
    return contactsResult.contacts || [];
    
  } catch (error) {
    Logger.log(`Error getting contacts from list: ${error.toString()}`);
    return [];
  }
}

/**
 * Send personalized email via Gmail with GA4 tracking
 * Includes tracking pixel for opens and wrapped links for clicks
 */
function sendPersonalizedEmail(contact, config, template) {
  try {
    const email = contact.properties?.email || contact.email;
    if (!email) {
      return { success: false, error: 'No email' };
    }
    
    if (!template) {
      return { success: false, error: 'No template provided' };
    }
    
    const contactId = contact.id || contact.vid;
    const templateSet = contact.properties?.automation_template_set || 'set_three_b2b';
    const currentStep = parseInt(contact.properties?.automation_next_email_step || '1');
    
    // Personalize template
    let personalized = personalizeTemplate(template, contact);
    
    // Add tracking: Wrap all links with tracking URLs
    personalized.body = wrapLinksWithTracking(personalized.body, contactId, templateSet, currentStep);
    
    // Add tracking: Insert tracking pixel for open tracking
    personalized.body = addTrackingPixel(personalized.body, contactId, templateSet, currentStep);
    
    // Send via Gmail
    const emailResult = GmailApp.sendEmail(
      email,
      personalized.subject,
      '',
      {
        htmlBody: personalized.body,
        from: CONFIG.GMAIL_FROM_ADDRESS,
        name: CONFIG.GMAIL_FROM_NAME
      }
    );
    
    Logger.log(`✅ Email sent to ${email} with tracking enabled`);
    Logger.log(`   Contact ID: ${contactId}, Template: ${templateSet}, Step: ${currentStep}`);
    
    return {
      success: true,
      messageId: emailResult.getMessage().getId(),
      contactId: contactId,
      templateSet: templateSet,
      step: currentStep
    };
    
  } catch (error) {
    Logger.log(`Error sending email: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Determine template set based on contact properties
 * Enhanced qualification to properly distinguish B2B vs Students
 */
function determineTemplateSet(contact) {
  const leadType = contact.properties?.automation_lead_type || contact.properties?.lead_type;
  const company = (contact.properties?.company || '').toLowerCase();
  const title = (contact.properties?.jobtitle || '').toLowerCase();
  const email = (contact.properties?.email || '').toLowerCase();
  
  // Student Indicators (High Priority)
  const studentIndicators = [
    'school', 'university', 'college', 'academy', 'education',
    'student', 'teacher', 'professor', 'educator', 'campus'
  ];
  
  const hasStudentIndicator = studentIndicators.some(ind => 
    company.includes(ind) || title.includes(ind) || email.includes('.edu')
  );
  
  if (hasStudentIndicator || leadType === 'Student' || leadType === 'School') {
    Logger.log(`Qualified as Student: ${contact.properties?.email}`);
    return 'set_one_student';
  }
  
  // NGO/Referral Indicators
  const ngoIndicators = [
    'ngo', 'nonprofit', 'non-profit', 'foundation', 'charity',
    'organization', 'association', 'society', 'mission'
  ];
  
  const hasNgoIndicator = ngoIndicators.some(ind => 
    company.includes(ind) || title.includes(ind)
  );
  
  if (hasNgoIndicator || leadType === 'NGO' || leadType === 'Referral') {
    Logger.log(`Qualified as Referral: ${contact.properties?.email}`);
    return 'set_two_referral';
  }
  
  // Default to B2B
  Logger.log(`Qualified as B2B: ${contact.properties?.email}`);
  return 'set_three_b2b';
}

/**
 * Qualify lead from raw data (during ingestion)
 * Enhanced qualification to properly distinguish B2B vs Students
 * Returns full qualification object with template set, lead type, score, and indicators
 */
function qualifyLeadFromData(data) {
  const company = (data.company || '').toLowerCase();
  const title = (data.title || '').toLowerCase();
  const website = (data.website || '').toLowerCase();
  const email = (data.email || '').toLowerCase();
  const segmentData = data.segmented_data || {};
  const segmentValues = Object.values(segmentData).join(' ').toLowerCase();
  
  let leadType = 'B2B';
  let templateSet = 'set_three_b2b';
  let score = 0;
  const indicators = [];
  
  // Student Indicators (High Priority - Check First)
  const studentIndicators = [
    'school', 'university', 'college', 'academy', 'education',
    'student', 'teacher', 'professor', 'educator', 'campus',
    'high school', 'elementary', 'middle school'
  ];
  
  const hasStudentIndicator = studentIndicators.some(ind => 
    company.includes(ind) || 
    title.includes(ind) || 
    website.includes(ind) ||
    segmentValues.includes(ind) ||
    email.includes('.edu')
  );
  
  if (hasStudentIndicator) {
    leadType = 'Student';
    templateSet = 'set_one_student';
    score = email.includes('.edu') ? 90 : 85;
    indicators.push('Student/Education detected');
    if (email.includes('.edu')) {
      indicators.push('Educational email domain (.edu)');
    }
  }
  
  // NGO/Referral Indicators (Check if not Student)
  if (!hasStudentIndicator) {
    const ngoIndicators = [
      'ngo', 'nonprofit', 'non-profit', 'foundation', 'charity',
      'organization', 'association', 'society', 'mission'
    ];
    
    const hasNgoIndicator = ngoIndicators.some(ind => 
      company.includes(ind) || 
      title.includes(ind) || 
      website.includes(ind) ||
      segmentValues.includes(ind)
    );
    
    if (hasNgoIndicator) {
      leadType = 'NGO';
      templateSet = 'set_two_referral';
      score = 80;
      indicators.push('NGO/Nonprofit detected');
    }
  }
  
  // B2B Indicators (Default if not Student or NGO)
  if (!hasStudentIndicator && leadType === 'B2B') {
    const b2bIndicators = [
      'corp', 'corporation', 'inc', 'llc', 'ltd', 'company',
      'business', 'enterprise', 'tech', 'software', 'solutions',
      'global', 'group', 'partners', 'consulting'
    ];
    
    const hasB2bIndicator = b2bIndicators.some(ind => 
      company.includes(ind) || 
      title.includes(ind) || 
      website.includes(ind) ||
      segmentValues.includes(ind)
    );
    
    if (hasB2bIndicator) {
      leadType = 'B2B';
      templateSet = 'set_three_b2b';
      score = 75;
      indicators.push('B2B company detected');
    } else {
      // Default B2B if no clear indicators
      score = 50;
      indicators.push('Default B2B classification');
    }
  }
  
  return {
    leadType: leadType,
    templateSet: templateSet,
    score: score,
    indicators: indicators,
    qualified: true,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get template from CONFIG
 */
function getTemplate(templateSet, step) {
  const templates = CONFIG.TEMPLATES[templateSet];
  if (!templates) return null;
  
  const stepKey = `step_${step}`;
  return templates[stepKey] || templates.step_1 || null;
}

/**
 * Personalize template with contact data
 */
function personalizeTemplate(template, contact) {
  let subject = template.subject || '';
  let body = template.body || '';
  
  const props = contact.properties;
  
  // Replace tokens
  const replacements = {
    '{{first_name}}': props.firstname || '',
    '{{last_name}}': props.lastname || '',
    '{{name}}': `${props.firstname || ''} ${props.lastname || ''}`.trim() || 'there',
    '{{organization}}': props.company || '',
    '{{company}}': props.company || '',
    '{{email}}': props.email || '',
    '{{city}}': props.city || '',
    '{{country}}': props.country || '',
    '{{lead_type}}': props.automation_lead_type || '',
    '{{segment_1}}': props.original_sheet_data_segment_1 || '',
    '{{segment_2}}': props.original_sheet_data_segment_2 || '',
    '{{segment_3}}': props.original_sheet_data_segment_3 || '',
    '{{mission_support_url}}': 'https://hingecraft.global/mission-support',
    '{{student_page_url}}': 'https://hingecraft.global/student',
    '{{build_log_url}}': 'https://hingecraft.global/build-log',
    '{{submit_creation_url}}': 'https://hingecraft.global/submit'
  };
  
  Object.keys(replacements).forEach(token => {
    subject = subject.replace(new RegExp(token, 'g'), replacements[token]);
    body = body.replace(new RegExp(token, 'g'), replacements[token]);
  });
  
  return { subject, body };
}

/**
 * Update HubSpot contact after email send
 * Now uses advanceContactSequence for proper 24-hour timing
 */
function updateContactAfterEmailSend(contact, emailResult) {
  try {
    const contactId = contact.id || contact.vid;
    if (!contactId) {
      Logger.log('No contact ID for update');
      return;
    }
    
    // Get current step
    const currentStep = parseInt(contact.properties?.automation_next_email_step || '1');
    
    // Advance sequence (sets next step and 24-hour timestamp)
    advanceContactSequence(contact, currentStep, CONFIG);
    
    Logger.log(`✅ Updated contact ${contactId} after email send, advanced to step ${currentStep + 1}`);
    
  } catch (error) {
    Logger.log(`Error updating contact after email send: ${error.toString()}`);
  }
}

// ============================================
// EMAIL TEMPLATES (From Database)
// ============================================

/**
 * Student Template 1: Welcome to the Movement
 * From database: set_one_student, step 1
 */
function getStudentTemplate1() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h1 style="color: #4CAF50;">You're Invited: Help Build the Future</h1>
    <p>Hi {{first_name}},</p>
    <p>Our school has been granted access to join the <strong>HingeCraft Movement</strong> — a global community of students exploring creativity, sustainable design, and future innovation together.</p>
    <p><strong>This isn't a class.<br>This isn't an assignment.<br>This is your invitation to be part of something growing right now.</strong></p>
    <h2>What is the Movement?</h2>
    <p>A student-driven community built around:</p>
    <ul>
      <li>Creative expression</li>
      <li>AI-assisted learning</li>
      <li>Recycled-material innovation</li>
      <li>Digital + physical design challenges</li>
      <li>Shared progress and inspiration</li>
    </ul>
    <p>You can follow the journey, contribute your ideas, or simply watch the evolution.<br>There's no pressure — only possibility.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{mission_support_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Begin here: Join the Movement</a>
    </p>
    <p>Let's build something that matters, together.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>`;
}

/**
 * Student Template 2: Here's What You Just Joined
 * From database: set_one_student, step 2
 */
function getStudentTemplate2() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Here's What You Just Joined</h2>
    <p>Hi {{first_name}},</p>
    <p>Now that you're part of the Movement, here's what to expect next:</p>
    <h3>1. The Journey Updates</h3>
    <p>You'll receive updates on:</p>
    <ul>
      <li>New student-designed creations</li>
      <li>AI-generated ideas becoming real prototypes</li>
      <li>Behind-the-scenes progress on Hingecraft's design platform</li>
      <li>How recycled materials are being transformed into premium furniture</li>
    </ul>
    <h3>2. Your School's Community Page</h3>
    <p>Every school has its own page for:</p>
    <ul>
      <li>Student sharing</li>
      <li>Project uploads</li>
      <li>Discussion threads</li>
      <li>Mini challenges</li>
    </ul>
    <h3>3. Monthly Inspiration Drops</h3>
    <p>Each drop includes:</p>
    <ul>
      <li>A theme</li>
      <li>A story</li>
      <li>A design prompt</li>
      <li>A real-world example of creative innovation</li>
    </ul>
    <p>You can join in anytime.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{student_page_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Explore Your Student Page</a>
    </p>
    <p>More updates coming soon — you're early.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
  </div>
</body>
</html>`;
}

/**
 * Student Template 3: Follow the Journey
 * From database: set_one_student, step 3
 */
function getStudentTemplate3() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Follow the Journey</h2>
    <p>Hi {{first_name}},</p>
    <p>Every movement has a story.<br>Here's how you can follow ours:</p>
    <h3>📌 The Hingecraft Build Log</h3>
    <p>Weekly updates showing:</p>
    <ul>
      <li>New prototypes</li>
      <li>Behind-the-scenes lab work</li>
      <li>Sustainability breakthroughs</li>
      <li>Student ideas shaping the roadmap</li>
    </ul>
    <h3>📌 The Community Feed</h3>
    <p>Where students post:</p>
    <ul>
      <li>Creative concepts</li>
      <li>Personal projects</li>
      <li>Experiments using AI design tools</li>
      <li>Recycled-material builds</li>
    </ul>
    <h3>📌 The Path to Your First Creation</h3>
    <p>We'll send small, simple steps you can use to begin designing — even if you've never used AI tools before.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{build_log_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Following the Build Log</a>
    </p>
    <p>The journey is evolving.<br>You're part of it now.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
  </div>
</body>
</html>`;
}

/**
 * Student Template 4: Your First Action Step
 * From database: set_one_student, step 4
 */
function getStudentTemplate4() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Your First Action Step</h2>
    <p>Hi {{first_name}},</p>
    <p>If you want to take part in the Creative Movement, here's the simplest first step:</p>
    <h3>Your First Action: The Signature Creative Prompt</h3>
    <p style="font-style: italic; font-size: 18px; color: #4CAF50; margin: 20px 0;">
      "What would you design if you could turn recycled materials into premium furniture using AI?"
    </p>
    <p>You can submit:</p>
    <ul>
      <li>A photo</li>
      <li>A rough sketch</li>
      <li>A written idea</li>
      <li>An AI-generated image</li>
      <li>A moodboard</li>
    </ul>
    <p><strong>Everything is welcome.</strong></p>
    <p>Your school's student page has a fast upload option:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{submit_creation_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Submit Your First Creation</a>
    </p>
    <p>This isn't about perfection.<br>It's about momentum.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
  </div>
</body>
</html>`;
}

/**
 * Student Template 5: Become a Recognized Member
 * From database: set_one_student, step 5
 */
function getStudentTemplate5() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Become a Recognized Member</h2>
    <p>Hi {{first_name}},</p>
    <p>Students who join now are being recorded as <strong>early members</strong> of the Movement.</p>
    <p>To finalize your place, activate your <strong>$1 Student Membership Pass</strong>, which gives you:</p>
    <ul>
      <li>Early access to new tools</li>
      <li>The monthly creative challenge system</li>
      <li>A digital portfolio builder</li>
      <li>Your student badge</li>
      <li>A permanent member listing</li>
      <li>The ability to join collaborative builds</li>
    </ul>
    <p>You don't need it to follow the story.<br>But if you want to contribute, collaborate, or build — it helps unlock everything.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{mission_support_url}}?amount=1" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Activate Your Pass ($1 for the year)</a>
    </p>
    <p>We're just getting started.<br>Let's build forward, together.</p>
    <p>Best regards,<br>The HingeCraft Team</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>`;
}

/**
 * Referral Template 1: A New $1 Student Pass Just Launched
 * From database: set_two_referral, step 1
 */
function getReferralTemplate1() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">A New $1 Student Pass Just Launched</h2>
    <p>Dear Students,</p>
    <p>Our school has partnered with <strong>HingeCraft Global</strong> to bring you early access to a new student-focused program designed to support creativity, skill-building, and future-ready learning.</p>
    <p>For a limited time, all students can join the <strong>HingeCraft Student Pass</strong> for just <strong>$1 for the entire year</strong>.</p>
    <h3>What the Student Pass Includes:</h3>
    <ul>
      <li>A private school-specific student page</li>
      <li>Access to AI learning modules and beginner-friendly tools</li>
      <li>Monthly creative challenges (design, building, sustainable innovation)</li>
      <li>A digital portfolio-builder to showcase your work</li>
      <li>A student-only community space to connect, collaborate, and share ideas</li>
      <li>Early access to upcoming HingeCraft workshops and events</li>
    </ul>
    <h3>Why We're Sharing This With You</h3>
    <p>HingeCraft is building a new kind of platform where students can:</p>
    <ul>
      <li>✔ Explore creativity</li>
      <li>✔ Learn AI fundamentals</li>
      <li>✔ Build digital and physical projects</li>
      <li>✔ Develop new skills</li>
      <li>✔ Connect with a global community of creators</li>
    </ul>
    <p>It's designed to be simple, accessible, and supportive — whether you're into design, technology, sustainability, future innovation, or just want to try something new.</p>
    <h3>Activate Your $1 Access</h3>
    <p>You can activate your Student Pass here:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{school_unique_link}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">👉 Activate Your Student Pass</a>
    </p>
    <p>Feel free to share this link with classmates who may also want to join.</p>
    <p>If you have any questions about how the pass works or what you'll receive, our office is happy to help.</p>
    <p>Best regards,<br>{{sender_name}}<br>{{sender_title}}<br>{{school_name}}</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 1: Introducing Hingecraft
 * From database: set_three_b2b, step 1
 */
function getB2BTemplate1() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Introducing Hingecraft</h2>
    <p>Hello,</p>
    <p><strong>HingeCraft</strong> is an early-stage initiative focused on creativity, sustainability, and accessible AI education — built for students, communities, and partners who care about future skills without financial barriers.</p>
    <p>At its core, Hingecraft exists to make advanced creative tools available to young people in a way that feels human, collaborative, and grounded in real-world making. We blend AI-assisted design, recycled-material innovation, and community-driven challenges into a single ecosystem.</p>
    <p>This message is being shared broadly with organizations, institutions, and partners who support education, creativity, youth development, sustainability, or innovation. If this reaches the right person, feel free to forward internally.</p>
    <p><strong>No action is required</strong> — this is simply an introduction.</p>
    <p>—<br>HingeCraft</p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 2: The $1 Abundance Pass
 * From database: set_three_b2b, step 2
 */
function getB2BTemplate2() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">The $1 Abundance Pass</h2>
    <p>Hello,</p>
    <p>One of the most intentional design choices behind Hingecraft is the <strong>$1 Student Pass</strong>.</p>
    <p>We built this to remove financial friction entirely — not as a discount, but as a signal. Students shouldn't have to "qualify" for access to creativity, learning, or future-facing tools.</p>
    <p>The pass unlocks:</p>
    <ul>
      <li>Guided AI-assisted creative challenges</li>
      <li>Design prompts tied to sustainability and reuse</li>
      <li>Community collaboration and team participation</li>
      <li>Early exposure to future-skill workflows</li>
    </ul>
    <p>This model allows schools, nonprofits, community groups, and partners to participate without administrative overhead or funding complexity.</p>
    <p>If this message is landing with someone who manages programs, partnerships, or outreach, feel free to pass it along.</p>
    <p>—<br>HingeCraft</p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 3: How Hingecraft Approaches AI
 * From database: set_three_b2b, step 3
 */
function getB2BTemplate3() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">How Hingecraft Approaches AI</h2>
    <p>Hello,</p>
    <p><strong>HingeCraft treats AI as a creative assistant, not a replacement.</strong></p>
    <p>Students don't just "use AI" — they learn how to:</p>
    <ul>
      <li>Prompt thoughtfully</li>
      <li>Iterate designs</li>
      <li>Combine digital ideas with physical outcomes</li>
      <li>Understand limitations and ethics</li>
      <li>Collaborate with peers using shared tools</li>
    </ul>
    <p>Our challenges are intentionally designed to feel more like creative studios than classrooms. The goal isn't speed — it's confidence, literacy, and creative ownership.</p>
    <p>This approach has resonated with educators, youth programs, maker spaces, and community partners who want AI exposure without risk or abstraction.</p>
    <p>Sharing for context.</p>
    <p>—<br>HingeCraft</p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 4: Why Local Participation Matters
 * From database: set_three_b2b, step 4
 */
function getB2BTemplate4() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Why Local Participation Matters</h2>
    <p>Hello,</p>
    <p><strong>HingeCraft is structured so that each school or community participates as its own node</strong> — not as a passive audience.</p>
    <p>Students see:</p>
    <ul>
      <li>Their school represented on leaderboards</li>
      <li>Team-based challenges that require collaboration</li>
      <li>Recognition for participation, not just performance</li>
      <li>Creative output that reflects local identity</li>
    </ul>
    <p>This structure encourages organic sharing, peer involvement, and community pride — without competitive pressure or exclusion.</p>
    <p>Organizations supporting local youth, sustainability, or creative development often find this model aligns naturally with their goals.</p>
    <p>This message can be shared freely.</p>
    <p>—<br>HingeCraft</p>
  </div>
</body>
</html>`;
}

/**
 * B2B Template 5: Supporting Access (Optional)
 * From database: set_three_b2b, step 5
 */
function getB2BTemplate5() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #4CAF50;">Supporting Access (Optional)</h2>
    <p>Hello,</p>
    <p><strong>HingeCraft is still building.</strong></p>
    <p>We operate with minimal overhead and rely on a mix of partnerships, small donations, and community support to keep student access open and affordable.</p>
    <p>For those who choose to support:</p>
    <ul>
      <li>Donations help subsidize student access</li>
      <li>Contributions fund platform development and challenges</li>
      <li>Support keeps the $1 Student Pass viable</li>
    </ul>
    <p><strong>There is no obligation</strong> — awareness alone is meaningful.</p>
    <p>If this message reaches someone responsible for community initiatives, education funding, or partnership development, it may be useful to share.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{mission_support_url}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Support HingeCraft</a>
    </p>
    <p>Thank you for taking the time to read.</p>
    <p>—<br>HingeCraft</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="font-size: 12px; color: #666;">
      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
      <a href="{{preferences_url}}">Update Preferences</a>
    </p>
  </div>
</body>
</html>`;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get processed file IDs (stored in Properties Service)
 */
function getProcessedFileIds() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const processed = scriptProperties.getProperty('processed_file_ids');
  return processed ? JSON.parse(processed) : [];
}

/**
 * Mark file as processed
 */
function markFileAsProcessed(fileId) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const processed = getProcessedFileIds();
  processed.push(fileId);
  scriptProperties.setProperty('processed_file_ids', JSON.stringify(processed));
}

/**
 * Send error notification
 */
function sendErrorNotification(error) {
  try {
    GmailApp.sendEmail(
      CONFIG.GMAIL_FROM_ADDRESS,
      'HingeCraft Automation Error',
      `Error in automation: ${error.toString()}`,
      { from: CONFIG.GMAIL_FROM_ADDRESS }
    );
  } catch (e) {
    Logger.log(`Could not send error notification: ${e.toString()}`);
  }
}

// ============================================
// PHASE 5: SEQUENCE MANAGEMENT (24-HOUR TIMING)
// ============================================

/**
 * Retrieves contacts eligible for the next sequence step using the HubSpot Search API.
 * This filters for contacts with TIME-BASED sequences (B2B and Student):
 * 1. Who are NOT finished (next_step < 6)
 * 2. Whose next_send_timestamp is LESS than the current time (timing met)
 * 3. Template set is set_one_student OR set_three_b2b (NOT set_two_referral)
 * NOTE: This is critical for 100% accurate timing (24-hour delay for B2B and Student).
 * NOTE: Referral sequences (set_two_referral) are handled separately via individual triggers.
 */
function getContactsReadyForNextStep() {
  const currentTime = new Date().getTime();
  
  // Properties needed for sequence logic, personalization, and template selection
  const requiredProperties = [
    'email', 'firstname', 'lastname', 'company', 
    'automation_template_set', 'automation_next_email_step', 
    'automation_next_send_timestamp', 'original_sheet_data_segment_1',
    'original_sheet_data_segment_2', 'original_sheet_data_segment_3',
    'original_sheet_data_segment_4', 'original_sheet_data_segment_5',
    'automation_emails_sent', 'last_contact_sent_date', 'automation_lead_type'
  ];

  const searchUrl = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`;
  
  const searchPayload = {
    filterGroups: [
      {
        filters: [
          // Filter 1: Contact must NOT be finished (Step < 6)
          {
            propertyName: 'automation_next_email_step',
            operator: 'LT', // Less Than
            value: '6' // Step 6 means FINISHED
          },
          // Filter 2: The current time (in ms) must be PAST the next eligible send time
          {
            propertyName: 'automation_next_send_timestamp',
            operator: 'LT', // Less Than
            value: currentTime.toString() 
          },
          // Filter 3: Template set must be B2B or Student (NOT Referral)
          // Referral sequences are handled separately via individual triggers
          {
            propertyName: 'automation_template_set',
            operator: 'IN',
            values: ['set_one_student', 'set_three_b2b'] // Only time-based sequences
          }
        ]
      }
    ],
    properties: requiredProperties,
    limit: 1000 // Increased limit for large batches - process up to 1000 contacts per run
  };
  
  try {
    const options = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(searchPayload)
    };
    
    const response = UrlFetchApp.fetch(searchUrl, options);
    const result = JSON.parse(response.getContentText());
    
    Logger.log(`Found ${result?.results?.length || 0} contacts ready for the next sequence step.`);
    
    return result?.results?.map(contact => ({
      id: contact.id,
      properties: contact.properties
    })) || [];
    
  } catch (error) {
    Logger.log(`Error retrieving contacts via Search API: ${error.toString()}`);
    return [];
  }
}

/**
 * Executes the entire sequence management flow.
 * Handles TIME-BASED sequences (B2B and Student) with 24-hour timing.
 * Referral sequences are handled separately via processReferralSequences().
 */
function sequenceManager() {
  Logger.log('📧 Starting sequence manager (Time-Based: B2B & Student)...');
  
  // Step 1: Query HubSpot for all eligible contacts (B2B and Student only)
  const contacts = getContactsReadyForNextStep(); // Uses the HubSpot Search API
  
  if (contacts.length === 0) {
    Logger.log('No contacts ready to advance sequence (B2B/Student).');
    // Now process referral sequences (individual triggers)
    processReferralSequences();
    return;
  }
  
  let sent = 0;
  const BATCH_SIZE_EMAIL = 50; // Send emails in batches to avoid Gmail limits
  
  Logger.log(`Processing ${contacts.length} contacts in batches of ${BATCH_SIZE_EMAIL}`);
  Logger.log(`Sequence Types: B2B (set_three_b2b) and Student (set_one_student)`);
  Logger.log(`Timing: 24 hours between each step`);
  
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    // All timing and completion checks are handled by getContactsReadyForNextStep() filters.
    
    const nextStep = parseInt(contact.properties.automation_next_email_step || '1');
    const templateSet = contact.properties.automation_template_set || determineTemplateSet(contact);
    const leadType = contact.properties.automation_lead_type || 'Unknown';
    
    Logger.log(`Processing: ${contact.properties.email} (${leadType}, ${templateSet}, step ${nextStep})`);
    
    // 1. Template Fetch
    const template = getTemplate(templateSet, nextStep); 
    
    if (!template) {
      Logger.log(`Skipping ${contact.properties.email}: Template for set '${templateSet}' step ${nextStep} not found.`);
      // Optionally, set next_step to 6 here to prevent endless checking
      advanceContactSequence(contact, 5, CONFIG); 
      continue; 
    }
    
    try {
      // 2. Execution
      const result = sendPersonalizedEmail(contact, CONFIG, template); 
      
      if (result.success) {
        sent++;
        // 3. Update: Advance step counter and set next 24-hour timestamp
        // Both B2B and Student use the same 24-hour timing
        advanceContactSequence(contact, nextStep, CONFIG);
        Logger.log(`✅ Email sent to ${contact.properties.email} (${leadType}, step ${nextStep})`);
      }
      
      // Be mindful of Gmail limits: adding pauses
      Utilities.sleep(500); // 500ms between emails
      
      // Longer pause every 50 emails to respect Gmail rate limits
      if ((i + 1) % BATCH_SIZE_EMAIL === 0) {
        Logger.log(`Sent ${sent} emails so far. Pausing to respect rate limits...`);
        Utilities.sleep(2000); // 2 second pause every 50 emails
      } 
      
    } catch (error) {
      Logger.log(`Error processing sequence for ${contact.properties.email}: ${error.toString()}`);
    }
  }
  Logger.log(`✅ Time-based sequence run complete: ${sent} emails sent/advanced.`);
  
  // After processing time-based sequences, process referral sequences
  processReferralSequences();
}

/**
 * Processes Referral sequences (set_two_referral) with individual triggers.
 * Referral sequences are NOT time-based - they trigger individually for each lead.
 * This function finds all referral contacts ready to send and processes them.
 */
function processReferralSequences() {
  Logger.log('📧 Processing Referral sequences (Individual Triggers)...');
  
  const currentTime = new Date().getTime();
  const requiredProperties = [
    'email', 'firstname', 'lastname', 'company',
    'automation_template_set', 'automation_next_email_step',
    'automation_emails_sent', 'automation_lead_type'
  ];
  
  const searchUrl = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`;
  
  // Find all referral contacts that haven't been sent yet (step = 1, emails_sent = 0)
  const searchPayload = {
    filterGroups: [
      {
        filters: [
          // Filter 1: Template set is referral
          {
            propertyName: 'automation_template_set',
            operator: 'EQ',
            value: 'set_two_referral'
          },
          // Filter 2: Still on step 1 (hasn't been sent yet)
          {
            propertyName: 'automation_next_email_step',
            operator: 'EQ',
            value: '1'
          },
          // Filter 3: No emails sent yet (or emails_sent = 0)
          {
            propertyName: 'automation_emails_sent',
            operator: 'EQ',
            value: '0'
          }
        ]
      }
    ],
    properties: requiredProperties,
    limit: 1000
  };
  
  try {
    const options = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(searchPayload)
    };
    
    const response = UrlFetchApp.fetch(searchUrl, options);
    const result = JSON.parse(response.getContentText());
    const referralContacts = result?.results || [];
    
    Logger.log(`Found ${referralContacts.length} referral contacts ready to send.`);
    
    if (referralContacts.length === 0) {
      Logger.log('No referral contacts ready.');
      return;
    }
    
    let sent = 0;
    const BATCH_SIZE_EMAIL = 50;
    
    Logger.log(`Processing ${referralContacts.length} referral contacts in batches of ${BATCH_SIZE_EMAIL}`);
    
    for (let i = 0; i < referralContacts.length; i++) {
      const contact = {
        id: referralContacts[i].id,
        properties: referralContacts[i].properties
      };
      
      const templateSet = 'set_two_referral';
      const nextStep = 1; // Referral only has 1 step
      
      // Get template
      const template = getTemplate(templateSet, nextStep);
      
      if (!template) {
        Logger.log(`Skipping ${contact.properties.email}: Referral template not found.`);
        continue;
      }
      
      try {
        // Send email
        const result = sendPersonalizedEmail(contact, CONFIG, template);
        
        if (result.success) {
          sent++;
          // Mark referral sequence as complete (step 2 = finished for referral)
          const contactId = contact.id;
          const updateUrl = `${CONFIG.HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}`;
          const properties = {
            automation_next_email_step: '2', // Step 2 = finished for referral (only 1 step)
            automation_next_send_timestamp: '9999999999999', // Far future (no more sends)
            last_contact_sent_date: new Date().toISOString(),
            automation_emails_sent: '1'
          };
          
          const updateOptions = {
            method: 'patch',
            headers: {
              'Authorization': `Bearer ${CONFIG.HUBSPOT_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            },
            payload: JSON.stringify({ properties: properties })
          };
          
          UrlFetchApp.fetch(updateUrl, updateOptions);
          Logger.log(`✅ Referral email sent to ${contact.properties.email}`);
        }
        
        Utilities.sleep(500); // 500ms between emails
        
        if ((i + 1) % BATCH_SIZE_EMAIL === 0) {
          Logger.log(`Sent ${sent} referral emails so far. Pausing...`);
          Utilities.sleep(2000);
        }
        
      } catch (error) {
        Logger.log(`Error processing referral for ${contact.properties.email}: ${error.toString()}`);
      }
    }
    
    Logger.log(`✅ Referral sequence run complete: ${sent} emails sent.`);
    
  } catch (error) {
    Logger.log(`Error retrieving referral contacts: ${error.toString()}`);
  }
}

/**
 * Sequence Advancement Logic (24-Hour Enforcement)
 * This function runs after a successful send and calculates the exact timestamp for the next step.
 * Applies to BOTH B2B (set_three_b2b) and Student (set_one_student) sequences.
 * Both use the same 24-hour timing between steps.
 */
const MILLIS_IN_24_HOURS = 24 * 60 * 60 * 1000;

function advanceContactSequence(contact, currentStep, config) {
  const contactId = contact.id;
  const nextStep = currentStep + 1;
  const currentTime = new Date().getTime();
  const templateSet = contact.properties.automation_template_set || 'set_three_b2b';
  
  // Calculate the next send time: Current time + 24 hours
  // This value is used by the Search API filter (getContactsReadyForNextStep)
  // BOTH B2B and Student sequences use 24-hour timing
  const nextSendTime = currentTime + MILLIS_IN_24_HOURS;
  
  // Determine if sequence is complete:
  // - B2B (set_three_b2b): 5 steps, so step 6 = finished
  // - Student (set_one_student): 5 steps, so step 6 = finished
  // - Referral (set_two_referral): 1 step, so step 2 = finished (handled separately)
  const isComplete = nextStep > 5;
  const finalStepValue = (isComplete ? 6 : nextStep).toString();
  
  const properties = {
    // Log the completion status and advance the step counter
    automation_next_email_step: finalStepValue,
    
    // If the sequence is not finished, set the next timestamp; otherwise, set a very high timestamp (far future)
    automation_next_send_timestamp: (isComplete ? '9999999999999' : nextSendTime).toString(), 
    
    // Mark when the last email was physically sent
    last_contact_sent_date: new Date().toISOString(), 
    
    // Increment the total count
    automation_emails_sent: (parseInt(contact.properties.automation_emails_sent || '0') + 1).toString(),
    
    // Reset the ready flag (it's no longer needed once the sequence starts)
    send_email_ready: 'false'
  };
  
  // Execute HubSpot patch request (API call to update properties)
  const updateUrl = `${config.HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}`;
  const options = {
    method: 'patch',
    headers: {
      'Authorization': `Bearer ${config.HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({ properties: properties })
  };
  
  try {
    UrlFetchApp.fetch(updateUrl, options);
    const sequenceType = templateSet === 'set_one_student' ? 'Student' : 
                        templateSet === 'set_three_b2b' ? 'B2B' : 'Unknown';
    Logger.log(`✅ Advanced ${sequenceType} contact ${contactId} to step ${finalStepValue}, next send: ${new Date(nextSendTime).toISOString()}`);
  } catch (error) {
    Logger.log(`Error advancing contact sequence: ${error.toString()}`);
  }
}

/**
 * Wrapper function to run HubSpot property creation
 * This makes it easier to find in the function dropdown
 * Simply run this function to create all HubSpot properties
 */
function runHubSpotSetup() {
  createHubSpotProperties();
}