import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const KeyVaultContext = createContext();

export function useKeyVault() {
  return useContext(KeyVaultContext);
}

const LOCAL_STORAGE_KEY = "snorkle_key_vault";

export function KeyVaultProvider({ children }) {
  const [keys, setKeys] = useState(() => {
    // Initialize state from localStorage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error loading keys from localStorage:", e);
      return [];
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(keys));
      console.log("Keys saved to localStorage:", keys.length);
    } catch (e) {
      console.error("Error saving keys to localStorage:", e);
    }
  }, [keys]);

  function addKey({ name, privateKey, viewKey, address }) {
    const newKey = {
      id: uuidv4(),
      name,
      privateKey,
      viewKey,
      address,
      createdAt: Date.now(),
    };
    setKeys(prev => {
      const updatedKeys = [...prev, newKey];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedKeys));
        console.log("New key added:", newKey.name);
      } catch (e) {
        console.error("Error saving new key to localStorage:", e);
      }
      return updatedKeys;
    });
  }

  function editKey(id, updates) {
    setKeys(prev => {
      const updatedKeys = prev.map(k => k.id === id ? { ...k, ...updates } : k);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedKeys));
        console.log("Key updated:", id);
      } catch (e) {
        console.error("Error saving updated key to localStorage:", e);
      }
      return updatedKeys;
    });
  }

  function deleteKey(id) {
    setKeys(prev => {
      const updatedKeys = prev.filter(k => k.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedKeys));
        console.log("Key deleted:", id);
      } catch (e) {
        console.error("Error saving after key deletion to localStorage:", e);
      }
      return updatedKeys;
    });
  }

  function clearAll() {
    setKeys([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      console.log("All keys cleared");
    } catch (e) {
      console.error("Error clearing keys from localStorage:", e);
    }
  }

  return (
    <KeyVaultContext.Provider value={{ keys, addKey, editKey, deleteKey, clearAll }}>
      {children}
    </KeyVaultContext.Provider>
  );
} 