import strawberry
from typing import List, Optional
from datetime import datetime

@strawberry.type
class CryptoCurrency:
    id: str
    symbol: str
    name: str
    current_price: float
    market_cap: float
    market_cap_rank: int
    fully_diluted_valuation: Optional[float] = None
    total_volume: float
    high_24h: float
    low_24h: float
    price_change_24h: float
    price_change_percentage_24h: float
    market_cap_change_24h: float
    market_cap_change_percentage_24h: float
    circulating_supply: float
    total_supply: Optional[float] = None
    max_supply: Optional[float] = None
    ath: float
    ath_change_percentage: float
    ath_date: datetime
    atl: float
    atl_change_percentage: float
    atl_date: datetime
    last_updated: datetime

@strawberry.type
class PortfolioAsset:
    id: str
    crypto_id: str
    symbol: str
    name: str
    amount: float
    average_buy_price: float
    current_price: float
    total_value: float
    profit_loss: float
    profit_loss_percentage: float

@strawberry.type
class Portfolio:
    id: str
    name: str
    total_value: float
    total_profit_loss: float
    total_profit_loss_percentage: float
    assets: List[PortfolioAsset]
    created_at: datetime
    updated_at: datetime

@strawberry.type
class PriceData:
    timestamp: int
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