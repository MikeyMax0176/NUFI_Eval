const express = require('express');
const router = express.Router();
const { generateDocument } = require('../services/docxGenerator');

/**
 * POST /api/export/docx
 * Generate a professional Word document from NUFI API results
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

    // Generate the document
    const buffer = await generateDocument(data, apiName, phoneNumber, metadata || {});

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const phone = phoneNumber ? `_${phoneNumber}` : '';
    const docFilename = filename || `NUFI_Report_${apiName}${phone}_${timestamp}.docx`;

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
