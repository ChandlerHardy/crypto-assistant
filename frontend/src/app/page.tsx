'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { PortfolioOverview } from '@/components/portfolio/portfolio-overview';
import { PriceChart } from '@/components/charts/price-chart';
import { AIAssistantPopup } from '@/components/chatbot/ai-assistant-popup';
import { useDashboardLayout } from '@/hooks/use-dashboard-layout';
import { Settings, RotateCcw } from 'lucide-react';

export default function Home() {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { resetToDefault } = useDashboardLayout();

  const handleResetToDefault = () => {
    resetToDefault();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Customizable Portfolio Dashboard */}
        <div className="mb-8">
          <PortfolioOverview 
            isCustomizing={isCustomizing}
            onCustomizingChange={setIsCustomizing}
            onResetToDefault={handleResetToDefault}
          />
        </div>

        {/* Market Overview Section */}
        <div className="space-y-8">
          {/* Bitcoin Price Chart */}
          <div>
            <PriceChart 
              cryptoId="bitcoin" 
              cryptoName="Bitcoin" 
              days={7} 
            />
          </div>

          {/* Quick Market Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Market Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Market Cap</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">$2.5T</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">$89B</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">BTC Dominance</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">54.2%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Coins</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">13,943</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dashboard Customize Button */}
      <div className="fixed bottom-6 right-20 z-40 flex flex-col space-y-2">
        {isCustomizing && (
          <>
            <button
              onClick={handleResetToDefault}
              className="w-12 h-12 bg-white/7 dark:bg-gray-900/7 rounded-full shadow-2xl border border-white/20 dark:border-gray-600/20 hover:shadow-2xl transition-all flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              style={{
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
              }}
              title="Reset dashboard layout"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <div 
              className="text-xs bg-white/7 dark:bg-gray-900/7 text-gray-500 dark:text-gray-400 px-3 py-2 rounded-lg shadow-2xl border border-white/20 dark:border-gray-600/20 max-w-48 text-center"
              style={{
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
              }}
            >
              Drag to reorder<br/>Click eye to hide/show
            </div>
          </>
        )}
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className={`w-12 h-12 rounded-full shadow-2xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center border ${
            isCustomizing
              ? 'text-white border-white/20'
              : 'bg-white/7 dark:bg-gray-900/7 border-white/20 dark:border-gray-600/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          style={isCustomizing ? {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))',
            backdropFilter: 'blur(16px) saturate(160%)',
            WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          } : {
            backdropFilter: 'blur(16px) saturate(160%)',
            WebkitBackdropFilter: 'blur(16px) saturate(160%)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          }}
          title={isCustomizing ? 'Done customizing' : 'Customize dashboard'}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* AI Assistant Popup */}
      <AIAssistantPopup />
    </div>
  );
}
