'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { X, Plus, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GET_CRYPTOCURRENCIES, GET_PORTFOLIOS } from '@/lib/graphql/queries';
import { ADD_ASSET_TO_PORTFOLIO } from '@/lib/graphql/mutations';
import { CryptoCurrency } from '@/types/crypto';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioId: string;
  portfolioName: string;
}

export function AddAssetModal({ isOpen, onClose, portfolioId, portfolioName }: AddAssetModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency | null>(null);
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: cryptoData } = useQuery(GET_CRYPTOCURRENCIES, {
    variables: { limit: 100 },
  });

  const [addAsset, { loading }] = useMutation(ADD_ASSET_TO_PORTFOLIO, {
    refetchQueries: [{ query: GET_PORTFOLIOS }],
    onCompleted: () => {
      onClose();
      setSelectedCrypto(null);
      setAmount('');
      setPurchasePrice('');
      setSearchTerm('');
    },
    onError: (error) => {
      alert('Failed to add asset: ' + error.message);
    },
  });

  const cryptocurrencies: CryptoCurrency[] = cryptoData?.cryptocurrencies || [];
  
  const filteredCryptos = cryptocurrencies.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCrypto || !amount || !purchasePrice) {
      alert('Please fill in all fields');
      return;
    }

    await addAsset({
      variables: {
        input: {
          portfolioId: portfolioId,
          cryptoId: selectedCrypto.id,
          amount: parseFloat(amount),
          buyPrice: parseFloat(purchasePrice),
        },
      },
    });
  };

  const handleCryptoSelect = (crypto: CryptoCurrency) => {
    setSelectedCrypto(crypto);
    setSearchTerm(crypto.name);
    setShowDropdown(false);
    // Auto-fill current price as purchase price
    setPurchasePrice(crypto.currentPrice.toString());
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCrypto(null);
      setAmount('');
      setPurchasePrice('');
      setSearchTerm('');
      setShowDropdown(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add Asset to {portfolioName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Cryptocurrency Search */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cryptocurrency *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) {
                    setSelectedCrypto(null);
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for a cryptocurrency"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {/* Dropdown */}
            {showDropdown && searchTerm && filteredCryptos.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredCryptos.slice(0, 10).map((crypto) => (
                  <button
                    key={crypto.id}
                    type="button"
                    onClick={() => handleCryptoSelect(crypto)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{crypto.name}</div>
                      <div className="text-sm text-gray-500">{crypto.symbol.toUpperCase()}</div>
                    </div>
                    <div className="text-sm text-gray-900">
                      ${crypto.currentPrice.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Purchase Price */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Price (USD) *
            </label>
            <input
              type="number"
              step="any"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {selectedCrypto && (
              <p className="text-xs text-gray-500 mt-1">
                Current price: ${selectedCrypto.currentPrice.toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedCrypto || !amount || !purchasePrice || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}