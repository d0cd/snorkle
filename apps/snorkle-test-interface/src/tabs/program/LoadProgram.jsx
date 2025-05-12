import { useState } from "react";
import { Card, TextField, Box, Paper, Typography, Button, InputAdornment } from "@mui/material";
import { CopyButton } from "../../components/CopyButton";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { KeyDropdown } from "../../components/KeyDropdown";
import { useNetworkContext } from "../../contexts/NetworkContext";
import { useProgramContext } from "../../contexts/ProgramContext";
import { useWasmLoadingContext } from "../../contexts/WasmLoadingContext";
import { useSnackbar } from "notistack";

export const LoadProgram = () => {
    const [programName, setProgramName] = useState("");
    const [programString, setProgramString] = useState("");
    const [aleo] = useAleoWASM();
    const { selectedEndpoint } = useNetworkContext();
    const { setProgramName: setGlobalProgramName } = useProgramContext();
    const { setWasmLoadingMessage } = useWasmLoadingContext();
    const { enqueueSnackbar } = useSnackbar();

    const onProgramNameChange = (event) => {
        setProgramName(event.target.value);
    };

    const onLoadProgram = async () => {
        if (programName === "") {
            enqueueSnackbar("Please enter a program name", { variant: "error" });
            return;
        }

        try {
            setWasmLoadingMessage("Loading program...");
            const program = await aleo.getProgram(programName, selectedEndpoint);
            setProgramString(program.toString());
            setGlobalProgramName(programName);
            setWasmLoadingMessage("");
            enqueueSnackbar("Program loaded successfully!", { variant: "success" });
        } catch (error) {
            console.error(error);
            setWasmLoadingMessage("");
            enqueueSnackbar(`Error loading program: ${error.message}`, { variant: "error" });
        }
    };

    if (aleo !== null) {
        return (
            <Card sx={{ width: "100%", p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Load Program
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Program Name"
                        variant="outlined"
                        value={programName}
                        onChange={onProgramNameChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <KeyDropdown type="programName" onSelect={onProgramNameChange} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onLoadProgram}
                        disabled={!programName}
                    >
                        Load Program
                    </Button>
                    {programString && (
                        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Program"
                                variant="outlined"
                                value={programString}
                                disabled
                                multiline
                                rows={4}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CopyButton data={programString} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Paper>
                    )}
                </Box>
            </Card>
        );
    } else {
        return (
            <Typography variant="h6" align="center">
                Loading...
            </Typography>
        );
    }
}; 