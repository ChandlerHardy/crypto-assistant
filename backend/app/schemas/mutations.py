import strawberry
from typing import Optional, List, Dict
from datetime import datetime
import uuid
from app.schemas.types import Portfolio, PortfolioAsset, AssetTransaction, CreatePortfolioInput, AddAssetInput, UpdateAssetInput, AddTransactionInput
from app.services.database_service import DatabaseService
from app.database.models import PortfolioModel, PortfolioAssetModel, AssetTransactionModel

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_portfolio(self, input: CreatePortfolioInput) -> Portfolio:
        """Create a new portfolio"""
        with DatabaseService() as db_service:
            portfolio_model = db_service.create_portfolio(input.name, input.description)
            
            return Portfolio(
                id=portfolio_model.id,
                name=portfolio_model.name,
                description=portfolio_model.description,
                total_value=portfolio_model.total_value,
                total_profit_loss=portfolio_model.total_profit_loss,
                total_profit_loss_percentage=portfolio_model.total_profit_loss_percentage,
                assets=[],
                created_at=portfolio_model.created_at,
                updated_at=portfolio_model.updated_at
            )
    
    @strawberry.mutation
    async def delete_portfolio(self, portfolio_id: str = strawberry.argument(name="portfolioId")) -> bool:
        """Delete a portfolio"""
        with DatabaseService() as db_service:
            success = db_service.delete_portfolio(portfolio_id)
            if not success:
                raise Exception(f"Portfolio {portfolio_id} not found")
            return True
    
    @strawberry.mutation
    async def add_asset_to_portfolio(self, input: AddAssetInput) -> PortfolioAsset:
        """Add an asset to a portfolio"""
        from app.services.crypto_api import crypto_api_service
        
        with DatabaseService() as db_service:
            # Check if portfolio exists
            portfolio = db_service.get_portfolio(input.portfolio_id)
            if not portfolio:
                raise Exception(f"Portfolio {input.portfolio_id} not found")
            
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
            asset_model = db_service.create_asset(
                portfolio_id=input.portfolio_id,
                crypto_id=input.crypto_id,
                symbol=crypto_data.get("symbol", "").upper(),
                name=crypto_data.get("name", ""),
                amount=input.amount,
                average_buy_price=input.buy_price,
                current_price=current_price
            )
            
            # Create initial transaction
            transaction_model = db_service.create_transaction(
                asset_id=asset_model.id,
                transaction_type="buy",
                amount=input.amount,
                price_per_unit=input.buy_price,
                notes="Initial purchase"
            )
            
            # Update portfolio totals
            db_service.update_portfolio_totals(input.portfolio_id)
            
            # Convert to GraphQL types
            initial_transaction = AssetTransaction(
                id=transaction_model.id,
                transaction_type=transaction_model.transaction_type,
                amount=transaction_model.amount,
                price_per_unit=transaction_model.price_per_unit,
                total_value=transaction_model.total_value,
                timestamp=transaction_model.timestamp,
                notes=transaction_model.notes
            )
            
            return PortfolioAsset(
                id=asset_model.id,
                crypto_id=asset_model.crypto_id,
                symbol=asset_model.symbol,
                name=asset_model.name,
                amount=asset_model.amount,
                average_buy_price=asset_model.average_buy_price,
                current_price=asset_model.current_price,
                total_value=asset_model.total_value,
                profit_loss=asset_model.profit_loss,
                profit_loss_percentage=asset_model.profit_loss_percentage,
                transactions=[initial_transaction]
            )
    
    @strawberry.mutation
    async def remove_asset_from_portfolio(
        self, 
        portfolio_id: str = strawberry.argument(name="portfolioId"), 
        asset_id: str = strawberry.argument(name="assetId")
    ) -> bool:
        """Remove an asset from a portfolio"""
        with DatabaseService() as db_service:
            success = db_service.delete_asset(asset_id)
            if success:
                db_service.update_portfolio_totals(portfolio_id)
            return success
    
    @strawberry.mutation
    async def update_asset(self, input: UpdateAssetInput) -> PortfolioAsset:
        """Update an asset in a portfolio"""
        from app.services.crypto_api import crypto_api_service
        
        with DatabaseService() as db_service:
            # Check if asset exists
            asset_model = db_service.get_asset(input.asset_id)
            if not asset_model:
                raise Exception(f"Asset {input.asset_id} not found")
            
            # Get current crypto price
            crypto_data = await crypto_api_service.get_cryptocurrency_by_id(asset_model.crypto_id)
            if not crypto_data:
                # Fallback: Try to find the crypto in the markets data
                markets_data = await crypto_api_service.get_cryptocurrencies(100)
                crypto_match = next((crypto for crypto in markets_data if crypto.get("id") == asset_model.crypto_id), None)
                
                if crypto_match:
                    # Convert markets data format to individual coin format
                    crypto_data = {
                        "market_data": {
                            "current_price": {
                                "usd": crypto_match.get("current_price", 0)
                            }
                        }
                    }
                else:
                    raise Exception(f"Cryptocurrency {asset_model.crypto_id} not found")
            
            current_price = float(crypto_data.get("market_data", {}).get("current_price", {}).get("usd", 0))
            
            # Update asset
            updated_asset_model = db_service.update_asset(
                input.asset_id,
                input.amount,
                input.buy_price,
                current_price
            )
            
            if not updated_asset_model:
                raise Exception(f"Failed to update asset {input.asset_id}")
            
            # Update portfolio totals
            db_service.update_portfolio_totals(input.portfolio_id)
            
            # Get transactions for response
            transactions = db_service.get_asset_transactions(input.asset_id)
            transaction_list = [
                AssetTransaction(
                    id=t.id,
                    transaction_type=t.transaction_type,
                    amount=t.amount,
                    price_per_unit=t.price_per_unit,
                    total_value=t.total_value,
                    timestamp=t.timestamp,
                    notes=t.notes
                ) for t in transactions
            ]
            
            return PortfolioAsset(
                id=updated_asset_model.id,
                crypto_id=updated_asset_model.crypto_id,
                symbol=updated_asset_model.symbol,
                name=updated_asset_model.name,
                amount=updated_asset_model.amount,
                average_buy_price=updated_asset_model.average_buy_price,
                current_price=updated_asset_model.current_price,
                total_value=updated_asset_model.total_value,
                profit_loss=updated_asset_model.profit_loss,
                profit_loss_percentage=updated_asset_model.profit_loss_percentage,
                transactions=transaction_list
            )
    
    @strawberry.mutation
    async def add_transaction(self, input: AddTransactionInput) -> AssetTransaction:
        """Add a transaction (buy/sell) to an asset"""
        from app.services.crypto_api import crypto_api_service
        
        with DatabaseService() as db_service:
            # Check if asset exists
            asset_model = db_service.get_asset(input.asset_id)
            if not asset_model:
                raise Exception(f"Asset {input.asset_id} not found")
            
            # Create new transaction
            transaction_model = db_service.create_transaction(
                asset_id=input.asset_id,
                transaction_type=input.transaction_type,
                amount=input.amount,
                price_per_unit=input.price_per_unit,
                notes=input.notes
            )
            
            # Get current crypto price
            crypto_data = await crypto_api_service.get_cryptocurrency_by_id(asset_model.crypto_id)
            if not crypto_data:
                # Fallback to markets data
                markets_data = await crypto_api_service.get_cryptocurrencies(100)
                crypto_match = next((crypto for crypto in markets_data if crypto.get("id") == asset_model.crypto_id), None)
                if crypto_match:
                    crypto_data = {
                        "market_data": {
                            "current_price": {
                                "usd": crypto_match.get("current_price", 0)
                            }
                        }
                    }
            
            current_price = float(crypto_data.get("market_data", {}).get("current_price", {}).get("usd", 0)) if crypto_data else asset_model.current_price
            
            # Recalculate asset based on all transactions
            updated_asset_model = db_service.recalculate_asset_from_transactions(input.asset_id, current_price)
            
            # Update portfolio totals
            db_service.update_portfolio_totals(input.portfolio_id)
            
            return AssetTransaction(
                id=transaction_model.id,
                transaction_type=transaction_model.transaction_type,
                amount=transaction_model.amount,
                price_per_unit=transaction_model.price_per_unit,
                total_value=transaction_model.total_value,
                timestamp=transaction_model.timestamp,
                notes=transaction_model.notes
            )
    
    @strawberry.mutation
    async def get_portfolio_advice(self, portfolio_id: str = strawberry.argument(name="portfolioId")) -> str:
        """Get AI-powered advice for a specific portfolio"""
        try:
            from app.services.ai_service import ai_service
            
            with DatabaseService() as db_service:
                # Get portfolio data
                portfolio_model = db_service.get_portfolio(portfolio_id)
                if not portfolio_model:
                    raise Exception(f"Portfolio {portfolio_id} not found")
                
                # Get assets with current prices
                assets = db_service.get_portfolio_assets(portfolio_id)
                
                # Format portfolio data
                portfolio_data = {
                    "total_value": float(portfolio_model.total_value or 0),
                    "assets": []
                }
                
                for asset in assets:
                    portfolio_data["assets"].append({
                        "symbol": asset.symbol,
                        "amount": float(asset.amount or 0),
                        "current_price": float(asset.current_price or 0),
                        "total_value": float(asset.total_value or 0),
                        "profit_loss": float(asset.profit_loss or 0),
                        "profit_loss_percentage": float(asset.profit_loss_percentage or 0)
                    })
                
                # Get AI advice
                advice = await ai_service.get_portfolio_advice(portfolio_data)
                return advice
                
        except Exception as e:
            # Return user-friendly error message
            return f"I apologize, but I'm unable to provide advice at the moment due to a technical issue: {str(e)}. Please try again later or check that your GitHub token is properly configured."
    
    @strawberry.mutation
    async def chat_with_assistant(self, message: str, context: Optional[str] = None) -> str:
        """Chat with the AI assistant about crypto and portfolio management"""
        try:
            from app.services.ai_service import ai_service
            
            system_prompt = """You are CryptoAssist, an expert cryptocurrency advisor with access to real-time market data. You provide current, actionable insights about:

- Current cryptocurrency prices, trends, and market movements  
- Portfolio allocation strategies based on current market conditions
- DeFi protocols, staking opportunities, and yield farming
- Trading patterns, market cycles, and entry/exit strategies
- Blockchain technology, tokenomics, and project evaluation
- Real-time market sentiment and macro factors

**IMPORTANT**: You have access to current, real-time market data provided in the system messages. Always use this current data in your analysis rather than outdated information from your training. Reference current prices, recent price movements, and today's market sentiment.

You can:
- Analyze current market conditions and provide timely insights
- Discuss specific cryptocurrencies using their current prices and trends
- Explain current market movements and what's driving them today
- Recommend actions based on real-time market data
- Share insights about current market cycles and timing
- Compare current prices to historical levels and trends

Always include this disclaimer: "This is educational information and market analysis based on current data, not personalized financial advice. Cryptocurrency investments carry high risk and volatility. Only invest what you can afford to lose and always conduct your own research (DYOR) before making investment decisions."

Be detailed, analytical, and focus on current market conditions with specific, timely insights."""

            # Get current market data for context
            market_context = await ai_service.get_current_market_context()
            
            # Build messages array
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "system", "content": market_context}
            ]
            
            # Add additional context if provided
            if context:
                messages.append({
                    "role": "system", 
                    "content": f"Additional context: {context}"
                })
            
            # Add user message
            messages.append({
                "role": "user", 
                "content": message
            })
            
            # Get AI response
            response = await ai_service.chat_completion(messages, temperature=0.7)
            return response
            
        except Exception as e:
            return f"I apologize, but I'm experiencing technical difficulties right now: {str(e)}. Please try again in a moment!"