import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import HomePage from '../pages/HomePage';

const RootRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    // Optional: Add a small delay or state check to prevent flash if loading is instant.
    // However, AuthContext's loading state should be sufficient.

    if (loading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    return <HomePage />;
};

export default RootRoute;
