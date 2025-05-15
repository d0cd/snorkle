'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  AccountBalance as AccountBalanceIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { Key } from '@/lib/types';
import { formatAmount } from '@/lib/utils';

const DRAWER_WIDTH = 280;

interface SidebarProps {
  keys: Key[];
  selectedKey: Key | null;
  balances: { [address: string]: number };
  onAddKey: () => void;
  onRemoveKey: (address: string) => void;
  onSelectKey: (address: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  keys,
  selectedKey,
  balances,
  onAddKey,
  onRemoveKey,
  onSelectKey,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' },
    { text: 'Funds', icon: <AccountBalanceIcon />, path: '/funds' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Wager Dashboard
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">Keys</Typography>
          <Tooltip title="Add Key">
            <IconButton size="small" onClick={onAddKey}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <List>
          {keys.map((key) => (
            <ListItem
              key={key.address}
              disablePadding
              secondaryAction={
                <Tooltip title="Remove Key">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onRemoveKey(key.address)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemButton
                selected={selectedKey?.address === key.address}
                onClick={() => onSelectKey(key.address)}
              >
                <ListItemText
                  primary={key.address.slice(0, 8) + '...' + key.address.slice(-8)}
                  secondary={formatAmount(balances[key.address] || 0)}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}; 