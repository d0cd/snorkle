import { useState } from "react";
import { useSnackbar } from "notistack";
import { useNetwork } from "../../contexts/NetworkContext";
import { DEFAULT_PROGRAMS } from "../../constants/programs";
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    CircularProgress,
    InputAdornment,
    Stack,
    Autocomplete
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

export const LoadProgram = ({ onResponse }) => {
    const [programId, setProgramId] = useState("");
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
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
        const loadingKey = enqueueSnackbar("Loading program...", { 
            persist: true,
            variant: "info"
        });

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
            closeSnackbar(loadingKey);
            enqueueSnackbar("Program loaded successfully!", { variant: "success" });
        } catch (error) {
            console.error('Error loading program:', error);
            closeSnackbar(loadingKey);
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
                        <Autocomplete
                            freeSolo
                            options={DEFAULT_PROGRAMS}
                            value={programId}
                            onChange={(event, newValue) => setProgramId(newValue || "")}
                            onInputChange={(event, newValue) => setProgramId(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Program ID"
                                    placeholder="Enter program ID or select from defaults"
                                    fullWidth
                                />
                            )}
                            sx={{ flex: 1 }}
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