import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useWagerContext } from '@/contexts/WagerContext';
import { useKeyContext } from '@/contexts/KeyContext';

export default function WagerForm() {
  const { makeWager, error } = useWagerContext();
  const { activeKey } = useKeyContext();
  const [eventId, setEventId] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [toWin, setToWin] = useState('');
  const [vig, setVig] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeKey) {
      return;
    }

    const bet = parseFloat(betAmount);
    const winAmount = parseFloat(toWin);
    const vigAmount = parseFloat(vig);

    if (isNaN(bet) || isNaN(winAmount) || isNaN(vigAmount)) {
      return;
    }

    await makeWager({
      eventId,
      bet,
      toWin: winAmount,
      vig: vigAmount,
    });

    // Reset form on success
    if (!error) {
      setEventId('');
      setBetAmount('');
      setToWin('');
      setVig('');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create New Wager
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          disabled={!activeKey}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          label="Bet Amount"
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          disabled={!activeKey}
          inputProps={{ min: 0, step: 0.01 }}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          label="Amount to Win"
          type="number"
          value={toWin}
          onChange={(e) => setToWin(e.target.value)}
          disabled={!activeKey}
          inputProps={{ min: 0, step: 0.01 }}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          label="Vig"
          type="number"
          value={vig}
          onChange={(e) => setVig(e.target.value)}
          disabled={!activeKey}
          inputProps={{ min: 0, step: 0.01 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={!activeKey || !eventId || !betAmount || !toWin || !vig}
        >
          Create Wager
        </Button>
      </Box>
    </Paper>
  );
} 