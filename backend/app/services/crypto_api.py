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
            "per_page": limit,
            "page": 1,
            "sparkline": False
        }
        
        if settings.coingecko_api_key:
            # Use Pro API if key is available
            headers = {"X-CG-Pro-API-Key": settings.coingecko_api_key}
            response = await self.client.get(url, params=params, headers=headers)
        else:
            # Use free API with rate limits
            response = await self.client.get(url, params=params)
        
        response.raise_for_status()
        return response.json()
    
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
        except httpx.HTTPStatusError:
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
        
        try:
            if settings.coingecko_api_key:
                headers = {"X-CG-Pro-API-Key": settings.coingecko_api_key}
                response = await self.client.get(url, params=params, headers=headers)
            else:
                response = await self.client.get(url, params=params)
            
            response.raise_for_status()
            data = response.json()
            
            # Convert to list of price data points
            price_history = []
            for timestamp, price in data.get("prices", []):
                price_history.append({
                    "timestamp": int(timestamp),
                    "price": float(price)
                })
            
            return price_history
        except httpx.HTTPStatusError:
            return []
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Global instance
crypto_api_service = CryptoAPIService()