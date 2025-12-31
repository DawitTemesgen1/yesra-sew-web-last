import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import { supabase } from '../services/api';
import toast from 'react-hot-toast';
import {
    Box, Container, Typography, Card, CardContent, Button,
    Grid, Divider, Stack, Chip, CircularProgress, Radio,
    RadioGroup, FormControlLabel, FormControl, Paper, alpha,
    List, ListItem, ListItemIcon, ListItemText, useTheme,
    Dialog, DialogContent
} from '@mui/material';
import {
    Check, ArrowBack, CreditCard, AccountBalance,
    Security, Verified, Star
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
    en: {
        backToPlans: "Back to Plans",
        mostPopular: "MOST POPULAR",
        free: "FREE",
        whatsIncluded: "What's Included",
        securePayment: "Secure payment processing",
        cancelAnytime: "Cancel anytime, no questions asked",
        paymentMethod: "Payment Method",
        choosePreferred: "Choose your preferred payment provider",
        cardsMobileMoney: "Cards, Mobile Money, Bank Transfer",
        ethiopianGateway: "Ethiopian Payment Gateway",
        orderSummary: "Order Summary",
        plan: "Plan",
        duration: "Duration",
        total: "Total",
        pay: "Pay",
        activateFree: "Activate Free Plan",
        termsAgreement: "By proceeding, you agree to our Terms of Service and Privacy Policy",
        unlimited: "Unlimited",
        posts: "posts",
        per: "per",
        viewAll: "View all",
        listings: "listings",
        currency: "ETB",
        featured: "Featured listings",
        priority: "Priority support",
        verified: "Verified badge",
        analytics: "Advanced analytics",
        month: "month",
        months: "months",
        day: "day",
        days: "days",
        categories: {
            cars: "Cars",
            homes: "Homes",
            jobs: "Jobs",
            tenders: "Tenders"
        }
    },
    am: {
        backToPlans: "ወደ እቅዶች ተመለስ",
        mostPopular: "በጣም ታዋቂ",
        free: "ነፃ",
        whatsIncluded: "ምን ተካቷል",
        securePayment: "ደህንነቱ የተጠበቀ ክፍያ",
        cancelAnytime: "በማንኛውም ጊዜ ይሰርዙ፣ ምንም ጥያቄ የለም",
        paymentMethod: "የመክፈያ ዘዴ",
        choosePreferred: "የመረጡትን የመክፈያ አቅራቢ ይምረጡ",
        cardsMobileMoney: "ካርዶች፣ ሞባይል ገንዘብ፣ የባንክ ዝውውር",
        ethiopianGateway: "የኢትዮጵያ ክፍያ መግቢያ",
        orderSummary: "የትዕዛዝ ማጠቃለያ",
        plan: "እቅድ",
        duration: "ቆይታ",
        total: "ጠቅላላ",
        pay: "ይክፈሉ",
        activateFree: "ነፃ እቅድ ያግብሩ",
        termsAgreement: "በመቀጠልዎ በእኛ የአገልግሎት ውል እና የግላዊነት ፖሊሲ ተስማምተዋል",
        unlimited: "ያልተገደበ",
        posts: "ልጥፎች",
        per: "በ",
        viewAll: "ሁሉንም ይመልከቱ",
        listings: "ዝርዝሮች",
        currency: "ብር",
        featured: "ተለይተው የቀረቡ ዝርዝሮች",
        priority: "ቅድሚያ የሚሰጠው ድጋፍ",
        verified: "የተረጋገጠ ባጅ",
        analytics: "የላቀ ትንታኔ",
        month: "ወር",
        months: "ወራት",
        day: "ቀን",
        days: "ቀናት",
        categories: {
            cars: "መኪናዎች",
            homes: "ቤቶች",
            jobs: "ስራዎች",
            tenders: "ጨረታዎች"
        }
    },
    om: {
        backToPlans: "Gara Karooraatti Deebi'aa",
        mostPopular: "BAAY'EE BEEKAMAA",
        free: "BILISA",
        whatsIncluded: "Maaltu Hammatame",
        securePayment: "Kaffaltii Eegumsa Qabu",
        cancelAnytime: "Yeroo barbaaddanitti haquu dandeessu",
        paymentMethod: "Mala Kaffaltii",
        choosePreferred: "Dhiyeessaa kaffaltii filadhaa",
        cardsMobileMoney: "Kaardii, Mobile Money, Baankii",
        ethiopianGateway: "Gatway Kaffaltii Itoophiyaa",
        orderSummary: "Cuunfaa Ajaja",
        plan: "Karoora",
        duration: "Turtii",
        total: "Waliigala",
        pay: "Kaffali",
        activateFree: "Karoora Bilisaa Eegali",
        termsAgreement: "Itti fufuudhaan, Haalawwan Tajaajilaa fi Imaammata Dhuunfaa keenyatti waliigaltu",
        unlimited: "Daangaa Hin Qabne",
        posts: "maxxansa",
        per: "/",
        viewAll: "Hunda Ilaali",
        listings: "tarreeffama",
        currency: "Birr",
        featured: "Tarreeffama Filatamaa",
        priority: "Deeggarsa Dursee Kennamu",
        verified: "Mallattoo Mirkaneeffame",
        analytics: "Xiinxala Olaanaa",
        month: "ji'a",
        months: "ji'oota",
        day: "guyyaa",
        days: "guyyoota",
        categories: {
            cars: "Konkolaataa",
            homes: "Manneen",
            jobs: "Hojiiwwan",
            tenders: "Caalbaasii"
        }
    },
    ti: {
        backToPlans: "ናብ መደባት ተመለስ",
        mostPopular: "ብዝያዳ ፍቱው",
        free: "ነፃ",
        whatsIncluded: "እንታይ ተኻቲቱ",
        securePayment: "ድሕንነቱ ዝተሓለወ ክፍሊት",
        cancelAnytime: "ኣብ ዝኾነ ግዜ ምስራዝ ይከኣል",
        paymentMethod: "መንገዲ ክፍሊት",
        choosePreferred: "ዝመረጽኩሞ ኣቕራቢ ክፍሊት ምረጹ",
        cardsMobileMoney: "ካርዶች፣ ሞባይል ገንዘብ፣ ባንክ",
        ethiopianGateway: "ናይ ኢትዮጵያ መእተዊ ክፍሊት",
        orderSummary: "ማጠቃለሊ ትእዛዝ",
        plan: "መደብ",
        duration: "ንውሓት ግዜ",
        total: "ጠቕላላ",
        pay: "ክፈሉ",
        activateFree: "ነፃ መደብ ጀምሩ",
        termsAgreement: "ብምቕጻልኩም ምስ ውልናን ፖሊሲ ብሕትናና ትሰማምዑ",
        unlimited: "ዘይተገደበ",
        posts: "ልጥፋት",
        per: "ኣብ",
        viewAll: "ኩሉ ረአ",
        listings: "ዝርዝራት",
        currency: "ብር",
        featured: "ዝተመረጹ ዝርዝራት",
        priority: "ቀዳማይ ዝወሃብ ደገፍ",
        verified: "ዝተረጋገለ ምልክት",
        analytics: "ዝተራቐቐ ትንታነ",
        month: "ወርሒ",
        months: "ወርሒታት",
        day: "መዓልቲ",
        days: "መዓልታት",
        categories: {
            cars: "መካይን",
            homes: "ኣባይቲ",
            jobs: "ስራሕቲ",
            tenders: "ጨረታታት"
        }
    }
};

