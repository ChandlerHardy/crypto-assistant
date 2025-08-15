import { gql } from '@apollo/client';

export const GET_CRYPTOCURRENCIES = gql`
  query GetCryptocurrencies($limit: Int = 20) {
    cryptocurrencies(limit: $limit) {
      id
      symbol
      name
      currentPrice
      marketCap
      marketCapRank
      priceChange24h
      priceChangePercentage24h
      high24h
      low24h
      totalVolume
      lastUpdated
    }
  }
`;

export const GET_CRYPTOCURRENCY = gql`
  query GetCryptocurrency($id: String!) {
    cryptocurrency(id: $id) {
      id
      symbol
      name
      currentPrice
      marketCap
      marketCapRank
      priceChange24h
      priceChangePercentage24h
      high24h
      low24h
      ath
      atl
      totalVolume
      circulatingSupply
      maxSupply
      lastUpdated
    }
  }
`;

export const GET_PORTFOLIOS = gql`
  query GetPortfolios {
    portfolios {
      id
      name
      totalValue
      totalProfitLoss
      totalProfitLossPercentage
      createdAt
      updatedAt
      assets {
        id
        symbol
        name
        amount
        currentPrice
        totalValue
        profitLoss
        profitLossPercentage
      }
    }
  }
`;

export const GET_PRICE_HISTORY = gql`
  query GetPriceHistory($cryptoId: String!, $days: Int = 30) {
    priceHistory(cryptoId: $cryptoId, days: $days) {
      timestamp
      price
    }
  }
`;