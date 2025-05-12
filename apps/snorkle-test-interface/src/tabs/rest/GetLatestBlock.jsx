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

export const GetLatestBlock = () => {
    const [loading, setLoading] = useState(false);
    const [block, setBlock] = useState("");
    const { endpointUrl, networkString } = useNetwork();
    const { enqueueSnackbar } = useSnackbar();

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar("Copied to clipboard", { variant: "success" });
    };

    const onGetLatestBlock = async () => {
        setLoading(true);
        const loadingKey = enqueueSnackbar("Getting latest block...", { 
            persist: true,
            variant: "info"
        });
        try {
            const url = `${endpointUrl}/${networkString}/latest/block`;
            const response = await axios.get(url);
            setBlock(JSON.stringify(response.data, null, 2));
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Latest block retrieved successfully!", { variant: "success" });
        } catch (error) {
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Error getting latest block: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Get Latest Block</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={onGetLatestBlock}
                            disabled={loading}
                            size="large"
                        >
                            {loading ? <CircularProgress size={24} /> : "Get Latest Block"}
                        </Button>
                        {block && (
                            <TextField
                                fullWidth
                                label="Latest Block"
                                value={block}
                                multiline
                                rows={10}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => handleCopy(block)}>
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
