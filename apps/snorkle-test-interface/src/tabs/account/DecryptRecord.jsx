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

export const DecryptRecord = () => {
    const [aleoWASM] = useAleoWASM();
    const [record, setRecord] = useState("");
    const [viewKey, setViewKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [decryptedRecord, setDecryptedRecord] = useState("");
    const { enqueueSnackbar } = useSnackbar();

    const onDecrypt = () => {
        setLoading(true);
        const loadingKey = enqueueSnackbar("Decrypting record...", { 
            persist: true,
            variant: "info"
        });
        try {
            const decrypted = aleoWASM.decryptRecord(record, viewKey);
            setDecryptedRecord(decrypted);
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Record decrypted successfully!", { variant: "success" });
        } catch (e) {
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Error decrypting record: " + e.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Decrypt Record</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Record"
                        value={record}
                        onChange={(e) => setRecord(e.target.value)}
                        multiline
                        rows={4}
                    />
                    <TextField
                        fullWidth
                        label="View Key"
                        value={viewKey}
                        onChange={(e) => setViewKey(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        onClick={onDecrypt}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Decrypt"}
                    </Button>
                    {decryptedRecord && (
                        <TextField
                            fullWidth
                            label="Decrypted Record"
                            value={decryptedRecord}
                            multiline
                            rows={4}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}; 