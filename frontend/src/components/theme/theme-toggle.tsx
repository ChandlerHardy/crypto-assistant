'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    console.log('Theme toggled to:', newTheme);
  };

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <div className="w-4 h-4" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={handleToggle}
      className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      ) : (
        <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      )}
    </button>
  );
}