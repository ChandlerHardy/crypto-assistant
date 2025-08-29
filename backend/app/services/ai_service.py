import os
import httpx
import json
from typing import List, Dict, Optional
from app.core.config import settings
from app.services.crypto_api import crypto_api_service


class GitHubLlamaService:
    """Service for interacting with GitHub's Llama 3.1 8B model"""
    
    def __init__(self):
        self.endpoint = "https://models.github.ai/inference"
        self.model_name = "meta/Meta-Llama-3.1-8B-Instruct"
        self.token = settings.github_token
        
        if not self.token:
            raise ValueError("GITHUB_TOKEN environment variable is required")
    
    async def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        temperature: float = 0.7,
        max_tokens: int = 1000,
        top_p: float = 0.9
    ) -> str:
        """
        Send chat completion request to GitHub's Llama model
        
        Args:
            messages: List of message objects with 'role' and 'content'
            temperature: Randomness in response (0.0 to 1.0)
            max_tokens: Maximum tokens in response
            top_p: Nucleus sampling parameter
            
        Returns:
            Generated response content
        """
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messages": messages,
            "temperature": temperature,
            "top_p": top_p,
            "max_tokens": max_tokens,
            "model": self.model_name
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.endpoint}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    error_detail = response.text
                    raise Exception(f"API request failed with status {response.status_code}: {error_detail}")
                
                result = response.json()
                
                if "choices" not in result or len(result["choices"]) == 0:
                    raise Exception("No response choices returned from API")
                
                return result["choices"][0]["message"]["content"]
                
            except httpx.TimeoutException:
                raise Exception("Request to AI service timed out")
            except httpx.RequestError as e:
                raise Exception(f"Request failed: {str(e)}")
    
    async def get_portfolio_advice(
        self, 
        portfolio_data: Dict,
        market_context: Optional[str] = None
    ) -> str:
        """
        Get AI advice specifically for cryptocurrency portfolio management
        
        Args:
            portfolio_data: Current portfolio information
            market_context: Additional market context/trends
            
        Returns:
            AI-generated portfolio advice
        """
        # Format portfolio data for AI context
        portfolio_summary = self._format_portfolio_for_ai(portfolio_data)
        
        system_prompt = """You are an expert cryptocurrency portfolio advisor with deep knowledge of markets, analysis, and risk management. Provide detailed, actionable portfolio analysis including:

- Specific allocation percentages and rebalancing suggestions
- Risk assessment based on portfolio composition and correlation
- Diversification recommendations across market caps, sectors, and use cases
- Entry/exit strategies based on market conditions and cycles  
- Technical analysis of holdings and market trends
- Fundamental evaluation of projects and tokenomics
- Yield opportunities through staking, DeFi, and protocols

Give concrete, specific advice while including this disclaimer: "This analysis is for educational purposes and represents market insights, not personalized financial advice. Cryptocurrency investments are highly volatile and risky. Only invest what you can afford to lose and conduct thorough research before making decisions."

Be analytical, specific, and focus on actionable insights for informed decision-making."""

        user_prompt = f"""Here's my current crypto portfolio:

{portfolio_summary}

{f"Current market context: {market_context}" if market_context else ""}

Can you analyze my portfolio and provide suggestions for:
1. Overall risk level assessment
2. Diversification improvements
3. Potential rebalancing opportunities
4. Any red flags or concerns

Please keep your advice practical and educational."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        return await self.chat_completion(messages, temperature=0.7)
    
    def _format_portfolio_for_ai(self, portfolio_data: Dict) -> str:
        """Format portfolio data into readable text for AI analysis"""
        if not portfolio_data or "assets" not in portfolio_data:
            return "No portfolio data available"
        
        total_value = portfolio_data.get("total_value", 0)
        assets = portfolio_data.get("assets", [])
        
        summary = f"Total Portfolio Value: ${total_value:,.2f}\n\n"
        summary += "Holdings:\n"
        
        for asset in assets:
            symbol = asset.get("symbol", "Unknown")
            amount = asset.get("amount", 0)
            current_price = asset.get("current_price", 0)
            total_asset_value = asset.get("total_value", 0)
            profit_loss = asset.get("profit_loss", 0)
            profit_loss_pct = asset.get("profit_loss_percentage", 0)
            
            percentage_of_portfolio = (total_asset_value / total_value * 100) if total_value > 0 else 0
            
            summary += f"- {symbol}: {amount:.6f} tokens @ ${current_price:.4f} = ${total_asset_value:.2f} ({percentage_of_portfolio:.1f}% of portfolio)\n"
            summary += f"  P&L: ${profit_loss:.2f} ({profit_loss_pct:+.2f}%)\n"
        
        return summary

    async def get_current_market_context(self) -> str:
        """Fetch current market data to provide context to AI"""
        try:
            # Get top 10 cryptocurrencies with current market data
            market_data = await crypto_api_service.get_cryptocurrencies(10)
            
            if not market_data:
                return "Unable to fetch current market data."
            
            context = "**Current Market Data (Real-time):**\n\n"
            
            for crypto in market_data[:5]:  # Top 5 for context
                name = crypto.get('name', 'Unknown')
                symbol = crypto.get('symbol', '').upper()
                price = crypto.get('current_price', 0)
                change_24h = crypto.get('price_change_percentage_24h', 0)
                market_cap_rank = crypto.get('market_cap_rank', 0)
                
                change_indicator = "📈" if change_24h > 0 else "📉" if change_24h < 0 else "➡️"
                
                context += f"**{name} ({symbol})**: ${price:,.2f} {change_indicator} {change_24h:+.2f}% (24h) - Rank #{market_cap_rank}\n"
            
            # Calculate market sentiment
            positive_movers = sum(1 for crypto in market_data if crypto.get('price_change_percentage_24h', 0) > 0)
            total_cryptos = len(market_data)
            sentiment_ratio = positive_movers / total_cryptos if total_cryptos > 0 else 0
            
            if sentiment_ratio > 0.6:
                market_sentiment = "Bullish (majority of top cryptos are up)"
            elif sentiment_ratio < 0.4:
                market_sentiment = "Bearish (majority of top cryptos are down)"
            else:
                market_sentiment = "Mixed (balanced gains and losses)"
            
            context += f"\n**Market Sentiment**: {market_sentiment} ({positive_movers}/{total_cryptos} cryptos are positive)\n"
            context += "\n*This data is current as of now and should inform your analysis.*\n"
            
            return context
            
        except Exception as e:
            print(f"Error fetching market context: {e}")
            return "Unable to fetch current market data for context."


# Singleton instance
ai_service = GitHubLlamaService()