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

export const GetMappingValue = () => {
    const [loading, setLoading] = useState(false);
    const [programId, setProgramId] = useState("");
    const [mappingName, setMappingName] = useState("");
    const [key, setKey] = useState("");
    const [value, setValue] = useState("");
    const { networkString } = useNetwork();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar("Copied to clipboard", { variant: "success" });
    };

    const onGetMappingValue = async () => {
        if (!programId || !mappingName || !key) {
            enqueueSnackbar("Please enter program ID, mapping name, and key", { variant: "error" });
            return;
        }

        setLoading(true);
        const loadingKey = enqueueSnackbar("Getting mapping value...", { 
            persist: true,
            variant: "info"
        });
        try {
            const url = `/api/${networkString}/program/${programId}/mapping/${mappingName}/${key}`;
            const response = await axios.get(url);
            setValue(JSON.stringify(response.data, null, 2));
            closeSnackbar(loadingKey);
            enqueueSnackbar("Mapping value retrieved successfully!", { variant: "success" });
        } catch (error) {
            closeSnackbar(loadingKey);
            enqueueSnackbar("Error getting mapping value: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Get Mapping Value</Typography>
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
                        <TextField
                            fullWidth
                            label="Mapping Name"
                            value={mappingName}
                            onChange={(e) => setMappingName(e.target.value)}
                            placeholder="Enter mapping name"
                        />
                        <TextField
                            fullWidth
                            label="Key"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="Enter mapping key"
                        />
                        <Button
                            variant="contained"
                            onClick={onGetMappingValue}
                            disabled={loading}
                            size="large"
                        >
                            {loading ? <CircularProgress size={24} /> : "Get Mapping Value"}
                        </Button>
                        {value && (
                            <TextField
                                fullWidth
                                label="Mapping Value"
                                value={value}
                                multiline
                                rows={10}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => handleCopy(value)}>
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
