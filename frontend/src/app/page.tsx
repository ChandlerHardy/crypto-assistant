import { Header } from '@/components/layout/header';
import { CryptoList } from '@/components/crypto/crypto-list';
import { PortfolioOverview } from '@/components/portfolio/portfolio-overview';
import { PriceChart } from '@/components/charts/price-chart';
import { AIAssistantPopup } from '@/components/chatbot/ai-assistant-popup';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Portfolio Overview */}
          <div className="lg:col-span-2">
            <PortfolioOverview />
          </div>
          
          {/* Crypto List */}
          <div>
            <CryptoList limit={10} />
          </div>
        </div>

        {/* Bitcoin Price Chart */}
        <div className="mb-8">
          <PriceChart 
            cryptoId="bitcoin" 
            cryptoName="Bitcoin" 
            days={7} 
          />
        </div>

        {/* Quick Stats */}
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
      </main>

      {/* AI Assistant Popup */}
      <AIAssistantPopup />
    </div>
  );
}
