import { useKeyVault } from "../contexts/KeyVaultContext";
import { useState } from "react";
import { useAleoWASM } from "../aleo-wasm-hook";
import { useSnackbar } from "notistack";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Button,
    TextField,
    Box,
    Stack,
    Typography,
    Paper,
    Tooltip,
    DialogActions,
    Divider,
    InputAdornment
} from "@mui/material";
import {
    Add as AddIcon,
    Download as DownloadIcon,
    Upload as UploadIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ContentCopy as CopyIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Save as SaveIcon,
    Casino as CasinoIcon
} from "@mui/icons-material";

export function ManageKeysModal({ open, onClose }) {
    const { keys, editKey, deleteKey, clearAll, addKey } = useKeyVault();
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [aleo, aleoLoading] = useAleoWASM();
    const [newKeyModalOpen, setNewKeyModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [newPrivateKey, setNewPrivateKey] = useState("");
    const [generatedKey, setGeneratedKey] = useState(null);
    const [generatingKey, setGeneratingKey] = useState(false);
    const [revealedFields, setRevealedFields] = useState({});
    const [nameError, setNameError] = useState("");
    const [expandedAccounts, setExpandedAccounts] = useState({});
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const handleEdit = (id, name) => {
        setEditingId(id);
        setEditName(name);
    };

    const handleEditSave = (id) => {
        editKey(id, { name: editName });
        setEditingId(null);
        setEditName("");
        enqueueSnackbar("Key name updated successfully!", { variant: "success" });
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar("Copied to clipboard", { variant: "success" });
    };

    const handleGenerateRandomKey = async () => {
        if (aleoLoading) {
            enqueueSnackbar("Aleo SDK is still loading. Please wait a moment.", { variant: "error" });
            return;
        }
        if (!aleo) {
            enqueueSnackbar("Aleo SDK failed to load. Please refresh the page.", { variant: "error" });
            return;
        }

        setGeneratingKey(true);
        const loadingKey = enqueueSnackbar("Generating new key...", { 
            persist: true,
            variant: "info"
        });

        try {
            const privateKey = new aleo.PrivateKey();
            const key = {
                privateKey: privateKey.to_string(),
                viewKey: privateKey.to_view_key().to_string(),
                address: privateKey.to_address().to_string(),
            };
            setNewPrivateKey(key.privateKey);
            setGeneratedKey(key);
            if (!newKeyName.trim()) {
                setNewKeyName(`Account ${key.address.slice(0, 6)}`);
            }
            closeSnackbar(loadingKey);
            enqueueSnackbar("Key generated successfully!", { variant: "success" });
        } catch (error) {
            console.error("Error generating key:", error);
            closeSnackbar(loadingKey);
            enqueueSnackbar("Failed to generate key. Please try again.", { variant: "error" });
        } finally {
            setGeneratingKey(false);
        }
    };

    const handlePrivateKeyChange = async (value) => {
        setNewPrivateKey(value);
        if (value && !aleoLoading && aleo) {
            try {
                const privateKey = new aleo.PrivateKey(value);
                const key = {
                    privateKey: privateKey.to_string(),
                    viewKey: privateKey.to_view_key().to_string(),
                    address: privateKey.to_address().to_string(),
                };
                setGeneratedKey(key);
                setNewKeyName(`Account ${key.address.slice(0, 6)}`);
            } catch (error) {
                setGeneratedKey(null);
            }
        } else {
            setGeneratedKey(null);
        }
    };

    const toggleFieldReveal = (id, field) => {
        setRevealedFields(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: !prev[id]?.[field]
            }
        }));
    };

    const isDuplicateName = (name) => {
        return keys.some(k => k.name.trim().toLowerCase() === name.trim().toLowerCase());
    };

    const handleSaveNewKey = () => {
        if (!newKeyName.trim()) return;
        if (isDuplicateName(newKeyName)) {
            setNameError("Account name already exists.");
            return;
        }
        if (!generatedKey) {
            enqueueSnackbar("Please enter a valid private key or generate one", { variant: "error" });
            return;
        }
        setNameError("");
        addKey({
            name: newKeyName,
            ...generatedKey
        });
        setNewKeyModalOpen(false);
        setGeneratedKey(null);
        setNewKeyName("");
        setNewPrivateKey("");
        enqueueSnackbar("Key saved successfully!", { variant: "success" });
    };

    const handleExport = () => {
        const data = JSON.stringify(keys, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "snorkle-keys.json";
        a.click();
        URL.revokeObjectURL(url);
        enqueueSnackbar("Keys exported successfully!", { variant: "success" });
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const imported = JSON.parse(evt.target.result);
                if (Array.isArray(imported)) {
                    imported.forEach(k => {
                        addKey({
                            name: k.name,
                            privateKey: k.privateKey,
                            viewKey: k.viewKey,
                            address: k.address
                        });
                    });
                    enqueueSnackbar("Keys imported successfully!", { variant: "success" });
                } else {
                    enqueueSnackbar("Invalid key format", { variant: "error" });
                }
            } catch (e) {
                enqueueSnackbar("Invalid JSON file", { variant: "error" });
            }
        };
        reader.readAsText(file);
    };

    const toggleExpand = (id) => {
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
                                if (window.confirm("Are you sure you want to delete all keys?")) {
                                    clearAll();
                                }
                            }}
                        >
                            Clear All
                        </Button>
                    </Stack>
                    <List>
                        {keys.map((item) => (
                            <Paper key={item.id} sx={{ mb: 2, p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    {editingId === item.id ? (
                                        <TextField
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && handleEditSave(item.id)}
                                            autoFocus
                                            size="small"
                                        />
                                    ) : (
                                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                            {item.name}
                                        </Typography>
                                    )}
                                    <Stack direction="row" spacing={1}>
                                        <IconButton
                                            size="small"
                                            onClick={() => toggleExpand(item.id)}
                                        >
                                            {expandedAccounts[item.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                        {editingId === item.id ? (
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleEditSave(item.id)}
                                            >
                                                <SaveIcon />
                                            </IconButton>
                                        ) : (
                                            <Tooltip title="Edit Name">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEdit(item.id, item.name)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to delete this key?")) {
                                                    deleteKey(item.id);
                                                }
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Stack>
                                </Box>
                                {expandedAccounts[item.id] && (
                                    <Box sx={{ mt: 2 }}>
                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" sx={{ minWidth: 100 }}>Private Key:</Typography>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        flex: 1,
                                                        p: 1,
                                                        fontFamily: 'monospace',
                                                        wordBreak: 'break-all',
                                                        bgcolor: 'background.default'
                                                    }}
                                                >
                                                    {item.privateKey}
                                                </Paper>
                                                <IconButton size="small" onClick={() => handleCopy(item.privateKey)}>
                                                    <CopyIcon />
                                                </IconButton>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" sx={{ minWidth: 100 }}>View Key:</Typography>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        flex: 1,
                                                        p: 1,
                                                        fontFamily: 'monospace',
                                                        wordBreak: 'break-all',
                                                        bgcolor: 'background.default'
                                                    }}
                                                >
                                                    {item.viewKey}
                                                </Paper>
                                                <IconButton size="small" onClick={() => handleCopy(item.viewKey)}>
                                                    <CopyIcon />
                                                </IconButton>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" sx={{ minWidth: 100 }}>Address:</Typography>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        flex: 1,
                                                        p: 1,
                                                        fontFamily: 'monospace',
                                                        wordBreak: 'break-all',
                                                        bgcolor: 'background.default'
                                                    }}
                                                >
                                                    {item.address}
                                                </Paper>
                                                <IconButton size="small" onClick={() => handleCopy(item.address)}>
                                                    <CopyIcon />
                                                </IconButton>
                                            </Box>
                                        </Stack>
                                    </Box>
                                )}
                            </Paper>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>

            <Dialog open={newKeyModalOpen} onClose={() => setNewKeyModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New Key</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1, minWidth: '600px' }}>
                        <TextField
                            autoFocus
                            label="Account Name"
                            fullWidth
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            error={!!nameError}
                            helperText={nameError}
                        />
                        <TextField
                            label="Private Key"
                            fullWidth
                            value={newPrivateKey}
                            onChange={(e) => handlePrivateKeyChange(e.target.value)}
                            placeholder="Enter private key or generate one"
                            error={newPrivateKey !== "" && !generatedKey}
                            helperText={newPrivateKey !== "" && !generatedKey ? "Invalid private key" : ""}
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
                        onClick={handleSaveNewKey} 
                        variant="contained"
                        disabled={!generatedKey || !newKeyName.trim()}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
} 