import { useState } from "react";
import { Card, TextField, Box, Paper, Typography, Button, InputAdornment } from "@mui/material";
import { CopyButton } from "../../components/CopyButton";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { useSnackbar } from "notistack";

export const NewAccount = () => {
    const [privateKeyString, setPrivateKeyString] = useState("");
    const [viewKeyString, setViewKeyString] = useState("");
    const [addressString, setAddressString] = useState("");
    const [aleo] = useAleoWASM();
    const { enqueueSnackbar } = useSnackbar();

    const onGenerateAccount = () => {
        const loadingKey = enqueueSnackbar("Generating account...", { 
            variant: "info",
            persist: true 
        });

        try {
            const privateKey = aleo.PrivateKey.new();
            const viewKey = privateKey.to_view_key();
            const address = privateKey.to_address();
            setPrivateKeyString(privateKey.to_string());
            setViewKeyString(viewKey.to_string());
            setAddressString(address.to_string());
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar("Account generated successfully!", { variant: "success" });
        } catch (error) {
            console.error(error);
            enqueueSnackbar.close(loadingKey);
            enqueueSnackbar(`Error generating account: ${error.message}`, { variant: "error" });
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
