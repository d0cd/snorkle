import "./App.css";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useNetwork } from "./contexts/NetworkContext";
import { ManageKeysModal } from "./components/ManageKeysModal";
import { WasmLoadingMessage } from "./components/WasmLoadingMessage";
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "./contexts/ThemeContext";
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Autocomplete,
    Button,
    Typography,
    useTheme as useMuiTheme,
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
    Settings as SettingsIcon,
    History as HistoryIcon
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
    {
        label: "History",
        path: "/history",
        icon: <HistoryIcon />,
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
    const [manageKeysOpen, setManageKeysOpen] = useState(false);
    const { mode, toggleTheme } = useTheme();
    const theme = useMuiTheme();

    useEffect(() => {
        setMenuIndex(location.pathname);
    }, [location]);

    return (
        <>
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
                    <Box sx={{ mt: 4, mb: 2 }}>
                        <SidebarNetworkControls />
                    </Box>
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
                    <Outlet />
                </Box>
            </Box>
            <ManageKeysModal open={manageKeysOpen} onClose={() => setManageKeysOpen(false)} />
        </>
    );
}

export default Main;
