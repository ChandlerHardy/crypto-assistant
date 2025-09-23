#!/usr/bin/env python3
"""
Working Portfolio Population Script

Creates sample portfolios with actual assets and transactions.
Uses correct GraphQL schema with cryptoId and proper field names.
"""

import requests
import json
from datetime import datetime

GRAPHQL_URL = "https://backend.chandlerhardy.com/cryptassist/graphql"
USER_EMAIL = "admin@cryptassist.com"
USER_PASSWORD = "AdminSecure2024!"

# Map symbols to CoinGecko crypto IDs
CRYPTO_ID_MAP = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "ADA": "cardano",
    "SOL": "solana",
    "UNI": "uniswap",
    "AAVE": "aave",
    "LINK": "chainlink",
    "AVAX": "avalanche-2",
    "DOT": "polkadot",
    "NEAR": "near",
    "DOGE": "dogecoin",
    "SHIB": "shiba-inu",
    "PEPE": "pepe",
    "BNB": "binancecoin"
}

def login():
    """Login and return access token"""
    print(f"🔐 Logging in as {USER_EMAIL}...")

    response = requests.post(
        GRAPHQL_URL,
        json={
            "query": "mutation Login($input: LoginInput!) { login(input: $input) { accessToken } }",
            "variables": {
                "input": {
                    "email": USER_EMAIL,
                    "password": USER_PASSWORD
                }
            }
        }
    )

    if response.status_code != 200:
        raise Exception(f"Login failed: {response.status_code}")

    data = response.json()
    if "errors" in data:
        raise Exception(f"Login errors: {data['errors']}")

    access_token = data["data"]["login"]["accessToken"]
    print("✅ Login successful!")
    return access_token

def create_portfolio(token, name, description=""):
    """Create a portfolio and return its ID"""
    print(f"📁 Creating portfolio: {name}")

    response = requests.post(
        GRAPHQL_URL,
        headers={"Authorization": f"Bearer {token}"},
        json={
            "query": "mutation CreatePortfolio($input: CreatePortfolioInput!) { createPortfolio(input: $input) { id name } }",
            "variables": {
                "input": {
                    "name": name,
                    "description": description
                }
            }
        }
    )

    if response.status_code != 200:
        raise Exception(f"Portfolio creation failed: {response.status_code}")

    data = response.json()
    if "errors" in data:
        raise Exception(f"Portfolio creation errors: {data['errors']}")

    portfolio = data["data"]["createPortfolio"]
    portfolio_id = portfolio["id"]
    print(f"✅ Created portfolio '{portfolio['name']}' (ID: {portfolio_id})")
    return portfolio_id

def add_asset(token, portfolio_id, symbol, amount, buy_price):
    """Add an asset to portfolio and return asset ID"""
    crypto_id = CRYPTO_ID_MAP.get(symbol)
    if not crypto_id:
        raise Exception(f"Unknown crypto symbol: {symbol}")

    print(f"  📊 Adding asset: {symbol}")

    response = requests.post(
        GRAPHQL_URL,
        headers={"Authorization": f"Bearer {token}"},
        json={
            "query": "mutation AddAssetToPortfolio($input: AddAssetInput!) { addAssetToPortfolio(input: $input) { id symbol } }",
            "variables": {
                "input": {
                    "portfolioId": portfolio_id,
                    "cryptoId": crypto_id,
                    "amount": amount,
                    "buyPrice": buy_price
                }
            }
        }
    )

    if response.status_code != 200:
        raise Exception(f"Asset creation failed: {response.status_code}")

    data = response.json()
    if "errors" in data:
        raise Exception(f"Asset creation errors: {data['errors']}")

    asset = data["data"]["addAssetToPortfolio"]
    asset_id = asset["id"]
    print(f"  ✅ Asset {symbol} added (ID: {asset_id})")
    return asset_id

def add_transaction(token, portfolio_id, asset_id, symbol, tx_type, amount, price, timestamp, notes=""):
    """Add a transaction to an asset"""
    print(f"    💰 Adding {tx_type}: {amount} {symbol} @ ${price:,.2f}")

    response = requests.post(
        GRAPHQL_URL,
        headers={"Authorization": f"Bearer {token}"},
        json={
            "query": "mutation AddTransaction($input: AddTransactionInput!) { addTransaction(input: $input) { id transactionType amount realizedProfitLoss } }",
            "variables": {
                "input": {
                    "portfolioId": portfolio_id,
                    "assetId": asset_id,
                    "transactionType": tx_type,
                    "amount": amount,
                    "pricePerUnit": price,
                    "notes": notes or f"Sample {tx_type} transaction - {amount} {symbol} at ${price:,.2f}"
                }
            }
        }
    )

    if response.status_code != 200:
        raise Exception(f"Transaction creation failed: {response.status_code}")

    data = response.json()
    if "errors" in data:
        raise Exception(f"Transaction creation errors: {data['errors']}")

    transaction = data["data"]["addTransaction"]
    print(f"    ✅ Transaction added (ID: {transaction['id']})")

    if transaction.get("realizedProfitLoss"):
        print(f"    💸 Realized P&L: ${transaction['realizedProfitLoss']:,.2f}")

