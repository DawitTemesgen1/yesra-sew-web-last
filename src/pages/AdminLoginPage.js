import React, { useState } from 'react';
import {
    Container, Paper, Box, TextField, Button, Typography, Alert,
    InputAdornment, IconButton, Stack
} from '@mui/material';
import { Visibility, VisibilityOff, AdminPanelSettings, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import toast from 'react-hot-toast';

const BRAND_COLORS = {
    gold: '#FFD700',
    blue: '#1E3A8A',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%)'
};

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const { signIn, adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Redirect if already logged in (or after successful login)
    React.useEffect(() => {
        if (adminUser) {
            navigate('/admin-panel');
        }
    }, [adminUser, navigate]);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Perform login
            await signIn(formData.email, formData.password);

            toast.success('Welcome back, Admin!');
            // Force loading false before nav
            setLoading(false);
            navigate('/admin-panel');
        } catch (error) {
            console.error('Admin login error:', error);
            setError(error.message || 'Invalid credentials or insufficient permissions');
            toast.error(error.message || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: BRAND_COLORS.gradient,
                py: 4
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={10}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: BRAND_COLORS.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                                boxShadow: 3
                            }}
                        >
                            <AdminPanelSettings sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Admin Portal
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sign in to access the admin dashboard
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                autoFocus
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#fff',
                                        '& fieldset': {
                                            borderColor: '#1E3A8A',
                                            borderWidth: '2px',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#3B82F6',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#FFD700',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: '#1E3A8A',
                                        fontWeight: 500,
                                        fontSize: '16px',
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#1E3A8A',
                                        fontWeight: 500,
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#FFD700',
                                    }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AdminPanelSettings sx={{ color: '#1E3A8A' }} />
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#fff',
                                        '& fieldset': {
                                            borderColor: '#1E3A8A',
                                            borderWidth: '2px',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#3B82F6',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#FFD700',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: '#1E3A8A',
                                        fontWeight: 500,
                                        fontSize: '16px',
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#1E3A8A',
                                        fontWeight: 500,
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#FFD700',
                                    }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ color: '#1E3A8A' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: '#1E3A8A' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    background: BRAND_COLORS.gradient,
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    '&:hover': {
                                        background: BRAND_COLORS.blue
                                    }
                                }}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Button>

                            <Button
                                variant="text"
                                onClick={() => navigate('/')}
                                sx={{ color: BRAND_COLORS.blue }}
                            >
                                ← Back to Home
                            </Button>
                        </Stack>
                    </form>

                    {/* Security Notice */}
                    <Alert severity="info" sx={{ mt: 3 }}>
                        <Typography variant="caption">
                            🔒 This is a secure admin area. Only authorized personnel with admin privileges can access this portal.
                        </Typography>
                    </Alert>
                </Paper>
            </Container >
        </Box >
    );
};

export default AdminLoginPage;
