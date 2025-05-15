'use client';
import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const EventsDashboard = dynamic(() => import('./components/EventsDashboard').then(mod => mod.EventsDashboard), {
  ssr: false,
  loading: () => <Alert severity="info">Loading dashboard...</Alert>
});

const RegistryDashboard = dynamic(() => import('./components/RegistryDashboard').then(mod => mod.RegistryDashboard), {
  ssr: false,
  loading: () => <Alert severity="info">Loading dashboard...</Alert>
});

const NETWORKS = [
  { label: 'mainnet', value: 'mainnet' },
  { label: 'testnet', value: 'testnet' },
  { label: 'canary', value: 'canary' },
];
const ENDPOINTS = [
  { label: 'Provable', value: 'provable', url: 'https://api.explorer.provable.com/v1' },
  { label: 'devnet', value: 'devnet', url: 'http://localhost:3030' },
  { label: 'custom', value: 'custom' },
];
const DASHBOARDS = [
  { id: 'events', name: 'Events' },
  { id: 'registry', name: 'Registry' },
];

export default function AppPage() {
  const [selectedDashboard, setSelectedDashboard] = useState(DASHBOARDS[0].id);
  const [network, setNetwork] = useState(NETWORKS[1].value); // default to testnet
  const [endpoint, setEndpoint] = useState(ENDPOINTS[0].value);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const [program, setProgram] = useState('proto_snorkle_oracle_002.aleo');
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get the actual endpoint URL
  const endpointObj = ENDPOINTS.find(e => e.value === endpoint);
  const endpointUrl: string = endpoint === 'custom' ? customEndpoint : (endpointObj && endpointObj.url ? endpointObj.url : '');

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      background: {
        default: mode === 'dark' ? '#18181b' : '#f5f5f5',
        paper: mode === 'dark' ? '#23232a' : '#fff',
      },
    },
  }), [mode]);

  const programs = [
    { id: 'proto_snorkle_oracle_002.aleo', name: 'proto_snorkle_oracle_002.aleo' },
  ];

  // Fetch block height for sidebar
  useEffect(() => {
    async function fetchBlockHeight() {
      if (!program || !endpointUrl) return;
      try {
        const heightRes = await fetch(`${endpointUrl}/${network}/block/height/latest`);
        if (!heightRes.ok) return;
        const heightData = await heightRes.json();
        const height = parseInt(heightData.value || heightData, 10);
        setBlockHeight(height);
      } catch {}
    }
    fetchBlockHeight();
  }, [program, endpointUrl, network, refreshing]);

  // Unified refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500); // quick visual feedback
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: 270,
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            py: 4,
            px: 2,
            minHeight: '100vh',
            boxShadow: 3,
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1100,
          }}
        >
          <Typography variant="h4" fontWeight={700} color="primary" mb={2} letterSpacing={2} sx={{ textTransform: 'lowercase' }}>
            snorkle
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Oracle</InputLabel>
            <Select
              value={program}
              label="Oracle"
              onChange={(e: React.ChangeEvent<{ value: unknown }>) => setProgram(e.target.value as string)}
            >
              {programs.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider sx={{ mb: 2 }} />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Dashboard</InputLabel>
            <Select
              value={selectedDashboard}
              label="Dashboard"
              onChange={(e: React.ChangeEvent<{ value: unknown }>) => setSelectedDashboard(e.target.value as string)}
            >
              {DASHBOARDS.map(d => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider sx={{ my: 2 }} />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Network</InputLabel>
            <Select
              value={network}
              label="Network"
              onChange={(e: React.ChangeEvent<{ value: unknown }>) => setNetwork(e.target.value as string)}
            >
              {NETWORKS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Endpoint</InputLabel>
            <Select
              value={endpoint}
              label="Endpoint"
              onChange={(e: React.ChangeEvent<{ value: unknown }>) => setEndpoint(e.target.value as string)}
            >
              {ENDPOINTS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {endpoint === 'custom' && (
            <TextField
              size="small"
              label="Custom Endpoint"
              value={customEndpoint}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomEndpoint(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="https://your-endpoint.com"
            />
          )}
          {/* Block Height Section */}
          <Divider sx={{ my: 2 }} />
          {blockHeight !== null && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.5 }}>
                Current Height
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {blockHeight}
              </Typography>
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
        </Box>
        {/* Main Content */}
        <Box sx={{ flex: 1, minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', ml: '270px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2, gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={refreshing ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ minWidth: 110 }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <IconButton sx={{ ml: 1 }} onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
          <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
            {selectedDashboard === 'events' && (
              <EventsDashboard
                network={network}
                endpointUrl={endpointUrl}
                program={program}
                mode={mode}
                onRefresh={handleRefresh}
                loading={refreshing}
              />
            )}
            {selectedDashboard === 'registry' && (
              <RegistryDashboard
                network={network}
                endpointUrl={endpointUrl}
                program={program}
                mode={mode}
                onRefresh={handleRefresh}
                loading={refreshing}
              />
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
