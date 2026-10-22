'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Apply theme to document
  const applyTheme = (targetTheme: ThemeMode) => {
    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = targetTheme === 'dark' || (targetTheme === 'system' && systemDark);

    if (isDark) {
      root.classList.add('dark');
      setResolvedTheme('dark');
    } else {
      root.classList.remove('dark');
      setResolvedTheme('light');
    }
  };

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem('applyra-theme') as ThemeMode) || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Listen to system theme changes if set to system
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const currentSaved = (localStorage.getItem('applyra-theme') as ThemeMode) || 'system';
      if (currentSaved === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('dark');
          setResolvedTheme('dark');
        } else {
          document.documentElement.classList.remove('dark');
          setResolvedTheme('light');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  const toggleTheme = () => {
    // Cycles: system -> dark -> light (or toggles light <-> dark if already set)
    let nextTheme: ThemeMode;
    if (theme === 'system') {
      nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    } else if (theme === 'dark') {
      nextTheme = 'light';
    } else {
      nextTheme = 'dark';
    }

    setTheme(nextTheme);
    localStorage.setItem('applyra-theme', nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 bg-transparent" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2 rounded-full border transition-all duration-300 flex items-center justify-center group ${
        isDark
          ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-brand-600 shadow-sm'
      }`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode (Current: ${theme})`}
      title={`Theme: ${theme.toUpperCase()} (${isDark ? 'Dark' : 'Light'}) · Click to toggle`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
        {/* Sun Icon */}
        <Sun
          className={`w-4 h-4 absolute transition-all duration-300 transform ${
            isDark
              ? 'rotate-90 scale-0 opacity-0 text-slate-400'
              : 'rotate-0 scale-100 opacity-100 text-amber-500 group-hover:rotate-45'
          }`}
        />
        {/* Moon Icon */}
        <Moon
          className={`w-4 h-4 absolute transition-all duration-300 transform ${
            isDark
              ? 'rotate-0 scale-100 opacity-100 text-amber-300 group-hover:-rotate-12'
              : '-rotate-90 scale-0 opacity-0 text-slate-400'
          }`}
        />
      </div>
    </button>
  );
}
