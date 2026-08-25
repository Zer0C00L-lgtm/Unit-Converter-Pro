'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ConverterCard } from '@/components/ConverterCard';
import { HistorySection } from '@/components/HistorySection';
import { QuickReferenceTable } from '@/components/QuickReferenceTable';
import { AuthModal } from '@/components/AuthModal';
import { ShortcutsModal } from '@/components/ShortcutsModal';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  ArrowRightLeft,
  CheckCircle2,
  FileSpreadsheet,
  Shield,
  BookOpen,
} from 'lucide-react';

export default function Home() {
  const { toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === 'd' || e.key === 'D') {
        toggleTheme();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsAuthOpen(false);
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  return (
    <div id="unit-converter-app" className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Main Content Area */}
        <main
          id="main-app-content"
          className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8"
        >
          {/* Hero Converter Card */}
          <ConverterCard key={currentUser.id} />

          {/* Quick Lookup Matrix */}
          <QuickReferenceTable />

          {/* History and CSV Export Section */}
          <HistorySection />

          {/* Standards & Technical Explanation Footnote */}
          <section
            id="technical-standards-section"
            className="w-full max-w-4xl mx-auto p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2.5"
            aria-label="Conversion Standards and Accuracy"
          >
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>International Measurement Standards</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed">
              <div>
                <p>
                  <strong>Exact Statute Definition:</strong> Under the 1959 International Yard and
                  Pound Agreement, 1 international statute mile is defined as exactly{' '}
                  <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                    1.609344 km
                  </code>{' '}
                  (1,609.344 meters).
                </p>
              </div>
              <div>
                <p>
                  <strong>Metric Inverse Ratio:</strong> 1 kilometer is mathematically equal to{' '}
                  <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                    1 / 1.609344 ≈ 0.621371192237334 mi
                  </code>
                  . Calculations in this application maintain double-precision floating-point
                  accuracy.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer
        id="app-footer"
        className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-400"
      >
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Unit Converter
            </span>
            <span>•</span>
            <span>Kilometers ⇄ Miles</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              id="footer-btn-auth"
              onClick={() => setIsAuthOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Account & Profile
            </button>
            <button
              id="footer-btn-shortcuts"
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Shortcuts (?)
            </button>
            <span>Active Session: {currentUser.name}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}
