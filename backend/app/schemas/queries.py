import strawberry
from typing import List, Optional
from datetime import datetime
from app.schemas.types import CryptoCurrency, Portfolio, PriceData
from app.services.crypto_api import crypto_api_service

@strawberry.type
class Query:
    @strawberry.field
    async def cryptocurrencies(self, limit: int = 100) -> List[CryptoCurrency]:
        """Get list of cryptocurrencies with market data"""
        try:
            data = await crypto_api_service.get_cryptocurrencies(limit)
            
            cryptocurrencies = []
            for item in data:
                crypto = CryptoCurrency(
                    id=item["id"],
                    symbol=item["symbol"],
                    name=item["name"],
                    currentPrice=float(item.get("current_price", 0)),
                    marketCap=float(item.get("market_cap", 0)),
                    marketCapRank=int(item.get("market_cap_rank", 0)),
                    fullyDilutedValuation=float(item.get("fully_diluted_valuation", 0)) if item.get("fully_diluted_valuation") else None,
                    totalVolume=float(item.get("total_volume", 0)),
                    high24h=float(item.get("high_24h", 0)),
                    low24h=float(item.get("low_24h", 0)),
                    priceChange24h=float(item.get("price_change_24h", 0)),
                    priceChangePercentage24h=float(item.get("price_change_percentage_24h", 0)),
                    marketCapChange24h=float(item.get("market_cap_change_24h", 0)),
                    marketCapChangePercentage24h=float(item.get("market_cap_change_percentage_24h", 0)),
                    circulatingSupply=float(item.get("circulating_supply", 0)),
                    totalSupply=float(item.get("total_supply", 0)) if item.get("total_supply") else None,
                    maxSupply=float(item.get("max_supply", 0)) if item.get("max_supply") else None,
                    ath=float(item.get("ath", 0)),
                    athChangePercentage=float(item.get("ath_change_percentage", 0)),
                    athDate=datetime.fromisoformat(item.get("ath_date", "2021-01-01T00:00:00.000Z").replace("Z", "+00:00")),
                    atl=float(item.get("atl", 0)),
                    atlChangePercentage=float(item.get("atl_change_percentage", 0)),
                    atlDate=datetime.fromisoformat(item.get("atl_date", "2021-01-01T00:00:00.000Z").replace("Z", "+00:00")),
                    lastUpdated=datetime.fromisoformat(item.get("last_updated", "2021-01-01T00:00:00.000Z").replace("Z", "+00:00"))
                )
                cryptocurrencies.append(crypto)
            
            return cryptocurrencies
        except Exception as e:
            print(f"Error fetching cryptocurrencies: {e}")
            return []
    
    @strawberry.field
    async def cryptocurrency(self, id: str) -> Optional[CryptoCurrency]:
        """Get specific cryptocurrency by ID"""
        try:
            data = await crypto_api_service.get_cryptocurrency_by_id(id)
            if not data:
                return None
                
            market_data = data.get("market_data", {})
            
            return CryptoCurrency(
                id=data["id"],
                symbol=data["symbol"],
                name=data["name"],
                currentPrice=float(market_data.get("current_price", {}).get("usd", 0)),
                marketCap=float(market_data.get("market_cap", {}).get("usd", 0)),
                marketCapRank=int(market_data.get("market_cap_rank", 0)),
                fullyDilutedValuation=float(market_data.get("fully_diluted_valuation", {}).get("usd", 0)) if market_data.get("fully_diluted_valuation", {}).get("usd") else None,
                totalVolume=float(market_data.get("total_volume", {}).get("usd", 0)),
                high24h=float(market_data.get("high_24h", {}).get("usd", 0)),
                low24h=float(market_data.get("low_24h", {}).get("usd", 0)),
                priceChange24h=float(market_data.get("price_change_24h", 0)),
                priceChangePercentage24h=float(market_data.get("price_change_percentage_24h", 0)),
                marketCapChange24h=float(market_data.get("market_cap_change_24h", 0)),
                marketCapChangePercentage24h=float(market_data.get("market_cap_change_percentage_24h", 0)),
                circulatingSupply=float(market_data.get("circulating_supply", 0)),
                totalSupply=float(market_data.get("total_supply", 0)) if market_data.get("total_supply") else None,
                maxSupply=float(market_data.get("max_supply", 0)) if market_data.get("max_supply") else None,
                ath=float(market_data.get("ath", {}).get("usd", 0)),
                athChangePercentage=float(market_data.get("ath_change_percentage", {}).get("usd", 0)),
                athDate=datetime.fromisoformat(market_data.get("ath_date", {}).get("usd", "2021-01-01T00:00:00.000Z").replace("Z", "+00:00")),
                atl=float(market_data.get("atl", {}).get("usd", 0)),
                atlChangePercentage=float(market_data.get("atl_change_percentage", {}).get("usd", 0)),
                atlDate=datetime.fromisoformat(market_data.get("atl_date", {}).get("usd", "2021-01-01T00:00:00.000Z").replace("Z", "+00:00")),
                lastUpdated=datetime.fromisoformat(data.get("last_updated", "2021-01-01T00:00:00.000Z").replace("Z", "+00:00"))
            )
        except Exception as e:
            print(f"Error fetching cryptocurrency {id}: {e}")
            return None
    
    @strawberry.field
    async def portfolios(self) -> List[Portfolio]:
        """Get all user portfolios"""
        from app.schemas.mutations import PORTFOLIOS
        return list(PORTFOLIOS.values())
    
    @strawberry.field
    async def portfolio(self, id: str) -> Optional[Portfolio]:
        """Get specific portfolio by ID"""
        # TODO: Implement with database service
        return None
    
    @strawberry.field
    async def priceHistory(
        self, 
        cryptoId: str, 
        days: int = 30
    ) -> List[PriceData]:
        """Get price history for a cryptocurrency"""
        try:
            data = await crypto_api_service.get_price_history(cryptoId, days)
            return [
                PriceData(timestamp=str(item["timestamp"]), price=item["price"])
                for item in data
            ]
        except Exception as e:
            print(f"Error fetching price history for {cryptoId}: {e}")
            return []