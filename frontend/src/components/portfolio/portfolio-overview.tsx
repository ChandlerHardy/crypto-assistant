'use client';

import { useQuery } from '@apollo/client';
import { GET_PORTFOLIOS } from '@/lib/graphql/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { Portfolio } from '@/types/crypto';

export function PortfolioOverview() {
  const { data, loading, error } = useQuery(GET_PORTFOLIOS, {
    pollInterval: 30000, // Refresh every 30 seconds
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-32 h-8 bg-gray-200 rounded mb-4"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Portfolio Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">Failed to load portfolio data</p>
            <p className="text-sm text-gray-400">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const portfolios: Portfolio[] = data?.portfolios || [];

  if (portfolios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Portfolio Overview</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No portfolios yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first portfolio to start tracking your crypto investments
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Create Portfolio
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = portfolios.reduce((sum, p) => sum + p.total_value, 0);
  const totalProfitLoss = portfolios.reduce((sum, p) => sum + p.total_profit_loss, 0);
  const totalProfitLossPercentage = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalValue.toLocaleString()}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total P&L</p>
                <p className={`text-2xl font-bold ${
                  totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${totalProfitLoss.toLocaleString()}
                </p>
              </div>
              {totalProfitLoss >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total P&L %</p>
                <p className={`text-2xl font-bold ${
                  totalProfitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalProfitLossPercentage.toFixed(2)}%
                </p>
              </div>
              {totalProfitLossPercentage >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Portfolios</span>
            <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-1" />
              Add Portfolio
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{portfolio.name}</h4>
                  <p className="text-sm text-gray-500">
                    {portfolio.assets.length} assets
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ${portfolio.total_value.toLocaleString()}
                  </p>
                  <p className={`text-sm ${
                    portfolio.total_profit_loss_percentage >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {portfolio.total_profit_loss_percentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}