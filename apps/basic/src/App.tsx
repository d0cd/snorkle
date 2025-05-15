import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme, useMediaQuery } from '@mui/material';
import {
    AccountBalance as AccountIcon,
    Storage as RecordIcon,
    Api as RestIcon,
    CloudUpload as DeployIcon,
    PlayArrow as ExecuteIcon,
    History as HistoryIcon,
    Menu as MenuIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { NetworkProvider } from './contexts/NetworkContext';
import { KeyVaultProvider } from './contexts/KeyVaultContext';
import { TransactionHistoryProvider } from './contexts/TransactionHistoryContext';
import { ThemeProvider as AppThemeProvider, useTheme as useAppTheme } from './contexts/ThemeContext';
import { Account } from './pages/Account';
import { Record } from './pages/Record';
import { Rest } from './pages/Rest';
import { Deploy } from './pages/Deploy';
import { Execute } from './pages/Execute';
import { History } from './pages/History';
import { NotFound } from './pages/NotFound';
import { ThemeToggle } from './components/ThemeToggle';

const drawerWidth = 240;

const MainLayout: React.FC = () => {
    const { theme, toggleTheme } = useAppTheme();
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems = [
        { text: 'Account', icon: <AccountIcon />, path: '/' },
        { text: 'Record', icon: <RecordIcon />, path: '/record' },
        { text: 'REST API', icon: <RestIcon />, path: '/rest' },
        { text: 'Deploy', icon: <DeployIcon />, path: '/deploy' },
        { text: 'Execute', icon: <ExecuteIcon />, path: '/execute' },
        { text: 'History', icon: <HistoryIcon />, path: '/history' },
    ];

    const drawer = (
        <Box sx={{ width: drawerWidth }}>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    Snorkle
                </Typography>
            </Toolbar>
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        component={Link}
                        to={item.path}
                        onClick={() => isMobile && handleDrawerToggle()}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Snorkle
                    </Typography>
                    <ThemeToggle />
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: '64px'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

function AppContent() {
    const { theme } = useAppTheme();
    
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3}>
                <NetworkProvider>
                    <KeyVaultProvider>
                        <TransactionHistoryProvider>
                            <Router>
                                <Routes>
                                    <Route path="/" element={<MainLayout />}>
                                        <Route index element={<Account />} />
                                        <Route path="record" element={<Record />} />
                                        <Route path="rest" element={<Rest />} />
                                        <Route path="deploy" element={<Deploy />} />
                                        <Route path="execute" element={<Execute />} />
                                        <Route path="history" element={<History />} />
                                        <Route path="*" element={<NotFound />} />
                                    </Route>
                                </Routes>
                            </Router>
                        </TransactionHistoryProvider>
                    </KeyVaultProvider>
                </NetworkProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

function App() {
    return (
        <AppThemeProvider>
            <AppContent />
        </AppThemeProvider>
    );
}

export default App;
