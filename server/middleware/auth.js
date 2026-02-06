const bcrypt = require('bcryptjs');

// In-memory user store (for production, use a database)
// Store username -> {passwordHash, name, role}
const users = new Map();

/**
 * Initialize default users from environment variables
 * Format: USERNAME:PASSWORD:NAME:ROLE
 */
const initializeUsers = () => {
  const userConfig = process.env.AUTHORIZED_USERS;
  
  if (!userConfig) {
    console.warn('[AUTH] No AUTHORIZED_USERS configured. Authentication disabled.');
    return;
  }

  const userEntries = userConfig.split(',');
  for (const entry of userEntries) {
    const [username, password, name, role] = entry.trim().split(':');
    if (username && password) {
      const passwordHash = bcrypt.hashSync(password, 10);
      users.set(username.toLowerCase(), {
        passwordHash,
        name: name || username,
        role: role || 'user'
      });
      console.log(`[AUTH] User registered: ${username} (${name || username})`);
    }
  }
};

/**
 * Authentication middleware
 * Checks if user is logged in via session
 */
const requireAuth = (req, res, next) => {
  // Skip auth if no users configured (development mode)
  if (users.size === 0) {
    return next();
  }

  if (req.session && req.session.user) {
    return next();
  }

  res.status(401).json({
    error: 'Authentication required',
    message: 'Please log in to access this resource'
  });
};

/**
 * Login handler
 */
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: 'Missing credentials',
      message: 'Username and password are required'
    });
  }

  const user = users.get(username.toLowerCase());
  
  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Invalid username or password'
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  
  if (!passwordMatch) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Invalid username or password'
    });
  }

  // Set session
  req.session.user = {
    username: username.toLowerCase(),
    name: user.name,
    role: user.role
  };

  res.json({
    success: true,
    user: {
      username: username.toLowerCase(),
      name: user.name,
      role: user.role
    }
  });
};

/**
 * Logout handler
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Logout failed',
        message: 'Failed to destroy session'
      });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
};

/**
 * Check session status
 */
const checkSession = (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      authenticated: true,
      user: req.session.user
    });
  } else {
    res.json({ authenticated: false });
  }
};

module.exports = {
  initializeUsers,
  requireAuth,
  login,
  logout,
  checkSession
};
