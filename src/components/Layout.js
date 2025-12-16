// import React, { useState } from 'react';
// import { Outlet, useNavigate, useLocation } from 'react-router-dom';
// import {
//   AppBar, Toolbar, Typography, Button, IconButton, Box, Container,
//   BottomNavigation, BottomNavigationAction, Paper, useMediaQuery, useTheme, Badge, Grid, Link, Menu, MenuItem
// } from '@mui/material';
// import {
//   Home, Gavel, Work, Apartment, DirectionsCar, Add, 
//   Notifications, AccountCircle, Language, Facebook, Twitter, Instagram, Email, Phone, LocationOn, Dashboard, Logout, Settings
// } from '@mui/icons-material';
// import { useAuth } from '../context/AuthContext';

// // --- Navbar Component ---
// const Navbar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const { isAuthenticated, user, logout } = useAuth();
//   const [anchorEl, setAnchorEl] = useState(null);

//   const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
//   const handleMenuClose = () => setAnchorEl(null);

//   const handleLogout = () => {
//     logout();
//     handleMenuClose();
//     navigate('/');
//   };

//   // Map paths to index
//   const getValue = () => {
//     const path = location.pathname;
//     if (path === '/') return 0;
//     if (path === '/tenders') return 1;
//     if (path === '/jobs') return 2;
//     if (path === '/homes') return 3;
//     if (path === '/cars') return 4;
//     return 0;
//   };

//   const handleNav = (path) => navigate(path);

//   if (!isMobile) {
//     // Desktop AppBar
//     return (
//       <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #eee', backdropFilter: 'blur(20px)', backgroundColor: 'rgba(255,255,255,0.9)' }}>
//         <Container maxWidth="xl">
//           <Toolbar sx={{ height: 80 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleNav('/')}>
//                {/* Logo Placeholder */}
//               <Box sx={{ width: 40, height: 40, bgcolor: 'primary.main', borderRadius: 2, mr: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                 <Work sx={{ color: 'white' }} />
//               </Box>
//               <Box>
//                 <Typography variant="h5" color="primary" sx={{ fontWeight: 800, lineHeight: 1 }}>YesiraSew</Typography>
//                 <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>Quality Gold</Typography>
//               </Box>
//             </Box>

//             <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
//               {['Home', 'Tenders', 'Jobs', 'Homes', 'Cars'].map((label, idx) => {
//                  const paths = ['/', '/tenders', '/jobs', '/homes', '/cars'];
//                  const isActive = getValue() === idx;
//                  return (
//                    <Button 
//                     key={label}
//                     onClick={() => handleNav(paths[idx])}
//                     color={isActive ? "primary" : "inherit"}
//                     sx={{ borderBottom: isActive ? '2px solid' : 'none', borderRadius: 0, px: 2 }}
//                    >
//                      {label}
//                    </Button>
//                  )
//               })}
//             </Box>

//             <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
//                <Button variant="contained" startIcon={<Add />} sx={{ boxShadow: 2 }}>Post Ad</Button>
//                <IconButton><Language /></IconButton>
//                <IconButton><Badge badgeContent={2} color="error"><Notifications /></Badge></IconButton>
//                {isAuthenticated ? (
//                  <>
//                    <Button variant="outlined" startIcon={<AccountCircle />} onClick={handleMenuOpen}>Account</Button>
//                    <Menu
//                      anchorEl={anchorEl}
//                      open={Boolean(anchorEl)}
//                      onClose={handleMenuClose}
//                      PaperProps={{ sx: { borderRadius: 2, mt: 1 } }}
//                    >
//                      <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}>
//                        <Dashboard sx={{ mr: 1 }} /> Dashboard
//                      </MenuItem>
//                      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
//                        <AccountCircle sx={{ mr: 1 }} /> Profile
//                      </MenuItem>
//                      <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
//                        <Settings sx={{ mr: 1 }} /> Settings
//                      </MenuItem>
//                      <MenuItem onClick={handleLogout}>
//                        <Logout sx={{ mr: 1 }} /> Logout
//                      </MenuItem>
//                    </Menu>
//                  </>
//                ) : (
//                  <Button variant="outlined" startIcon={<AccountCircle />} onClick={() => navigate('/auth')}>Login</Button>
//                )}
//             </Box>
//           </Toolbar>
//         </Container>
//       </AppBar>
//     );
//   }

//   // Mobile Bottom Nav - ORIGINAL DESIGN
//   return (
//     <>
//       <AppBar position="fixed" elevation={0} sx={{
//         bgcolor: 'transparent',
//         backdropFilter: 'blur(10px)',
//         background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.0))',
//         color: 'text.primary',
//         border: 'none',
//         pointerEvents: 'none'
//       }}>
//         <Toolbar sx={{ justifyContent: 'space-between', pointerEvents: 'auto', px: 1 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center' }}>
//             {/* Logo Placeholder */}
//             <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1, mr: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//               <Work sx={{ color: 'white', fontSize: 20 }} />
//             </Box>
//             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
//               <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.1rem', lineHeight: 1 }}>YesiraSew</Typography>
//               <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.6rem', letterSpacing: '0.5px', fontStyle: 'italic', mt: -0.5 }}>Purified Gold</Typography>
//             </Box>
//           </Box>

