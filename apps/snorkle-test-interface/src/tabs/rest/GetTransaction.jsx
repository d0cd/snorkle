import { useState } from "react";
import { useNetwork } from "../../contexts/NetworkContext";
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
import axios from "axios";

export const GetTransaction = () => {
    const [loading, setLoading] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [transaction, setTransaction] = useState("");
    const { endpointUrl, networkString } = useNetwork();
    const { enqueueSnackbar } = useSnackbar();

    const onGetTransaction = async () => {
        if (!transactionId) {
            enqueueSnackbar("Please enter a transaction ID", { variant: "error" });
            return;
        }

        setLoading(true);
        const loadingKey = enqueueSnackbar("Getting transaction...", { 
            persist: true,
            variant: "info"
        });
        try {
            const url = `${endpointUrl}/${networkString}/transaction/${transactionId}`;
            const response = await axios.get(url);
            setTransaction(JSON.stringify(response.data, null, 2));
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Transaction retrieved successfully!", { variant: "success" });
        } catch (error) {
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Error getting transaction: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Get Transaction</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Transaction ID"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        onClick={onGetTransaction}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Get Transaction"}
                    </Button>
                    {transaction && (
                        <TextField
                            fullWidth
                            label="Transaction"
                            value={transaction}
                            multiline
                            rows={10}
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
