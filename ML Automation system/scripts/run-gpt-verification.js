/**
 * Run GPT Template Verification with correct database connection
 */

// Override database config for Docker connection
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '7543';
process.env.DB_NAME = 'hingecraft_automation';
process.env.DB_USER = 'hingecraft_user';
process.env.DB_PASSWORD = 'hingecraft_pass';

// Load OpenAI key
const fs = require('fs');
const path = require('path');
const keyPath = '/Users/chandlerfergusen/Desktop/CURSOR/api_keys/openai.json';
if (fs.existsSync(keyPath)) {
  const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  process.env.OPENAI_API_KEY = keyData.apiKey || keyData.api_key;
}

// Run verification
require('../tests/gpt-template-verifier.js');
