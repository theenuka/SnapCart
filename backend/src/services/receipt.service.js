const Receipt = require('../models/Receipt');
const ocrService = require('./ocr.service');
const receiptParser = require('../parsers/receipt.parser');
const fs = require('fs').promises;

class ReceiptService {
  /**
   * Process a receipt image - extract text, parse data, and save to database
   * @param {string} imagePath - Path to the uploaded image
   * @param {string} userId - User ID (optional for demo)
   * @returns {Promise<Object>} - Processed receipt data
   */
  async processReceipt(imagePath, userId = null) {
    try {
      // Step 1: Extract text using OCR
      console.log('Extracting text from image...');
      const ocrText = await ocrService.extractText(imagePath);
      
      if (!ocrText || ocrText.trim().length === 0) {
        throw new Error('No text could be extracted from the image');
      }

      // Step 2: Parse the OCR text into structured data
      console.log('Parsing receipt data...');
      const parsedData = receiptParser.parseReceipt(ocrText);

      // Step 3: Create and save receipt record
      const receiptData = {
        ...parsedData,
        imagePath: imagePath,
        ocrText: ocrText,
        processingStatus: 'processed',
        userId: userId
      };

      const receipt = new Receipt(receiptData);
      await receipt.save();

      console.log('Receipt processed successfully:', receipt._id);
      
      return {
        id: receipt._id,
        ...receiptData,
        processingTime: new Date()
      };

    } catch (error) {
      console.error('Error processing receipt:', error);
      
      // Save failed receipt for debugging
      try {
        const failedReceipt = new Receipt({
          imagePath: imagePath,
          processingStatus: 'failed',
          ocrText: error.message,
          userId: userId,
          total: 0
        });
        await failedReceipt.save();
      } catch (saveError) {
        console.error('Failed to save error receipt:', saveError);
      }
      
      throw error;
    }
  }

  /**
   * Get all receipts for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters (category, dateRange, etc.)
   * @returns {Promise<Array>} - Array of receipts
   */
  async getReceipts(userId = null, filters = {}) {
    try {
      let query = {};
      
      if (userId) {
        query.userId = userId;
      }
      
      if (filters.category) {
        query.category = filters.category;
      }
      
      if (filters.dateFrom || filters.dateTo) {
        query.date = {};
        if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.date.$lte = new Date(filters.dateTo);
      }
      
      if (filters.minAmount || filters.maxAmount) {
        query.total = {};
        if (filters.minAmount) query.total.$gte = parseFloat(filters.minAmount);
        if (filters.maxAmount) query.total.$lte = parseFloat(filters.maxAmount);
      }

      const receipts = await Receipt.find(query)
        .sort({ date: -1 })
        .limit(filters.limit || 50);

      return receipts;
    } catch (error) {
      console.error('Error fetching receipts:', error);
      throw error;
    }
  }

  /**
   * Get a specific receipt by ID
   * @param {string} receiptId - Receipt ID
   * @returns {Promise<Object>} - Receipt data
   */
  async getReceiptById(receiptId) {
    try {
      const receipt = await Receipt.findById(receiptId);
      if (!receipt) {
        throw new Error('Receipt not found');
      }
      return receipt;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      throw error;
    }
  }

  /**
   * Delete a receipt
   * @param {string} receiptId - Receipt ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteReceipt(receiptId) {
    try {
      const receipt = await Receipt.findById(receiptId);
      if (!receipt) {
        throw new Error('Receipt not found');
      }

      // Delete the image file if it exists
      try {
        await fs.unlink(receipt.imagePath);
      } catch (fileError) {
        console.warn('Could not delete image file:', fileError.message);
      }

      await Receipt.findByIdAndDelete(receiptId);
      return true;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  }

  /**
   * Get spending analytics
   * @param {string} userId - User ID
   * @param {Object} options - Analytics options
   * @returns {Promise<Object>} - Analytics data
   */
  async getSpendingAnalytics(userId = null, options = {}) {
    try {
      const matchStage = {};
      if (userId) matchStage.userId = userId;
      
      // Date range filter
      if (options.dateFrom || options.dateTo) {
        matchStage.date = {};
        if (options.dateFrom) matchStage.date.$gte = new Date(options.dateFrom);
        if (options.dateTo) matchStage.date.$lte = new Date(options.dateTo);
      }

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$category',
            totalSpent: { $sum: '$total' },
            receiptCount: { $sum: 1 },
            avgSpent: { $avg: '$total' }
          }
        },
        { $sort: { totalSpent: -1 } }
      ];

      const categoryAnalytics = await Receipt.aggregate(pipeline);

      // Get monthly spending trend
      const monthlyPipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            totalSpent: { $sum: '$total' },
            receiptCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ];

      const monthlyTrend = await Receipt.aggregate(monthlyPipeline);

      return {
        categoryBreakdown: categoryAnalytics,
        monthlyTrend: monthlyTrend,
        totalReceipts: await Receipt.countDocuments(matchStage),
        totalSpent: categoryAnalytics.reduce((sum, cat) => sum + cat.totalSpent, 0)
      };
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw error;
    }
  }
}

module.exports = new ReceiptService();