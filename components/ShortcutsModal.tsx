'use client';

import React from 'react';
import { motion } from 'motion/react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'S', label: 'Swap Direction (km ⇄ mi)' },
  { key: 'C', label: 'Copy Output Result' },
  { key: 'D', label: 'Toggle Dark / Light Theme' },
  { key: 'Escape', label: 'Close Active Modal / Dialog' },
  { key: 'Tab', label: 'Navigate Between Controls' },
  { key: 'Enter', label: 'Confirm Input / Add to Log' },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="shortcuts-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full overflow-hidden"
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="shortcuts-modal-title"
                className="text-base font-extrabold text-slate-900 dark:text-white"
              >
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speed up distance conversions
              </p>
            </div>
          </div>
          <button
            id="btn-close-shortcuts-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close shortcuts modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2 text-xs">
          {SHORTCUTS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80"
            >
              <span className="text-slate-700 dark:text-slate-300 font-semibold">
                {item.label}
              </span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-xs text-slate-800 dark:text-slate-200">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
