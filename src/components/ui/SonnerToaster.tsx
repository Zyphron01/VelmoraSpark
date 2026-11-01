'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { useTheme } from '@/components/theme/ThemeProvider';

export function SonnerToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="bottom-right"
      theme={theme === 'dark' ? 'dark' : 'light'}
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: '16px',
          fontFamily: 'var(--font-body, system-ui)',
          border: '1px solid var(--border-medium)',
        },
      }}
    />
  );
}
