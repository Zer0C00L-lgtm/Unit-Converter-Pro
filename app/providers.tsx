'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/Toast';
import { HistoryProvider } from '@/context/HistoryContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <HistoryProvider>{children}</HistoryProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