def main():
    try:
        # Login
        token = login()

        print("\n🚀 Creating sample portfolios with full transaction history...")

        # 1. Diversified Portfolio
        print("\n=== 1. Diversified Portfolio ===")
        portfolio_id = create_portfolio(token, "Working Diversified Portfolio", "A well-balanced portfolio with major cryptocurrencies and full transaction history")

        # BTC with multiple buys
        btc_asset_id = add_asset(token, portfolio_id, "BTC", 0.5, 35000)
        add_transaction(token, portfolio_id, btc_asset_id, "BTC", "BUY", 0.5, 35000, "2024-01-15T10:00:00Z")
        add_transaction(token, portfolio_id, btc_asset_id, "BTC", "BUY", 0.25, 42000, "2024-03-10T14:30:00Z")

        # ETH with buy and sell
        eth_asset_id = add_asset(token, portfolio_id, "ETH", 3.0, 2200)
        add_transaction(token, portfolio_id, eth_asset_id, "ETH", "BUY", 3.0, 2200, "2024-01-20T09:15:00Z")
        add_transaction(token, portfolio_id, eth_asset_id, "ETH", "BUY", 2.0, 2800, "2024-04-05T16:45:00Z")
        add_transaction(token, portfolio_id, eth_asset_id, "ETH", "SELL", 1.0, 3200, "2024-05-15T11:20:00Z")

        # ADA and SOL
        ada_asset_id = add_asset(token, portfolio_id, "ADA", 1000, 0.45)
        add_transaction(token, portfolio_id, ada_asset_id, "ADA", "BUY", 1000, 0.45, "2024-02-01T08:30:00Z")

        sol_asset_id = add_asset(token, portfolio_id, "SOL", 50, 85)
        add_transaction(token, portfolio_id, sol_asset_id, "SOL", "BUY", 50, 85, "2024-02-20T13:00:00Z")

        # 2. DeFi Focus Portfolio
        print("\n=== 2. DeFi Focus Portfolio ===")
        defi_portfolio_id = create_portfolio(token, "Working DeFi Focus", "Portfolio focused on DeFi and smart contract platforms")

        # ETH base layer
        eth_defi_id = add_asset(token, defi_portfolio_id, "ETH", 5.0, 1800)
        add_transaction(token, defi_portfolio_id, eth_defi_id, "ETH", "BUY", 5.0, 1800, "2023-12-01T10:00:00Z")

        # DeFi tokens
        uni_asset_id = add_asset(token, defi_portfolio_id, "UNI", 200, 6.5)
        add_transaction(token, defi_portfolio_id, uni_asset_id, "UNI", "BUY", 200, 6.5, "2024-01-10T15:30:00Z")

        aave_asset_id = add_asset(token, defi_portfolio_id, "AAVE", 25, 95)
        add_transaction(token, defi_portfolio_id, aave_asset_id, "AAVE", "BUY", 25, 95, "2024-01-25T12:15:00Z")

        link_asset_id = add_asset(token, defi_portfolio_id, "LINK", 100, 14.5)
        add_transaction(token, defi_portfolio_id, link_asset_id, "LINK", "BUY", 100, 14.5, "2024-02-10T09:45:00Z")

        # 3. Layer 1 Competitors
        print("\n=== 3. Layer 1 Competitors ===")
        layer1_portfolio_id = create_portfolio(token, "Working Layer 1s", "Alternative layer 1 blockchain platforms")

        # Solana with DCA
        sol_l1_id = add_asset(token, layer1_portfolio_id, "SOL", 75, 65)
        add_transaction(token, layer1_portfolio_id, sol_l1_id, "SOL", "BUY", 75, 65, "2024-01-05T11:20:00Z")
        add_transaction(token, layer1_portfolio_id, sol_l1_id, "SOL", "BUY", 25, 95, "2024-03-15T14:10:00Z")

        # Other L1s
        avax_asset_id = add_asset(token, layer1_portfolio_id, "AVAX", 80, 28)
        add_transaction(token, layer1_portfolio_id, avax_asset_id, "AVAX", "BUY", 80, 28, "2024-01-30T16:00:00Z")

        dot_asset_id = add_asset(token, layer1_portfolio_id, "DOT", 150, 7.2)
        add_transaction(token, layer1_portfolio_id, dot_asset_id, "DOT", "BUY", 150, 7.2, "2024-02-05T10:30:00Z")

        near_asset_id = add_asset(token, layer1_portfolio_id, "NEAR", 200, 2.8)
        add_transaction(token, layer1_portfolio_id, near_asset_id, "NEAR", "BUY", 200, 2.8, "2024-02-25T13:45:00Z")

        print("\n🎉 All working portfolios created successfully!")
        print("\n📋 Summary:")
        print("   • Working Diversified Portfolio: BTC, ETH, ADA, SOL with multiple transactions")
        print("   • Working DeFi Focus: ETH, UNI, AAVE, LINK")
        print("   • Working Layer 1s: SOL, AVAX, DOT, NEAR")
        print("\n💡 Features demonstrated:")
        print("   - Multiple buy transactions (DCA strategy)")
        print("   - Buy and sell transactions (realized P&L)")
        print("   - Diverse asset classes and risk profiles")
        print("   - Complete transaction histories")
        print("\n🔗 View at: https://cryptassist.chandlerhardy.com")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return 1

    return 0

if __name__ == "__main__":
    exit(main())