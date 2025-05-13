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
    CircularProgress,
    InputAdornment,
    IconButton
} from "@mui/material";
import { ContentCopy as CopyIcon } from "@mui/icons-material";
import axios from "axios";

export const GetLatestBlockHeight = () => {
    const [loading, setLoading] = useState(false);
    const [blockHeight, setBlockHeight] = useState("");
    const { networkString } = useNetwork();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar("Copied to clipboard", { variant: "success" });
    };

    const onGetLatestBlockHeight = async () => {
        setLoading(true);
        const loadingKey = enqueueSnackbar("Getting latest block height...", { 
            persist: true,
            variant: "info"
        });
        try {
            const url = `/api/${networkString}/latest/height`;
            const response = await axios.get(url);
            setBlockHeight(JSON.stringify(response.data, null, 2));
            closeSnackbar(loadingKey);
            enqueueSnackbar("Latest block height retrieved successfully!", { variant: "success" });
        } catch (error) {
            closeSnackbar(loadingKey);
            enqueueSnackbar("Error getting latest block height: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Get Latest Block Height</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={onGetLatestBlockHeight}
                            disabled={loading}
                            size="large"
                        >
                            {loading ? <CircularProgress size={24} /> : "Get Latest Block Height"}
                        </Button>
                        {blockHeight && (
                            <TextField
                                fullWidth
                                label="Latest Block Height"
                                value={blockHeight}
                                multiline
                                rows={4}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => handleCopy(blockHeight)}>
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
