'use client';

import { useQuery } from '@apollo/client';
import Image from 'next/image';
import { GET_CRYPTOCURRENCIES } from '@/lib/graphql/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CryptoCurrency } from '@/types/crypto';

interface CryptoListProps {
  limit?: number;
}

export function CryptoList({ limit = 20 }: CryptoListProps) {
  const { data, loading, error } = useQuery(GET_CRYPTOCURRENCIES, {
    variables: { limit },
    pollInterval: 30000, // Refresh every 30 seconds
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Cryptocurrencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="space-y-1">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-12 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    <div className="w-12 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Cryptocurrencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">Failed to load cryptocurrency data</p>
            <p className="text-sm text-gray-400">
              {error.message}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Make sure your backend server is running and environment variables are set correctly
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cryptocurrencies: CryptoCurrency[] = data?.cryptocurrencies || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Cryptocurrencies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {cryptocurrencies.map((crypto) => (
            <div
              key={crypto.id}
              className="flex items-center justify-between py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/32/icon/${crypto.symbol.toLowerCase()}.png`}
                    alt={crypto.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient circle with symbol
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallbackDiv = target.nextElementSibling as HTMLDivElement;
                      if (fallbackDiv) {
                        fallbackDiv.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center" style={{ display: 'none' }}>
                    <span className="text-white text-xs font-bold">
                      {crypto.symbol.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{crypto.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{crypto.symbol.toUpperCase()}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  ${crypto.currentPrice.toLocaleString()}
                </div>
                <div className={`text-sm flex items-center justify-end space-x-1 ${
                  crypto.priceChangePercentage24h >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {crypto.priceChangePercentage24h >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>
                    {crypto.priceChangePercentage24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}