import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSnackbar } from 'notistack';

interface Key {
    id: string;
    name: string;
    privateKey: string;
    viewKey: string;
    address: string;
    createdAt: number;
}

interface KeyVaultContextType {
    keys: Key[];
    selectedKey: Key | null;
    setSelectedKey: (key: Key | null) => void;
    addKey: (key: Omit<Key, 'id' | 'createdAt'>) => void;
    editKey: (id: string, updates: Partial<Key>) => void;
    removeKey: (id: string) => void;
    clearAll: () => void;
}

const LOCAL_STORAGE_KEY = 'aleo_basic_key_vault';

const KeyVaultContext = createContext<KeyVaultContextType | undefined>(undefined);

export const KeyVaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [keys, setKeys] = useState<Key[]>(() => {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading keys from localStorage:', e);
            return [];
        }
    });
    const [selectedKey, setSelectedKey] = useState<Key | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(keys));
        } catch (e) {
            console.error('Error saving keys to localStorage:', e);
        }
    }, [keys]);

    const addKey = (key: Omit<Key, 'id' | 'createdAt'>) => {
        const newKey = {
            ...key,
            id: uuidv4(),
            createdAt: Date.now(),
        };
        setKeys(prev => {
            const updatedKeys = [...prev, newKey];
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedKeys));
            } catch (e) {
                console.error('Error saving new key to localStorage:', e);
            }
            return updatedKeys;
        });
        enqueueSnackbar('Key added successfully', { variant: 'success' });
    };

    const editKey = (id: string, updates: Partial<Key>) => {
        setKeys(prev => {
            const updatedKeys = prev.map(k => k.id === id ? { ...k, ...updates } : k);
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedKeys));
            } catch (e) {
                console.error('Error saving updated key to localStorage:', e);
            }
            return updatedKeys;
        });
        enqueueSnackbar('Key updated successfully', { variant: 'success' });
    };

    const removeKey = (id: string) => {
        setKeys(prev => {
            const updatedKeys = prev.filter(k => k.id !== id);
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedKeys));
            } catch (e) {
                console.error('Error saving updated keys to localStorage:', e);
            }
            return updatedKeys;
        });
        if (selectedKey?.id === id) {
            setSelectedKey(null);
        }
        enqueueSnackbar('Key removed successfully', { variant: 'success' });
    };

    const clearAll = () => {
        setKeys([]);
        setSelectedKey(null);
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch (e) {
            console.error('Error clearing keys from localStorage:', e);
        }
        enqueueSnackbar('All keys cleared', { variant: 'success' });
    };

    return (
        <KeyVaultContext.Provider value={{
            keys,
            selectedKey,
            setSelectedKey,
            addKey,
            editKey,
            removeKey,
            clearAll
        }}>
            {children}
        </KeyVaultContext.Provider>
    );
};

export const useKeyVault = () => {
    const context = useContext(KeyVaultContext);
    if (!context) {
        throw new Error('useKeyVault must be used within a KeyVaultProvider');
    }
    return context;
}; 