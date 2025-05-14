'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="flex items-center gap-2 px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 dark:text-gray-100 transition-colors"
      aria-label="Toggle dark mode"
      type="button"
    >
      {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      <span className="hidden md:inline">{dark ? 'Dark' : 'Light'} mode</span>
    </button>
  );
} 