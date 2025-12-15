/**
 * Bulk Processing System for AnyMail API
 * Handles large datasets (1,000+ rows) efficiently with bulk API calls
 * Processes multiple emails per row and integrates with segmentation pipeline
 */

// ============================================
// BULK ANYMAIL PROCESSING
// ============================================

/**
 * Prepares a single bulk payload for AnyMail API from all new files
 * Deduplicates contacts and formats for bulk enrichment
 * @returns {Array<Object>} Bulk payload array
 */
function prepareAnyMailBulkPayload() {
  Logger.log('📦 Preparing bulk AnyMail payload...');
  
  const bulkPayload = [];
  const uniqueIdentifiers = new Set();
  const allFileRows = []; // Store rows with file metadata
  
  // Get folder and new files
  const scriptProperties = PropertiesService.getScriptProperties();
  const folderId = scriptProperties.getProperty('MONITORED_FOLDER_ID') || CONFIG.MONITORED_FOLDER_ID;
  
  if (!folderId) {
    Logger.log('⚠️ MONITORED_FOLDER_ID not configured');
    return [];
  }
  
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const processedFileIds = getProcessedFileIds();
    
    while (files.hasNext()) {
      const file = files.next();
      const fileId = file.getId();
      
      // Skip already processed files
      if (processedFileIds.includes(fileId)) {
        continue;
      }
      
      Logger.log(`📄 Processing file: ${file.getName()}`);
      
      // Read file data
      const fileData = readDriveFile(fileId, file.getMimeType());
      if (!fileData || fileData.length === 0) {
        continue;
      }
      
      // Cache header row for column index lookup
      let headerRow = null;
      if (Array.isArray(fileData) && fileData.length > 0) {
        // If fileData is array of objects, extract headers
        if (typeof fileData[0] === 'object' && !Array.isArray(fileData[0])) {
          headerRow = Object.keys(fileData[0]);
        } else if (Array.isArray(fileData[0])) {
          headerRow = fileData[0]; // First row is header
        }
        cacheHeaderRow(fileId, headerRow);
      }
      
      // Process each row
      const startRow = Array.isArray(fileData[0]) ? 1 : 0; // Skip header if array of arrays
      for (let i = startRow; i < fileData.length; i++) {
        const row = fileData[i];
        
        // Convert object row to array if needed
        let rowArray = row;
        if (typeof row === 'object' && !Array.isArray(row)) {
          rowArray = headerRow ? headerRow.map(h => row[h] || row[String(h)] || '') : Object.values(row);
        }
        
        // Extract company/organization name and domain
        const organizationName = extractOrganizationName(rowArray, fileId, headerRow);
        const companyDomain = extractCompanyDomain(rowArray, fileId, headerRow);
        const primaryEmail = extractPrimaryEmail(rowArray, fileId, headerRow);
        
        // Skip if missing critical data
        if (!companyDomain && !primaryEmail) {
          continue;
        }
        
        // Create unique identifier (email + domain)
        const identifier = primaryEmail 
          ? `${primaryEmail.toLowerCase()}_${companyDomain || 'unknown'}`
          : `${organizationName || 'unknown'}_${companyDomain || 'unknown'}`;
        
        if (!uniqueIdentifiers.has(identifier)) {
          uniqueIdentifiers.add(identifier);
          
          // Store original row data for later mapping
          allFileRows.push({
            row_index: i,
            file_id: fileId,
            file_name: file.getName(),
            original_row: row
          });
          
          // Format payload for AnyMail Bulk API
          bulkPayload.push({
            name: extractContactName(row, fileId),
            domain: companyDomain,
            email: primaryEmail, // If available from source
            organization: organizationName,
            // Store reference to original row
            _row_ref: allFileRows.length - 1,
            _file_id: fileId
          });
        }
      }
    }
    
    Logger.log(`✅ Prepared ${bulkPayload.length} unique contacts for bulk enrichment`);
    return { payload: bulkPayload, rowData: allFileRows };
    
  } catch (error) {
    Logger.log(`❌ Error preparing bulk payload: ${error.toString()}`);
    return { payload: [], rowData: [] };
  }
}

