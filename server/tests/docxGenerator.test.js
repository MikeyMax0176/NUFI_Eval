/**
 * Test suite for Professional Word Document Generation
 * Validates document structure, formatting, and content quality
 * Tests removal of vendor branding and sensitive fields
 */

const { generateDocument, sanitizeForDoc, formatPhoneNumber } = require('../services/docxGenerator');
const { sanitizeForDocument, validateDocumentData } = require('../utils/documentUtils');
const fs = require('fs');
const path = require('path');

// Test fixture data - Enrichment Phone response
const mockPhoneEnrichmentData = {
  data: {
    query: {
      phones: [
        {
          country_code: 52,
          number: '+526671059517',
          raw: '+52 667 105 9517',
          display: '667 105 9517',
          display_international: '+52 667 105 9517'
        }
      ],
      timestamp: '2026-02-06T10:30:00Z'
    },
    names: [
      {
        display: 'Juan Pérez García',
        first: 'Juan',
        middle: '',
        last: 'Pérez García',
        valid_since: '2020-01-15',
        last_seen: '2026-02-05'
      }
    ],
    phones: [
      {
        number: '+526671059517',
        display: '667 105 9517',
        display_international: '+52 667 105 9517',
        type: 'mobile',
        carrier: 'Telcel',
        valid_since: '2020-01-15',
        last_seen: '2026-02-05'
      }
    ],
    emails: [
      {
        address: 'juan.perez@example.com',
        type: 'personal',
        valid_since: '2021-03-10',
        last_seen: '2026-01-20'
      }
    ],
    addresses: [
      {
        display: 'Av. Insurgentes 123, Culiacán',
        city: 'Culiacán',
        state: 'Sinaloa',
        country: 'MX',
        valid_since: '2020-05-01',
        last_seen: '2025-12-15'
      }
    ],
    gender: 'male',
    languages: [
      { language: 'Spanish', region: 'es' }
    ],
    // These fields should be REMOVED by sanitization
    quota_allotted: 1000,
    quota_current: 750,
    quota_reset: '2026-03-01',
    qps_allotted: 10,
    qps_current: 3,
    '@search_pointer': 'abc123',
    'email_md5': 'd41d8cd98f00b204e9800998ecf8427e',
    endpoint: 'enrichment-phone'
  },
  metadata: {
    endpoint: 'enrichment-phone',
    paramsUsed: ['phones'],
    timestamp: '2026-02-06T10:30:00Z'
  }
};

