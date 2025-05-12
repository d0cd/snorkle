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

export const GetProgram = () => {
    const [loading, setLoading] = useState(false);
    const [programId, setProgramId] = useState("");
    const [program, setProgram] = useState("");
    const { endpointUrl, networkString } = useNetwork();
    const { enqueueSnackbar } = useSnackbar();

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar("Copied to clipboard", { variant: "success" });
    };

    const onGetProgram = async () => {
        if (!programId) {
            enqueueSnackbar("Please enter a program ID", { variant: "error" });
            return;
        }

        setLoading(true);
        const loadingKey = enqueueSnackbar("Getting program...", { 
            persist: true,
            variant: "info"
        });
        try {
            const url = `${endpointUrl}/${networkString}/program/${programId}`;
            const response = await axios.get(url);
            setProgram(JSON.stringify(response.data, null, 2));
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Program retrieved successfully!", { variant: "success" });
        } catch (error) {
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Error getting program: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Get Program</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Program ID"
                            value={programId}
                            onChange={(e) => setProgramId(e.target.value)}
                            placeholder="Enter program ID"
                        />
                        <Button
                            variant="contained"
                            onClick={onGetProgram}
                            disabled={loading}
                            size="large"
                        >
                            {loading ? <CircularProgress size={24} /> : "Get Program"}
                        </Button>
                        {program && (
                            <TextField
                                fullWidth
                                label="Program"
                                value={program}
                                multiline
                                rows={10}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => handleCopy(program)}>
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
