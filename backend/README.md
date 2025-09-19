# SnapCart Backend API

A receipt scanner and expense tracker backend service that uses OCR to extract data from receipt images.

## Features

- 📸 **Receipt Image Upload**: Upload receipt images through REST API
- 🔍 **OCR Processing**: Extract text from receipts using Google Vision AI (with fallback)
- 📊 **Data Parsing**: Parse OCR text into structured receipt data (items, prices, totals)
- 💾 **Database Storage**: Store receipts and analytics in MongoDB
- 📈 **Analytics**: Get spending analytics by category and time period
- 🏷️ **Auto-categorization**: Automatically categorize receipts by store type

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **OCR**: Google Cloud Vision API
- **File Upload**: Multer
- **Image Processing**: Built-in parsers

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and Google Cloud credentials
   ```

3. **Start the server:**
   ```bash
   npm start        # Production
   npm run dev      # Development with nodemon
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3001/api/receipts/health
   ```

## API Endpoints

### Health Check
- **GET** `/health` - Main health check
- **GET** `/api/receipts/health` - Receipt service health check

### Receipt Management
- **POST** `/api/receipts/upload` - Upload and process receipt image
- **GET** `/api/receipts` - Get all receipts (with filters)
- **GET** `/api/receipts/:id` - Get specific receipt
- **GET** `/api/receipts/:id/image` - Get receipt image
- **DELETE** `/api/receipts/:id` - Delete receipt

### Analytics
- **GET** `/api/receipts/analytics` - Get spending analytics

## API Usage Examples

### Upload Receipt
```bash
curl -X POST http://localhost:3001/api/receipts/upload \
  -F "receipt=@path/to/receipt.jpg" \
  -F "userId=user123"
```

### Get Receipts with Filters
```bash
curl "http://localhost:3001/api/receipts?category=groceries&dateFrom=2024-01-01&limit=10"
```

### Get Analytics
```bash
curl "http://localhost:3001/api/receipts/analytics?dateFrom=2024-01-01&dateTo=2024-12-31"
```

## Environment Variables

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json  # Optional
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Database Schema

### Receipt Model
```javascript
{
  storeName: String,
  date: Date,
  items: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  subtotal: Number,
  tax: Number,
  total: Number,
  category: String, // 'groceries', 'restaurant', 'gas', etc.
  paymentMethod: String,
  imagePath: String,
  ocrText: String,
  processingStatus: String, // 'pending', 'processed', 'failed'
  userId: ObjectId
}
```

## OCR Configuration

The service supports Google Cloud Vision API for production-quality OCR:

1. **Set up Google Cloud Project**
2. **Enable Vision API**
3. **Create Service Account Key**
4. **Set GOOGLE_APPLICATION_CREDENTIALS in .env**

For development/demo purposes, a mock OCR service is included that returns sample data.

## File Upload

- **Max file size**: 10MB
- **Supported formats**: JPG, JPEG, PNG, GIF
- **Storage**: Local filesystem (`uploads/` directory)

## Error Handling

The API returns structured error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (successful upload)
- `400` - Bad Request (invalid file, missing data)
- `404` - Not Found (receipt not found)
- `500` - Internal Server Error

## Development

### Project Structure
```
src/
├── app.js              # Main application
├── config/
│   └── database.js     # MongoDB connection
├── controllers/
│   └── receipt.controller.js
├── models/
│   ├── Receipt.js
│   └── User.js
├── routes/
│   └── receipt.routes.js
├── services/
│   ├── ocr.service.js
│   └── receipt.service.js
└── parsers/
    └── receipt.parser.js
```

### Running Tests
```bash
npm test
```

### Code Style
```bash
npm run lint
npm run format
```

## Deployment

### Production Checklist
- [ ] Set up MongoDB Atlas cluster
- [ ] Configure Google Cloud Vision API
- [ ] Set environment variables
- [ ] Configure CORS origins
- [ ] Set up file storage (AWS S3 recommended)
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the ISC License. Backend API

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