/**
 * Performs bulk AnyMail API call to enrich all contacts at once
 * @param {Array<Object>} payload - Array of contacts prepared by prepareAnyMailBulkPayload
 * @returns {Array<Object>} Enriched results with original row references
 */
function runAnyMailBulkEnrichment(payload) {
  const config = getConfig();
  
  if (!payload || payload.length === 0) {
    Logger.log('⚠️ Empty payload for AnyMail bulk enrichment');
    return [];
  }
  
  Logger.log(`📧 Sending ${payload.length} contacts to AnyMail Bulk API...`);
  
  // AnyMail Bulk API endpoint (verify with AnyMail documentation)
  const ANYMAIL_BULK_ENDPOINT = 'https://api.anymailfinder.com/api/v4/bulk-enrich';
  
  // Format payload for AnyMail (adjust based on actual API requirements)
  const apiPayload = {
    contacts: payload.map(contact => ({
      name: contact.name,
      domain: contact.domain,
      email: contact.email || null,
      organization: contact.organization || null
    }))
  };
  
  try {
    const response = UrlFetchApp.fetch(ANYMAIL_BULK_ENDPOINT, {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${config.ANYMAIL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(apiPayload),
      muteHttpExceptions: true
    });
    
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (statusCode !== 200) {
      Logger.log(`❌ AnyMail Bulk API Error: ${statusCode} - ${responseText}`);
      return [];
    }
    
    const results = JSON.parse(responseText);
    
    // Map results back to original payload structure
    const enrichedResults = results.enriched_contacts || results.results || [];
    
    Logger.log(`✅ Received ${enrichedResults.length} enriched contacts from AnyMail`);
    
    // Merge enriched data with original payload references
    return enrichedResults.map((enriched, index) => {
      const original = payload[index] || {};
      return {
        ...enriched,
        _row_ref: original._row_ref,
        _original_payload: original
      };
    });
    
  } catch (error) {
    Logger.log(`❌ AnyMail Bulk API Error: ${error.toString()}`);
    return [];
  }
}

/**
 * Processes bulk enriched results, segments data, and pushes to HubSpot
 * This is the critical integration step that connects bulk data to the segmentation pipeline
 * @param {Array<Object>} enrichedResults - Results from AnyMail bulk enrichment
 * @param {Array<Object>} rowData - Original row data for mapping
 */
function processBulkResults(enrichedResults, rowData) {
  Logger.log(`📦 Processing ${enrichedResults.length} enriched contacts for HubSpot integration...`);
  
  const config = getConfig();
  let processed = 0;
  let created = 0;
  let updated = 0;
  let errors = 0;
  
  // Process in batches to avoid rate limits
  const BATCH_SIZE = 50;
  
  for (let i = 0; i < enrichedResults.length; i += BATCH_SIZE) {
    const batch = enrichedResults.slice(i, i + BATCH_SIZE);
    
    Logger.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} contacts)...`);
    
    for (const enrichedContact of batch) {
      try {
        // Get original row data
        const rowRef = enrichedContact._row_ref;
        if (rowRef === undefined || !rowData[rowRef]) {
          Logger.log(`⚠️ Missing row reference for enriched contact`);
          errors++;
          continue;
        }
        
        const originalRow = rowData[rowRef].original_row;
        const fileId = rowData[rowRef].file_id;
        const fileName = rowData[rowRef].file_name;
        
        // Step 1: Data Segmentation (CRITICAL)
        // Determine lead type based on source data
        const leadType = determineLeadTypeFromRow(originalRow, enrichedContact, fileId);
        const templateSet = mapLeadTypeToTemplateSet(leadType);
        
        // Step 2: Extract all emails from row (handle multiple emails per row)
        const allEmails = extractAllEmailsFromRow(originalRow, enrichedContact, fileId, null);
        
        // Step 3: Process each email as a separate contact
        for (const emailData of allEmails) {
          const email = emailData.email;
          const isPrimary = emailData.isPrimary;
          
          if (!email || !isValidEmail(email)) {
            continue;
          }
          
          // Step 4: Prepare data packet with segmentation
          const contactDataPacket = {
            email: email.toLowerCase(),
            firstname: extractFirstName(originalRow, enrichedContact, fileId),
            lastname: extractLastName(originalRow, enrichedContact, fileId),
            company: extractOrganizationName(originalRow, fileId) || enrichedContact.organization,
            website: extractWebsite(originalRow, enrichedContact, fileId),
            city: extractCity(originalRow, fileId),
            state: extractState(originalRow, fileId),
            country: extractCountry(originalRow, fileId),
            phone: extractPhone(originalRow, enrichedContact, fileId),
            jobtitle: extractJobTitle(originalRow, enrichedContact, fileId),
            
            // Segmentation fields
            automation_template_set: templateSet,
            automation_lead_type: leadType,
            
            // Original sheet data segments (up to 5)
            original_sheet_data_segment_1: extractSegmentData(originalRow, 1, fileId),
            original_sheet_data_segment_2: extractSegmentData(originalRow, 2, fileId),
            original_sheet_data_segment_3: extractSegmentData(originalRow, 3, fileId),
            original_sheet_data_segment_4: extractSegmentData(originalRow, 4, fileId),
            original_sheet_data_segment_5: extractSegmentData(originalRow, 5, fileId),
            
            // AnyMail enrichment data
            anymail_source_type: enrichedContact.source_type || 'bulk',
            anymail_status: enrichedContact.status || 'valid',
            
            // Source tracking
            source_file_id: fileId,
            source_file_name: fileName,
            source_row_number: rowData[rowRef].row_index
          };
          
          // Step 5: Create/Update HubSpot contact and trigger sequence
          const hubspotContact = createOrUpdateContact(contactDataPacket);
          
          if (hubspotContact) {
            if (hubspotContact.created) {
              created++;
            } else {
              updated++;
            }
            processed++;
          } else {
            errors++;
          }
        }
        
        // Small delay to respect rate limits
        Utilities.sleep(200);
        
      } catch (error) {
        Logger.log(`❌ Error processing enriched contact: ${error.toString()}`);
        errors++;
      }
    }
    
    // Batch delay
    if (i + BATCH_SIZE < enrichedResults.length) {
      Utilities.sleep(1000);
    }
  }
  
  Logger.log(`✅ Bulk processing complete: ${processed} processed, ${created} created, ${updated} updated, ${errors} errors`);
  
  return {
    processed: processed,
    created: created,
    updated: updated,
    errors: errors
  };
}

// ============================================
// DATA EXTRACTION UTILITIES
// ============================================

/**
 * Extracts organization name from row data
 */
function extractOrganizationName(row, fileId = null) {
  // Try common column names
  const orgFields = ['Organization Name', 'Company', 'Organization', 'Org Name', 'Company Name'];
  for (const field of orgFields) {
    const index = getColumnIndex(field, row, fileId);
    if (index !== null && index !== -1) {
      const value = typeof row === 'object' && !Array.isArray(row) 
        ? row[index] 
        : (Array.isArray(row) && index >= 0 ? row[index] : null);
      if (value) {
        return String(value).trim();
      }
    }
  }
  return null;
}

/**
 * Extracts company domain from row data
 */
function extractCompanyDomain(row, fileId, headerRow) {
  // Try Website URL first
  const websiteIndex = getColumnIndex('Website URL', fileId, headerRow);
  if (websiteIndex >= 0 && row && row[websiteIndex]) {
    const website = String(row[websiteIndex]).trim();
    const domain = extractDomainFromUrl(website);
    if (domain) return domain;
  }
  
  // Try email domain
  const emailIndex = getColumnIndex('Primary Contact Email', fileId, headerRow);
  if (emailIndex >= 0 && row && row[emailIndex]) {
    const email = String(row[emailIndex]).trim();
    const domain = extractDomainFromEmail(email);
    if (domain) return domain;
  }
  
  return null;
}

/**
 * Extracts primary email from row
 */
function extractPrimaryEmail(row, fileId, headerRow) {
  const emailFields = ['one_email', 'Primary Contact Email', 'Email', 'one_valid_email_only'];
  for (const field of emailFields) {
    const index = getColumnIndex(field, fileId, headerRow);
    if (index >= 0 && row && row[index]) {
      const email = String(row[index]).trim();
      if (isValidEmail(email)) {
        return email;
      }
    }
  }
  return null;
}

/**
 * Extracts all emails from row (handles comma-separated emails)
 */
function extractAllEmailsFromRow(row, enrichedContact, fileId, headerRow) {
  const emails = [];
  
  // Try valid_emails_only or emails column (comma-separated)
  const emailFields = ['valid_emails_only', 'emails', 'Email', 'Primary Contact Email'];
  
  for (const field of emailFields) {
    const index = getColumnIndex(field, fileId, headerRow);
    if (index >= 0 && row && row[index]) {
      const emailString = String(row[index]).trim();
      
      // Split by comma and process each
      const emailList = emailString.split(',').map(e => e.trim()).filter(e => e);
      
      for (const email of emailList) {
        if (isValidEmail(email)) {
          emails.push({
            email: email,
            isPrimary: email === extractPrimaryEmail(row, fileId, headerRow) || emails.length === 0
          });
        }
      }
      
      if (emails.length > 0) break;
    }
  }
  
  // If no emails found in row, use enriched contact email
  if (emails.length === 0 && enrichedContact && enrichedContact.email) {
    emails.push({
      email: enrichedContact.email,
      isPrimary: true
    });
  }
  
  return emails;
}

/**
 * Determines lead type from row data
 */
function determineLeadTypeFromRow(row, enrichedContact, fileId = null) {
  // Check for explicit Lead ID pattern (NGO-001, etc.)
  const leadIdIndex = getColumnIndex('Lead ID', fileId);
  if (leadIdIndex >= 0 && row[leadIdIndex]) {
    const leadId = String(row[leadIdIndex]).toUpperCase();
    if (leadId.startsWith('NGO-')) {
      return 'NGO';
    }
    if (leadId.startsWith('STUDENT-') || leadId.startsWith('STU-')) {
      return 'Student';
    }
    if (leadId.startsWith('B2B-') || leadId.startsWith('PARTNER-')) {
      return 'B2B';
    }
  }
  
  // Check organization name for keywords
  const orgName = extractOrganizationName(row, fileId);
  if (orgName) {
    const orgLower = orgName.toLowerCase();
    if (orgLower.includes('ngo') || orgLower.includes('nonprofit') || orgLower.includes('foundation')) {
      return 'NGO';
    }
    if (orgLower.includes('university') || orgLower.includes('college') || orgLower.includes('school')) {
      return 'Student';
    }
  }
  
  // Check email domain
  const email = extractPrimaryEmail(row, fileId) || (enrichedContact && enrichedContact.email);
  if (email && email.includes('.edu')) {
    return 'Student';
  }
  
  // Default to B2B
  return 'B2B';
}

/**
 * Maps lead type to template set
 */
function mapLeadTypeToTemplateSet(leadType) {
  const mapping = {
    'Student': 'set_one_student',
    'NGO': 'set_two_referral',
    'B2B': 'set_three_b2b'
  };
  return mapping[leadType] || 'set_three_b2b';
}

/**
 * Extracts segment data from row
 */
function extractSegmentData(row, segmentNumber, fileId = null) {
  // Map common fields to segments based on your data structure
  const segmentMappings = {
    1: ['Focus Areas', 'Industry', 'Category'],
    2: ['Target Age Range', 'Demographics', 'Audience'],
    3: ['Annual Budget Range', 'Budget', 'Revenue'],
    4: ['Partnership Likelihood', 'Outreach Angle', 'Value Proposition'],
    5: ['Grant Programs', 'Programs', 'Services']
  };
  
  const fields = segmentMappings[segmentNumber] || [];
  for (const field of fields) {
    const index = getColumnIndex(field, fileId);
    if (index >= 0 && row[index]) {
      return String(row[index]).trim();
    }
  }
  return null;
}

/**
 * Helper: Extract domain from URL
 */
function extractDomainFromUrl(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (e) {
    return null;
  }
}

/**
 * Helper: Extract domain from email
 */
function extractDomainFromEmail(email) {
  if (!email || !email.includes('@')) return null;
  return email.split('@')[1].toLowerCase();
}

/**
 * Helper: Validate email
 */
function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Helper: Get column index by name (cached header row)
 * Works with both object-based rows (from readDriveFile) and array-based rows
 */
let headerRowCache = {};
let headerRowFileId = null;

function getColumnIndex(columnName, row, fileId) {
  // If row is an object (from readDriveFile), use direct property access
  if (typeof row === 'object' && !Array.isArray(row)) {
    // Try exact match first
    if (row.hasOwnProperty(columnName)) {
      return columnName; // Return key name for object access
    }
    // Try case-insensitive match
    const lowerColumnName = columnName.toLowerCase();
    for (const key in row) {
      if (key.toLowerCase() === lowerColumnName) {
        return key;
      }
    }
    return null;
  }
  
  // If row is an array, we need the header row
  if (Array.isArray(row)) {
    // Cache header row per file
    if (!headerRowCache[fileId]) {
      // Header row should be passed or retrieved
      return -1; // Can't determine without header
    }
    
    const headerRow = headerRowCache[fileId];
    const index = headerRow.findIndex(h => 
      h && h.toString().trim().toLowerCase() === columnName.toLowerCase()
    );
    return index >= 0 ? index : -1;
  }
  
  return null;
}

/**
 * Cache header row for a file
 */
function cacheHeaderRow(fileId, headerRow) {
  headerRowCache[fileId] = headerRow;
}

/**
 * Helper: Extract first name
 */
function extractFirstName(row, enrichedContact, fileId = null) {
  const nameFields = ['First Name', 'FirstName', 'firstname'];
  for (const field of nameFields) {
    const index = getColumnIndex(field, fileId);
    if (index >= 0 && row[index]) {
      return String(row[index]).trim();
    }
  }
  return enrichedContact?.first_name || null;
}

/**
 * Helper: Extract last name
 */
function extractLastName(row, enrichedContact, fileId = null) {
  const nameFields = ['Last Name', 'LastName', 'lastname'];
  for (const field of nameFields) {
    const index = getColumnIndex(field, fileId);
    if (index >= 0 && row[index]) {
      return String(row[index]).trim();
    }
  }
  return enrichedContact?.last_name || null;
}

/**
 * Helper: Extract website
 */
function extractWebsite(row, enrichedContact, fileId = null) {
  const websiteIndex = getColumnIndex('Website URL', fileId);
  if (websiteIndex >= 0 && row[websiteIndex]) {
    return String(row[websiteIndex]).trim();
  }
  return enrichedContact?.website || null;
}

/**
 * Helper: Extract city
 */
function extractCity(row, fileId = null) {
  const cityIndex = getColumnIndex('City', fileId);
  if (cityIndex >= 0 && row[cityIndex]) {
    return String(row[cityIndex]).trim();
  }
  return null;
}

/**
 * Helper: Extract state
 */
function extractState(row, fileId = null) {
  const stateIndex = getColumnIndex('State', fileId);
  if (stateIndex >= 0 && row[stateIndex]) {
    return String(row[stateIndex]).trim();
  }
  return null;
}

/**
 * Helper: Extract country
 */
function extractCountry(row, fileId = null) {
  const countryIndex = getColumnIndex('Country', fileId);
  if (countryIndex >= 0 && row[countryIndex]) {
    return String(row[countryIndex]).trim();
  }
  return 'US'; // Default
}

/**
 * Helper: Extract phone
 */
function extractPhone(row, enrichedContact, fileId = null) {
  const phoneFields = ['Phone', 'Phone Number', 'Contact Phone'];
  for (const field of phoneFields) {
    const index = getColumnIndex(field, fileId);
    if (index >= 0 && row[index]) {
      return String(row[index]).trim();
    }
  }
  return enrichedContact?.phone || null;
}

/**
 * Helper: Extract job title
 */
function extractJobTitle(row, enrichedContact, fileId = null) {
  const titleFields = ['Job Title', 'Title', 'Position'];
  for (const field of titleFields) {
    const index = getColumnIndex(field, fileId);
    if (index >= 0 && row[index]) {
      return String(row[index]).trim();
    }
  }
  return enrichedContact?.title || null;
}
