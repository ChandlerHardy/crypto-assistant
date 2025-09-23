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

access_token = login_response.json()["data"]["login"]["accessToken"]
print("✅ Login successful!")

# Get a portfolio ID to test with
portfolios_response = requests.post(
    GRAPHQL_URL,
    headers={"Authorization": f"Bearer {access_token}"},
    json={
        "query": "query { portfolios { id name } }"
    }
)

portfolios = portfolios_response.json()["data"]["portfolios"]
test_portfolio = portfolios[-1]  # Use the last portfolio (Complete Test Portfolio)
portfolio_id = test_portfolio["id"]

print(f"🧪 Testing with portfolio: {test_portfolio['name']} (ID: {portfolio_id})")

# Try to add an asset
print("\n1. Trying to add BTC asset...")
add_asset_response = requests.post(
    GRAPHQL_URL,
    headers={"Authorization": f"Bearer {access_token}"},
    json={
        "query": "mutation AddAssetToPortfolio($input: AddAssetInput!) { addAssetToPortfolio(input: $input) { id symbol amount averageBuyPrice } }",
        "variables": {
            "input": {
                "portfolioId": portfolio_id,
                "cryptoId": "bitcoin",
                "amount": 0.5,
                "buyPrice": 35000
            }
        }
    }
)

print(f"Status: {add_asset_response.status_code}")
response_data = add_asset_response.json()
print(f"Response: {json.dumps(response_data, indent=2)}")

if "errors" in response_data:
    print("❌ Asset creation failed!")
    for error in response_data["errors"]:
        print(f"   Error: {error['message']}")
else:
    asset_data = response_data["data"]["addAssetToPortfolio"]
    asset_id = asset_data["id"]
    print(f"✅ Asset created! ID: {asset_id}")

    # Now try to add a transaction
    print("\n2. Trying to add BTC transaction...")
    add_transaction_response = requests.post(
        GRAPHQL_URL,
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "query": "mutation AddTransaction($input: AddTransactionInput!) { addTransaction(input: $input) { id transactionType amount pricePerUnit } }",
            "variables": {
                "input": {
                    "portfolioId": portfolio_id,
                    "assetId": asset_id,
                    "transactionType": "BUY",
                    "amount": 0.5,
                    "pricePerUnit": 35000,
                    "notes": "Test transaction"
                }
            }
        }
    )

    print(f"Status: {add_transaction_response.status_code}")
    transaction_response_data = add_transaction_response.json()
    print(f"Response: {json.dumps(transaction_response_data, indent=2)}")

    if "errors" in transaction_response_data:
        print("❌ Transaction creation failed!")
        for error in transaction_response_data["errors"]:
            print(f"   Error: {error['message']}")
    else:
        print("✅ Transaction created successfully!")