#!/usr/bin/env python3
"""
Sample Portfolio Data Population Script

This script creates sample portfolios and transactions for testing the Crypto Portfolio Analyzer.
It demonstrates various scenarios including:
- Multiple portfolio strategies
- Diverse cryptocurrency holdings
- Buy/sell transactions with P&L tracking
- Different investment timeframes and risk profiles

Usage:
    python3 scripts/populate_sample_data.py --user-email admin@cryptassist.com
"""

import json
import requests
import argparse
from datetime import datetime
from typing import Dict, List, Any

# GraphQL endpoint
GRAPHQL_URL = "https://backend.chandlerhardy.com/cryptassist/graphql"

def create_portfolio_mutation(name: str, description: str = "") -> str:
    """GraphQL mutation to create a portfolio"""
    return """
    mutation CreatePortfolio($input: CreatePortfolioInput!) {
        createPortfolio(input: $input) {
            id
            name
            description
            totalValue
            totalProfitLoss
            totalCostBasis
        }
    }
    """

def add_transaction_mutation() -> str:
    """GraphQL mutation to add a transaction"""
    return """
    mutation AddTransaction($input: AddTransactionInput!) {
        addTransaction(input: $input) {
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
    """

def login_mutation() -> str:
    """GraphQL mutation to login"""
    return """
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            user {
                id
                email
                isAdmin
            }
            accessToken
        }
    }
    """

def execute_graphql(query: str, variables: Dict[str, Any], auth_token: str = None) -> Dict[str, Any]:
    """Execute a GraphQL query/mutation"""
    headers = {"Content-Type": "application/json"}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"

    response = requests.post(
        GRAPHQL_URL,
        json={"query": query, "variables": variables},
        headers=headers
    )

    if response.status_code != 200:
        raise Exception(f"HTTP {response.status_code}: {response.text}")

    result = response.json()
    if "errors" in result:
        raise Exception(f"GraphQL errors: {result['errors']}")

    return result["data"]

def login_user(email: str, password: str) -> str:
    """Login and return access token"""
    print(f"🔐 Logging in as {email}...")

    data = execute_graphql(
        login_mutation(),
        {"input": {"email": email, "password": password}}
    )

    access_token = data["login"]["accessToken"]
    user = data["login"]["user"]
    print(f"✅ Logged in successfully as {user['email']} (Admin: {user['isAdmin']})")

    return access_token

def create_portfolio(name: str, description: str, auth_token: str) -> str:
    """Create a portfolio and return its ID"""
    print(f"📁 Creating portfolio: {name}")

    data = execute_graphql(
        create_portfolio_mutation(name, description),
        {"input": {"name": name, "description": description}},
        auth_token
    )

    portfolio = data["createPortfolio"]
    print(f"✅ Created portfolio '{portfolio['name']}' (ID: {portfolio['id']})")

    return portfolio["id"]

def add_transaction(portfolio_id: str, symbol: str, transaction: Dict[str, Any], auth_token: str):
    """Add a transaction to a portfolio"""
    transaction_type = transaction["type"]
    amount = transaction["amount"]
    price = transaction["pricePerUnit"]
    timestamp = transaction["timestamp"]

    print(f"💰 Adding {transaction_type.upper()}: {amount} {symbol} @ ${price:,.2f} on {timestamp}")

    # Convert timestamp to the format expected by the backend
    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    formatted_timestamp = dt.isoformat()

    data = execute_graphql(
        add_transaction_mutation(),
        {
            "input": {
                "portfolioId": portfolio_id,
                "symbol": symbol,
                "type": transaction_type.upper(),
                "amount": amount,
                "pricePerUnit": price,
                "timestamp": formatted_timestamp
            }
        },
        auth_token
    )

    result = data["addTransaction"]
    if result.get("realizedProfitLoss"):
        print(f"   💸 Realized P&L: ${result['realizedProfitLoss']:,.2f}")

def populate_portfolio(portfolio_data: Dict[str, Any], auth_token: str):
    """Create a portfolio and populate it with assets and transactions"""
    portfolio_id = create_portfolio(
        portfolio_data["name"],
        portfolio_data.get("description", ""),
        auth_token
    )

    for asset in portfolio_data["assets"]:
        symbol = asset["symbol"]
        print(f"  📊 Processing {symbol} transactions...")

        for transaction in asset["transactions"]:
            add_transaction(portfolio_id, symbol, transaction, auth_token)

    print(f"✅ Completed portfolio: {portfolio_data['name']}\n")

def main():
    parser = argparse.ArgumentParser(description="Populate sample portfolio data")
    parser.add_argument("--user-email", required=True, help="Email of user to create portfolios for")
    parser.add_argument("--user-password", default="AdminSecure2024!", help="Password for user login")
    parser.add_argument("--data-file", default="sample-portfolio-data.json", help="JSON file with sample data")

    args = parser.parse_args()

    try:
        # Load sample data
        print(f"📖 Loading sample data from {args.data_file}...")
        with open(args.data_file, 'r') as f:
            sample_data = json.load(f)

        # Login user
        auth_token = login_user(args.user_email, args.user_password)

        # Create portfolios and populate with data
        portfolios = sample_data["portfolios"]
        print(f"🚀 Creating {len(portfolios)} sample portfolios...\n")

        for portfolio_data in portfolios:
            populate_portfolio(portfolio_data, auth_token)

        print("🎉 Sample data population completed successfully!")
        print("\n📋 Summary:")
        print(f"   • Created {len(portfolios)} portfolios")

        total_assets = sum(len(p["assets"]) for p in portfolios)
        total_transactions = sum(
            len(asset["transactions"])
            for p in portfolios
            for asset in p["assets"]
        )

        print(f"   • Processed {total_assets} unique asset positions")
        print(f"   • Added {total_transactions} transactions")
        print(f"\n🔗 View your portfolios at: https://cryptassist.chandlerhardy.com")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return 1

    return 0

if __name__ == "__main__":
    exit(main())