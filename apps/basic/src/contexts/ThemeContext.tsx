import React, { createContext, useContext, useState, useCallback } from 'react';
import { createTheme } from '@mui/material';

interface ThemeContextType {
    mode: 'light' | 'dark';
    toggleTheme: () => void;
    theme: ReturnType<typeof createTheme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<'light' | 'dark'>('dark');

    const toggleTheme = useCallback(() => {
        setMode(prev => prev === 'light' ? 'dark' : 'light');
    }, []);

    const theme = createTheme({
        palette: {
            mode,
            primary: {
                main: mode === 'dark' ? '#18e48f' : '#1976d2',
            },
            secondary: {
                main: mode === 'dark' ? '#dc004e' : '#dc004e',
            },
            background: {
                default: mode === 'dark' ? '#121212' : '#f5f5f5',
                paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
            },
        },
        typography: {
            fontFamily: [
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                'sans-serif',
                '"Apple Color Emoji"',
                '"Segoe UI Emoji"',
                '"Segoe UI Symbol"',
            ].join(','),
        },
    });

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 