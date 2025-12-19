// Rebuild trigger
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button,
    Stack, Chip, CircularProgress, useTheme, alpha, useMediaQuery,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { Check, Close, Home, DirectionsCar, ExpandMore } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
    en: {
        homesTitle: 'Real Estate Plans',
        homesSubtitle: 'List your properties and reach potential buyers & tenants',
        carsTitle: 'Vehicle Listing Plans',
        carsSubtitle: 'Sell your cars faster with premium listing features',
        startFree: "Start for Free",
        choosePlan: "Choose Plan",
        mostPopular: "MOST POPULAR",
        free: "FREE",
        noPlans: "No plans currently available for this category.",
        unlimited: "Unlimited",
        postsIncluded: "posts included",
        viewAll: "View all",
        viewPremium: "View premium",
        active: "active",
        featuredListings: "Featured Listings",
        prioritySupport: "Priority Support",
        post: "Post",
        categories: {
            homes: "Homes",
            cars: "Cars"
        }
    },
    am: {
        homesTitle: 'የሪል እስቴት እቅዶች',
        homesSubtitle: 'ንብረቶችዎን ይዘርዝሩ እና ገዢዎችን እና ተከራዮችን ያግኙ',
        carsTitle: 'የተሽከርካሪ ዝርዝር እቅዶች',
        carsSubtitle: 'መኪናዎን በፍጥነት ይሽጡ',
        startFree: "በነጻ ይጀምሩ",
        choosePlan: "እቅድ ይምረጡ",
        mostPopular: "በጣም ታዋቂ",
        free: "ነፃ",
        noPlans: "ለዚህ ምድብ በአሁኑ ጊዜ ምንም እቅዶች የሉም።",
        unlimited: "ያልተገደበ",
        postsIncluded: "ልጥፎች ተካትተዋል",
        viewAll: "ሁሉንም ይመልከቱ",
        viewPremium: "ፕሪሚየም ይመልከቱ",
        active: "ንቁ",
        featuredListings: "ተለይተው የቀረቡ ዝርዝሮች",
        prioritySupport: "ቅድሚያ የሚሰጠው ድጋፍ",
        post: "ለጥፍ",
        categories: {
            homes: "ቤቶች",
            cars: "መኪናዎች"
        }
    },
    om: {
        homesTitle: 'Karoora Mana Jireenyaa',
        homesSubtitle: 'Qabeenya keessan tarreessaa fi bitattoota argadhaa',
        carsTitle: 'Karoora Tarree Konkolaataa',
        carsSubtitle: 'Konkolaataa keessan dafaa gurguuraa',
        startFree: "Bilisaan Jalqabaa",
        choosePlan: "Karoora Filadhaa",
        mostPopular: "BAAY'EE BEEKAMAA",
        free: "BILISA",
        noPlans: "Paakeejiin gosa kanaa yeroo ammaa hin jiru.",
        unlimited: "Daangaa Hin Qabne",
        postsIncluded: "maxxansawwan hammatamaniiru",
        viewAll: "Hunda Ilaali",
        viewPremium: "Olaanaa Ilaali",
        active: "kan hojjetu",
        featuredListings: "Tarreeffama Filatamaa",
        prioritySupport: "Deeggarsa Dursee Kennamu",
        post: "Maxxansuuf",
        categories: {
            homes: "Manneen",
            cars: "Konkolaataa"
        }
    },
    ti: {
        homesTitle: 'መደባት ቤትን ንብረትን',
        homesSubtitle: 'ንብረትኩም ዘርዝሩን ዓደምትን ተካረይትን ርከቡ',
        carsTitle: 'መደባት ዝርዝር መኪና',
        carsSubtitle: 'መኪናኩም ብቀሊሉ ሽጡ',
        startFree: "ብነጻ ጀምሩ",
        choosePlan: "መደብ ምረጹ",
        mostPopular: "ብዝያዳ ፍቱው",
        free: "ነፃ",
        noPlans: "ንዚ መደብ እዚ ዝኸውን መደባት የለን።",
        unlimited: "ዘይተገደበ",
        postsIncluded: "ልጥፋት ተኻቲቶም",
        viewAll: "ኩሉ ረአ",
        viewPremium: "ፕሪሚየም ረአ",
        active: "ናይ ስራሕ",
        featuredListings: "ዝተመረጹ ዝርዝራት",
        prioritySupport: "ቀዳማይ ዝወሃብ ደገፍ",
        post: "ለጥፍ",
        categories: {
            homes: "ኣባይቲ",
            cars: "መካይን"
        }
    }
};

