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

export function RegistryDashboard({ network, endpointUrl, program, mode, onRefresh, loading }: RegistryDashboardProps) {
  const [error, setError] = useState<string | null>(null);
  const [rawEntries, setRawEntries] = useState<any[]>([]);
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number | null>(null);
  const [attestationInput, setAttestationInput] = useState('');
  const [attestationHash, setAttestationHash] = useState('');
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

        // 2. Fetch oracle addresses (limited by numOracles)
        const oracleEntries: any[] = [];
        const startIdx = Math.max(0, totalOracles - numOracles);
        for (let i = totalOracles - 1; i >= startIdx; i--) {
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
  }, [program, endpointUrl, network, onRefresh, numOracles]);

  const handleAttestationCheck = async () => {
    if (!attestationInput.trim() || !attestationHash.trim()) {
      setSnackbarMessage('Please enter both oracle address and attestation hash');
      setSnackbarOpen(true);
      return;
    }

    try {
      const result = await verifyAttestation(program, attestationInput.trim(), attestationHash.trim(), network);
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
            label="Attestation Hash"
            variant="outlined"
            size="small"
            value={attestationHash}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAttestationHash(e.target.value)}
            fullWidth
            error={verificationResult && !verificationResult.isValid}
            helperText={verificationResult && !verificationResult.isValid ? verificationResult.error : ''}
          />
          <Button 
            variant="contained" 
            onClick={handleAttestationCheck}
            disabled={loading || !attestationInput.trim() || !attestationHash.trim()}
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