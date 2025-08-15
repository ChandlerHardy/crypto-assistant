export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply?: number;
  max_supply?: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface PortfolioAsset {
  id: string;
  crypto_id: string;
  symbol: string;
  name: string;
  amount: number;
  average_buy_price: number;
  current_price: number;
  total_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
}

export interface Portfolio {
  id: string;
  name: string;
  total_value: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
  assets: PortfolioAsset[];
  created_at: string;
  updated_at: string;
}

export interface PriceData {
  timestamp: number;
  price: number;
}