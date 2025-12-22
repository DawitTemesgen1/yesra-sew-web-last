import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, LinearProgress } from '@mui/material';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // You'll just use the styles I add globally or inline

// Configure NProgress (optional)
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.2 });

const ProgressBar = () => {
    const location = useLocation();

    useEffect(() => {
        NProgress.start();
        const timer = setTimeout(() => {
            NProgress.done();
        }, 500); // Artificial minimum to make it visible

        return () => {
            clearTimeout(timer);
            NProgress.done();
        };
    }, [location]);

    return null; // NProgress attaches to body
};

const PageLoader = () => (
    <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 9999
    }}>
        <LinearProgress color="secondary" sx={{ height: 3 }} />
    </Box>
);

export default PageLoader;