const BRAND_COLORS = {
    gold: '#FFD700',
    blue: '#1E3A8A',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%)',
};

// --- Payment Processing Modal ---
const PaymentProcessingModal = ({ open, status, error, onRetry, onClose }) => {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    p: 2,
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                }
            }}
        >
            <DialogContent>
                <Box py={3}>
                    {status === 'processing' && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                                <CircularProgress size={80} thickness={2} sx={{ color: BRAND_COLORS.blue }} />
                                <Box
                                    sx={{
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Security color="primary" sx={{ fontSize: 32 }} />
                                </Box>
                            </Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Securing Transaction
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Please wait while we connect to the secure payment gateway...
                            </Typography>
                        </motion.div>
                    )}

                    {status === 'redirecting' && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <Box sx={{ mb: 3, display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                                <Check sx={{ fontSize: 50, color: theme.palette.success.main }} />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Connection Established
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Redirecting you to complete your payment...
                            </Typography>
                            <Box sx={{ mt: 3, width: '100%', height: 4, bgcolor: alpha(theme.palette.success.main, 0.2), borderRadius: 2, overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '0%' }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    style={{ width: '100%', height: '100%', background: theme.palette.success.main }}
                                />
                            </Box>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <Box sx={{ mb: 3, display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                                <Typography variant="h3" color="error">!</Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom color="error">
                                Payment Failed
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {error || "Unable to initiate payment transaction."}
                            </Typography>
                            <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
                                <Button variant="outlined" onClick={onClose} color="inherit">
                                    Cancel
                                </Button>
                                <Button variant="contained" onClick={onRetry} color="primary">
                                    Try Again
                                </Button>
                            </Stack>
                        </motion.div>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

const CheckoutPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;
    const [searchParams] = useSearchParams();

    const planId = searchParams.get('plan');
    const preloadedPlan = location.state?.plan;

    const [plan, setPlan] = useState(preloadedPlan || null);
    const [loading, setLoading] = useState(!preloadedPlan);
    // New Payment States
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, redirecting, error
    const [paymentError, setPaymentError] = useState('');

    // Original states
    const [paymentProvider, setPaymentProvider] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    const [enabledProviders, setEnabledProviders] = useState([]);

    useEffect(() => {
        if (!user) {
            toast.error('Please login to continue');
            navigate('/auth', { state: { returnTo: `/checkout?plan=${planId}` } });
            return;
        }

        // If we don't have the plan yet (direct link access), fetch it
        if (!plan) {
            fetchPlanDetails();
        } else {
            // We have the plan, but let's make sure it matches the URL param just in case
            if (plan.slug !== planId && String(plan.id) !== planId) {
                fetchPlanDetails();
            }
        }

        fetchUserProfile();
        fetchEnabledProviders();
    }, [planId, user, plan]);

    const fetchUserProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            setUserProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchEnabledProviders = async () => {
        try {
            let providers = await adminService.getPaymentProviders();

            // FALLBACK: If RLS blocks access or no providers return, default to Chapa
            if (!providers || providers.length === 0) {
                console.warn('No payment providers found. Using default Chapa provider.');
                providers = [{
                    name: 'chapa',
                    display_name: 'Chapa',
                    is_enabled: true,
                    config: {
                        description: 'Ethiopian payment gateway supporting mobile money, bank transfers, and cards'
                    }
                }];
            }

            // Filter enabled providers
            let enabled = providers.filter(p => p.is_enabled);

            // If no enabled providers, still use Chapa as fallback
            if (enabled.length === 0) {
                console.warn('No enabled payment providers. Using Chapa as default.');
                enabled = [{
                    name: 'chapa',
                    display_name: 'Chapa',
                    is_enabled: true,
                    config: {
                        description: 'Ethiopian payment gateway supporting mobile money, bank transfers, and cards'
                    }
                }];
            }

            setEnabledProviders(enabled);

            // Auto-select first enabled provider
            if (enabled.length > 0 && !paymentProvider) {
                setPaymentProvider(enabled[0].name);
            }
        } catch (error) {
            console.error('Error fetching payment providers:', error);
            // Even on error, fallback to Chapa
            const fallback = [{
                name: 'chapa',
                display_name: 'Chapa',
                is_enabled: true,
                config: {
                    description: 'Ethiopian payment gateway supporting mobile money, bank transfers, and cards'
                }
            }];
            setEnabledProviders(fallback);
            if (!paymentProvider) setPaymentProvider('chapa');
        }
    };

    const fetchPlanDetails = async () => {
        try {
            if (!plan) setLoading(true);
            const plans = await adminService.getMembershipPlans();
            const selectedPlan = plans.find(p => p.slug === planId || String(p.id) === planId);

            if (!selectedPlan) {
                toast.error('Plan not found');
                navigate('/pricing');
                return;
            }

            setPlan(selectedPlan);
        } catch (error) {
            console.error('Error fetching plan:', error);
            toast.error('Failed to load plan details');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!user || !plan) return;

        setPaymentStatus('processing');
        setPaymentError('');

        // Timeout handler
        const timeoutId = setTimeout(() => {
            if (paymentStatus === 'processing') {
                setPaymentStatus('error');
                setPaymentError('Payment request timed out. Please try again.');
            }
        }, 45000); // 45 seconds timeout

        try {
            // Call Supabase Edge Function with timeout
            const controller = new AbortController();
            const timeoutSignal = setTimeout(() => controller.abort(), 40000); // 40s internal

            // Use 'free' provider if price is 0 to skip payment gateway logic
            const effectiveProvider = plan.price === 0 ? 'free' : paymentProvider;

            const { data, error } = await supabase.functions.invoke('payment-handler', {
                body: {
                    action: 'initiate',
                    provider: effectiveProvider,
                    amount: plan.price,
                    currency: 'ETB',
                    userId: user.id,
                    email: userProfile?.email || user.email,
                    firstName: userProfile?.full_name?.split(' ')[0] || 'User',
                    lastName: userProfile?.full_name?.split(' ')[1] || '',
                    returnUrlPrefix: 'https://www.yesrasewsolution.com',
                    metadata: {
                        plan_id: plan.id,
                        plan_name: plan.name,
                        plan_slug: plan.slug,
                        duration_value: plan.duration_value,
                        duration_unit: plan.duration_unit
                    }
                },
                signal: controller.signal // Pass signal to fetch
            });

            clearTimeout(timeoutSignal);
            clearTimeout(timeoutId);

            if (error) {
                console.error('Payment function error:', error);
                throw new Error(error.message || 'Payment service error');
            }

            if (!data) {
                throw new Error('No response from payment service. Please try again.');
            }

            if (data?.success) {
                if (data.checkoutUrl) {
                    // Show redirect state
                    setPaymentStatus('redirecting');

                    // Small artificial delay to let user see "Redirecting" message
                    setTimeout(() => {
                        window.location.href = data.checkoutUrl;
                    }, 1500);
                } else {
                    // Free plan success
                    setPaymentStatus('idle'); // Close modal
                    toast.success(t.planActivated || 'Plan activated successfully!');
                    navigate('/profile?tab=membership');
                }
            } else {
                throw new Error(data?.message || data?.error || 'Failed to initialize payment');
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Payment error:', error);

            let errorMessage = 'Payment initialization failed';
            if (error.name === 'AbortError') {
                errorMessage = 'Payment request timed out. Check your connection.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'Network error. Check your connection.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setPaymentError(errorMessage);
            setPaymentStatus('error');
        }
    };

    const handleRetry = () => {
        handlePayment();
    };

    const handleCloseModal = () => {
        setPaymentStatus('idle');
        setPaymentError('');
    };

    const formatDuration = (value, unit) => {
        if (!value || !unit) return `1 ${t.month}`;
        const v = parseInt(value);
        let normalizedUnit = unit.toLowerCase();
        let unitKey = normalizedUnit;

        if (v === 1 && normalizedUnit.endsWith('s')) unitKey = normalizedUnit.slice(0, -1);
        else if (v > 1 && !normalizedUnit.endsWith('s')) unitKey = normalizedUnit + 's';

        const translatedUnit = t[unitKey] || unit;
        return `${v} ${translatedUnit}`;
    };

    const getPlanFeatures = () => {
        const features = [];

        // Category limits
        Object.entries(plan.category_limits || {}).forEach(([cat, limit]) => {
            const catLabel = t.categories?.[cat] || cat;
            if (limit === -1) {
                features.push(`${t.unlimited} ${catLabel} ${t.posts}`);
            } else if (limit > 0) {
                const durUnit = t[plan.duration_unit] || plan.duration_unit;
                features.push(`${limit} ${catLabel} ${t.posts} ${t.per} ${durUnit}`);
            }
        });

        // View access
        Object.entries(plan.permissions?.view_access || {}).forEach(([cat, access]) => {
            if (access === -1 || access === true || (typeof access === 'number' && access > 0)) {
                const catLabel = t.categories?.[cat] || cat;
                features.push(`${t.viewAll} ${catLabel} ${t.listings}`);
            }
        });

        // Additional features
        if (Array.isArray(plan.features)) {
            features.push(...plan.features);
        }

        // Permissions
        if (plan.permissions?.can_post_featured) features.push(t.featured);
        if (plan.permissions?.priority_support) features.push(t.priority);
        if (plan.permissions?.verified_badge) features.push(t.verified);
        if (plan.permissions?.analytics_access) features.push(t.analytics);

        return features;
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
                <Container maxWidth="lg">
                    {/* Back Button Skeleton */}
                    <Box sx={{ width: 150, height: 36, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, mb: 3 }} />

                    <Grid container spacing={4}>
                        {/* Left Column - Plan Details Skeleton */}
                        <Grid item xs={12} md={7}>
                            <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                                <Box sx={{ p: 4, height: 200, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                    <Box sx={{ width: '40%', height: 32, bgcolor: alpha(theme.palette.common.white, 0.3), borderRadius: 1, mb: 2 }} />
                                    <Box sx={{ width: '60%', height: 24, bgcolor: alpha(theme.palette.common.white, 0.2), borderRadius: 1, mb: 4 }} />
                                    <Box sx={{ width: '30%', height: 48, bgcolor: alpha(theme.palette.common.white, 0.3), borderRadius: 1 }} />
                                </Box>
                                <CardContent sx={{ p: 4 }}>
                                    <Box sx={{ width: '50%', height: 28, bgcolor: alpha(theme.palette.grey[400], 0.2), borderRadius: 1, mb: 3 }} />
                                    <Stack spacing={2}>
                                        {[1, 2, 3, 4].map(i => (
                                            <Box key={i} display="flex" gap={2}>
                                                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha(theme.palette.grey[400], 0.1) }} />
                                                <Box sx={{ flex: 1, height: 24, bgcolor: alpha(theme.palette.grey[400], 0.1), borderRadius: 1 }} />
                                            </Box>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Right Column - Payment Selection Skeleton */}
                        <Grid item xs={12} md={5}>
                            <Card sx={{ p: 4, borderRadius: 4 }}>
                                <Box sx={{ width: '60%', height: 32, bgcolor: alpha(theme.palette.grey[400], 0.2), borderRadius: 1, mb: 2 }} />
                                <Box sx={{ width: '80%', height: 20, bgcolor: alpha(theme.palette.grey[400], 0.1), borderRadius: 1, mb: 4 }} />

                                <Stack spacing={2} mb={4}>
                                    {[1, 2].map(i => (
                                        <Box key={i} sx={{ height: 80, border: '1px solid', borderColor: alpha(theme.palette.grey[400], 0.2), borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(theme.palette.grey[400], 0.1) }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ width: '50%', height: 20, bgcolor: alpha(theme.palette.grey[400], 0.1), borderRadius: 1, mb: 1 }} />
                                                <Box sx={{ width: '80%', height: 16, bgcolor: alpha(theme.palette.grey[400], 0.05), borderRadius: 1 }} />
                                            </Box>
                                        </Box>
                                    ))}
                                </Stack>

                                <Box sx={{ height: 56, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 3 }} />
                            </Card>
                        </Grid>
                    </Grid>
                </Container>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.6; transform: scale(0.98); }
                    }
                    .MuiBox-root, .MuiCard-root {
                        animation: pulse 1.5s ease-in-out infinite;
                    }
                `}</style>
            </Box>
        );
    }

    if (!plan) return null;

    const features = getPlanFeatures();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
            <Container maxWidth="lg">
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 3 }}
                >
                    {t.backToPlans}
                </Button>

                <Grid container spacing={4}>
                    {/* Left Column - Plan Details */}
                    <Grid item xs={12} md={7}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card elevation={3}>
                                <Box sx={{
                                    p: 4,
                                    background: plan.color ? `linear-gradient(135deg, ${plan.color} 0%, ${alpha(plan.color, 0.7)} 100%)` : BRAND_COLORS.gradient,
                                    color: 'white'
                                }}>
                                    {plan.is_popular && (
                                        <Chip
                                            icon={<Star />}
                                            label={t.mostPopular}
                                            sx={{ bgcolor: 'white', color: plan.color || BRAND_COLORS.blue, fontWeight: 'bold', mb: 2 }}
                                        />
                                    )}
                                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                                        {plan.name}
                                    </Typography>
                                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                                        {plan.description}
                                    </Typography>
                                    <Box display="flex" alignItems="baseline" gap={1}>
                                        <Typography variant="h2" fontWeight="bold">
                                            {plan.price === 0 ? t.free : `${plan.price} ${t.currency}`}
                                        </Typography>
                                        <Typography variant="h6" sx={{ opacity: 0.8 }}>
                                            / {formatDuration(plan.duration_value, plan.duration_unit)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {t.whatsIncluded}
                                    </Typography>
                                    <List>
                                        {features.map((feature, idx) => (
                                            <ListItem key={idx} sx={{ px: 0 }}>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <Box sx={{
                                                        width: 24, height: 24, borderRadius: '50%',
                                                        bgcolor: alpha(plan.color || BRAND_COLORS.blue, 0.1),
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <Check sx={{ fontSize: 16, color: plan.color || BRAND_COLORS.blue }} />
                                                    </Box>
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={typeof feature === 'string' ? feature : feature.text || feature}
                                                    primaryTypographyProps={{ variant: 'body1' }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>

                                    <Divider sx={{ my: 3 }} />

                                    <Stack spacing={2}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Security color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {t.securePayment}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Verified color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {t.cancelAnytime}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Right Column - Payment */}
                    <Grid item xs={12} md={5}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card elevation={3}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                                        {t.paymentMethod}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {t.choosePreferred}
                                    </Typography>

                                    <FormControl component="fieldset" fullWidth sx={{ mb: 4 }}>
                                        {enabledProviders.length === 0 ? (
                                            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    No payment providers are currently enabled. Please contact support.
                                                </Typography>
                                            </Paper>
                                        ) : (
                                            <RadioGroup
                                                value={paymentProvider}
                                                onChange={(e) => setPaymentProvider(e.target.value)}
                                            >
                                                {enabledProviders.map((provider) => (
                                                    <Paper
                                                        key={provider.name}
                                                        variant="outlined"
                                                        sx={{
                                                            p: 2,
                                                            mb: 2,
                                                            cursor: 'pointer',
                                                            border: paymentProvider === provider.name ? `2px solid ${BRAND_COLORS.blue}` : '1px solid',
                                                            borderColor: paymentProvider === provider.name ? BRAND_COLORS.blue : 'divider'
                                                        }}
                                                        onClick={() => setPaymentProvider(provider.name)}
                                                    >
                                                        <FormControlLabel
                                                            value={provider.name}
                                                            control={<Radio />}
                                                            label={
                                                                <Box display="flex" alignItems="center" gap={2}>
                                                                    {provider.name === 'chapa' ? <CreditCard /> : <AccountBalance />}
                                                                    <Box>
                                                                        <Typography variant="body1" fontWeight="bold">
                                                                            {provider.display_name}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {provider.config?.description || (provider.name === 'chapa' ? t.cardsMobileMoney : t.ethiopianGateway)}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            }
                                                        />
                                                    </Paper>
                                                ))}
                                            </RadioGroup>
                                        )}
                                    </FormControl>

                                    <Divider sx={{ mb: 3 }} />

                                    {/* Order Summary */}
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {t.orderSummary}
                                    </Typography>
                                    <Stack spacing={2} sx={{ mb: 3 }}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">{t.plan}</Typography>
                                            <Typography variant="body2" fontWeight="500">{plan.name}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">{t.duration}</Typography>
                                            <Typography variant="body2" fontWeight="500">
                                                {formatDuration(plan.duration_value, plan.duration_unit)}
                                            </Typography>
                                        </Box>
                                        <Divider />
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="h6" fontWeight="bold">{t.total}</Typography>
                                            <Typography variant="h6" fontWeight="bold" color="primary">
                                                {plan.price} {t.currency}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={handlePayment}
                                        disabled={paymentStatus === 'processing' || (plan.price > 0 && enabledProviders.length === 0)}
                                        sx={{
                                            py: 2,
                                            background: BRAND_COLORS.gradient,
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            '&:hover': {
                                                background: BRAND_COLORS.blue
                                            }
                                        }}
                                    >
                                        {paymentStatus === 'processing' ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : plan.price === 0 ? (
                                            t.activateFree
                                        ) : (
                                            `${t.pay} ${plan.price} ${t.currency}`
                                        )}
                                    </Button>

                                    <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mt={2}>
                                        {t.termsAgreement}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>

                {/* Mount the Payment Modal */}
                <PaymentProcessingModal
                    open={paymentStatus !== 'idle'}
                    status={paymentStatus}
                    error={paymentError}
                    onRetry={handleRetry}
                    onClose={handleCloseModal}
                />
            </Container>
        </Box>
    );
};



export default CheckoutPage;
