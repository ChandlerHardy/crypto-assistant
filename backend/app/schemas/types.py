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
class AssetTransaction:
    id: str
    transaction_type: str = strawberry.field(name="transactionType")  # "buy" or "sell"
    amount: float
    price_per_unit: float = strawberry.field(name="pricePerUnit")
    total_value: float = strawberry.field(name="totalValue")
    realized_profit_loss: float = strawberry.field(name="realizedProfitLoss", default=0.0)
    timestamp: datetime
    notes: Optional[str] = None
    # Additional fields for portfolio transaction history
    crypto_id: Optional[str] = strawberry.field(name="cryptoId", default=None)
    symbol: Optional[str] = None
    name: Optional[str] = None

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
    transactions: List["AssetTransaction"] = strawberry.field(default_factory=list)

@strawberry.type
class Portfolio:
    id: str
    name: str
    description: Optional[str] = None
    total_value: float = strawberry.field(name="totalValue")
    total_profit_loss: float = strawberry.field(name="totalProfitLoss")
    total_profit_loss_percentage: float = strawberry.field(name="totalProfitLossPercentage")
    total_realized_profit_loss: float = strawberry.field(name="totalRealizedProfitLoss", default=0.0)
    total_cost_basis: float = strawberry.field(name="totalCostBasis", default=0.0)
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

@strawberry.input
class UpdateAssetInput:
    portfolio_id: str = strawberry.field(name="portfolioId")
    asset_id: str = strawberry.field(name="assetId")
    amount: float
    buy_price: float = strawberry.field(name="buyPrice")

@strawberry.input
class AddTransactionInput:
    portfolio_id: str = strawberry.field(name="portfolioId")
    asset_id: str = strawberry.field(name="assetId")
    transaction_type: str = strawberry.field(name="transactionType")  # "buy" or "sell"
    amount: float
    price_per_unit: float = strawberry.field(name="pricePerUnit")
    notes: Optional[str] = None

@strawberry.type
class User:
    id: str
    email: str
    is_active: bool = strawberry.field(name="isActive")
    is_verified: bool = strawberry.field(name="isVerified")
    is_admin: bool = strawberry.field(name="isAdmin")
    created_at: datetime = strawberry.field(name="createdAt")
    last_login: Optional[datetime] = strawberry.field(name="lastLogin", default=None)

@strawberry.type
class AuthResponse:
    user: User
    access_token: str = strawberry.field(name="accessToken")
    token_type: str = strawberry.field(name="tokenType", default="bearer")

@strawberry.input
class RegisterInput:
    email: str
    password: str

@strawberry.input
class LoginInput:
    email: str
    password: str