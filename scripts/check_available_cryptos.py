#!/usr/bin/env python3
import requests

GRAPHQL_URL = "https://backend.chandlerhardy.com/cryptassist/graphql"

# Get available cryptocurrencies
response = requests.post(
    GRAPHQL_URL,
    json={
        "query": "query { cryptocurrencies { id name symbol currentPrice } }"
    }
)

if response.status_code == 200:
    data = response.json()
    print("Raw response:", data)
    if "data" in data and data["data"] and "cryptocurrencies" in data["data"]:
        cryptos = data["data"]["cryptocurrencies"]
        print(f"📊 Found {len(cryptos)} available cryptocurrencies:")
        print("=" * 60)

        for crypto in cryptos[:20]:  # Show first 20
            print(f"{crypto['symbol']:>6} | {crypto['id']:<20} | {crypto['name']:<30} | ${crypto['currentPrice']:>10,.2f}")

        if len(cryptos) > 20:
            print(f"... and {len(cryptos) - 20} more")
    else:
        print("No data returned")
        print("Response:", response.json())
else:
    print(f"Error: {response.status_code}")
    print("Response:", response.text)