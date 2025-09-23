
'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Header } from '@/components/layout/header';
import { PortfolioOverview } from '@/components/portfolio/portfolio-overview';
import { PriceChart } from '@/components/charts/price-chart';
import { CryptoList } from '@/components/crypto/crypto-list';
import { AIAssistantPopup } from '@/components/chatbot/ai-assistant-popup';
import { useDashboardLayout } from '@/hooks/use-dashboard-layout';
import { useAuth, AuthModal } from '@/components/auth';
import { GET_PORTFOLIOS } from '@/lib/graphql/queries';
import { Settings, RotateCcw, TrendingUp, Shield, Zap } from 'lucide-react';

export default function Home() {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { resetToDefault } = useDashboardLayout();
  const { isAuthenticated, isLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  
  // Query portfolios only for authenticated users to determine if we should show crypto list
  const { data: portfolioData } = useQuery(GET_PORTFOLIOS, {
    skip: !isAuthenticated || isLoading,
  });
  
  const hasPortfolios = portfolioData?.portfolios && portfolioData.portfolios.length > 0;

  const handleResetToDefault = () => {
    resetToDefault();
  };

  const handleOpenAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };
  
  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
  };
  
  const handleModeChange = (mode: 'login' | 'register') => {
    setAuthMode(mode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onOpenAuthModal={handleOpenAuthModal} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!isLoading && (
          <>
            {isAuthenticated ? (
              <>
                {/* Authenticated User Dashboard */}
                <div className="mb-8">
                  <PortfolioOverview 
                    isCustomizing={isCustomizing}
                    onCustomizingChange={setIsCustomizing}
                    onResetToDefault={handleResetToDefault}
                  />
                </div>

                {/* Show crypto list for authenticated users without portfolios */}
                {!hasPortfolios && (
                  <div className="mb-8">
                    <CryptoList limit={10} />
                  </div>
                )}

              </>
            ) : (
              <>
                {/* Welcome Section for Non-Authenticated Users */}
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                    Track Your <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent" style={{backgroundImage: 'linear-gradient(to right, #F7C817, #FF8C00)'}}>Crypto Portfolio</span>
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                    Professional cryptocurrency portfolio management with AI-powered insights, 
                    real-time tracking, and advanced analytics.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => handleOpenAuthModal('register')}
                      className="text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                      style={{
                        background: 'linear-gradient(to right, #F7C817, #FF8C00)',
                        backgroundImage: 'linear-gradient(to right, #F7C817, #FF8C00)'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundImage = 'linear-gradient(to right, #E6B614, #E67E00)'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundImage = 'linear-gradient(to right, #F7C817, #FF8C00)'}
                    >
                      Get Started Free
                    </button>
                    <button
                      onClick={() => handleOpenAuthModal('login')}
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
                    >
                      Sign In
                    </button>
                  </div>
                </div>

                {/* Features Section */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Real-Time Tracking</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Monitor your crypto investments with live price updates, portfolio performance metrics, and detailed analytics.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI-Powered Insights</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Get personalized investment advice and market analysis powered by advanced AI technology.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Secure & Private</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your data is protected with enterprise-grade security. We never store your private keys or access your wallets.
                    </p>
                  </div>
                </div>

                {/* Top Cryptocurrencies Section - Show to non-authenticated users */}
                <div className="mb-12">
                  <CryptoList limit={10} />
                </div>
              </>
            )}

            {/* Market Overview Section - Always Visible */}
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
          </>
        )}
      </main>

      {/* Dashboard Customize Button - Only for authenticated users */}
      {isAuthenticated && (
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
      )}

      {/* AI Assistant Popup */}
      <AIAssistantPopup />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={handleCloseAuthModal}
        mode={authMode}
        onModeChange={handleModeChange}
      />
    </div>
  );
}
