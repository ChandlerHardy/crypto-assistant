'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { X, Edit } from 'lucide-react';
import { GET_PORTFOLIOS } from '@/lib/graphql/queries';
import { UPDATE_ASSET } from '@/lib/graphql/mutations';
import { PortfolioAsset } from '@/types/crypto';

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: PortfolioAsset | null;
  portfolioId: string;
  portfolioName: string;
}

export function EditAssetModal({ isOpen, onClose, asset, portfolioId, portfolioName }: EditAssetModalProps) {
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  const [updateAsset, { loading }] = useMutation(UPDATE_ASSET, {
    refetchQueries: [{ query: GET_PORTFOLIOS }],
    onCompleted: () => {
      onClose();
    },
    onError: (error) => {
      alert('Failed to update asset: ' + error.message);
    },
  });

  // Initialize form when asset changes
  useEffect(() => {
    if (asset && isOpen) {
      setAmount(asset.amount?.toString() || '');
      setPurchasePrice(asset.averageBuyPrice?.toString() || '');
    }
  }, [asset, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setPurchasePrice('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset || !amount || !purchasePrice) {
      alert('Please fill in all fields');
      return;
    }

    await updateAsset({
      variables: {
        input: {
          portfolioId: portfolioId,
          assetId: asset.id,
          amount: parseFloat(amount),
          buyPrice: parseFloat(purchasePrice),
        },
      },
    });
  };

  if (!isOpen || !asset) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
            <Edit className="w-5 h-5 mr-2" />
            Edit {asset.name} in {portfolioName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Current Info Display */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{asset.name} ({asset.symbol.toUpperCase()})</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Current Price: ${asset.currentPrice.toLocaleString()}</p>
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
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount *
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
          </div>

          {/* Purchase Price */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Average Purchase Price (USD) *
            </label>
            <input
              type="number"
              step="any"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount || !purchasePrice || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}