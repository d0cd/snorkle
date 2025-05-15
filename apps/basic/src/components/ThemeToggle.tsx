import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4 as DarkIcon, Brightness7 as LightIcon } from '@mui/icons-material';

interface ThemeToggleProps {
    darkMode: boolean;
    onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, onToggle }) => {
    return (
        <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
            <IconButton onClick={onToggle} color="inherit">
                {darkMode ? <LightIcon /> : <DarkIcon />}
            </IconButton>
        </Tooltip>
    );
}; 