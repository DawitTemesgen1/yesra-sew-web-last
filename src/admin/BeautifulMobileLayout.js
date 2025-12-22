import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Divider, AppBar, Toolbar, Typography, IconButton, Tooltip,
  useTheme, alpha, useMediaQuery, Button, Menu, MenuItem,
  Container, Grid, Fab, Card, CardContent, Avatar, Badge
} from '@mui/material';
import {
  ChevronLeft, MenuOpen,
  Dashboard as DashboardIcon, People, Assignment, Settings,
  Payments, Email, CheckCircle, Cancel, AccessTime, Visibility, Edit,
  Delete, Search, Refresh, TrendingUp, Category, CardMembership, History,
  Star, RateReview, BarChart, Security, Mail, Backup, Lock, Api, Support,
  PlayArrow, Smartphone, Gavel, Work, Home, DirectionsCar, Close,
  KeyboardArrowUp, Notifications, AccountCircle, Logout, LightMode, DarkMode
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

const BeautifulMobileLayout = ({ 
  activeTab, 
  setActiveTab, 
  drawerOpen, 
  setDrawerOpen, 
  menuItems, 
  t, 
  children 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const drawerWidth = isMobile ? 320 : (isTablet ? 280 : 320);

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

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleProfileOpen = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
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
    <Menu
      anchorEl={mobileMenuAnchor}
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMobileMenuClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          width: 320,
          maxHeight: '70vh',
          overflow: 'auto',
          borderRadius: 3,
          boxShadow: theme.shadows[8],
          border: `1px solid ${theme.palette.divider}`,
        }
      }}
    >
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white'
      }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          YesraSew Admin
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Mobile Dashboard
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
                borderRadius: 2,
                mb: 0.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                  transform: 'translateX(4px)',
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
    </Menu>
  );

  const renderNotificationMenu = () => (
    <Menu
      anchorEl={notificationAnchor}
      open={Boolean(notificationAnchor)}
      onClose={handleNotificationClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          width: 320,
          maxHeight: '70vh',
          overflow: 'auto',
          borderRadius: 3,
          boxShadow: theme.shadows[8],
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Notifications
        </Typography>
      </Box>
      <List sx={{ p: 1 }}>
        <MenuItem sx={{ borderRadius: 2, mb: 0.5 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'success.main' }}>
            <CheckCircle />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              New tender approved
            </Typography>
            <Typography variant="caption" color="text.secondary">
              2 minutes ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ borderRadius: 2, mb: 0.5 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'warning.main' }}>
            <AccessTime />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Pending review: 5 items
            </Typography>
            <Typography variant="caption" color="text.secondary">
              1 hour ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ borderRadius: 2 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'info.main' }}>
            <People />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              10 new users registered
            </Typography>
            <Typography variant="caption" color="text.secondary">
              3 hours ago
            </Typography>
          </Box>
        </MenuItem>
      </List>
    </Menu>
  );

  const renderProfileMenu = () => (
    <Menu
      anchorEl={profileAnchor}
      open={Boolean(profileAnchor)}
      onClose={handleProfileClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          width: 240,
          borderRadius: 3,
          boxShadow: theme.shadows[8],
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Admin User
        </Typography>
        <Typography variant="caption" color="text.secondary">
          admin@yesrasew.com
        </Typography>
      </Box>
      <List sx={{ p: 1 }}>
        <MenuItem onClick={handleProfileClose} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <MenuItem onClick={handleProfileClose} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <MenuItem onClick={handleProfileClose} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </List>
    </Menu>
  );

  const renderDrawer = () => (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={isMobile ? Boolean(mobileMenuAnchor) : drawerOpen}
      onClose={isMobile ? handleMobileMenuClose : () => setDrawerOpen(false)}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          [theme.breakpoints.down('sm')]: {
            width: '100%',
            maxWidth: '320px',
          },
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <Toolbar sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        px: { xs: 2, sm: 3 },
        py: { xs: 1.5, sm: 2 },
        minHeight: { xs: 64, sm: 72 }
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            fontWeight: 600
          }}
        >
          {isMobile ? "Menu" : "YesraSew Admin"}
        </Typography>
        <IconButton 
          onClick={isMobile ? handleMobileMenuClose : () => setDrawerOpen(false)}
          sx={{ 
            color: 'white',
            '&:hover': {
              bgcolor: alpha(255, 255, 255, 0.1),
            }
          }}
        >
          {isMobile ? <Close /> : <ChevronLeft />}
        </IconButton>
      </Toolbar>
      
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <List sx={{ 
          p: { xs: 1, sm: 2 },
          '& .MuiListItem-root': {
            borderRadius: { xs: 2, sm: 3 },
            mb: { xs: 0.5, sm: 1 },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }
        }}>
          {menuItems.map((item) => {
            const IconComponent = iconMap[item.icon] || DashboardIcon;
            return (
              <ListItem
                key={item.id}
                button
                selected={activeTab === item.id}
                onClick={() => handleTabChange(item.id)}
                sx={{
                  borderRadius: { xs: 2, sm: 3 },
                  mb: { xs: 0.5, sm: 1 },
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 2, sm: 3 },
                  minHeight: { xs: 56, sm: 64 },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.action.hover, 0.08),
                    transform: { xs: 'translateX(4px)', sm: 'none' },
                  },
                  '&:active': {
                    transform: { xs: 'translateX(2px)', sm: 'none' },
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: { xs: 32, sm: 40 },
                  mr: { xs: 2, sm: 3 },
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText 
                  primary={t(item.label)}
                  primaryTypographyProps={{
                    fontSize: { xs: '0.875rem', sm: '0.875rem', md: '0.875rem' },
                    fontWeight: activeTab === item.id ? 600 : 500,
                    noWrap: true,
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );

  const renderAppBar = () => (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${(!isMobile && drawerOpen) ? drawerWidth : 0}px)`,
        ml: `${(!isMobile && drawerOpen) ? drawerWidth : 0}px`,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        boxShadow: theme.shadows[4],
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        [theme.breakpoints.down('md')]: {
          width: '100%',
          ml: 0,
        },
      }}
    >
      <Toolbar sx={{ 
        px: { xs: 1, sm: 2 },
        minHeight: { xs: 56, sm: 64 },
        gap: { xs: 0.5, sm: 1 }
      }}>
        {!isMobile && !drawerOpen && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(true)}
            edge="start"
            sx={{ 
              mr: 2,
              '&:hover': {
                bgcolor: alpha(255, 255, 255, 0.1),
              }
            }}
          >
            <MenuOpen />
          </IconButton>
        )}
        
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open menu"
            onClick={handleMobileMenuOpen}
            edge="start"
            sx={{ 
              mr: { xs: 1, sm: 2 },
              '&:hover': {
                bgcolor: alpha(255, 255, 255, 0.1),
              }
            }}
          >
            <Menu />
          </IconButton>
        )}
        
        <Typography 
          variant={isMobile ? "h6" : "h6"} 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {t(menuItems.find(item => item.id === activeTab)?.label || 'dashboard')}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.5, sm: 1 },
          alignItems: 'center'
        }}>
          <Tooltip title="Notifications" arrow>
            <IconButton 
              color="inherit"
              onClick={handleNotificationOpen}
              sx={{ 
                '&:hover': {
                  bgcolor: alpha(255, 255, 255, 0.1),
                }
              }}
            >
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Refresh" arrow>
            <IconButton 
              color="inherit" 
              size={isMobile ? "small" : "medium"}
              sx={{ 
                '&:hover': {
                  bgcolor: alpha(255, 255, 255, 0.1),
                }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Profile" arrow>
            <IconButton 
              color="inherit"
              onClick={handleProfileOpen}
              sx={{ 
                '&:hover': {
                  bgcolor: alpha(255, 255, 255, 0.1),
                }
              }}
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Mobile Menu */}
      {isMobile && renderMobileMenu()}
      
      {/* Notification Menu */}
      {renderNotificationMenu()}
      
      {/* Profile Menu */}
      {renderProfileMenu()}
      
      {/* Drawer */}
      {(!isMobile || drawerOpen) && renderDrawer()}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: (!isMobile && drawerOpen) ? 0 : `-${drawerWidth}px`,
          [theme.breakpoints.down('md')]: {
            marginLeft: 0,
          },
        }}
      >
        {/* AppBar */}
        {renderAppBar()}

        {/* Page Content */}
        <Toolbar sx={{ mb: 3 }} />
        
        <Container 
          maxWidth={false}
          sx={{ 
            px: { xs: 2, sm: 3, md: 4, lg: 6 },
            maxWidth: { xl: '1800px' },
            overflowX: 'hidden'
          }}
        >
          <Box sx={{ 
            py: { xs: 2, sm: 3 },
            minHeight: 'calc(100vh - 120px)',
            overflowX: 'hidden'
          }}>
            {children}
          </Box>
        </Container>
      </Box>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Fab
          color="primary"
          size="medium"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 1000,
            opacity: 0.9,
            '&:hover': {
              opacity: 1,
              transform: 'scale(1.05)',
            },
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}
    </Box>
  );
};

export default BeautifulMobileLayout;

