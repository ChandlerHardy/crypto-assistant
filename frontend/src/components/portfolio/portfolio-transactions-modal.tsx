'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { X, TrendingUp, TrendingDown, Plus, Minus, Calendar } from 'lucide-react';
import { GET_PORTFOLIO_TRANSACTIONS } from '@/lib/graphql/queries';
import { AssetTransaction } from '@/types/crypto';

interface PortfolioTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioId: string;
  portfolioName: string;
}

export function PortfolioTransactionsModal({ 
  isOpen, 
  onClose, 
  portfolioId, 
  portfolioName 
}: PortfolioTransactionsModalProps) {
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  
  const { data, loading, error } = useQuery(GET_PORTFOLIO_TRANSACTIONS, {
    variables: { portfolioId },
    skip: !isOpen,
    fetchPolicy: 'cache-and-network', // Always fetch fresh data from server
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const transactions = data?.portfolioTransactions || [];
  
  const filteredTransactions = transactions.filter((transaction: AssetTransaction) => {
    if (filterType === 'all') return true;
    return transaction.transactionType === filterType;
  });

  const totalRealized = transactions
    .filter((t: AssetTransaction) => t.transactionType === 'sell')
    .reduce((sum: number, t: AssetTransaction) => sum + t.realizedProfitLoss, 0);

  const totalBought = transactions
    .filter((t: AssetTransaction) => t.transactionType === 'buy')
    .reduce((sum: number, t: AssetTransaction) => sum + t.totalValue, 0);

  const totalSold = transactions
    .filter((t: AssetTransaction) => t.transactionType === 'sell')
    .reduce((sum: number, t: AssetTransaction) => sum + t.totalValue, 0);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Transaction History
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{portfolioName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Transactions</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {transactions.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Bought</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ${totalBought.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Sold</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ${totalSold.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Realized P&L</p>
              <div className="flex items-center justify-center space-x-1">
                {totalRealized >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <p className={`text-lg font-semibold ${
                  totalRealized >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalRealized >= 0 ? '+' : ''}${totalRealized.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              filterType === 'all'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('buy')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              filterType === 'buy'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Buys ({transactions.filter((t: AssetTransaction) => t.transactionType === 'buy').length})
          </button>
          <button
            onClick={() => setFilterType('sell')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              filterType === 'sell'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Sells ({transactions.filter((t: AssetTransaction) => t.transactionType === 'sell').length})
          </button>
        </div>

        {/* Transaction List */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading transactions: {error.message}</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No {filterType === 'all' ? '' : filterType} transactions found
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction: AssetTransaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.transactionType === 'buy' 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      {transaction.transactionType === 'buy' ? (
                        <Plus className="w-4 h-4 text-green-600" />
                      ) : (
                        <Minus className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.transactionType === 'buy' ? 'Bought' : 'Sold'} {transaction.amount} {transaction.symbol?.toUpperCase() || 'Unknown'}
                      </p>
                      {transaction.name && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.name}</p>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(transaction.timestamp)}</span>
                      </div>
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
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}