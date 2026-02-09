const express = require('express');
const router = express.Router();
const { generateDocument } = require('../services/docxGenerator');

/**
 * POST /api/export/docx
 * Generate a professional Word document from API results
 * 
 * Body parameters:
 * - data: The API response data
 * - apiName: Name of the API endpoint
 * - phoneNumber: (optional) Phone number being queried
 * - metadata: (optional) Additional metadata
 * - filename: (optional) Custom filename
 */
router.post('/docx', async (req, res) => {
  try {
    const { data, apiName, phoneNumber, metadata, filename } = req.body;

    if (!data || !apiName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: data and apiName are required'
      });
    }

    console.log(`[DOCX Export] Generating document for ${apiName}${phoneNumber ? ' - ' + phoneNumber : ''}`);
    console.log('[DOCX Export] Data structure received:', JSON.stringify({
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
      hasDataData: !!(data && data.data),
      dataDataKeys: (data && data.data) ? Object.keys(data.data) : [],
      hasPersonDirect: !!(data && data.person),
      hasPersonNested: !!(data && data.data && data.data.person)
    }, null, 2));

    // Generate the document
    const buffer = await generateDocument(data, apiName, phoneNumber, metadata || {});

    // Extract selector from data for filename
    let selector = '';
    
    // Try to extract from query.phones
    if (data.query && data.query.phones && data.query.phones.length > 0) {
      const phone = data.query.phones[0];
      selector = phone.display_international || phone.display || phone.number || phone.raw || phone;
      // Clean up selector
      if (typeof selector === 'number') selector = String(selector);
      selector = selector.replace(/\+/g, '').replace(/\s+/g, '');
    } 
    // Fallback to phoneNumber parameter
    else if (phoneNumber) {
      selector = String(phoneNumber).replace(/\+/g, '').replace(/\s+/g, '');
    }
    // Try person.phones if available
    else if (data.person && data.person.phones && data.person.phones.length > 0) {
      const phone = data.person.phones[0];
      selector = phone.display_international || phone.display || phone.number || phone;
      if (typeof selector === 'number') selector = String(selector);
      selector = selector.replace(/\+/g, '').replace(/\s+/g, '');
    }
    // Last resort: use provided phone or unknown
    else {
      selector = phoneNumber || 'Unknown';
    }
    
    // Sanitize selector for filename (remove special characters, limit length)
    const sanitizedSelector = String(selector)
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 50) || 'report';

    // Generate filename: selector followed by "Enrichment.docx"
    const docFilename = filename || `${sanitizedSelector} Enrichment.docx`;

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${docFilename}"`);
    res.setHeader('Content-Length', buffer.length);

    // Send the buffer
    res.send(buffer);

    console.log(`[DOCX Export] Successfully generated ${docFilename} (${buffer.length} bytes)`);
  } catch (error) {
    console.error('[DOCX Export] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate document',
      details: error.message
    });
  }
});

module.exports = router;