//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//             <IconButton size="small" color="inherit">
//               {/* Theme toggle placeholder - you can add actual toggle later */}
//               <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'primary.main' }} />
//             </IconButton>
//           </Box>
//         </Toolbar>
//       </AppBar>
      
//       {/* Bottom Bar Spacing */}
//       <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
//         <Paper elevation={24} sx={{
//           borderRadius: '20px 20px 0 0',
//           overflow: 'hidden',
//           bgcolor: 'rgba(255,255,255,0.95)',
//           backdropFilter: 'blur(20px)',
//           borderTop: '1px solid rgba(0,0,0,0.1)',
//           height: 70,
//           display: 'flex',
//           alignItems: 'center',
//           position: 'relative'
//         }}>
//           <Box sx={{ display: 'flex', width: '40%', justifyContent: 'space-around', pl: 2 }}>
//             <Box onClick={() => handleNav('/')} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/' ? 'primary.main' : 'text.secondary' }}>
//               <Home sx={{ fontSize: 24 }} />
//               <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.5 }}>Home</Typography>
//             </Box>
//             <Box onClick={() => handleNav('/tenders')} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/tenders' ? 'primary.main' : 'text.secondary' }}>
//               <Gavel sx={{ fontSize: 24 }} />
//               <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.5 }}>Tenders</Typography>
//             </Box>
//           </Box>

//           {/* Center space for floating button */}
//           <Box sx={{ width: '20%', display: 'flex', justifyContent: 'center' }} />

//           <Box sx={{ display: 'flex', width: '40%', justifyContent: 'space-around', pr: 2 }}>
//             <Box onClick={() => handleNav('/jobs')} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/jobs' ? 'primary.main' : 'text.secondary' }}>
//               <Work sx={{ fontSize: 24 }} />
//               <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.5 }}>Jobs</Typography>
//             </Box>
//             <Box onClick={() => handleNav('/homes')} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/homes' ? 'primary.main' : 'text.secondary' }}>
//               <Apartment sx={{ fontSize: 24 }} />
//               <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.5 }}>Homes</Typography>
//             </Box>
//             <Box onClick={() => handleNav('/cars')} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/cars' ? 'primary.main' : 'text.secondary' }}>
//               <DirectionsCar sx={{ fontSize: 24 }} />
//               <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.5 }}>Cars</Typography>
//             </Box>
//           </Box>
          
//           {/* Floating Action Button */}
//           <Box sx={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
//             <Button
//               variant="contained"
//               onClick={() => navigate('/listings/new')}
//               sx={{ 
//                 borderRadius: '50%', 
//                 width: 64, 
//                 height: 64, 
//                 minWidth: 64,
//                 boxShadow: '0 8px 24px rgba(181, 142, 42, 0.5)',
//                 border: '4px solid white',
//                 '&:hover': { transform: 'scale(1.05)' }
//               }}
//             >
//               <Add fontSize="large" />
//             </Button>
//           </Box>
//         </Paper>
//       </Box>
//     </>
//   );
// };

// // --- Footer Component ---
// const Footer = () => (
//   <Box sx={{ bgcolor: '#fff', pt: 8, pb: 12, borderTop: '1px solid #eee', mt: 'auto' }}>
//     <Container maxWidth="lg">
//       <Grid container spacing={4}>
//         <Grid item xs={12} md={4}>
//           <Typography variant="h6" color="primary" gutterBottom fontWeight="bold">YesiraSew</Typography>
//           <Typography variant="body2" color="text.secondary" paragraph>
//             Ethiopia's most trusted classifieds platform. Connecting people with opportunities.
//           </Typography>
//           <Box>
//             <IconButton color="primary"><Facebook /></IconButton>
//             <IconButton color="primary"><Twitter /></IconButton>
//             <IconButton color="primary"><Instagram /></IconButton>
//           </Box>
//         </Grid>
//         <Grid item xs={6} md={4}>
//           <Typography variant="h6" gutterBottom fontWeight="bold">Quick Links</Typography>
//           <Box display="flex" flexDirection="column" gap={1}>
//             <Link href="#" underline="none" color="text.secondary">About Us</Link>
//             <Link href="#" underline="none" color="text.secondary">Terms & Conditions</Link>
//             <Link href="#" underline="none" color="text.secondary">Privacy Policy</Link>
//           </Box>
//         </Grid>
//         <Grid item xs={6} md={4}>
//           <Typography variant="h6" gutterBottom fontWeight="bold">Contact</Typography>
//           <Box display="flex" gap={1} mb={1} alignItems="center">
//             <Email color="primary" fontSize="small" /> <Typography variant="body2">info@yesirasew.com</Typography>
//           </Box>
//           <Box display="flex" gap={1} mb={1} alignItems="center">
//             <Phone color="primary" fontSize="small" /> <Typography variant="body2">+251 911 234 567</Typography>
//           </Box>
//           <Box display="flex" gap={1} alignItems="center">
//             <LocationOn color="primary" fontSize="small" /> <Typography variant="body2">Addis Ababa, Ethiopia</Typography>
//           </Box>
//         </Grid>
//       </Grid>
//     </Container>
//   </Box>
// );

// const Layout = () => {
//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
//       <Navbar />
//       <Box component="main" sx={{ flexGrow: 1 }}>
//         <Outlet />
//       </Box>
//       <Footer />
//     </Box>
//   );
// };

// export default Layout;