import { useState } from "react";
import { useSnackbar } from "notistack";
import { useNetwork } from "../../contexts/NetworkContext";
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    CircularProgress,
    InputAdornment,
    Stack
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

export const LoadProgram = ({ onResponse }) => {
    const [programId, setProgramId] = useState("");
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const { endpointUrl, networkString } = useNetwork();

    const onProgramSearch = async () => {
        if (!programId || programId.trim() === "") {
            enqueueSnackbar("Please enter a program ID", { variant: "error" });
            return;
        }

        let searchId = programId;
        if (!searchId.endsWith(".aleo") && !searchId.includes(".")) {
            searchId += ".aleo";
            setProgramId(searchId);
        }

        setLoading(true);
        const url = `${endpointUrl}/${networkString}/program/${searchId}`;
        console.log('Fetching program from URL:', url);

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.text();
            console.log('Response data:', data);
            onResponse(data);
            enqueueSnackbar("Program loaded successfully!", { variant: "success" });
        } catch (error) {
            console.error('Error loading program:', error);
            enqueueSnackbar(error.message, { variant: "error" });
            onResponse("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Load Program</Typography>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            label="Program ID"
                            value={programId}
                            onChange={(e) => setProgramId(e.target.value)}
                            placeholder="Enter program ID"
                            disabled={loading}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    onProgramSearch();
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={onProgramSearch}
                            disabled={loading}
                            sx={{ minWidth: '120px' }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                <>
                                    <SearchIcon sx={{ mr: 1 }} />
                                    Search
                                </>
                            )}
                        </Button>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};