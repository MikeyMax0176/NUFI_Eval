// In-memory request counter for tracking trial API usage
let stats = {
  totalRequests: 0,
  enrichmentRequests: 0,
  blacklistRequests: 0,
  errors: 0,
  startTime: new Date().toISOString()
};

const requestCounter = (req, res, next) => {
  // Track all API requests
  if (req.path.startsWith('/api/nufi')) {
    stats.totalRequests++;
    
    // Track by endpoint type
    if (req.path.includes('enrichment')) {
      stats.enrichmentRequests++;
    } else if (req.path.includes('blacklist')) {
      stats.blacklistRequests++;
    }
  }
  
  // Intercept response to track errors
  const originalSend = res.send;
  res.send = function (data) {
    if (res.statusCode >= 400) {
      stats.errors++;
    }
    originalSend.call(this, data);
  };
  
  next();
};

const getStats = () => {
  return {
    ...stats,
    uptime: Math.floor((Date.now() - new Date(stats.startTime).getTime()) / 1000)
  };
};

const resetStats = () => {
  stats = {
    totalRequests: 0,
    enrichmentRequests: 0,
    blacklistRequests: 0,
    errors: 0,
    startTime: new Date().toISOString()
  };
};

module.exports = { requestCounter, getStats, resetStats };
