const axios = require('axios');
const { generateMockResponse } = require('./mockNufiService');

// NUFI API Base URL (Azure API Management)
const NUFI_BASE_URL = process.env.NUFI_API_BASE_URL || 'https://nufi.azure-api.net';

// Demo mode flag - set to true to use mock data without hitting real API
const USE_DEMO_MODE = process.env.NUFI_DEMO_MODE === 'true' || false;

// Validate API credentials
const validateCredentials = () => {
  const apiKey = process.env.NUFI_API_KEY;
  
  if (!apiKey) {
    throw new Error('NUFI API key not configured. Check your .env file.');
  }
  
  if (apiKey === 'your_api_key_here') {
    throw new Error('Please update NUFI_API_KEY in .env file with your actual API key.');
  }
  
  return { apiKey };
};

// Create axios instance with auth
const createNufiClient = () => {
  const { apiKey } = validateCredentials();
  
  return axios.create({
    baseURL: NUFI_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'NUFI-API-KEY': apiKey
    },
    timeout: 30000 // 30 second timeout for slow responses
  });
};

// Helper function to make API calls with automatic fallback to demo mode
const makeApiCall = async (endpoint, path, cleanParams, fallbackEndpoint) => {
  // If demo mode is explicitly enabled, use mock data
  if (USE_DEMO_MODE) {
    console.log(`[NUFI] DEMO MODE: Using mock data for ${fallbackEndpoint}`);
    return await generateMockResponse(fallbackEndpoint, cleanParams);
  }
  
  try {
    const client = createNufiClient();
    console.log(`[NUFI] ${fallbackEndpoint} request:`, { 
      paramCount: Object.keys(cleanParams).length,
      keys: Object.keys(cleanParams)
    });
    
    const response = await client.post(path, cleanParams);
    
    return {
      success: true,
      data: response.data,
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: fallbackEndpoint,
        paramsUsed: Object.keys(cleanParams)
      }
    };
  } catch (error) {
    // Check if it's a DNS/network/timeout error
    const networkErrors = ['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNABORTED', 'EHOSTUNREACH', 'ENETUNREACH'];
    if (networkErrors.includes(error.code) || error.message.includes('timeout')) {
      console.log(`[NUFI] API unreachable (${error.code}), falling back to DEMO MODE for ${fallbackEndpoint}`);
      const mockResult = await generateMockResponse(fallbackEndpoint, cleanParams);
      mockResult.metadata.fallbackReason = `API unreachable: ${error.message}`;
      return mockResult;
    }
    
    // For other errors, throw as before
    console.error(`[NUFI] ${fallbackEndpoint} API error:`, error.response?.data || error.message);
    throw {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
      details: error.response?.data
    };
  }
};

/**
 * General Data Enrichment API
 * Endpoint: /enriquecimientoidentidades/v3/enriquecimiento
 * Supported parameters based on NUFI documentation:
 * - rfc (RFC/Tax ID)
 * - curp (CURP)
 * - nombre (Name)
 * - apellidoPaterno (Paternal surname)
 * - apellidoMaterno (Maternal surname)
 * - fechaNacimiento (Birth date)
 * - entidadNacimiento (Birth state)
 */
const generalDataEnrichment = async (params) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value && value.trim() !== '') {
      acc[key] = value.trim();
    }
    return acc;
  }, {});
  
  if (Object.keys(cleanParams).length === 0) {
    throw new Error('At least one search parameter is required');
  }
  
  return await makeApiCall('enrichment', '/enriquecimientoidentidades/v3/enriquecimiento', cleanParams, 'enrichment');
};

/**
 * International Blacklists API
 * Endpoint: /listainternacional/v1/busqueda
 * Supported parameters based on NUFI documentation:
 * - nombre (Name)
 * - apellidoPaterno (Paternal surname)
 * - apellidoMaterno (Maternal surname)
 * - fechaNacimiento (Birth date)
 * - pais (Country code)
 */
