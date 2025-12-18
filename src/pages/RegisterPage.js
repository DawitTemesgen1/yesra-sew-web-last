import React, { useState } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Box, Link, Divider,
  CircularProgress, useTheme, useMediaQuery, Stack, IconButton, InputAdornment,
  Alert, Snackbar, FormControlLabel, Checkbox, Grid, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  Visibility, VisibilityOff, Email, Lock, Person, ArrowBack, CheckCircle, Phone,
  Business
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { alpha } from '@mui/material/styles';

const RegisterPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [registerType, setRegisterType] = useState('email');
  const [accountType, setAccountType] = useState('individual');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (accountType === 'individual') {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
    } else {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
    }

    if (registerType === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+251\s?9\d{2}\s?\d{6}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid Ethiopian phone number';
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Call the updated API register
      const response = await apiService.register({
        ...formData,
        account_type: accountType
      });

      setLoading(false);
      setShowSuccess(true); // Keep your success snackbar

      // PRODUCTION CHECK:
      if (response.requiresVerification) {
        // Show specific toast/alert for email verification
        toast.success('Account created! Please check your email to verify your account.');

        // Redirect to login page instead of dashboard
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Fallback if auto-confirm is somehow on
        localStorage.setItem('token', response.token);
        toast.success('Account created successfully!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }

    } catch (error) {
      setLoading(false);
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <Box sx={{
      bgcolor: '#f8fafc',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      pb: isMobile ? 10 : 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Header */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        bgcolor: 'primary.main',
        color: 'white',
        py: 2,
        boxShadow: 2
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate('/')}
              sx={{ color: 'white', mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">
              Create Account
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ pt: 8, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
              backdropFilter: 'blur(10px)',
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            {/* Logo/Brand Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
              }}>
                <Typography variant="h4" color="white" fontWeight="bold">
                  YS
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Join Yesira Sew
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your account to start posting and discovering amazing opportunities
              </Typography>
            </Box>

            {/* Register Type Toggle */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Register with
              </Typography>
              <ToggleButtonGroup
                value={registerType}
                exclusive
                onChange={(e, newType) => {
                  if (newType !== null) {
                    setRegisterType(newType);
                    setErrors({});
                  }
                }}
                sx={{ width: '100%' }}
              >
                <ToggleButton value="email" sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Email sx={{ fontSize: 18 }} />
                    <Typography>Email</Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="phone" sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Phone sx={{ fontSize: 18 }} />
                    <Typography>Phone</Typography>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Account Type Toggle */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Account type
              </Typography>
              <ToggleButtonGroup
                value={accountType}
                exclusive
                onChange={(e, newType) => {
                  if (newType !== null) {
                    setAccountType(newType);
                    setErrors({});
                  }
                }}
                sx={{ width: '100%' }}
              >
                <ToggleButton value="individual" sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Person sx={{ fontSize: 18 }} />
                    <Typography>Individual</Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="company" sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Business sx={{ fontSize: 18 }} />
                    <Typography>Company</Typography>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Name Fields or Company Name */}
                {accountType === 'individual' ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    error={!!errors.companyName}
                    helperText={errors.companyName}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      },
                    }}
                  />
                )}

                {registerType === 'email' ? (
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      },
                    }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={!!errors.phone}
                    helperText={errors.phone || 'Format: +251 9XX XXX XXX'}
                    disabled={loading}
                    placeholder="+251 911 234 567"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      },
                    }}
                  />
                )}

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          disabled={loading}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    },
                  }}
                />

                {/* Terms and Conditions */}
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        color="primary"
                        disabled={loading}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the{' '}
                        <Link
                          href="#"
                          color="primary"
                          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          Terms of Service
                        </Link>
                        {' '}and{' '}
                        <Link
                          href="#"
                          color="primary"
                          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          Privacy Policy
                        </Link>
                      </Typography>
                    }
                  />
                  {errors.terms && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errors.terms}
                    </Typography>
                  )}
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    },
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Stack spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={
                  <Box sx={{ width: 20, height: 20, bgcolor: '#4285F4', borderRadius: '50%' }} />
                }
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: alpha(theme.palette.text.primary, 0.2),
                }}
              >
                Sign up with Google
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={
                  <Box sx={{ width: 20, height: 20, bgcolor: '#1877F2', borderRadius: '50%' }} />
                }
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: alpha(theme.palette.text.primary, 0.2),
                }}
              >
                Sign up with Facebook
              </Button>
            </Stack>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  color="primary"
                  fontWeight="600"
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Paper>

          {/* Footer Links */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <Link
                href="#"
                color="text.secondary"
                variant="caption"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Help Center
              </Link>
              <Typography variant="caption" color="text.secondary">•</Typography>
              <Link
                href="#"
                color="text.secondary"
                variant="caption"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Contact Support
              </Link>
            </Stack>
          </Box>
        </motion.div>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          icon={<CheckCircle fontSize="inherit" />}
          sx={{ width: '100%' }}
        >
          Account created successfully! Redirecting to home...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterPage;