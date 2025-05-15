'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Key } from '@/lib/types';
import { WagerError } from '@/lib/utils';
import { useWasm } from '@/components/WasmProvider';

interface KeyContextType {
  keys: Key[];
  selectedKey: Key | null;
  loading: boolean;
  error: string | null;
  addKey: (privateKey: string) => Promise<void>;
  removeKey: (address: string) => void;
  selectKey: (address: string) => void;
  getPrivateKey: (address: string) => any | null;
  getViewKey: (address: string) => any | null;
}

const KeyContext = createContext<KeyContextType | undefined>(undefined);

const STORAGE_KEY = 'aleo_keys';

export const KeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sdk, isInitialized, error: sdkError } = useWasm();
  const [keys, setKeys] = useState<Key[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Select first key by default if none is selected
  useEffect(() => {
    if (!selectedKey && keys.length > 0) {
      setSelectedKey(keys[0]);
    }
  }, [keys, selectedKey]);

  const addKey = useCallback(async (privateKeyString: string) => {
    if (!isInitialized || !sdk) {
      throw new WagerError(sdkError?.message || 'SDK not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      const privateKey = sdk.PrivateKey.from_string(privateKeyString);
      const viewKey = sdk.ViewKey.from_private_key(privateKey);
      const address = privateKey.to_address().to_string();

      // Check if key already exists
      if (keys.some(k => k.address === address)) {
        throw new WagerError('Key already exists');
      }

      const newKey: Key = {
        address,
        privateKey: privateKeyString,
        viewKey: viewKey.to_string(),
      };

      setKeys((prev) => {
        const updated = [...prev, newKey];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      if (!selectedKey) {
        setSelectedKey(newKey);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid private key';
      setError(message);
      throw new WagerError(message);
    } finally {
      setLoading(false);
    }
  }, [sdk, isInitialized, sdkError, selectedKey, keys]);

  const removeKey = useCallback((address: string) => {
    setKeys((prev) => {
      const updated = prev.filter((key) => key.address !== address);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      if (selectedKey?.address === address) {
        setSelectedKey(updated[0] || null);
      }
      
      return updated;
    });
  }, [selectedKey]);

  const selectKey = useCallback((address: string) => {
    const key = keys.find((k) => k.address === address);
    if (key) {
      setSelectedKey(key);
    }
  }, [keys]);

  const getPrivateKey = useCallback((address: string) => {
    if (!isInitialized || !sdk) return null;
    const key = keys.find((k) => k.address === address);
    if (!key) return null;
    try {
      return sdk.PrivateKey.from_string(key.privateKey);
    } catch {
      return null;
    }
  }, [keys, sdk, isInitialized]);

  const getViewKey = useCallback((address: string) => {
    if (!isInitialized || !sdk) return null;
    const key = keys.find((k) => k.address === address);
    if (!key) return null;
    try {
      return sdk.ViewKey.from_string(key.viewKey);
    } catch {
      return null;
    }
  }, [keys, sdk, isInitialized]);

  return (
    <KeyContext.Provider
      value={{
        keys,
        selectedKey,
        loading,
        error,
        addKey,
        removeKey,
        selectKey,
        getPrivateKey,
        getViewKey,
      }}
    >
      {children}
    </KeyContext.Provider>
  );
};

export const useKeyContext = () => {
  const context = useContext(KeyContext);
  if (context === undefined) {
    throw new Error('useKeyContext must be used within a KeyProvider');
  }
  return context;
}; 