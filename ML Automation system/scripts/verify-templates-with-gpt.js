/**
 * Verify Email Templates with GPT
 * Uses OpenAI GPT to verify all email templates with 30+ prompts
 */

const path = require('path');

// Change to project root
process.chdir(path.join(__dirname, '..'));

// Run GPT verifier
require('../tests/gpt-template-verifier');
