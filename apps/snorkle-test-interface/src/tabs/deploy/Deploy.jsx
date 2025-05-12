import { useState } from "react";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { useNetwork } from "../../contexts/NetworkContext";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    CircularProgress
} from "@mui/material";
import { CodeEditor } from "../execute/CodeEditor";

export const Deploy = () => {
    const [aleoWASM] = useAleoWASM();
    const [programName, setProgramName] = useState("");
    const [programString, setProgramString] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [deploymentString, setDeploymentString] = useState("");
    const { endpointUrl, networkString } = useNetwork();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const onProgramNameChange = (event) => {
        setProgramName(event.target.value);
    };

    const onProgramStringChange = (value) => {
        setProgramString(value);
    };

    const onPrivateKeyChange = (event) => {
        setPrivateKey(event.target.value);
    };

    const onDeploy = async () => {
        if (!programName || !programString || !privateKey) {
            enqueueSnackbar("Please enter a program name, program string, and private key", { variant: "error" });
            return;
        }

        setLoading(true);
        const loadingKey = enqueueSnackbar("Deploying program...", { 
            persist: true,
            variant: "info"
        });
        try {
            const deployment = aleoWASM.deployProgram(programName, programString, privateKey);
            setDeploymentString(deployment);
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Program deployed successfully!", { variant: "success" });
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
                    <Typography variant="h5" gutterBottom>Deploy Program</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Program Name"
                            value={programName}
                            onChange={onProgramNameChange}
                            placeholder="Enter program name (e.g., hello.aleo)"
                        />
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
                            />
                        </Box>
                        <TextField
                            fullWidth
                            label="Private Key"
                            value={privateKey}
                            onChange={onPrivateKeyChange}
                            type="password"
                            placeholder="Enter your private key"
                        />
                        <Button
                            variant="contained"
                            onClick={onDeploy}
                            disabled={loading}
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
                                }}
                            />
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};
