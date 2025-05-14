import { useState } from "react";
import { Card, TextField, Box, Paper, Typography, Button, InputAdornment, Autocomplete } from "@mui/material";
import { CopyButton } from "../../components/CopyButton";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { KeyDropdown } from "../../components/KeyDropdown";
import { useNetworkContext } from "../../contexts/NetworkContext";
import { useProgramContext } from "../../contexts/ProgramContext";
import { useWasmLoadingContext } from "../../contexts/WasmLoadingContext";
import { useSnackbar } from "notistack";

const DEFAULT_PROGRAMS = [
    "credits.aleo",
    "token_registry.aleo",
    "proto_snorkle_bet_000.aleo",
    "proto_snorkle_oracle_000.aleo"
];

export const LoadProgram = () => {
    const [programName, setProgramName] = useState("");
    const [programString, setProgramString] = useState("");
    const [aleo] = useAleoWASM();
    const { selectedEndpoint } = useNetworkContext();
    const { setProgramName: setGlobalProgramName } = useProgramContext();
    const { setWasmLoadingMessage } = useWasmLoadingContext();
    const { enqueueSnackbar } = useSnackbar();

    const onProgramNameChange = (event, newValue) => {
        setProgramName(newValue || "");
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
            <Card>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Load Program
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Autocomplete
                            freeSolo
                            options={DEFAULT_PROGRAMS}
                            value={programName}
                            onChange={onProgramNameChange}
                            onInputChange={(event, newValue) => setProgramName(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Program Name"
                                    placeholder="Enter program name or select from defaults"
                                    fullWidth
                                />
                            )}
                            sx={{ flex: 1 }}
                        />
                        <Button
                            variant="contained"
                            onClick={onLoadProgram}
                            disabled={!programName}
                        >
                            Load
                        </Button>
                    </Box>
                    {programString && (
                        <Paper
                            variant="outlined"
                            sx={{
                                mt: 2,
                                p: 2,
                                maxHeight: '400px',
                                overflow: 'auto',
                                fontFamily: 'monospace',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2">Program Source</Typography>
                                <CopyButton text={programString} />
                            </Box>
                            {programString}
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