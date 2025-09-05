import { gql } from '@apollo/client';

export const CREATE_PORTFOLIO = gql`
  mutation CreatePortfolio($input: CreatePortfolioInput!) {
    createPortfolio(input: $input) {
      id
      name
      description
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

export const UPDATE_PORTFOLIO = gql`
  mutation UpdatePortfolio($portfolioId: String!, $name: String, $description: String) {
    updatePortfolio(portfolioId: $portfolioId, name: $name, description: $description) {
      id
      name
      description
      totalValue
      totalProfitLoss
      totalProfitLossPercentage
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PORTFOLIO = gql`
  mutation DeletePortfolio($portfolioId: String!) {
    deletePortfolio(portfolioId: $portfolioId)
  }
`;

export const ADD_ASSET_TO_PORTFOLIO = gql`
  mutation AddAssetToPortfolio($input: AddAssetInput!) {
    addAssetToPortfolio(input: $input) {
      id
      cryptoId
      symbol
      name
      amount
      averageBuyPrice
      currentPrice
      totalValue
      profitLoss
      profitLossPercentage
    }
  }
`;

export const REMOVE_ASSET_FROM_PORTFOLIO = gql`
  mutation RemoveAssetFromPortfolio($portfolioId: String!, $assetId: String!) {
    removeAssetFromPortfolio(portfolioId: $portfolioId, assetId: $assetId)
  }
`;

export const UPDATE_ASSET = gql`
  mutation UpdateAsset($input: UpdateAssetInput!) {
    updateAsset(input: $input) {
      id
      cryptoId
      symbol
      name
      amount
      averageBuyPrice
      currentPrice
      totalValue
      profitLoss
      profitLossPercentage
      transactions {
        id
        transactionType
        amount
        pricePerUnit
        totalValue
        realizedProfitLoss
        timestamp
        notes
      }
    }
  }
`;

export const ADD_TRANSACTION = gql`
  mutation AddTransaction($input: AddTransactionInput!) {
    addTransaction(input: $input) {
      id
      transactionType
      amount
      pricePerUnit
      totalValue
      realizedProfitLoss
      timestamp
      notes
    }
  }
`;