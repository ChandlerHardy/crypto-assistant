'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PORTFOLIOS } from '@/lib/graphql/queries';
import { Bot, Minus, X } from 'lucide-react';
import { ChatInterface } from './chat-interface';

interface AIAssistantPopupProps {
  className?: string;
}

export function AIAssistantPopup({ className = '' }: AIAssistantPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Fetch portfolio data for AI context
  const { data: portfoliosData } = useQuery(GET_PORTFOLIOS, {
    skip: !isOpen, // Only fetch when chat is open
    pollInterval: 300000, // Poll every 5 minutes when open
  });

  const toggleChat = () => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
          {/* Chat Window */}
          <div 
            className={`
              bg-white/7 dark:bg-gray-900/7 
              rounded-lg shadow-2xl border border-white/20 dark:border-gray-600/20
              transition-all duration-200 ${
              isMinimized ? 'h-14' : 'w-96 h-[600px]'
            } flex flex-col overflow-hidden`}
            style={{
              backdropFilter: 'blur(16px) saturate(160%)',
              WebkitBackdropFilter: 'blur(16px) saturate(160%)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/20 bg-gradient-to-r from-blue-500/60 to-blue-600/60 text-white rounded-t-lg"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className={`${isMinimized ? 'hidden' : 'block'}`}>
                  <h3 className="text-sm font-semibold">CryptoAssist AI</h3>
                  <p className="text-xs opacity-90">Online now</p>
                </div>
                {isMinimized && (
                  <h3 className="text-sm font-semibold">CryptoAssist AI</h3>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleChat}
                  className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={closeChat}
                  className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Interface */}
            {!isMinimized && (
              <>
                <div className="flex-1 min-h-0">
                  <ChatInterface 
                    className="h-full border-0 rounded-none" 
                    showHeader={false} 
                    portfolioData={portfoliosData?.portfolios}
                  />
                </div>
                
                {/* Footer */}
                <div className="p-2 border-t border-white/20 bg-white/10 dark:bg-gray-800/10"
                  style={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Real-time data • Educational only</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Chat Button (when closed) */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className={`fixed bottom-6 right-6 z-40 w-14 h-14 
            bg-gradient-to-br from-blue-500/90 to-blue-600/90 backdrop-blur-sm
            hover:from-blue-600/90 hover:to-blue-700/90 
            text-white rounded-full shadow-xl hover:shadow-2xl 
            transition-all duration-300 flex items-center justify-center group
            border border-white/20 ${className}`}
          aria-label="Open AI Assistant"
        >
          <Bot className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center shadow-lg shadow-green-400/50 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </button>
      )}
    </>
  );
}