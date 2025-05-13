import { IconButton, Tooltip } from '@mui/material';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';

export const ThemeToggle = ({ darkMode, onToggle }) => {
    return (
        <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton
                onClick={onToggle}
                sx={{
                    backgroundColor: 'background.paper',
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },
                    boxShadow: 1,
                    width: 40,
                    height: 40,
                }}
            >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
        </Tooltip>
    );
}; 