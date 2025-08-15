'use client';

import { useQuery } from '@apollo/client';
import { GET_PRICE_HISTORY } from '@/lib/graphql/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { PriceData } from '@/types/crypto';

interface PriceChartProps {
  cryptoId: string;
  cryptoName: string;
  days?: number;
}

export function PriceChart({ cryptoId, cryptoName, days = 7 }: PriceChartProps) {
  const { data, loading, error } = useQuery(GET_PRICE_HISTORY, {
    variables: { cryptoId, days },
    pollInterval: 60000, // Refresh every minute
  });

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
          <div className="text-right">
            <div className="text-lg font-semibold">
              ${lastPrice.toLocaleString()}
            </div>
            <div className={`text-sm ${
              priceChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {priceChangePercentage >= 0 ? '+' : ''}{priceChangePercentage.toFixed(2)}%
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