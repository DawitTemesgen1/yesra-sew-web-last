import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import AdminDashboard from './AdminDashboard';
import AdminDashboardMobile from './AdminDashboardMobile';

/**
 * Responsive Admin Dashboard Wrapper
 * - Desktop (>= 960px): Uses original AdminDashboard with full features
 * - Mobile (< 960px): Uses new AdminDashboardMobile with mobile-app design
 */
const ResponsiveAdminDashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 960px

    // Use mobile design for screens < 960px, desktop design for larger screens
    return isMobile ? <AdminDashboardMobile /> : <AdminDashboard />;
};

export default ResponsiveAdminDashboard;

