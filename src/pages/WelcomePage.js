import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, IconButton, Menu, MenuItem,
    useTheme, alpha, useMediaQuery, Container, Paper, Stack,
    GlobalStyles
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
    DarkModeOutlined, LightModeOutlined, Translate,
    WorkOutline, DirectionsCarFilledOutlined, HomeWorkOutlined, GavelOutlined,
    Login, PersonAdd, VerifiedUser, Public, Security, TrendingUp, Star
} from '@mui/icons-material';
import { useCustomTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

// --- GLOBAL ANIMATION STYLES ---
const AnimationStyles = () => (
    <GlobalStyles styles={{
        "@keyframes float": {
            "0%": { transform: "translateY(0px) rotate(0deg)" },
            "50%": { transform: "translateY(-20px) rotate(2deg)" },
            "100%": { transform: "translateY(0px) rotate(0deg)" }
        },
        "@keyframes gradient-x": {
            "0%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
            "100%": { backgroundPosition: "0% 50%" }
        },
        "@keyframes pulse-glow": {
            "0%": { boxShadow: "0 0 0 0 rgba(var(--primary-rgb), 0.4)" },
            "70%": { boxShadow: "0 0 0 10px rgba(var(--primary-rgb), 0)" },
            "100%": { boxShadow: "0 0 0 0 rgba(var(--primary-rgb), 0)" }
        }
    }} />
);

// --- PREMIUM COMPONENTS ---

const CrystalCard = ({ children, sx, animate, delay = 0 }) => (
    <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, ...animate }}
        transition={{ duration: 0.8, delay }}
        sx={{
            background: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.3 : 0.6),
            backdropFilter: 'blur(16px) saturate(180%)',
            border: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
            borderRadius: '24px',
            boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                : '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            position: 'absolute',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...sx
        }}
    >
        {children}
    </Box>
);

