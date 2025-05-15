'use client';
import { useState, useMemo, useEffect } from 'react';
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
import { DataTable } from './components/DataTable';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

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
  const [program, setProgram] = useState('proto_snorkle_oracle_001.aleo');

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
    { id: 'proto_snorkle_oracle_001.aleo', name: 'proto_snorkle_oracle_001.aleo' },
    { id: 'proto_snorkle_bet_000.aleo', name: 'proto_snorkle_bet_000.aleo' },
    { id: 'proto_snorkle_oracle_000.aleo', name: 'proto_snorkle_oracle_000.aleo' },
  ];

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
          <Typography variant="h4" fontWeight={700} color="primary" mb={2} letterSpacing={2} sx={{ textTransform: 'lowercase' }}>
            snorkle
          </Typography>
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
          <Divider sx={{ my: 2 }} />
        </Box>
        {/* Main Content */}
        <Box sx={{ flex: 1, minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', ml: '270px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2 }}>
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
              />
            )}
            {selectedDashboard === 'registry' && (
              <RegistryDashboard
                network={network}
                endpointUrl={endpointUrl}
                program={program}
                mode={mode}
              />
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function EventsDashboard({ network, endpointUrl, program, mode }: { network: string; endpointUrl: string; program: string; mode: string }) {
  const [numEvents, setNumEvents] = useState(10); // Configurable number of events
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawEntries, setRawEntries] = useState<any[]>([]);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    if (!program || !endpointUrl) {
      setRawEntries([]);
      return;
    }
    let cancelled = false;
    async function fetchEvents() {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch total_events[0u8] with correct URL structure
        const totalEventsRes = await fetch(`${endpointUrl}/${network}/program/${program}/mapping/total_events/0u8`);
        if (!totalEventsRes.ok) throw new Error('Failed to fetch total_events');
        const totalEventsData = await totalEventsRes.json();
        const totalEvents = parseInt(totalEventsData.value || totalEventsData, 10);
        if (isNaN(totalEvents) || totalEvents === 0) {
          setRawEntries([]);
          setLoading(false);
          return;
        }
        // 2. Fetch last N event_ids
        const startIdx = Math.max(0, totalEvents - numEvents);
        const ids: string[] = [];
        for (let i = startIdx; i < totalEvents; i++) {
          const idRes = await fetch(`${endpointUrl}/${network}/program/${program}/mapping/event_ids/${i}u128`);
          if (!idRes.ok) throw new Error(`Failed to fetch event_id at index ${i}`);
          const idData = await idRes.json();
          ids.push(idData.value || idData);
        }
        // 3. Fetch each event
        const eventEntries: any[] = [];
        for (const id of ids) {
          const eventRes = await fetch(`${endpointUrl}/${network}/program/${program}/mapping/events/${id}`);
          if (!eventRes.ok) throw new Error(`Failed to fetch event for id ${id}`);
          const eventData = await eventRes.json();
          eventEntries.push(eventData.value || eventData);
        }
        if (!cancelled) setRawEntries(eventEntries);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to fetch events');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEvents();
    return () => { cancelled = true; };
  }, [program, endpointUrl, network, numEvents, refreshIndex]);

  const handleRefresh = () => setRefreshIndex(idx => idx + 1);

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={3}>Events Dashboard</Typography>
      <Box display="flex" gap={2} mb={3} alignItems="center">
        <TextField
          size="small"
          label="# of events"
          type="number"
          value={numEvents}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumEvents(Math.max(1, Number(e.target.value)))}
          sx={{ minWidth: 120 }}
          inputProps={{ min: 1 }}
        />
        <Button
          variant="outlined"
          startIcon={loading ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading || !program}
          sx={{ minWidth: 110 }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Alert severity="info">Loading events...</Alert>
      ) : (
        <DataTable entries={rawEntries} />
      )}
    </Box>
  );
}

function RegistryDashboard({ network, endpointUrl, program, mode }: { network: string; endpointUrl: string; program: string; mode: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oracles, setOracles] = useState<string[]>([]);

  useEffect(() => {
    if (!program || !endpointUrl) {
      setOracles([]);
      return;
    }
    let cancelled = false;
    async function fetchOracles() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all keys from registered_oracles mapping with correct URL structure
        const res = await fetch(`${endpointUrl}/${network}/program/${program}/mapping/registered_oracles/keys`);
        if (!res.ok) throw new Error('Failed to fetch registered oracles');
        const data = await res.json();
        if (!cancelled) setOracles(data.keys || data);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to fetch oracles');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchOracles();
    return () => { cancelled = true; };
  }, [program, endpointUrl, network]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={3}>Registry Dashboard</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Alert severity="info">Loading registered oracles...</Alert>
      ) : (
        <Box>
          <Typography variant="h6" mb={2}>Registered Oracles</Typography>
          <Box sx={{ maxWidth: 600 }}>
            <DataTable entries={oracles.map(addr => ({ key: addr, value: '' }))} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
