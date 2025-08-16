import strawberry
from typing import Optional
from datetime import datetime
import uuid
from app.schemas.types import Portfolio, PortfolioAsset, CreatePortfolioInput, AddAssetInput

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
            totalValue=0.0,
            totalProfitLoss=0.0,
            totalProfitLossPercentage=0.0,
            assets=[],
            createdAt=now,
            updatedAt=now
        )
        
        # Store in memory
        PORTFOLIOS[portfolio_id] = portfolio
        
        return portfolio
    
    @strawberry.mutation
    async def delete_portfolio(self, portfolio_id: str) -> bool:
        """Delete a portfolio"""
        # TODO: Implement with database service
        raise NotImplementedError("delete_portfolio mutation not implemented yet")
    
    @strawberry.mutation
    async def add_asset_to_portfolio(self, input: AddAssetInput) -> PortfolioAsset:
        """Add an asset to a portfolio"""
        # TODO: Implement with database service
        raise NotImplementedError("add_asset_to_portfolio mutation not implemented yet")
    
    @strawberry.mutation
    async def remove_asset_from_portfolio(
        self, 
        portfolio_id: str, 
        asset_id: str
    ) -> bool:
        """Remove an asset from a portfolio"""
        # TODO: Implement with database service
        raise NotImplementedError("remove_asset_from_portfolio mutation not implemented yet")
    
    @strawberry.mutation
    async def update_asset_amount(
        self, 
        asset_id: str, 
        new_amount: float
    ) -> PortfolioAsset:
        """Update the amount of an asset in portfolio"""
        # TODO: Implement with database service
        raise NotImplementedError("update_asset_amount mutation not implemented yet")