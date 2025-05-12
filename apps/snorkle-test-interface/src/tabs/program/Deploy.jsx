import { useState } from "react";
import { Card, TextField, Box, Paper, Typography, Button, InputAdornment } from "@mui/material";
import { CopyButton } from "../../components/CopyButton";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { KeyDropdown } from "../../components/KeyDropdown";
import { useNetworkContext } from "../../contexts/NetworkContext";
import { useProgramContext } from "../../contexts/ProgramContext";
import { useRecordContext } from "../../contexts/RecordContext";
import { useTransactionContext } from "../../contexts/TransactionContext";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

export const Deploy = () => {
    const [programName, setProgramName] = useState("");
    const [programString, setProgramString] = useState("");
    const [deploymentString, setDeploymentString] = useState("");
    const [privateKeyString, setPrivateKeyString] = useState("");
    const [aleo] = useAleoWASM();
    const { networkName, selectedEndpoint } = useNetworkContext();
    const { setProgramName: setGlobalProgramName } = useProgramContext();
    const { setRecordName: setGlobalRecordName } = useRecordContext();
    const { setTransactionID: setGlobalTransactionID } = useTransactionContext();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const onProgramNameChange = (event) => {
        setProgramName(event.target.value);
    };

    const onProgramStringChange = (event) => {
        setProgramString(event.target.value);
    };

    const onPrivateKeyChange = (event) => {
        setPrivateKeyString(event.target.value);
    };

    const onDeploy = async () => {
        if (programName === "" || programString === "" || privateKeyString === "") {
            enqueueSnackbar("Please enter a program name, program string, and private key", { variant: "error" });
            return;
        }

        const loadingKey = enqueueSnackbar("Deploying program...", { 
            variant: "info",
            persist: true 
        });

        try {
            const privateKey = aleo.PrivateKey.from_string(privateKeyString);
            const program = aleo.Program.fromString(programString);
            const deployment = program.deploy(privateKey, selectedEndpoint);
            setDeploymentString(deployment.to_string());
            setGlobalProgramName(programName);
            setGlobalRecordName("");
            setGlobalTransactionID(deployment.to_string());
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Program deployed successfully!", { variant: "success" });
            navigate("/transactions");
        } catch (error) {
            console.error(error);
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar(`Error deploying program: ${error.message}`, { variant: "error" });
        }
    };

    if (aleo !== null) {
        return (
            <Card sx={{ width: "100%", p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Deploy a Program
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
                        label="Program String"
                        variant="outlined"
                        value={programString}
                        onChange={onProgramStringChange}
                        multiline
                        rows={4}
                    />
                    <TextField
                        fullWidth
                        label="Private Key"
                        variant="outlined"
                        value={privateKeyString}
                        onChange={onPrivateKeyChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <KeyDropdown type="privateKey" onSelect={onPrivateKeyChange} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onDeploy}
                        disabled={!programName || !programString || !privateKeyString}
                    >
                        Deploy
                    </Button>
                    {deploymentString && (
                        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Deployment"
                                variant="outlined"
                                value={deploymentString}
                                disabled
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CopyButton data={deploymentString} />
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