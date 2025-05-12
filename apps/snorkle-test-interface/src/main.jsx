import "./App.css";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { NetworkProvider, useNetwork } from "./contexts/NetworkContext";
import { KeyVaultProvider } from "./contexts/KeyVaultContext";
import { ManageKeysModal } from "./components/ManageKeysModal";
import { WasmLoadingMessage } from "./components/WasmLoadingMessage";
import { SnackbarProvider } from "notistack";
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Switch,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Autocomplete,
    Button,
    Typography,
    useTheme,
    ThemeProvider,
    createTheme,
    CssBaseline,
    IconButton,
    Tooltip
} from "@mui/material";
import {
    Api as ApiIcon,
    Code as CodeIcon,
    Add as AddIcon,
    Person as PersonIcon,
    SwapHoriz as SwapHorizIcon,
    Build as BuildIcon,
    Person as UserIcon,
    Settings as SettingsIcon
} from "@mui/icons-material";

const menuItems = [
    {
        label: "Account",
        path: "/account",
        icon: <UserIcon />,
    },
    {
        label: "Record",
        path: "/record",
        icon: <PersonIcon />,
    },
    {
        label: "REST",
        path: "/rest",
        icon: <ApiIcon />,
    },
    {
        label: "Deploy",
        path: "/deploy",
        icon: <BuildIcon />,
    },
    {
        label: "Execute",
        path: "/execute",
        icon: <SwapHorizIcon />,
    },
];

function SidebarNetworkControls() {
    const {
        network, setNetwork, defaultNetworks,
        endpoint, setEndpoint, defaultEndpoints
    } = useNetwork();
    
    const endpointOptions = defaultEndpoints
        .filter(opt => opt.value !== 'custom')
        .map(opt => ({ value: opt.url || opt.value, label: opt.label }));
    
    const endpointObj = defaultEndpoints.find(e => e.value === endpoint);
    const isPreset = endpointObj && endpointObj.url;
    const endpointValue = isPreset ? endpointObj.url : endpoint;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <FormControl fullWidth>
                <InputLabel>Select Network</InputLabel>
                <Select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    label="Select Network"
                >
                    {defaultNetworks.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl fullWidth>
                <Autocomplete
                    value={endpointValue}
                    options={endpointOptions}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="API Endpoint"
                            variant="outlined"
                        />
                    )}
                    onChange={(_, val) => {
                        const preset = defaultEndpoints.find(e => e.url === val);
                        if (preset) {
                            setEndpoint(preset.value);
                        } else {
                            setEndpoint(val);
                        }
                    }}
                    filterOptions={(options, { inputValue }) =>
                        options.filter(
                            (option) =>
                                option.value.toLowerCase().includes(inputValue.toLowerCase()) ||
                                option.label.toLowerCase().includes(inputValue.toLowerCase())
                        )
                    }
                />
            </FormControl>
        </Box>
    );
}

function Main() {
    const [menuIndex, setMenuIndex] = useState("account");
    const navigate = useNavigate();
    const location = useLocation();
    const [darkMode, setDarkMode] = useState(true);
    const [manageKeysOpen, setManageKeysOpen] = useState(false);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: {
                main: '#18e48f',
            },
        },
    });

    useEffect(() => {
        setMenuIndex(location.pathname);
    }, [location]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3}>
                <WasmLoadingMessage />
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                    <Box
                        sx={{
                            width: 240,
                            flexShrink: 0,
                            display: { xs: 'none', sm: 'block' },
                            borderRight: 1,
                            borderColor: 'divider',
                        }}
                    >
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
                                    onClick={() => navigate(item.path)}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItem>
                            ))}
                        </List>
                        <SidebarNetworkControls />
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Button
                                variant="outlined"
                                startIcon={<SettingsIcon />}
                                onClick={() => setManageKeysOpen(true)}
                            >
                                Manage Keys
                            </Button>
                        </Box>
                    </Box>
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            p: 3,
                            width: { sm: `calc(100% - 240px)` },
                            minWidth: '850px',
                        }}
                    >
                        <Box sx={{
                            position: 'absolute',
                            top: 16,
                            right: 32,
                            zIndex: 1000,
                        }}>
                            <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                                <Switch
                                    checked={darkMode}
                                    onChange={(e) => setDarkMode(e.target.checked)}
                                />
                            </Tooltip>
                        </Box>
                        <Outlet />
                    </Box>
                </Box>
                <ManageKeysModal open={manageKeysOpen} onClose={() => setManageKeysOpen(false)} />
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default function AppWithNetworkProvider() {
    return (
        <NetworkProvider>
            <KeyVaultProvider>
                <Main />
            </KeyVaultProvider>
        </NetworkProvider>
    );
}