const WelcomePage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery('(max-height: 700px)');
    const { mode, toggleTheme } = useCustomTheme();
    const { changeLanguage, languages, currentLanguage, t } = useLanguage();
    const [langAnchorEl, setLangAnchorEl] = useState(null);

    // Mouse movement effect for desktop
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 20 - 10,
                y: (e.clientY / window.innerHeight) * 20 - 10,
            });
        };
        if (!isMobile) window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isMobile]);

    const handleLangMenuOpen = (event) => setLangAnchorEl(event.currentTarget);
    const handleLangMenuClose = () => setLangAnchorEl(null);
    const handleLanguageChange = (code) => {
        changeLanguage(code);
        handleLangMenuClose();
    };

    // --- COLOR PALETTES ---
    // Dynamic gradients based on theme
    const bgGradient = mode === 'dark'
        ? `radial-gradient(circle at 15% 50%, ${alpha(theme.palette.primary.dark, 0.4)}, transparent 25%),
           radial-gradient(circle at 85% 30%, ${alpha(theme.palette.secondary.dark, 0.4)}, transparent 25%)`
        : `radial-gradient(circle at 15% 50%, ${alpha(theme.palette.primary.light, 0.2)}, transparent 25%),
           radial-gradient(circle at 85% 30%, ${alpha(theme.palette.secondary.light, 0.2)}, transparent 25%)`;

    return (
        <Box
            sx={{
                height: '100dvh',
                width: '100vw',
                overflow: 'hidden',
                position: 'relative',
                bgcolor: 'background.default',
                color: 'text.primary',
                display: 'flex',
                flexDirection: 'column',
                perspective: '1000px'
            }}
        >
            <AnimationStyles />

            {/* --- 1. AMBIENT LIVING BACKGROUND --- */}
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                {/* Base Gradient Mesh */}
                <Box sx={{
                    position: 'absolute', inset: -50,
                    background: bgGradient,
                    filter: 'blur(60px)',
                    animation: 'float 20s ease-in-out infinite alternate',
                    opacity: 0.8
                }} />

                {/* Animated Orbs */}
                <motion.div
                    animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: 'absolute', top: '10%', left: '20%',
                        width: '40vw', height: '40vw',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
                        filter: 'blur(40px)',
                    }}
                />
                <motion.div
                    animate={{ x: [0, -80, 0], y: [0, 60, 0], scale: [1.2, 1, 1.2] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: 'absolute', bottom: '10%', right: '10%',
                        width: '35vw', height: '35vw',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 70%)`,
                        filter: 'blur(40px)',
                    }}
                />

                {/* Noise Texture for Realism */}
                <Box
                    sx={{
                        position: 'absolute', inset: 0, opacity: 0.05,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                />
            </Box>

            {/* --- 2. FLOATING CRYSTAL ELEMENTS (Fixed Background Art) --- */}
            {/* These stay out of the text area but frame the screen beautifully */}
            <CrystalCard
                sx={{ top: '15%', left: '8%', p: 1.5, borderRadius: '20px', transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)` }}
                animate={{ y: [-10, 10, -10] }}
                delay={0}
            >
                <WorkOutline sx={{ fontSize: 28, color: theme.palette.primary.main }} />
            </CrystalCard>

            <CrystalCard
                sx={{ top: '18%', right: '8%', p: 1.5, borderRadius: '50%', transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
                animate={{ y: [10, -10, 10] }}
                delay={0.5}
            >
                <DirectionsCarFilledOutlined sx={{ fontSize: 28, color: theme.palette.secondary.main }} />
            </CrystalCard>

            {!isSmallScreen && (
                <>
                    <CrystalCard
                        sx={{ bottom: '20%', left: '10%', p: 1.5, borderRadius: '50%', transform: `translate(${mousePosition.x}px, ${mousePosition.y * -1}px)` }}
                        animate={{ y: [-8, 8, -8] }}
                        delay={1}
                    >
                        <HomeWorkOutlined sx={{ fontSize: 28, color: theme.palette.secondary.main }} />
                    </CrystalCard>

                    <CrystalCard
                        sx={{ bottom: '15%', right: '10%', p: 1.5, borderRadius: '20px', transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y}px)` }}
                        animate={{ y: [8, -8, 8] }}
                        delay={1.5}
                    >
                        <GavelOutlined sx={{ fontSize: 28, color: theme.palette.primary.main }} />
                    </CrystalCard>
                </>
            )}


            {/* --- 3. TOP NAVIGATION (Glass Header) --- */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3, zIndex: 10 }}>
                <Paper
                    elevation={0}
                    component={motion.div}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    sx={{
                        display: 'flex', alignItems: 'center', gap: 1, p: 0.75, px: 2, borderRadius: '30px',
                        bgcolor: alpha(theme.palette.background.paper, 0.4),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}
                >
                    <IconButton onClick={toggleTheme} size="small" sx={{ color: 'text.primary' }}>
                        {mode === 'dark' ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
                    </IconButton>
                    <Box sx={{ width: 1, height: 16, bgcolor: 'divider' }} />
                    <Button
                        onClick={handleLangMenuOpen}
                        startIcon={<Translate fontSize="small" />}
                        sx={{ color: 'text.primary', textTransform: 'none', fontWeight: 700, minWidth: 'auto', px: 1 }}
                    >
                        {currentLanguage.code.toUpperCase()}
                    </Button>
                </Paper>

                <Menu
                    anchorEl={langAnchorEl}
                    open={Boolean(langAnchorEl)}
                    onClose={handleLangMenuClose}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            mt: 1.5, borderRadius: 3,
                            minWidth: 150,
                            bgcolor: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                        }
                    }}
                >
                    {languages.map((lang) => (
                        <MenuItem key={lang.code} onClick={() => handleLanguageChange(lang.code)} sx={{ borderRadius: 2, mx: 1, my: 0.5, fontSize: '0.9rem', fontWeight: 500 }}>
                            {lang.nativeName}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>


            {/* --- 4. CENTER STAGE (Hero Content) --- */}
            <Container
                maxWidth="sm"
                sx={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    zIndex: 5, position: 'relative', px: 3
                }}
            >
                <Stack spacing={isSmallScreen ? 3 : 5} alignItems="center" width="100%">

                    {/* A. Jewel Logo Container */}
                    <Box sx={{ position: 'relative' }}>
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                        >
                            <Box
                                sx={{
                                    width: { xs: 100, md: 140 }, height: { xs: 100, md: 140 },
                                    borderRadius: '35px',
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                                    backdropFilter: 'blur(20px)',
                                    border: `1px solid ${alpha(theme.palette.common.white, 0.4)}`,
                                    boxShadow: `0 20px 50px ${alpha(theme.palette.common.black, 0.1)}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    p: 3,
                                    transform: 'rotate(-5deg)'
                                }}
                            >
                                <img src="/assets/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' }} />
                            </Box>
                        </motion.div>
                        {/* Decorative glow behind logo */}
                        <Box sx={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            width: '120%', height: '120%', borderRadius: '50%',
                            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.4)} 0%, transparent 70%)`,
                            filter: 'blur(30px)', zIndex: -1
                        }} />
                    </Box>

                    {/* B. Typography Stack */}
                    <Box sx={{ textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <Typography
                                variant={isMobile ? "h4" : "h2"}
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.1,
                                    mb: 1.5,
                                    background: `-webkit-linear-gradient(45deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {t('welcome.title')}
                            </Typography>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: '100%' }}
                            transition={{ delay: 0.6, duration: 1 }}
                        >
                            <Box sx={{ height: '1px', width: '60px', bgcolor: 'divider', mx: 'auto', mb: 2 }} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                        >
                            <Typography
                                variant="button"
                                sx={{
                                    color: 'text.secondary',
                                    letterSpacing: '3px',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    opacity: 0.8
                                }}
                            >
                                {t('welcome.subtitle')}
                            </Typography>
                        </motion.div>
                    </Box>

                    {/* C. Primary Actions */}
                    <Stack spacing={2} width="100%" maxWidth={400}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1, type: "spring", stiffness: 100 }}
                        >
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/login')}
                                startIcon={<Login />}
                                sx={{
                                    py: 1.8,
                                    borderRadius: '16px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                    backgroundSize: '200% 100%',
                                    animation: 'gradient-x 5s ease infinite',
                                    boxShadow: `0 10px 30px -5px ${alpha(theme.palette.primary.main, 0.4)}`,
                                    '&:hover': {
                                        boxShadow: `0 15px 35px -5px ${alpha(theme.palette.primary.main, 0.5)}`,
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {t('welcome.signIn')}
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.1, type: "spring", stiffness: 100 }}
                        >
                            <Button
                                fullWidth
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/register')}
                                startIcon={<PersonAdd />}
                                sx={{
                                    py: 1.8,
                                    borderRadius: '16px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    borderWidth: '2px',
                                    borderColor: alpha(theme.palette.divider, 0.2),
                                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                                    backdropFilter: 'blur(10px)',
                                    color: 'text.primary',
                                    '&:hover': {
                                        borderWidth: '2px',
                                        borderColor: theme.palette.primary.main,
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {t('welcome.signUp')}
                            </Button>
                        </motion.div>
                    </Stack>

                    {/* D. Trust Footer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                    >
                        <Stack direction="row" spacing={3} sx={{ opacity: 0.6, mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <VerifiedUser sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="caption" fontWeight="600">Verified</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Public sx={{ fontSize: 16, color: 'info.main' }} />
                                <Typography variant="caption" fontWeight="600">Global</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Security sx={{ fontSize: 16, color: 'warning.main' }} />
                                <Typography variant="caption" fontWeight="600">Secure</Typography>
                            </Box>
                        </Stack>
                    </motion.div>

                </Stack>
            </Container>
        </Box>
    );
};

export default WelcomePage;
