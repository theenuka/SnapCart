const express = require('express');
const receiptController = require('../controllers/receipt.controller');

const router = express.Router();

// Health check
router.get('/health', receiptController.healthCheck);

// Analytics endpoint (should come before /:id routes)
router.get('/analytics', receiptController.getAnalytics);

// Upload and process receipt
router.post('/upload', (req, res, next) => {
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

// Get all receipts
router.get('/', receiptController.getReceipts);

// Get specific receipt
router.get('/:id', receiptController.getReceiptById);

// Get receipt image
router.get('/:id/image', receiptController.getReceiptImage);

// Delete receipt
router.delete('/:id', receiptController.deleteReceipt);

module.exports = router;