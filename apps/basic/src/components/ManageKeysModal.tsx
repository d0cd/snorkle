import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    TextField,
    Typography,
    IconButton,
    Box,
    Collapse,
    Paper,
    Tooltip,
    InputAdornment,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Download as DownloadIcon,
    Upload as UploadIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    ContentCopy as CopyIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Casino as CasinoIcon
} from '@mui/icons-material';
import { useKeyVault } from '../contexts/KeyVaultContext';
import { useSnackbar } from 'notistack';
import { useAleoWASM } from '../hooks/useAleoWASM';

interface ManageKeysModalProps {
    open: boolean;
    onClose: () => void;
}

export const ManageKeysModal: React.FC<ManageKeysModalProps> = ({ open, onClose }) => {
    const { keys, addKey, editKey, removeKey, clearAll } = useKeyVault();
    const { enqueueSnackbar } = useSnackbar();
    const [aleo, aleoLoading] = useAleoWASM();
    const [newKeyModalOpen, setNewKeyModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});
    const [newKey, setNewKey] = useState({
        name: '',
        privateKey: '',
        viewKey: '',
        address: ''
    });
    const [generatedKey, setGeneratedKey] = useState<{
        privateKey: string;
        viewKey: string;
        address: string;
    } | null>(null);
    const [generatingKey, setGeneratingKey] = useState(false);
    const [nameError, setNameError] = useState('');

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar('Copied to clipboard', { variant: 'success' });
    };

    const handleGenerateRandomKey = async () => {
        if (aleoLoading) {
            enqueueSnackbar('Aleo SDK is still loading. Please wait a moment.', { variant: 'error' });
            return;
        }
        if (!aleo) {
            enqueueSnackbar('Aleo SDK failed to load. Please refresh the page.', { variant: 'error' });
            return;
        }

        setGeneratingKey(true);
        const loadingKey = enqueueSnackbar('Generating new key...', { 
            persist: true,
            variant: 'info'
        });

        try {
            const privateKey = new aleo.PrivateKey();
            const key = {
                privateKey: privateKey.to_string(),
                viewKey: privateKey.to_view_key().to_string(),
                address: privateKey.to_address().to_string(),
            };
            setNewKey(prev => ({ ...prev, privateKey: key.privateKey }));
            setGeneratedKey(key);
            if (!newKey.name.trim()) {
                setNewKey(prev => ({ ...prev, name: `Account ${key.address.slice(0, 6)}` }));
            }
            enqueueSnackbar('Key generated successfully!', { variant: 'success' });
        } catch (error) {
            console.error('Error generating key:', error);
            enqueueSnackbar('Failed to generate key. Please try again.', { variant: 'error' });
        } finally {
            setGeneratingKey(false);
        }
    };

    const handlePrivateKeyChange = async (value: string) => {
        setNewKey(prev => ({ ...prev, privateKey: value }));
        if (value && !aleoLoading && aleo) {
            try {
                const privateKey = new aleo.PrivateKey(value);
                const key = {
                    privateKey: privateKey.to_string(),
                    viewKey: privateKey.to_view_key().to_string(),
                    address: privateKey.to_address().to_string(),
                };
                setGeneratedKey(key);
                setNewKey(prev => ({ 
                    ...prev, 
                    name: prev.name || `Account ${key.address.slice(0, 6)}`,
                    viewKey: key.viewKey,
                    address: key.address
                }));
            } catch (error) {
                setGeneratedKey(null);
            }
        } else {
            setGeneratedKey(null);
        }
    };

    const handleEdit = (id: string, name: string) => {
        setEditingId(id);
        setEditName(name);
    };

    const handleEditSave = (id: string) => {
        editKey(id, { name: editName });
        setEditingId(null);
        setEditName('');
    };

    const handleAddKey = () => {
        if (!newKey.name.trim()) {
            setNameError('Please enter an account name');
            return;
        }
        if (keys.some(k => k.name.trim().toLowerCase() === newKey.name.trim().toLowerCase())) {
            setNameError('Account name already exists');
            return;
        }
        if (!generatedKey) {
            enqueueSnackbar('Please enter a valid private key or generate one', { variant: 'error' });
            return;
        }
        setNameError('');
        addKey({
            name: newKey.name,
            privateKey: generatedKey.privateKey,
            viewKey: generatedKey.viewKey,
            address: generatedKey.address
        });
        setNewKey({
            name: '',
            privateKey: '',
            viewKey: '',
            address: ''
        });
        setGeneratedKey(null);
        setNewKeyModalOpen(false);
    };

    const handleExport = () => {
        const data = JSON.stringify(keys, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aleo-keys.json';
        a.click();
        URL.revokeObjectURL(url);
        enqueueSnackbar('Keys exported successfully', { variant: 'success' });
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target?.result as string);
                if (Array.isArray(imported)) {
                    imported.forEach(k => {
                        addKey({
                            name: k.name,
                            privateKey: k.privateKey,
                            viewKey: k.viewKey,
                            address: k.address
                        });
                    });
                    enqueueSnackbar('Keys imported successfully', { variant: 'success' });
                } else {
                    enqueueSnackbar('Invalid key format', { variant: 'error' });
                }
            } catch (error) {
                enqueueSnackbar('Invalid JSON file', { variant: 'error' });
            }
        };
        reader.readAsText(file);
    };

    const toggleExpand = (id: string) => {
        setExpandedAccounts(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Manage Keys</DialogTitle>
                <DialogContent>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setNewKeyModalOpen(true)}
                        >
                            Add Key
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<UploadIcon />}
                            component="label"
                        >
                            Import
                            <input
                                type="file"
                                accept="application/json"
                                hidden
                                onChange={handleImport}
                            />
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete all keys?')) {
                                    clearAll();
                                }
                            }}
                        >
                            Clear All
                        </Button>
                    </Stack>

                    <Stack spacing={2}>
                        {keys.map((key) => (
                            <Paper key={key.id} variant="outlined" sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {editingId === key.id ? (
                                        <TextField
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleEditSave(key.id)}
                                            autoFocus
                                            size="small"
                                        />
                                    ) : (
                                        <Typography variant="h6">{key.name}</Typography>
                                    )}
                                    <Box>
                                        <IconButton onClick={() => toggleExpand(key.id)}>
                                            {expandedAccounts[key.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                        {editingId === key.id ? (
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleEditSave(key.id)}
                                            >
                                                <SaveIcon />
                                            </IconButton>
                                        ) : (
                                            <Tooltip title="Edit Name">
                                                <IconButton
                                                    onClick={() => handleEdit(key.id, key.name)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Button
                                            color="error"
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this key?')) {
                                                    removeKey(key.id);
                                                }
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                </Box>
                                <Collapse in={expandedAccounts[key.id]}>
                                    <Stack spacing={1} sx={{ mt: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>
                                                Address:
                                            </Typography>
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {key.address}
                                            </Typography>
                                            <IconButton size="small" onClick={() => handleCopy(key.address)}>
                                                <CopyIcon />
                                            </IconButton>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>
                                                Private Key:
                                            </Typography>
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {key.privateKey}
                                            </Typography>
                                            <IconButton size="small" onClick={() => handleCopy(key.privateKey)}>
                                                <CopyIcon />
                                            </IconButton>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>
                                                View Key:
                                            </Typography>
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {key.viewKey}
                                            </Typography>
                                            <IconButton size="small" onClick={() => handleCopy(key.viewKey)}>
                                                <CopyIcon />
                                            </IconButton>
                                        </Box>
                                    </Stack>
                                </Collapse>
                            </Paper>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={newKeyModalOpen} onClose={() => setNewKeyModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New Key</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1, minWidth: '600px' }}>
                        <TextField
                            autoFocus
                            label="Account Name"
                            fullWidth
                            value={newKey.name}
                            onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                            error={!!nameError}
                            helperText={nameError}
                        />
                        <TextField
                            label="Private Key"
                            fullWidth
                            value={newKey.privateKey}
                            onChange={(e) => handlePrivateKeyChange(e.target.value)}
                            placeholder="Enter private key or generate one"
                            error={newKey.privateKey !== "" && !generatedKey}
                            helperText={newKey.privateKey !== "" && !generatedKey ? "Invalid private key" : ""}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Generate random key">
                                            <span>
                                                <IconButton
                                                    onClick={handleGenerateRandomKey}
                                                    disabled={aleoLoading || generatingKey}
                                                    edge="end"
                                                >
                                                    <CasinoIcon />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {generatedKey && (
                            <>
                                <Divider />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Generated Account Details
                                </Typography>
                                <TextField
                                    label="View Key"
                                    fullWidth
                                    value={generatedKey.viewKey}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => handleCopy(generatedKey.viewKey)}>
                                                    <CopyIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem'
                                        }
                                    }}
                                />
                                <TextField
                                    label="Address"
                                    fullWidth
                                    value={generatedKey.address}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => handleCopy(generatedKey.address)}>
                                                    <CopyIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem'
                                        }
                                    }}
                                />
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewKeyModalOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleAddKey} 
                        variant="contained"
                        disabled={!generatedKey || !newKey.name.trim()}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}; 