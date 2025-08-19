import strawberry
from typing import Optional
from datetime import datetime
import uuid
from app.schemas.types import Portfolio, PortfolioAsset, CreatePortfolioInput, AddAssetInput, UpdateAssetInput

# Simple in-memory storage for portfolios (would be replaced with database in production)
PORTFOLIOS = {}

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_portfolio(self, input: CreatePortfolioInput) -> Portfolio:
        """Create a new portfolio"""
        portfolio_id = str(uuid.uuid4())
        now = datetime.now()
        
        portfolio = Portfolio(
            id=portfolio_id,
            name=input.name,
            description=input.description,
            total_value=0.0,
            total_profit_loss=0.0,
            total_profit_loss_percentage=0.0,
            assets=[],
            created_at=now,
            updated_at=now
        )
        
        # Store in memory
        PORTFOLIOS[portfolio_id] = portfolio
        
        return portfolio
    
    @strawberry.mutation
    async def delete_portfolio(self, portfolio_id: str = strawberry.argument(name="portfolioId")) -> bool:
        """Delete a portfolio"""
        # Check if portfolio exists
        if portfolio_id not in PORTFOLIOS:
            raise Exception(f"Portfolio {portfolio_id} not found")
        
        # Delete the portfolio
        del PORTFOLIOS[portfolio_id]
        
        return True
    
    @strawberry.mutation
    async def add_asset_to_portfolio(self, input: AddAssetInput) -> PortfolioAsset:
        """Add an asset to a portfolio"""
        from app.services.crypto_api import crypto_api_service
        
        # Check if portfolio exists
        if input.portfolio_id not in PORTFOLIOS:
            raise Exception(f"Portfolio {input.portfolio_id} not found")
        
        portfolio = PORTFOLIOS[input.portfolio_id]
        
        # Get current crypto price
        crypto_data = await crypto_api_service.get_cryptocurrency_by_id(input.crypto_id)
        if not crypto_data:
            # Fallback: Try to find the crypto in the markets data
            markets_data = await crypto_api_service.get_cryptocurrencies(100)
            crypto_match = next((crypto for crypto in markets_data if crypto.get("id") == input.crypto_id), None)
            
            if crypto_match:
                # Convert markets data format to individual coin format
                crypto_data = {
                    "id": crypto_match.get("id"),
                    "symbol": crypto_match.get("symbol"),
                    "name": crypto_match.get("name"),
                    "market_data": {
                        "current_price": {
                            "usd": crypto_match.get("current_price", 0)
                        }
                    }
                }
            else:
                raise Exception(f"Cryptocurrency {input.crypto_id} not found")
        
        current_price = float(crypto_data.get("market_data", {}).get("current_price", {}).get("usd", 0))
        
        # Create new asset
        asset_id = str(uuid.uuid4())
        total_value = current_price * input.amount
        profit_loss = total_value - (input.buy_price * input.amount)
        profit_loss_percentage = ((current_price - input.buy_price) / input.buy_price * 100) if input.buy_price > 0 else 0
        
        asset = PortfolioAsset(
            id=asset_id,
            crypto_id=input.crypto_id,
            symbol=crypto_data.get("symbol", "").upper(),
            name=crypto_data.get("name", ""),
            amount=input.amount,
            average_buy_price=input.buy_price,
            current_price=current_price,
            total_value=total_value,
            profit_loss=profit_loss,
            profit_loss_percentage=profit_loss_percentage
        )
        
        # Add asset to portfolio
        portfolio.assets.append(asset)
        
        # Recalculate portfolio totals
        portfolio.total_value = sum(asset.total_value for asset in portfolio.assets)
        portfolio.total_profit_loss = sum(asset.profit_loss for asset in portfolio.assets)
        portfolio.total_profit_loss_percentage = (
            (portfolio.total_profit_loss / (portfolio.total_value - portfolio.total_profit_loss) * 100) 
            if (portfolio.total_value - portfolio.total_profit_loss) > 0 else 0
        )
        portfolio.updated_at = datetime.now()
        
        return asset
    
    @strawberry.mutation
    async def remove_asset_from_portfolio(
        self, 
        portfolio_id: str = strawberry.argument(name="portfolioId"), 
        asset_id: str = strawberry.argument(name="assetId")
    ) -> bool:
        """Remove an asset from a portfolio"""
        # TODO: Implement with database service
        raise NotImplementedError("remove_asset_from_portfolio mutation not implemented yet")
    
    @strawberry.mutation
    async def update_asset(self, input: UpdateAssetInput) -> PortfolioAsset:
        """Update an asset in a portfolio"""
        from app.services.crypto_api import crypto_api_service
        
        # Check if portfolio exists
        if input.portfolio_id not in PORTFOLIOS:
            raise Exception(f"Portfolio {input.portfolio_id} not found")
        
        portfolio = PORTFOLIOS[input.portfolio_id]
        
        # Find the asset to update
        asset_to_update = None
        asset_index = None
        for i, asset in enumerate(portfolio.assets):
            if asset.id == input.asset_id:
                asset_to_update = asset
                asset_index = i
                break
        
        if not asset_to_update:
            raise Exception(f"Asset {input.asset_id} not found in portfolio {input.portfolio_id}")
        
        # Get current crypto price
        crypto_data = await crypto_api_service.get_cryptocurrency_by_id(asset_to_update.crypto_id)
        if not crypto_data:
            # Fallback: Try to find the crypto in the markets data
            markets_data = await crypto_api_service.get_cryptocurrencies(100)
            crypto_match = next((crypto for crypto in markets_data if crypto.get("id") == asset_to_update.crypto_id), None)
            
            if crypto_match:
                # Convert markets data format to individual coin format
                crypto_data = {
                    "id": crypto_match.get("id"),
                    "symbol": crypto_match.get("symbol"),
                    "name": crypto_match.get("name"),
                    "market_data": {
                        "current_price": {
                            "usd": crypto_match.get("current_price", 0)
                        }
                    }
                }
            else:
                raise Exception(f"Cryptocurrency {asset_to_update.crypto_id} not found")
        
        current_price = float(crypto_data.get("market_data", {}).get("current_price", {}).get("usd", 0))
        
        # Update asset properties
        total_value = current_price * input.amount
        profit_loss = total_value - (input.buy_price * input.amount)
        profit_loss_percentage = ((current_price - input.buy_price) / input.buy_price * 100) if input.buy_price > 0 else 0
        
        # Create updated asset
        updated_asset = PortfolioAsset(
            id=asset_to_update.id,
            crypto_id=asset_to_update.crypto_id,
            symbol=asset_to_update.symbol,
            name=asset_to_update.name,
            amount=input.amount,
            average_buy_price=input.buy_price,
            current_price=current_price,
            total_value=total_value,
            profit_loss=profit_loss,
            profit_loss_percentage=profit_loss_percentage
        )
        
        # Replace the asset in the portfolio
        portfolio.assets[asset_index] = updated_asset
        
        # Recalculate portfolio totals
        portfolio.total_value = sum(asset.total_value for asset in portfolio.assets)
        portfolio.total_profit_loss = sum(asset.profit_loss for asset in portfolio.assets)
        portfolio.total_profit_loss_percentage = (
            (portfolio.total_profit_loss / (portfolio.total_value - portfolio.total_profit_loss) * 100) 
            if (portfolio.total_value - portfolio.total_profit_loss) > 0 else 0
        )
        portfolio.updated_at = datetime.now()
        
        return updated_asset