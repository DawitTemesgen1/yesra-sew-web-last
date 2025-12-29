import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Divider, AppBar, Toolbar, Typography, IconButton, Tooltip,
  useTheme, alpha, useMediaQuery, Button, Menu as MenuComponent, MenuItem,
  Container, Grid, Fab, Card, CardContent, Avatar, Badge, CssBaseline
} from '@mui/material';
import {
  ChevronLeft, MenuOpen,
  Dashboard as DashboardIcon, People, Assignment, Settings,
  Payments, Email, CheckCircle, Cancel, AccessTime, Visibility, Edit,
  Delete, Search, Refresh, TrendingUp, Category, CardMembership, History,
  Star, RateReview, BarChart, Security, Mail, Backup, Lock, Api, Support,
  PlayArrow, Smartphone, Gavel, Work, Home, DirectionsCar, Close,
  KeyboardArrowUp, Notifications, AccountCircle, Logout, LightMode, DarkMode, Menu, Business
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
  Help: Support,
  Business: Business
};

const ResponsiveAdminLayout = ({
  activeTab,
  setActiveTab,
  drawerOpen,
  setDrawerOpen,
  menuItems,
  t,
  children,
  mode,
  toggleTheme
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const drawerWidth = 280;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) {
      setDrawerOpen(false); // Close mobile drawer on selection
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 3, minHeight: '64px!important',
        background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white'
      }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            background: 'linear-gradient(45deg, #4F46E5 30%, #EC4899 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            fontSize: '1.25rem',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab(0)}
        >
          YesraSew Admin
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: 'auto', flex: 1, px: 2, py: 2 }}>
        <List>
          {menuItems.map((item) => {
            const IconComponent = iconMap[item.icon] || DashboardIcon;
            const isSelected = activeTab === item.id;
            return (
              <ListItem
                key={item.id}
                button
                selected={isSelected}
                onClick={() => handleTabChange(item.id)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.2s ease-in-out',
                  backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: isSelected ? theme.palette.primary.main : 'inherit',
                  borderLeft: isSelected ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 40,
                  color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary
                }}>
                  <IconComponent fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t(item.label)}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isSelected ? 600 : 500,
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          v1.2.0 • YesraSew Solution
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      {/* 1. Header (Fixed AppBar) */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { md: `${drawerOpen ? drawerWidth : 0}px` },
          boxShadow: 'none',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.9)' : alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(8px)',
          color: theme.palette.text.primary,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <Menu />
          </IconButton>

          {/* Desktop Toggle (only if closed) */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { xs: 'none', md: drawerOpen ? 'none' : 'block' } }}
          >
            <MenuOpen />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {t(menuItems.find(item => item.id === activeTab)?.label || 'dashboard')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={toggleTheme} color="inherit">
                {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 2. Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerOpen ? drawerWidth : 0 }, flexShrink: { md: 0 }, transition: 'width 0.2s' }}
        aria-label="admin navigation"
      >
        {/* Mobile Drawer (Temporary) */}
        <Drawer
          container={typeof window !== 'undefined' ? () => window.document.body : undefined}
          variant="temporary"
          open={isMobile && drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            zIndex: (theme) => theme.zIndex.drawer + 2
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer (Persistent) */}
        <Drawer
          variant="persistent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
              top: 0, // Ensure it starts from top
              height: '100%',
              bgcolor: 'background.paper'
            },
          }}
          open={drawerOpen}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* 3. Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          minHeight: '100vh',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Spacer for Fixed AppBar */}
        <Toolbar />

        {/* Content Children */}
        <Box sx={{
          animation: 'fadeIn 0.3s ease-in',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(10px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}>
          {children}
        </Box>
      </Box>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Fab
          color="primary"
          size="medium"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 2000
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}
    </Box>
  );
};

export default ResponsiveAdminLayout;

