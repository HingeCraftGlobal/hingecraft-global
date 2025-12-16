/**
 * Set All Script Properties
 * 
 * Run this function ONCE in Apps Script to set all properties
 * Then delete this function
 */
function setAllScriptProperties() {
  const properties = PropertiesService.getScriptProperties();
  
  const props = {
  "HUBSPOT_TOKEN": "",
  "ANYMAIL_API_KEY": "",
  "MONITORED_FOLDER_ID": "",
  "GMAIL_FROM_ADDRESS": "marketingecraft@gmail.com",
  "TRACKING_ENDPOINT_URL": "https://script.google.com/macros/s/AKfycbz2kYZn-DKiaKHPWOVoOh7fdY8l-tnkRwx4GBFX5sA30muzoyAgWn-cVS_aU0OMceq4/exec",
  "GA4_MEASUREMENT_ID": "G-QF5H2Q291T",
  "GA4_API_SECRET": "cJH76-IHQteQx6DKaiPkGA",
  "GA4_STREAM_ID": "13142410458",
  "GA4_STREAM_URL": "https://hingecraft-global.ai"
};
  
  let set = 0;
  let skipped = 0;
  
  Object.entries(props).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      properties.setProperty(key, value);
      Logger.log(`✅ Set: ${key}`);
      set++;
    } else {
      Logger.log(`⚠️  Skipped: ${key} (empty value - set manually)`);
      skipped++;
    }
  });
  
  Logger.log(`\n✅ Complete: ${set} properties set, ${skipped} skipped`);
  Logger.log('⚠️  Properties with empty values must be set manually');
}
