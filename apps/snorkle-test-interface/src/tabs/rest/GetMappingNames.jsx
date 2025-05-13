import { useState } from "react";
import { useNetwork } from "../../contexts/NetworkContext";
import { useSnackbar } from "notistack";
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
    IconButton,
    Autocomplete
} from "@mui/material";
import { ContentCopy as CopyIcon } from "@mui/icons-material";
import axios from "axios";

export const GetMappingNames = () => {
    const [loading, setLoading] = useState(false);
    const [programId, setProgramId] = useState("");
    const [mappingNames, setMappingNames] = useState("");
    const { endpointUrl, networkString } = useNetwork();
    const { enqueueSnackbar } = useSnackbar();

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar("Copied to clipboard", { variant: "success" });
    };

    const onGetMappingNames = async () => {
        if (!programId) {
            enqueueSnackbar("Please enter a program ID", { variant: "error" });
            return;
        }

        setLoading(true);
        const loadingKey = enqueueSnackbar("Getting mapping names...", { 
            persist: true,
            variant: "info"
        });
        try {
            const url = `${endpointUrl}/${networkString}/program/${programId}/mappings`;
            const response = await axios.get(url);
            setMappingNames(JSON.stringify(response.data, null, 2));
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Mapping names retrieved successfully!", { variant: "success" });
        } catch (error) {
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Error getting mapping names: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Get Mapping Names</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                        />
                        <Button
                            variant="contained"
                            onClick={onGetMappingNames}
                            disabled={loading}
                            size="large"
                        >
                            {loading ? <CircularProgress size={24} /> : "Get Mapping Names"}
                        </Button>
                        {mappingNames && (
                            <TextField
                                fullWidth
                                label="Mapping Names"
                                value={mappingNames}
                                multiline
                                rows={10}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => handleCopy(mappingNames)}>
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
