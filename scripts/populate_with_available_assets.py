#!/usr/bin/env python3
"""
Working Portfolio with Available Assets

Creates a portfolio with assets that are confirmed to be available.
Demonstrates the correct transaction functionality.
"""

import requests

GRAPHQL_URL = "https://backend.chandlerhardy.com/cryptassist/graphql"
USER_EMAIL = "admin@cryptassist.com"
USER_PASSWORD = "AdminSecure2024!"

def login():
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
    return response.json()["data"]["login"]["accessToken"]

def create_portfolio(token, name, description=""):
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
    portfolio = response.json()["data"]["createPortfolio"]
    print(f"✅ Created portfolio: {portfolio['name']}")
    return portfolio["id"]

def add_asset(token, portfolio_id, crypto_id, symbol, amount, buy_price):
    response = requests.post(
        GRAPHQL_URL,
        headers={"Authorization": f"Bearer {token}"},
        json={
            "query": "mutation AddAssetToPortfolio($input: AddAssetInput!) { addAssetToPortfolio(input: $input) { id symbol amount } }",
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
    asset = response.json()["data"]["addAssetToPortfolio"]
    print(f"  📊 Added {asset['amount']} {asset['symbol'].upper()}")
    return asset["id"]

def add_transaction(token, portfolio_id, asset_id, symbol, tx_type, amount, price, notes=""):
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
                    "notes": notes or f"{tx_type} {amount} {symbol} at ${price:,.2f}"
                }
            }
        }
    )
    tx = response.json()["data"]["addTransaction"]
    print(f"    💰 {tx['transactionType']}: {tx['amount']} {symbol} @ ${price:,.2f}")
    if tx.get("realizedProfitLoss"):
        print(f"    💸 Realized P&L: ${tx['realizedProfitLoss']:,.2f}")

def main():
    print("🔐 Logging in...")
    token = login()
    print("✅ Login successful!")

    print("\n📁 Creating demo portfolio with available assets...")
    portfolio_id = create_portfolio(token, "Working Demo Portfolio", "Demonstrates working transactions with available cryptocurrencies")

    print("\n🚀 Adding assets and transactions...")

    # Bitcoin with DCA strategy
    print("\n📊 Bitcoin (DCA Strategy):")
    btc_id = add_asset(token, portfolio_id, "bitcoin", "BTC", 0.5, 35000)
    add_transaction(token, portfolio_id, btc_id, "BTC", "BUY", 0.5, 35000, "Initial BTC purchase")
    add_transaction(token, portfolio_id, btc_id, "BTC", "BUY", 0.25, 42000, "DCA buy #2")
    add_transaction(token, portfolio_id, btc_id, "BTC", "BUY", 0.15, 55000, "DCA buy #3")

    # Ethereum with buy and sell
    print("\n📊 Ethereum (Buy & Sell):")
    eth_id = add_asset(token, portfolio_id, "ethereum", "ETH", 3.0, 2200)
    add_transaction(token, portfolio_id, eth_id, "ETH", "BUY", 3.0, 2200, "Initial ETH purchase")
    add_transaction(token, portfolio_id, eth_id, "ETH", "BUY", 2.0, 2800, "Additional ETH buy")
    add_transaction(token, portfolio_id, eth_id, "ETH", "SELL", 1.5, 3500, "Profit taking")

    # XRP
    print("\n📊 XRP:")
    xrp_id = add_asset(token, portfolio_id, "ripple", "XRP", 1000, 0.50)
    add_transaction(token, portfolio_id, xrp_id, "XRP", "BUY", 1000, 0.50, "XRP position")
    add_transaction(token, portfolio_id, xrp_id, "XRP", "BUY", 500, 0.75, "XRP additional buy")

    print("\n🎉 Demo portfolio created successfully!")
    print("\n📋 Portfolio demonstrates:")
    print("   • Multiple buy transactions (DCA)")
    print("   • Buy and sell transactions (realized P&L)")
    print("   • Transaction history preservation")
    print("   • FIFO cost basis calculations")
    print("\n🔗 View at: https://cryptassist.chandlerhardy.com")
    print("\n💡 Note: The cryptocurrency API may have limited assets due to rate limiting.")
    print("   This is normal and doesn't affect the core portfolio functionality.")

if __name__ == "__main__":
    main()