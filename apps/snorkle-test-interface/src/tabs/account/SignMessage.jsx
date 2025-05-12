import { useState } from "react";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { useKeyVault } from "../../contexts/KeyVaultContext";
import { useSnackbar } from "notistack";
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    IconButton
} from "@mui/material";
import { ContentCopy as CopyIcon } from "@mui/icons-material";

export const SignMessage = () => {
    const [aleoWASM] = useAleoWASM();
    const [message, setMessage] = useState("");
    const [selectedKeyId, setSelectedKeyId] = useState("");
    const [loading, setLoading] = useState(false);
    const [signature, setSignature] = useState("");
    const { keys } = useKeyVault();
    const { enqueueSnackbar } = useSnackbar();

    const selectedKey = keys.find(k => k.id === selectedKeyId);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar("Copied to clipboard", { variant: "success" });
    };

    const onSign = async () => {
        if (!message || !selectedKey) {
            enqueueSnackbar("Please enter a message and select an account", { variant: "error" });
            return;
        }

        setLoading(true);
        const loadingKey = enqueueSnackbar("Signing message...", { 
            persist: true,
            variant: "info"
        });
        try {
            const signedMessage = aleoWASM.signMessage(message, selectedKey.privateKey);
            setSignature(signedMessage);
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Message signed successfully!", { variant: "success" });
        } catch (error) {
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Error signing message: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Sign Message</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter message to sign"
                            multiline
                            rows={4}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Select Account</InputLabel>
                            <Select
                                value={selectedKeyId}
                                onChange={(e) => setSelectedKeyId(e.target.value)}
                                label="Select Account"
                            >
                                {keys.map((key) => (
                                    <MenuItem key={key.id} value={key.id}>
                                        {key.name} ({key.address.slice(0, 8)}...)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {selectedKey && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">Selected Account Details</Typography>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    value={selectedKey.address}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => handleCopy(selectedKey.address)}>
                                                    <CopyIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Private Key"
                                    value={selectedKey.privateKey}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => handleCopy(selectedKey.privateKey)}>
                                                    <CopyIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            onClick={onSign}
                            disabled={loading || !selectedKey}
                            size="large"
                        >
                            {loading ? <CircularProgress size={24} /> : "Sign Message"}
                        </Button>
                        {signature && (
                            <TextField
                                fullWidth
                                label="Signature"
                                value={signature}
                                multiline
                                rows={4}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => handleCopy(signature)}>
                                                <CopyIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};
