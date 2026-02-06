/**
 * Test suite for Professional Word Document Generation
 * Validates document structure, formatting, and content quality
 */

const { generateDocument, sanitizeContent, formatPhoneNumber } = require('../services/docxGenerator');
const { sanitizeForDocument, validateDocumentData } = require('../utils/documentUtils');
const fs = require('fs');
const path = require('path');

// Test fixture data
const mockPhoneEnrichmentData = {
  data: {
    status: 'success',
    code: 200,
    message: 'Data found',
    data: {
      query: {
        phones: [
          {
            country_code: 52,
            number: 6671056185,
            display: '667 105 6185',
            display_international: '+52 667 105 6185'
          }
        ]
      },
      person: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        location: 'Culiacán, Sinaloa, Mexico',
        social_profiles: [
          { network: 'Facebook', url: 'https://facebook.com/johndoe' },
          { network: 'LinkedIn', url: 'https://linkedin.com/in/johndoe' }
        ]
      },
      traffic_volume: {
        total_calls: 245,
        incoming: 120,
        outgoing: 125,
        total_duration: '1230 minutes'
      },
      top_counterparties: [
        { rank: 1, number: '+52 668 123 4567', total: 45, mo: 20, mt: 25, duration: '180 mins', first_seen: '2026-01-15', last_seen: '2026-02-01' },
        { rank: 2, number: '+52 667 987 6543', total: 38, mo: 18, mt: 20, duration: '150 mins', first_seen: '2026-01-18', last_seen: '2026-01-31' }
      ],
      device_profile: {
        manufacturer: 'Apple',
        model: 'iPhone 14 Pro',
        os: 'iOS 17.2',
        imei: '***hidden***'
      },
      locations: [
        { city: 'Culiacán', state: 'Sinaloa', country: 'Mexico', frequency: 180 },
        { city: 'Mazatlán', state: 'Sinaloa', country: 'Mexico', frequency: 45 }
      ]
    }
  },
  metadata: {
    endpoint: 'enrichment-phone',
    paramsUsed: ['telefono'],
    timestamp: '2026-02-03T10:30:00Z'
  }
};

// Test 1: Document Generation
async function testDocumentGeneration() {
  console.log('\n=== Test 1: Document Generation ===');
  
  try {
    const buffer = await generateDocument(
      mockPhoneEnrichmentData.data,
      'Phone Enrichment Test',
      '526671056185',
      { ...mockPhoneEnrichmentData.metadata, caseId: 'TEST-001' }
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
    
    const outputPath = path.join(outputDir, 'test_phone_enrichment_report.docx');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Test document saved: ${outputPath}`);
    
    return { success: true, buffer, outputPath };
  } catch (error) {
    console.error('✗ Document generation failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 2: Sanitization
function testSanitization() {
  console.log('\n=== Test 2: Content Sanitization ===');
  
  const dirtyData = {
    brandBlocks: ['Blueline | Global Technologies / ITERATIVE TASKING', 'Blueline | Global Technologies / ITERATIVE TASKING'],
    content: 'IMPORTANT INFORMATION ABOUT THE REPORT\n\n\n\n\nMultiple blank lines above',
    bullets: '- Item 1\n* Item 2\n▪ Item 3'
  };
  
  try {
    const sanitized = sanitizeContent(dirtyData);
    
    // Check brand blocks removed
    if (sanitized.brandBlocks) {
      throw new Error('Brand blocks not removed');
    }
    console.log('✓ Duplicate brand blocks removed');
    
    // Check sanitization occurred
    const cleanData = sanitizeForDocument(dirtyData.content);
    console.log('✓ Content sanitization completed');
    
    return { success: true };
  } catch (error) {
    console.error('✗ Sanitization failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 3: Phone Number Formatting
function testPhoneFormatting() {
  console.log('\n=== Test 3: Phone Number Formatting ===');
  
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

// Test 4: Data Validation
function testDataValidation() {
  console.log('\n=== Test 4: Data Validation ===');
  
  const testCases = [
    { data: mockPhoneEnrichmentData.data, apiName: 'Test API', shouldPass: true },
    { data: {}, apiName: 'Test API', shouldPass: false },
    { data: null, apiName: 'Test API', shouldPass: false },
    { data: mockPhoneEnrichmentData.data, apiName: '', shouldPass: false }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(({ data, apiName, shouldPass }, index) => {
    const result = validateDocumentData(data, apiName);
    
    if (result.isValid === shouldPass) {
      console.log(`✓ Test case ${index + 1} passed (valid: ${result.isValid})`);
      passed++;
    } else {
      console.error(`✗ Test case ${index + 1} failed (expected valid: ${shouldPass}, got: ${result.isValid})`);
      console.error(`  Errors: ${result.errors.join(', ')}`);
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
    const result = await testDocumentGeneration();
    
    if (!result.success) {
      throw new Error('Could not generate document for structure test');
    }
    
    // Basic checks on the buffer
    const buffer = result.buffer;
    
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

// Run all tests
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Professional Word Document Generator - Test Suite   ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Run tests
  const tests = [
    { name: 'Document Generation', fn: testDocumentGeneration },
    { name: 'Content Sanitization', fn: testSanitization },
    { name: 'Phone Formatting', fn: testPhoneFormatting },
    { name: 'Data Validation', fn: testDataValidation },
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
  testDocumentGeneration,
  testSanitization,
  testPhoneFormatting,
  testDataValidation,
  testDocumentStructure
};