// Test 1: Sanitization - Verify removed fields
function testSanitization() {
  console.log('\n=== Test 1: Data Sanitization ===');
  
  try {
    const sanitized = sanitizeForDoc(mockPhoneEnrichmentData.data);
    
    // Check that prohibited fields are removed
    const prohibitedFields = [
      'quota_allotted',
      'quota_current',
      'quota_reset',
      'qps_allotted',
      'qps_current',
      '@search_pointer',
      'email_md5',
      'endpoint'
    ];
    
    const foundFields = [];
    const checkObject = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;
      
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        
        if (prohibitedFields.includes(key)) {
          foundFields.push(fullPath);
        }
        
        if (typeof value === 'object' && value !== null) {
          checkObject(value, fullPath);
        }
      }
    };
    
    checkObject(sanitized);
    
    if (foundFields.length > 0) {
      console.error('✗ Sanitization failed: Found prohibited fields:', foundFields);
      return { success: false, error: `Found prohibited fields: ${foundFields.join(', ')}` };
    }
    
    console.log('✓ All prohibited fields removed successfully');
    console.log('✓ Data sanitization passed');
    
    return { success: true, sanitized };
  } catch (error) {
    console.error('✗ Sanitization test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 2: Document Generation
async function testDocumentGeneration() {
  console.log('\n=== Test 2: Document Generation ===');
  
  try {
    const buffer = await generateDocument(
      mockPhoneEnrichmentData.data,
      'Enrichment_Phone',
      '+526671059517',
      mockPhoneEnrichmentData.metadata
    );
    
    if (!buffer || buffer.length === 0) {
      throw new Error('Generated document buffer is empty');
    }
    
    console.log('✓ Document generated successfully');
    console.log(`✓ Document size: ${buffer.length} bytes`);
    
    // Save to test output
    const outputDir = path.join(__dirname, '../../test-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'Enrichment_Report_526671059517.docx');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Test document saved: ${outputPath}`);
    
    return { success: true, buffer, outputPath };
  } catch (error) {
    console.error('✗ Document generation failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 3: Verify Vendor Strings Removed
async function testVendorStringRemoval() {
  console.log('\n=== Test 3: Vendor String Removal ===');
  
  try {
    const buffer = await generateDocument(
      mockPhoneEnrichmentData.data,
      'Enrichment_Phone',
      '+526671059517',
      mockPhoneEnrichmentData.metadata
    );
    
    // Convert buffer to string for text search
    // Note: This is a basic check. A full XML parse would be more thorough.
    const bufferStr = buffer.toString('utf8');
    
    const prohibitedStrings = [
      'Blueline',
      'Global Technologies',
      'ITERATIVE TASKING',
      'NUFI API Report',
      'NUFI',
      'INTERNAL USE ONLY',
      'CONFIDENTIAL',
      'Table of Contents',
      'API Endpoint',
      'enrichment-phone',
      'Guardian Fusion'
    ];
    
    const foundStrings = [];
    prohibitedStrings.forEach(str => {
      // Case-insensitive search
      if (bufferStr.toLowerCase().includes(str.toLowerCase())) {
        foundStrings.push(str);
      }
    });
    
    if (foundStrings.length > 0) {
      console.error('✗ Found prohibited vendor strings in document:', foundStrings);
      return { success: false, error: `Found prohibited strings: ${foundStrings.join(', ')}` };
    }
    
    console.log('✓ No vendor or branding strings found in document');
    console.log('✓ Document is properly sanitized');
    
    return { success: true };
  } catch (error) {
    console.error('✗ Vendor string removal test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 4: Phone Number Formatting
function testPhoneFormatting() {
  console.log('\n=== Test 4: Phone Number Formatting ===');
  
  const testCases = [
    { input: '526671056185', expected: '+52 667 105 6185' },
    { input: '6671056185', expected: '667 105 6185' },
    { input: '+52 667 105 6185', expected: '+52 667 105 6185' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(({ input, expected }) => {
    const result = formatPhoneNumber(input);
    if (result === expected) {
      console.log(`✓ ${input} → ${result}`);
      passed++;
    } else {
      console.error(`✗ ${input} → ${result} (expected ${expected})`);
      failed++;
    }
  });
  
  return { success: failed === 0, passed, failed };
}

// Test 5: Document Structure Assertions
async function testDocumentStructure() {
  console.log('\n=== Test 5: Document Structure ===');
  
  try {
    // Generate a test document
    const buffer = await generateDocument(
      mockPhoneEnrichmentData.data,
      'Enrichment_Phone',
      '+526671059517',
      mockPhoneEnrichmentData.metadata
    );
    
    if (!buffer || buffer.length === 0) {
      throw new Error('Could not generate document for structure test');
    }
    
    // Check that it's a valid zip file (docx is a zip)
    const header = buffer.slice(0, 4);
    if (header[0] !== 0x50 || header[1] !== 0x4B) {
      throw new Error('Generated file is not a valid ZIP/DOCX file');
    }
    console.log('✓ Document is valid DOCX format (ZIP signature found)');
    
    // Check file size is reasonable (should be > 10KB)
    if (buffer.length < 10000) {
      throw new Error('Document size suspiciously small');
    }
    console.log(`✓ Document size is reasonable (${(buffer.length / 1024).toFixed(1)} KB)`);
    
    return { success: true };
  } catch (error) {
    console.error('✗ Document structure test failed:', error.message);
    return { success: false, error: error.message };
  }
}

//Run all tests
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Enrichment Report Document Generator - Test Suite   ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Run tests
  const tests = [
    { name: 'Data Sanitization', fn: testSanitization },
    { name: 'Document Generation', fn: testDocumentGeneration },
    { name: 'Vendor String Removal', fn: testVendorStringRemoval },
    { name: 'Phone Formatting', fn: testPhoneFormatting },
    { name: 'Document Structure', fn: testDocumentStructure }
  ];
  
  for (const test of tests) {
    results.total++;
    const result = await test.fn();
    results.tests.push({ name: test.name, ...result });
    
    if (result.success) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    Test Summary                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed} ✓`);
  console.log(`Failed: ${results.failed} ${results.failed > 0 ? '✗' : ''}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    results.tests.filter(t => !t.success).forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
  }
  
  console.log('\n');
  
  return results;
}

// Run if called directly
if (require.main === module) {
  runAllTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testSanitization,
  testDocumentGeneration,
  testVendorStringRemoval,
  testPhoneFormatting,
  testDocumentStructure
};
