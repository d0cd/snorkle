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
    IconButton,
    Alert
} from "@mui/material";
import { ContentCopy as CopyIcon } from "@mui/icons-material";
import axios from "axios";

export const VerifyMessage = () => {
    const [aleoWASM] = useAleoWASM();
    const [message, setMessage] = useState("");
    const [signature, setSignature] = useState("");
    const [selectedKeyId, setSelectedKeyId] = useState("");
    const [loading, setLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState("");
    const { keys } = useKeyVault();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const selectedKey = keys.find(k => k.id === selectedKeyId);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar("Copied to clipboard", { variant: "success" });
    };

    const onVerifyMessage = async () => {
        if (!message || !signature) {
            enqueueSnackbar("Please enter both message and signature", { variant: "error" });
            return;
        }

        if (!selectedKey) {
            enqueueSnackbar("Please select a key to verify with", { variant: "error" });
            return;
        }

        setLoading(true);
        const loadingKey = enqueueSnackbar("Verifying message...", { 
            persist: true,
            variant: "info"
        });
        try {
            const url = `/api/verify`;
            const response = await axios.post(url, {
                message,
                signature,
                publicKey: selectedKey.address
            });
            setVerificationResult(response.data.verified ? "Signature is valid" : "Signature is invalid");
            closeSnackbar(loadingKey);
            enqueueSnackbar("Message verification completed!", { variant: "success" });
        } catch (error) {
            closeSnackbar(loadingKey);
            enqueueSnackbar("Error verifying message: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Verify Message</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter the original message"
                            multiline
                            rows={4}
                        />
                        <TextField
                            fullWidth
                            label="Signature"
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            placeholder="Enter the signature to verify"
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
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            onClick={onVerifyMessage}
                            disabled={loading || !selectedKey}
                            size="large"
                        >
                            {loading ? <CircularProgress size={24} /> : "Verify Signature"}
                        </Button>
                        {verificationResult && (
                            <Alert 
                                severity={verificationResult === "Signature is valid" ? "success" : "error"}
                                sx={{ mt: 2 }}
                            >
                                {verificationResult}
                            </Alert>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};
