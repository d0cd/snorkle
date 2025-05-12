import {useMemo, useState} from "react";
import { Card, TextField, Box, Paper, Grid, Typography } from "@mui/material";
import axios from "axios";
import { CopyButton } from "../../components/CopyButton";
import { useNetwork } from "../../contexts/NetworkContext";

export const GetProgram = () => {
    const [program, setProgram] = useState(null);
    const [programID, setProgramID] = useState(null);
    const [status, setStatus] = useState("");
    const { endpointUrl, networkString } = useNetwork();

    // Returns the program id if the user changes it or the "Demo" button is clicked.
    const onChange = (event) => {
        if (event.target.value !== null) {
            setProgramID(event.target.value);
        }
        return programID;
    };

    // Calls `tryRequest` when the search bar input is entered.
    const onSearch = (event) => {
        if (event.key === 'Enter') {
            try {
                tryRequest(event.target.value);
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Attempts to request the program bytecode with the given program id.
    const tryRequest = (id) => {
        setProgramID(id);
        axios
            .get(`${endpointUrl}/${networkString}/program/${id}`)
            .then((response) => {
                setStatus("success");
                setProgram(response.data);
            })
            .catch((error) => {
                setProgram(error.message || "API/network error");
                setStatus("error");
            });
    };

    const programString = useMemo(() => {
        return program !== null ? program : ""
    }, [program]);

    const programIDString = useMemo(() => {
        return programID !== null ? programID : ""
    }, [programID])

    return (
        <Card sx={{ width: "100%", p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Get Program
            </Typography>
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    label="Program ID"
                    variant="outlined"
                    value={programIDString}
                    onChange={onChange}
                    onKeyPress={onSearch}
                    error={status === "error"}
                    helperText={status === "error" ? "Invalid program ID" : ""}
                />
            </Box>
            {program !== null && (
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={11}>
                            <Box component="pre" sx={{ 
                                m: 0, 
                                p: 1, 
                                bgcolor: 'background.default',
                                borderRadius: 1,
                                overflow: 'auto',
                                maxHeight: '500px'
                            }}>
                                {programString}
                            </Box>
                        </Grid>
                        <Grid item xs={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                                <CopyButton data={programString} />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </Card>
    );
};
