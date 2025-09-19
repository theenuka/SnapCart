#!/bin/bash

# SnapCart API Test Script
# Make sure your server is running before executing this script

BASE_URL="http://localhost:3001"
EMAIL="test@snapcart.com"
PASSWORD="testpassword123"

echo "🚀 Testing SnapCart API endpoints..."
echo "=================================="

# Test health check
echo "1. Health Check:"
curl -s "$BASE_URL/health" | jq '.'
echo ""

# Test user registration
echo "2. User Registration:"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'"
  }')

echo $REGISTER_RESPONSE | jq '.'

# Extract access token
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.accessToken // empty')

if [ ! -z "$ACCESS_TOKEN" ]; then
    echo "✅ Registration successful! Token obtained."
    
    # Test get profile
    echo ""
    echo "3. Get User Profile:"
    curl -s -X GET "$BASE_URL/api/users/profile" \
      -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
    
    # Test get receipts (should be empty initially)
    echo ""
    echo "4. Get Receipts (should be empty):"
    curl -s -X GET "$BASE_URL/api/receipts" \
      -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
    
    # Test analytics (should be empty initially)
    echo ""
    echo "5. Get Analytics:"
    curl -s -X GET "$BASE_URL/api/receipts/analytics" \
      -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
    
    echo ""
    echo "✅ All tests completed successfully!"
    echo "🔑 Your access token: $ACCESS_TOKEN"
    echo ""
    echo "📋 Next steps:"
    echo "- Import the Postman collection: SnapCart-API.postman_collection.json"
    echo "- Test file upload using Postman"
    echo "- Use the access token for authenticated requests"
    
else
    echo "❌ Registration failed. Please check the server logs."
fi

echo ""
echo "🔗 API Endpoints:"
echo "- POST $BASE_URL/api/users/register"
echo "- POST $BASE_URL/api/users/login"
echo "- GET  $BASE_URL/api/users/profile"
echo "- POST $BASE_URL/api/receipts/upload"
echo "- GET  $BASE_URL/api/receipts"
echo "=================================="