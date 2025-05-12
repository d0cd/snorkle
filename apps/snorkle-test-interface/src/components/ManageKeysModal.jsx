import { useKeyVault } from "../contexts/KeyVaultContext";
import { useState } from "react";
import { useAleoWASM } from "../aleo-wasm-hook";
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
    Snackbar,
    Alert
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
    Save as SaveIcon
} from "@mui/icons-material";

export function ManageKeysModal({ open, onClose }) {
    const { keys, editKey, deleteKey, clearAll, addKey } = useKeyVault();
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [aleo, aleoLoading] = useAleoWASM();
    const [newKeyModalOpen, setNewKeyModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [generatedKey, setGeneratedKey] = useState(null);
    const [generatingKey, setGeneratingKey] = useState(false);
    const [revealedFields, setRevealedFields] = useState({});
    const [nameError, setNameError] = useState("");
    const [expandedAccounts, setExpandedAccounts] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

    const handleEdit = (id, name) => {
        setEditingId(id);
        setEditName(name);
    };

    const handleEditSave = (id) => {
        editKey(id, { name: editName });
        setEditingId(null);
        setEditName("");
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setSnackbar({ open: true, message: "Copied to clipboard", severity: "success" });
    };

    const handleGenerateRandomKey = async () => {
        if (aleoLoading) {
            setSnackbar({ open: true, message: "Aleo SDK is still loading. Please wait a moment.", severity: "error" });
            return;
        }
        if (!aleo) {
            setSnackbar({ open: true, message: "Aleo SDK failed to load. Please refresh the page.", severity: "error" });
            return;
        }

        setGeneratingKey(true);
        try {
            const privateKey = new aleo.PrivateKey();
            const key = {
                privateKey: privateKey.to_string(),
                viewKey: privateKey.to_view_key().to_string(),
                address: privateKey.to_address().to_string(),
            };
            setGeneratedKey(key);
            setNewKeyName(`Account ${key.address.slice(0, 6)}`);
            setNewKeyModalOpen(true);
        } catch (error) {
            console.error("Error generating key:", error);
            setSnackbar({ open: true, message: "Failed to generate key. Please try again.", severity: "error" });
        } finally {
            setGeneratingKey(false);
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
        setNameError("");
        if (generatedKey) {
            addKey({
                name: newKeyName,
                ...generatedKey
            });
            setNewKeyModalOpen(false);
            setGeneratedKey(null);
            setNewKeyName("");
            setSnackbar({ open: true, message: "Key saved successfully!", severity: "success" });
        }
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
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const imported = JSON.parse(evt.target.result);
                if (Array.isArray(imported)) {
                    imported.forEach(k => editKey(k.id, k));
                }
            } catch (e) {
                setSnackbar({ open: true, message: "Invalid JSON file", severity: "error" });
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
                            onClick={handleGenerateRandomKey}
                            disabled={aleoLoading || generatingKey}
                        >
                            Generate Random Key
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

            <Dialog open={newKeyModalOpen} onClose={() => setNewKeyModalOpen(false)}>
                <DialogTitle>Save New Key</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Account Name"
                        fullWidth
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        error={!!nameError}
                        helperText={nameError}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewKeyModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveNewKey} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
} 