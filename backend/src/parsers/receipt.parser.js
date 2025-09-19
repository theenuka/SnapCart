class ReceiptParsingService {
  constructor() {
    // Common store patterns for categorization
    this.storeCategories = {
      'groceries': ['grocery', 'market', 'food', 'supermarket', 'walmart', 'target', 'kroger', 'safeway', 'whole foods'],
      'restaurant': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'taco', 'mcdonald', 'subway', 'starbucks'],
      'gas': ['gas', 'fuel', 'shell', 'bp', 'exxon', 'chevron', 'mobil'],
      'pharmacy': ['pharmacy', 'cvs', 'walgreens', 'rite aid', 'drugstore'],
      'retail': ['store', 'shop', 'retail', 'amazon', 'best buy', 'costco']
    };
  }

  /**
   * Parse OCR text into structured receipt data
   * @param {string} ocrText - Raw text from OCR
   * @returns {Object} - Structured receipt data
   */
  parseReceipt(ocrText) {
    try {
      const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      const parsedData = {
        storeName: this.extractStoreName(lines),
        date: this.extractDate(lines),
        items: this.extractItems(lines),
        subtotal: null,
        tax: null,
        total: this.extractTotal(lines),
        category: 'other',
        paymentMethod: 'other'
      };

      // Auto-categorize based on store name
      parsedData.category = this.categorizeReceipt(parsedData.storeName);

      // Calculate subtotal if not found but total exists
      if (parsedData.total && parsedData.items.length > 0) {
        const itemsTotal = parsedData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        parsedData.subtotal = itemsTotal;
        parsedData.tax = Math.max(0, parsedData.total - itemsTotal);
      }

      return parsedData;
    } catch (error) {
      console.error('Error parsing receipt:', error);
      throw new Error('Failed to parse receipt data');
    }
  }

  /**
   * Extract store name from receipt lines
   * @param {Array<string>} lines - Receipt text lines
   * @returns {string} - Store name
   */
  extractStoreName(lines) {
    // Usually the first few lines contain the store name
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Skip lines that look like addresses or phone numbers
      if (!/^\d+/.test(line) && !/\d{3}-\d{3}-\d{4}/.test(line) && line.length > 2) {
        return line.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      }
    }
    return 'Unknown Store';
  }

  /**
   * Extract date from receipt lines
   * @param {Array<string>} lines - Receipt text lines
   * @returns {Date|null} - Parsed date
   */
  extractDate(lines) {
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,  // MM/dd/yyyy or MM/dd/yy
      /(\d{1,2}-\d{1,2}-\d{2,4})/,    // MM-dd-yyyy
      /(\d{4}-\d{2}-\d{2})/,          // yyyy-MM-dd
    ];

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          const dateStr = match[1];
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
    }
    
    return new Date(); // Default to current date if not found
  }

  /**
   * Extract items with prices from receipt lines
   * @param {Array<string>} lines - Receipt text lines
   * @returns {Array<Object>} - Array of items with name, price, quantity
   */
  extractItems(lines) {
    const items = [];
    const itemPattern = /^(.+?)\s+\$?(\d+\.?\d{0,2})$/;
    const priceOnlyPattern = /^\$?(\d+\.\d{2})$/;
    
    let currentItem = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip lines that are clearly headers or footers
      if (this.isHeaderOrFooter(line)) {
        continue;
      }
      
      // Try to match item with price on same line
      const itemMatch = line.match(itemPattern);
      if (itemMatch) {
        const name = itemMatch[1].trim();
        const price = parseFloat(itemMatch[2]);
        
        if (this.isValidItem(name) && price > 0 && price < 1000) {
          items.push({
            name: this.cleanItemName(name),
            price: price,
            quantity: 1
          });
        }
        continue;
      }
      
      // Check if this line is just a price (item name might be on previous line)
      const priceMatch = line.match(priceOnlyPattern);
      if (priceMatch && currentItem) {
        const price = parseFloat(priceMatch[1]);
        if (price > 0 && price < 1000) {
          items.push({
            name: this.cleanItemName(currentItem),
            price: price,
            quantity: 1
          });
          currentItem = null;
          continue;
        }
      }
      
      // If line doesn't contain a price, it might be an item name
      if (!priceMatch && this.isValidItem(line)) {
        currentItem = line;
      }
    }
    
    return items;
  }

  /**
   * Extract total amount from receipt lines
   * @param {Array<string>} lines - Receipt text lines
   * @returns {number|null} - Total amount
   */
  extractTotal(lines) {
    const totalPatterns = [
      /total\s*:?\s*\$?(\d+\.?\d{0,2})/i,
      /amount\s*:?\s*\$?(\d+\.?\d{0,2})/i,
      /^total\s+\$?(\d+\.\d{2})/i
    ];

    // Search from bottom up as total is usually near the end
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      
      for (const pattern of totalPatterns) {
        const match = line.match(pattern);
        if (match) {
          const amount = parseFloat(match[1]);
          if (amount > 0 && amount < 10000) { // Reasonable total range
            return amount;
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Categorize receipt based on store name
   * @param {string} storeName - Store name
   * @returns {string} - Category
   */
  categorizeReceipt(storeName) {
    const lowerStoreName = storeName.toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.storeCategories)) {
      for (const keyword of keywords) {
        if (lowerStoreName.includes(keyword)) {
          return category;
        }
      }
    }
    
    return 'other';
  }

  /**
   * Check if line is a header or footer (should be skipped)
   * @param {string} line - Text line
   * @returns {boolean}
   */
  isHeaderOrFooter(line) {
    const skipPatterns = [
      /thank you/i,
      /have a/i,
      /visit us/i,
      /www\./i,
      /phone|tel:/i,
      /address/i,
      /^-+$/,
      /^=+$/
    ];
    
    return skipPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Check if text is a valid item name
   * @param {string} text - Text to check
   * @returns {boolean}
   */
  isValidItem(text) {
    if (!text || text.length < 2) return false;
    
    // Skip lines that are clearly not items
    const invalidPatterns = [
      /^(subtotal|tax|total|amount|change|cash|credit|debit)/i,
      /^\d+$/,
      /^[^a-zA-Z]+$/,
      /cashier|register|transaction/i
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Clean and normalize item names
   * @param {string} name - Raw item name
   * @returns {string} - Cleaned item name
   */
  cleanItemName(name) {
    return name
      .replace(/[^\w\s]/g, ' ')  // Remove special characters
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase()); // Title case
  }
}

module.exports = new ReceiptParsingService();