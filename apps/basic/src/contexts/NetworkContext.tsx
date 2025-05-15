import React, { createContext, useContext, useState } from 'react';
import { useSnackbar } from 'notistack';

interface NetworkContextType {
    network: string;
    setNetwork: (network: string) => void;
    endpoint: string;
    setEndpoint: (endpoint: string) => void;
    defaultNetworks: { value: string; label: string }[];
    defaultEndpoints: { value: string; label: string; url?: string }[];
    getApiUrl: (path: string) => string;
}

const defaultNetworks = [
    { value: 'testnet', label: 'Testnet' },
    { value: 'mainnet', label: 'Mainnet' }
];

const defaultEndpoints = [
    { value: 'testnet', label: 'Testnet API', url: 'https://api.explorer.provable.com/v1' },
    { value: 'mainnet', label: 'Mainnet API', url: 'https://api.explorer.provable.com/v1' },
    { value: 'custom', label: 'Custom Endpoint' }
];

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [network, setNetwork] = useState('testnet');
    const [endpoint, setEndpoint] = useState(defaultEndpoints[0].url || '');
    const { enqueueSnackbar } = useSnackbar();

    const handleSetEndpoint = (newEndpoint: string) => {
        setEndpoint(newEndpoint);
        enqueueSnackbar('API endpoint updated', { variant: 'success' });
    };

    const handleSetNetwork = (newNetwork: string) => {
        setNetwork(newNetwork);
        // Update endpoint based on network
        const networkEndpoint = defaultEndpoints.find(e => e.value === newNetwork);
        if (networkEndpoint?.url) {
            setEndpoint(networkEndpoint.url);
        }
        enqueueSnackbar(`Switched to ${newNetwork}`, { variant: 'success' });
    };

    const getApiUrl = (path: string) => {
        // Remove leading slash if present
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `${endpoint}/${network}/${cleanPath}`;
    };

    return (
        <NetworkContext.Provider value={{
            network,
            setNetwork: handleSetNetwork,
            endpoint,
            setEndpoint: handleSetEndpoint,
            defaultNetworks,
            defaultEndpoints,
            getApiUrl
        }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
}; 