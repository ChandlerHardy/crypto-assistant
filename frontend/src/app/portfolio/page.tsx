'use client';

import { Header } from '@/components/layout/header';
import { PortfolioOverview } from '@/components/portfolio/portfolio-overview';
import { AIAssistantPopup } from '@/components/chatbot/ai-assistant-popup';

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Portfolio Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your cryptocurrency portfolios and track performance
          </p>
        </div>

        <PortfolioOverview 
          isCustomizing={false}
          onCustomizingChange={() => {}}
          onResetToDefault={() => {}}
        />
      </main>

      {/* AI Assistant Popup */}
      <AIAssistantPopup />
    </div>
  );
}