/**
 * HubSpot Export API Script
 */
const axios = require('axios');
const fs = require('fs');
const config = require('../config/api_keys');

async function exportHubSpotContacts() {
  const payload = JSON.parse(
    fs.readFileSync('api-payloads/hubspot-export-payload.json', 'utf8')
  );
  
  try {
    // Create export
    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/exports',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${config.hubspot.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const exportId = response.data.id;
    console.log('Export ID:', exportId);
    
    // Poll for completion
    let status = 'PENDING';
    while (status !== 'COMPLETED') {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusResponse = await axios.get(
        `https://api.hubapi.com/crm/v3/exports/${exportId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.hubspot.apiKey}`
          }
        }
      );
      status = statusResponse.data.status;
      console.log('Status:', status);
    }
    
    // Download CSV
    const downloadUrl = response.data.downloadUrl;
    console.log('Download URL:', downloadUrl);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

exportHubSpotContacts();
