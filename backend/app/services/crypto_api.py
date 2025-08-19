"""
Crypto API service for fetching real-time cryptocurrency data
"""
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings

class CryptoAPIService:
    """Service for fetching cryptocurrency data from external APIs"""
    
    def __init__(self):
        self.client = httpx.AsyncClient()
        self.coingecko_base_url = "https://api.coingecko.com/api/v3"
    
    async def get_cryptocurrencies(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Fetch list of cryptocurrencies from CoinGecko"""
        url = f"{self.coingecko_base_url}/coins/markets"
        params = {
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": min(limit, 250),  # CoinGecko max per page
            "page": 1,
            "sparkline": "false"
        }
        
        headers = {}
        if settings.coingecko_api_key:
            # Use Pro API if key is available
            headers["x-cg-demo-api-key"] = settings.coingecko_api_key
        
        try:
            response = await self.client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"CoinGecko API error: {e}")
            # Return mock data if API fails
            return self._get_mock_crypto_data(limit)
    
    async def get_cryptocurrency_by_id(self, crypto_id: str) -> Optional[Dict[str, Any]]:
        """Fetch specific cryptocurrency by ID"""
        url = f"{self.coingecko_base_url}/coins/{crypto_id}"
        params = {
            "localization": False,
            "tickers": False,
            "market_data": True,
            "community_data": False,
            "developer_data": False,
            "sparkline": False
        }
        
        try:
            if settings.coingecko_api_key:
                headers = {"X-CG-Pro-API-Key": settings.coingecko_api_key}
                response = await self.client.get(url, params=params, headers=headers)
            else:
                response = await self.client.get(url, params=params)
            
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            print(f"HTTP error fetching {crypto_id}: {e.response.status_code} - {e.response.text}")
            return None
        except Exception as e:
            print(f"Error fetching cryptocurrency {crypto_id}: {e}")
            return None
    
    async def get_price_history(
        self, 
        crypto_id: str, 
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """Fetch price history for a cryptocurrency"""
        url = f"{self.coingecko_base_url}/coins/{crypto_id}/market_chart"
        params = {
            "vs_currency": "usd",
            "days": days,
            "interval": "daily" if days > 1 else "hourly"
        }
        
        headers = {}
        if settings.coingecko_api_key:
            headers["x-cg-demo-api-key"] = settings.coingecko_api_key
        
        try:
            response = await self.client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            # Convert to list of price data points
            price_history = []
            for timestamp, price in data.get("prices", []):
                price_history.append({
                    "timestamp": str(int(timestamp)),
                    "price": float(price)
                })
            
            return price_history
        except Exception as e:
            print(f"CoinGecko price history error: {e}")
            # Return mock price history data
            return self._get_mock_price_history(crypto_id, days)
    
    def _get_mock_crypto_data(self, limit: int) -> List[Dict[str, Any]]:
        """Return mock cryptocurrency data when API is unavailable"""
        mock_data = [
            {
                "id": "bitcoin",
                "symbol": "btc",
                "name": "Bitcoin",
                "current_price": 117267,
                "market_cap": 2335474293409,
                "market_cap_rank": 1,
                "fully_diluted_valuation": 2335474293409,
                "total_volume": 45763501965,
                "high_24h": 119273,
                "low_24h": 116956,
                "price_change_24h": -888.59,
                "price_change_percentage_24h": -0.75,
                "market_cap_change_24h": -14408370200,
                "market_cap_change_percentage_24h": -0.61,
                "circulating_supply": 19906862,
                "total_supply": 19906862,
                "max_supply": 21000000,
                "ath": 124128,
                "ath_change_percentage": -5.47,
                "ath_date": "2025-08-14T00:37:02.582Z",
                "atl": 67.81,
                "atl_change_percentage": 172943.21,
                "atl_date": "2013-07-06T00:00:00.000Z",
                "last_updated": "2025-08-15T21:11:07.250Z"
            },
            {
                "id": "ethereum",
                "symbol": "eth",
                "name": "Ethereum",
                "current_price": 4413,
                "market_cap": 533202280850,
                "market_cap_rank": 2,
                "fully_diluted_valuation": 533202280850,
                "total_volume": 48901623705,
                "high_24h": 4662.24,
                "low_24h": 4381.31,
                "price_change_24h": -121.39,
                "price_change_percentage_24h": -2.68,
                "market_cap_change_24h": -13065138509,
                "market_cap_change_percentage_24h": -2.39,
                "circulating_supply": 120708029.72,
                "total_supply": 120708029.72,
                "max_supply": None,
                "ath": 4878.26,
                "ath_change_percentage": -9.32,
                "ath_date": "2021-11-10T14:24:19.604Z",
                "atl": 0.432979,
                "atl_change_percentage": 1021540.27,
                "atl_date": "2015-10-20T00:00:00.000Z",
                "last_updated": "2025-08-15T21:11:00.688Z"
            },
            {
                "id": "ripple",
                "symbol": "xrp",
                "name": "XRP",
                "current_price": 3.08,
                "market_cap": 182654830913,
                "market_cap_rank": 3,
                "fully_diluted_valuation": 307931227813,
                "total_volume": 7191467989,
                "high_24h": 3.14,
                "low_24h": 3.01,
                "price_change_24h": 0.005,
                "price_change_percentage_24h": 0.16,
                "market_cap_change_24h": 176945230,
                "market_cap_change_percentage_24h": 0.097,
                "circulating_supply": 59308385925,
                "total_supply": 99985880506,
                "max_supply": 100000000000,
                "ath": 3.65,
                "ath_change_percentage": -15.61,
                "ath_date": "2025-07-18T03:40:53.808Z",
                "atl": 0.00268621,
                "atl_change_percentage": 114448.78,
                "atl_date": "2014-05-22T00:00:00.000Z",
                "last_updated": "2025-08-15T21:11:01.939Z"
            }
        ]
        return mock_data[:limit]

    def _get_mock_price_history(self, crypto_id: str, days: int) -> List[Dict[str, Any]]:
        """Return mock price history data when API is unavailable"""
        import time
        from datetime import datetime, timedelta
        
        # Base prices for different cryptos
        base_prices = {
            "bitcoin": 117000,
            "ethereum": 4400,
            "ripple": 3.08
        }
        
        base_price = base_prices.get(crypto_id, 50000)
        price_history = []
        
        # Generate realistic price data for the last 'days' days
        for i in range(days):
            # Calculate timestamp (days ago)
            date = datetime.now() - timedelta(days=days-i-1)
            timestamp = int(date.timestamp() * 1000)
            
            # Generate realistic price variation (±5% random walk)
            import random
            variation = random.uniform(-0.05, 0.05)
            price = base_price * (1 + variation * (i / days))
            
            price_history.append({
                "timestamp": str(timestamp),
                "price": float(price)
            })
        
        return price_history

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Global instance
crypto_api_service = CryptoAPIService()