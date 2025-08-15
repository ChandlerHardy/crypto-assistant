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
    console.log('Toggling theme from', theme, 'to', newTheme);
    console.log('HTML classes before:', document.documentElement.className);
    console.log('Body classes before:', document.body.className);
    setTheme(newTheme);
    
    // Check classes after a short delay
    setTimeout(() => {
      console.log('HTML classes after:', document.documentElement.className);
      console.log('Body classes after:', document.body.className);
      
      // Check computed styles
      const bodyStyle = window.getComputedStyle(document.body);
      console.log('Body background-color:', bodyStyle.backgroundColor);
      console.log('Body color:', bodyStyle.color);
    }, 100);
  };

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <div className="w-4 h-4" />
      </button>
    );
  }

  console.log('Current theme:', theme);

  return (
    <button
      onClick={handleToggle}
      className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-300 dark:border-gray-600"
      aria-label="Toggle theme"
      title={`Current theme: ${theme}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-yellow-500" />
      ) : (
        <Moon className="w-4 h-4 text-gray-600" />
      )}
    </button>
  );
}