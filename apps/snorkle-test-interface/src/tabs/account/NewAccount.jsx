import { useState } from "react";
import { Card, TextField, Box, Paper, Typography, Button, InputAdornment } from "@mui/material";
import { CopyButton } from "../../components/CopyButton";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { useSnackbar } from "notistack";
import axios from "axios";
import { useKeyVault } from "../../contexts/KeyVaultContext";

export const NewAccount = () => {
    const [privateKeyString, setPrivateKeyString] = useState("");
    const [viewKeyString, setViewKeyString] = useState("");
    const [addressString, setAddressString] = useState("");
    const [aleo] = useAleoWASM();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const { addKey } = useKeyVault();

    const onGenerateAccount = async () => {
        setLoading(true);
        const loadingKey = enqueueSnackbar("Generating new account...", { 
            persist: true,
            variant: "info"
        });
        try {
            const url = `/api/generate-account`;
            const response = await axios.post(url);
            addKey({
                name: `Account ${response.data.address.slice(0, 6)}`,
                privateKey: response.data.privateKey,
                viewKey: response.data.viewKey,
                address: response.data.address
            });
            closeSnackbar(loadingKey);
            enqueueSnackbar("New account generated successfully!", { variant: "success" });
        } catch (error) {
            closeSnackbar(loadingKey);
            enqueueSnackbar("Error generating account: " + error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    if (aleo !== null) {
        return (
            <Card sx={{ width: "100%", p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Generate New Account
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onGenerateAccount}
                    >
                        Generate Account
                    </Button>
                    {privateKeyString && (
                        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Private Key"
                                variant="outlined"
                                value={privateKeyString}
                                disabled
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CopyButton data={privateKeyString} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                fullWidth
                                label="View Key"
                                variant="outlined"
                                value={viewKeyString}
                                disabled
                                sx={{ mt: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CopyButton data={viewKeyString} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Address"
                                variant="outlined"
                                value={addressString}
                                disabled
                                sx={{ mt: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CopyButton data={addressString} />
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
