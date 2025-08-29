import { Header } from '@/components/layout/header';
import { ChatInterface } from '@/components/chatbot/chat-interface';

export default function AssistantPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Get expert cryptocurrency advice powered by AI. Ask about your portfolio, market trends, or crypto strategies.
            </p>
          </div>

          {/* Chat Interface */}
          <div className="h-[800px]">
            <ChatInterface />
          </div>

          {/* Information Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                💼 Portfolio Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get personalized advice on your cryptocurrency holdings, diversification strategies, and risk management.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                📈 Market Insights
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ask about market trends, technical analysis, and cryptocurrency fundamentals to make informed decisions.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                🎓 Educational Support
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Learn about DeFi protocols, blockchain technology, and trading strategies with expert guidance.
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Important Disclaimer
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    This AI assistant provides educational information only and is not financial advice. 
                    Cryptocurrency investments are highly risky and volatile. Always do your own research (DYOR) 
                    and never invest more than you can afford to lose.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}