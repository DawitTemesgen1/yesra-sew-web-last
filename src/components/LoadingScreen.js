import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import logo from '../assets/logo.png';

const LoadingScreen = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                bgcolor: 'background.default',
                gap: 2
            }}
        >
            <Box
                component="img"
                src={logo}
                sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'contain',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                        '0%': { transform: 'scale(1)', opacity: 1 },
                        '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                        '100%': { transform: 'scale(1)', opacity: 1 },
                    }
                }}
                alt="Yesra Sew Solution"
            />
            <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 2 }}>
                LOADING...
            </Typography>
        </Box>
    );
};

export default LoadingScreen;

