import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import KeyIcon from '@mui/icons-material/Key';
import Alert from '@mui/material/Alert';
import { useKeyContext } from '@/contexts/KeyContext';

export default function KeySelector() {
  const { keys, activeKey, addKey, selectKey, error } = useKeyContext();
  const [open, setOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const handleAddKey = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewKeyName('');
  };

  const handleSaveKey = () => {
    if (!newKeyName.trim()) {
      return;
    }

    // TODO: Implement actual key generation with Aleo
    const newKey = {
      name: newKeyName,
      privateKey: 'simulated-private-key',
      publicKey: 'simulated-public-key',
      address: 'simulated-address',
    };

    addKey(newKey);
    handleClose();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <KeyIcon sx={{ mr: 1 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddKey}
            fullWidth
          >
            Add Key
          </Button>
        </Box>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <List>
        {keys.map((key) => (
          <ListItem
            key={key.name}
            selected={activeKey?.name === key.name}
            onClick={() => selectKey(key.name)}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemText
              primary={key.name}
              secondary={key.address.slice(0, 8) + '...'}
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Key Name"
            fullWidth
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSaveKey} 
            variant="contained"
            disabled={!newKeyName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 