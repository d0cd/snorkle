import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { KeyPair, KeyStore } from '@/lib/types/key';

interface KeyContextType {
  keys: KeyPair[];
  activeKey: KeyPair | null;
  addKey: (key: KeyPair) => void;
  removeKey: (name: string) => void;
  selectKey: (name: string) => void;
  loading: boolean;
  error: string | null;
}

const KeyContext = createContext<KeyContextType | undefined>(undefined);

const STORAGE_KEY = 'wager-dashboard-keys';

export function KeyProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<KeyPair[]>([]);
  const [activeKey, setActiveKey] = useState<KeyPair | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load keys from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { keys: storedKeys, activeKeyName } = JSON.parse(stored) as KeyStore;
        setKeys(storedKeys);
        if (activeKeyName) {
          const key = storedKeys.find(k => k.name === activeKeyName);
          if (key) setActiveKey(key);
        }
      }
    } catch (err) {
      setError('Failed to load keys from storage');
      console.error('Failed to load keys:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save keys to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        const store: KeyStore = {
          keys,
          activeKeyName: activeKey?.name || null,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      } catch (err) {
        setError('Failed to save keys to storage');
        console.error('Failed to save keys:', err);
      }
    }
  }, [keys, activeKey, loading]);

  const addKey = (key: KeyPair) => {
    if (keys.some(k => k.name === key.name)) {
      setError('A key with this name already exists');
      return;
    }
    setKeys(prev => [...prev, key]);
    setError(null);
  };

  const removeKey = (name: string) => {
    setKeys(prev => prev.filter(k => k.name !== name));
    if (activeKey?.name === name) {
      setActiveKey(null);
    }
    setError(null);
  };

  const selectKey = (name: string) => {
    const key = keys.find(k => k.name === name);
    if (key) {
      setActiveKey(key);
      setError(null);
    } else {
      setError('Key not found');
    }
  };

  return (
    <KeyContext.Provider
      value={{
        keys,
        activeKey,
        addKey,
        removeKey,
        selectKey,
        loading,
        error,
      }}
    >
      {children}
    </KeyContext.Provider>
  );
}

export function useKeyContext() {
  const context = useContext(KeyContext);
  if (context === undefined) {
    throw new Error('useKeyContext must be used within a KeyProvider');
  }
  return context;
} 