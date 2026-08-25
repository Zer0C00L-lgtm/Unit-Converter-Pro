'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Trophy,
  Zap,
  Compass,
  Globe,
  Sparkles,
  X,
} from 'lucide-react';

export type ToastType =
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | 'milestone'
  | 'threshold';

export interface ToastPayload {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  badge?: string;
  iconType?: 'trophy' | 'zap' | 'compass' | 'globe' | 'check' | 'alert' | 'info' | 'warning';
  duration?: number;
}

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  badge?: string;
  iconType?: 'trophy' | 'zap' | 'compass' | 'globe' | 'check' | 'alert' | 'info' | 'warning';
  duration: number;
}

interface ToastContextType {
  showToast: (
    input: string | ToastPayload,
    fallbackType?: ToastType
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (input: string | ToastPayload, fallbackType: ToastType = 'success') => {
      const id = typeof input === 'object' && input.id ? input.id : Math.random().toString(36).substring(2, 9);
      
      let newToast: ToastItem;
      if (typeof input === 'string') {
        newToast = {
          id,
          message: input,
          type: fallbackType,
          duration: fallbackType === 'milestone' || fallbackType === 'threshold' ? 4800 : 3200,
        };
      } else {
        newToast = {
          id,
          title: input.title,
          message: input.message,
          type: input.type || fallbackType,
          badge: input.badge,
          iconType: input.iconType,
          duration: input.duration || (input.type === 'milestone' || input.type === 'threshold' ? 4800 : 3200),
        };
      }

      setToasts((prev) => [...prev.slice(-3), newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const renderIcon = (toast: ToastItem) => {
    if (toast.iconType === 'trophy' || toast.type === 'milestone') {
      return <Trophy className="w-4 h-4 text-amber-300 shrink-0 animate-bounce" />;
    }
    if (toast.iconType === 'zap') {
      return <Zap className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (toast.iconType === 'globe') {
      return <Globe className="w-4 h-4 text-cyan-300 shrink-0" />;
    }
    if (toast.iconType === 'compass' || toast.type === 'threshold') {
      return <Compass className="w-4 h-4 text-indigo-300 shrink-0" />;
    }
    if (toast.type === 'success' || toast.iconType === 'check') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (toast.type === 'error' || toast.iconType === 'alert') {
      return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
    }
    if (toast.type === 'warning' || toast.iconType === 'warning') {
      return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        id="toast-container"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.15 } }}
              className={`pointer-events-auto relative overflow-hidden flex flex-col gap-1 p-3.5 rounded-2xl shadow-xl border text-sm font-medium transition-all ${
                toast.type === 'milestone'
                  ? 'bg-slate-950/95 text-amber-50 border-amber-500/40 shadow-amber-500/10 dark:bg-slate-900/95'
                  : toast.type === 'threshold'
                  ? 'bg-slate-950/95 text-indigo-50 border-indigo-500/40 shadow-indigo-500/10 dark:bg-slate-900/95'
                  : toast.type === 'success'
                  ? 'bg-emerald-950/95 text-emerald-100 border-emerald-700/50 backdrop-blur-md dark:bg-emerald-900/95 dark:text-emerald-50'
                  : toast.type === 'error'
                  ? 'bg-rose-950/95 text-rose-100 border-rose-700/50 backdrop-blur-md dark:bg-rose-900/95 dark:text-rose-50'
                  : toast.type === 'warning'
                  ? 'bg-amber-950/95 text-amber-100 border-amber-700/50 backdrop-blur-md dark:bg-amber-900/95 dark:text-amber-50'
                  : 'bg-slate-900/95 text-slate-100 border-slate-700/50 backdrop-blur-md dark:bg-slate-800/95 dark:text-slate-100'
              }`}
            >
              {/* Header row with Icon, Title / Badge & Close Button */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 rounded-lg bg-white/10 shrink-0">
                    {renderIcon(toast)}
                  </div>
                  {toast.title ? (
                    <div className="font-extrabold text-xs tracking-tight truncate flex items-center gap-1.5">
                      <span className={toast.type === 'milestone' ? 'text-amber-300' : toast.type === 'threshold' ? 'text-indigo-300' : 'text-white'}>
                        {toast.title}
                      </span>
                    </div>
                  ) : null}
                  {toast.badge && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/15 text-white/90 border border-white/20 whitespace-nowrap shrink-0">
                      {toast.badge}
                    </span>
                  )}
                </div>

                <button
                  id={`toast-close-${toast.id}`}
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0 -mr-1 -mt-1"
                  aria-label="Close notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toast Description Message */}
              <p
                className={`text-xs leading-relaxed ${
                  toast.title
                    ? 'text-slate-300 dark:text-slate-300 pl-7'
                    : 'text-slate-100'
                }`}
              >
                {toast.message}
              </p>

              {/* Subtle visual timer progress line */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-0.5 ${
                  toast.type === 'milestone'
                    ? 'bg-amber-400/70'
                    : toast.type === 'threshold'
                    ? 'bg-indigo-400/70'
                    : toast.type === 'success'
                    ? 'bg-emerald-400/70'
                    : toast.type === 'error'
                    ? 'bg-rose-400/70'
                    : 'bg-indigo-400/50'
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

