import React, { useState, useEffect } from 'react';
import {
    Container, Paper, TextField, Button, Typography, Box, Tabs, Tab,
    InputAdornment, IconButton, ToggleButtonGroup, ToggleButton, Stack,
    Divider, CircularProgress, LinearProgress, Checkbox, FormControlLabel,
    Fade, Slide, Chip, Alert, useTheme, Menu, MenuItem
} from '@mui/material';
import {
    Visibility, VisibilityOff, Email, Phone, Lock, Person, Business,
    ArrowBack, Google, CheckCircle, Error as ErrorIcon, Timer,
    Refresh, Security, Language, DarkMode, LightMode
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import authService from '../services/supabase-auth';
import { useLanguage } from '../contexts/LanguageContext';
import { useCustomTheme } from '../contexts/ThemeContext';
// import SEO from '../components/SEO'; // Removed due to potential circular dependency
import { Helmet } from 'react-helmet-async';

const translations = {
    en: {
        firstNameRequired: "First name is required",
        lastNameRequired: "Last name is required",
        companyNameRequired: "Company name is required",
        phoneRequired: "Phone number is required",
        phoneInvalid: "Phone number must be 9 or 10 digits",
        emailRequired: "Email is required",
        emailInvalid: "Invalid email format",
        passwordRequired: "Password is required",
        passwordLength: "Password must be at least 6 characters",
        passwordsMismatch: "Passwords do not match",
        enterCode: "Enter verification code",
        enterNewPassword: "Enter new password",
        otpResent: "OTP resent!",
        otpResentEmail: "OTP resent to your email!",
        failedResend: "Failed to resend OTP",
        welcomeBack: "Welcome back!",
        sendingCode: "Sending verification code...",
        codeSent: "Verification code sent!",
        accountCreated: "Account created successfully!",
        sendingResetCode: "Sending reset code...",
        resetCodeSentSMS: "Reset code sent! Check your SMS",
        resettingPassword: "Resetting password...",
        passwordResetSuccess: "Password reset successful! Logging you in...",
        codeSentEmail: "Verification code sent to your email!",
        resetCodeSentEmail: "Reset code sent! Check your email",
        welcomeTitle: "Welcome Back",
        loginSubtitle: "Login to your account",
        createAccountTitle: "Create Account",
        joinSubtitle: "Join YesraSew today",
        resetPasswordTitle: "Reset Password",
        resetSubtitle: "Reset your password",
        stepDetails: "1. Details",
        stepVerify: "2. Verify",
        phone: "Phone",
        email: "Email",
        accountType: "Account Type",
        individual: "Individual",
        company: "Company",
        firstName: "First Name",
        lastName: "Last Name",
        companyName: "Company Name",
        phoneNumber: "Phone Number",
        emailAddress: "Email Address",
        verificationCode: "Verification Code",
        password: "Password",
        newPassword: "New Password",
        confirmPassword: "Confirm Password",
        resendCode: "Resend Code",
        login: "Login",
        verifyCreate: "Verify & Create",
        createAccount: "Create Account",
        sendResetCode: "Send Reset Code",
        forgotPassword: "Forgot Password?",
        backToLogin: "Back to Login",
        continueGoogle: "Continue with Google",
        register: "Register",
        codeExpiresIn: "Code expires in",
        codeExpired: "Code expired",
        weak: "Weak",
        medium: "Medium",
        strong: "Strong",
        rememberMe: "Remember me",
        or: "OR",
        dontHaveAccount: "Don't have an account?",
        alreadyHaveAccount: "Already have an account?"
    },
    am: {
        firstNameRequired: "የመጀመሪያ ስም ያስፈልጋል",
        lastNameRequired: "የአባት ስም ያስፈልጋል",
        companyNameRequired: "የድርጅት ስም ያስፈልጋል",
        phoneRequired: "ስልክ ቁጥር ያስፈልጋል",
        phoneInvalid: "ስልክ ቁጥር 9 ወይም 10 አሃዞች መሆን አለበት",
        emailRequired: "ኢሜይል ያስፈልጋል",
        emailInvalid: "ትክክለኛ ያልሆነ ኢሜይል",
        passwordRequired: "የይለፍ ቃል ያስፈልጋል",
        passwordLength: "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት",
        passwordsMismatch: "የይለፍ ቃሎች አይዛመዱም",
        enterCode: "የማረጋገጫ ኮድ ያስገቡ",
        enterNewPassword: "አዲስ የይለፍ ቃል ያስገቡ",
        otpResent: "ኮዱ እንደገና ተልኳል!",
        otpResentEmail: "ኮዱ ወደ ኢሜይልዎ እንደገና ተልኳል!",
        failedResend: "ኮዱን እንደገና መላክ አልተቻለም",
        welcomeBack: "እንኳን ደህና መጡ!",
        sendingCode: "የማረጋገጫ ኮድ በመላክ ላይ...",
        codeSent: "የማረጋገጫ ኮድ ተልኳል!",
        accountCreated: "መለያው በተሳካ ሁኔታ ተፈጥሯል!",
        sendingResetCode: "የመልሶ ማግኛ ኮድ በመላክ ላይ...",
        resetCodeSentSMS: "የመልሶ ማግኛ ኮድ ተልኳል! ኤስኤምኤስዎን ያረጋግጡ",
        resettingPassword: "የይለፍ ቃል ዳግም በማዘጋጀት ላይ...",
        passwordResetSuccess: "የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል! በመግባት ላይ...",
        codeSentEmail: "የማረጋገጫ ኮድ ወደ ኢሜይልዎ ተልኳል!",
        resetCodeSentEmail: "የመልሶ ማግኛ ኮድ ተልኳል! ኢሜይልዎን ያረጋግጡ",
        welcomeTitle: "እንኳን ደህና መጡ",
        loginSubtitle: "ወደ መለያዎ ይግቡ",
        createAccountTitle: "መለያ ይፍጠሩ",
        joinSubtitle: "ዛሬውኑ ይቀላቀሉን",
        resetPasswordTitle: "የይለፍ ቃል ዳግም አዘጋጅ",
        resetSubtitle: "የይለፍ ቃልዎን ዳግም ያዘጋጁ",
        stepDetails: "1. ዝርዝሮች",
        stepVerify: "2. ማረጋገጫ",
        phone: "ስልክ",
        email: "ኢሜይል",
        accountType: "የመለያ አይነት",
        individual: "ግለሰብ",
        company: "ድርጅት",
        firstName: "የመጀመሪያ ስም",
        lastName: "የአባት ስም",
        companyName: "የድርጅት ስም",
        phoneNumber: "ስልክ ቁጥር",
        emailAddress: "ኢሜይል አድራሻ",
        verificationCode: "የማረጋገጫ ኮድ",
        password: "የይለፍ ቃል",
        newPassword: "አዲስ የይለፍ ቃል",
        confirmPassword: "የይለፍ ቃል አረጋግጥ",
        resendCode: "ኮድ እንደገና ላክ",
        login: "ግቡ",
        verifyCreate: "አረጋግጥ እና ፍጠር",
        createAccount: "መለያ ይፍጠሩ",
        sendResetCode: "የመልሶ ማግኛ ኮድ ላክ",
        forgotPassword: "የይለፍ ቃል ረሱ?",
        backToLogin: "ወደ መግቢያ ተመለስ",
        continueGoogle: "በ Google ይቀጥሉ",
        register: "ይመዝገቡ",
        codeExpiresIn: "ኮዱ የሚያበቃው በ",
        codeExpired: "ኮዱ ጊዜው አልፎበታል",
        weak: "ደካማ",
        medium: "መካከለኛ",
        strong: "ጠንካራ",
        rememberMe: "አስታውሰኝ",
        or: "ወይም",
        dontHaveAccount: "መለያ የለዎትም?",
        alreadyHaveAccount: "መለያ አለዎት?"
    },
    om: {
        firstNameRequired: "Maqaan duraa ni barbaachisa",
        lastNameRequired: "Maqaan abbaa ni barbaachisa",
        companyNameRequired: "Maqaan dhaabbataa ni barbaachisa",
        phoneRequired: "Lakkoofsi bilbilaa ni barbaachisa",
        phoneInvalid: "Lakkoofsi bilbilaa dijitii 9 ykn 10 ta'uu qaba",
        emailRequired: "Iimeeliin ni barbaachisa",
        emailInvalid: "Iimeelii dogoggoraa",
        passwordRequired: "Jechi darbii ni barbaachisa",
        passwordLength: "Jechi darbii yoo xiqqaate qubee 6 ta'uu qaba",
        passwordsMismatch: "Jechi darbii wal hin simne",
        enterCode: "Koodii mirkaneessaa galchaa",
        enterNewPassword: "Jecha darbii haaraa galchaa",
        otpResent: "Koodiin irra deebi'amee ergameera!",
        otpResentEmail: "Koodiin gara iimeelii keessaniitti irra deebi'amee ergameera!",
        failedResend: "Koodii irra deebi'anii erguun hin danda'amne",
        welcomeBack: "Baga nagaan deebitan!",
        sendingCode: "Koodii mirkaneessaa ergaa jira...",
        codeSent: "Koodiin mirkaneessaa ergameera!",
        accountCreated: "Akkaawuntiin milkaa'inaan uumameera!",
        sendingResetCode: "Koodii haaromsaa ergaa jira...",
        resetCodeSentSMS: "Koodiin haaromsaa ergameera! SMS keessan ilaalaa",
        resettingPassword: "Jecha darbii haaromsaa jira...",
        passwordResetSuccess: "Jechi darbii milkaa'inaan haaromeera! Seensisaa jira...",
        codeSentEmail: "Koodiin mirkaneessaa gara iimeelii keessaniitti ergameera!",
        resetCodeSentEmail: "Koodiin haaromsaa ergameera! Iimeelii keessan ilaalaa",
        welcomeTitle: "Baga Nagaan Deebitan",
        loginSubtitle: "Gara akkaawuntii keessaniitti seenaa",
        createAccountTitle: "Akkaawuntii Uumaa",
        joinSubtitle: "Har'uma nutti makamaa",
        resetPasswordTitle: "Jecha Darbii Haaromsaa",
        resetSubtitle: "Jecha darbii keessan haaromsaa",
        stepDetails: "1. Bal'ina",
        stepVerify: "2. Mirkaneessuu",
        phone: "Bilbila",
        email: "Iimeelii",
        accountType: "Gosa Akkaawuntii",
        individual: "Dhuunfaa",
        company: "Dhaabbata",
        firstName: "Maqaa Duraa",
        lastName: "Maqaa Abbaa",
        companyName: "Maqaa Dhaabbataa",
        phoneNumber: "Lakkoofsa Bilbilaa",
        emailAddress: "Teessoo Iimeelii",
        verificationCode: "Koodii Mirkaneessaa",
        password: "Jecha Darbii",
        newPassword: "Jecha Darbii Haaraa",
        confirmPassword: "Jecha Darbii Mirkaneessaa",
        resendCode: "Koodii Irra Deebi'aa Ergaa",
        login: "Seenaa",
        verifyCreate: "Mirkaneessaa & Uumaa",
        createAccount: "Akkaawuntii Uumaa",
        sendResetCode: "Koodii Haaromsaa Ergaa",
        forgotPassword: "Jecha darbii dagattanii?",
        backToLogin: "Gara Seensaatti Deebi'aa",
        continueGoogle: "Google dhaan Itti Fufaa",
        register: "Galmaa'aa",
        codeExpiresIn: "Koodiin kan darbu",
        codeExpired: "Koodiin darbeera",
        weak: "Laafaa",
        medium: "Giddu-galeessa",
        strong: "Cimaa",
        rememberMe: "Na yaadadhu",
        or: "Yookiin",
        dontHaveAccount: "Akkaawuntii hin qabduu?",
        alreadyHaveAccount: "Akkaawuntii qabduu?"
    },
    ti: {
        firstNameRequired: "ሽም የድሊ",
        lastNameRequired: "ሽም ኣቦ የድሊ",
        companyNameRequired: "ሽም ትካል የድሊ",
        phoneRequired: "ቁጽሪ ስልኪ የድሊ",
        phoneInvalid: "ቁጽሪ ስልኪ 9 ወይ 10 ኣሃዛት ክኸውን ኣለዎ",
        emailRequired: "ኢሜይል የድሊ",
        emailInvalid: "ዘይትኽክል ኢሜይል",
        passwordRequired: "መሕለፊ ቃል የድሊ",
        passwordLength: "መሕለፊ ቃል ብውሑዱ 6 ፊደላት ክኸውን ኣለዎ",
        passwordsMismatch: "መሕለፊ ቃላት ኣይሰማምዑን",
        enterCode: "መረጋገጺ ኮድ የእትዉ",
        enterNewPassword: "ሓዲሽ መሕለፊ ቃል የእትዉ",
        otpResent: "ኮድ እንደገና ተላኢኹ!",
        otpResentEmail: "ኮድ ናብ ኢሜይልኩም እንደገና ተላኢኹ!",
        failedResend: "ኮድ እንደገና ምልኣኽ ኣይተኻእለን",
        welcomeBack: "እንቋዕ ብደሓን መጻእኩም!",
        sendingCode: "መረጋገጺ ኮድ ይለኣኽ ኣሎ...",
        codeSent: "መረጋገጺ ኮድ ተላኢኹ!",
        accountCreated: "ኣካውንት ብዓወት ተፈጢሩ!",
        sendingResetCode: "መሐደሲ ኮድ ይለኣኽ ኣሎ...",
        resetCodeSentSMS: "መሐደሲ ኮድ ተላኢኹ! ኤስኤምኤስኩም ርኣዩ",
        resettingPassword: "መሕለፊ ቃል ይሕደስ ኣሎ...",
        passwordResetSuccess: "መሕለፊ ቃል ብዓወት ተሓዲሱ! ይኣቱ ኣሎ...",
        codeSentEmail: "መረጋገጺ ኮድ ናብ ኢሜይልኩም ተላኢኹ!",
        resetCodeSentEmail: "መሐደሲ ኮድ ተላኢኹ! ኢሜይልኩም ርኣዩ",
        welcomeTitle: "እንቋዕ ብደሓን መጻእኩም",
        loginSubtitle: "ናብ ኣካውንትኩም እተዉ",
        createAccountTitle: "ኣካውንት ፍጠሩ",
        joinSubtitle: "ሎሚ ተሓወሱና",
        resetPasswordTitle: "መሕለፊ ቃል ሓድስ",
        resetSubtitle: "መሕለፊ ቃልኩም ሓድሱ",
        stepDetails: "1. ዝርዝር",
        stepVerify: "2. መረጋገጺ",
        phone: "ስልኪ",
        email: "ኢሜይል",
        accountType: "ዓይነት ኣካውንት",
        individual: "ውልቀሰብ",
        company: "ትካል",
        firstName: "ሽም",
        lastName: "ሽም ኣቦ",
        companyName: "ሽም ትካል",
        phoneNumber: "ቁጽሪ ስልኪ",
        emailAddress: "ኢሜይል ኣድራሻ",
        verificationCode: "መረጋገጺ ኮድ",
        password: "መሕለፊ ቃል",
        newPassword: "ሓዲሽ መሕለፊ ቃል",
        confirmPassword: "መሕለፊ ቃል ኣረጋግጽ",
        resendCode: "ኮድ እንደገና ስደድ",
        login: "እተዉ",
        verifyCreate: "ኣረጋግጽን ፍጠርን",
        createAccount: "ኣካውንት ፍጠር",
        sendResetCode: "መሐደሲ ኮድ ስደድ",
        forgotPassword: "መሕለፊ ቃል ረሲዕኩም?",
        backToLogin: "ናብ መእተዊ ተመለስ",
        continueGoogle: "ብ Google ቀጽል",
        register: "ተመዝገብ",
        codeExpiresIn: "ኮድ ዝበላሸወሉ",
        codeExpired: "ኮድ ተበላሽዩ",
        weak: "ድኹም",
        medium: "ማእኸላይ",
        strong: "ሓያል",
        rememberMe: "ኣክረኒ",
        or: "ወይ",
        dontHaveAccount: "ኣካውንት የብልኩምን?",
        alreadyHaveAccount: "ኣካውንት ኣለኩም?"
    }
};

const EnhancedAuthPage = () => {
    const { language, changeLanguage } = useLanguage();
    const { mode: themeMode, toggleTheme } = useCustomTheme();
    const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
    const t = translations[language] || translations.en;
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/profile";

    // Parse URL for initial mode
    const searchParams = new URLSearchParams(location.search);
    const urlMode = searchParams.get('mode');

    // States
    const [authMode, setAuthMode] = useState(
        urlMode === 'register' || location.pathname.includes('register') ? 'register' : 'login'
    );
    const [method, setMethod] = useState('phone');
    const [accountType, setAccountType] = useState('individual');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [tempRegData, setTempRegData] = useState(null);

    // OTP Timer
    const [otpTimer, setOtpTimer] = useState(0);
    const [canResendOtp, setCanResendOtp] = useState(false);

    // Password strength
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Form Data
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', companyName: '',
        email: '', phone: '', password: '', confirmPassword: '', otp: ''
    });

    // Validation errors
    const [errors, setErrors] = useState({});

    // OTP Timer countdown
    useEffect(() => {
        if (otpTimer > 0) {
            const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else if (otpTimer === 0 && otpSent) {
            setCanResendOtp(true);
        }
    }, [otpTimer, otpSent]);

    // Password strength calculator
    useEffect(() => {
        if (formData.password) {
            let strength = 0;
            if (formData.password.length >= 6) strength += 25;
            if (formData.password.length >= 10) strength += 25;
            if (/[A-Z]/.test(formData.password)) strength += 25;
            if (/[0-9]/.test(formData.password)) strength += 25;
            setPasswordStrength(strength);
        } else {
            setPasswordStrength(0);
        }
    }, [formData.password]);

    // Format phone as user types
    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');

        // Remove 251 prefix if pasted
        if (value.startsWith('251')) {
            value = value.substring(3);
        }

        // Allow up to 10 digits (e.g. 0912345678)
        if (value.length > 10) value = value.substring(0, 10);

        // Format logic
        // If starts with 0, format as 091 234 5678 (10 digits)
        // If starts with 9, format as 912 345 678 (9 digits)

        let formatted = value;
        if (value.length > 0) {
            if (value.startsWith('0')) {
                // Format: 091 234 5678
                if (value.length > 7) {
                    formatted = value.substring(0, 3) + ' ' + value.substring(3, 6) + ' ' + value.substring(6);
                } else if (value.length > 3) {
                    formatted = value.substring(0, 3) + ' ' + value.substring(3);
                }
            } else {
                // Format: 912 345 678
                if (value.length > 6) {
                    formatted = value.substring(0, 3) + ' ' + value.substring(3, 6) + ' ' + value.substring(6);
                } else if (value.length > 3) {
                    formatted = value.substring(0, 3) + ' ' + value.substring(3);
                }
            }
        }

        setFormData({ ...formData, phone: formatted });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (authMode === 'register') {
            if (!formData.firstName.trim()) newErrors.firstName = t.firstNameRequired;
            if (!formData.lastName.trim()) newErrors.lastName = t.lastNameRequired;
            if (accountType === 'company' && !formData.companyName.trim()) {
                newErrors.companyName = t.companyNameRequired;
            }
        }

        if (method === 'phone') {
            const cleanPhone = formData.phone.replace(/\D/g, '');
            if (!cleanPhone) {
                newErrors.phone = t.phoneRequired;
            } else if (cleanPhone.length < 9 || cleanPhone.length > 10) {
                newErrors.phone = t.phoneInvalid;
            }
        } else {
            if (!formData.email) {
                newErrors.email = t.emailRequired;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = t.emailInvalid;
            }
        }

        if (!otpSent && authMode !== 'forgot') {
            if (!formData.password) {
                newErrors.password = t.passwordRequired;
            } else if (formData.password.length < 6) {
                newErrors.password = t.passwordLength;
            }

            if (authMode === 'register' && formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = t.passwordsMismatch;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Reset helper
    const switchMode = (mode) => {
        setAuthMode(mode);
        setOtpSent(false);
        setOtpTimer(0);
        setCanResendOtp(false);
        setErrors({});
        setFormData({
            firstName: '', lastName: '', companyName: '',
            email: '', phone: '', password: '', confirmPassword: '', otp: ''
        });
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (!canResendOtp) return;

        setCanResendOtp(false);
        setOtpTimer(60);

        try {
            if (method === 'phone') {
                if (authMode === 'register') {
                    const result = await authService.registerWithPhone({
                        phone: formData.phone,
                        password: formData.password,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        accountType: accountType,
                        companyName: accountType === 'company' ? formData.companyName : null
                    });
                    if (result.success) {
                        toast.success(t.otpResent);
                        if (result.devOtp) {


                        }
                    }
                } else if (authMode === 'forgot') {
                    await authService.sendPhonePasswordResetOtp(formData.phone);
                    toast.success(t.otpResent);
                }
            } else {
                // Email resend logic
                toast.success(t.otpResentEmail);
            }
        } catch (error) {
            toast.error(t.failedResend);
            setCanResendOtp(true);
            setOtpTimer(0);
        }
    };

    // Phone Auth Handler
    const handlePhoneAuth = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            if (authMode === 'login') {
                const result = await authService.loginWithPhone(formData.phone, formData.password);

                if (result.success) {
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }
                    toast.success(t.welcomeBack);
                    navigate(from, { replace: true });
                } else {
                    throw new Error(result.error);
                }

            } else if (authMode === 'register') {
                if (!otpSent) {
                    toast.loading(t.sendingCode, { id: 'register' });

                    const result = await authService.registerWithPhone({
                        phone: formData.phone,
                        password: formData.password,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        accountType: accountType,
                        companyName: accountType === 'company' ? formData.companyName : null
                    });

                    toast.dismiss('register');

                    if (result.success) {
                        setOtpSent(true);
                        setOtpTimer(600); // 10 minutes
                        setTempRegData(result.tempData);
                        toast.success(t.codeSent);
                        if (result.devOtp) {


                        }
                    } else {
                        throw new Error(result.error);
                    }
                } else {
                    if (!formData.otp) throw new Error(t.enterCode);

                    toast.loading("Verifying...", { id: 'verify' });

                    const result = await authService.verifyPhoneOtp(formData.phone, formData.otp, tempRegData);

                    toast.dismiss('verify');

                    if (result.success) {
                        toast.success(t.accountCreated);
                        navigate(from, { replace: true });
                    } else {
                        throw new Error(result.error);
                    }
                }

            } else if (authMode === 'forgot') {
                if (!otpSent) {
                    toast.loading(t.sendingResetCode, { id: 'reset' });

                    const result = await authService.sendPhonePasswordResetOtp(formData.phone);

                    toast.dismiss('reset');

                    if (result.success) {
                        setOtpSent(true);
                        setOtpTimer(600);
                        toast.success(t.resetCodeSentSMS);
                    } else {
                        throw new Error(result.error);
                    }
                } else {
                    if (!formData.otp) throw new Error(t.enterCode);
                    if (!formData.password) throw new Error(t.enterNewPassword);

                    toast.loading(t.resettingPassword, { id: 'reset' });

                    const result = await authService.verifyPhonePasswordResetOtp(
                        formData.phone,
                        formData.otp,
                        formData.password
                    );

                    toast.dismiss('reset');

                    if (result.success) {
                        toast.success(t.passwordResetSuccess);
                        navigate(from, { replace: true });
                    } else {
                        throw new Error(result.error);
                    }
                }
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Email Auth Handler
    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            if (authMode === 'login') {
                const result = await authService.loginWithEmail(formData.email, formData.password);

                if (result.success) {
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }
                    toast.success(t.welcomeBack);
                    navigate(from, { replace: true });
                } else {
                    throw new Error(result.error);
                }

            } else if (authMode === 'register') {
                if (!otpSent) {
                    toast.loading(t.sendingCode, { id: 'register' });

                    const result = await authService.registerWithEmail({
                        email: formData.email,
                        password: formData.password,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        accountType: accountType,
                        companyName: accountType === 'company' ? formData.companyName : null
                    });

                    toast.dismiss('register');

                    if (result.success) {
                        setOtpSent(true);
                        setOtpTimer(600);
                        setTempRegData(result.tempData);
                        toast.success(t.codeSentEmail);
                        if (result.devOtp) {


                        }
                    } else {
                        throw new Error(result.error);
                    }
                } else {
                    if (!formData.otp) throw new Error(t.enterCode);

                    toast.loading("Verifying...", { id: 'verify' });

                    const result = await authService.verifyEmailOtp(formData.email, formData.otp, tempRegData);

                    toast.dismiss('verify');

                    if (result.success) {
                        toast.success(t.accountCreated);
                        navigate(from, { replace: true });
                    } else {
                        throw new Error(result.error);
                    }
                }

            } else if (authMode === 'forgot') {
                if (!otpSent) {
                    toast.loading(t.sendingResetCode, { id: 'reset' });

                    const result = await authService.sendPasswordResetEmail(formData.email);

                    toast.dismiss('reset');

                    if (result.success) {
                        setOtpSent(true);
                        setOtpTimer(600);
                        toast.success(t.resetCodeSentEmail);
                        if (result.devOtp) {


                        }
                    } else {
                        throw new Error(result.error);
                    }
                } else {
                    if (!formData.otp) throw new Error(t.enterCode);
                    if (!formData.password) throw new Error(t.enterNewPassword);

                    toast.loading(t.resettingPassword, { id: 'reset' });

                    const result = await authService.verifyEmailPasswordResetOtp(
                        formData.email,
                        formData.otp,
                        formData.password
                    );

                    toast.dismiss('reset');

                    if (result.success) {
                        toast.success(t.passwordResetSuccess);
                        navigate(from, { replace: true });
                    } else {
                        throw new Error(result.error);
                    }
                }
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Google Sign In
    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const result = await authService.signInWithGoogle();

            if (!result.success) {
                throw new Error(result.error);
            }
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (method === 'phone') {
            handlePhoneAuth(e);
        } else if (method === 'email') {
            handleEmailAuth(e);
        }
    };

    // Get password strength color
    const getPasswordStrengthColor = () => {
        if (passwordStrength < 50) return 'error';
        if (passwordStrength < 75) return 'warning';
        return 'success';
    };

    const getPasswordStrengthLabel = () => {
        if (passwordStrength === 0) return '';
        if (passwordStrength < 50) return t.weak;
        if (passwordStrength < 75) return t.medium;
        return t.strong;
    };

    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                py: 4
            }}
        >
            <Helmet>
                <title>{(authMode === 'login' ? t.login : t.createAccount) + ' | Yesira Sew'}</title>
                <meta name="description" content="Securely login or create an account on YesraSew - Ethiopia's Premier Marketplace." />
                <meta name="keywords" content="login yesrasew, register yesrasew, sign up ethiopia, create account, ethiopian marketplace login" />
            </Helmet>
            <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 1, zIndex: 10 }}>
                <IconButton onClick={toggleTheme} sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'rgba(0,0,0,0.3)' } }}>
                    {themeMode === 'light' ? <DarkMode /> : <LightMode />}
                </IconButton>
                <IconButton onClick={(e) => setLanguageMenuAnchor(e.currentTarget)} sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'rgba(0,0,0,0.3)' } }}>
                    <Language />
                </IconButton>
                <Menu
                    anchorEl={languageMenuAnchor}
                    open={Boolean(languageMenuAnchor)}
                    onClose={() => setLanguageMenuAnchor(null)}
                    PaperProps={{ sx: { mt: 1 } }}
                >
                    {['en', 'am', 'om', 'ti'].map(lang => (
                        <MenuItem key={lang} onClick={() => { changeLanguage(lang); setLanguageMenuAnchor(null); }} selected={language === lang}>
                            {lang === 'en' ? 'English' : lang === 'am' ? 'አማርኛ' : lang === 'om' ? 'Afaan Oromoo' : 'ትግርኛ'}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
            <Container maxWidth="sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        elevation={24}
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            background: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        {/* Header */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                            >
                                <Security sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            </motion.div>

                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                {authMode === 'login' ? t.welcomeTitle : authMode === 'register' ? t.createAccountTitle : t.resetPasswordTitle}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {authMode === 'login' ? t.loginSubtitle : authMode === 'register' ? t.joinSubtitle : t.resetSubtitle}
                            </Typography>
                        </Box>

                        {/* Progress indicator for registration */}
                        {authMode === 'register' && (
                            <Box sx={{ mb: 3 }}>
                                <Stack direction="row" spacing={1} justifyContent="center" mb={1}>
                                    <Chip
                                        label={t.stepDetails}
                                        color={!otpSent ? "primary" : "success"}
                                        icon={otpSent ? <CheckCircle /> : undefined}
                                        size="small"
                                    />
                                    <Chip
                                        label={t.stepVerify}
                                        color={otpSent ? "primary" : "default"}
                                        size="small"
                                    />
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={otpSent ? 100 : 50}
                                    sx={{ height: 6, borderRadius: 3 }}
                                />
                            </Box>
                        )}

                        {/* Method Tabs */}
                        {authMode !== 'forgot' && !otpSent && (
                            <Tabs value={method} onChange={(e, v) => setMethod(v)} centered sx={{ mb: 3 }}>
                                <Tab label={t.phone} value="phone" icon={<Phone />} iconPosition="start" />
                                <Tab label={t.email} value="email" icon={<Email />} iconPosition="start" />
                            </Tabs>
                        )}

                        {/* Account Type Toggle */}
                        {authMode === 'register' && !otpSent && (
                            <Fade in timeout={500}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" gutterBottom fontWeight="medium">
                                        {t.accountType}
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={accountType}
                                        exclusive
                                        onChange={(e, v) => v && setAccountType(v)}
                                        fullWidth
                                    >
                                        <ToggleButton value="individual">
                                            <Person sx={{ mr: 1 }} /> {t.individual}
                                        </ToggleButton>
                                        <ToggleButton value="company">
                                            <Business sx={{ mr: 1 }} /> {t.company}
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                            </Fade>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={2.5}>
                                <AnimatePresence mode="wait">
                                    {/* Name Fields */}
                                    {authMode === 'register' && !otpSent && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Stack spacing={2}>
                                                <TextField
                                                    fullWidth
                                                    label={t.firstName}
                                                    name="firstName"
                                                    required
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    error={!!errors.firstName}
                                                    helperText={errors.firstName}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Person color="action" />
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    label={t.lastName}
                                                    name="lastName"
                                                    required
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    error={!!errors.lastName}
                                                    helperText={errors.lastName}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Person color="action" />
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                                {accountType === 'company' && (
                                                    <TextField
                                                        fullWidth
                                                        label={t.companyName}
                                                        name="companyName"
                                                        required
                                                        value={formData.companyName}
                                                        onChange={handleChange}
                                                        error={!!errors.companyName}
                                                        helperText={errors.companyName}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <Business color="action" />
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                        </motion.div>
                                    )}

                                    {/* Phone or Email Input */}
                                    {!otpSent && (
                                        <motion.div
                                            key="contact-input"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {method === 'phone' ? (
                                                <TextField
                                                    fullWidth
                                                    label={t.phoneNumber}
                                                    name="phone"
                                                    placeholder="091 234 5678"
                                                    required
                                                    value={formData.phone}
                                                    onChange={handlePhoneChange}
                                                    error={!!errors.phone}
                                                    helperText={errors.phone || "Format: 09X XXX XXXX"}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Phone color="action" />
                                                                <Typography variant="body2" sx={{ ml: 1 }}>
                                                                    +251
                                                                </Typography>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            ) : (
                                                <TextField
                                                    fullWidth
                                                    label={t.emailAddress}
                                                    name="email"
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    error={!!errors.email}
                                                    helperText={errors.email}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Email color="action" />
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            )}
                                        </motion.div>
                                    )}

                                    {/* OTP Input */}
                                    {otpSent && (
                                        <motion.div
                                            key="otp-input"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Alert severity="info" sx={{ mb: 2 }}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Timer />
                                                    <Typography variant="body2">
                                                        {otpTimer > 0
                                                            ? `${t.codeExpiresIn} ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}`
                                                            : t.codeExpired}
                                                    </Typography>
                                                </Stack>
                                            </Alert>

                                            <TextField
                                                fullWidth
                                                label={t.verificationCode}
                                                name="otp"
                                                placeholder="123456"
                                                required
                                                value={formData.otp}
                                                onChange={handleChange}
                                                autoFocus
                                                inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
                                            />

                                            {canResendOtp && (
                                                <Button
                                                    startIcon={<Refresh />}
                                                    onClick={handleResendOtp}
                                                    sx={{ mt: 1 }}
                                                    size="small"
                                                >
                                                    {t.resendCode}
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Password Input */}
                                    {((authMode === 'login') ||
                                        (authMode === 'register' && !otpSent) ||
                                        (authMode === 'forgot' && otpSent)) && (
                                            <motion.div
                                                key="password-input"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <TextField
                                                    fullWidth
                                                    label={authMode === 'forgot' ? t.newPassword : t.password}
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    error={!!errors.password}
                                                    helperText={errors.password}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Lock color="action" />
                                                            </InputAdornment>
                                                        ),
                                                        endAdornment: (
                                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        )
                                                    }}
                                                />

                                                {/* Password Strength Indicator */}
                                                {authMode === 'register' && formData.password && (
                                                    <Box sx={{ mt: 1 }}>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={passwordStrength}
                                                                color={getPasswordStrengthColor()}
                                                                sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                                                            />
                                                            <Typography variant="caption" color={`${getPasswordStrengthColor()}.main`}>
                                                                {getPasswordStrengthLabel()}
                                                            </Typography>
                                                        </Stack>
                                                    </Box>
                                                )}
                                            </motion.div>
                                        )}

                                    {/* Confirm Password */}
                                    {authMode === 'register' && !otpSent && (
                                        <motion.div
                                            key="confirm-password"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <TextField
                                                fullWidth
                                                label={t.confirmPassword}
                                                name="confirmPassword"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                error={!!errors.confirmPassword}
                                                helperText={errors.confirmPassword}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Lock color="action" />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Remember Me */}
                                {authMode === 'login' && (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label={t.rememberMe}
                                    />
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={loading}
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                        boxShadow: '0 3px 5px 2px rgba(102, 126, 234, .3)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                                        }
                                    }}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : authMode === 'login' ? (
                                        t.login
                                    ) : authMode === 'register' ? (
                                        otpSent ? t.verifyCreate : t.createAccount
                                    ) : otpSent ? (
                                        t.resetPasswordTitle
                                    ) : (
                                        t.sendResetCode
                                    )}
                                </Button>

                                {/* Forgot Password Link */}
                                {authMode === 'login' && (
                                    <Button
                                        onClick={() => switchMode('forgot')}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        {t.forgotPassword}
                                    </Button>
                                )}

                                {/* Back Button */}
                                {authMode === 'forgot' && (
                                    <Button
                                        onClick={() => switchMode('login')}
                                        startIcon={<ArrowBack />}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        {t.backToLogin}
                                    </Button>
                                )}
                            </Stack>
                        </form>

                        {/* Google Sign-In */}
                        {authMode !== 'forgot' && (
                            <>
                                <Divider sx={{ my: 3 }}>{t.or}</Divider>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<Google />}
                                    onClick={handleGoogleSignIn}
                                    disabled={loading}
                                    sx={{ py: 1.5 }}
                                >
                                    {t.continueGoogle}
                                </Button>
                            </>
                        )}

                        {/* Toggle Login/Register */}
                        {authMode !== 'forgot' && (
                            <Box sx={{ textAlign: 'center', mt: 3 }}>
                                <Typography variant="body2">
                                    {authMode === 'login' ? t.dontHaveAccount : t.alreadyHaveAccount}
                                    <Button
                                        onClick={() => switchMode(authMode === 'login' ? 'register' : 'login')}
                                        sx={{ textTransform: 'none', fontWeight: 'bold' }}
                                    >
                                        {authMode === 'login' ? t.register : t.login}
                                    </Button>
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default EnhancedAuthPage;
