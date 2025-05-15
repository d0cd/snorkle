import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon,
    AccountBalance as AccountIcon,
    History as HistoryIcon,
    Settings as SettingsIcon,
    Build as BuildIcon,
    SwapHoriz as SwapHorizIcon,
    Api as ApiIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useKeyVault } from '../contexts/KeyVaultContext';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { NetworkSelector } from './NetworkSelector';

const drawerWidth = 240;

const menuItems = [
    { text: 'Account', icon: <AccountIcon />, path: '/' },
    { text: 'Record', icon: <PersonIcon />, path: '/record' },
    { text: 'REST', icon: <ApiIcon />, path: '/rest' },
    { text: 'Deploy', icon: <BuildIcon />, path: '/deploy' },
    { text: 'Execute', icon: <SwapHorizIcon />, path: '/execute' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' }
];

export const Navigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedKey } = useKeyVault();
    const { mode, toggleTheme } = useAppTheme();
    const [manageKeysOpen, setManageKeysOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'flex-start', 
                minHeight: 220, 
                gap: 3, 
                pt: 3 
            }}>
                <Typography 
                    variant="h3" 
                    component={Link} 
                    to="/" 
                    sx={{ 
                        textDecoration: 'none',
                        color: 'inherit',
                        textAlign: 'center',
                        lineHeight: 1.1
                    }}
                >
                    snorkle<br />test
                </Typography>
            </Box>
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.path}
                        selected={location.pathname === item.path}
                        onClick={() => {
                            navigate(item.path);
                            if (isMobile) {
                                setMobileOpen(false);
                            }
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
            <Box sx={{ mt: 4, mb: 2 }}>
                <NetworkSelector />
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Box
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    display: { xs: 'none', sm: 'block' },
                    borderRight: 1,
                    borderColor: 'divider',
                }}
            >
                {drawer}
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    alignItems: 'center',
                    gap: 2,
                    mb: 3,
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    backgroundColor: 'background.default',
                    py: 1
                }}>
                    <Button
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        onClick={() => setManageKeysOpen(true)}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 2
                        }}
                    >
                        Manage Keys
                    </Button>
                    <ThemeToggle darkMode={mode === 'dark'} onToggle={toggleTheme} />
                </Box>
                {children}
            </Box>
        </Box>
    );
}; 