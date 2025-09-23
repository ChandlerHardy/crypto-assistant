#!/bin/bash

# Complete Portfolio Population Script with Transactions
# Creates portfolios, assets, and actual transaction records

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
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['login']['accessToken'])" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Login failed. Please check credentials."
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

  PORTFOLIO_ID=$(echo $PORTFOLIO_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['createPortfolio']['id'])" 2>/dev/null)
  echo "✅ Created portfolio '$name' (ID: $PORTFOLIO_ID)"
  echo $PORTFOLIO_ID
}

# Function to add asset and get asset ID
add_asset() {
  local portfolio_id="$1"
  local symbol="$2"
  local initial_amount="$3"
  local initial_price="$4"

  echo "  📊 Adding asset: $symbol"

  ASSET_RESPONSE=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "{
      \"query\": \"mutation AddAssetToPortfolio(\$input: AddAssetInput!) { addAssetToPortfolio(input: \$input) { id symbol } }\",
      \"variables\": {
        \"input\": {
          \"portfolioId\": \"$portfolio_id\",
          \"symbol\": \"$symbol\",
          \"amount\": $initial_amount,
          \"averageBuyPrice\": $initial_price
        }
      }
    }")

  ASSET_ID=$(echo $ASSET_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['addAssetToPortfolio']['id'])" 2>/dev/null)
  echo "  ✅ Asset $symbol added (ID: $ASSET_ID)"
  echo $ASSET_ID
}

# Function to add transaction
add_transaction() {
  local portfolio_id="$1"
  local asset_id="$2"
  local symbol="$3"
  local type="$4"
  local amount="$5"
  local price="$6"
  local timestamp="$7"

  echo "    💰 Adding $type: $amount $symbol @ \$$price"

  curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "{
      \"query\": \"mutation AddTransaction(\$input: AddTransactionInput!) { addTransaction(input: \$input) { id transactionType amount realizedProfitLoss } }\",
      \"variables\": {
        \"input\": {
          \"portfolioId\": \"$portfolio_id\",
          \"assetId\": \"$asset_id\",
          \"transactionType\": \"$type\",
          \"amount\": $amount,
          \"pricePerUnit\": $price,
          \"notes\": \"Sample transaction - $type $amount $symbol at \$$price\"
        }
      }
    }" > /dev/null

  echo "    ✅ Transaction added"
}

echo "🚀 Creating sample portfolio with full transaction history..."

# Create Test Portfolio
echo ""
echo "=== Test Portfolio with Transactions ==="
PORTFOLIO_ID=$(create_portfolio "Complete Test Portfolio" "Portfolio with full transaction history for testing")

# Add BTC with multiple transactions
BTC_ASSET_ID=$(add_asset "$PORTFOLIO_ID" "BTC" "0.5" "35000")
add_transaction "$PORTFOLIO_ID" "$BTC_ASSET_ID" "BTC" "BUY" "0.5" "35000" "2024-01-15T10:00:00Z"
add_transaction "$PORTFOLIO_ID" "$BTC_ASSET_ID" "BTC" "BUY" "0.25" "42000" "2024-03-10T14:30:00Z"

# Add ETH with buy and sell transactions
ETH_ASSET_ID=$(add_asset "$PORTFOLIO_ID" "ETH" "3.0" "2200")
add_transaction "$PORTFOLIO_ID" "$ETH_ASSET_ID" "ETH" "BUY" "3.0" "2200" "2024-01-20T09:15:00Z"
add_transaction "$PORTFOLIO_ID" "$ETH_ASSET_ID" "ETH" "BUY" "2.0" "2800" "2024-04-05T16:45:00Z"
add_transaction "$PORTFOLIO_ID" "$ETH_ASSET_ID" "ETH" "SELL" "1.0" "3200" "2024-05-15T11:20:00Z"

# Add SOL
SOL_ASSET_ID=$(add_asset "$PORTFOLIO_ID" "SOL" "50" "85")
add_transaction "$PORTFOLIO_ID" "$SOL_ASSET_ID" "SOL" "BUY" "50" "85" "2024-02-20T13:00:00Z"

echo ""
echo "🎉 Test portfolio with transactions created successfully!"
echo "📊 Portfolio includes:"
echo "   • BTC: 2 buy transactions (DCA strategy)"
echo "   • ETH: 2 buys + 1 sell (showing realized P&L)"
echo "   • SOL: 1 buy transaction"
echo ""
echo "🔗 View at: https://cryptassist.chandlerhardy.com"
echo "💡 This portfolio demonstrates:"
echo "   - Multiple transactions per asset"
echo "   - Buy and sell scenarios"
echo "   - Realized profit/loss calculations"
echo "   - Transaction history preservation"