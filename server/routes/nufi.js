const express = require('express');
const router = express.Router();
const { 
  generalDataEnrichment, 
  internationalBlacklist,
  enrichmentByPhone,
  enrichmentByEmail,
  enrichmentByName,
  profilingPhone,
  profilingEmail,
  renapo
} = require('../services/nufiService');

// General Data Enrichment endpoint
router.post('/enrichment', async (req, res, next) => {
  try {
    const result = await generalDataEnrichment(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.error || error.message,
      details: error.details
    });
  }
});

// International Blacklist endpoint
router.post('/blacklist', async (req, res, next) => {
  try {
    const result = await internationalBlacklist(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.error || error.message,
      details: error.details
    });
  }
});

// Data Enrichment by Phone endpoint
router.post('/enrichment/phone', async (req, res, next) => {
  try {
    const result = await enrichmentByPhone(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.error || error.message,
      details: error.details
    });
  }
});

// Data Enrichment by Email endpoint
router.post('/enrichment/email', async (req, res, next) => {
  try {
    const result = await enrichmentByEmail(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.error || error.message,
      details: error.details
    });
  }
});

// Data Enrichment by Name endpoint
router.post('/enrichment/name', async (req, res, next) => {
  try {
    const result = await enrichmentByName(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.error || error.message,
      details: error.details
    });
  }
});

// Contact Profiling by Phone endpoint
router.post('/profiling/phone', async (req, res, next) => {
  try {
    const result = await profilingPhone(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.error || error.message,
      details: error.details
    });
  }
});

// Contact Profiling by Email endpoint
router.post('/profiling/email', async (req, res, next) => {
  try {
    const result = await profilingEmail(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.error || error.message,
      details: error.details
    });
  }
});

// RENAPO CURP Validation endpoint
router.post('/renapo/curp', async (req, res, next) => {
  try {
    const result = await renapo(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.error || error.message,
      details: error.details
    });
  }
});

module.exports = router;
