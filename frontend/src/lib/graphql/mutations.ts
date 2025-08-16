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
  mutation UpdatePortfolio($id: String!, $name: String, $description: String) {
    updatePortfolio(id: $id, name: $name, description: $description) {
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
  mutation DeletePortfolio($id: String!) {
    deletePortfolio(id: $id)
  }
`;

export const ADD_ASSET_TO_PORTFOLIO = gql`
  mutation AddAssetToPortfolio($portfolioId: String!, $cryptoId: String!, $amount: Float!, $purchasePrice: Float!) {
    addAssetToPortfolio(portfolioId: $portfolioId, cryptoId: $cryptoId, amount: $amount, purchasePrice: $purchasePrice) {
      id
      symbol
      name
      amount
      purchasePrice
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