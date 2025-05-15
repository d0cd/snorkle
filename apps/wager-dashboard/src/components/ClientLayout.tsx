'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/lib/theme';
import { KeyProvider } from '@/contexts/KeyContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { WasmProvider } from '@/components/WasmProvider';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <WasmProvider>
          <KeyProvider>
            {children}
          </KeyProvider>
        </WasmProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
} 