'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import { DataTable } from '@/app/components/DataTable';
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';

interface EventsDashboardProps {
  network: string;
  endpointUrl: string;
  program: string;
  mode: string;
  onRefresh: () => void;
  loading: boolean;
}

function sanitizeToJson(str: string) {
  try {
    // First try parsing as is in case it's already valid JSON
    return JSON.parse(str);
  } catch {
    // If direct parsing fails, try to sanitize the string
    let json = str;
    
    // Add double quotes around keys
    json = json.replace(/([a-zA-Z0-9_]+):/g, '"$1":');
    
    // Handle Aleo-specific types
    json = json.replace(/: ([a-zA-Z0-9_]+field|aleo1[a-zA-Z0-9]+|[0-9]+u(8|16|32|64|128))/g, ': "$1"');
    
    // Handle boolean values
    json = json.replace(/: (true|false)/g, ': $1');
    
    // Handle numeric values
    json = json.replace(/: ([0-9]+)(?!u)/g, ': $1');
    
    // Remove trailing commas before closing braces/brackets
    json = json.replace(/,\s*([}\]])/g, '$1');
    
    // Remove newlines and extra spaces
    json = json.replace(/\n/g, '').replace(/\s+/g, ' ');
    
    try {
      return JSON.parse(json);
    } catch (e) {
      console.error('Failed to parse JSON:', json);
      return { error: 'Invalid JSON format', raw: str };
    }
  }
}

export function EventsDashboard({ network, endpointUrl, program, mode, onRefresh, loading }: EventsDashboardProps) {
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
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1, my: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Oracle ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Event ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Block Height</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Away Score</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Home Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rawEntries.map((event, idx) => {
                const parsedEvent = typeof event === 'string' ? sanitizeToJson(event) : event;
                return (
                  <TableRow key={idx} hover>
                    <TableCell>{parsedEvent.oracle || 'N/A'}</TableCell>
                    <TableCell>{parsedEvent.event_data?.id || 'N/A'}</TableCell>
                    <TableCell>{parsedEvent.timestamp?.replace('u32', '') || 'N/A'}</TableCell>
                    <TableCell>{parsedEvent.event_data?.away_team_score?.replace('u8', '') || 'N/A'}</TableCell>
                    <TableCell>{parsedEvent.event_data?.home_team_score?.replace('u8', '') || 'N/A'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
} 