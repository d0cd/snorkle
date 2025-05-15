'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { verifyAttestation } from '@/lib/aleo';

interface RegistryDashboardProps {
  network: string;
  endpointUrl: string;
  program: string;
  mode: string;
  onRefresh: () => void;
  loading: boolean;
}

function sanitizeAleoMappingString(str: string): string {
  // Add double quotes around keys
  let json = str.replace(/([a-zA-Z0-9_]+):/g, '"$1":');
  // Add double quotes around values that are not already quoted or numbers
  json = json.replace(/: ([^",}{\[\]\s][^,}\]]*)/g, (match: string, p1: string) => {
    // If value is a number with a suffix (e.g., 7578251u32), keep as string
    if (/^[0-9]+u[0-9]+$/.test(p1) || /^[0-9]+$/.test(p1) || /field$/.test(p1)) {
      return `: "${p1}"`;
    }
    return match;
  });
  return json;
}

export function RegistryDashboard({ network, endpointUrl, program, mode, onRefresh, loading }: RegistryDashboardProps) {
  const [error, setError] = useState<string | null>(null);
  const [rawEntries, setRawEntries] = useState<any[]>([]);
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number | null>(null);
  const [attestationInput, setAttestationInput] = useState('');
  const [attestationBytes, setAttestationBytes] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [numOracles, setNumOracles] = useState(10); // Configurable number of oracles

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
        console.log('Current block height:', height);
        if (!cancelled) setCurrentBlockHeight(height);

        // 1. Fetch total_oracles[0u8] with correct URL structure
        const totalOraclesRes = await fetch(`${endpointUrl}/${network}/program/${program}/mapping/total_oracles/0u8`);
        if (!totalOraclesRes.ok) throw new Error('Failed to fetch total_oracles');
        const totalOraclesData = await totalOraclesRes.json();
        console.log('Raw total_oracles response:', totalOraclesData);
        const totalOracles = parseInt(totalOraclesData.value || totalOraclesData, 10);
        console.log('Parsed total oracles:', totalOracles);
        if (isNaN(totalOracles) || totalOracles === 0) {
          setRawEntries([]);
          return;
        }

        // 2. Fetch oracle addresses (limited by numOracles)
        const oracleEntries: any[] = [];
        const startIdx = Math.max(0, totalOracles - numOracles);
        console.log('Fetching oracles from index', startIdx, 'to', totalOracles - 1);
        for (let i = totalOracles - 1; i >= startIdx; i--) {
          const addrRes = await fetch(`${endpointUrl}/${network}/program/${program}/mapping/registered_oracles_addresses/${i}u128`);
          if (!addrRes.ok) throw new Error(`Failed to fetch oracle address at index ${i}`);
          const addrData = await addrRes.json();
          console.log(`Oracle address at index ${i}:`, addrData);
          const addr = addrData.value || addrData;
          console.log('Parsed oracle address:', addr);

          // 3. Fetch oracle data for each address
          const oracleRes = await fetch(`${endpointUrl}/${network}/program/${program}/mapping/registered_oracles/${addr}`);
          if (!oracleRes.ok) throw new Error(`Failed to fetch oracle data for address ${addr}`);
          const oracleData = await oracleRes.json();
          console.log('Raw oracle data:', oracleData);
          let data = oracleData.value || oracleData;
          let attestationHash = '';
          let registrationTimestampRaw = '0u32';
          if (typeof data === 'string') {
            // Use regex to extract attestation_hash and registration_timestamp
            const attMatch = data.match(/attestation_hash:\s*([^,\n}]*)/);
            const regMatch = data.match(/registration_timestamp:\s*([^,\n}]*)/);
            attestationHash = attMatch ? attMatch[1].trim() : '';
            registrationTimestampRaw = regMatch ? regMatch[1].trim() : '0u32';
          } else {
            attestationHash = data.attestation_hash || '';
            registrationTimestampRaw = data.registration_timestamp || '0u32';
          }
          console.log('Parsed oracle data:', data);
          console.log('Attestation Hash:', attestationHash);
          console.log('Registration Timestamp Raw:', registrationTimestampRaw);

          const registrationTimestamp = typeof registrationTimestampRaw === 'string'
            ? parseInt(registrationTimestampRaw.replace('u32', ''))
            : Number(registrationTimestampRaw);
          const validUntil = registrationTimestamp + 10000;

          console.log('Final parsed values:', {
            oracle_id: addr,
            attestation_hash: attestationHash,
            registration_timestamp: registrationTimestamp,
            valid_until: validUntil
          });
          oracleEntries.push({
            oracle_id: addr,
            attestation_hash: attestationHash,
            registration_timestamp: registrationTimestamp,
            valid_until: validUntil
          });
        }

        if (!cancelled) {
          console.log('Final oracle entries:', oracleEntries);
          setRawEntries(oracleEntries);
        }
      } catch (err: any) {
        console.error('Error in fetchOracles:', err);
        if (!cancelled) setError(err.message || 'Failed to fetch oracles');
      }
    }
    fetchOracles();
    return () => { cancelled = true; };
  }, [program, endpointUrl, network, onRefresh, numOracles]);

  const handleAttestationCheck = async () => {
    if (!attestationInput.trim() || !attestationBytes.trim()) {
      setSnackbarMessage('Please enter both oracle address and attestation bytes');
      setSnackbarOpen(true);
      return;
    }

    try {
      const result = await verifyAttestation(program, attestationInput.trim(), attestationBytes.trim(), network);
      setVerificationResult(result);
      
      if (result.isValid) {
        setSnackbarMessage(`Valid attestation found for oracle ${result.oracleId}`);
      } else {
        setSnackbarMessage(result.error || 'Invalid attestation');
      }
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Failed to verify attestation');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Registry</Typography>
      <Box display="flex" gap={2} mb={3} alignItems="center">
        <TextField
          size="small"
          label="# of oracles"
          type="number"
          value={numOracles}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumOracles(Math.max(1, Number(e.target.value)))}
          sx={{ minWidth: 120 }}
          inputProps={{ min: 1 }}
        />
      </Box>
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
        <Typography variant="h6" mb={2}>Verify Attestation</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Oracle Address"
            variant="outlined"
            size="small"
            value={attestationInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAttestationInput(e.target.value)}
            fullWidth
            placeholder="aleo1..."
            error={verificationResult && !verificationResult.isValid}
          />
          <TextField
            label="Attestation Bytes"
            variant="outlined"
            size="small"
            value={attestationBytes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAttestationBytes(e.target.value)}
            fullWidth
            multiline
            rows={4}
            error={verificationResult && !verificationResult.isValid}
            helperText={verificationResult && !verificationResult.isValid ? verificationResult.error : ''}
          />
          <Button 
            variant="contained" 
            onClick={handleAttestationCheck}
            disabled={loading || !attestationInput.trim() || !attestationBytes.trim()}
          >
            Verify
          </Button>
        </Box>
        {verificationResult && verificationResult.isValid && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Valid attestation found for oracle {verificationResult.oracleId}
            <br />
            Registration timestamp: {verificationResult.registrationTimestamp}
            <br />
            Valid until block: {verificationResult.validUntil}
          </Alert>
        )}
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
} 