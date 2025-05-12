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

export const GetLatestBlockHeight = () => {
    const [loading, setLoading] = useState(false);
    const [blockHeight, setBlockHeight] = useState("");
    const { endpointUrl, networkString } = useNetwork();
    const { enqueueSnackbar } = useSnackbar();

    const onGetLatestBlockHeight = async () => {
        setLoading(true);
        const loadingKey = enqueueSnackbar("Getting latest block height...", { 
            persist: true,
            variant: "info"
        });
        try {
            const url = `${endpointUrl}/${networkString}/latest/height`;
            const response = await axios.get(url);
            setBlockHeight(response.data);
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Latest block height retrieved successfully!", { variant: "success" });
        } catch (error) {
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Error getting latest block height: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Get Latest Block Height</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={onGetLatestBlockHeight}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Get Latest Block Height"}
                    </Button>
                    {blockHeight && (
                        <TextField
                            fullWidth
                            label="Latest Block Height"
                            value={blockHeight}
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
