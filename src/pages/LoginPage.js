import React, { useState } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Box, Link, Divider,
  CircularProgress, useTheme, Stack, IconButton, InputAdornment,
  Alert, Snackbar, ToggleButton, ToggleButtonGroup, FormControlLabel, Checkbox
} from '@mui/material';
import {
  Visibility, VisibilityOff, Email, Lock, ArrowBack, CheckCircle, Phone
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../contexts/LanguageContext'; // 1. IMPORT THE LANGUAGE HOOK

// --- Embedded Multilingual Translations ---
const translations = {
  en: {
    header: "Welcome Back",
    title: "Sign In",
    subtitle: "Access your account and continue your journey with Yesira Sew.",
    loginMethod: "Choose your login method",
    email: "Email",
    phone: "Phone",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email",
    phoneLabel: "Phone Number",
    phonePlaceholder: "+251 911 234 567",
    phoneHelper: "Format: +251 9XX XXX XXX",
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
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email address",
      phoneRequired: "Phone number is required",
      phoneInvalid: "Please enter a valid Ethiopian phone number",
      passwordRequired: "Password is required",
      passwordMin: "Password must be at least 6 characters"
    }
  },
  am: {
    header: "እንኳን ደህና መጡ",
    title: "ይግቡ",
    subtitle: "ወደ አካውንትዎ በመግባት ጉዞዎን ከይሥራ ሰው ጋር ይቀጥሉ።",
    loginMethod: "የመግቢያ ዘዴዎን ይምረጡ",
    email: "ኢሜይል",
    phone: "ስልክ",
    emailLabel: "የኢሜይል አድራሻ",
    emailPlaceholder: "ኢሜይልዎን ያስገቡ",
    phoneLabel: "ስልክ ቁጥር",
    phonePlaceholder: "+251 911 234 567",
    phoneHelper: "ቅርጸት: +251 9XX XXX XXX",
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
      emailRequired: "ኢሜይል ያስፈልጋል",
      emailInvalid: "እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ",
      phoneRequired: "ስልክ ቁጥር ያስፈልጋል",
      phoneInvalid: "እባክዎ ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ",
      passwordRequired: "የይለፍ ቃል ያስፈልጋል",
      passwordMin: "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት"
    }
  },
  om: {
    header: "Baga Nagaan Dhuftan",
    title: "Seeni",
    subtitle: "Akkaawuntii keessan seenuun imala keessan Yesira Sew wajjin itti fufaa.",
    loginMethod: "Mala ittiin seentu filadhu",
    email: "Imeelii",
    phone: "Bilbila",
    emailLabel: "Teessoo Imeelii",
    emailPlaceholder: "Imeelii keessan galchaa",
    phoneLabel: "Lakkoofsa Bilbilaa",
    phonePlaceholder: "+251 911 234 567",
    phoneHelper: "Akkaataa: +251 9XX XXX XXX",
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
      emailRequired: "Imeeliin barbaachisaadha",
      emailInvalid: "Maaloo teessoo imeelii sirrii galchaa",
      phoneRequired: "Lakkoofsi bilbilaa barbaachisaadha",
      phoneInvalid: "Maaloo lakkoofsa bilbilaa Itoophiyaa kan sirrii ta'e galchaa",
      passwordRequired: "Jechi darbii barbaachisaadha",
      passwordMin: "Jechi darbii yoo xiqqaate qubee 6 qabaachuu qaba"
    }
  },
  ti: {
    header: "እንቋዕ ብደሓን መጻእኩም",
    title: "እቶ",
    subtitle: "ናብ ሕሳብኩም ብምእታው ጉዕዞኹም ምስ ይስራ ሰው ቀጽሉ።",
    loginMethod: "ኣገባብ ምእታው ምረጽ",
    email: "ኢመይል",
    phone: "ስልኪ",
    emailLabel: "ኣድራሻ ኢመይል",
    emailPlaceholder: "ኢመይልኩም ኣእትዉ",
    phoneLabel: "ቁጽሪ ስልኪ",
    phonePlaceholder: "+251 911 234 567",
    phoneHelper: "ኣገባብ: +251 9XX XXX XXX",
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
      emailRequired: "ኢመይል የድሊ",
      emailInvalid: "በጃኹም ቅኑዕ ኣድራሻ ኢመይል ኣእትዉ",
      phoneRequired: "ቁጽሪ ስልኪ የድሊ",
      phoneInvalid: "በጃኹም ቅኑዕ ቁጽሪ ስልኪ ኢትዮጵያ ኣእትዉ",
      passwordRequired: "መሕለፊ ቃል የድሊ",
      passwordMin: "መሕለፊ ቃል እንተ ወሓደ 6 ፊደላት ክኸውን ኣለዎ"
    }
  }
};


const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, isLoading } = useAuth();

  // 2. GET THE CURRENT LANGUAGE AND TRANSLATION OBJECT FROM CONTEXT
  const { language } = useLanguage();
  const t = translations[language] || translations.en; // Fallback to English

  const [loginType, setLoginType] = useState('email');
  const [formData, setFormData] = useState({ email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (loginType === 'email') {
      if (!formData.email.trim()) newErrors.email = t.validation.emailRequired;
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t.validation.emailInvalid;
    } else {
      if (!formData.phone.trim()) newErrors.phone = t.validation.phoneRequired;
      else if (!/^\+251\s?9\d{2}\s?\d{6}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = t.validation.phoneInvalid;
    }
    if (!formData.password.trim()) newErrors.password = t.validation.passwordRequired;
    else if (formData.password.length < 6) newErrors.password = t.validation.passwordMin;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const loginData = { email: formData.email, password: formData.password };
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

            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>{t.loginMethod}</Typography>
              <ToggleButtonGroup value={loginType} exclusive onChange={(e, newType) => { if (newType !== null) { setLoginType(newType); setErrors({}); } }} sx={{ width: '100%', '& .MuiToggleButton-root': { py: 1.5, flex: 1, borderRadius: 2, '&.Mui-selected': { borderColor: 'primary.main' } } }}>
                <ToggleButton value="email"><Stack direction="row" spacing={1} alignItems="center"><Email fontSize="small" /><Typography>{t.email}</Typography></Stack></ToggleButton>
                <ToggleButton value="phone"><Stack direction="row" spacing={1} alignItems="center"><Phone fontSize="small" /><Typography>{t.phone}</Typography></Stack></ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {loginType === 'email' ? (
                  <TextField fullWidth label={t.emailLabel} type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={!!errors.email} helperText={errors.email} disabled={isLoading} placeholder={t.emailPlaceholder} InputProps={{ startAdornment: (<InputAdornment position="start"><Email color="action" /></InputAdornment>) }} />
                ) : (
                  <TextField fullWidth label={t.phoneLabel} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} error={!!errors.phone} helperText={errors.phone || t.phoneHelper} disabled={isLoading} placeholder={t.phonePlaceholder} InputProps={{ startAdornment: (<InputAdornment position="start"><Phone color="action" /></InputAdornment>) }} />
                )}
                <TextField fullWidth label={t.passwordLabel} type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} error={!!errors.password} helperText={errors.password} disabled={isLoading} placeholder={t.passwordPlaceholder} InputProps={{ startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={isLoading}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
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
              <Button fullWidth variant="outlined" size="large" startIcon={<img src="/google-logo.svg" alt="Google" width={20} />} sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', borderColor: 'divider' }}>{t.google}</Button>
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
    </Box>
  );
};

export default LoginPage;