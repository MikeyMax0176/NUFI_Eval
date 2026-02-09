const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const nufiRoutes = require('./routes/nufi');
const exportRoutes = require('./routes/export');
const { requestCounter } = require('./middleware/requestCounter');
const { initializeUsers, requireAuth, login, logout, checkSession } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Initialize users from environment
initializeUsers();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API server
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true, // Allow cookies for session
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isProduction ? 'strict' : 'lax'
  }
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // Limit requests per window
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(express.json({ limit: '50mb' })); // Increase limit for large data exports
app.use(requestCounter);

// Public routes (no authentication required)
app.post('/api/auth/login', login);
app.post('/api/auth/logout', logout);
app.get('/api/auth/session', checkSession);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'MX Enrichment API Server',
    status: 'running',
    environment: NODE_ENV,
    endpoints: {
      health: '/api/health',
      stats: '/api/stats',
      auth: '/api/auth/login'
    }
  });
});

// Protected routes (authentication required)
app.use('/api/nufi', apiLimiter, requireAuth, nufiRoutes);
app.use('/api/export', apiLimiter, requireAuth, exportRoutes);
app.get('/api/stats', requireAuth, (req, res) => {
  const stats = require('./middleware/requestCounter').getStats();
  res.json(stats);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MX Enrichment Server running on port ${PORT}`);
  console.log(`📊 API Stats available at http://localhost:${PORT}/api/stats`);
});
