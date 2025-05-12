import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const KeyVaultContext = createContext();

export function useKeyVault() {
  return useContext(KeyVaultContext);
}

const LOCAL_STORAGE_KEY = "snorkle_key_vault";

export function KeyVaultProvider({ children }) {
  const [keys, setKeys] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setKeys(JSON.parse(stored));
      } catch (e) {
        setKeys([]);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(keys));
  }, [keys]);

  function addKey({ name, privateKey, viewKey, address }) {
    setKeys(prev => [
      ...prev,
      {
        id: uuidv4(),
        name,
        privateKey,
        viewKey,
        address,
        createdAt: Date.now(),
      },
    ]);
  }

  function editKey(id, updates) {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
  }

  function deleteKey(id) {
    setKeys(prev => prev.filter(k => k.id !== id));
  }

  function clearAll() {
    setKeys([]);
  }

  return (
    <KeyVaultContext.Provider value={{ keys, addKey, editKey, deleteKey, clearAll }}>
      {children}
    </KeyVaultContext.Provider>
  );
} 