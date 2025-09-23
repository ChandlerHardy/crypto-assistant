#!/usr/bin/env python3
import requests
import json

GRAPHQL_URL = "https://backend.chandlerhardy.com/cryptassist/graphql"
USER_EMAIL = "admin@cryptassist.com"
USER_PASSWORD = "AdminSecure2024!"

# Login
login_response = requests.post(
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

if login_response.status_code != 200:
    print(f"Login failed: {login_response.status_code}")
    exit(1)

access_token = login_response.json()["data"]["login"]["accessToken"]
print("✅ Login successful!")

# Check portfolios
portfolios_response = requests.post(
    GRAPHQL_URL,
    headers={"Authorization": f"Bearer {access_token}"},
    json={
        "query": """
        query {
            portfolios {
                id
                name
                description
                totalValue
                totalProfitLoss
                assets {
                    id
                    symbol
                    amount
                    currentPrice
                    totalValue
                    profitLoss
                    transactions {
                        id
                        transactionType
                        amount
                        pricePerUnit
                        totalValue
                        realizedProfitLoss
                        timestamp
                        notes
                    }
                }
            }
        }
        """
    }
)

if portfolios_response.status_code != 200:
    print(f"Portfolio query failed: {portfolios_response.status_code}")
    exit(1)

portfolios = portfolios_response.json()["data"]["portfolios"]

print(f"\n📊 Found {len(portfolios)} portfolios:")
print("=" * 50)

for portfolio in portfolios:
    print(f"\n📁 {portfolio['name']}")
    if portfolio.get('description'):
        print(f"   Description: {portfolio['description']}")
    print(f"   Total Value: ${portfolio.get('totalValue', 0):,.2f}")
    print(f"   P&L: ${portfolio.get('totalProfitLoss', 0):,.2f}")
    print(f"   Assets: {len(portfolio['assets'])}")

    for asset in portfolio['assets']:
        print(f"\n   💰 {asset['symbol']}: {asset['amount']} @ ${asset.get('currentPrice', 0):,.2f}")
        print(f"      Total Value: ${asset.get('totalValue', 0):,.2f}")
        print(f"      P&L: ${asset.get('profitLoss', 0):,.2f}")
        print(f"      Transactions: {len(asset['transactions'])}")

        for i, tx in enumerate(asset['transactions'][:3]):  # Show first 3 transactions
            print(f"        {i+1}. {tx['transactionType']}: {tx['amount']} @ ${tx['pricePerUnit']:,.2f} on {tx['timestamp'][:10]}")

        if len(asset['transactions']) > 3:
            print(f"        ... and {len(asset['transactions']) - 3} more transactions")

print(f"\n🔗 View at: https://cryptassist.chandlerhardy.com")