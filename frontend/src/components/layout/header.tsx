'use client';

import Link from 'next/link';
import { TrendingUp, Wallet, Settings, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Crypto Portfolio
            </h1>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/" 
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
          >
            Dashboard
          </Link>
          <Link 
            href="/portfolio" 
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium flex items-center space-x-1"
          >
            <Wallet className="h-4 w-4" />
            <span>Portfolio</span>
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