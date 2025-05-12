import { useState } from "react";
import { Card, TextField, Box, Paper, Typography, Button, InputAdornment } from "@mui/material";
import { CopyButton } from "../../components/CopyButton";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { KeyDropdown } from "../../components/KeyDropdown";
import { useNetworkContext } from "../../contexts/NetworkContext";
import { useWasmLoadingContext } from "../../contexts/WasmLoadingContext";
import { useSnackbar } from "notistack";

export const GetMappingValue = () => {
    const [programName, setProgramName] = useState("");
    const [mappingName, setMappingName] = useState("");
    const [key, setKey] = useState("");
    const [mappingValueString, setMappingValueString] = useState("");
    const [aleo] = useAleoWASM();
    const { selectedEndpoint } = useNetworkContext();
    const { setWasmLoadingMessage } = useWasmLoadingContext();
    const { enqueueSnackbar } = useSnackbar();

    const onProgramNameChange = (event) => {
        setProgramName(event.target.value);
    };

    const onMappingNameChange = (event) => {
        setMappingName(event.target.value);
    };

    const onKeyChange = (event) => {
        setKey(event.target.value);
    };

    const onGetMappingValue = async () => {
        if (programName === "" || mappingName === "" || key === "") {
            enqueueSnackbar("Please enter a program name, mapping name, and key", { variant: "error" });
            return;
        }

        try {
            setWasmLoadingMessage("Getting mapping value...");
            const mappingValue = await aleo.getMappingValue(programName, mappingName, key, selectedEndpoint);
            setMappingValueString(JSON.stringify(mappingValue, null, 2));
            setWasmLoadingMessage("");
            enqueueSnackbar("Mapping value retrieved successfully!", { variant: "success" });
        } catch (error) {
            console.error(error);
            setWasmLoadingMessage("");
            enqueueSnackbar(`Error getting mapping value: ${error.message}`, { variant: "error" });
        }
    };

    if (aleo !== null) {
        return (
            <Card sx={{ width: "100%", p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Get Mapping Value
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
                    <TextField
                        fullWidth
                        label="Mapping Name"
                        variant="outlined"
                        value={mappingName}
                        onChange={onMappingNameChange}
                    />
                    <TextField
                        fullWidth
                        label="Key"
                        variant="outlined"
                        value={key}
                        onChange={onKeyChange}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onGetMappingValue}
                        disabled={!programName || !mappingName || !key}
                    >
                        Get Mapping Value
                    </Button>
                    {mappingValueString && (
                        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Mapping Value"
                                variant="outlined"
                                value={mappingValueString}
                                disabled
                                multiline
                                rows={4}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CopyButton data={mappingValueString} />
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