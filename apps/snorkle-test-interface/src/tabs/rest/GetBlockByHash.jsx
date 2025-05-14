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

export const GetBlockByHash = () => {
    const [loading, setLoading] = useState(false);
    const [blockHash, setBlockHash] = useState("");
    const [block, setBlock] = useState("");
    const { networkString } = useNetwork();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar("Copied to clipboard", { variant: "success" });
    };

    const onGetBlockByHash = async () => {
        if (!blockHash) {
            enqueueSnackbar("Please enter a block hash", { variant: "error" });
            return;
        }

        setLoading(true);
        const loadingKey = enqueueSnackbar("Getting block...", { 
            persist: true,
            variant: "info"
        });
        try {
            const url = `/api/${networkString}/block/hash/${blockHash}`;
            const response = await axios.get(url);
            setBlock(JSON.stringify(response.data, null, 2));
            closeSnackbar(loadingKey);
            enqueueSnackbar("Block retrieved successfully!", { variant: "success" });
        } catch (error) {
            closeSnackbar(loadingKey);
            enqueueSnackbar("Error getting block: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Get Block by Hash</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Block Hash"
                            value={blockHash}
                            onChange={(e) => setBlockHash(e.target.value)}
                            placeholder="Enter block hash"
                        />
                        <Button
                            variant="contained"
                            onClick={onGetBlockByHash}
                            disabled={loading}
                            size="large"
                        >
                            {loading ? <CircularProgress size={24} /> : "Get Block"}
                        </Button>
                        {block && (
                            <TextField
                                fullWidth
                                label="Block"
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
