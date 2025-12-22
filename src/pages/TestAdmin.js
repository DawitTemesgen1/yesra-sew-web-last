import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  Container, Alert, AlertTitle, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, AdminPanelSettings } from '@mui/icons-material';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simple admin authentication (in production, this should connect to a real backend)
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        toast.success('Login successful!');
        // Store admin session (in production, use proper JWT tokens)
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminUser', credentials.username);
        navigate('/admin-panel/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
        toast.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}>
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <AdminPanelSettings sx={{ 
                fontSize: 48, 
                color: 'primary.main', 
                mb: 2 
              }} />
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Admin Panel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your credentials to access the admin dashboard
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <AlertTitle>Login Error</AlertTitle>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                disabled={loading}
                autoComplete="username"
              />
              
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                required
                disabled={loading}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
                startIcon={<Lock />}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                <strong>Demo Credentials:</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Username: <code>admin</code>
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Password: <code>admin123</code>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default AdminLogin;

