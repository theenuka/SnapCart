# SnapCart Backend API

A Node.js/Express backend for the SnapCart receipt scanner application with OCR capabilities.

## Features

- **Receipt Upload & Processing**: Upload receipt images and extract structured data
- **OCR Integration**: Google Vision API with fallback mock OCR for development
- **Smart Parsing**: Extract items, prices, totals, store names, and dates
- **Auto-Categorization**: Automatically categorize receipts by store type
- **Analytics**: Spending analytics by category and time period
- **File Management**: Secure image upload and storage

## API Endpoints

### Receipt Management
- `POST /api/receipts/upload` - Upload and process receipt image
- `GET /api/receipts` - Get all receipts with optional filters
- `GET /api/receipts/:id` - Get specific receipt
- `GET /api/receipts/:id/image` - Get receipt image
- `DELETE /api/receipts/:id` - Delete receipt

### Analytics
- `GET /api/receipts/analytics` - Get spending analytics

### Health Check
- `GET /health` - Server health check
- `GET /api/receipts/health` - Receipt service health check

## Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google Cloud Vision API credentials (optional)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB (if running locally)

4. Run the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/snapcart
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

## Google Vision API Setup (Optional)

1. Create a Google Cloud Project
2. Enable the Vision API
3. Create a service account and download the JSON key
4. Set `GOOGLE_APPLICATION_CREDENTIALS` in your environment

If not configured, the system will use mock OCR data for testing.

## Usage Examples

### Upload Receipt
```bash
curl -X POST \
  http://localhost:3000/api/receipts/upload \
  -H 'Content-Type: multipart/form-data' \
  -F 'receipt=@path/to/receipt.jpg' \
  -F 'userId=optional-user-id'
```

### Get All Receipts
```bash
curl http://localhost:3000/api/receipts
```

### Filter Receipts
```bash
curl "http://localhost:3000/api/receipts?category=groceries&dateFrom=2024-01-01"
```

### Get Analytics
```bash
curl "http://localhost:3000/api/receipts/analytics?dateFrom=2024-01-01&dateTo=2024-12-31"
```

## Project Structure

```
src/
├── app.js              # Main application entry point
├── config/
│   └── database.js     # Database connection
├── controllers/
│   └── receipt.controller.js  # Receipt API endpoints
├── models/
│   ├── Receipt.js      # Receipt data model
│   └── User.js         # User data model
├── parsers/
│   └── receipt.parser.js      # Receipt text parsing logic
├── routes/
│   └── receipt.routes.js      # API routes
└── services/
    ├── ocr.service.js         # OCR text extraction
    └── receipt.service.js     # Receipt business logic
```

## Data Models

### Receipt
- Store name, date, items list
- Subtotal, tax, total amounts  
- Category, payment method
- Image path, OCR text
- Processing status

### Parsed Items
- Item name, price, quantity
- Auto-extracted from receipt text

## Error Handling

The API includes comprehensive error handling for:
- Invalid file uploads
- OCR processing failures
- Database connection issues
- Missing or invalid data

## Security Considerations

- File upload size limits (10MB)
- Image file type validation
- Input sanitization
- Error message sanitization

## Development Notes

- Uses mock OCR when Google Vision API is not configured
- Includes sample receipt data for testing
- Comprehensive logging for debugging
- Modular architecture for easy testing and extension