import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Divider, AppBar, Toolbar, Typography, IconButton, Tooltip,
  useTheme, alpha, useMediaQuery, Button, Menu as MenuComponent, MenuItem,
  Container, Grid, Fab, Card, CardContent, Avatar, Badge
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
import { useTranslation } from 'react-i18next';

// Note: CSS files removed - styling now handled inline

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

  const drawerWidth = isMobile ? 320 : 280;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) {
      setMobileMenuAnchor(null);
    }
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Scroll to top functionality
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderMobileMenu = () => (
    <MenuComponent
      anchorEl={mobileMenuAnchor}
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMobileMenuClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          width: 280,
          maxHeight: '70vh',
          overflow: 'auto'
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" noWrap component="div">
          YesraSew Admin
        </Typography>
      </Box>
      <List sx={{ p: 1 }}>
        {menuItems.map((item) => {
          const IconComponent = iconMap[item.icon] || DashboardIcon;
          return (
            <MenuItem
              key={item.id}
              selected={activeTab === item.id}
              onClick={() => handleTabChange(item.id)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
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
            </MenuItem>
          );
        })}
      </List>
    </MenuComponent>
  );

  // Determine main content margin based on drawer state
  const mainMargin = (!isMobile && drawerOpen) ? 0 : 0; // If flex, margin is handled by flex flow? NOT if fixed.
  // Standard MUI Persistent drawer pattern:
  // If we render Drawer as a sibling in a flex row, it takes space.
  // If drawerOpen is FALSE, we want it to take 0 space.

  // FIX: Force render Drawer always, but control visibility via 'open' prop
  // AND ensure the Drawer component handles the 'persistent' width correctly.

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      {isMobile && renderMobileMenu()}

      {/* Drawer - Always render on desktop, control via open prop */}
      {(!isMobile) && (
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: drawerOpen ? drawerWidth : 0,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
              // If closed, the persistent drawer hides itself? 
              // MUI persistent drawer translates the paper, but root width stays?
              // We manually animate root width to 0 to collapse layout.
            },
          }}
        >
          {/* Drawer Inner Content - Same as before */}
          <Toolbar sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 3, minHeight: '64px!important'
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
                fontSize: '1.25rem'
              }}
            >
              YesraSew Admin
            </Typography>
            <IconButton onClick={handleDrawerToggle} size="small">
              <ChevronLeft />
            </IconButton>
          </Toolbar>

          <Box sx={{ overflow: 'auto', flex: 1, px: 2, py: 2 }}>
            <List>
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
                      mb: 0.5,
                      py: 1.5,
                      px: 2,
                      transition: 'all 0.2s ease-in-out',
                      '&.Mui-selected': {
                        background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                        color: theme.palette.primary.main,
                        borderLeft: `3px solid ${theme.palette.primary.main}`,
                        '&:hover': { background: alpha(theme.palette.primary.main, 0.2) },
                        '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                      },
                      '&:not(.Mui-selected):hover': {
                        transform: 'translateX(4px)',
                        bgcolor: alpha(theme.palette.text.primary, 0.04)
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: activeTab === item.id ? 'inherit' : theme.palette.text.secondary }}>
                      <IconComponent fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t(item.label)}
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: activeTab === item.id ? 600 : 500 }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Drawer>
      )}

      {/* Drawer for Mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true, BackdropProps: { sx: { backdropFilter: 'blur(4px)' } } }}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            zIndex: 1300,
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <Toolbar sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 3, minHeight: '64px!important'
          }}>
            <Typography variant="h6" noWrap component="div" sx={{
              background: 'linear-gradient(45deg, #4F46E5 30%, #EC4899 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              fontSize: '1.25rem'
            }}>
              Menu
            </Typography>
            <IconButton onClick={handleDrawerToggle} size="small">
              <Close />
            </IconButton>
          </Toolbar>
          <Box sx={{ overflow: 'auto', flex: 1, px: 2, py: 2 }}>
            <List>
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
                      mb: 0.5,
                      py: 1.5,
                      px: 2,
                      transition: 'all 0.2s ease-in-out',
                      '&.Mui-selected': {
                        background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                        color: theme.palette.primary.main,
                        borderLeft: `3px solid ${theme.palette.primary.main}`,
                        '&:hover': { background: alpha(theme.palette.primary.main, 0.2) },
                        '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                      },
                      '&:not(.Mui-selected):hover': {
                        transform: 'translateX(4px)',
                        bgcolor: alpha(theme.palette.text.primary, 0.04)
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: activeTab === item.id ? 'inherit' : theme.palette.text.secondary }}>
                      <IconComponent fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t(item.label)}
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: activeTab === item.id ? 600 : 500 }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Drawer>
      )}

      {/* Helper functions were inlined into the main return statement for better state access */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          background: theme.palette.mode === 'light'
            ? 'linear-gradient(to bottom right, #F3F4F6 0%, #F9FAFB 100%)'
            : 'transparent',
          minHeight: '100vh',
          width: '100%', // Take remaining space
          marginLeft: 0, // Flex layout handles spacing
        }}
      >
        <AppBar
          position="sticky"
          sx={{
            boxShadow: 'none',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            top: 0, zIndex: 1100
          }}
        >
          <Toolbar sx={{ px: { xs: 2, sm: 4 }, gap: 1 }}>
            {/* Toggle Button for Desktop if Closed */}
            {!isMobile && !drawerOpen && (
              <IconButton onClick={handleDrawerToggle} edge="start" sx={{ mr: 2 }}>
                <MenuOpen />
              </IconButton>
            )}

            {/* Toggle Button for Mobile */}
            {isMobile && (
              <IconButton onClick={handleDrawerToggle} edge="start" sx={{ mr: 1 }}>
                <Menu />
              </IconButton>
            )}

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {t(menuItems.find(item => item.id === activeTab)?.label || 'dashboard')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Toggle Theme">
                <IconButton size="small" color="inherit" onClick={toggleTheme}>
                  {theme.palette.mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Notifications">
                <IconButton size="small" color="inherit">
                  <Badge badgeContent={4} color="error"><Notifications fontSize="small" /></Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton size="small" color="inherit">
                  <Settings fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>


        <Container
          maxWidth={false}
          sx={{
            py: 4,
            px: { xs: 2, sm: 4, md: 6 },
            maxWidth: '1920px'
          }}
        >
          <Box sx={{
            animation: 'fadeIn 0.5s ease-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}>
            {children}
          </Box>
        </Container>
      </Box>

      {showScrollTop && (
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}
    </Box>
  );
};

export default ResponsiveAdminLayout;

