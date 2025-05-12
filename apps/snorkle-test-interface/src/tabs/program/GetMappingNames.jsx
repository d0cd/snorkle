import { useState } from "react";
import { Card, TextField, Box, Paper, Typography, Button, InputAdornment } from "@mui/material";
import { CopyButton } from "../../components/CopyButton";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { KeyDropdown } from "../../components/KeyDropdown";
import { useNetworkContext } from "../../contexts/NetworkContext";
import { useSnackbar } from "notistack";

export const GetMappingNames = () => {
    const [programName, setProgramName] = useState("");
    const [mappingNamesString, setMappingNamesString] = useState("");
    const [aleo] = useAleoWASM();
    const { selectedEndpoint } = useNetworkContext();
    const { setWasmLoadingMessage } = useWasmLoadingContext();
    const { enqueueSnackbar } = useSnackbar();

    const onProgramNameChange = (event) => {
        setProgramName(event.target.value);
    };

    const onGetMappingNames = async () => {
        if (programName === "") {
            enqueueSnackbar("Please enter a program name", { variant: "error" });
            return;
        }

        try {
            setWasmLoadingMessage("Getting mapping names...");
            const mappingNames = await aleo.getMappingNames(programName, selectedEndpoint);
            setMappingNamesString(JSON.stringify(mappingNames, null, 2));
            setWasmLoadingMessage("");
            enqueueSnackbar("Mapping names retrieved successfully!", { variant: "success" });
        } catch (error) {
            console.error(error);
            setWasmLoadingMessage("");
            enqueueSnackbar(`Error getting mapping names: ${error.message}`, { variant: "error" });
        }
    };

    if (aleo !== null) {
        return (
            <Card sx={{ width: "100%", p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Get Mapping Names
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
                        onClick={onGetMappingNames}
                        disabled={!programName}
                    >
                        Get Mapping Names
                    </Button>
                    {mappingNamesString && (
                        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Mapping Names"
                                variant="outlined"
                                value={mappingNamesString}
                                disabled
                                multiline
                                rows={4}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CopyButton data={mappingNamesString} />
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