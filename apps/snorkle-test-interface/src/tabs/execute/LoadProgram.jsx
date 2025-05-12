import { useState } from "react";
import { useAleoWASM } from "../../aleo-wasm-hook";
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
import { CodeEditor } from "./CodeEditor";

export const LoadProgram = () => {
    const [aleoWASM] = useAleoWASM();
    const [programName, setProgramName] = useState("");
    const [programString, setProgramString] = useState("");
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const onProgramNameChange = (event) => {
        setProgramName(event.target.value);
    };

    const onProgramStringChange = (value) => {
        setProgramString(value);
    };

    const onLoadProgram = () => {
        if (!programName || !programString) {
            enqueueSnackbar("Please enter a program name and program string", { variant: "error" });
            return;
        }

        setLoading(true);
        const loadingKey = enqueueSnackbar("Loading program...", { 
            persist: true,
            variant: "info"
        });
        try {
            aleoWASM.loadProgram(programName, programString);
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Program loaded successfully!", { variant: "success" });
        } catch (error) {
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Error loading program: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Load Program</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Program Name"
                        value={programName}
                        onChange={onProgramNameChange}
                    />
                    <Box sx={{ 
                        maxHeight: 240, 
                        overflow: "auto", 
                        mb: 2, 
                        borderRadius: 1, 
                        border: 1, 
                        borderColor: 'divider' 
                    }}>
                        <CodeEditor
                            value={programString}
                            onChange={onProgramStringChange}
                            language="leo"
                        />
                    </Box>
                    <Button
                        variant="contained"
                        onClick={onLoadProgram}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Load Program"}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};
