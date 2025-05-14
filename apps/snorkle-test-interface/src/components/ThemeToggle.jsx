import { IconButton, Tooltip } from '@mui/material';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';

export const ThemeToggle = ({ darkMode, onToggle }) => {
    return (
        <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton
                onClick={onToggle}
                size="large"
                sx={{
                    backgroundColor: 'background.paper',
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },
                    boxShadow: 2,
                    width: 48,
                    height: 48,
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': {
                        backgroundColor: 'action.hover',
                        transform: 'scale(1.05)',
                        transition: 'transform 0.2s ease-in-out'
                    }
                }}
            >
                {darkMode ? <LightModeIcon fontSize="large" /> : <DarkModeIcon fontSize="large" />}
            </IconButton>
        </Tooltip>
    );
}; 