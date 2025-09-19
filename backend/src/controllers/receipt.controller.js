const receiptService = require('../services/receipt.service');
const path = require('path');
const fs = require('fs').promises;

class ReceiptController {
  /**
   * Upload and process a receipt image
   * POST /api/receipts/upload
   */
  async uploadReceipt(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: 'No image file provided',
          message: 'Please upload an image file'
        });
      }

      const imagePath = req.file.path;
      const userId = req.body.userId || null; // For demo, userId is optional

      console.log(`Processing receipt image: ${imagePath}`);

      // Process the receipt
      const processedReceipt = await receiptService.processReceipt(imagePath, userId);

      res.status(201).json({
        success: true,
        message: 'Receipt processed successfully',
        data: processedReceipt
      });

    } catch (error) {
      console.error('Upload receipt error:', error);
      
      // Clean up uploaded file if processing failed
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded file:', cleanupError);
        }
      }

      res.status(500).json({
        error: 'Failed to process receipt',
        message: error.message
      });
    }
  }

  /**
   * Get all receipts with optional filters
   * GET /api/receipts
   */
  async getReceipts(req, res) {
    try {
      const filters = {
        category: req.query.category,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        minAmount: req.query.minAmount,
        maxAmount: req.query.maxAmount,
        limit: parseInt(req.query.limit) || 50
      };

      const userId = req.query.userId;
      const receipts = await receiptService.getReceipts(userId, filters);

      res.json({
        success: true,
        count: receipts.length,
        data: receipts
      });

    } catch (error) {
      console.error('Get receipts error:', error);
      res.status(500).json({
        error: 'Failed to fetch receipts',
        message: error.message
      });
    }
  }

  /**
   * Get a specific receipt by ID
   * GET /api/receipts/:id
   */
  async getReceiptById(req, res) {
    try {
      const receiptId = req.params.id;
      const receipt = await receiptService.getReceiptById(receiptId);

      res.json({
        success: true,
        data: receipt
      });

    } catch (error) {
      console.error('Get receipt by ID error:', error);
      
      if (error.message === 'Receipt not found') {
        return res.status(404).json({
          error: 'Receipt not found',
          message: 'No receipt found with the provided ID'
        });
      }

      res.status(500).json({
        error: 'Failed to fetch receipt',
        message: error.message
      });
    }
  }

  /**
   * Delete a receipt
   * DELETE /api/receipts/:id
   */
  async deleteReceipt(req, res) {
    try {
      const receiptId = req.params.id;
      await receiptService.deleteReceipt(receiptId);

      res.json({
        success: true,
        message: 'Receipt deleted successfully'
      });

    } catch (error) {
      console.error('Delete receipt error:', error);
      
      if (error.message === 'Receipt not found') {
        return res.status(404).json({
          error: 'Receipt not found',
          message: 'No receipt found with the provided ID'
        });
      }

      res.status(500).json({
        error: 'Failed to delete receipt',
        message: error.message
      });
    }
  }

  /**
   * Get spending analytics
   * GET /api/receipts/analytics
   */
  async getAnalytics(req, res) {
    try {
      const options = {
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo
      };

      const userId = req.query.userId;
      const analytics = await receiptService.getSpendingAnalytics(userId, options);

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        error: 'Failed to generate analytics',
        message: error.message
      });
    }
  }

  /**
   * Get receipt image
   * GET /api/receipts/:id/image
   */
  async getReceiptImage(req, res) {
    try {
      const receiptId = req.params.id;
      const receipt = await receiptService.getReceiptById(receiptId);

      if (!receipt.imagePath) {
        return res.status(404).json({
          error: 'Image not found',
          message: 'No image associated with this receipt'
        });
      }

      // Check if file exists
      try {
        await fs.access(receipt.imagePath);
      } catch (error) {
        return res.status(404).json({
          error: 'Image file not found',
          message: 'The image file has been moved or deleted'
        });
      }

      // Get file extension for content type
      const ext = path.extname(receipt.imagePath).toLowerCase();
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif'
      }[ext] || 'image/jpeg';

      res.setHeader('Content-Type', contentType);
      res.sendFile(path.resolve(receipt.imagePath));

    } catch (error) {
      console.error('Get receipt image error:', error);
      
      if (error.message === 'Receipt not found') {
        return res.status(404).json({
          error: 'Receipt not found',
          message: 'No receipt found with the provided ID'
        });
      }

      res.status(500).json({
        error: 'Failed to fetch receipt image',
        message: error.message
      });
    }
  }

  /**
   * Health check endpoint
   * GET /api/receipts/health
   */
  async healthCheck(req, res) {
    try {
      res.json({
        success: true,
        message: 'Receipt service is running',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Service unhealthy',
        message: error.message
      });
    }
  }
}

module.exports = new ReceiptController();