#!/bin/bash

# Quick Portfolio Population Script
# Creates sample portfolios using GraphQL mutations

GRAPHQL_URL="https://backend.chandlerhardy.com/cryptassist/graphql"
USER_EMAIL="admin@cryptassist.com"
USER_PASSWORD="AdminSecure2024!"

echo "🔐 Logging in as $USER_EMAIL..."

# Login and get access token
LOGIN_RESPONSE=$(curl -s -X POST "$GRAPHQL_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation Login(\$input: LoginInput!) { login(input: \$input) { accessToken } }\",
    \"variables\": {
      \"input\": {
        \"email\": \"$USER_EMAIL\",
        \"password\": \"$USER_PASSWORD\"
      }
    }
  }")

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Login failed. Please check credentials."
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful!"

# Function to create portfolio
create_portfolio() {
  local name="$1"
  local description="$2"

  echo "📁 Creating portfolio: $name"

  PORTFOLIO_RESPONSE=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "{
      \"query\": \"mutation CreatePortfolio(\$input: CreatePortfolioInput!) { createPortfolio(input: \$input) { id name } }\",
      \"variables\": {
        \"input\": {
          \"name\": \"$name\",
          \"description\": \"$description\"
        }
      }
    }")

  # Extract portfolio ID
  PORTFOLIO_ID=$(echo $PORTFOLIO_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "✅ Created portfolio '$name' (ID: $PORTFOLIO_ID)"
  echo $PORTFOLIO_ID
}

# Function to add transaction
add_transaction() {
  local portfolio_id="$1"
  local symbol="$2"
  local type="$3"
  local amount="$4"
  local price="$5"
  local timestamp="$6"

  echo "💰 Adding $type: $amount $symbol @ \$$price"

  curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "{
      \"query\": \"mutation AddTransaction(\$input: AddTransactionInput!) { addTransaction(input: \$input) { id } }\",
      \"variables\": {
        \"input\": {
          \"portfolioId\": \"$portfolio_id\",
          \"symbol\": \"$symbol\",
          \"type\": \"$type\",
          \"amount\": $amount,
          \"pricePerUnit\": $price,
          \"timestamp\": \"$timestamp\"
        }
      }
    }" > /dev/null
}

echo "🚀 Creating sample portfolios..."

# Create Diversified Portfolio
DIVERSIFIED_ID=$(create_portfolio "Quick Test Portfolio" "Diversified portfolio for testing")

# Add Bitcoin transactions
add_transaction "$DIVERSIFIED_ID" "BTC" "BUY" "0.5" "35000" "2024-01-15T10:00:00Z"
add_transaction "$DIVERSIFIED_ID" "BTC" "BUY" "0.25" "42000" "2024-03-10T14:30:00Z"

# Add Ethereum transactions
add_transaction "$DIVERSIFIED_ID" "ETH" "BUY" "3.0" "2200" "2024-01-20T09:15:00Z"
add_transaction "$DIVERSIFIED_ID" "ETH" "BUY" "2.0" "2800" "2024-04-05T16:45:00Z"
add_transaction "$DIVERSIFIED_ID" "ETH" "SELL" "1.0" "3200" "2024-05-15T11:20:00Z"

# Add other assets
add_transaction "$DIVERSIFIED_ID" "ADA" "BUY" "1000" "0.45" "2024-02-01T08:30:00Z"
add_transaction "$DIVERSIFIED_ID" "SOL" "BUY" "50" "85" "2024-02-20T13:00:00Z"

# Create DeFi Portfolio
DEFI_ID=$(create_portfolio "DeFi Focus" "DeFi and smart contract platforms")

add_transaction "$DEFI_ID" "ETH" "BUY" "5.0" "1800" "2023-12-01T10:00:00Z"
add_transaction "$DEFI_ID" "UNI" "BUY" "200" "6.5" "2024-01-10T15:30:00Z"
add_transaction "$DEFI_ID" "AAVE" "BUY" "25" "95" "2024-01-25T12:15:00Z"
add_transaction "$DEFI_ID" "LINK" "BUY" "100" "14.5" "2024-02-10T09:45:00Z"

echo ""
echo "🎉 Sample portfolio creation completed!"
echo "📊 Created 2 portfolios with multiple assets and transactions"
echo "🔗 View at: https://cryptassist.chandlerhardy.com"