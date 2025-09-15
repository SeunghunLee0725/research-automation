import React, { useMemo } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Divider,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search,
  Analytics,
  TrendingUp,
  Description,
  Assignment,
  Settings,
  Notifications,
  Storage,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ drawerOpen, setDrawerOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { analysisTasks } = useAnalysis();
  const { user, signOut } = useAuth();

  // Count analyzing tasks
  const analyzingCount = useMemo(() => {
    return Array.from(analysisTasks.values()).filter(task => task.status === 'analyzing').length;
  }, [analysisTasks]);

  const menuItems = [
    { text: 'Data Collection', icon: <Search />, path: '/collection' },
    { 
      text: 'Database', 
      icon: analyzingCount > 0 ? (
        <Badge badgeContent={analyzingCount} color="primary">
          <Storage />
        </Badge>
      ) : <Storage />, 
      path: '/saved' 
    },
    { text: 'Trends', icon: <TrendingUp />, path: '/trends' },
    { text: 'Analysis', icon: <Description />, path: '/reports' },
    { text: 'Paperwork', icon: <Assignment />, path: '/tasks' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            R&D Planner
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user.email}
            </Typography>
          )}
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            mt: 8,
          },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          {user && (
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon><Logout /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </List>
          )}
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="textSecondary">
              Version 1.0.0
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation;