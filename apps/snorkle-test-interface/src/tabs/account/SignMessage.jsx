import {useMemo, useState} from "react";
import { Card, TextField, Box, Paper, Typography, InputAdornment } from "@mui/material";
import { CopyButton } from "../../components/CopyButton";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { KeyDropdown } from "../../components/KeyDropdown";

export const SignMessage = () => {
    const [signingAccount, setSigningAccount] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [messageString, setMessageString] = useState("");
    const [signatureString, setSignatureString] = useState("");
    const [aleo] = useAleoWASM();
    const textEncoder = new TextEncoder();

    const onKeyChange = (event) => {
        setInputValue(event.target.value);
        setSigningAccount(null);
        try {
            setSigningAccount(aleo.PrivateKey.from_string(event.target.value));
            onMessageChange();
        } catch (error) {
            console.error(error);
        } finally {
            setMessageString(null);
            setSignatureString(null);
        }
    };

    const handleDropdownSelect = (val) => {
        setInputValue(val);
        try {
            setSigningAccount(aleo.PrivateKey.from_string(val));
            onMessageChange();
        } catch (error) {
            console.error(error);
        }
    };

    const signString = (str) => {
        if ((str === "") | (signingAccount === null)) return;
        return signingAccount.sign(textEncoder.encode(str)).to_string();
    };

    const onMessageChange = (event) => {
        setMessageString(event.target.value);
        try {
            setSignatureString(signString(event.target.value));
        } catch (error) {
            console.error(error);
        }
    };

    if (aleo !== null) {
        return (
            <Card sx={{ width: "100%", p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Sign a Message
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Private Key"
                        variant="outlined"
                        value={inputValue}
                        onChange={onKeyChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <KeyDropdown type="privateKey" onSelect={handleDropdownSelect} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Message"
                        variant="outlined"
                        value={messageString}
                        onChange={onMessageChange}
                    />
                    {signingAccount && (
                        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Signature"
                                variant="outlined"
                                value={signatureString}
                                disabled
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CopyButton data={signatureString} />
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
