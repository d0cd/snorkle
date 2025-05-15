import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    CircularProgress,
    IconButton,
    Tabs,
    Tab,
    Stack,
    Paper,
    Divider
} from '@mui/material';
import {
    ContentCopy as CopyIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { useNetwork } from '../contexts/NetworkContext';
import { useSnackbar } from 'notistack';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`rest-tabpanel-${index}`}
            aria-labelledby={`rest-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const Rest: React.FC = () => {
    const { getApiUrl } = useNetwork();
    const { enqueueSnackbar } = useSnackbar();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [blockHeight, setBlockHeight] = useState('');

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar('Copied to clipboard', { variant: 'success' });
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setResponse(null);
    };

    const handleGetLatestBlock = async () => {
        setLoading(true);
        try {
            const response = await fetch(getApiUrl('block/latest'));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                setResponse(data);
                enqueueSnackbar('Successfully fetched latest block', { variant: 'success' });
            } catch (e) {
                console.error('Error parsing JSON:', e);
                enqueueSnackbar('Error parsing response data', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching block:', error);
            enqueueSnackbar('Failed to fetch latest block', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleGetBlockByHeight = async () => {
        if (!blockHeight) {
            enqueueSnackbar('Please enter a block height', { variant: 'error' });
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(getApiUrl(`block/${blockHeight}`));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                setResponse(data);
                enqueueSnackbar('Successfully fetched block', { variant: 'success' });
            } catch (e) {
                console.error('Error parsing JSON:', e);
                enqueueSnackbar('Error parsing response data', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching block:', error);
            enqueueSnackbar('Failed to fetch block', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                REST API
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Interact with the Aleo network through REST API endpoints
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Card>
                <CardContent>
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="Latest Block" />
                        <Tab label="Block by Height" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={3}>
                            <Grid xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Latest Block
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            Fetch the most recent block from the network
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={handleGetLatestBlock}
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                                            fullWidth
                                        >
                                            Get Latest Block
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Block by Height
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            Fetch a specific block by its height
                                        </Typography>
                                        <Stack spacing={2}>
                                            <TextField
                                                label="Block Height"
                                                type="number"
                                                value={blockHeight}
                                                onChange={(e) => setBlockHeight(e.target.value)}
                                                disabled={loading}
                                                fullWidth
                                            />
                                            <Button
                                                variant="contained"
                                                onClick={handleGetBlockByHeight}
                                                disabled={loading || !blockHeight}
                                                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                                                fullWidth
                                            >
                                                Get Block
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                            {response && (
                                <Grid xs={12}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6">Response</Typography>
                                                <IconButton 
                                                    onClick={() => handleCopy(JSON.stringify(response, null, 2))}
                                                    size="small"
                                                >
                                                    <CopyIcon />
                                                </IconButton>
                                            </Box>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    maxHeight: '600px',
                                                    overflow: 'auto',
                                                    bgcolor: 'background.default'
                                                }}
                                            >
                                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                                    {JSON.stringify(response, null, 2)}
                                                </pre>
                                            </Paper>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    </TabPanel>
                </CardContent>
            </Card>
        </Box>
    );
}; 