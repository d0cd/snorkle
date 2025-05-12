import { useState } from "react";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { useSnackbar } from "notistack";
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    CircularProgress
} from "@mui/material";

export const VerifyMessage = () => {
    const [aleoWASM] = useAleoWASM();
    const [message, setMessage] = useState("");
    const [signature, setSignature] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    const onVerify = () => {
        setLoading(true);
        const loadingKey = enqueueSnackbar("Verifying message...", { 
            persist: true,
            variant: "info"
        });
        try {
            const result = aleoWASM.verifyMessage(message, signature, address);
            setVerificationResult(result);
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Message verified successfully!", { variant: "success" });
        } catch (e) {
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Error verifying message: " + e.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Verify Message</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        multiline
                        rows={4}
                    />
                    <TextField
                        fullWidth
                        label="Signature"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        onClick={onVerify}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Verify"}
                    </Button>
                    {verificationResult !== null && (
                        <Typography variant="body1" color={verificationResult ? "success.main" : "error.main"}>
                            {verificationResult ? "Message verified successfully!" : "Message verification failed!"}
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};
