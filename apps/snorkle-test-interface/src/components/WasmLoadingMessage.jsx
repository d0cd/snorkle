import { useAleoWASM } from "../aleo-wasm-hook.js";
import { useEffect, useState } from "react";
import { Snackbar, Alert, LinearProgress, Box, Typography } from "@mui/material";

export function WasmLoadingMessage() {
    const [_, aleoLoading] = useAleoWASM();
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (aleoLoading) {
            setOpen(true);
            setMessage("Loading Provable SDK...");
            // Simulate progress for better UX
            const interval = setInterval(() => {
                setLoadingProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 500);

            return () => clearInterval(interval);
        } else {
            setLoadingProgress(100);
            setMessage("Provable SDK Loaded Successfully!");
            const timer = setTimeout(() => {
                setOpen(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [aleoLoading]);

    return (
        <Snackbar
            open={open}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{ width: 300 }}
        >
            <Alert
                severity={loadingProgress === 100 ? "success" : "info"}
                sx={{ width: '100%' }}
            >
                <Box sx={{ width: '100%', mb: 1 }}>
                    <Typography variant="body2" gutterBottom>
                        {message}
                    </Typography>
                    {loadingProgress < 100 && (
                        <>
                            <LinearProgress 
                                variant="determinate" 
                                value={loadingProgress} 
                                sx={{ mb: 1 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                This may take a few moments
                            </Typography>
                        </>
                    )}
                </Box>
            </Alert>
        </Snackbar>
    );
}
