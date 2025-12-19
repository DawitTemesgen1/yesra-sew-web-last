import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Slide, Link, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLanguage } from '../contexts/LanguageContext';

const CookieConsent = () => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const { t } = useLanguage();

    useEffect(() => {
        // Check if user has already explicitly consented or rejected
        const consent = localStorage.getItem('yesrasew_cookie_consent');
        if (!consent) {
            // Delay slightly for better UX
            const timer = setTimeout(() => setOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('yesrasew_cookie_consent', 'accepted');
        setOpen(false);
        // Initialize analytics/tracking scripts here if needed
    };

    const handleDecline = () => {
        localStorage.setItem('yesrasew_cookie_consent', 'declined');
        setOpen(false);
    };

    return (
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
            <Paper
                elevation={6}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    p: 3,
                    m: { xs: 0, md: 2 },
                    borderRadius: { xs: 0, md: 2 },
                    bgcolor: 'background.paper',
                    borderTop: `4px solid ${theme.palette.primary.main}`,
                    maxWidth: { md: 600 },
                    mx: { md: 'auto' }
                }}
            >
                <Box>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        {t('cookie.title') || 'We value your privacy'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {t('cookie.description') || 'We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.'}
                        {' '}
                        <Link href="/privacy" color="primary" underline="hover">
                            {t('cookie.learnMore') || 'Read Statement'}
                        </Link>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleDecline}
                            size="small"
                        >
                            {t('cookie.decline') || 'Decline'}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAccept}
                            disableElevation
                        >
                            {t('cookie.accept') || 'Accept All'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Slide>
    );
};

export default CookieConsent;
