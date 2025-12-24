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
import apiService from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
  en: {
    header: "Create Account",
    title: "Join Yesira Sew",
    subtitle: "Create your account to start posting and discovering amazing opportunities",
    individual: "Individual",
    company: "Company",
    firstName: "First Name",
    lastName: "Last Name",
    companyName: "Company Name",
    emailOrPhone: "Email or Phone Number",
    emailOrPhonePlaceholder: "Enter email or phone number",
    password: "Password",
    confirmPassword: "Confirm Password",
    agreeTo: "I agree to the ",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    and: " and ",
    createAccount: "Create Account",
    creating: "Creating Account...",
    or: "OR",
    google: "Sign up with Google",
    facebook: "Sign up with Facebook",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign In",
    successMsg: "Account created successfully! Redirecting...",
    verifyEmailMsg: "Account created! Please check your email to verify your account.",
    help: "Help Center",
    support: "Contact Support",
    validation: {
      required: "Field is required",
      firstName: "First name is required",
      lastName: "Last name is required",
      companyName: "Company name is required",
      identifierRequired: "Email or Phone number is required",
      identifierInvalid: "Please enter a valid email or phone number",
      passwordRequired: "Password is required",
      passwordMin: "Password must be at least 6 characters",
      confirmRequired: "Please confirm your password",
      passwordMismatch: "Passwords do not match",
      terms: "You must agree to the terms and conditions"
    }
  },
  am: {
    header: "አካውንት ይፍጠሩ",
    title: "ይሥራ ሰው ይቀላቀሉ",
    subtitle: "አዳዲስ እድሎችን ለማግኘት እና ለመለጠፍ አካውንትዎን ይፍጠሩ",
    individual: "ግለሰብ",
    company: "ድርጅት",
    firstName: "ስም",
    lastName: "የአባት ስም",
    companyName: "የድርጅት ስም",
    emailOrPhone: "ኢሜይል ወይም ስልክ ቁጥር",
    emailOrPhonePlaceholder: "ኢሜይል ወይም ስልክ ቁጥር ያስገቡ",
    password: "የይለፍ ቃል",
    confirmPassword: "የይለፍ ቃል ያረጋግጡ",
    agreeTo: "በ",
    terms: "አገልግሎት ውል",
    privacy: "ግላዊነት ፖሊሲ",
    and: " እና ",
    createAccount: "አካውንት ይፍጠሩ",
    creating: "በመፍጠር ላይ...",
    or: "ወይም",
    google: "በGoogle ይመዝገቡ",
    facebook: "በFacebook ይመዝገቡ",
    alreadyHaveAccount: "አካውንት አለዎት?",
    signIn: "ይግቡ",
    successMsg: "አካውንትዎ በተሳካ ሁኔታ ተፈጥሯል! በማስተላለፍ ላይ...",
    verifyEmailMsg: "አካውንት ተፈጥሯል! እባክዎ ኢሜይልዎን ያረጋግጡ።",
    help: "የእርዳታ ማዕከል",
    support: "ድጋፍ ያግኙ",
    validation: {
      required: "ይህ ቦታ ያስፈልጋል",
      firstName: "ስም ያስፈልጋል",
      lastName: "የአባት ስም ያስፈልጋል",
      companyName: "የድርጅት ስም ያስፈልጋል",
      identifierRequired: "ኢሜይል ወይም ስልክ ቁጥር ያስፈልጋል",
      identifierInvalid: "እባክዎ ትክክለኛ ኢሜይል ወይም ስልክ ቁጥር ያስገቡ",
      passwordRequired: "የይለፍ ቃል ያስፈልጋል",
      passwordMin: "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት",
      confirmRequired: "እባክዎ የይለፍ ቃልዎን ያረጋግጡ",
      passwordMismatch: "የይለፍ ቃላቶቹ አይመሳሰሉም",
      terms: "በውል እና ሁኔታዎቹ መስማማት አለብዎት"
    }
  },
  om: {
    header: "Akkaawuntii Uumi",
    title: "Yesira Sewitti Makami",
    subtitle: "Carraawwan dinqisiisoo argachuuf fi maxxansuuf akkaawuntii keessan uumaa",
    individual: "Dhuunfaa",
    company: "Dhaabbata",
    firstName: "Maqaa",
    lastName: "Maqaa Abbaa",
    companyName: "Maqaa Dhaabbataa",
    emailOrPhone: "Imeelii ykn Lakkoofsa Bilbilaa",
    emailOrPhonePlaceholder: "Imeelii ykn bilbila galchaa",
    password: "Jecha Darbii",
    confirmPassword: "Jecha Darbii Mirkaneessi",
    agreeTo: "Ani ",
    terms: "Waliigaltee Tajaajilaa",
    privacy: "Imammata Mateenyaa",
    and: " fi ",
    createAccount: "Akkaawuntii Uumi",
    creating: "Uumaa jira...",
    or: "YKN",
    google: "Google'n Galmaa'i",
    facebook: "Facebook'n Galmaa'i",
    alreadyHaveAccount: "Akkaawuntii qabduu?",
    signIn: "Seeni",
    successMsg: "Akkaawuntiin milkaa'inaan uumameera! Gara fuula biraatti darbaa jira...",
    verifyEmailMsg: "Akkaawuntiin uumameera! Maaloo imeelii keessan mirkaneeffadhaa.",
    help: "Giddugala Gargaarsaa",
    support: "Deeggarsa Argadhu",
    validation: {
      required: "Bakki kun dirqama",
      firstName: "Maqaan dirqama",
      lastName: "Maqaan abbaa dirqama",
      companyName: "Maqaan dhaabbataa dirqama",
      identifierRequired: "Imeeliin ykn Bilbilli barbaachisaadha",
      identifierInvalid: "Maaloo imeelii ykn bilbila sirrii galchaa",
      passwordRequired: "Jechi darbii barbaachisaadha",
      passwordMin: "Jechi darbii yoo xiqqaate qubee 6 qabaachuu qaba",
      confirmRequired: "Maaloo jecha darbii mirkaneessi",
      passwordMismatch: "Jechi darbii wal hin simu",
      terms: "Waliigalteewwan fudhachuu qabdu"
    }
  },
  ti: {
    header: "ኣካውንት ፍጠር",
    title: "ምስ ይስራ ሰው ተሓወሱ",
    subtitle: "ዝገርሙ ዕድላት ንምርካብን ንምልጣፍን ኣካውንትኩም ፍጠሩ",
    individual: "ውልቀሰብ",
    company: "ኩባንያ",
    firstName: "ስም",
    lastName: "ስም ኣቦ",
    companyName: "ስም ኩባንያ",
    emailOrPhone: "ኢመይል ወይ ቁጽሪ ስልኪ",
    emailOrPhonePlaceholder: "ኢመይል ወይ ቁጽሪ ስልኪ ኣእትዉ",
    password: "መሕለፊ ቃል",
    confirmPassword: "መሕለፊ ቃል ኣረጋግጽ",
    agreeTo: "ኣነ ነቲ ",
    terms: "ውዕል ኣገልግሎት",
    privacy: "ፖሊሲ ብሕትውና",
    and: "ን ",
    createAccount: "ኣካውንት ፍጠር",
    creating: "ይፈጥር ኣሎ...",
    or: "ወይ",
    google: "ብ Google ተመዝገብ",
    facebook: "ብ Facebook ተመዝገብ",
    alreadyHaveAccount: "ኣካውንት ኣለኩም?",
    signIn: "እቶ",
    successMsg: "ኣካውንት ብዓወት ተፈጢሩ! ናብ ካልእ ገጽ ይቕይር ኣሎ...",
    verifyEmailMsg: "ኣካውንት ተፈጢሩ! በጃኹም ኢመይልኩም ኣረጋግጹ።",
    help: "ማእከል ሓገዝ",
    support: "ሓገዝ ርኸብ",
    validation: {
      required: "እዚ ቦታ የድሊ",
      firstName: "ስም የድሊ",
      lastName: "ስም ኣቦ የድሊ",
      companyName: "ስም ኩባንያ የድሊ",
      identifierRequired: "ኢመይል ወይ ቁጽሪ ስልኪ የድሊ",
      identifierInvalid: "በጃኹም ቅኑዕ ኢመይል ወይ ቁጽሪ ስልኪ ኣእትዉ",
      passwordRequired: "መሕለፊ ቃል የድሊ",
      passwordMin: "መሕለፊ ቃል እንተ ወሓደ 6 ፊደላት ክኸውን ኣለዎ",
      confirmRequired: "በጃኹም መሕለፊ ቃል ኣረጋግጹ",
      passwordMismatch: "መሕለፊ ቃል ኣይጋጠምን",
      terms: "ነቲ ውዕል ክትሰማምዑሉ ኣለኩም"
    }
  }
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Language Hook
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

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
        newErrors.firstName = t.validation.firstName;
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = t.validation.lastName;
      }
    } else {
      if (!formData.companyName.trim()) {
        newErrors.companyName = t.validation.companyName;
      }
    }

    // Unified Validation
    const trimmedId = formData.identifier.trim();
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex = /^(\+251|0)?9\d{8}$/;

    if (!trimmedId) {
      newErrors.identifier = t.validation.identifierRequired;
    } else if (!emailRegex.test(trimmedId) && !phoneRegex.test(trimmedId.replace(/\s/g, ''))) {
      newErrors.identifier = t.validation.identifierInvalid;
    }

    if (!formData.password.trim()) {
      newErrors.password = t.validation.passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = t.validation.passwordMin;
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t.validation.confirmRequired;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.validation.passwordMismatch;
    }

    if (!agreeTerms) {
      newErrors.terms = t.validation.terms;
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

      const response = await apiService.register(payload);

      setLoading(false);
      setShowSuccess(true);

      if (response.requiresVerification) {
        toast.success(t.verifyEmailMsg);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        localStorage.setItem('token', response.token);
        toast.success(t.successMsg);
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
      bgcolor: '#0a192f',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a192f 0%, #172a45 100%)',
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
              {t.header}
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ pt: 10, pb: isMobile ? 2 : 4, position: 'relative', zIndex: 1 }}>
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
              backgroundColor: alpha(theme.palette.background.paper, 0.95), // Slight transparency
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
                {t.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.subtitle}
              </Typography>
            </Box>

            {/* Account Type Toggle */}
            <Box sx={{ mb: 3 }}>
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
                <ToggleButton value="individual" sx={{ flex: 1, textTransform: 'none' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Person sx={{ fontSize: 18 }} />
                    <Typography>{t.individual}</Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="company" sx={{ flex: 1, textTransform: 'none' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Business sx={{ fontSize: 18 }} />
                    <Typography>{t.company}</Typography>
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
                        autoFocus
                        fullWidth
                        label={t.firstName}
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
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
                        label={t.lastName}
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
                    autoFocus
                    fullWidth
                    label={t.companyName}
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    error={!!errors.companyName}
                    helperText={errors.companyName}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business color="action" />
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
                  label={t.emailOrPhone}
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  error={!!errors.identifier}
                  helperText={errors.identifier}
                  disabled={loading}
                  placeholder={t.emailOrPhonePlaceholder}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3 },
                  }}
                />

                <TextField
                  fullWidth
                  label={t.password}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
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
                  label={t.confirmPassword}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
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
                      <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                        {t.agreeTo}
                        <Link href="#" color="primary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                          {t.terms}
                        </Link>
                        {t.and}
                        <Link href="#" color="primary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                          {t.privacy}
                        </Link>
                      </Typography>
                    }
                  />
                  {errors.terms && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', ml: 4 }}>
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
                      {t.creating}
                    </>
                  ) : (
                    t.createAccount
                  )}
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t.or}
              </Typography>
            </Divider>

            <Stack spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                }
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: alpha(theme.palette.text.primary, 0.2),
                }}
              >
                {t.google}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<img src="/facebook-logo.svg" alt="Facebook" width={20} />}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: alpha(theme.palette.text.primary, 0.2),
                }}
              >
                {t.facebook}
              </Button>
            </Stack>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t.alreadyHaveAccount}{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  color="primary"
                  fontWeight="600"
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {t.signIn}
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
                {t.help}
              </Link>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>•</Typography>
              <Link href="#" color="text.secondary" variant="caption" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                {t.support}
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
          {t.successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterPage;
