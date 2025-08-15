"""
WebSocket manager for real-time updates
"""
import asyncio
import json
from typing import Dict, Set, Any
from websockets.server import WebSocketServerProtocol
from app.services.crypto_api import crypto_api_service

class WebSocketManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        self.connections: Dict[str, Set[WebSocketServerProtocol]] = {}
        self.price_subscriptions: Dict[str, Set[str]] = {}  # connection_id -> crypto_ids
        
    async def connect(self, websocket: WebSocketServerProtocol, connection_id: str):
        """Register a new WebSocket connection"""
        if connection_id not in self.connections:
            self.connections[connection_id] = set()
        self.connections[connection_id].add(websocket)
        
    async def disconnect(self, websocket: WebSocketServerProtocol, connection_id: str):
        """Unregister a WebSocket connection"""
        if connection_id in self.connections:
            self.connections[connection_id].discard(websocket)
            if not self.connections[connection_id]:
                del self.connections[connection_id]
                # Clean up subscriptions
                if connection_id in self.price_subscriptions:
                    del self.price_subscriptions[connection_id]
    
    async def subscribe_to_prices(self, connection_id: str, crypto_ids: list[str]):
        """Subscribe connection to price updates for specific cryptos"""
        self.price_subscriptions[connection_id] = set(crypto_ids)
    
    async def broadcast_price_update(self, crypto_id: str, price_data: Dict[str, Any]):
        """Broadcast price update to subscribed connections"""
        message = json.dumps({
            "type": "price_update",
            "crypto_id": crypto_id,
            "data": price_data
        })
        
        # Find connections subscribed to this crypto
        for connection_id, crypto_ids in self.price_subscriptions.items():
            if crypto_id in crypto_ids and connection_id in self.connections:
                # Send to all websockets for this connection
                for websocket in self.connections[connection_id].copy():
                    try:
                        await websocket.send(message)
                    except Exception:
                        # Remove failed connection
                        await self.disconnect(websocket, connection_id)
    
    async def broadcast_portfolio_update(self, portfolio_id: str, portfolio_data: Dict[str, Any]):
        """Broadcast portfolio update to relevant connections"""
        message = json.dumps({
            "type": "portfolio_update",
            "portfolio_id": portfolio_id,
            "data": portfolio_data
        })
        
        # For now, broadcast to all connections
        # TODO: Implement user-specific subscriptions
        for connection_id, websockets in self.connections.items():
            for websocket in websockets.copy():
                try:
                    await websocket.send(message)
                except Exception:
                    await self.disconnect(websocket, connection_id)

# Global instance
websocket_manager = WebSocketManager()