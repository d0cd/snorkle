'use client';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { MappingEntry } from '@/lib/types';

interface DataTableProps {
  entries: MappingEntry[];
  isLoading?: boolean;
}

export function DataTable({ entries, isLoading = false }: DataTableProps) {
  console.log('DataTable entries:', entries);
  if (isLoading) {
    return (
      <Box sx={{ width: '100%', p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress color="primary" />
        <Box mt={2}>
          <span>Loading entries...</span>
        </Box>
      </Box>
    );
  }

  if (entries.length === 0) {
    return (
      <Alert severity="info" sx={{ my: 4 }}>
        No entries found. Try adjusting your search or filter criteria.
      </Alert>
    );
  }

  const isEventTable = true; // Force event table rendering for debugging

  if (isEventTable) {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1, my: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Oracle</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Block Height</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Event ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Home Score</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Away Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry, index) => {
              const event = entry.value;
              const eventData = event.event_data || {};
              // Helper to strip Aleo type suffixes
              const strip = (val: any) => typeof val === 'string' ? val.replace(/(u32|u8|field)$/,'') : val;
              return (
                <TableRow key={entry.key ?? index} hover>
                  <TableCell>{event.oracle}</TableCell>
                  <TableCell>{strip(event.timestamp)}</TableCell>
                  <TableCell>{strip(eventData.id)}</TableCell>
                  <TableCell>{strip(eventData.home_team_score)}</TableCell>
                  <TableCell>{strip(eventData.away_team_score)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Default rendering
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1, my: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Key</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow key={entry.key ?? index} hover>
              <TableCell component="th" scope="row">
                {entry.key}
              </TableCell>
              <TableCell>
                <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {typeof entry.value === 'object'
                    ? JSON.stringify(entry.value, null, 2)
                    : String(entry.value)}
                </pre>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 