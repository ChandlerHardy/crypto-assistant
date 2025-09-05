'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PORTFOLIOS } from '@/lib/graphql/queries';
import { CREATE_PORTFOLIO, DELETE_PORTFOLIO } from '@/lib/graphql/mutations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AddAssetModal } from '@/components/portfolio/add-asset-modal';
import { AssetDetailModal } from '@/components/portfolio/asset-detail-modal';
import { PortfolioTransactionsModal } from '@/components/portfolio/portfolio-transactions-modal';
import { PortfolioPerformanceChart } from '@/components/portfolio/portfolio-performance-chart';
import { CustomizableDashboard } from '@/components/dashboard/customizable-dashboard';
import { CryptoList } from '@/components/crypto/crypto-list';
import { Wallet, TrendingUp, TrendingDown, Plus, X, Trash2, History } from 'lucide-react';
import { Portfolio, PortfolioAsset } from '@/types/crypto';

export function PortfolioOverview() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isAssetDetailModalOpen, setIsAssetDetailModalOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<PortfolioAsset | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteConfirmPortfolio, setDeleteConfirmPortfolio] = useState<Portfolio | null>(null);
  
  const { data, loading, error, refetch } = useQuery(GET_PORTFOLIOS, {
    pollInterval: 120000, // Poll every 2 minutes (reduce API load)
  });

  const [createPortfolio, { loading: creating }] = useMutation(CREATE_PORTFOLIO, {
    onCompleted: () => {
      setIsCreateModalOpen(false);
      setName('');
      setDescription('');
      refetch();
    },
    onError: (error) => {
      alert('Failed to create portfolio: ' + error.message);
    },
  });

  const [deletePortfolio, { loading: deleting }] = useMutation(DELETE_PORTFOLIO, {
    onCompleted: () => {
      setDeleteConfirmPortfolio(null);
      refetch();
    },
    onError: (error) => {
      alert('Failed to delete portfolio: ' + error.message);
    },
  });

  const handleAddAsset = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsAddAssetModalOpen(true);
  };

  const handleEditAsset = (asset: PortfolioAsset, portfolio: Portfolio) => {
    setSelectedAsset(asset);
    setSelectedPortfolio(portfolio);
    setIsAssetDetailModalOpen(true);
  };

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

  const handleDeletePortfolio = async (portfolio: Portfolio) => {
    await deletePortfolio({
      variables: {
        portfolioId: portfolio.id,
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No portfolios yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first portfolio to start tracking your crypto investments
            </p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Portfolio
            </button>
          </div>
        </CardContent>
        
        {/* Create Portfolio Modal */}
        {isCreateModalOpen && (
          <div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            style={{ zIndex: 9999 }}
            onClick={() => setIsCreateModalOpen(false)}
          >
            <div 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Portfolio
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePortfolio}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portfolio Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Crypto Portfolio"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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
  const totalUnrealizedPL = portfolios.reduce((sum, p) => sum + p.totalProfitLoss, 0);
  const totalRealizedPL = portfolios.reduce((sum, p) => sum + (p.totalRealizedProfitLoss || 0), 0);
  const totalProfitLoss = totalUnrealizedPL + totalRealizedPL;
  const totalCostBasis = portfolios.reduce((sum, p) => sum + (p.totalCostBasis || 0), 0);
  
  // Use the backend-calculated percentage, but recalculate if we have multiple portfolios
  const totalProfitLossPercentage = portfolios.length === 1 
    ? portfolios[0].totalProfitLossPercentage 
    : totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0;

  // Extract sections as separate components
  const summaryCardsSection = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total P&L</p>
                <p className={`text-2xl font-bold ${
                  totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${totalProfitLoss.toLocaleString()}
                </p>
                {(totalRealizedPL !== 0 || totalUnrealizedPL !== 0) && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {totalRealizedPL !== 0 && (
                      <span className={totalRealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}>
                        Realized: ${totalRealizedPL.toLocaleString()}
                      </span>
                    )}
                    {totalRealizedPL !== 0 && totalUnrealizedPL !== 0 && <span> • </span>}
                    {totalUnrealizedPL !== 0 && (
                      <span className={totalUnrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}>
                        Unrealized: ${totalUnrealizedPL.toLocaleString()} ({totalValue > 0 ? 
                          ((totalUnrealizedPL / (totalValue - totalUnrealizedPL)) * 100).toFixed(2) : '0.00'}%)
                      </span>
                    )}
                  </div>
                )}
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total P&L %</p>
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
  );

  const performanceChartSection = portfolios.length > 0 && portfolios[0].assets.length > 0 ? (
    <PortfolioPerformanceChart portfolio={portfolios[0]} />
  ) : (
    <Card>
      <CardContent className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Add assets to your portfolio to see performance chart</p>
      </CardContent>
    </Card>
  );

  const topCryptosSection = (
    <CryptoList limit={10} />
  );

  const portfolioListSection = (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Portfolios</span>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
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
              <div key={portfolio.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                {/* Portfolio Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{portfolio.name}</h4>
                    {portfolio.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{portfolio.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${portfolio.totalValue.toLocaleString()}
                      </p>
                      <p className={`text-sm ${
                        (portfolio.totalProfitLoss + (portfolio.totalRealizedProfitLoss || 0)) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(portfolio.totalProfitLoss + (portfolio.totalRealizedProfitLoss || 0)) >= 0 ? '+' : ''}{
                          portfolio.totalValue > 0 
                            ? (((portfolio.totalProfitLoss + (portfolio.totalRealizedProfitLoss || 0)) / (portfolio.totalValue - portfolio.totalProfitLoss)) * 100).toFixed(2)
                            : '0.00'
                        }%
                      </p>
                      {portfolio.totalRealizedProfitLoss !== 0 && (
                        <p className={`text-xs ${
                          portfolio.totalRealizedProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Realized: {portfolio.totalRealizedProfitLoss >= 0 ? '+' : ''}${portfolio.totalRealizedProfitLoss.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPortfolio(portfolio);
                        setIsTransactionsModalOpen(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="View transaction history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmPortfolio(portfolio)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete portfolio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Assets List */}
                {portfolio.assets.length > 0 ? (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Assets ({portfolio.assets.length})</h5>
                    {portfolio.assets.map((asset) => (
                      <div 
                        key={asset.id} 
                        onClick={() => handleEditAsset(asset, portfolio)}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{asset.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{parseFloat(asset.amount.toFixed(8))} {asset.symbol.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ${asset.totalValue.toLocaleString()}
                          </p>
                          <p className={`text-xs ${
                            asset.profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {asset.profitLossPercentage >= 0 ? '+' : ''}{asset.profitLossPercentage.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No assets yet. Add your first cryptocurrency!
                  </div>
                )}

                {/* Add Asset Button */}
                <button
                  onClick={() => handleAddAsset(portfolio)}
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Asset
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
  );

  return (
    <>
      <CustomizableDashboard
        summaryCards={summaryCardsSection}
        performanceChart={performanceChartSection}
        portfolioList={portfolioListSection}
        topCryptos={topCryptosSection}
      />

      {/* Create Portfolio Modal for when portfolios exist */}
      {isCreateModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          style={{ zIndex: 9999 }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                <Plus className="w-5 h-5 mr-2" />
                Create New Portfolio
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePortfolio}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Portfolio Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Crypto Portfolio"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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

      {/* Add Asset Modal */}
      {selectedPortfolio && (
        <AddAssetModal
          isOpen={isAddAssetModalOpen}
          onClose={() => {
            setIsAddAssetModalOpen(false);
            setSelectedPortfolio(null);
          }}
          portfolioId={selectedPortfolio.id}
          portfolioName={selectedPortfolio.name}
        />
      )}

      {/* Asset Detail Modal */}
      {selectedAsset && selectedPortfolio && (
        <AssetDetailModal
          isOpen={isAssetDetailModalOpen}
          onClose={() => {
            setIsAssetDetailModalOpen(false);
            setSelectedAsset(null);
            setSelectedPortfolio(null);
          }}
          asset={selectedAsset}
          portfolioId={selectedPortfolio.id}
          portfolioName={selectedPortfolio.name}
        />
      )}

      {/* Portfolio Transactions Modal */}
      {selectedPortfolio && (
        <PortfolioTransactionsModal
          isOpen={isTransactionsModalOpen}
          onClose={() => {
            setIsTransactionsModalOpen(false);
            setSelectedPortfolio(null);
          }}
          portfolioId={selectedPortfolio.id}
          portfolioName={selectedPortfolio.name}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmPortfolio && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          style={{ zIndex: 9999 }}
          onClick={() => setDeleteConfirmPortfolio(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                <Trash2 className="w-5 h-5 mr-2 text-red-600" />
                Delete Portfolio
              </h2>
              <button
                onClick={() => setDeleteConfirmPortfolio(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Are you sure you want to delete the portfolio <strong>&quot;{deleteConfirmPortfolio.name}&quot;</strong>?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone. All assets in this portfolio will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmPortfolio(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePortfolio(deleteConfirmPortfolio)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Portfolio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}