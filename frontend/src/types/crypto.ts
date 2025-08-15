export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  fullyDilutedValuation?: number;
  totalVolume: number;
  high24h: number;
  low24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCapChange24h: number;
  marketCapChangePercentage24h: number;
  circulatingSupply: number;
  totalSupply?: number;
  maxSupply?: number;
  ath: number;
  athChangePercentage: number;
  athDate: string;
  atl: number;
  atlChangePercentage: number;
  atlDate: string;
  lastUpdated: string;
}

export interface PortfolioAsset {
  id: string;
  cryptoId: string;
  symbol: string;
  name: string;
  amount: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  assets: PortfolioAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface PriceData {
  timestamp: string;
  price: number;
}