const authService = require('../services/auth.service');

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid access token'
      });
    }

    // Verify token and get user
    const user = await authService.getUserByToken(token);
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.message.includes('Invalid or expired')) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Your session has expired. Please log in again.'
      });
    }

    return res.status(403).json({
      error: 'Access forbidden',
      message: error.message
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is provided, but doesn't fail if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (token) {
      try {
        const user = await authService.getUserByToken(token);
        req.user = user;
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.warn('Optional auth - invalid token:', error.message);
      }
    }
    
    next();
  } catch (error) {
    // Even if there's an error, we continue without authentication
    console.error('Optional auth middleware error:', error);
    next();
  }
};

/**
 * Role-based access control middleware
 * Note: Current User model doesn't have roles, but this is prepared for future use
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    // For now, all authenticated users have access
    // In the future, you could add a 'role' field to the User model
    const userRole = req.user.role || 'user';
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * Rate limiting middleware (basic implementation)
 * In production, use a proper rate limiting library like express-rate-limit
 */
const createRateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requestCounts = new Map();

  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, data] of requestCounts.entries()) {
      if (data.resetTime < now) {
        requestCounts.delete(key);
      }
    }

    // Get current count for this identifier
    const currentData = requestCounts.get(identifier) || {
      count: 0,
      resetTime: now + windowMs
    };

    if (currentData.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((currentData.resetTime - now) / 1000)} seconds.`,
        retryAfter: Math.ceil((currentData.resetTime - now) / 1000)
      });
    }

    // Increment count
    currentData.count++;
    requestCounts.set(identifier, currentData);

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': maxRequests - currentData.count,
      'X-RateLimit-Reset': new Date(currentData.resetTime).toISOString()
    });

    next();
  };
};

/**
 * Validate request body middleware
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message,
        details: error.details
      });
    }

    req.validatedBody = value;
    next();
  };
};

/**
 * Validate query parameters middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        error: 'Query validation error',
        message: error.details[0].message,
        details: error.details
      });
    }

    req.validatedQuery = value;
    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  createRateLimit,
  validateBody,
  validateQuery
};