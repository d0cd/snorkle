import { useState } from "react";
import { useAleoWASM } from "../../../aleo-wasm-hook";
import { useKeyVault } from "../../../contexts/KeyVaultContext";
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
import { CodeEditor } from "../execute/CodeEditor";

export const Deploy = () => {
    const [aleoWASM] = useAleoWASM();
    const [programName, setProgramName] = useState("");
    const [programString, setProgramString] = useState("");
    const [selectedKeyId, setSelectedKeyId] = useState("");
    const [loading, setLoading] = useState(false);
    const [deploymentString, setDeploymentString] = useState("");
    const { keys } = useKeyVault();
    const { enqueueSnackbar } = useSnackbar();

    const selectedKey = keys.find(k => k.id === selectedKeyId);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar("Copied to clipboard", { variant: "success" });
    };

    const onDeploy = async () => {
        if (!programName || !programString || !selectedKey) {
            enqueueSnackbar("Please fill in all required fields and select an account", { variant: "error" });
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
        } catch (error) {
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Error deploying program: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Deploy Program</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Program Name"
                            value={programName}
                            onChange={(e) => setProgramName(e.target.value)}
                            placeholder="Enter program name"
                        />
                        <CodeEditor
                            value={programString}
                            onChange={setProgramString}
                            height={400}
                            placeholder="Enter your Aleo program here..."
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
                            onClick={onDeploy}
                            disabled={loading || !selectedKey}
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