import {useMemo, useState} from "react";
import { Card, TextField, Box, Paper } from "@mui/material";
import axios from "axios";
import { CopyButton } from "../../components/CopyButton";

export const GetBlockByHash = () => {
    const [blockByHash, setBlockByHash] = useState(null);
    const [status, setStatus] = useState("");
    const [error, setError] = useState(false);

    // Calls `tryRequest` when the search bar input is entered.
    const onSearch = (event) => {
        if (event.key === 'Enter') {
            try {
                tryRequest(event.target.value);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const tryRequest = (hash) => {
        setBlockByHash(null);
        setError(false);
        try {
            if (hash) {
                axios
                    .get(`https://api.explorer.provable.com/v1/testnet/block/${hash}`)
                    .then((response) => {
                        setBlockByHash(JSON.stringify(response.data, null, 2));
                        setStatus("success");
                    })
                    .catch((error) => {
                        setStatus("error");
                        setError(true);
                        console.error(error);
                    });
            } else {
                // If the search bar is empty reset the status to "".
                setStatus("");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const blockString = useMemo(() => {
        return blockByHash !== null ? blockByHash.toString() : ""
    }, [blockByHash]);

    return (
        <Card sx={{ width: "100%", p: 2 }}>
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    label="Block Hash"
                    variant="outlined"
                    onKeyPress={onSearch}
                    error={error}
                    helperText={error ? "Invalid block hash" : ""}
                />
            </Box>
            {blockString && (
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                        <CopyButton data={blockString} />
                    </Box>
                    <Box component="pre" sx={{ 
                        m: 0, 
                        p: 1, 
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        overflow: 'auto'
                    }}>
                        {blockString}
                    </Box>
                </Paper>
            )}
        </Card>
    );
};