const internationalBlacklist = async (params) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value && value.trim() !== '') {
      acc[key] = value.trim();
    }
    return acc;
  }, {});
  
  if (Object.keys(cleanParams).length === 0) {
    throw new Error('At least one search parameter is required');
  }
  
  return await makeApiCall('blacklist', '/listainternacional/v1/busqueda', cleanParams, 'blacklist');
};

/**
 * Data Enrichment by Phone
 * Endpoint: /enriquecimientoidentidades/v3/telefono
 * Internet search for possible names, emails, phone numbers, and social networks
 */
const enrichmentByPhone = async (params) => {
  const cleanParams = {};
  
  // Map 'phone' to 'telefono' for NUFI API
  if (params.phone && params.phone.trim() !== '') {
    cleanParams.telefono = params.phone.trim();
  }
  
  if (!cleanParams.telefono) {
    throw new Error('Phone number is required');
  }
  
  return await makeApiCall('enrichment-phone', '/enriquecimientoidentidades/v3/telefono', cleanParams, 'enrichment-phone');
};

/**
 * Data Enrichment by Email
 * Endpoint: /enriquecimientoidentidades/v3/correo
 * Internet search for possible names, emails, phone numbers, and social networks
 */
const enrichmentByEmail = async (params) => {
  const cleanParams = {};
  
  // Map 'email' to 'correo' for NUFI API
  if (params.email && params.email.trim() !== '') {
    cleanParams.correo = params.email.trim();
  }
  
  if (!cleanParams.correo) {
    throw new Error('Email address is required');
  }
  
  return await makeApiCall('enrichment-email', '/enriquecimientoidentidades/v3/correo', cleanParams, 'enrichment-email');
};

/**
 * Data Enrichment by Name
 * Endpoint: /enriquecimientoidentidades/v3/nombre
 * Internet search for possible names, emails, phone numbers, and social networks
 */
const enrichmentByName = async (params) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value && value.trim() !== '') {
      acc[key] = value.trim();
    }
    return acc;
  }, {});
  
  if (!cleanParams.nombre && !cleanParams.apellidoPaterno) {
    throw new Error('At least first name or paternal surname is required');
  }
  
  return await makeApiCall('enrichment-name', '/enriquecimientoidentidades/v3/nombre', cleanParams, 'enrichment-name');
};

/**
 * Contact Data Analysis and Profiling - Phone
 * Endpoint: /perfilamiento/v1/telefono
 * Analyze and profile contact data based on phone number
 */
const profilingPhone = async (params) => {
  const cleanParams = {};
  
  // Map 'phone' to 'telefono' for NUFI API
  if (params.phone && params.phone.trim() !== '') {
    cleanParams.telefono = params.phone.trim();
  }
  
  if (!cleanParams.telefono) {
    throw new Error('Phone number is required');
  }
  
  return await makeApiCall('profiling-phone', '/perfilamiento/v1/telefono', cleanParams, 'profiling-phone');
};

/**
 * Contact Data Analysis and Profiling - Email
 * Endpoint: /perfilamiento/v1/correo
 * Analyze and profile contact data based on email address
 */
const profilingEmail = async (params) => {
  const cleanParams = {};
  
  // Map 'email' to 'correo' for NUFI API
  if (params.email && params.email.trim() !== '') {
    cleanParams.correo = params.email.trim();
  }
  
  if (!cleanParams.correo) {
    throw new Error('Email address is required');
  }
  
  return await makeApiCall('profiling-email', '/perfilamiento/v1/correo', cleanParams, 'profiling-email');
};

/**
 * RENAPO - Obtain and Validate CURP
 * Endpoint: /renapo/v1/validacion
 * Validate CURP against the Mexican national population registry
 */
const renapo = async (params) => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value && value.trim() !== '') {
      acc[key] = value.trim();
    }
    return acc;
  }, {});
  
  if (!cleanParams.curp) {
    throw new Error('CURP is required');
  }
  
  return await makeApiCall('renapo-curp', '/renapo/v1/validacion', cleanParams, 'renapo-curp');
};

module.exports = {
  generalDataEnrichment,
  internationalBlacklist,
  enrichmentByPhone,
  enrichmentByEmail,
  enrichmentByName,
  profilingPhone,
  profilingEmail,
  renapo
};
