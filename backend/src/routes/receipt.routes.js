const express = require('express');
const receiptController = require('../controllers/receipt.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// Health check
router.get('/health', receiptController.healthCheck);

// Analytics endpoint (auth optional to compute per-user when available)
router.get('/analytics', optionalAuth, receiptController.getAnalytics);

// Upload and process receipt (auth optional: attach user if provided)
router.post('/upload', optionalAuth, (req, res, next) => {
  // Get upload middleware from app locals
  const upload = req.app.locals.upload;
  upload.single('receipt')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: 'File upload failed',
        message: err.message
      });
    }
    next();
  });
}, receiptController.uploadReceipt);

// Temporary test upload without auth (REMOVE IN PRODUCTION)
router.post('/upload-test', (req, res, next) => {
  // Add fake user for testing
  req.user = { _id: 'test-user-id' };
  
  const upload = req.app.locals.upload;
  upload.single('receipt')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: 'File upload failed',
        message: err.message
      });
    }
    next();
  });
}, receiptController.uploadReceipt);

// Alias for upload-testing to mirror main route without auth (dev convenience)
router.post('/test-upload', (req, res, next) => {
  req.user = { _id: 'test-user-id' };
  const upload = req.app.locals.upload;
  upload.single('receipt')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload failed', message: err.message });
    }
    next();
  });
}, receiptController.uploadReceipt);

// Get all receipts (optional auth - shows user's receipts if authenticated, all if not)
router.get('/', optionalAuth, receiptController.getReceipts);

// Get specific receipt (authentication required for user's receipts)
router.get('/:id', authenticateToken, receiptController.getReceiptById);

// Get receipt image (auth optional to ease viewing in browser)
router.get('/:id/image', optionalAuth, receiptController.getReceiptImage);

// Delete receipt (authentication required)
router.delete('/:id', authenticateToken, receiptController.deleteReceipt);

module.exports = router;