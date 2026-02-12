const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const nufiRoutes = require('./routes/nufi');
const { requestCounter } = require('./middleware/requestCounter');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestCounter);

// Routes
app.use('/api/nufi', nufiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Guardian Fusion API Server',
    status: 'running',
    endpoints: {
      health: '/api/health',
      stats: '/api/stats',
      evaluate: '/api/nufi/evaluate'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Request counter endpoint
app.get('/api/stats', (req, res) => {
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
  console.log(`🚀 Guardian Fusion Server running on port ${PORT}`);
  console.log(`📊 API Stats available at http://localhost:${PORT}/api/stats`);
});
