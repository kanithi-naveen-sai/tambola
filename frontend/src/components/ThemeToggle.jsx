import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-full glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 shadow-md text-slate-700 dark:text-gold-400 focus:outline-none"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <FiSun className="w-5 h-5 animate-pulse-slow" />
      ) : (
        <FiMoon className="w-5 h-5 text-indigo-600" />
      )}
    </button>
  );
}
