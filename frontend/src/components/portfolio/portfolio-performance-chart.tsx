'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Portfolio } from '@/types/crypto';
import { format } from 'date-fns';

interface PortfolioPerformanceChartProps {
  portfolio: Portfolio;
}

export function PortfolioPerformanceChart({ portfolio }: PortfolioPerformanceChartProps) {
  const chartData = useMemo(() => {
    // For now, create a simple simulation based on transaction history
    // This is a basic implementation - in the future we'll use actual portfolio snapshots
    
    // Get all transactions sorted by date
    const allTransactions = portfolio.assets.flatMap(asset => 
      asset.transactions.map(transaction => ({
        ...transaction,
        assetSymbol: asset.symbol,
        assetCurrentPrice: asset.currentPrice,
        assetAmount: asset.amount
      }))
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (allTransactions.length === 0) {
      // No transactions, show current portfolio value as single point
      return [{
        date: new Date().toISOString(),
        value: portfolio.totalValue,
        timestamp: Date.now()
      }];
    }

    // Calculate portfolio value at each transaction point
    let runningBalance = 0;
    const data: Array<{ date: string; value: number; timestamp: number }> = [];

    allTransactions.forEach((transaction, index) => {
      const transactionDate = new Date(transaction.timestamp);
      
      if (transaction.transactionType === 'buy') {
        runningBalance += transaction.totalValue;
      } else {
        runningBalance -= transaction.totalValue;
      }

      // For the last transaction, use current portfolio value
      const portfolioValue = index === allTransactions.length - 1 
        ? portfolio.totalValue 
        : Math.max(runningBalance, 0); // Simplified calculation

      data.push({
        date: transaction.timestamp,
        value: portfolioValue,
        timestamp: transactionDate.getTime()
      });
    });

    // Add current portfolio value as final point if it's different from last transaction
    const lastTransaction = allTransactions[allTransactions.length - 1];
    const lastTransactionTime = new Date(lastTransaction.timestamp).getTime();
    const now = Date.now();
    
    // Only add current point if it's been more than an hour since last transaction
    if (now - lastTransactionTime > 3600000) {
      data.push({
        date: new Date().toISOString(),
        value: portfolio.totalValue,
        timestamp: now
      });
    }

    return data;
  }, [portfolio]);

  const formatTooltipValue = (value: number) => {
    return [`$${value.toLocaleString()}`, 'Portfolio Value'];
  };

  const formatTooltipLabel = (label: string) => {
    return format(new Date(label), 'MMM d, yyyy HH:mm');
  };

  const isPositive = portfolio.totalProfitLoss >= 0;

  return (
    <div className="w-full h-80 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Portfolio Performance
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Current: ${portfolio.totalValue.toLocaleString()}
          </span>
          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}${portfolio.totalProfitLoss.toLocaleString()} 
            ({portfolio.totalProfitLossPercentage.toFixed(2)}%)
          </span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date"
            tickFormatter={(value) => format(new Date(value), 'MMM d')}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            className="text-gray-400"
          />
          <YAxis 
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            className="text-gray-400"
          />
          <Tooltip 
            formatter={formatTooltipValue}
            labelFormatter={formatTooltipLabel}
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={isPositive ? '#10b981' : '#ef4444'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: isPositive ? '#10b981' : '#ef4444' }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        💡 Future: Real-time snapshots, time range filters (1D, 1W, 1M, 1Y), and advanced analytics
      </div>
    </div>
  );
}