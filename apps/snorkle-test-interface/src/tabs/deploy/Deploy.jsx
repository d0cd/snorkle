import { useState, useEffect } from "react";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { useNetwork } from "../../contexts/NetworkContext";
import { useKeyVault } from "../../contexts/KeyVaultContext";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useTransactionHistory } from "../../contexts/TransactionHistoryContext";
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
import { CodeEditor } from "../execute/CodeEditor";
import { ContentCopy as CopyIcon } from "@mui/icons-material";

export const Deploy = () => {
    const [aleoWASM] = useAleoWASM();
    const [programName, setProgramName] = useState("");
    const [programString, setProgramString] = useState("");
    const [selectedKeyId, setSelectedKeyId] = useState("");
    const [loading, setLoading] = useState(false);
    const [deploymentString, setDeploymentString] = useState("");
    const { endpointUrl, networkString } = useNetwork();
    const { keys } = useKeyVault();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { addTransaction } = useTransactionHistory();

    const selectedKey = keys.find(k => k.id === selectedKeyId);

    const onProgramStringChange = (value) => {
        setProgramString(value);
    };

    const onKeyChange = (event) => {
        setSelectedKeyId(event.target.value);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar("Copied to clipboard", { variant: "success" });
    };

    // Extract program name from source code
    useEffect(() => {
        if (programString) {
            try {
                // Look for program declaration in the format: program program_name.aleo
                const programMatch = programString.match(/program\s+([a-zA-Z0-9_]+)\.aleo/);
                if (programMatch && programMatch[1]) {
                    setProgramName(programMatch[1]);
                } else {
                    setProgramName("");
                }
            } catch (error) {
                console.error("Error extracting program name:", error);
                setProgramName("");
            }
        } else {
            setProgramName("");
        }
    }, [programString]);

    const onDeploy = async () => {
        if (!programName || !programString || !selectedKey) {
            enqueueSnackbar("Please enter a valid program and select an account", { variant: "error" });
            return;
        }

        setLoading(true);
        const loadingKey = enqueueSnackbar("Deploying program...", { 
            persist: true,
            variant: "info"
        });
        try {
            const deployment = aleoWASM.deployProgram(programName, programString, selectedKey.privateKey);
            setDeploymentString(deployment);
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Program deployed successfully!", { variant: "success" });

            // After successful deployment, add to history
            addTransaction({
                type: 'deploy',
                transactionId: deployment.transactionId,
                privateKey: selectedKey.privateKey,
                programName: programName,
                additionalData: {
                    programSource: programString,
                    // Add any other relevant data
                }
            });

            navigate("/execute");
        } catch (error) {
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Error deploying program: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h5">Deploy Program</Typography>
                        {programName && (
                            <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Program: {programName}
                                <IconButton size="small" onClick={() => handleCopy(programName)}>
                                    <CopyIcon fontSize="small" />
                                </IconButton>
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ 
                            maxHeight: 400, 
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
                                placeholder="Enter your Aleo program here... (e.g., program my_program.aleo)"
                            />
                        </Box>
                        <FormControl fullWidth>
                            <InputLabel>Select Account</InputLabel>
                            <Select
                                value={selectedKeyId}
                                onChange={onKeyChange}
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
                                    label="View Key"
                                    value={selectedKey.viewKey}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => handleCopy(selectedKey.viewKey)}>
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
                                    type="password"
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
                            onClick={onDeploy}
                            disabled={loading || !selectedKey || !programName}
                            size="large"
                        >
                            {loading ? <CircularProgress size={24} /> : "Deploy Program"}
                        </Button>
                        {deploymentString && (
                            <TextField
                                fullWidth
                                label="Deployment Transaction"
                                value={deploymentString}
                                multiline
                                rows={4}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => handleCopy(deploymentString)}>
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
