import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const RouteLoader = () => (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 200px)', // Occupy space but don't force full viewport height aggressively
        width: '100%'
    }}>
        <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
    </Box>
);

export default RouteLoader;
