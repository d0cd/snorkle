import {useMemo, useState} from "react";
import { Button, Card, Box, Paper } from "@mui/material";
import axios from "axios";
import { CopyButton } from "../../components/CopyButton";
import { useNetwork } from "../../contexts/NetworkContext";

export const GetLatestBlock = () => {
    const [latestBlock, setLatestBlock] = useState(null);
    const { endpointUrl, networkString } = useNetwork();

    const tryRequest = () => {
        setLatestBlock(null);
        axios
            .get(`${endpointUrl}/${networkString}/block/latest`)
            .then((response) =>
                setLatestBlock(JSON.stringify(response.data, null, 2)),
            )
            .catch((error) => {
                setLatestBlock(error.message || "API/network error");
            });
    };

    const latestBlockString = useMemo(() => {
        return latestBlock !== null ? latestBlock.toString() : ""
    }, [latestBlock]);

    return (
        <Card sx={{ width: "100%", p: 2 }}>
            <Box sx={{ mb: 2 }}>
                <Button 
                    variant="contained" 
                    onClick={tryRequest}
                    color="primary"
                >
                    Get Latest Block
                </Button>
            </Box>
            {latestBlockString && (
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                        <CopyButton data={latestBlockString} />
                    </Box>
                    <Box component="pre" sx={{ 
                        m: 0, 
                        p: 1, 
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        overflow: 'auto'
                    }}>
                        {latestBlockString}
                    </Box>
                </Paper>
            )}
        </Card>
    );
};
