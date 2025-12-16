import React, { useState } from 'react';
import {
  Container, Paper, TextField, Button, Typography, Box, Tabs, Tab,
  InputAdornment, IconButton, ToggleButtonGroup, ToggleButton, Stack, Divider, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Phone, Lock, Person, Business, ArrowBack, Google } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import authService from '../services/supabase-auth'; // Ensure this path is correct
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --- i18n Translation Configuration ---
const resources = {
  en: {
    translation: {
      "auth": {
        "header": {
          "welcome": "Welcome Back!",
          "loginSubtitle": "Sign in to continue your journey.",
          "register": "Create Your Account",
          "registerSubtitle": "Join our community of innovators.",
          "reset": "Reset Password",
          "resetSubtitle": "We'll help you get back on track."
        },
        "tabs": {
          "phone": "Phone",
          "email": "Email"
        },
        "toggles": {
          "accountType": "I am a...",
          "individual": "Professional",
          "company": "Company"
        },
        "form": {
          "firstName": "First Name",
          "lastName": "Last Name",
          "companyName": "Company Name",
          "phone": "Phone Number",
          "email": "Email Address",
          "otp": "Verification Code",
          "newPassword": "New Password",
          "password": "Password",
          "confirmPassword": "Confirm Password"
        },
        "buttons": {
          "login": "Sign In",
          "create": "Create Account",
          "verify": "Verify & Create",
          "reset": "Reset Password",
          "sendCode": "Send Recovery Code",
          "forgotPassword": "Forgot Password?",
          "backToLogin": "Back to Sign In",
          "google": "Continue with Google",
          "register": "Sign Up",
          "alreadyHaveAccount": "Already have an account?",
          "dontHaveAccount": "Don't have an account?"
        },
        "messages": {
          "welcomeBack": "Welcome back!",
          "codeSent": "Verification code sent!",
          "verifying": "Verifying your code...",
          "accountCreated": "Account created successfully! Welcome aboard.",
          "resetCodeSent": "Reset code sent! Check your messages.",
          "passwordResetSuccess": "Password reset successful! Please log in.",
          "emailResetSent": "Check your email for a password reset link.",
          "phoneRequired": "Phone number is required.",
          "emailRequired": "Email is required.",
          "passwordRequired": "Password is required.",
          "passwordShort": "Password must be at least 6 characters.",
          "passwordsNoMatch": "Passwords do not match.",
          "nameRequired": "First and last name are required.",
          "otpRequired": "Please enter the verification code.",
          "sendingCode": "Sending verification code...",
          "creatingAccount": "Creating your account..."
        }
      }
    }
  },
  am: {
    translation: {
      "auth": {
        "header": {
          "welcome": "እንኳን ደህና መጡ!",
          "loginSubtitle": "ጉዞዎን ለመቀጠል ይግቡ።",
          "register": "አካውንትዎን ይፍጠሩ",
          "registerSubtitle": "የፈጣሪዎች ማህበረሰባችንን ይቀላቀሉ።",
          "reset": "የይለፍ ቃል ዳግም ያስጀምሩ",
          "resetSubtitle": "ወደ መስመር እንዲመለሱ እንረዳዎታለን።"
        },
        "tabs": { "phone": "ስልክ", "email": "ኢሜይል" },
        "toggles": { "accountType": "እኔ...", "individual": "ባለሙያ", "company": "ኩባንያ" },
        "form": {
          "firstName": "የመጀመሪያ ስም", "lastName": "የአያት ስም", "companyName": "የድርጅት ስም", "phone": "ስልክ ቁጥር",
          "email": "የኢሜይል አድራሻ", "otp": "የማረጋገጫ ኮድ", "newPassword": "አዲስ የይለፍ ቃል", "password": "የይለፍ ቃል",
          "confirmPassword": "የይለፍ ቃል ያረጋግጡ"
        },
        "buttons": {
          "login": "ይግቡ", "create": "አካውንት ይፍጠሩ", "verify": "አረጋግጥ እና ፍጠር", "reset": "የይለፍ ቃል ዳግም ያስጀምሩ",
          "sendCode": "የመልሶ ማግኛ ኮድ ላክ", "forgotPassword": "የይለፍ ቃል ረስተዋል?", "backToLogin": "ወደ መግቢያ ተመለስ",
          "google": "በGoogle ይቀጥሉ", "register": "ይመዝገቡ", "alreadyHaveAccount": "አካውንት አለዎት?", "dontHaveAccount": "አካውንት የለዎትም?"
        },
        "messages": {
          "welcomeBack": "እንኳን ደህና መለሱ!", "codeSent": "የማረጋገጫ ኮድ ተልኳል!", "verifying": "ኮድዎን በማረጋገጥ ላይ...",
          "accountCreated": "አካውንት በተሳካ ሁኔታ ተፈጥሯል! እንኳን ደህና መጡ።",
          "resetCodeSent": "የዳግም ማስጀመሪያ ኮድ ተልኳል! መልዕክቶችዎን ይመልከቱ።",
          "passwordResetSuccess": "የይለፍ ቃል በተሳካ ሁኔታ ዳግም ተጀምሯል! እባክዎ ይግቡ።",
          "emailResetSent": "የይለፍ ቃል ዳግም ማስጀመሪያ ሊንክ ለማግኘት ኢሜይልዎን ይመልከቱ።",
          "phoneRequired": "ስልክ ቁጥር ያስፈልጋል።", "emailRequired": "ኢሜይል ያስፈልጋል።", "passwordRequired": "የይለፍ ቃል ያስፈልጋል።",
          "passwordShort": "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት።", "passwordsNoMatch": "የይለፍ ቃላት አይዛመዱም።",
          "nameRequired": "የመጀመሪያ እና የአያት ስም ያስፈልጋሉ።", "otpRequired": "እባክዎ የማረጋገጫ ኮዱን ያስገቡ።",
          "sendingCode": "የማረጋገጫ ኮድ በመላክ ላይ...", "creatingAccount": "አካውንትዎን በመፍጠር ላይ..."
        }
      }
    }
  },
  om: {
    translation: {
      "auth": {
        "header": {
          "welcome": "Baga Nagaan Dhuftan!", "loginSubtitle": "Imala keessan itti fufuuf seenaa.",
          "register": "Akkaawuntii Keessan Uumaa", "registerSubtitle": "Hawaasa kalaqaa keenyatti makamaa.",
          "reset": "Jecha Darbii Haaromsi", "resetSubtitle": "Akka deebitan isin gargaarra."
        },
        "tabs": { "phone": "Bilbila", "email": "Imeelii" },
        "toggles": { "accountType": "Ani...", "individual": "Ogeessa", "company": "Kampaanii" },
        "form": {
          "firstName": "Maqaa Jalqabaa", "lastName": "Maqaa Abbaa", "companyName": "Maqaa Dhaabbataa", "phone": "Lakkofsa Bilbilaa",
          "email": "Teessoo Imeelii", "otp": "Koodii Mirkaneessaa", "newPassword": "Jecha Darbii Haaraa", "password": "Jecha Darbii",
          "confirmPassword": "Jecha Darbii Mirkaneessi"
        },
        "buttons": {
          "login": "Seen", "create": "Akkaawuntii Uumi", "verify": "Mirkaneessi & Uumi", "reset": "Jecha Darbii Haaromsi",
          "sendCode": "Koodii Deebisii Ergi", "forgotPassword": "Jecha darbii irraanfattee?", "backToLogin": "Gara Seenuutti Deebi'i",
          "google": "Google waliin itti fufi", "register": "Galmaa'i", "alreadyHaveAccount": "Durayyuu akkaawuntii qabdaa?", "dontHaveAccount": "Akkaawuntii hin qabduu?"
        },
        "messages": {
          "welcomeBack": "Baga nagaan deebitan!", "codeSent": "Koodiin mirkaneessaa ergameera!", "verifying": "Koodii keessan mirkaneessaa...",
          "accountCreated": "Akkaawuntiin milkaa'inaan uumameera! Baga nagaan dhuftan.",
          "resetCodeSent": "Koodiin haaromsaa ergameera! Ergaa keessan ilaalaa.",
          "passwordResetSuccess": "Jechi darbii milkaa'inaan haaromfameera! Maaloo seenaa.",
          "emailResetSent": "Liinkii haaromsa jecha darbii argachuuf iimeelii keessan ilaalaa.",
          "phoneRequired": "Lakkoofsi bilbilaa barbaachisaadha.", "emailRequired": "Iimeeliin barbaachisaadha.", "passwordRequired": "Jechi darbiin barbaachisaadha.",
          "passwordShort": "Jechi darbiin yoo xiqqaate qubee 6 qabaachuu qaba.", "passwordsNoMatch": "Jechoonni darbii wal hin siman.",
          "nameRequired": "Maqaan jalqabaa fi abbaa barbaachisaadha.", "otpRequired": "Maaloo koodii mirkaneessaa galchaa.",
          "sendingCode": "Koodii mirkaneessaa ergaa...", "creatingAccount": "Akkaawuntii keessan uumaa..."
        }
      }
    }
  },
  ti: {
    translation: {
      "auth": {
        "header": {
          "welcome": "እንቋዕ ብደሓን መጻእካ!", "loginSubtitle": "ጉዕዞኻ ንምቅጻል እተው።", "register": "ኣካውንትካ ፍጠር",
          "registerSubtitle": "ማሕበረሰብና ናይ ፈጠርቲ ተጸንበር።", "reset": "ፓስዎርድ ዳግም ኣተዓራሪ", "resetSubtitle": "ንኽትምለስ ክንሕግዘካ ኢና።"
        },
        "tabs": { "phone": "ስልኪ", "email": "ኢመይል" },
        "toggles": { "accountType": "ኣነ...", "individual": "ፕሮፌሽናል", "company": "ኩባንያ" },
        "form": {
          "firstName": "መጀመርታ ስም", "lastName": "ስም ኣቦ", "companyName": "ስም ኩባንያ", "phone": "ቁጽሪ ስልኪ",
          "email": "ኣድራሻ ኢመይል", "otp": "ናይ ምርግጋጽ ኮድ", "newPassword": "ሓድሽ ፓስዎርድ", "password": "ፓስዎርድ",
          "confirmPassword": "ፓስዎርድ ኣረጋግጽ"
        },
        "buttons": {
          "login": "እተው", "create": "ኣካውንት ፍጠር", "verify": "ኣረጋግጽን ፍጠርን", "reset": "ፓስዎርድ ዳግም ኣተዓራሪ",
          "sendCode": "ናይ ምምላስ ኮድ ስደድ", "forgotPassword": "ፓስዎርድ ረሲዕካዮ?", "backToLogin": "ናብ መእተዊ ተመለስ",
          "google": "ብGoogle ቀጽል", "register": "ተመዝገብ", "alreadyHaveAccount": "ድሮ ኣካውንት ኣለካ?", "dontHaveAccount": "ኣካውንት የብልካን?"
        },
        "messages": {
          "welcomeBack": "እንቋዕ ብደሓን ተመለስካ!", "codeSent": "ናይ ምርግጋጽ ኮድ ተላኢኹ!", "verifying": "ኮድካ ምርግጋጽ...",
          "accountCreated": "ኣካውንት ብዓወት ተፈጢሩ! እንቋዕ ብደሓን መጻእካ።", "resetCodeSent": "ናይ ዳግም ምትዕርራይ ኮድ ተላኢኹ! መልእኽትታትካ ርአ።",
          "passwordResetSuccess": "ፓስዎርድ ብዓወት ዳግም ተተዓራርዩ! በጃኻ እተው።",
          "emailResetSent": "ናይ ፓስዎርድ ዳግም ምትዕርራይ ሊንክ ንምርካብ ኢመይልካ ርአ።",
          "phoneRequired": "ቁጽሪ ስልኪ የድሊ።", "emailRequired": "ኢመይል የድሊ።", "passwordRequired": "ፓስዎርድ የድሊ።",
          "passwordShort": "ፓስዎርድ እንተወሓደ 6 ፊደላት ክኸውን ኣለዎ።", "passwordsNoMatch": "ፓስዎርድታት ኣይመሳሰሉን።",
          "nameRequired": "መጀመርታ ስምን ስም ኣቦን የድልዩ።", "otpRequired": "በጃኻ ናይ ምርግጋጽ ኮድ ኣእቱ።",
          "sendingCode": "ናይ ምርግጋጽ ኮድ ምልኣኽ...", "creatingAccount": "ኣካውንትካ ምፍጣር..."
        }
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources, lng: "en", fallbackLng: "en", interpolation: { escapeValue: false }
});

// --- React Component ---
const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/profile";
  const { t } = useTranslation();

  const urlMode = new URLSearchParams(location.search).get('mode');
  const [authMode, setAuthMode] = useState(urlMode === 'register' ? 'register' : 'login');
  const [method, setMethod] = useState('phone');
  const [accountType, setAccountType] = useState('individual');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', companyName: '', email: '', phone: '', password: '', confirmPassword: '', otp: ''
  });
  const [tempRegData, setTempRegData] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const switchMode = (mode) => {
    setAuthMode(mode);
    setOtpSent(false);
    setFormData({ firstName: '', lastName: '', companyName: '', email: '', phone: '', password: '', confirmPassword: '', otp: '' });
  };

  const handlePhoneAuth = async () => {
    try {
      if (authMode === 'login') {
        if (!formData.phone || !formData.password) throw new Error(t('auth.messages.phoneRequired'));
        const result = await authService.loginWithPhone(formData.phone, formData.password);
        if (result.success) {
          toast.success(t('auth.messages.welcomeBack'));
          navigate(from, { replace: true });
        } else throw new Error(result.error);
      } else if (authMode === 'register') {
        if (!otpSent) {
          if (!formData.firstName || !formData.lastName) throw new Error(t('auth.messages.nameRequired'));
          if (!formData.phone) throw new Error(t('auth.messages.phoneRequired'));
          if (!formData.password) throw new Error(t('auth.messages.passwordRequired'));
          if (formData.password.length < 6) throw new Error(t('auth.messages.passwordShort'));
          if (formData.password !== formData.confirmPassword) throw new Error(t('auth.messages.passwordsNoMatch'));

          toast.loading(t('auth.messages.sendingCode'), { id: 'register' });
          const result = await authService.registerWithPhone({
            phone: formData.phone, password: formData.password, firstName: formData.firstName,
            lastName: formData.lastName, accountType, companyName: accountType === 'company' ? formData.companyName : null
          });
          toast.dismiss('register');

          if (result.success) {
            setOtpSent(true);
            setTempRegData(result.tempData);
            toast.success(t('auth.messages.codeSent'));
            if (result.devOtp) toast.success(`DEV OTP: ${result.devOtp}`, { duration: 10000 });
          } else throw new Error(result.error);
        } else {
          if (!formData.otp) throw new Error(t('auth.messages.otpRequired'));
          toast.loading(t('auth.messages.verifying'), { id: 'verify' });
          const result = await authService.verifyPhoneOtp(formData.phone, formData.otp, tempRegData);
          toast.dismiss('verify');
          if (result.success) {
            toast.success(t('auth.messages.accountCreated'));
            navigate(from, { replace: true });
          } else throw new Error(result.error);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (method === 'phone') {
      await handlePhoneAuth();
    } // Add handleEmailAuth logic here if needed
    setLoading(false);
  };

  const getHeader = () => {
    switch (authMode) {
      case 'register': return { title: t('auth.header.register'), subtitle: t('auth.header.registerSubtitle') };
      case 'forgot': return { title: t('auth.header.reset'), subtitle: t('auth.header.resetSubtitle') };
      default: return { title: t('auth.header.welcome'), subtitle: t('auth.header.loginSubtitle') };
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>{getHeader().title}</Typography>
            <Typography variant="body2" color="text.secondary">{getHeader().subtitle}</Typography>
          </Box>

          {authMode !== 'forgot' && (
            <Tabs value={method} onChange={(e, v) => setMethod(v)} centered sx={{ mb: 3 }}>
              <Tab label={t('auth.tabs.phone')} value="phone" icon={<Phone />} iconPosition="start" />
              <Tab label={t('auth.tabs.email')} value="email" icon={<Email />} iconPosition="start" />
            </Tabs>
          )}

          {authMode === 'register' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>{t('auth.toggles.accountType')}</Typography>
              <ToggleButtonGroup value={accountType} exclusive onChange={(e, v) => v && setAccountType(v)} fullWidth>
                <ToggleButton value="individual"><Person sx={{ mr: 1 }} />{t('auth.toggles.individual')}</ToggleButton>
                <ToggleButton value="company"><Business sx={{ mr: 1 }} />{t('auth.toggles.company')}</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {authMode === 'register' && !otpSent && (
                <>
                  <TextField fullWidth label={t('auth.form.firstName')} name="firstName" required value={formData.firstName} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }} />
                  <TextField fullWidth label={t('auth.form.lastName')} name="lastName" required value={formData.lastName} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }} />
                  {accountType === 'company' && (<TextField fullWidth label={t('auth.form.companyName')} name="companyName" required value={formData.companyName} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Business color="action" /></InputAdornment> }} />)}
                </>
              )}
              {method === 'phone' ? (<TextField fullWidth label={t('auth.form.phone')} name="phone" placeholder="0911223344" required disabled={otpSent} value={formData.phone} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment> }} />) : (<TextField fullWidth label={t('auth.form.email')} name="email" type="email" required disabled={otpSent} value={formData.email} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }} />)}
              {((authMode === 'forgot' || authMode === 'register') && otpSent) && (<TextField fullWidth label={t('auth.form.otp')} name="otp" placeholder="123456" required value={formData.otp} onChange={handleChange} autoFocus />)}
              {((authMode === 'login') || (authMode === 'register' && !otpSent) || (authMode === 'forgot' && otpSent)) && (<TextField fullWidth label={authMode === 'forgot' ? t('auth.form.newPassword') : t('auth.form.password')} name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>, endAdornment: (<IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>) }} />)}
              {authMode === 'register' && !otpSent && (<TextField fullWidth label={t('auth.form.confirmPassword')} name="confirmPassword" type={showPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment> }} />)}
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mt: 2, py: 1.5 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : authMode === 'login' ? t('auth.buttons.login') : authMode === 'register' ? (otpSent ? t('auth.buttons.verify') : t('auth.buttons.create')) : otpSent ? t('auth.buttons.reset') : t('auth.buttons.sendCode')}
              </Button>
              {authMode === 'login' && (<Button onClick={() => switchMode('forgot')} sx={{ textTransform: 'none' }}>{t('auth.buttons.forgotPassword')}</Button>)}
              {authMode === 'forgot' && (<Button onClick={() => switchMode('login')} startIcon={<ArrowBack />} sx={{ textTransform: 'none' }}>{t('auth.buttons.backToLogin')}</Button>)}
            </Stack>
          </form>

          {authMode !== 'forgot' && (
            <>
              <Divider sx={{ my: 3 }}>OR</Divider>
              <Button variant="outlined" fullWidth startIcon={<Google />} onClick={() => { }} disabled={loading} sx={{ py: 1.5 }}>{t('auth.buttons.google')}</Button>
            </>
          )}

          {authMode !== 'forgot' && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2">
                {authMode === 'login' ? t('auth.buttons.dontHaveAccount') : t('auth.buttons.alreadyHaveAccount')}
                <Button onClick={() => switchMode(authMode === 'login' ? 'register' : 'login')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                  {authMode === 'login' ? t('auth.buttons.register') : t('auth.buttons.login')}
                </Button>
              </Typography>
            </Box>
          )}

        </Paper>
      </motion.div>
    </Container>
  );
};

export default AuthPage;