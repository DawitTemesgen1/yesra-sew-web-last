import React, { useState, useEffect } from 'react';
import {
    Container, Paper, TextField, Button, Typography, Box, Tabs, Tab,
    InputAdornment, IconButton, ToggleButtonGroup, ToggleButton, Stack,
    Divider, CircularProgress, LinearProgress, Checkbox, FormControlLabel,
    Fade, Slide, Chip, Alert, useTheme, Menu, MenuItem, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Visibility, VisibilityOff, Email, Phone, Lock, Person, Business,
    ArrowBack, Google, CheckCircle, Error as ErrorIcon, Timer,
    Refresh, Security, Language, DarkMode, LightMode, Login
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import authService from '../services/supabase-auth';
import membershipService from '../services/membershipService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCustomTheme } from '../contexts/ThemeContext';
import { Helmet } from 'react-helmet-async';
import logo from '../assets/logo.png';

const translations = {
    en: {
        firstNameRequired: "First name is required",
        lastNameRequired: "Last name is required",
        companyNameRequired: "Company name is required",
        phoneRequired: "Phone number is required",
        phoneInvalid: "Phone number must be 9 or 10 digits",
        emailRequired: "Email is required",
        emailInvalid: "Invalid email format",
        identifierRequired: "Email or Phone number is required",
        identifierInvalid: "Please enter a valid email or phone number",
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
        joinSubtitle: "Join Yesra Sew Solution today",
        resetPasswordTitle: "Reset Password",
        resetSubtitle: "Reset your password",
        stepDetails: "1. Details",
        stepVerify: "2. Verify",
        phone: "Phone",
        email: "Email",
        identifierLabel: "Email or Phone Number",
        identifierPlaceholder: "Enter email or phone number",
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
        identifierRequired: "ኢሜይል ወይም ስልክ ቁጥር ያስፈልጋል",
        identifierInvalid: "እባክዎ ትክክለኛ ኢሜይል ወይም ስልክ ቁጥር ያስገቡ",
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
        identifierLabel: "ኢሜይል ወይም ስልክ ቁጥር",
        identifierPlaceholder: "ኢሜይል ወይም ስልክ ቁጥር ያስገቡ",
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
        identifierRequired: "Imeeliin ykn Bilbilli barbaachisaadha",
        identifierInvalid: "Maaloo imeelii ykn bilbila sirrii galchaa",
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
        identifierLabel: "Imeelii ykn Lakkoofsa Bilbilaa",
        identifierPlaceholder: "Imeelii ykn bilbila galchaa",
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
        identifierRequired: "ኢሜይል ወይ ቁጽሪ ስልኪ የድሊ",
        identifierInvalid: "በጃኹም ቅኑዕ ኢሜይል ወይ ቁጽሪ ስልኪ ኣእትዉ",
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
        identifierLabel: "ኢሜይል ወይ ቁጽሪ ስልኪ",
        identifierPlaceholder: "ኢሜይል ወይ ቁጽሪ ስልኪ ኣእትዉ",
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
    const { isAuthenticated, login } = useAuth(); // Get auth state and login function
    const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
    const t = translations[language] || translations.en;
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/profile";

    // Auto-redirect if logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    // Parse URL for initial mode and Error Params (Query or Hash)
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.substring(1)); // Remove #

    const urlMode = searchParams.get('mode');

    // Check both Query and Hash for errors
    const errorQuery = searchParams.get('error');
    const errorDescQuery = searchParams.get('error_description');
    const errorHash = hashParams.get('error');
    const errorDescHash = hashParams.get('error_description');

    const finalError = errorQuery || errorHash;
    const finalErrorDesc = errorDescQuery || errorDescHash;

    useEffect(() => {
        if (finalError) {
            toast.error(`Login Error: ${finalErrorDesc || finalError}`, { duration: 8000 });
            setErrors({ general: `Google Auth Failed: ${finalErrorDesc?.replace(/\+/g, ' ') || finalError}` });
        }
    }, [finalError, finalErrorDesc]);

    // States
    const [authMode, setAuthMode] = useState(
        urlMode === 'login' || location.pathname.includes('login') ? 'login' : 'register'
    );
    // Removed 'method' state since we unified inputs
    const [accountType, setAccountType] = useState('individual');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [tempRegData, setTempRegData] = useState(null);
    const [googleTypeOpen, setGoogleTypeOpen] = useState(false);
    const [selectedAccountType, setSelectedAccountType] = useState(null);

    // OTP Timer
    const [otpTimer, setOtpTimer] = useState(0);
    const [canResendOtp, setCanResendOtp] = useState(false);

    // Password strength
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Unified Form Data
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', companyName: '',
        identifier: '', // Replaces email and phone
        password: '', confirmPassword: '', otp: ''
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    // Helper to detect type
    const getIdentifierType = (identifier) => {
        if (/\S+@\S+\.\S+/.test(identifier)) return 'email';
        return 'phone';
    };

    // Helper to get formatted phone for backend (if needed)
    const formatIdentifierForBackend = (identifier) => {
        const type = getIdentifierType(identifier);
        if (type === 'phone') {
            // Basic cleaning and formatting, assume user might enter various formats
            let clean = identifier.replace(/\D/g, '');
            // NOTE: Backend service often expects just the number.
            // If local logic required formatting, do it here. 
            // Currently passing clean number or let service handle.
            // Previous logic had specific logic for prefix.
            // Let's rely on what user typed but cleaned.
            // If it starts with 09..., make it +251... or keep local logic?
            // Reusing logic from previous impl:
            // If length > 10, cut. 
            // But here we just return the value for the service to handle
            return identifier;
        }
        return identifier;
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

        // Identifier Validation
        const id = formData.identifier.trim();
        const type = getIdentifierType(id);

        if (!id) {
            newErrors.identifier = t.identifierRequired;
        } else {
            if (type === 'email') {
                if (!/\S+@\S+\.\S+/.test(id)) newErrors.identifier = t.emailInvalid;
            } else {
                // Phone validation
                const cleanPhone = id.replace(/\D/g, '');
                // Allow +2519... (12 digits), 09... (10 digits), 9... (9 digits)
                // Just checking basic length for now to be permissive yet safe
                if (cleanPhone.length < 9) {
                    newErrors.identifier = t.phoneInvalid; // or generic invalid
                }
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
            identifier: '', password: '', confirmPassword: '', otp: ''
        });
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (!canResendOtp) return;
        setCanResendOtp(false);
        setOtpTimer(60);

        const type = getIdentifierType(formData.identifier);

        try {
            if (type === 'phone') {
                if (authMode === 'register') {
                    const result = await authService.registerWithPhone({
                        phone: formData.identifier,
                        password: formData.password,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        accountType: accountType,
                        companyName: accountType === 'company' ? formData.companyName : null
                    });
                    if (result.success) toast.success(t.otpResent);
                } else if (authMode === 'forgot') {
                    await authService.sendPhonePasswordResetOtp(formData.identifier);
                    toast.success(t.otpResent);
                }
            } else {
                // Email
                // Note: Implement email resend if distinct in service
                toast.success(t.otpResentEmail);
            }
        } catch (error) {
            toast.error(t.failedResend);
            setCanResendOtp(true);
            setOtpTimer(0);
        }
    };

    // Generic Auth Handler (Dispatches to Phone or Email)
    const handleAuth = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        const type = getIdentifierType(formData.identifier);

        try {
            if (type === 'phone') {
                // PHONE AUTH LOGIC
                if (authMode === 'login') {
                    const result = await authService.loginWithPhone(formData.identifier, formData.password);
                    if (result.success) {
                        if (rememberMe) localStorage.setItem('rememberMe', 'true');
                        toast.success(t.welcomeBack);
                        navigate(from, { replace: true });
                    } else throw new Error(result.error);

                } else if (authMode === 'register') {
                    if (!otpSent) {
                        toast.loading(t.sendingCode, { id: 'register' });
                        const result = await authService.registerWithPhone({
                            phone: formData.identifier,
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
                            toast.success(t.codeSent);
                        } else throw new Error(result.error);
                    } else {
                        if (!formData.otp) throw new Error(t.enterCode);
                        toast.loading("Verifying...", { id: 'verify' });
                        const result = await authService.verifyPhoneOtp(formData.identifier, formData.otp, tempRegData);
                        toast.dismiss('verify');
                        if (result.success) {
                            // Auto-subscribe to Free Plan
                            try {
                                const plans = await membershipService.getPlans();
                                const freePlan = plans.find(p => p.price === 0 || p.price === '0' || p.price === 0.0);
                                const userId = result.user?.id || result.session?.user?.id;
                                if (freePlan && userId) {
                                    await membershipService.subscribeToPlan(userId, freePlan.id);
                                }
                            } catch (subError) {
                                console.error('Failed to auto-subscribe to free plan:', subError);
                            }

                            toast.success(t.accountCreated);
                            navigate(from, { replace: true });
                        } else throw new Error(result.error);
                    }
                } else if (authMode === 'forgot') {
                    if (!otpSent) {
                        toast.loading(t.sendingResetCode, { id: 'reset' });
                        const result = await authService.sendPhonePasswordResetOtp(formData.identifier);
                        toast.dismiss('reset');
                        if (result.success) {
                            setOtpSent(true);
                            setOtpTimer(600);
                            toast.success(t.resetCodeSentSMS);
                        } else throw new Error(result.error);
                    } else {
                        if (!formData.otp) throw new Error(t.enterCode);
                        if (!formData.password) throw new Error(t.enterNewPassword);
                        toast.loading(t.resettingPassword, { id: 'reset' });
                        const result = await authService.verifyPhonePasswordResetOtp(
                            formData.identifier,
                            formData.otp,
                            formData.password
                        );
                        toast.dismiss('reset');
                        if (result.success) {
                            toast.success(t.passwordResetSuccess);
                            navigate(from, { replace: true });
                        } else throw new Error(result.error);
                    }
                }
            } else {
                // EMAIL AUTH LOGIC
                if (authMode === 'login') {
                    const result = await authService.loginWithEmail(formData.identifier, formData.password);
                    if (result.success) {
                        if (rememberMe) localStorage.setItem('rememberMe', 'true');
                        toast.success(t.welcomeBack);
                        navigate(from, { replace: true });
                    } else throw new Error(result.error);

                } else if (authMode === 'register') {
                    if (!otpSent) {
                        toast.loading(t.sendingCode, { id: 'register' });
                        const result = await authService.registerWithEmail({
                            email: formData.identifier,
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
                        } else throw new Error(result.error);
                    } else {
                        if (!formData.otp) throw new Error(t.enterCode);
                        toast.loading("Verifying...", { id: 'verify' });
                        const result = await authService.verifyEmailOtp(formData.identifier, formData.otp, tempRegData);
                        toast.dismiss('verify');
                        if (result.success) {
                            // Auto-subscribe to Free Plan
                            try {
                                const plans = await membershipService.getPlans();
                                const freePlan = plans.find(p => p.price === 0 || p.price === '0' || p.price === 0.0);
                                const userId = result.user?.id || result.session?.user?.id;
                                if (freePlan && userId) {
                                    await membershipService.subscribeToPlan(userId, freePlan.id);
                                }
                            } catch (subError) {
                                console.error('Failed to auto-subscribe to free plan:', subError);
                            }

                            toast.success(t.accountCreated);
                            navigate(from, { replace: true });
                        } else throw new Error(result.error);
                    }
                } else if (authMode === 'forgot') {
                    if (!otpSent) {
                        toast.loading(t.sendingResetCode, { id: 'reset' });
                        const result = await authService.sendPasswordResetEmail(formData.identifier);
                        toast.dismiss('reset');
                        if (result.success) {
                            setOtpSent(true);
                            setOtpTimer(600);
                            toast.success(t.resetCodeSentEmail);
                        } else throw new Error(result.error);
                    } else {
                        if (!formData.otp) throw new Error(t.enterCode);
                        if (!formData.password) throw new Error(t.enterNewPassword);
                        toast.loading(t.resettingPassword, { id: 'reset' });
                        const result = await authService.verifyEmailPasswordResetOtp(
                            formData.identifier,
                            formData.otp,
                            formData.password
                        );
                        toast.dismiss('reset');
                        if (result.success) {
                            toast.success(t.passwordResetSuccess);
                            navigate(from, { replace: true });
                        } else throw new Error(result.error);
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
        // Show account type picker for registration mode
        if (authMode === 'register') {
            setGoogleTypeOpen(true);
            return;
        }
        processGoogleLogin();
    };

    const processGoogleLogin = async (accountType = null) => {
        setLoading(true);
        setSelectedAccountType(accountType); // Track which button was clicked
        // Do NOT close dialog here; let it show the loading spinner logic we added
        // setGoogleTypeOpen(false); 

        const metaData = accountType ? {
            account_type: accountType,
            is_ethiopian_phone: false // Google users might not have phone
        } : null;

        try {
            const result = await login({ isWebOAuth: true, metaData });
            if (result.success) {
                // Success handled by redirect
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
            setSelectedAccountType(null); // Reset selection on error
            setGoogleTypeOpen(false); // Close on error so user can retry
        }
    };

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
    // Logic remains same ...

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#0a192f',
                background: 'linear-gradient(135deg, #0a192f 0%, #172a45 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
                position: 'relative'
            }}
        >
            <Helmet>
                <title>{(authMode === 'login' ? t.login : t.createAccount) + ' | Yesira Sew'}</title>
            </Helmet>

            {/* Header */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, bgcolor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', color: 'white', py: 2, boxShadow: 2 }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
                                <ArrowBack />
                            </IconButton>
                            <Typography variant="h6" fontWeight="bold">
                                Yesra Sew
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                            <IconButton onClick={toggleTheme} sx={{ color: '#fff' }}>
                                {themeMode === 'light' ? <DarkMode /> : <LightMode />}
                            </IconButton>
                            <IconButton onClick={(e) => setLanguageMenuAnchor(e.currentTarget)} sx={{ color: '#fff' }}>
                                <Language />
                            </IconButton>
                        </Stack>
                    </Box>
                </Container>
            </Box>

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

            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <AnimatePresence>
                    {errors.general && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ marginBottom: 16 }}
                        >
                            <Alert severity="error" onClose={() => setErrors({ ...errors, general: null })}>
                                {errors.general}
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        elevation={24}
                        sx={{
                            p: { xs: 3, md: 5 },
                            borderRadius: 4,
                            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.3)}`,
                            backdropFilter: 'blur(20px)',
                            backgroundColor: alpha(theme.palette.background.paper, 0.95), // Slight transparency
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        {/* Logo Section */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Box sx={{
                                width: 80,
                                height: 80,
                                bgcolor: 'transparent',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                            }}>
                                <img src={logo} alt="Yesra Sew Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                {authMode === 'login' ? t.welcomeTitle : authMode === 'register' ? t.createAccountTitle : t.resetPasswordTitle}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {authMode === 'login' ? t.loginSubtitle : authMode === 'register' ? t.joinSubtitle : t.resetSubtitle}
                            </Typography>
                        </Box>

                        {/* Login/Register Toggle (Custom Tabs look) */}
                        {authMode !== 'forgot' && (
                            <Box sx={{ mb: 3, p: 0.5, bgcolor: alpha(theme.palette.action.hover, 0.1), borderRadius: 3, display: 'flex' }}>
                                <Button
                                    fullWidth
                                    onClick={() => switchMode('login')}
                                    sx={{
                                        borderRadius: 2.5,
                                        py: 1,
                                        color: authMode === 'login' ? 'primary.main' : 'text.secondary',
                                        bgcolor: authMode === 'login' ? 'background.paper' : 'transparent',
                                        boxShadow: authMode === 'login' ? 1 : 0,
                                        transition: 'all 0.3s ease',
                                        '&:hover': { bgcolor: authMode === 'login' ? 'background.paper' : alpha(theme.palette.action.hover, 0.1) }
                                    }}
                                >
                                    {t.login}
                                </Button>
                                <Button
                                    fullWidth
                                    onClick={() => switchMode('register')}
                                    sx={{
                                        borderRadius: 2.5,
                                        py: 1,
                                        color: authMode === 'register' ? 'primary.main' : 'text.secondary',
                                        bgcolor: authMode === 'register' ? 'background.paper' : 'transparent',
                                        boxShadow: authMode === 'register' ? 1 : 0,
                                        transition: 'all 0.3s ease',
                                        '&:hover': { bgcolor: authMode === 'register' ? 'background.paper' : alpha(theme.palette.action.hover, 0.1) }
                                    }}
                                >
                                    {t.register}
                                </Button>
                            </Box>
                        )}

                        {/* Progress indicator for registration */}
                        {authMode === 'register' && (
                            <Box sx={{ mb: 3 }}>
                                <Stack direction="row" spacing={1} justifyContent="center" mb={1}>
                                    <Chip
                                        align="center"
                                        label={t.stepDetails}
                                        color={!otpSent ? "primary" : "success"}
                                        icon={otpSent ? <CheckCircle /> : undefined}
                                        size="small"
                                        variant={!otpSent ? "filled" : "outlined"}
                                    />
                                    <Chip
                                        label={t.stepVerify}
                                        color={otpSent ? "primary" : "default"}
                                        size="small"
                                        variant={otpSent ? "filled" : "outlined"}
                                    />
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={otpSent ? 100 : 50}
                                    sx={{ height: 4, borderRadius: 2 }}
                                />
                            </Box>
                        )}

                        {/* Account Type Toggle */}
                        {authMode === 'register' && !otpSent && (
                            <Fade in timeout={500}>
                                <Box sx={{ mb: 3 }}>
                                    <ToggleButtonGroup
                                        value={accountType}
                                        exclusive
                                        onChange={(e, v) => v && setAccountType(v)}
                                        fullWidth
                                        sx={{
                                            '& .MuiToggleButton-root': {
                                                borderRadius: 3,
                                                borderColor: alpha(theme.palette.divider, 0.2),
                                                py: 1.5,
                                                textTransform: 'none'
                                            },
                                            '& .Mui-selected': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.1) + '!important',
                                                color: theme.palette.primary.main,
                                                border: `1px solid ${theme.palette.primary.main} !important`
                                            }
                                        }}
                                    >
                                        <ToggleButton value="individual" sx={{ mr: 1, border: 1 }}>
                                            <Person sx={{ mr: 1, fontSize: 20 }} /> {t.individual}
                                        </ToggleButton>
                                        <ToggleButton value="company" sx={{ border: 1 }}>
                                            <Business sx={{ mr: 1, fontSize: 20 }} /> {t.company}
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                            </Fade>
                        )}

                        {/* Form */}
                        <form onSubmit={handleAuth}>
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
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
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
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
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
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
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

                                    {/* Unified Identifier Input */}
                                    {!otpSent && (
                                        <motion.div
                                            key="identifier-input"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <TextField
                                                fullWidth
                                                label={t.identifierLabel}
                                                name="identifier"
                                                placeholder={t.identifierPlaceholder}
                                                required
                                                value={formData.identifier}
                                                onChange={handleChange}
                                                error={!!errors.identifier}
                                                helperText={errors.identifier}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                                autoFocus={authMode === 'login' || authMode === 'register'}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Person color="action" />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
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
                                            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Timer fontSize="small" />
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
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                                inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 600 } }}
                                            />

                                            {canResendOtp && (
                                                <Button
                                                    startIcon={<Refresh />}
                                                    onClick={handleResendOtp}
                                                    sx={{ mt: 1, textTransform: 'none' }}
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
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
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
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
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
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                        <Button
                                            onClick={() => switchMode('forgot')}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            {t.forgotPassword}
                                        </Button>
                                    </Box>
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
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
                                        '&:hover': {
                                            background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
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
                                <Divider sx={{ my: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {t.or}
                                    </Typography>
                                </Divider>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    size="large"
                                    startIcon={
                                        loading ? (
                                            <CircularProgress size={20} />
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                        )
                                    }
                                    onClick={handleGoogleSignIn}
                                    disabled={loading}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderColor: alpha(theme.palette.text.primary, 0.2),
                                    }}
                                >
                                    {loading ? 'Processing...' : t.continueGoogle}
                                </Button>
                            </>
                        )}
                    </Paper>
                </motion.div>
                <Dialog
                    open={googleTypeOpen}
                    onClose={() => !loading && setGoogleTypeOpen(false)}
                    PaperProps={{
                        sx: { borderRadius: 3, p: 2, minWidth: 300 }
                    }}
                >
                    <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', pb: 1 }}>
                        {loading ? (
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                <CircularProgress size={24} />
                                <Typography variant="h6" fontWeight="bold">
                                    Authenticating...
                                </Typography>
                            </Stack>
                        ) : (
                            t.accountType
                        )}
                    </DialogTitle>
                    <DialogContent>
                        {loading ? (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 4,
                                gap: 2
                            }}>
                                <CircularProgress size={48} thickness={4} />
                                <Stack spacing={1} alignItems="center">
                                    <Typography variant="body1" color="text.primary" fontWeight="medium">
                                        {selectedAccountType === 'individual' ? (
                                            <>
                                                <Person sx={{ fontSize: 20, verticalAlign: 'middle', mr: 0.5 }} />
                                                Opening Google Sign-In for Individual Account
                                            </>
                                        ) : selectedAccountType === 'company' ? (
                                            <>
                                                <Business sx={{ fontSize: 20, verticalAlign: 'middle', mr: 0.5 }} />
                                                Opening Google Sign-In for Company Account
                                            </>
                                        ) : (
                                            'Opening Google Sign-In'
                                        )}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Please complete the authentication in the popup window
                                    </Typography>
                                </Stack>
                            </Box>
                        ) : (
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<Person />}
                                    onClick={() => processGoogleLogin('individual')}
                                    sx={{
                                        py: 2,
                                        justifyContent: 'flex-start',
                                        borderColor: accountType === 'individual' ? 'primary.main' : 'divider',
                                        borderWidth: 1,
                                        '&:hover': { borderWidth: 1, bgcolor: 'primary.action' }
                                    }}
                                >
                                    <Box sx={{ textAlign: 'left', ml: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{t.individual}</Typography>
                                    </Box>
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<Business />}
                                    onClick={() => processGoogleLogin('company')}
                                    sx={{
                                        py: 2,
                                        justifyContent: 'flex-start',
                                        borderColor: accountType === 'company' ? 'primary.main' : 'divider',
                                        borderWidth: 1,
                                        '&:hover': { borderWidth: 1, bgcolor: 'primary.action' }
                                    }}
                                >
                                    <Box sx={{ textAlign: 'left', ml: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{t.company}</Typography>
                                    </Box>
                                </Button>
                            </Stack>
                        )}
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
};

export default EnhancedAuthPage;

