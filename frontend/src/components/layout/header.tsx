'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Settings, Menu, Bot, User, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuth } from '@/components/auth';

interface HeaderProps {
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export function Header({ onOpenAuthModal }: HeaderProps = {}) {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const handleLogin = () => {
    onOpenAuthModal?.('login');
  };

  const handleRegister = () => {
    onOpenAuthModal?.('register');
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="relative w-60 h-12 cursor-pointer">
            <Image
              src="/cryptassist-transparent-bg.png?v=2"
              alt="Crypto Portfolio"
              width={240}
              height={60}
              className="absolute inset-0 w-full h-full object-contain block dark:hidden"
            />
            <Image
              src="/cryptassist-transparent-bg-white.png?v=1"
              alt="Crypto Portfolio"
              width={240}
              height={60}
              className="absolute inset-0 w-full h-full object-contain hidden dark:block"
            />
          </Link>
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
          
          {/* Authentication Section */}
          {!isLoading && (
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {user?.email}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLogin}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleRegister}
                    className="text-gray-900 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
                    style={{
                      background: 'linear-gradient(to right, #F7C817, #FF8C00)',
                      backgroundImage: 'linear-gradient(to right, #F7C817, #FF8C00)'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundImage = 'linear-gradient(to right, #E6B614, #E67E00)'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundImage = 'linear-gradient(to right, #F7C817, #FF8C00)'}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
        
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          {!isLoading && !isAuthenticated && (
            <button
              onClick={handleLogin}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm"
            >
              Sign In
            </button>
          )}
          <button>
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
      </header>
    </>
  );
}