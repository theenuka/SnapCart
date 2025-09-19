const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticateToken, createRateLimit } = require('../middleware/auth.middleware');

const router = express.Router();

// Rate limiting for auth endpoints - More permissive for development
const authRateLimit = process.env.NODE_ENV === 'production' 
  ? createRateLimit(15 * 60 * 1000, 5)  // 5 requests per 15 minutes in production
  : createRateLimit(60 * 1000, 50);     // 50 requests per minute in development
const generalRateLimit = createRateLimit(15 * 60 * 1000, 1000); // 1000 requests per 15 minutes

// Public routes (no authentication required)
router.post('/register', authRateLimit, userController.register);
router.post('/login', authRateLimit, userController.login);
router.post('/refresh-token', authRateLimit, userController.refreshToken);
// Simple test route for connectivity checks
router.get('/test', (req, res) => res.json({ success: true, message: 'Auth route OK' }));

// Protected routes (authentication required)
router.use(authenticateToken); // All routes below this line require authentication

// User profile routes
router.get('/profile', generalRateLimit, userController.getProfile);
router.put('/profile', generalRateLimit, userController.updateProfile);
router.get('/stats', generalRateLimit, userController.getUserStats);

// Account management routelsof -i :3001
s
router.put('/change-password', authRateLimit, userController.changePassword);
router.post('/logout', generalRateLimit, userController.logout);
router.delete('/account', authRateLimit, userController.deleteAccount);

module.exports = router;