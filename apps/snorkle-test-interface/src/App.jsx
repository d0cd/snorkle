import React from 'react';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { NetworkProvider } from './contexts/NetworkContext';
import { KeyVaultProvider } from './contexts/KeyVaultContext';
import { TransactionHistoryProvider } from './contexts/TransactionHistoryContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Outlet } from 'react-router-dom';

function AppContent() {
    const { theme } = useTheme();
    
    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3}>
                <NetworkProvider>
                    <KeyVaultProvider>
                        <TransactionHistoryProvider>
                            <Outlet />
                        </TransactionHistoryProvider>
                    </KeyVaultProvider>
                </NetworkProvider>
            </SnackbarProvider>
        </MuiThemeProvider>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App; 