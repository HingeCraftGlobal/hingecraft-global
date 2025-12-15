#!/usr/bin/env node

/**
 * System Test Script
 * Tests all major functionality of the ML Automation System
 */

const db = require('../src/utils/database');
const logger = require('../src/utils/logger');
const orchestrator = require('../src/orchestrator');
const leadProcessor = require('../src/services/leadProcessor');
const hubspot = require('../src/services/hubspot');
const anymail = require('../src/services/anymail');
const sequenceEngine = require('../src/services/sequenceEngine');
const healthCheck = require('../src/monitoring/healthCheck');

const tests = {
  passed: 0,
  failed: 0,
  skipped: 0
};

function logTest(name, passed, message) {
  const icon = passed ? '✅' : '❌';
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`${icon} [${status}] ${name}: ${message}`);
  
  if (passed) {
    tests.passed++;
  } else {
    tests.failed++;
  }
}

function logSkip(name, reason) {
  console.log(`⏭️  [SKIP] ${name}: ${reason}`);
  tests.skipped++;
}

async function testDatabase() {
  console.log('\n📊 Testing Database...');
  
  try {
    const result = await db.query('SELECT NOW() as time');
    logTest('Database Connection', true, 'Connected');
    
    // Test insert
    const testLead = {
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      organization: 'Test Org',
      source: 'test',
      fingerprint: 'test_fingerprint_' + Date.now()
    };
    
    try {
      const inserted = await db.insertLead(testLead);
      logTest('Database Insert', true, `Lead ID: ${inserted.id}`);
      
      // Test update
      await db.updateLead(inserted.id, { status: 'tested' });
      logTest('Database Update', true, 'Updated successfully');
      
      // Cleanup
      await db.query('DELETE FROM leads WHERE id = $1', [inserted.id]);
      logTest('Database Cleanup', true, 'Test data removed');
    } catch (error) {
      logTest('Database Operations', false, error.message);
    }
  } catch (error) {
    logTest('Database Connection', false, error.message);
  }
}

async function testLeadProcessing() {
  console.log('\n🔧 Testing Lead Processing...');
  
  const testLead = {
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    organization: 'Test Organization',
    title: 'Developer',
    phone: '555-123-4567',
    website: 'https://example.com',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA'
  };
  
  try {
    // Test normalization
    const normalized = leadProcessor.normalizeLead(testLead);
    logTest('Lead Normalization', !!normalized.email, 'Normalized successfully');
    
    // Test validation
    const validation = leadProcessor.validateLead(normalized);
    logTest('Lead Validation', validation.valid, validation.valid ? 'Valid' : validation.errors.join(', '));
    
    // Test scoring
    const score = leadProcessor.scoreLead(normalized);
    logTest('Lead Scoring', score > 0, `Score: ${score}`);
    
  } catch (error) {
    logTest('Lead Processing', false, error.message);
  }
}

async function testHubSpot() {
  console.log('\n🔗 Testing HubSpot Integration...');
  
  // Skip if API key not configured
  const config = require('../config/api_keys');
  if (!config.hubspot.apiKey || config.hubspot.apiKey === 'your-hubspot-api-key') {
    logSkip('HubSpot API', 'API key not configured');
    return;
  }
  
  try {
    // Test API connection (search for non-existent contact to test API)
    const testEmail = 'test-nonexistent-' + Date.now() + '@example.com';
    const result = await hubspot.findContactByEmail(testEmail);
    logTest('HubSpot API Connection', true, 'API responding');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logTest('HubSpot API', false, 'Invalid API key');
    } else {
      logTest('HubSpot API', false, error.message);
    }
  }
}

async function testAnymail() {
  console.log('\n📧 Testing Anymail Integration...');
  
  const config = require('../config/api_keys');
  if (!config.anymail.apiKey || config.anymail.apiKey === 'your-anymail-api-key') {
    logSkip('Anymail API', 'API key not configured');
    return;
  }
  
  try {
    // Test email verification (won't actually send)
    const result = await anymail.verifyEmail('test@example.com');
    logTest('Anymail API Connection', true, 'API responding');
  } catch (error) {
    logTest('Anymail API', false, error.message);
  }
}

async function testSequenceEngine() {
  console.log('\n🔄 Testing Sequence Engine...');
  
  try {
    // Test sequence creation
    const sequence = await sequenceEngine.getOrCreateSequence('welcome');
    logTest('Sequence Creation', !!sequence.id, `Sequence ID: ${sequence.id}`);
    
    // Test statistics
    const stats = await healthCheck.getStatistics();
    logTest('Statistics API', !!stats, 'Statistics retrieved');
    
  } catch (error) {
    logTest('Sequence Engine', false, error.message);
  }
}

async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  
  try {
    const health = await healthCheck.checkHealth();
    logTest('Health Check', health.status === 'healthy', `Status: ${health.status}`);
    
    const isReady = await healthCheck.isReady();
    logTest('System Ready', isReady, isReady ? 'System ready' : 'System not ready');
    
  } catch (error) {
    logTest('Health Check', false, error.message);
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 HingeCraft ML Automation System - System Tests');
  console.log('═══════════════════════════════════════════════════════');
  
  await testDatabase();
  await testLeadProcessing();
  await testHubSpot();
  await testAnymail();
  await testSequenceEngine();
  await testHealthCheck();
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 Test Summary');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`⏭️  Skipped: ${tests.skipped}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (tests.failed === 0) {
    console.log('🎉 All tests PASSED!');
    console.log('✅ System is fully functional.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests FAILED!');
    console.log('Please review the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
});
