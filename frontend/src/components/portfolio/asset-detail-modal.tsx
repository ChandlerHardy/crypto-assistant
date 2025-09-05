'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { X, TrendingUp, TrendingDown, Plus, Minus, DollarSign } from 'lucide-react';
import { GET_PORTFOLIOS } from '@/lib/graphql/queries';
import { ADD_TRANSACTION } from '@/lib/graphql/mutations';
import { PortfolioAsset, AssetTransaction, Portfolio } from '@/types/crypto';

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: PortfolioAsset | null;
  portfolioId: string;
  portfolioName: string;
}

export function AssetDetailModal({ isOpen, onClose, asset, portfolioId, portfolioName }: AssetDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'add'>('transactions');
  const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch fresh portfolio data to get updated asset information
  const { data: portfolioData } = useQuery(GET_PORTFOLIOS, {
    pollInterval: 60000, // Poll every minute (reduce API load)
  });

  // Find the current asset from fresh data
  const currentAsset = portfolioData?.portfolios
    ?.find((p: Portfolio) => p.id === portfolioId)
    ?.assets?.find((a: PortfolioAsset) => a.id === asset?.id) || asset;

  const [addTransaction, { loading }] = useMutation(ADD_TRANSACTION, {
    refetchQueries: [{ query: GET_PORTFOLIOS }],
    onCompleted: () => {
      setAmount('');
      setPricePerUnit('');
      setNotes('');
      setActiveTab('transactions');
    },
    onError: (error) => {
      alert('Failed to add transaction: ' + error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAsset || !amount || !pricePerUnit) {
      alert('Please fill in all required fields');
      return;
    }

    const sellAmount = parseFloat(amount);
    
    // Validate sell amount doesn't exceed holdings
    if (transactionType === 'sell' && sellAmount > currentAsset.amount) {
      // Cap the sell amount to what they actually have
      const cappedAmount = currentAsset.amount;
      setAmount(cappedAmount.toString());
      
      const confirmMessage = `You only have ${parseFloat(currentAsset.amount.toFixed(8))} ${currentAsset.symbol.toUpperCase()}. ` +
        `The amount has been adjusted to sell your entire holding (${parseFloat(cappedAmount.toFixed(8))} ${currentAsset.symbol.toUpperCase()}). Continue?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
      
      // Use the capped amount for the transaction
      await addTransaction({
        variables: {
          input: {
            portfolioId: portfolioId,
            assetId: currentAsset.id,
            transactionType: transactionType,
            amount: cappedAmount,
            pricePerUnit: parseFloat(pricePerUnit),
            notes: notes.trim() || `Full sellout of ${cappedAmount} ${currentAsset.symbol.toUpperCase()}`,
          },
        },
      });
      
      // Show sellout notification
      alert(`Successfully sold all ${cappedAmount} ${currentAsset.symbol.toUpperCase()}! The asset has been removed from your portfolio.`);
      
      // Close modal since asset will be deleted
      onClose();
      return;
    }

    await addTransaction({
      variables: {
        input: {
          portfolioId: portfolioId,
          assetId: currentAsset.id,
          transactionType: transactionType,
          amount: sellAmount,
          pricePerUnit: parseFloat(pricePerUnit),
          notes: notes.trim() || null,
        },
      },
    });
    
    // Check if this was a full sellout
    if (transactionType === 'sell' && sellAmount >= currentAsset.amount) {
      alert(`Successfully sold all ${sellAmount} ${currentAsset.symbol.toUpperCase()}! The asset has been removed from your portfolio.`);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedTransactions = currentAsset?.transactions?.slice().sort((a: AssetTransaction, b: AssetTransaction) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ) || [];

  if (!isOpen || !currentAsset) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentAsset.name} ({currentAsset.symbol.toUpperCase()})
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">in {portfolioName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Asset Summary */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="space-y-4">
            {/* Holdings - Full width to prevent overflow */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Holdings</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">
                {parseFloat(currentAsset.amount.toFixed(8))} {currentAsset.symbol.toUpperCase()}
              </p>
            </div>
            
            {/* Price and Value Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Current Price</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${currentAsset.currentPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  ${currentAsset.totalValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">P&L</p>
                <div className="flex items-center space-x-1">
                  {currentAsset.profitLossPercentage >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <p className={`text-lg font-semibold ${
                    currentAsset.profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currentAsset.profitLossPercentage >= 0 ? '+' : ''}{currentAsset.profitLossPercentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Transaction History ({sortedTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'add'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Add Transaction
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'transactions' ? (
            <div className="space-y-3">
              {sortedTransactions.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No transactions yet
                </p>
              ) : (
                sortedTransactions.map((transaction: AssetTransaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-full ${
                        transaction.transactionType === 'buy' 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        {transaction.transactionType === 'buy' ? (
                          <Plus className={`w-3 h-3 ${
                            transaction.transactionType === 'buy' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        ) : (
                          <Minus className="w-3 h-3 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.transactionType === 'buy' ? 'Bought' : 'Sold'} {transaction.amount} {currentAsset.symbol.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.timestamp)}
                        </p>
                        {transaction.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${transaction.pricePerUnit.toLocaleString()} each
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Total: ${transaction.totalValue.toLocaleString()}
                      </p>
                      {transaction.transactionType === 'sell' && transaction.realizedProfitLoss !== 0 && (
                        <p className={`text-xs font-medium ${
                          transaction.realizedProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Realized: {transaction.realizedProfitLoss >= 0 ? '+' : ''}${transaction.realizedProfitLoss.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransactionType('buy')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      transactionType === 'buy'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                    }`}
                  >
                    <Plus className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Buy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('sell')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      transactionType === 'sell'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-red-300'
                    }`}
                  >
                    <Minus className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Sell</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount ({currentAsset.symbol.toUpperCase()}) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
                {transactionType === 'sell' && (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Available: {parseFloat(currentAsset.amount.toFixed(8))} {currentAsset.symbol.toUpperCase()}
                    </p>
                    <button
                      type="button"
                      onClick={() => setAmount(currentAsset.amount.toString())}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Sell All
                    </button>
                  </div>
                )}
              </div>

              {/* Price Per Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Per Unit (USD) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="any"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Current price: ${currentAsset.currentPrice.toLocaleString()}
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., DCA purchase, profit taking, etc."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Total Preview */}
              {amount && pricePerUnit && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Total {transactionType}: ${(parseFloat(amount) * parseFloat(pricePerUnit)).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('transactions')}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!amount || !pricePerUnit || loading}
                  className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    transactionType === 'buy'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading ? 'Adding...' : `${transactionType === 'buy' ? 'Buy' : 'Sell'} ${currentAsset.symbol.toUpperCase()}`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}