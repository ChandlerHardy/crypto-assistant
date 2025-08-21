'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRICE_HISTORY } from '@/lib/graphql/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { PriceData } from '@/types/crypto';

interface PriceChartProps {
  cryptoId: string;
  cryptoName: string;
  days?: number;
}

const TIME_PERIODS = [
  { value: 1, label: '1 Day' },
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
  { value: 365, label: '1 Year' },
];

export function PriceChart({ cryptoId, cryptoName, days = 7 }: PriceChartProps) {
  const [selectedDays, setSelectedDays] = useState(days);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, loading, error } = useQuery(GET_PRICE_HISTORY, {
    variables: { cryptoId, days: selectedDays },
    pollInterval: 300000, // Refresh every 5 minutes
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{cryptoName} Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{cryptoName} Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-2">Failed to load chart data</p>
              <p className="text-sm text-gray-400">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const priceHistory: PriceData[] = data?.priceHistory || [];

  if (priceHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{cryptoName} Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">No price data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for Recharts
  const chartData = priceHistory.map((point) => ({
    timestamp: parseInt(point.timestamp),
    price: point.price,
    date: format(new Date(parseInt(point.timestamp)), 'MMM dd'),
    fullDate: format(new Date(parseInt(point.timestamp)), 'MMM dd, yyyy HH:mm'),
  }));

  // Calculate price change
  const firstPrice = chartData[0]?.price || 0;
  const lastPrice = chartData[chartData.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercentage = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{cryptoName} Price Chart</span>
          <div className="flex items-center space-x-4">
            {/* Time Period Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span>{TIME_PERIODS.find(p => p.value === selectedDays)?.label}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                  {TIME_PERIODS.map((period) => (
                    <button
                      key={period.value}
                      onClick={() => {
                        setSelectedDays(period.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedDays === period.value ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Price Info */}
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                ${lastPrice.toLocaleString()}
              </div>
              <div className={`text-sm ${
                priceChangePercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {priceChangePercentage >= 0 ? '+' : ''}{priceChangePercentage.toFixed(2)}%
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: '#374151',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                labelFormatter={(label) => {
                  const dataPoint = chartData.find(d => d.date === label);
                  return dataPoint?.fullDate || label;
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={priceChangePercentage >= 0 ? '#059669' : '#dc2626'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: priceChangePercentage >= 0 ? '#059669' : '#dc2626' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}