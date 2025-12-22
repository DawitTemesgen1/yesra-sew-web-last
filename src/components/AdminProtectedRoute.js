import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const AdminProtectedRoute = ({ children }) => {
    const { adminUser, loading } = useAdminAuth();

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    gap: 2
                }}
            >
                <CircularProgress />
                <Typography variant="body1" color="text.secondary">Verifying Admin Permissions...</Typography>
            </Box>
        );
    }

    if (!adminUser) {
        return <Navigate to="/admin-login" replace />;
    }

    return children;
};

export default AdminProtectedRoute;

