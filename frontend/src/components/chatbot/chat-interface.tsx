'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const CHAT_WITH_ASSISTANT = gql`
  mutation ChatWithAssistant($message: String!, $context: String) {
    chatWithAssistant(message: $message, context: $context)
  }
`;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  className?: string;
  showHeader?: boolean;
}

export function ChatInterface({ className = '', showHeader = true }: ChatInterfaceProps) {
  const [isClient, setIsClient] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm CryptoAssist, your AI cryptocurrency advisor. I can help you with portfolio analysis, market insights, and educational information about crypto investing. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [chatWithAssistant] = useMutation(CHAT_WITH_ASSISTANT);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data } = await chatWithAssistant({
        variables: {
          message: userMessage.content,
          context: null
        }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.chatWithAssistant,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please check your internet connection and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string, role: 'user' | 'assistant') => {
    if (role === 'assistant') {
      // Use ReactMarkdown for AI responses to handle formatting
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown 
            components={{
              // Custom styling for markdown elements
              h1: ({...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
              h2: ({...props}) => <h2 className="text-base font-semibold mb-2" {...props} />,
              h3: ({...props}) => <h3 className="text-sm font-semibold mb-1" {...props} />,
              p: ({...props}) => <p className="mb-2" {...props} />,
              ul: ({...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
              ol: ({...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
              li: ({...props}) => <li className="mb-1" {...props} />,
              strong: ({...props}) => <strong className="font-semibold" {...props} />,
              em: ({...props}) => <em className="italic" {...props} />
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      );
    } else {
      // Simple formatting for user messages
      return content.split('\n').map((line, index) => (
        <div key={index} className="mb-1">
          {line}
        </div>
      ));
    }
  };

  return (
    <div className={`flex flex-col h-full bg-transparent border-0 rounded-lg ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">CryptoAssist AI</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your crypto portfolio advisor</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
            }`}>
              <div className="text-sm">
                {formatMessage(message.content, message.role)}
              </div>
              {isClient && (
                <div className={`text-xs mt-2 opacity-70 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 dark:border-gray-600/20 bg-transparent rounded-b-lg">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your crypto portfolio or market insights..."
            className="flex-1 px-4 py-3 border border-white/20 dark:border-gray-600/30 rounded-lg 
                     bg-white/10 dark:bg-gray-700/20 text-gray-900 dark:text-white
                     placeholder-gray-600 dark:placeholder-gray-300
                     focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-white/30
                     disabled:opacity-50 backdrop-blur-sm"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-blue-500/80 text-white rounded-lg hover:bg-blue-600/80 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200 flex items-center gap-2 backdrop-blur-sm
                     border border-white/20"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send • This is educational information, not financial advice
        </p>
      </div>
    </div>
  );
}