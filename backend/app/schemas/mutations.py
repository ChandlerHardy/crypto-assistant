import strawberry
from typing import Optional
from datetime import datetime
import uuid
from app.schemas.types import Portfolio, PortfolioAsset, AssetTransaction, CreatePortfolioInput, AddAssetInput, UpdateAssetInput, AddTransactionInput

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
        
        # Create initial transaction
        initial_transaction = AssetTransaction(
            id=str(uuid.uuid4()),
            transaction_type="buy",
            amount=input.amount,
            price_per_unit=input.buy_price,
            total_value=input.buy_price * input.amount,
            timestamp=datetime.now(),
            notes="Initial purchase"
        )

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
            profit_loss_percentage=profit_loss_percentage,
            transactions=[initial_transaction]
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
    
    @strawberry.mutation
    async def add_transaction(self, input: AddTransactionInput) -> AssetTransaction:
        """Add a transaction (buy/sell) to an asset"""
        # Check if portfolio exists
        if input.portfolio_id not in PORTFOLIOS:
            raise Exception(f"Portfolio {input.portfolio_id} not found")
        
        portfolio = PORTFOLIOS[input.portfolio_id]
        
        # Find the asset
        asset_to_update = None
        asset_index = None
        for i, asset in enumerate(portfolio.assets):
            if asset.id == input.asset_id:
                asset_to_update = asset
                asset_index = i
                break
        
        if not asset_to_update:
            raise Exception(f"Asset {input.asset_id} not found in portfolio {input.portfolio_id}")
        
        # Create new transaction
        transaction_id = str(uuid.uuid4())
        total_value = input.amount * input.price_per_unit
        
        transaction = AssetTransaction(
            id=transaction_id,
            transaction_type=input.transaction_type,
            amount=input.amount,
            price_per_unit=input.price_per_unit,
            total_value=total_value,
            timestamp=datetime.now(),
            notes=input.notes
        )
        
        # Add transaction to asset
        if not hasattr(asset_to_update, 'transactions') or asset_to_update.transactions is None:
            asset_to_update.transactions = []
        asset_to_update.transactions.append(transaction)
        
        # Recalculate asset totals based on all transactions
        buy_transactions = [t for t in asset_to_update.transactions if t.transaction_type == "buy"]
        sell_transactions = [t for t in asset_to_update.transactions if t.transaction_type == "sell"]
        
        total_bought = sum(t.amount for t in buy_transactions)
        total_sold = sum(t.amount for t in sell_transactions)
        current_amount = total_bought - total_sold
        
        if current_amount <= 0:
            # If all sold, remove asset from portfolio
            portfolio.assets.pop(asset_index)
        else:
            # Calculate weighted average buy price
            total_cost = sum(t.total_value for t in buy_transactions)
            average_buy_price = total_cost / total_bought if total_bought > 0 else 0
            
            # Get current price from API
            from app.services.crypto_api import crypto_api_service
            crypto_data = await crypto_api_service.get_cryptocurrency_by_id(asset_to_update.crypto_id)
            if not crypto_data:
                # Fallback to markets data
                markets_data = await crypto_api_service.get_cryptocurrencies(100)
                crypto_match = next((crypto for crypto in markets_data if crypto.get("id") == asset_to_update.crypto_id), None)
                if crypto_match:
                    crypto_data = {
                        "market_data": {
                            "current_price": {
                                "usd": crypto_match.get("current_price", 0)
                            }
                        }
                    }
            
            current_price = float(crypto_data.get("market_data", {}).get("current_price", {}).get("usd", 0)) if crypto_data else asset_to_update.current_price
            
            # Update asset with new calculated values
            current_total_value = current_price * current_amount
            profit_loss = current_total_value - (average_buy_price * current_amount)
            profit_loss_percentage = ((current_price - average_buy_price) / average_buy_price * 100) if average_buy_price > 0 else 0
            
            updated_asset = PortfolioAsset(
                id=asset_to_update.id,
                crypto_id=asset_to_update.crypto_id,
                symbol=asset_to_update.symbol,
                name=asset_to_update.name,
                amount=current_amount,
                average_buy_price=average_buy_price,
                current_price=current_price,
                total_value=current_total_value,
                profit_loss=profit_loss,
                profit_loss_percentage=profit_loss_percentage,
                transactions=asset_to_update.transactions
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
        
        return transaction