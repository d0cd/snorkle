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

export const VerifyMessage = () => {
    const [aleoWASM] = useAleoWASM();
    const [message, setMessage] = useState("");
    const [signature, setSignature] = useState("");
    const [selectedKeyId, setSelectedKeyId] = useState("");
    const [loading, setLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const { keys } = useKeyVault();
    const { enqueueSnackbar } = useSnackbar();

    const selectedKey = keys.find(k => k.id === selectedKeyId);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar("Copied to clipboard", { variant: "success" });
    };

    const onVerify = async () => {
        if (!message || !signature || !selectedKey) {
            enqueueSnackbar("Please enter a message, signature, and select an account", { variant: "error" });
            return;
        }

        setLoading(true);
        const loadingKey = enqueueSnackbar("Verifying signature...", { 
            persist: true,
            variant: "info"
        });
        try {
            const isValid = aleoWASM.verifyMessage(message, signature, selectedKey.address);
            setVerificationResult(isValid);
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar(
                isValid ? "Signature verified successfully!" : "Invalid signature!",
                { variant: isValid ? "success" : "error" }
            );
        } catch (error) {
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Error verifying signature: " + error.message, { variant: "error" });
            setVerificationResult(false);
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
                            onClick={onVerify}
                            disabled={loading || !selectedKey}
                            size="large"
                        >
                            {loading ? <CircularProgress size={24} /> : "Verify Signature"}
                        </Button>
                        {verificationResult !== null && (
                            <Alert 
                                severity={verificationResult ? "success" : "error"}
                                sx={{ mt: 2 }}
                            >
                                {verificationResult 
                                    ? "The signature is valid and was created by the selected account."
                                    : "The signature is invalid or was not created by the selected account."
                                }
                            </Alert>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};