const HomesCarsPricingPage = ({ category: propCategory }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const { user: currentUser } = useAuth();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    // Determine category from prop or URL path
    const pathCategory = location.pathname.includes('homes') ? 'homes' : location.pathname.includes('cars') ? 'cars' : 'homes';
    const category = propCategory || pathCategory;

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userPlan, setUserPlan] = useState(null);
    const [subscribingId, setSubscribingId] = useState(null);

    const categoryConfig = {
        homes: {
            title: t.homesTitle,
            subtitle: t.homesSubtitle,
            icon: <Home sx={{ fontSize: isMobile ? 40 : 60, color: '#10B981' }} />,
            color: '#10B981', // Emerald
            gradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)'
        },
        cars: {
            title: t.carsTitle,
            subtitle: t.carsSubtitle,
            icon: <DirectionsCar sx={{ fontSize: isMobile ? 40 : 60, color: '#F59E0B' }} />,
            color: '#F59E0B', // Amber
            gradient: 'linear-gradient(135deg, #D97706 0%, #FBBF24 100%)'
        }
    };

    const config = categoryConfig[category];

    useEffect(() => {
        fetchPlans();
        fetchUserPlan();
    }, [category]);

    const fetchPlans = async () => {
        try {
            setLoading(true);

            // Fetch directly using the shared supabase client (handles public/user auth correctly)
            const { data: allPlans, error } = await supabase
                .from('membership_plans')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;

            // Filter plans relevant to this category
            const filteredPlans = (allPlans || []).filter(p => {
                const limit = p.category_limits?.[category];
                const permissions = p.permissions || {};
                const viewAccess = permissions.view_access?.[category];

                // Show if posting is allowed OR view access is allowed
                // If viewAccess is undefined, we rely on limit
                const canPost = limit !== undefined && limit !== 0;
                const canView = viewAccess === true || viewAccess === -1 || (typeof viewAccess === 'number' && viewAccess > 0);

                return canPost || canView;
            }).map(plan => ({
                ...plan,
                features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
                limits: typeof plan.limits === 'string' ? JSON.parse(plan.limits) : plan.limits
            }));

            setPlans(filteredPlans);
        } catch (error) {
            console.error('Error fetching plans:', error);
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPlan = async () => {
        // Updated to skip legacy RPC for now.
        // Logic should be migrated to check user_subscriptions table.
    };

    const handleSelectPlan = async (plan) => {
        // No async fetch needed, user is available from context
        if (!currentUser) {
            toast.error('Please login to select a plan');
            navigate('/auth');
            return;
        }

        setSubscribingId(plan.id);

        if (plan.price === 0) {
            toast.success('Free plan activated!');
            setTimeout(() => {
                navigate(`/post-ad?category=${category}`);
            }, 1000);
            return;
        }

        navigate(`/checkout?plan=${plan.slug || plan.id}`, { state: { plan } });
    };

    const getFeaturesList = (plan) => {
        const features = [];
        const limit = plan.category_limits?.[category];
        const permissions = plan.permissions || {};
        const canView = permissions.view_access?.[category];

        // Posting Limits
        const catLabel = t.categories?.[category] || category;
        if (limit === -1) {
            features.push({ text: `${t.unlimited} ${catLabel}`, included: true });
        } else if (limit > 0) {
            features.push({ text: `${limit} ${catLabel} ${t.postsIncluded}`, included: true });
        } else {
            features.push({ text: `${t.post} ${catLabel}`, included: false });
        }

        // View Access
        const viewAccess = permissions.view_access?.[category];
        if (viewAccess === -1 || viewAccess === true || (typeof viewAccess === 'number' && viewAccess > 0)) {
            features.push({ text: `${t.viewAll} ${catLabel}`, included: true });
        } else {
            features.push({ text: `${t.viewPremium} ${catLabel}`, included: false });
        }

        // Duration formatting
        const durationValue = plan.duration_value || 1;
        const durationUnit = plan.duration_unit || 'months';
        features.push({ text: `${durationValue} ${durationUnit} ${t.active}`, included: true });

        // Add features from the features array or string
        const planFeatures = Array.isArray(plan.features) ? plan.features :
            (typeof plan.features === 'string' ? JSON.parse(plan.features) : []);

        planFeatures.forEach(f => {
            const text = typeof f === 'string' ? f : f.text;
            features.push({ text: text, included: true });
        });

        if (permissions.can_post_featured) features.push({ text: t.featuredListings, included: true });
        if (permissions.priority_support) features.push({ text: t.prioritySupport, included: true });

        return features;
    };

    const FeaturesDisplay = ({ plan }) => {
        const allFeatures = getFeaturesList(plan);
        // Show top 3 features, hide rest in accordion on mobile
        const topFeatures = allFeatures.slice(0, 3);
        const otherFeatures = allFeatures.slice(3);

        const FeatureItem = ({ feature }) => (
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Box component="span" sx={{
                    width: 18, height: 18, borderRadius: '50%',
                    bgcolor: feature.included ? alpha(config.color, 0.1) : alpha(theme.palette.grey[400], 0.1),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    {feature.included ? <Check sx={{ fontSize: 12, color: config.color }} /> : <Close sx={{ fontSize: 12, color: theme.palette.grey[400] }} />}
                </Box>
                <Typography variant="body2" color={feature.included ? 'text.primary' : 'text.disabled'} fontSize={isMobile ? '0.85rem' : '0.875rem'}>
                    {feature.text}
                </Typography>
            </Box>
        );

        if (!isMobile) {
            return (
                <Stack spacing={0} mb={3}>
                    {allFeatures.map((f, i) => <FeatureItem key={i} feature={f} />)}
                </Stack>
            );
        }

        return (
            <Box mb={2}>
                <Stack spacing={0}>
                    {topFeatures.map((f, i) => <FeatureItem key={i} feature={f} />)}
                </Stack>
                {otherFeatures.length > 0 && (
                    <Accordion disableGutters elevation={0} sx={{
                        '&:before': { display: 'none' },
                        bgcolor: 'transparent',
                        mt: 0
                    }}>
                        <AccordionSummary
                            expandIcon={<ExpandMore color="primary" fontSize="small" />}
                            sx={{ p: 0, minHeight: 32, '& .MuiAccordionSummary-content': { m: 0 } }}
                        >
                            <Typography variant="caption" color="primary" fontWeight="bold">
                                See {otherFeatures.length} more features
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0, pt: 1 }}>
                            {otherFeatures.map((f, i) => <FeatureItem key={i} feature={f} />)}
                        </AccordionDetails>
                    </Accordion>
                )}
            </Box>
        );
    };

    // Skeleton Loader Component
    const PricingCardSkeleton = () => (
        <Card sx={{
            height: '100%',
            borderRadius: 4,
            bgcolor: theme.palette.background.paper,
            overflow: 'hidden'
        }}>
            <Box sx={{
                p: 4,
                background: `linear-gradient(135deg, ${alpha(config.color, 0.3)} 0%, ${alpha(config.color, 0.1)} 100%)`,
            }}>
                <Box sx={{ width: '60%', height: 28, bgcolor: alpha(theme.palette.common.white, 0.3), borderRadius: 1, mb: 2 }} />
                <Box sx={{ width: '80%', height: 16, bgcolor: alpha(theme.palette.common.white, 0.2), borderRadius: 1, mb: 3 }} />
                <Box sx={{ width: '40%', height: 40, bgcolor: alpha(theme.palette.common.white, 0.3), borderRadius: 1 }} />
            </Box>
            <CardContent sx={{ p: isMobile ? 2.5 : 4 }}>
                <Stack spacing={2}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Box key={i} display="flex" gap={1.5}>
                            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: alpha(theme.palette.grey[400], 0.2) }} />
                            <Box sx={{ flex: 1, height: 18, bgcolor: alpha(theme.palette.grey[400], 0.2), borderRadius: 1 }} />
                        </Box>
                    ))}
                </Stack>
                <Box sx={{ mt: 4, height: 48, bgcolor: alpha(config.color, 0.1), borderRadius: 3 }} />
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                background: theme.palette.mode === 'dark' ? theme.palette.background.default : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                py: { xs: 4, md: 8 },
                color: theme.palette.text.primary
            }}>
                <Container maxWidth="lg">
                    {/* Header Skeleton */}
                    <Box textAlign="center" mb={isMobile ? 4 : 8}>
                        <Box sx={{
                            width: 60, height: 60, borderRadius: '50%', bgcolor: alpha(config.color, 0.1), mx: 'auto', mb: 2,
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                        <Box sx={{
                            width: 300, height: 48, bgcolor: alpha(config.color, 0.1), borderRadius: 2, mx: 'auto', mb: 2,
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }} />
                        <Box sx={{
                            width: { xs: '90%', md: 500 }, height: 24, bgcolor: alpha(theme.palette.grey[400], 0.1), borderRadius: 1, mx: 'auto',
                            animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                        }} />
                    </Box>

                    {/* Cards Skeleton */}
                    <Grid container spacing={isMobile ? 2 : 4} justifyContent="center" px={isMobile ? 1 : 0}>
                        {[1, 2, 3].map((i) => (
                            <Grid item xs={12} md={4} key={i}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                >
                                    <PricingCardSkeleton />
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.6; transform: scale(0.98); }
                    }
                `}</style>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: theme.palette.mode === 'dark' ? theme.palette.background.default : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            py: { xs: 4, md: 8 },
            transition: 'background 0.3s',
            color: theme.palette.text.primary
        }}>
            <Container maxWidth="lg">
                <Box textAlign="center" mb={isMobile ? 4 : 8}>
                    <Box mb={1}>{config.icon}</Box>
                    <Typography variant={isMobile ? "h4" : "h2"} fontWeight="800" gutterBottom sx={{ color: theme.palette.text.primary, px: 2 }}>
                        {config.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 600, mx: 'auto', mb: 3, px: 2 }}>
                        {config.subtitle}
                    </Typography>

                    {userPlan && (
                        <Chip
                            label={`Current Plan: ${userPlan.plan_name}`}
                            sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main,
                                fontWeight: 'bold', py: 2
                            }}
                        />
                    )}
                </Box>

                {plans.length === 0 ? (
                    <Box textAlign="center" py={5}>
                        <Typography variant="h6" color="text.secondary">{t.noPlans}</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={isMobile ? 2 : 4} justifyContent="center" px={isMobile ? 1 : 0}>
                        {plans.map((plan, index) => (
                            <Grid item xs={12} md={4} key={plan.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <Card sx={{
                                        height: '100%',
                                        borderRadius: 4,
                                        overflow: 'visible',
                                        position: 'relative',
                                        border: plan.is_popular ? `2px solid ${config.color}` : 'none',
                                        boxShadow: theme.shadows[plan.is_popular ? 8 : 2],
                                        bgcolor: theme.palette.background.paper
                                    }}>
                                        {plan.is_popular && (
                                            <Box sx={{
                                                position: 'absolute', top: -12, right: '50%', transform: 'translateX(50%)',
                                                background: config.gradient,
                                                color: 'white', px: 2, py: 0.5, borderRadius: 10,
                                                fontSize: '0.7rem', fontWeight: 'bold', zIndex: 2, width: 'max-content'
                                            }}>
                                                {plan.badge_text || t.mostPopular}
                                            </Box>
                                        )}

                                        <Box sx={{
                                            p: isMobile ? 3 : 4,
                                            background: plan.price > 0
                                                ? `linear-gradient(135deg, ${config.color} 0%, ${alpha(config.color, 0.7)} 100%)`
                                                : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                                            color: 'white',
                                            borderTopLeftRadius: 16, borderTopRightRadius: 16
                                        }}>
                                            <Typography variant="h5" fontWeight="bold">{plan.name}</Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9, minHeight: isMobile ? 'auto' : 40, mb: 1 }}>
                                                {plan.description}
                                            </Typography>
                                            <Typography variant="h4" fontWeight="bold">
                                                {plan.price === 0 ? t.free : `${plan.price} ${plan.currency || 'ETB'}`}
                                            </Typography>
                                        </Box>

                                        <CardContent sx={{ p: isMobile ? 2.5 : 4 }}>
                                            <FeaturesDisplay plan={plan} />

                                            <Button
                                                fullWidth
                                                variant="contained"
                                                size="large"
                                                onClick={() => handleSelectPlan(plan)}
                                                disabled={subscribingId !== null}
                                                sx={{
                                                    py: 1.5,
                                                    borderRadius: 3,
                                                    background: plan.price > 0 ? config.gradient : theme.palette.grey[800],
                                                    fontSize: '1rem',
                                                    fontWeight: 'bold',
                                                    boxShadow: theme.shadows[4],
                                                    textTransform: 'none',
                                                    color: 'white',
                                                    position: 'relative'
                                                }}
                                            >
                                                {subscribingId === plan.id ? (
                                                    <CircularProgress size={24} sx={{ color: 'white' }} />
                                                ) : (
                                                    plan.price === 0 ? t.startFree : t.choosePlan
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default HomesCarsPricingPage;
