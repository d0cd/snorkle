import { useState } from "react";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { useKeyVault } from "../../contexts/KeyVaultContext";
import { useSnackbar } from "notistack";
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    IconButton
} from "@mui/material";
import { ContentCopy as CopyIcon } from "@mui/icons-material";
import { CodeEditor } from "./CodeEditor";

export const Execute = () => {
    const [aleoWASM] = useAleoWASM();
    const [program, setProgram] = useState("");
    const [functionName, setFunctionName] = useState("");
    const [inputs, setInputs] = useState("");
    const [selectedKeyId, setSelectedKeyId] = useState("");
    const [loading, setLoading] = useState(false);
    const [executionResult, setExecutionResult] = useState("");
    const { keys } = useKeyVault();
    const { enqueueSnackbar } = useSnackbar();

    const selectedKey = keys.find(k => k.id === selectedKeyId);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar("Copied to clipboard", { variant: "success" });
    };

    const onExecute = async () => {
        if (!program || !functionName || !selectedKey) {
            enqueueSnackbar("Please fill in all required fields and select an account", { variant: "error" });
            return;
        }

        setLoading(true);
        const loadingKey = enqueueSnackbar("Executing program...", { 
            persist: true,
            variant: "info"
        });
        try {
            const result = await aleoWASM.executeProgram(
                program,
                functionName,
                inputs.split(",").map(input => input.trim()),
                selectedKey.privateKey
            );
            setExecutionResult(result);
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Program executed successfully!", { variant: "success" });
        } catch (error) {
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Error executing program: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Execute Program</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <CodeEditor
                            value={program}
                            onChange={setProgram}
                            height={400}
                            placeholder="Enter your Aleo program here..."
                        />
                        <TextField
                            fullWidth
                            label="Function Name"
                            value={functionName}
                            onChange={(e) => setFunctionName(e.target.value)}
                            placeholder="Enter the function name to execute"
                        />
                        <TextField
                            fullWidth
                            label="Inputs (comma-separated)"
                            value={inputs}
                            onChange={(e) => setInputs(e.target.value)}
                            placeholder="Enter inputs separated by commas"
                        />
                        <FormControl fullWidth>
                            <InputLabel>Select Account</InputLabel>
                            <Select
                                value={selectedKeyId}
                                onChange={(e) => setSelectedKeyId(e.target.value)}
                                label="Select Account"
                            >
                                {keys.map((key) => (
                                    <MenuItem key={key.id} value={key.id}>
                                        {key.name} ({key.address.slice(0, 8)}...)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {selectedKey && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">Selected Account Details</Typography>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    value={selectedKey.address}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => handleCopy(selectedKey.address)}>
                                                    <CopyIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Private Key"
                                    value={selectedKey.privateKey}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => handleCopy(selectedKey.privateKey)}>
                                                    <CopyIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            onClick={onExecute}
                            disabled={loading || !selectedKey}
                            size="large"
                        >
                            {loading ? <CircularProgress size={24} /> : "Execute Program"}
                        </Button>
                        {executionResult && (
                            <TextField
                                fullWidth
                                label="Execution Result"
                                value={executionResult}
                                multiline
                                rows={4}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => handleCopy(executionResult)}>
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
