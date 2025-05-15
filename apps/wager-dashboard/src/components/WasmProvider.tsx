'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WasmLoadingMessage } from './WasmLoadingMessage';
import * as aleo from '@provablehq/sdk';

// Singleton for SDK initialization
let loadingPromise: Promise<void> | null = null;
let loadedSDK: typeof aleo | null = null;

interface WasmContextType {
  sdk: typeof aleo | null;
  isInitialized: boolean;
  error: Error | null;
}

const WasmContext = createContext<WasmContextType | undefined>(undefined);

export function useWasm() {
  const context = useContext(WasmContext);
  if (context === undefined) {
    throw new Error('useWasm must be used within a WasmProvider');
  }
  return context;
}

export function WasmProvider({ children }: { children: ReactNode }) {
  const [sdk, setSDK] = useState<typeof aleo | null>(loadedSDK);
  const [isInitialized, setIsInitialized] = useState(!!loadedSDK);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeWasm = async () => {
      if (loadedSDK) {
        if (mounted) {
          setSDK(loadedSDK);
          setIsInitialized(true);
        }
        return;
      }

      try {
        if (!loadingPromise) {
          loadingPromise = aleo.initThreadPool().then(() => {
            loadedSDK = aleo;
          });
        }
        await loadingPromise;
        
        if (mounted) {
          setSDK(loadedSDK);
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Failed to initialize WASM:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize WASM'));
        }
      }
    };

    initializeWasm();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isInitialized && !error) {
    return <WasmLoadingMessage />;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Failed to initialize WASM: {error.message}
      </div>
    );
  }

  return (
    <WasmContext.Provider value={{ sdk, isInitialized, error }}>
      {children}
    </WasmContext.Provider>
  );
} 