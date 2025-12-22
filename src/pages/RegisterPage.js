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
import apiService from '../services/apiService'; // Ensure this is imported

const RegisterPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Removed registerType state (email/phone toggle)
  const [accountType, setAccountType] = useState('individual');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    identifier: '', // Unified field for Email OR Phone
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

    // Unified Validation
    const trimmedId = formData.identifier.trim();
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex = /^(\+251|0)?9\d{8}$/;

    if (!trimmedId) {
      newErrors.identifier = 'Email or Phone number is required';
    } else if (!emailRegex.test(trimmedId) && !phoneRegex.test(trimmedId.replace(/\s/g, ''))) {
      newErrors.identifier = 'Please enter a valid email or phone number';
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
      // Determine separate fields for backend
      const isEmail = /\S+@\S+\.\S+/.test(formData.identifier);

      const payload = {
        ...formData,
        account_type: accountType,
        // Map identifier to correct field
        email: isEmail ? formData.identifier : undefined,
        phone: !isEmail ? formData.identifier : undefined
      };

      // Remove generic identifier from payload
      delete payload.identifier;

      // Call the API register (assuming apiService is globally available or imported)
      // Note: In the read file, apiService was used but I didn't see the import. 
      // I added the import line at the top just in case.
      const response = await apiService.register(payload);

      setLoading(false);
      setShowSuccess(true);

      if (response.requiresVerification) {
        toast.success('Account created! Please check your email to verify your account.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
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

  // Google Icon SVG
  const GoogleIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

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
                          '& .MuiOutlinedInput-root': { borderRadius: 3 },
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
                          '& .MuiOutlinedInput-root': { borderRadius: 3 },
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
                      '& .MuiOutlinedInput-root': { borderRadius: 3 },
                    }}
                  />
                )}

                {/* Combined Identifier Field */}
                <TextField
                  fullWidth
                  label="Email or Phone Number"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  error={!!errors.identifier}
                  helperText={errors.identifier}
                  disabled={loading}
                  placeholder="Enter email or phone number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3 },
                  }}
                />

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
                    '& .MuiOutlinedInput-root': { borderRadius: 3 },
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
                    '& .MuiOutlinedInput-root': { borderRadius: 3 },
                  }}
                />

                {/* Terms Checkbox */}
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
                        <Link href="#" color="primary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                          Terms of Service
                        </Link>
                        {' '}and{' '}
                        <Link href="#" color="primary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
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
                startIcon={GoogleIcon}
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
              <Link href="#" color="text.secondary" variant="caption" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Help Center
              </Link>
              <Typography variant="caption" color="text.secondary">•</Typography>
              <Link href="#" color="text.secondary" variant="caption" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
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