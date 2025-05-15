import React from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Autocomplete
} from '@mui/material';
import { useNetwork } from '../contexts/NetworkContext';

export const NetworkSelector: React.FC = () => {
    const {
        network,
        setNetwork,
        endpoint,
        setEndpoint,
        defaultNetworks,
        defaultEndpoints
    } = useNetwork();

    const endpointOptions = defaultEndpoints
        .filter(opt => opt.value !== 'custom')
        .map(opt => ({ value: opt.url || opt.value, label: opt.label }));

    const endpointObj = defaultEndpoints.find(e => e.value === endpoint);
    const isPreset = endpointObj && endpointObj.url;
    const endpointValue = isPreset ? endpointObj.url : endpoint;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <FormControl fullWidth>
                <InputLabel>Select Network</InputLabel>
                <Select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    label="Select Network"
                >
                    {defaultNetworks.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <Autocomplete
                    value={endpointValue}
                    options={endpointOptions}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="API Endpoint"
                            variant="outlined"
                        />
                    )}
                    onChange={(_, val) => {
                        const preset = defaultEndpoints.find(e => e.url === val);
                        if (preset) {
                            setEndpoint(preset.value);
                        } else {
                            setEndpoint(val);
                        }
                    }}
                    filterOptions={(options, { inputValue }) =>
                        options.filter(
                            (option) =>
                                option.value.toLowerCase().includes(inputValue.toLowerCase()) ||
                                option.label.toLowerCase().includes(inputValue.toLowerCase())
                        )
                    }
                />
            </FormControl>
        </Box>
    );
}; 