#!/bin/bash

# Complete Portfolio Population Script
# Creates all 5 sample portfolios using GraphQL mutations

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

# Extract access token from nested JSON structure
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['login']['accessToken'])" 2>/dev/null)

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

  # Extract portfolio ID from nested JSON
  PORTFOLIO_ID=$(echo $PORTFOLIO_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['createPortfolio']['id'])" 2>/dev/null)
  echo "✅ Created portfolio '$name' (ID: $PORTFOLIO_ID)"
  echo $PORTFOLIO_ID
}

# Function to add asset first, then transaction
add_asset_and_transaction() {
  local portfolio_id="$1"
  local symbol="$2"
  local type="$3"
  local amount="$4"
  local price="$5"
  local timestamp="$6"

  echo "💰 Adding $type: $amount $symbol @ \$$price"

  # First add asset to portfolio if not exists
  ADD_ASSET_RESPONSE=$(curl -s -X POST "$GRAPHQL_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "{
      \"query\": \"mutation AddAssetToPortfolio(\$input: AddAssetInput!) { addAssetToPortfolio(input: \$input) { id symbol } }\",
      \"variables\": {
        \"input\": {
          \"portfolioId\": \"$portfolio_id\",
          \"symbol\": \"$symbol\",
          \"amount\": $amount,
          \"averageBuyPrice\": $price
        }
      }
    }")

  echo "✅ Asset added/updated for $symbol"
}

echo "🚀 Creating all 5 sample portfolios..."

# 1. DIVERSIFIED PORTFOLIO
echo ""
echo "=== 1. Diversified Portfolio ==="
DIVERSIFIED_ID=$(create_portfolio "Diversified Portfolio" "A well-balanced portfolio with major cryptocurrencies")

add_asset_and_transaction "$DIVERSIFIED_ID" "BTC" "BUY" "0.5" "35000" "2024-01-15T10:00:00Z"
add_asset_and_transaction "$DIVERSIFIED_ID" "BTC" "BUY" "0.25" "42000" "2024-03-10T14:30:00Z"
add_asset_and_transaction "$DIVERSIFIED_ID" "ETH" "BUY" "3.0" "2200" "2024-01-20T09:15:00Z"
add_asset_and_transaction "$DIVERSIFIED_ID" "ETH" "BUY" "2.0" "2800" "2024-04-05T16:45:00Z"
add_asset_and_transaction "$DIVERSIFIED_ID" "ADA" "BUY" "1000" "0.45" "2024-02-01T08:30:00Z"
add_asset_and_transaction "$DIVERSIFIED_ID" "SOL" "BUY" "50" "85" "2024-02-20T13:00:00Z"

# 2. DEFI FOCUS PORTFOLIO
echo ""
echo "=== 2. DeFi Focus Portfolio ==="
DEFI_ID=$(create_portfolio "DeFi Focus Portfolio" "Portfolio focused on DeFi and smart contract platforms")

add_asset_and_transaction "$DEFI_ID" "ETH" "BUY" "5.0" "1800" "2023-12-01T10:00:00Z"
add_asset_and_transaction "$DEFI_ID" "UNI" "BUY" "200" "6.5" "2024-01-10T15:30:00Z"
add_asset_and_transaction "$DEFI_ID" "AAVE" "BUY" "25" "95" "2024-01-25T12:15:00Z"
add_asset_and_transaction "$DEFI_ID" "LINK" "BUY" "100" "14.5" "2024-02-10T09:45:00Z"

# 3. LAYER 1 COMPETITORS
echo ""
echo "=== 3. Layer 1 Competitors ==="
LAYER1_ID=$(create_portfolio "Layer 1 Competitors" "Alternative layer 1 blockchain platforms")

add_asset_and_transaction "$LAYER1_ID" "SOL" "BUY" "75" "65" "2024-01-05T11:20:00Z"
add_asset_and_transaction "$LAYER1_ID" "SOL" "BUY" "25" "95" "2024-03-15T14:10:00Z"
add_asset_and_transaction "$LAYER1_ID" "AVAX" "BUY" "80" "28" "2024-01-30T16:00:00Z"
add_asset_and_transaction "$LAYER1_ID" "DOT" "BUY" "150" "7.2" "2024-02-05T10:30:00Z"
add_asset_and_transaction "$LAYER1_ID" "NEAR" "BUY" "200" "2.8" "2024-02-25T13:45:00Z"

# 4. MEME & SPECULATIVE
echo ""
echo "=== 4. Meme & Speculative ==="
MEME_ID=$(create_portfolio "Meme & Speculative" "High-risk, high-reward speculative positions")

add_asset_and_transaction "$MEME_ID" "DOGE" "BUY" "5000" "0.08" "2024-01-12T14:20:00Z"
add_asset_and_transaction "$MEME_ID" "SHIB" "BUY" "50000000" "0.000012" "2024-02-14T09:30:00Z"
add_asset_and_transaction "$MEME_ID" "PEPE" "BUY" "100000000" "0.0000008" "2024-03-20T16:45:00Z"

# 5. BLUE CHIP HOLDINGS
echo ""
echo "=== 5. Blue Chip Holdings ==="
BLUECHIP_ID=$(create_portfolio "Blue Chip Holdings" "Conservative positions in established cryptocurrencies")

add_asset_and_transaction "$BLUECHIP_ID" "BTC" "BUY" "1.0" "30000" "2023-10-15T10:00:00Z"
add_asset_and_transaction "$BLUECHIP_ID" "BTC" "BUY" "0.5" "38000" "2024-01-08T14:30:00Z"
add_asset_and_transaction "$BLUECHIP_ID" "BTC" "BUY" "0.3" "45000" "2024-04-20T11:15:00Z"
add_asset_and_transaction "$BLUECHIP_ID" "ETH" "BUY" "8.0" "1600" "2023-11-01T09:00:00Z"
add_asset_and_transaction "$BLUECHIP_ID" "ETH" "BUY" "4.0" "2400" "2024-02-15T15:20:00Z"
add_asset_and_transaction "$BLUECHIP_ID" "BNB" "BUY" "15" "280" "2024-01-18T12:45:00Z"

echo ""
echo "🎉 All 5 sample portfolios created successfully!"
echo ""
echo "📋 Summary:"
echo "   • Diversified Portfolio: BTC, ETH, ADA, SOL"
echo "   • DeFi Focus Portfolio: ETH, UNI, AAVE, LINK"
echo "   • Layer 1 Competitors: SOL, AVAX, DOT, NEAR"
echo "   • Meme & Speculative: DOGE, SHIB, PEPE"
echo "   • Blue Chip Holdings: BTC, ETH, BNB"
echo ""
echo "🔗 View your portfolios at: https://cryptassist.chandlerhardy.com"