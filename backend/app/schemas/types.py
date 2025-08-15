import strawberry
from typing import List, Optional
from datetime import datetime

@strawberry.type
class CryptoCurrency:
    id: str
    symbol: str
    name: str
    currentPrice: float
    marketCap: float
    marketCapRank: int
    fullyDilutedValuation: Optional[float] = None
    totalVolume: float
    high24h: float
    low24h: float
    priceChange24h: float
    priceChangePercentage24h: float
    marketCapChange24h: float
    marketCapChangePercentage24h: float
    circulatingSupply: float
    totalSupply: Optional[float] = None
    maxSupply: Optional[float] = None
    ath: float
    athChangePercentage: float
    athDate: datetime
    atl: float
    atlChangePercentage: float
    atlDate: datetime
    lastUpdated: datetime

@strawberry.type
class PortfolioAsset:
    id: str
    cryptoId: str
    symbol: str
    name: str
    amount: float
    averageBuyPrice: float
    currentPrice: float
    totalValue: float
    profitLoss: float
    profitLossPercentage: float

@strawberry.type
class Portfolio:
    id: str
    name: str
    totalValue: float
    totalProfitLoss: float
    totalProfitLossPercentage: float
    assets: List[PortfolioAsset]
    createdAt: datetime
    updatedAt: datetime

@strawberry.type
class PriceData:
    timestamp: str  # Use string for large timestamp values
    price: float

@strawberry.input
class CreatePortfolioInput:
    name: str

@strawberry.input
class AddAssetInput:
    portfolio_id: str
    crypto_id: str
    amount: float
    buy_price: float