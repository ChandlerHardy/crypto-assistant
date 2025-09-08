'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Settings, Menu, Bot } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image
            src="/cryptassist-transparent-bg.png?v=2"
            alt="Crypto Portfolio"
            width={240}
            height={60}
            className="h-15 block dark:hidden"
          />
          <Image
            src="/cryptassist-transparent-bg-white.png?v=1"
            alt="Crypto Portfolio"
            width={240}
            height={60}
            className="h-15 hidden dark:block"
          />
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/" 
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
          >
            Dashboard
          </Link>
          <Link 
            href="/assistant" 
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium flex items-center space-x-1"
          >
            <Bot className="h-4 w-4" />
            <span>AI Assistant</span>
          </Link>
          <Link 
            href="/settings" 
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium flex items-center space-x-1"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          <ThemeToggle />
        </nav>
        
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button>
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
}