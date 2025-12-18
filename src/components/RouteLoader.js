import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const RouteLoader = () => (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        py: 10 // Comfortable padding instead of fixed height
    }}>
        <CircularProgress size={32} thickness={5} sx={{ color: 'primary.main', opacity: 0.8 }} />
    </Box>
);

export default RouteLoader;
