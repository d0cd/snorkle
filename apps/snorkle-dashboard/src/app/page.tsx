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
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';

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
    { id: 'proto_snorkle_oracle_001.aleo', name: 'proto_snorkle_oracle_001.aleo' },
    { id: 'proto_snorkle_bet_000.aleo', name: 'proto_snorkle_bet_000.aleo' },
    { id: 'proto_snorkle_oracle_000.aleo', name: 'proto_snorkle_oracle_000.aleo' },
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

function sanitizeToJson(str: string) {
  // Add double quotes around keys
  let json = str.replace(/([a-zA-Z0-9_]+):/g, '"$1":');
  // Remove trailing commas before closing braces/brackets
  json = json.replace(/,\s*([}\]])/g, '$1');
  // Add double quotes around values that look like addresses, fields, or Aleo types
  json = json.replace(/: ([a-zA-Z0-9_]+field|aleo1[a-zA-Z0-9]+|[0-9]+u32|[0-9]+u8)/g, ': "$1"');
  // Remove newlines and extra spaces
  json = json.replace(/\n/g, '').replace(/\s+/g, ' ');
  return JSON.parse(json);
}

function EventsDashboard({ network, endpointUrl, program, mode, onRefresh, loading }: { network: string; endpointUrl: string; program: string; mode: string; onRefresh: () => void; loading: boolean }) {
  const [numEvents, setNumEvents] = useState(10); // Configurable number of events
  const [error, setError] = useState<string | null>(null);
  const [rawEntries, setRawEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!program || !endpointUrl) {
      setRawEntries([]);
      return;
    }
    let cancelled = false;
    async function fetchEvents() {
      setError(null);
      try {
        // 1. Fetch total_events[0u8] with correct URL structure
        const totalEventsRes = await fetch(`${endpointUrl}/${network}/program/${program}/mapping/total_events/0u8`);
        if (!totalEventsRes.ok) throw new Error('Failed to fetch total_events');
        const totalEventsData = await totalEventsRes.json();
        const totalEvents = parseInt(totalEventsData.value || totalEventsData, 10);
        if (isNaN(totalEvents) || totalEvents === 0) {
          setRawEntries([]);
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
        if (!cancelled) {
          setRawEntries(eventEntries);
          if (eventEntries.length > 0) {
            console.log('First event entry:', eventEntries[0]);
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to fetch events');
      }
    }
    fetchEvents();
    return () => { cancelled = true; };
  }, [program, endpointUrl, network, numEvents, onRefresh]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Events</Typography>
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
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Alert severity="info">Loading events...</Alert>
      ) : (
        <DataTable entries={rawEntries.map((event, idx) => ({
          key: idx.toString(),
          value: typeof event === 'string' ? sanitizeToJson(event) : event
        }))} />
      )}
    </Box>
  );
}

function RegistryDashboard({ network, endpointUrl, program, mode, onRefresh, loading }: { network: string; endpointUrl: string; program: string; mode: string; onRefresh: () => void; loading: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [rawEntries, setRawEntries] = useState<any[]>([]);
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number | null>(null);
  const [attestationInput, setAttestationInput] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (!program || !endpointUrl) {
      setRawEntries([]);
      return;
    }
    let cancelled = false;
    async function fetchOracles() {
      setError(null);
      try {
        // Fetch current block height
        const heightRes = await fetch(`${endpointUrl}/${network}/block/height/latest`);
        if (!heightRes.ok) throw new Error('Failed to fetch current block height');
        const heightData = await heightRes.json();
        const height = parseInt(heightData.value || heightData, 10);
        if (!cancelled) setCurrentBlockHeight(height);

        // 1. Fetch total_oracles[0u8] with correct URL structure
        const totalOraclesRes = await fetch(`${endpointUrl}/${network}/program/${program}/mapping/total_oracles/0u8`);
        if (!totalOraclesRes.ok) throw new Error('Failed to fetch total_oracles');
        const totalOraclesData = await totalOraclesRes.json();
        const totalOracles = parseInt(totalOraclesData.value || totalOraclesData, 10);
        if (isNaN(totalOracles) || totalOracles === 0) {
          setRawEntries([]);
          return;
        }

        // 2. Fetch all oracle addresses
        const oracleEntries: any[] = [];
        for (let i = 0; i < totalOracles; i++) {
          const addrRes = await fetch(`${endpointUrl}/${network}/program/${program}/mapping/registered_oracles_addresses/${i}u128`);
          if (!addrRes.ok) throw new Error(`Failed to fetch oracle address at index ${i}`);
          const addrData = await addrRes.json();
          const addr = addrData.value || addrData;

          // 3. Fetch oracle data for each address
          const oracleRes = await fetch(`${endpointUrl}/${network}/program/${program}/mapping/registered_oracles/${addr}`);
          if (!oracleRes.ok) throw new Error(`Failed to fetch oracle data for address ${addr}`);
          const oracleData = await oracleRes.json();
          const data = oracleData.value || oracleData;
          oracleEntries.push({
            ...data,
            oracle_id: addr,
            valid_until: parseInt(data.registration_timestamp) + 1000
          });
        }

        if (!cancelled) {
          setRawEntries(oracleEntries);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to fetch oracles');
      }
    }
    fetchOracles();
    return () => { cancelled = true; };
  }, [program, endpointUrl, network, onRefresh]);

  const handleAttestationCheck = () => {
    setSnackbarOpen(true);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Registry</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Alert severity="info">Loading registered oracles...</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1, my: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Oracle ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Attestation Hash</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Registration Height</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Valid Until Block</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rawEntries.map((oracle, index) => {
                const isExpired = currentBlockHeight !== null && oracle.valid_until < currentBlockHeight;
                return (
                  <TableRow 
                    key={oracle.oracle_id} 
                    hover
                    sx={{ 
                      opacity: isExpired ? 0.5 : 1,
                      '&:hover': {
                        opacity: isExpired ? 0.7 : 1
                      }
                    }}
                  >
                    <TableCell>{oracle.oracle_id}</TableCell>
                    <TableCell>{oracle.attestation_hash}</TableCell>
                    <TableCell>{oracle.registration_timestamp}</TableCell>
                    <TableCell>{oracle.valid_until}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Check Attestation Widget */}
      <Box mt={10} p={3} component={Paper} elevation={2} sx={{ maxWidth: 500, mx: 'auto', bgcolor: 'background.paper' }}>
        <Typography variant="h6" mb={2}>Check Attestation</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Attestation (hex)"
            variant="outlined"
            size="small"
            value={attestationInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAttestationInput(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleAttestationCheck}>Verify</Button>
        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Not yet implemented"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
