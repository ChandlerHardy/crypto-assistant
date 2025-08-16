'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PORTFOLIOS } from '@/lib/graphql/queries';
import { CREATE_PORTFOLIO } from '@/lib/graphql/mutations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Plus, X } from 'lucide-react';
import { Portfolio } from '@/types/crypto';

export function PortfolioOverview() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const { data, loading, error, refetch } = useQuery(GET_PORTFOLIOS, {
    pollInterval: 30000,
  });

  const [createPortfolio, { loading: creating }] = useMutation(CREATE_PORTFOLIO, {
    onCompleted: () => {
      setIsModalOpen(false);
      setName('');
      setDescription('');
      refetch();
    },
    onError: (error) => {
      alert('Failed to create portfolio: ' + error.message);
    },
  });

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createPortfolio({
      variables: {
        input: {
          name: name.trim(),
          description: description.trim() || null,
        },
      },
    });
  };

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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Portfolio
            </button>
          </div>
        </CardContent>
        
        {/* Modal */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            style={{ zIndex: 9999 }}
            onClick={() => setIsModalOpen(false)}
          >
            <div 
              className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Portfolio
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePortfolio}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Crypto Portfolio"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || creating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating...' : 'Create Portfolio'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Card>
    );
  }

  const totalValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
  const totalProfitLoss = portfolios.reduce((sum, p) => sum + p.totalProfitLoss, 0);
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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
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
                  {portfolio.description && (
                    <p className="text-sm text-gray-500">{portfolio.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {portfolio.assets.length} assets
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ${portfolio.totalValue.toLocaleString()}
                  </p>
                  <p className={`text-sm ${
                    portfolio.totalProfitLossPercentage >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {portfolio.totalProfitLossPercentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal for when portfolios exist */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          style={{ zIndex: 9999 }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Create New Portfolio
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePortfolio}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Crypto Portfolio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}