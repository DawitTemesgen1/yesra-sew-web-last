import React, { useState } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Box, Link, Divider,
  CircularProgress, useTheme, Stack, IconButton, InputAdornment,
  Alert, Snackbar, FormControlLabel, Checkbox
} from '@mui/material';
import {
  Visibility, VisibilityOff, Email, Lock, ArrowBack, CheckCircle, Phone, Person
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

// --- Embedded Multilingual Translations ---
const translations = {
  en: {
    header: "Welcome Back",
    title: "Sign In",
    subtitle: "Access your account and continue your journey with Yesira Sew.",
    loginMethod: "Enter your details to login", // Updated text
    emailOrPhoneLabel: "Email or Phone Number", // Combined label
    emailOrPhonePlaceholder: "Enter email or phone number", // Combined placeholder
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    signInButton: "Sign In",
    signingInButton: "Signing In...",
    or: "OR",
    google: "Continue with Google",
    facebook: "Continue with Facebook",
    noAccount: "Don't have an account?",
    createAccount: "Create Account",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    help: "Help Center",
    successMsg: "Login successful! Redirecting...",
    errorMsg: "Login failed. Please check your credentials and try again.",
    validation: {
      required: "Email or Phone number is required",
      invalid: "Please enter a valid email or phone number",
      passwordRequired: "Password is required",
      passwordMin: "Password must be at least 6 characters"
    }
  },
  am: {
    header: "እንኳን ደህና መጡ",
    title: "ይግቡ",
    subtitle: "ወደ አካውንትዎ በመግባት ጉዞዎን ከይሥራ ሰው ጋር ይቀጥሉ።",
    loginMethod: "ለመግባት መረጃዎን ያስገቡ",
    emailOrPhoneLabel: "ኢሜይል ወይም ስልክ ቁጥር",
    emailOrPhonePlaceholder: "ኢሜይል ወይም ስልክ ቁጥር ያስገቡ",
    passwordLabel: "የይለፍ ቃል",
    passwordPlaceholder: "የይለፍ ቃልዎን ያስገቡ",
    rememberMe: "አስታውሰኝ",
    forgotPassword: "የይለፍ ቃል ረሱ?",
    signInButton: "ይግቡ",
    signingInButton: "በመግባት ላይ...",
    or: "ወይም",
    google: "በGoogle ይቀጥሉ",
    facebook: "በFacebook ይቀጥሉ",
    noAccount: "አካውንት የለዎትም?",
    createAccount: "አካውንት ይፍጠሩ",
    terms: "የአገልግሎት ውል",
    privacy: "የግላዊነት ፖሊሲ",
    help: "የእርዳታ ማዕከል",
    successMsg: "በተሳካ ሁኔታ ገብተዋል! በማስተላለፍ ላይ...",
    errorMsg: "መግባት አልተሳካም። እባክዎ መረጃዎን ያረጋግጡ እና እንደገና ይሞክሩ።",
    validation: {
      required: "ኢሜይል ወይም ስልክ ቁጥር ያስፈልጋል",
      invalid: "እባክዎ ትክክለኛ ኢሜይል ወይም ስልክ ቁጥር ያስገቡ",
      passwordRequired: "የይለፍ ቃል ያስፈልጋል",
      passwordMin: "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት"
    }
  },
  om: {
    header: "Baga Nagaan Dhuftan",
    title: "Seeni",
    subtitle: "Akkaawuntii keessan seenuun imala keessan Yesira Sew wajjin itti fufaa.",
    loginMethod: "Odeeffannoo keessan galchaa",
    emailOrPhoneLabel: "Imeelii ykn Lakkoofsa Bilbilaa",
    emailOrPhonePlaceholder: "Imeelii ykn bilbila galchaa",
    passwordLabel: "Jecha Darbii",
    passwordPlaceholder: "Jecha darbii keessan galchaa",
    rememberMe: "Na Yaadachiisi",
    forgotPassword: "Jecha darbii irraanfatame?",
    signInButton: "Seeni",
    signingInButton: "Seenamaa Jira...",
    or: "YKN",
    google: "Google'n Itti Fufi",
    facebook: "Facebook'n Itti Fufi",
    noAccount: "Akkaawuntii hin qabduu?",
    createAccount: "Akkaawuntii Uumi",
    terms: "Imammata Tajaajilaa",
    privacy: "Imammata Mateenyaa",
    help: "Giddugala Gargaarsaa",
    successMsg: "Milkaa'inaan seentaniittu! Gara fuula biraatti darbaa jira...",
    errorMsg: "Seenuun hin milkoofne. Maaloo eenyummaa keessan mirkaneessuun irra deebi'aa yaalaa.",
    validation: {
      required: "Imeeliin ykn Bilbilli barbaachisaadha",
      invalid: "Maaloo imeelii ykn bilbila sirrii galchaa",
      passwordRequired: "Jechi darbii barbaachisaadha",
      passwordMin: "Jechi darbii yoo xiqqaate qubee 6 qabaachuu qaba"
    }
  },
  ti: {
    header: "እንቋዕ ብደሓን መጻእኩም",
    title: "እቶ",
    subtitle: "ናብ ሕሳብኩም ብምእታው ጉዕዞኹም ምስ ይስራ ሰው ቀጽሉ።",
    loginMethod: "ዝርዝር ሓበሬታኹም ኣእትዉ",
    emailOrPhoneLabel: "ኢመይል ወይ ቁጽሪ ስልኪ",
    emailOrPhonePlaceholder: "ኢመይል ወይ ቁጽሪ ስልኪ ኣእትዉ",
    passwordLabel: "መሕለፊ ቃል",
    passwordPlaceholder: "መሕለፊ ቃልኩም ኣእትዉ",
    rememberMe: "ዘክረኒ",
    forgotPassword: "መሕለፊ ቃል ረሲዕኩም?",
    signInButton: "እቶ",
    signingInButton: "ይእቶ ኣሎ...",
    or: "ወይ",
    google: "ብ Google ቀጽል",
    facebook: "ብ Facebook ቀጽል",
    noAccount: "ኣካውንት የብልኩምን?",
    createAccount: "ኣካውንት ፍጠር",
    terms: "ውዕል ኣገልግሎት",
    privacy: "ፖሊሲ ብሕትውና",
    help: "ማእከል ሓገዝ",
    successMsg: "ብዓወት ኣቲኹም! ናብ ካልእ ገጽ ይቕይር ኣሎ...",
    errorMsg: "ምእታው ኣይተኻእለን። በጃኹም መንነትኩም ኣረጋጊጽኩም እንደገና ፈትኑ።",
    validation: {
      required: "ኢመይል ወይ ቁጽሪ ስልኪ የድሊ",
      invalid: "በጃኹም ቅኑዕ ኢመይል ወይ ቁጽሪ ስልኪ ኣእትዉ",
      passwordRequired: "መሕለፊ ቃል የድሊ",
      passwordMin: "መሕለፊ ቃል እንተ ወሓደ 6 ፊደላት ክኸውን ኣለዎ"
    }
  }
};


const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, isLoading } = useAuth();

  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  // Single combined field state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation Logic
  const validateForm = () => {
    const newErrors = {};
    const trimmedId = identifier.trim();

    // Regex Definitions
    const emailRegex = /\S+@\S+\.\S+/;
    // Flexible phone regex: allows +251..., 09..., 9...
    const phoneRegex = /^(\+251|0)?9\d{8}$/;

    if (!trimmedId) {
      newErrors.identifier = t.validation.required;
    } else if (!emailRegex.test(trimmedId) && !phoneRegex.test(trimmedId.replace(/\s/g, ''))) {
      // If it matches neither email nor phone
      newErrors.identifier = t.validation.invalid;
    }

    if (!password.trim()) newErrors.password = t.validation.passwordRequired;
    else if (password.length < 6) newErrors.password = t.validation.passwordMin;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  React.useEffect(() => {
    window.handleAppGoogleLogin = async (idToken, accessToken) => {
      try {
        const result = await login({
          googleToken: idToken,
          isGoogle: true
        });

        if (result.success) {
          setShowSuccess(true);
          toast.success(t.successMsg);
          setTimeout(() => navigate('/'), 1500);
        } else {
          toast.error(result.error || t.errorMsg);
        }
      } catch (error) {
        toast.error("Google Login Failed: " + error.message);
      }
    };
    return () => {
      delete window.handleAppGoogleLogin;
    }
  }, [login, navigate, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Determine if identifier is email or phone for the backend
      const isEmail = /\S+@\S+\.\S+/.test(identifier);
      const loginData = {
        password: password,
        // Most generic backends accept 'email' or 'phone' fields.
        // If your backend supports a generic 'identifier' field, use that.
        // Assuming we pass it based on detection:
        ...(isEmail ? { email: identifier } : { phone: identifier })
      };

      const result = await login(loginData);

      if (result.success) {
        setShowSuccess(true);
        toast.success(t.successMsg);
        setTimeout(() => navigate('/'), 1500);
      } else {
        toast.error(result.error || t.errorMsg);
      }
    } catch (error) {
      toast.error(error.message || t.errorMsg);
    }
  };

  return (
    <Box sx={{
      bgcolor: '#0a192f',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a192f 0%, #172a45 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Header */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, bgcolor: 'primary.main', color: 'white', py: 2, boxShadow: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate('/')} sx={{ color: 'white', mr: 2 }}><ArrowBack /></IconButton>
            <Typography variant="h6" fontWeight="bold">{t.header}</Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ pt: 8, pb: 4, position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`, backdropFilter: 'blur(10px)', backgroundColor: alpha(theme.palette.background.paper, 0.95), border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ width: 80, height: 80, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}` }}>
                <Typography variant="h4" color="white" fontWeight="bold">YS</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>{t.title}</Typography>
              <Typography variant="body2" color="text.secondary">{t.subtitle}</Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>

                {/* Combined Identifier Field */}
                <TextField
                  fullWidth
                  label={t.emailOrPhoneLabel}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  error={!!errors.identifier}
                  helperText={errors.identifier}
                  disabled={isLoading}
                  placeholder={t.emailOrPhonePlaceholder}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField fullWidth label={t.passwordLabel} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} error={!!errors.password} helperText={errors.password} disabled={isLoading} placeholder={t.passwordPlaceholder} InputProps={{ startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={isLoading}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <FormControlLabel control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" disabled={isLoading} size="small" />} label={<Typography variant="body2">{t.rememberMe}</Typography>} />
                  <Link component={RouterLink} to="/forgot-password" variant="body2" color="primary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{t.forgotPassword}</Link>
                </Box>

                <Button type="submit" fullWidth variant="contained" size="large" disabled={isLoading} sx={{ py: 1.5, borderRadius: 2, fontSize: '1rem', transition: 'all 0.3s ease' }}>
                  {isLoading ? (<><CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />{t.signingInButton}</>) : (t.signInButton)}
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 3 }}><Typography variant="body2" color="text.secondary">{t.or}</Typography></Divider>
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => {
                  if (window.GoogleSignInApp) {
                    window.GoogleSignInApp.postMessage('signIn');
                  } else {
                    login({ isWebOAuth: true });
                  }
                }}
                startIcon={
                  // Original Google Logo SVG
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                }
                sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', borderColor: 'divider' }}
              >
                {t.google}
              </Button>
              <Button fullWidth variant="outlined" size="large" startIcon={<img src="/facebook-logo.svg" alt="Facebook" width={20} />} sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', borderColor: 'divider' }}>{t.facebook}</Button>
            </Stack>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t.noAccount}{' '}
                <Link component={RouterLink} to="/register" color="primary" fontWeight="600" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{t.createAccount}</Link>
              </Typography>
            </Box>
          </Paper>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Stack direction="row" spacing={{ xs: 1, sm: 2 }} justifyContent="center" alignItems="center" flexWrap="wrap">
              <Link href="#" color="text.secondary" variant="caption" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{t.terms}</Link>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>•</Typography>
              <Link href="#" color="text.secondary" variant="caption" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{t.privacy}</Link>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>•</Typography>
              <Link href="#" color="text.secondary" variant="caption" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{t.help}</Link>
            </Stack>
          </Box>
        </motion.div>
      </Container>

      <Snackbar open={showSuccess} autoHideDuration={3000} onClose={() => setShowSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setShowSuccess(false)} severity="success" icon={<CheckCircle fontSize="inherit" />} sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>{t.successMsg}</Alert>
      </Snackbar>
    </Box >
  );
};

export default LoginPage;