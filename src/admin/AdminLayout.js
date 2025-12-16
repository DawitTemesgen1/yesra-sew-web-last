import React from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Divider, AppBar, Toolbar, Typography, IconButton, Tooltip,
  useTheme, alpha
} from '@mui/material';
import {
  Menu, ChevronLeft,
  Dashboard as DashboardIcon, People, Assignment, Settings,
  Payments, Email, CheckCircle, Cancel, AccessTime, Visibility, Edit,
  Delete, Search, Refresh, TrendingUp, Category, CardMembership, History,
  Star, RateReview, BarChart, Security, Mail, Backup, Lock, Api, Support,
  PlayArrow, Smartphone, Gavel, Work, Home, DirectionsCar
} from '@mui/icons-material';

// Icon mapping
const iconMap = {
  Dashboard: DashboardIcon,
  Assignment: Assignment,
  Home: Home,
  DirectionsCar: DirectionsCar,
  Work: Work,
  Category: Category,
  TrendingUp: TrendingUp,
  Settings: Settings,
  Email: Email,
  Payments: Payments,
  Security: Security,
  CardMembership: CardMembership,
  BarChart: BarChart,
  Gavel: Gavel,
  Smartphone: Smartphone,
  People: People,
  Backup: Backup,
  Api: Api,
  Support: Support,
  PlayArrow: PlayArrow,
  Help: Support
};

const AdminLayout = ({ 
  activeTab, 
  setActiveTab, 
  drawerOpen, 
  setDrawerOpen, 
  menuItems, 
  t, 
  children 
}) => {
  const theme = useTheme();
  const drawerWidth = 280;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderDrawer = () => (
    <Drawer
      variant="persistent"
      anchor="left"
      open={drawerOpen}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Toolbar sx={{ 
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          YesraSew Admin
        </Typography>
        <IconButton onClick={() => setDrawerOpen(false)}>
          <ChevronLeft />
        </IconButton>
      </Toolbar>
      
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <List sx={{ p: 2 }}>
          {menuItems.map((item) => {
            const IconComponent = iconMap[item.icon] || DashboardIcon;
            return (
              <ListItem
                key={item.id}
                button
                selected={activeTab === item.id}
                onClick={() => handleTabChange(item.id)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.action.hover, 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText 
                  primary={t(item.label)}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: activeTab === item.id ? 600 : 400,
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Drawer */}
      {renderDrawer()}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: drawerOpen ? 0 : `-${drawerWidth}px`,
        }}
      >
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)`,
            ml: `${drawerOpen ? drawerWidth : 0}px`,
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[1],
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Toolbar>
            {!drawerOpen && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => setDrawerOpen(true)}
                edge="start"
                sx={{ mr: 2 }}
              >
                <Menu />
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {t(menuItems.find(item => item.id === activeTab)?.label || 'dashboard')}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton color="inherit">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton color="inherit">
                  <Settings />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Box sx={{ px: 3, maxWidth: 'xl', mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
