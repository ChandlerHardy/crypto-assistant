import strawberry
from typing import List, Optional
from datetime import datetime

@strawberry.type
class CryptoCurrency:
    id: str
    symbol: str
    name: str
    current_price: float = strawberry.field(name="currentPrice")
    market_cap: float = strawberry.field(name="marketCap")
    market_cap_rank: int = strawberry.field(name="marketCapRank")
    fully_diluted_valuation: Optional[float] = strawberry.field(name="fullyDilutedValuation", default=None)
    total_volume: float = strawberry.field(name="totalVolume")
    high_24h: float = strawberry.field(name="high24h")
    low_24h: float = strawberry.field(name="low24h")
    price_change_24h: float = strawberry.field(name="priceChange24h")
    price_change_percentage_24h: float = strawberry.field(name="priceChangePercentage24h")
    market_cap_change_24h: float = strawberry.field(name="marketCapChange24h")
    market_cap_change_percentage_24h: float = strawberry.field(name="marketCapChangePercentage24h")
    circulating_supply: float = strawberry.field(name="circulatingSupply")
    total_supply: Optional[float] = strawberry.field(name="totalSupply", default=None)
    max_supply: Optional[float] = strawberry.field(name="maxSupply", default=None)
    ath: float
    ath_change_percentage: float = strawberry.field(name="athChangePercentage")
    ath_date: datetime = strawberry.field(name="athDate")
    atl: float
    atl_change_percentage: float = strawberry.field(name="atlChangePercentage")
    atl_date: datetime = strawberry.field(name="atlDate")
    last_updated: datetime = strawberry.field(name="lastUpdated")

@strawberry.type
class PortfolioAsset:
    id: str
    crypto_id: str = strawberry.field(name="cryptoId")
    symbol: str
    name: str
    amount: float
    average_buy_price: float = strawberry.field(name="averageBuyPrice")
    current_price: float = strawberry.field(name="currentPrice")
    total_value: float = strawberry.field(name="totalValue")
    profit_loss: float = strawberry.field(name="profitLoss")
    profit_loss_percentage: float = strawberry.field(name="profitLossPercentage")

@strawberry.type
class Portfolio:
    id: str
    name: str
    description: Optional[str] = None
    total_value: float = strawberry.field(name="totalValue")
    total_profit_loss: float = strawberry.field(name="totalProfitLoss")
    total_profit_loss_percentage: float = strawberry.field(name="totalProfitLossPercentage")
    assets: List[PortfolioAsset]
    created_at: datetime = strawberry.field(name="createdAt")
    updated_at: datetime = strawberry.field(name="updatedAt")

@strawberry.type
class PriceData:
    timestamp: str  # Use string for large timestamp values
    price: float

@strawberry.input
class CreatePortfolioInput:
    name: str
    description: Optional[str] = None

@strawberry.input
class AddAssetInput:
    portfolio_id: str = strawberry.field(name="portfolioId")
    crypto_id: str = strawberry.field(name="cryptoId")
    amount: float
    buy_price: float = strawberry.field(name="buyPrice")