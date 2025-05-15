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

  // Check if entries are event objects (oracle, timestamp, event_data)
  const isEventTable = entries[0]?.value && typeof entries[0].value === 'object' &&
    'oracle' in entries[0].value && 'timestamp' in entries[0].value && 'event_data' in entries[0].value;

  if (isEventTable) {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1, my: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Oracle</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Block Height</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Event ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Away Score</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Home Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => {
              const event = entry.value;
              return (
                <TableRow key={entry.key} hover>
                  <TableCell>{event.oracle}</TableCell>
                  <TableCell>{String(event.timestamp).replace(/u32$/, '')}</TableCell>
                  <TableCell>{event.event_data?.id ? String(event.event_data.id).replace(/field$/, '') : ''}</TableCell>
                  <TableCell>{event.event_data?.away_team_score ? String(event.event_data.away_team_score).replace(/u8$/, '') : ''}</TableCell>
                  <TableCell>{event.event_data?.home_team_score ? String(event.event_data.home_team_score).replace(/u8$/, '') : ''}</TableCell>
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
          {entries.map((entry) => (
            <TableRow key={entry.key} hover>
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