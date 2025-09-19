const vision = require('@google-cloud/vision');
const fs = require('fs').promises;

class OCRService {
  constructor() {
    // Initialize Google Vision client
    try {
      this.client = new vision.ImageAnnotatorClient({
        // This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
        // or you can specify keyFilename directly
      });
      this.useGoogleVision = true;
    } catch (error) {
      console.warn('Google Vision API not configured, using fallback methods');
      this.useGoogleVision = false;
    }
  }

  /**
   * Extract text from an image using OCR
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<string>} - Extracted text
   */
  async extractText(imagePath) {
    try {
      if (this.useGoogleVision) {
        return await this.extractWithGoogleVision(imagePath);
      } else {
        return await this.extractWithFallback(imagePath);
      }
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Extract text using Google Vision API
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<string>} - Extracted text
   */
  async extractWithGoogleVision(imagePath) {
    try {
      const [result] = await this.client.textDetection(imagePath);
      const detections = result.textAnnotations;
      
      if (detections && detections.length > 0) {
        return detections[0].description;
      }
      
      return '';
    } catch (error) {
      console.error('Google Vision API error:', error);
      throw error;
    }
  }

  /**
   * Fallback OCR method (for development/testing)
   * In a real implementation, you might use Tesseract.js or another OCR library
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<string>} - Mock extracted text
   */
  async extractWithFallback(imagePath) {
    // This is a mock implementation for development
    // In a real scenario, you'd implement Tesseract.js or another OCR solution
    console.log(`Mock OCR processing: ${imagePath}`);
    
    // Return mock receipt data for testing
    return `GROCERY STORE
123 Main St
City, State 12345

Date: 2024-01-15

ITEMS:
Milk 2%           $3.99
Bread Wheat       $2.49
Bananas          $1.99
Chicken Breast   $8.99
Total Tax         $0.83
TOTAL            $18.29

Thank you for shopping!`;
  }

  /**
   * Check if Google Vision API is available
   * @returns {boolean}
   */
  isGoogleVisionAvailable() {
    return this.useGoogleVision;
  }
}

module.exports = new OCRService();