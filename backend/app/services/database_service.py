from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.models import PortfolioModel, PortfolioAssetModel, AssetTransactionModel
from app.database.connection import SessionLocal
from app.schemas.types import Portfolio, PortfolioAsset, AssetTransaction

class DatabaseService:
    def __init__(self):
        self.db: Session = SessionLocal()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.db.rollback()
        else:
            self.db.commit()
        self.db.close()
    
    # Portfolio operations
    def create_portfolio(self, name: str, description: Optional[str] = None) -> PortfolioModel:
        """Create a new portfolio"""
        portfolio = PortfolioModel(
            name=name,
            description=description,
            total_value=0.0,
            total_profit_loss=0.0,
            total_profit_loss_percentage=0.0
        )
        self.db.add(portfolio)
        self.db.commit()
        self.db.refresh(portfolio)
        return portfolio
    
    def get_portfolio(self, portfolio_id: str) -> Optional[PortfolioModel]:
        """Get portfolio by ID"""
        return self.db.query(PortfolioModel).filter(PortfolioModel.id == portfolio_id).first()
    
    def get_all_portfolios(self) -> List[PortfolioModel]:
        """Get all portfolios"""
        return self.db.query(PortfolioModel).all()
    
    def delete_portfolio(self, portfolio_id: str) -> bool:
        """Delete portfolio by ID"""
        portfolio = self.get_portfolio(portfolio_id)
        if portfolio:
            self.db.delete(portfolio)
            self.db.commit()
            return True
        return False
    
    def update_portfolio_totals(self, portfolio_id: str):
        """Recalculate and update portfolio totals"""
        portfolio = self.get_portfolio(portfolio_id)
        if not portfolio:
            return
        
        # Calculate totals from assets
        total_value = sum(asset.total_value for asset in portfolio.assets)
        total_profit_loss = sum(asset.profit_loss for asset in portfolio.assets)
        total_profit_loss_percentage = (
            (total_profit_loss / (total_value - total_profit_loss) * 100) 
            if (total_value - total_profit_loss) > 0 else 0
        )
        
        # Update portfolio
        portfolio.total_value = total_value
        portfolio.total_profit_loss = total_profit_loss
        portfolio.total_profit_loss_percentage = total_profit_loss_percentage
        portfolio.updated_at = datetime.utcnow()
        
        self.db.commit()
    
    # Asset operations
    def create_asset(self, portfolio_id: str, crypto_id: str, symbol: str, name: str,
                    amount: float, average_buy_price: float, current_price: float) -> PortfolioAssetModel:
        """Create a new asset in a portfolio"""
        total_value = current_price * amount
        profit_loss = total_value - (average_buy_price * amount)
        profit_loss_percentage = ((current_price - average_buy_price) / average_buy_price * 100) if average_buy_price > 0 else 0
        
        asset = PortfolioAssetModel(
            portfolio_id=portfolio_id,
            crypto_id=crypto_id,
            symbol=symbol,
            name=name,
            amount=amount,
            average_buy_price=average_buy_price,
            current_price=current_price,
            total_value=total_value,
            profit_loss=profit_loss,
            profit_loss_percentage=profit_loss_percentage
        )
        
        self.db.add(asset)
        self.db.commit()
        self.db.refresh(asset)
        return asset
    
    def get_asset(self, asset_id: str) -> Optional[PortfolioAssetModel]:
        """Get asset by ID"""
        return self.db.query(PortfolioAssetModel).filter(PortfolioAssetModel.id == asset_id).first()
    
    def update_asset(self, asset_id: str, amount: float, average_buy_price: float, current_price: float) -> Optional[PortfolioAssetModel]:
        """Update an asset"""
        asset = self.get_asset(asset_id)
        if not asset:
            return None
        
        total_value = current_price * amount
        profit_loss = total_value - (average_buy_price * amount)
        profit_loss_percentage = ((current_price - average_buy_price) / average_buy_price * 100) if average_buy_price > 0 else 0
        
        asset.amount = amount
        asset.average_buy_price = average_buy_price
        asset.current_price = current_price
        asset.total_value = total_value
        asset.profit_loss = profit_loss
        asset.profit_loss_percentage = profit_loss_percentage
        
        self.db.commit()
        self.db.refresh(asset)
        return asset
    
    def delete_asset(self, asset_id: str) -> bool:
        """Delete asset by ID"""
        asset = self.get_asset(asset_id)
        if asset:
            self.db.delete(asset)
            self.db.commit()
            return True
        return False
    
    # Transaction operations
    def create_transaction(self, asset_id: str, transaction_type: str, amount: float,
                          price_per_unit: float, notes: Optional[str] = None) -> AssetTransactionModel:
        """Create a new transaction"""
        total_value = amount * price_per_unit
        
        transaction = AssetTransactionModel(
            asset_id=asset_id,
            transaction_type=transaction_type,
            amount=amount,
            price_per_unit=price_per_unit,
            total_value=total_value,
            notes=notes
        )
        
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def get_asset_transactions(self, asset_id: str) -> List[AssetTransactionModel]:
        """Get all transactions for an asset"""
        return self.db.query(AssetTransactionModel).filter(AssetTransactionModel.asset_id == asset_id).all()
    
    def recalculate_asset_from_transactions(self, asset_id: str, current_price: float) -> Optional[PortfolioAssetModel]:
        """Recalculate asset values based on all transactions"""
        asset = self.get_asset(asset_id)
        if not asset:
            return None
        
        transactions = self.get_asset_transactions(asset_id)
        buy_transactions = [t for t in transactions if t.transaction_type == "buy"]
        sell_transactions = [t for t in transactions if t.transaction_type == "sell"]
        
        total_bought = sum(t.amount for t in buy_transactions)
        total_sold = sum(t.amount for t in sell_transactions)
        current_amount = total_bought - total_sold
        
        if current_amount <= 0:
            # Delete asset if no holdings remain
            self.delete_asset(asset_id)
            return None
        
        # Calculate weighted average buy price
        total_cost = sum(t.total_value for t in buy_transactions)
        average_buy_price = total_cost / total_bought if total_bought > 0 else 0
        
        # Update asset
        return self.update_asset(asset_id, current_amount, average_buy_price, current_price)