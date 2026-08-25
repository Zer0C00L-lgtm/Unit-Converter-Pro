'use client';

import React from 'react';
import { Sun, Moon, User, ShieldCheck, Keyboard, ArrowLeftRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenShortcuts: () => void;
}

export function Navbar({ onOpenAuth, onOpenShortcuts }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div
            id="brand-logo"
            className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-xs"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                id="brand-title"
                className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100"
              >
                Unit Converter <span className="text-indigo-600 dark:text-indigo-400">Pro</span>
              </span>
              <span
                id="conversion-badge"
                className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                KM ⇄ MI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
              Precise distance conversion at your fingertips
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Keyboard Shortcuts Trigger */}
          <button
            id="btn-shortcuts-toggle"
            onClick={onOpenShortcuts}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Keyboard shortcuts"
            aria-label="View keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4" />
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              ?
            </kbd>
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="btn-theme-toggle"
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme mode"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

          {/* User Account / Profile Button */}
          <button
            id="btn-user-auth-profile"
            onClick={onOpenAuth}
            className="flex items-center space-x-3 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left group"
            aria-label="Open user account and authentication settings"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {currentUser.name || 'Alex Rivera'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {currentUser.isGuest ? 'Guest Session' : 'Pro Member'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-700 overflow-hidden shrink-0 shadow-xs">
              <div className="w-full h-full bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AR'}
              </div>
            </div>
            {isAuthenticated && !currentUser.isGuest && (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 hidden sm:block" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
