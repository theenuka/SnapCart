class ReceiptParsingService {
  constructor() {
    // Common store patterns for categorization (including Sri Lankan stores)
    this.storeCategories = {
      'groceries': [
        'grocery', 'market', 'food', 'supermarket', 'walmart', 'target', 'kroger', 'safeway', 'whole foods',
        'cargills', 'keells', 'arpico', 'laugfs', 'spar', 'food city', 'convenience store'
      ],
      'restaurant': [
        'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'taco', 'mcdonald', 'subway', 'starbucks',
        'kfc', 'pizza hut', 'dominos', 'chinese dragon', 'hotel', 'bakery'
      ],
      'gas': ['gas', 'fuel', 'shell', 'bp', 'exxon', 'chevron', 'mobil', 'ceypetco', 'lanka ioc'],
      'pharmacy': ['pharmacy', 'cvs', 'walgreens', 'rite aid', 'drugstore', 'osusala', 'state pharmacy'],
      'retail': ['store', 'shop', 'retail', 'amazon', 'best buy', 'costco', 'fashion bug', 'odel', 'house of fashion']
    };
  }

  /**
   * Parse OCR text into structured receipt data
   * @param {string} ocrText - Raw text from OCR (could be from Gemini AI)
   * @returns {Object} - Structured receipt data
   */
  parseReceipt(ocrText) {
    try {
      const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      const parsedData = {
        storeName: this.extractStoreName(lines),
        date: this.extractDate(lines),
        items: this.extractItems(lines),
        subtotal: this.extractSubtotal(lines),
        tax: this.extractTax(lines),
        total: this.extractTotal(lines),
        category: 'other',
        paymentMethod: this.extractPaymentMethod(lines)
      };

      // Auto-categorize based on store name
      parsedData.category = this.categorizeReceipt(parsedData.storeName);

      // Calculate missing values if possible
      if (parsedData.total && parsedData.items.length > 0) {
        const itemsTotal = parsedData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (!parsedData.subtotal) {
          parsedData.subtotal = itemsTotal;
        }
        
        if (!parsedData.tax && parsedData.total > itemsTotal) {
          parsedData.tax = Math.max(0, parsedData.total - itemsTotal);
        }
      }

      // Ensure we have a valid total
      if (!parsedData.total) {
        if (parsedData.items.length > 0) {
          parsedData.total = parsedData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          if (parsedData.tax) parsedData.total += parsedData.tax
        } else if (parsedData.subtotal != null || parsedData.tax != null) {
          const sub = parsedData.subtotal || 0
          const tax = parsedData.tax || 0
          const candidate = sub + tax
          if (candidate > 0) parsedData.total = candidate
        }
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
   * Extract items with prices from receipt lines (Enhanced for Sri Lankan receipts)
   * @param {Array<string>} lines - Receipt text lines
   * @returns {Array<Object>} - Array of items with name, price, quantity
   */
  extractItems(lines) {
    const items = [];
    
    // Enhanced patterns for Sri Lankan receipts
    const itemPatterns = [
      // Pattern: "ITEM NAME    QTY    PRICE    AMOUNT"
      /^(.+?)\s+(\d+(?:[.,]\d{1,3})?)\s+(\d+(?:[.,]\d{2}))\s+(\d+(?:[.,]\d{2}))$/,
      // Pattern: "ITEM NAME    PRICE"
      /^(.+?)\s+(Rs\.?\s*)?(\d+(?:[.,]\d{2}))$/,
      // Pattern: "ITEM NAME    $PRICE"
      /^(.+?)\s+\$?(\d+(?:[.,]?\d{0,2}))$/,
      // Pattern with quantity: "1 ITEM NAME    PRICE"
      /^\d+\s+(.+?)\s+(Rs\.?\s*)?(\d+(?:[.,]\d{2}))$/
    ];
    
    let inItemSection = false;
    let currentItem = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Detect item section start
      if (/NO\s+ITEM|ITEM|QTY|PRICE|AMOUNT/i.test(line) && /\d+/.test(line)) {
        inItemSection = true;
        continue;
      }
      
      // Skip lines that are clearly headers or footers
      if (this.isHeaderOrFooter(line)) {
        inItemSection = false;
        continue;
      }
      
      // Stop processing items when we hit totals section
      if (/subtotal|total|tax|amount|change/i.test(line) && /\d+\.\d{2}/.test(line)) {
        inItemSection = false;
        continue;
      }
      
      // Only process items when we're in the item section
      if (inItemSection) {
        let matched = false;
        
        for (const pattern of itemPatterns) {
          const match = line.match(pattern);
          if (match) {
            let name, price, quantity = 1;
            
            if (match.length === 5) {
              // Full pattern with qty and amount
              name = match[1].trim();
              quantity = parseFloat(String(match[2]).replace(/,/g, '.')) || 1;
              price = parseFloat(String(match[4]).replace(/,/g, '')); // amount
            } else if (match.length === 4) {
              // Pattern with optional Rs. prefix
              name = match[1].trim();
              price = parseFloat(String(match[3]).replace(/,/g, ''));
            } else {
              // Simple pattern
              name = match[1].trim();
              price = parseFloat(String(match[2]).replace(/,/g, ''));
            }
            
            if (this.isValidItem(name) && price > 0 && price < 50000) {
              items.push({
                name: this.cleanItemName(name),
                price: price,
                quantity: quantity
              });
              matched = true;
              break;
            }
          }
        }
        
        // If no pattern matched but looks like an item, store for next line processing
        if (!matched && this.isValidItem(line)) {
          currentItem = line;
        } else if (currentItem) {
          // Check if current line is just a price for previous item
          const priceMatch = line.match(/^(Rs\.?\s*)?(\d+(?:[.,]\d{2}))$/);
          if (priceMatch) {
            const price = parseFloat(String(priceMatch[2]).replace(/,/g, ''));
            if (price > 0 && price < 50000) {
              items.push({
                name: this.cleanItemName(currentItem),
                price: price,
                quantity: 1
              });
            }
          }
          currentItem = null;
        }
      }
    }
    
    return items;
  }

  /**
   * Extract subtotal amount from receipt lines
   * @param {Array<string>} lines - Receipt text lines
   * @returns {number|null} - Subtotal amount
   */
  extractSubtotal(lines) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (/sub\s*-?\s*total/i.test(line)) {
        const amt = this.parseAmount(line)
        if (amt !== null && amt >= 0 && amt < 1000000) return amt
      }
    }
    return null
  }

  /**
   * Extract tax amount from receipt lines
   * @param {Array<string>} lines - Receipt text lines
   * @returns {number|null} - Tax amount
   */
  extractTax(lines) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i]
      if (/(tax|vat|gst)/i.test(line)) {
        const amt = this.parseAmount(line)
        if (amt !== null && amt >= 0 && amt < 100000) return amt
      }
    }
    return null
  }

  /**
   * Extract total amount from receipt lines (Enhanced for Sri Lankan receipts)
   * @param {Array<string>} lines - Receipt text lines
   * @returns {number|null} - Total amount
   */
  extractTotal(lines) {
    const strongKeys = [
      /grand\s*total/i,
      /net\s*total/i,
      /total\s*amount/i,
      /amount\s*(payable|to\s*pay|due)/i,
      /^\s*total\b/i
    ]
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim()
      if (/change|balance|tender|cash\s*received/i.test(line)) continue
      if (strongKeys.some(rx => rx.test(line))) {
        const amt = this.parseAmount(line)
        if (amt !== null && amt > 0 && amt < 2000000) return amt
      }
    }

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim()
      if (/rs|lkr|total|amount/i.test(line)) {
        const amt = this.parseAmount(line)
        if (amt !== null && amt > 0 && amt < 2000000) return amt
      }
    }

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim()
      if (/^\s*([\d.,]+(?:\/=)?|[\d.,]+\s*)$/.test(line)) {
        const amt = this.parseAmount(line)
        if (amt !== null && amt > 0 && amt < 2000000) return amt
      }
    }
    return null
  }

  parseAmount(text) {
    if (!text) return null
    let t = String(text)
    t = t.replace(/lkr\.?/ig, ' ').replace(/rs\.?/ig, ' ')
    t = t.replace(/\s+/g, ' ').trim()
    const matches = [...t.matchAll(/(\d{1,3}(?:,\d{3})+|\d+)(?:[.](\d{1,2}))?(?:\s*\/=)?/g)]
    if (!matches.length) return null
    const pick = matches[matches.length - 1]
    let whole = pick[1] || ''
    let frac = pick[2] || ''
    whole = whole.replace(/,/g, '')
    const num = parseFloat(frac ? `${whole}.${frac}` : whole)
    if (isNaN(num)) return null
    return num
  }

  /**
   * Extract payment method from receipt lines
   * @param {Array<string>} lines - Receipt text lines
   * @returns {string} - Payment method
   */
  extractPaymentMethod(lines) {
    // First detect digital wallet or QR payments common in LK
    const digitalPatterns = /(paytm|paypal|apple pay|google pay|gpay|qr\s*pay|wallet|friMi|mcash|ez\s*cash|payhere|pay\s*here|upi|scan\s*to\s*pay)/i
    for (const line of lines) {
      if (digitalPatterns.test(line)) return 'digital'
    }

    // Detect card payments (credit/debit)
    const cardPatterns = /(credit|debit|visa|mastercard|amex|american express|card\s*no|xxxx\s*\d{4}|card\s*payment|approved)/i
    for (const line of lines) {
      if (cardPatterns.test(line)) return 'card'
    }

    // Detect cash
    const cashPatterns = /(cash|change\s*due|balance\s*cash)/i
    for (const line of lines) {
      if (cashPatterns.test(line)) return 'cash'
    }

    return 'other'
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