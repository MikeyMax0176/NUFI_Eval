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
  // Valid parameters for General Data Enrichment
  const validKeys = ['rfc', 'curp', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'fechaNacimiento', 'entidadNacimiento'];
  
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    // Only include valid parameters for this endpoint
    if (validKeys.includes(key) && value && value.trim() !== '') {
      acc[key] = value.trim();
    }
    return acc;
  }, {});
  
  if (Object.keys(cleanParams).length === 0) {
    // Check if user provided phone or email (wrong API selected)
    if (params.phone || params.email) {
      throw new Error('Phone and Email are not valid for General Data Enrichment. Please select "Data Enrichment by Phone" or "Data Enrichment by Email" from the dropdown.');
    }
    throw new Error('At least one valid search parameter is required (RFC, CURP, Name, Birth Date, etc.)');
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
  // Valid parameters for International Blacklists
  const validKeys = ['nombre', 'apellidoPaterno', 'apellidoMaterno', 'fechaNacimiento', 'pais'];
  
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    // Only include valid parameters for this endpoint
    if (validKeys.includes(key) && value && value.trim() !== '') {
      acc[key] = value.trim();
    }
    return acc;
  }, {});
  
  if (Object.keys(cleanParams).length === 0) {
    // Check if user provided phone or email (wrong API selected)
    if (params.phone || params.email) {
      throw new Error('Phone and Email are not valid for International Blacklists. This API requires names and birth dates. Try "Data Enrichment by Phone/Email" instead.');
    }
    throw new Error('At least one valid search parameter is required (Name, Birth Date, Country)');
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
  // Valid parameters for Name Enrichment
  const validKeys = ['nombre', 'apellidoPaterno', 'apellidoMaterno'];
  
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    // Only include valid parameters for this endpoint
    if (validKeys.includes(key) && value && value.trim() !== '') {
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
 * RENAPO - Obtain and Validate CURP
 * Endpoint: /renapo/v1/validacion
 * Validate CURP against the Mexican national population registry
 */
const renapo = async (params) => {
  // Only accept CURP parameter for RENAPO
  const cleanParams = {};
  
  if (params.curp && params.curp.trim() !== '') {
    cleanParams.curp = params.curp.trim();
  }
  
  if (!cleanParams.curp) {
    throw new Error('CURP is required for RENAPO validation');
  }
  
  return await makeApiCall('renapo-curp', '/renapo/v1/validacion', cleanParams, 'renapo-curp');
};

/**
 * Phone Profiling - Contact Data Analysis and Profiling
 * Endpoint: /perfilamiento/v1/telefono
 * Analyze and profile contact data by phone number
 * Returns risk scores, carrier info, and behavioral analysis
 */
const profilingPhone = async (params) => {
  const cleanParams = {};
  
  // Map 'phone' to 'telefono' for NUFI API
  if (params.phone && params.phone.trim() !== '') {
    cleanParams.telefono = params.phone.trim();
  }
  
  if (!cleanParams.telefono) {
    throw new Error('Phone number is required for profiling');
  }
  
  return await makeApiCall('profiling-phone', '/perfilamiento/v1/telefono', cleanParams, 'profiling-phone');
};

/**
 * Email Profiling - Contact Data Analysis and Profiling
 * Endpoint: /perfilamiento/v1/correo
 * Analyze and profile contact data by email address
 * Returns risk scores, domain analysis, and behavioral data
 */
const profilingEmail = async (params) => {
  const cleanParams = {};
  
  // Map 'email' to 'correo' for NUFI API
  if (params.email && params.email.trim() !== '') {
    cleanParams.correo = params.email.trim();
  }
  
  if (!cleanParams.correo) {
    throw new Error('Email address is required for profiling');
  }
  
  return await makeApiCall('profiling-email', '/perfilamiento/v1/correo', cleanParams, 'profiling-email');
};

/**
 * CURP Calculation/Validation
 * Endpoint: /curp/v1/consulta
 * Calculate CURP from person data OR validate existing CURP
 * tipo_busqueda: "datos" (calculate) or "curp" (validate)
 */
const curpCalculation = async (params) => {
  const validKeys = ['tipo_busqueda', 'clave_entidad', 'dia_nacimiento', 'mes_nacimiento', 'nombres', 
                     'primer_apellido', 'segundo_apellido', 'anio_nacimiento', 'sexo', 'curp'];
  
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (validKeys.includes(key) && value && value.toString().trim() !== '') {
      acc[key] = value.toString().trim();
    }
    return acc;
  }, {});
  
  // Default to "datos" type if not specified
  if (!cleanParams.tipo_busqueda) {
    cleanParams.tipo_busqueda = cleanParams.curp ? 'curp' : 'datos';
  }
  
  if (cleanParams.tipo_busqueda === 'datos') {
    // Validate required fields for calculation
    const required = ['nombres', 'primer_apellido', 'dia_nacimiento', 'mes_nacimiento', 'anio_nacimiento', 'sexo', 'clave_entidad'];
    const missing = required.filter(field => !cleanParams[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields for CURP calculation: ${missing.join(', ')}`);
    }
  } else if (cleanParams.tipo_busqueda === 'curp') {
    if (!cleanParams.curp) {
      throw new Error('CURP is required for validation');
    }
  }
  
  return await makeApiCall('curp-calculation', '/curp/v1/consulta', cleanParams, 'curp-calculation');
};

module.exports = {
  generalDataEnrichment,
  internationalBlacklist,
  enrichmentByPhone,
  enrichmentByEmail,
  enrichmentByName,
  renapo,
  profilingPhone,
  profilingEmail,
  curpCalculation
};
