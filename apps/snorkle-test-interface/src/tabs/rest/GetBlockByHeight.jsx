import {useMemo, useState} from "react";
import { Card, TextField, Box, Paper, Grid, Typography } from "@mui/material";
import axios from "axios";
import { CopyButton } from "../../components/CopyButton";
import { useNetwork } from "../../contexts/NetworkContext";

export const GetBlockByHeight = () => {
    const [blockByHeight, setBlockByHeight] = useState(null);
    const [status, setStatus] = useState("");
    const { endpointUrl, networkString } = useNetwork();

    // Calls `tryRequest` when the search bar input is entered
    const onSearch = (event) => {
        if (event.key === 'Enter') {
            try {
                tryRequest(event.target.value);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const tryRequest = (height) => {
        setBlockByHeight(null);
        axios
            .get(`${endpointUrl}/${networkString}/block/${height}`)
            .then((response) => {
                setBlockByHeight(
                    JSON.stringify(response.data, null, 2),
                );
                setStatus("success");
            })
            .catch((error) => {
                setBlockByHeight(error.message || "API/network error");
                setStatus("error");
            });
    };

    const blockString = useMemo(() => {
        return blockByHeight !== null ? blockByHeight.toString() : ""
    }, [blockByHeight]);

    return (
        <Card sx={{ width: "100%", p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Get Block By Height
            </Typography>
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    label="Block Height"
                    variant="outlined"
                    onKeyPress={onSearch}
                    error={status === "error"}
                    helperText={status === "error" ? "Invalid block height" : ""}
                />
            </Box>
            {blockByHeight !== null && (
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={11}>
                            <Box component="pre" sx={{ 
                                m: 0, 
                                p: 1, 
                                bgcolor: 'background.default',
                                borderRadius: 1,
                                overflow: 'auto',
                                maxHeight: '500px'
                            }}>
                                {blockString}
                            </Box>
                        </Grid>
                        <Grid item xs={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                                <CopyButton data={blockString} />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </Card>
    );
};
