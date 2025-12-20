import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box,
  Button, Paper, useMediaQuery, useTheme, Avatar, Badge, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import {
  Home, Work, Gavel, Apartment, DirectionsCar,
  Add as AddIcon, Notifications, AccountCircle,
  Language, DarkMode, LightMode, Settings, Favorite, Dashboard, ExitToApp
} from '@mui/icons-material';
import QuickActionsToolbar from './QuickActionsToolbar';
import { useNavigate, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import logo from '../assets/logo.png';
import { useCustomTheme } from '../contexts/ThemeContext';

// --- Embedded Multilingual Translations ---
const translations = {
  en: {
    navbar: {
      logoSubtitle: "Digital Solution",
      home: "Home",
      tenders: "Tenders",
      jobs: "Jobs",
      homes: "Homes",
      cars: "Cars",
      postAd: "Post Your Ad",
      login: "Sign In",
      register: "Register",
      dashboard: "Dashboard",
      myProfile: "My Profile",
      settings: "Settings",
      myListings: "My Listings",
      favorites: "My Favorites",
      logout: "Logout",
      defaultUser: "User",
    },
    languages: {
      en: "English",
      am: "አማርኛ (Amharic)",
      om: "Afaan Oromoo",
      ti: "ትግርኛ (Tigrigna)"
    },
    tooltips: {
      userMenu: "{name} - View Profile & More",
      postAd: "List an item, service, or job for sale",
      changeLanguage: "Change Language",
      notifications: "View your notifications",
      theme: "Toggle Theme"
    }
  },
  am: {
    navbar: {
      logoSubtitle: "ዲጂታል መፍትሄ",
      home: "መነሻ",
      tenders: "ጨረታዎች",
      jobs: "ስራዎች",
      homes: "ቤቶች",
      cars: "መኪናዎች",
      postAd: "ማስታወቂያ ይለጥፉ",
      login: "ይግቡ",
      register: "ይመዝገቡ",
      dashboard: "ዳሽቦርድ",
      myProfile: "የግል መረጃ",
      settings: "ቅንብሮች",
      myListings: "የእኔ ዝርዝሮች",
      favorites: "የምወዳቸው",
      logout: "ውጣ",
      defaultUser: "ተጠቃሚ",
    },
    languages: {
      en: "English",
      am: "አማርኛ",
      om: "Afaan Oromoo",
      ti: "ትግርኛ"
    },
    tooltips: {
      userMenu: "{name} - መገለጫ እና ተጨማሪ ይመልከቱ",
      postAd: "እቃ፣ አገልግሎት ወይም ስራ ለሽያጭ ይዘርዝሩ",
      changeLanguage: "ቋንቋ ይቀይሩ",
      notifications: "ማሳወቂያዎችዎን ይመልከቱ",
      theme: "ገጽታ ቀይር"
    }
  },
  om: {
    navbar: {
      logoSubtitle: "Furmaata Dijitaalaa",
      home: "Fuula Jalqabaa",
      tenders: "Caalbaasiiwwan",
      jobs: "Hojiiwwan",
      homes: "Manneen",
      cars: "Konkolaattota",
      postAd: "Beeksisa Maxxansi",
      login: "Seeni",
      register: "Galmaa'aa",
      dashboard: "Daashboordii",
      myProfile: "Piroofayilii Koo",
      settings: "Qindeeffamoota",
      myListings: "Tarreeffamoota Koo",
      favorites: "Kan Jaallataman",
      logout: "Bahi",
      defaultUser: "Fayyadamtoota",
    },
    languages: {
      en: "English",
      am: "Amharic",
      om: "Afaan Oromoo",
      ti: "Tigrigna"
    },
    tooltips: {
      userMenu: "{name} - Piroofayilii fi Dabalata Ilaali",
      postAd: "Meeshaa, tajaajila, ykn hojii gurgurtaaf tarreessi",
      changeLanguage: "Afaan Jijjiiri",
      notifications: "Beeksisoota keessan ilaalaa",
      theme: "Teema Jijjiiri"
    }
  },
  ti: {
    navbar: {
      logoSubtitle: "ዲጂታል ፍታሕ",
      home: "መበገሲ",
      tenders: "ጨረታታት",
      jobs: "ስራሕቲ",
      homes: "ኣባይቲ",
      cars: "መካይን",
      postAd: "ማስታወቂያ ለጥፉ",
      login: "እቶ",
      register: "ተመዝገቡ",
      dashboard: "ዳሽቦርድ",
      myProfile: "ናይ ገዛእ ርእሰይ ሓበሬታ",
      settings: "ቅጥዕታት",
      myListings: "ዝርዝራተይ",
      favorites: "ዝፈትዎም",
      logout: "ውጻእ",
      defaultUser: "ተጠቃሚ",
    },
    languages: {
      en: "English",
      am: "Amharic",
      om: "Afaan Oromoo",
      ti: "ትግርኛ"
    },
    tooltips: {
      userMenu: "{name} - ፕሮፋይልን ካልእን ርአ",
      postAd: "ንብረት፣ ኣገልግሎት ወይ ስራሕ ንሽይጥ ዘርዚርካ",
      changeLanguage: "ቋንቋ ቀይር",
      notifications: "መልእኽቲታትኩም ርአዩ",
      theme: "ቴማ ቀይር"
    }
  }
};

const Navbar = ({ activeTab, setActiveTab }) => {
  const theme = useTheme();
  const { mode: themeMode, toggleTheme } = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user, logout } = useAuth();

  const { language, changeLanguage } = useLanguage();
  const t = translations[language] || translations.en;

  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  // Local storage sync is handled by LanguageContext, so we don't need it here.

  const getUserDisplayName = () => {
    if (!isAuthenticated || !user) return t.navbar.defaultUser;
    const { first_name, last_name, phone } = user.user_metadata || {};
    if (first_name && last_name) return `${first_name} ${last_name}`;
    if (phone) return phone;
    if (user.email && !user.email.startsWith('phone_')) return user.email;
    return t.navbar.defaultUser;
  };
  const displayName = getUserDisplayName();

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLanguageMenuOpen = (event) => setLanguageMenuAnchor(event.currentTarget);
  const handleLanguageMenuClose = () => setLanguageMenuAnchor(null);

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    handleLanguageMenuClose();
  };

  const handleNav = (path, index) => {
    setActiveTab(index);
    navigate(path);
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    setOpenLogoutDialog(true);
  };

  const performLogout = () => {
    logout();
    setOpenLogoutDialog(false);
    navigate('/');
  };

  const getActiveTabIndex = () => {
    const path = location.pathname;
    if (path.startsWith('/tenders')) return 1;
    if (path.startsWith('/jobs')) return 2;
    if (path.startsWith('/homes')) return 3;
    if (path.startsWith('/cars')) return 4;
    if (path === '/') return 0;
    return -1;
  };

  const currentTab = getActiveTabIndex();

  const renderMenu = (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ elevation: 4, sx: { borderRadius: 3, mt: 1.5, minWidth: 220 } }}>
      {isAuthenticated && user ? (
        <>
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}><Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>{displayName}</Typography></Box>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}><AccountCircle sx={{ mr: 1.5, fontSize: 20 }} />{t.navbar.myProfile}</MenuItem>
          <MenuItem sx={{ borderTop: `1px solid ${theme.palette.divider}`, color: 'error.main' }} onClick={handleLogoutClick}><ExitToApp sx={{ mr: 1.5, fontSize: 20 }} />{t.navbar.logout}</MenuItem>
        </>
      ) : (
        <>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/auth'); }}><AccountCircle sx={{ mr: 1.5, fontSize: 20 }} />{t.navbar.login}</MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/auth?mode=register'); }}><AddIcon sx={{ mr: 1.5, fontSize: 20 }} />{t.navbar.register}</MenuItem>
        </>
      )}
    </Menu>
  );



  const logoutDialog = (
    <Dialog
      open={openLogoutDialog}
      onClose={() => setOpenLogoutDialog(false)}
      aria-labelledby="logout-dialog-title"
    >
      <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
      <DialogContent>
        <DialogContentText>Do you want to logout?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenLogoutDialog(false)}>No</Button>
        <Button onClick={performLogout} color="error" autoFocus>Yes</Button>
      </DialogActions>
    </Dialog>
  );

  const renderLanguageMenu = (
    <Menu anchorEl={languageMenuAnchor} open={Boolean(languageMenuAnchor)} onClose={handleLanguageMenuClose} PaperProps={{ elevation: 4, sx: { borderRadius: 3, mt: 1.5, minWidth: 220 } }}>
      {['en', 'am', 'om', 'ti'].map(lang => (
        <MenuItem key={lang} onClick={() => handleLanguageChange(lang)} selected={language === lang}>
          <Typography>{lang === 'en' ? 'English' : lang === 'am' ? 'አማርኛ' : lang === 'om' ? 'Afaan Oromoo' : 'ትግርኛ'}</Typography>
        </MenuItem>
      ))}
    </Menu>
  );

  const NavItem = ({ label, icon, index, path }) => {
    const isActive = currentTab === index;
    return (
      <Box onClick={() => handleNav(path, index)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, cursor: 'pointer', color: isActive ? 'primary.main' : 'text.secondary', transition: 'all 0.2s', '&:active': { transform: 'scale(0.95)' } }}>
        {React.cloneElement(icon, { color: isActive ? 'primary' : 'inherit', sx: { fontSize: 24 } })}
        <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.5, fontWeight: isActive ? 600 : 400 }}>{label}</Typography>
      </Box>
    );
  };

  const navLinks = [
    { label: t.navbar.home, path: '/' }, { label: t.navbar.tenders, path: '/tenders' }, { label: t.navbar.jobs, path: '/jobs' },
    { label: t.navbar.homes, path: '/homes' }, { label: t.navbar.cars, path: '/cars' }
  ];

  if (!isMobile) {
    return (
      <>
        {/* Floating Desktop App Bar */}
        <AppBar
          position="sticky"
          color="inherit"
          elevation={4}
          sx={{
            width: '94%',
            maxWidth: '1400px',
            mx: 'auto',
            mt: 2,
            mb: 1, // spacing below before content starts
            top: 16,
            borderRadius: 4,
            backdropFilter: 'blur(12px)',
            // Branding: Deep Royal Blue background for BOTH light and dark modes (colored app bar)
            background: themeMode === 'dark'
              ? 'linear-gradient(135deg, rgba(10, 25, 41, 0.95) 0%, rgba(20, 40, 60, 0.95) 100%)'
              : 'linear-gradient(135deg, #1E3A8A 0%, #0044CC 100%)', // Rich Blue Gradient
            border: themeMode === 'dark' ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', // Stronger shadow for depth
          }}
        >
          <Toolbar sx={{
            minHeight: 72,
            px: { md: 3 },
            justifyContent: 'space-between'
          }}>
            <Box onClick={() => navigate('/')} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', mr: 4 }}>
              <Box component="img" src={logo} sx={{ width: 45, height: 45, mr: 1.5 }} alt="Logo" />
              <Box>
                <Typography variant="h4" sx={{
                  fontWeight: 900,
                  lineHeight: 1,
                  // Text is always white/light on the colored background
                  color: '#fff',
                  letterSpacing: '-0.5px'
                }}>
                  Yesra Sew
                </Typography>
                <Typography variant="caption" sx={{
                  color: '#D4AF37', // Always Golden subtitle
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  mt: 0.5,
                  textTransform: 'uppercase'
                }}>
                  {t.navbar.logoSubtitle}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
              {navLinks.map((item, idx) => (
                <Button
                  key={item.label}
                  onClick={() => handleNav(item.path, idx)}
                  sx={{
                    position: 'relative',
                    color: currentTab === idx
                      ? '#D4AF37' // Active: Golden
                      : '#FFFFFF', // Inactive: Always White on Blue Background
                    fontWeight: currentTab === idx ? 800 : 500,
                    px: 3,
                    py: 1,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha('#D4AF37', 0.1),
                      transform: 'translateY(-2px)'
                    },
                    '&::after': currentTab === idx ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px',
                      height: '3px',
                      borderRadius: '2px',
                      backgroundColor: '#D4AF37'
                    } : {}
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isAuthenticated ? (
                <>
                  <Tooltip title={t.tooltips.postAd}><Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/post-ad', { state: location.pathname.startsWith('/admin') ? { from: location.pathname } : undefined })}
                    sx={{
                      borderRadius: 3, px: 3, py: 1.2, fontWeight: 700,
                      bgcolor: '#D4AF37', color: '#000',
                      '&:hover': { bgcolor: '#F6E05E' }
                    }}
                  >{t.navbar.postAd}</Button></Tooltip>
                  <Box sx={{ borderLeft: `1px solid rgba(255,255,255,0.2)`, height: 32, mx: 1 }} />
                  <Tooltip title={t.tooltips.theme}><IconButton onClick={toggleTheme} sx={{ color: '#fff', border: `1px solid rgba(255,255,255,0.2)` }}>{themeMode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}</IconButton></Tooltip>
                  <Tooltip title={t.tooltips.changeLanguage}><IconButton onClick={handleLanguageMenuOpen} sx={{ color: '#fff', border: `1px solid rgba(255,255,255,0.2)` }}><Language fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title={t.tooltips.userMenu.replace('{name}', displayName)}><IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5, border: `2px solid rgba(212, 175, 55, 0.5)` }}><Avatar sx={{ width: 40, height: 40, bgcolor: '#D4AF37', color: '#000', fontWeight: 'bold' }}>{displayName.charAt(0).toUpperCase()}</Avatar></IconButton></Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title={t.tooltips.theme}><IconButton onClick={toggleTheme} sx={{ color: '#fff', border: `1px solid rgba(255,255,255,0.2)` }}>{themeMode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}</IconButton></Tooltip>
                  <Tooltip title={t.tooltips.changeLanguage}><IconButton onClick={handleLanguageMenuOpen} sx={{ color: '#fff', border: `1px solid rgba(255,255,255,0.2)` }}><Language fontSize="small" /></IconButton></Tooltip>
                  <Box sx={{ borderLeft: `1px solid rgba(255,255,255,0.2)`, height: 32, mx: 1 }} />
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/auth')}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1.2,
                      fontWeight: 700,
                      borderColor: '#fff',
                      color: '#fff',
                      borderWidth: 1,
                      '&:hover': {
                        borderWidth: 1,
                        borderColor: '#D4AF37',
                        color: '#D4AF37',
                        bgcolor: 'rgba(255,255,255,0.05)'
                      }
                    }}
                  >
                    {t.navbar.login}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/auth?mode=register')}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1.2,
                      fontWeight: 700,
                      background: '#D4AF37', // Gold button
                      color: '#000',
                      boxShadow: '0 4px 14px 0 rgba(0,0,0,0.3)',
                      '&:hover': {
                        background: '#F6E05E',
                        color: '#000'
                      }
                    }}
                  >
                    {t.navbar.register}
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>
        {renderMenu}
        {renderLanguageMenu}
        {logoutDialog}
      </>
    );
  }

  // Mobile View
  return (
    <>
      <AppBar position="fixed" elevation={4} sx={{
        bgcolor: 'transparent',
        backdropFilter: 'blur(12px)',
        background: themeMode === 'dark'
          ? 'linear-gradient(135deg, rgba(10, 25, 41, 0.95) 0%, rgba(20, 40, 60, 0.95) 100%)'
          : 'linear-gradient(135deg, #1E3A8A 0%, #0044CC 100%)',
        borderBottom: themeMode === 'dark' ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component="img" src={logo} sx={{ width: 36, height: 36, mr: 1 }} alt="Logo" />
            <Box>
              <Typography variant="h6" sx={{
                fontWeight: 900,
                lineHeight: 1,
                color: '#fff', // White text on colored background
                fontSize: '1.25rem'
              }}>
                Yesra Sew
              </Typography>
              <Typography variant="caption" sx={{
                color: '#D4AF37', // Gold subtitle
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '1px',
                mt: 0.2,
                textTransform: 'uppercase'
              }}>
                {t.navbar.logoSubtitle}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={t.tooltips.changeLanguage}><IconButton size="small" sx={{ color: '#fff' }} onClick={handleLanguageMenuOpen}><Language fontSize="small" /></IconButton></Tooltip>
            <Tooltip title={t.tooltips.theme}><IconButton onClick={toggleTheme} sx={{ color: '#fff', border: `1px solid rgba(255,255,255,0.2)` }}>{themeMode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}</IconButton></Tooltip>
            <Tooltip title={t.tooltips.userMenu.replace('{name}', displayName)}><IconButton size="small" onClick={handleProfileMenuOpen} sx={{ color: '#fff' }}>{isAuthenticated ? <Avatar sx={{ width: 28, height: 28, bgcolor: '#D4AF37', color: '#000', fontSize: '0.8rem', fontWeight: 'bold' }}>{displayName.charAt(0).toUpperCase()}</Avatar> : <AccountCircle fontSize="medium" />}</IconButton></Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
        <Box sx={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <Tooltip title={t.tooltips.postAd}><Button variant="contained" onClick={() => navigate('/post-ad', { state: location.pathname.startsWith('/admin') ? { from: location.pathname } : undefined })} sx={{ borderRadius: '50%', width: 64, height: 64, minWidth: 64, boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.5)}`, border: `4px solid ${theme.palette.background.paper}` }}><AddIcon fontSize="large" /></Button></Tooltip>
        </Box>
        <QuickActionsToolbar listing={null} user={user} />
        <Paper elevation={24} sx={{ borderRadius: '20px 20px 0 0', overflow: 'hidden', bgcolor: alpha(theme.palette.background.paper, 0.95), backdropFilter: 'blur(20px)', height: 70, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', width: '40%', justifyContent: 'space-around', pl: 2 }}><NavItem label={t.navbar.home} icon={<Home />} index={0} path="/" /><NavItem label={t.navbar.tenders} icon={<Gavel />} index={1} path="/tenders" /></Box>
          <Box sx={{ width: '20%' }} />
          <Box sx={{ display: 'flex', width: '40%', justifyContent: 'space-around', pr: 2 }}><NavItem label={t.navbar.jobs} icon={<Work />} index={2} path="/jobs" /><NavItem label={t.navbar.homes} icon={<Apartment />} index={3} path="/homes" /><NavItem label={t.navbar.cars} icon={<DirectionsCar />} index={4} path="/cars" /></Box>
        </Paper>
      </Box>
      {renderMenu}
      {renderLanguageMenu}
      {logoutDialog}
    </>
  );
};

export default Navbar;