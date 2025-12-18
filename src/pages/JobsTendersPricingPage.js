// HMR Trigger
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button,
    Stack, Chip, CircularProgress, useTheme, alpha, useMediaQuery,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { Check, Close, ExpandMore } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
    en: {
        jobsTitle: 'Job Recruitment Packages',
        jobsSubtitle: 'Choose the perfect package to reach top talent',
        tendersTitle: 'Tender Access Packages',
        tendersSubtitle: 'Maximize your tender visibility and opportunities',
        startFree: "Start Free",
        choosePlan: "Choose Plan",
        mostPopular: "MOST POPULAR",
        free: "FREE",
        noPlans: "No plans currently available for this category.",
        unlimited: "Unlimited",
        postsIncluded: "posts included",
        viewAll: "View all",
        viewPremium: "View premium",
        visibility: "visibility",
        featuredListings: "Featured Listings",
        prioritySupport: "Priority Support",
        verifiedBadge: "Verified Badge",
        analyticsAccess: "Analytics Access",
        post: "Post",
        categories: {
            jobs: "Jobs",
            tenders: "Tenders"
        }
    },
    am: {
        jobsTitle: 'የስራ ቅጥር ጥቅሎች',
        jobsSubtitle: 'ከፍተኛ ተሰጥኦዎችን ለማግኘት ትክክለኛውን ጥቅል ይምረጡ',
        tendersTitle: 'የጨረታ መዳረሻ ጥቅሎች',
        tendersSubtitle: 'የጨረታ ታይነትዎን እና እድሎችዎን ያሳድጉ',
        startFree: "በነጻ ይጀምሩ",
        choosePlan: "እቅድ ይምረጡ",
        mostPopular: "በጣም ታዋቂ",
        free: "ነፃ",
        noPlans: "ለዚህ ምድብ በአሁኑ ጊዜ ምንም እቅዶች የሉም።",
        unlimited: "ያልተገደበ",
        postsIncluded: "ልጥፎች ተካትተዋል",
        viewAll: "ሁሉንም ይመልከቱ",
        viewPremium: "ፕሪሚየም ይመልከቱ",
        visibility: "ታይነት",
        featuredListings: "ተለይተው የቀረቡ ዝርዝሮች",
        prioritySupport: "ቅድሚያ የሚሰጠው ድጋፍ",
        verifiedBadge: "የተረጋገጠ ባጅ",
        analyticsAccess: "የትንታኔ መዳረሻ",
        post: "ለጥፍ",
        categories: {
            jobs: "ስራዎች",
            tenders: "ጨረታዎች"
        }
    },
    om: {
        jobsTitle: 'Paakeejiiwwan Qacarta Hojii',
        jobsSubtitle: 'Dandeettii olaanaa argachuuf paakeejii sirrii filadhaa',
        tendersTitle: 'Paakeejiiwwan Dhaqqabama Caalbaasii',
        tendersSubtitle: 'Mul\'isuu fi carraawwan caalbaasii keessan guddisaa',
        startFree: "Bilisaan Jalqabaa",
        choosePlan: "Karoora Filadhaa",
        mostPopular: "BAAY'EE BEEKAMAA",
        free: "BILISA",
        noPlans: "Paakeejiin gosa kanaa yeroo ammaa hin jiru.",
        unlimited: "Daangaa Hin Qabne",
        postsIncluded: "maxxansawwan hammatamaniiru",
        viewAll: "Hunda Ilaali",
        viewPremium: "Olaanaa Ilaali",
        visibility: "mul'achuu",
        featuredListings: "Tarreeffama Filatamaa",
        prioritySupport: "Deeggarsa Dursee Kennamu",
        verifiedBadge: "Mallattoo Mirkaneeffame",
        analyticsAccess: "Xiinxala",
        post: "Maxxansuuf",
        categories: {
            jobs: "Hojiiwwan",
            tenders: "Caalbaasii"
        }
    },
    ti: {
        jobsTitle: 'መጠቅለሊታት ቆጽራ ስራሕ',
        jobsSubtitle: 'ብሉጻት ተውህቦ ንምርካብ ትክክለኛ ጥቅል ምረጹ',
        tendersTitle: 'መጠቅለሊታት መእተዊ ጨረታ',
        tendersSubtitle: 'ናይ ጨረታ ተራእይነትኩምን ዕድላትኩምን ኣዕብዩ',
        startFree: "ብነጻ ጀምሩ",
        choosePlan: "መደብ ምረጹ",
        mostPopular: "ብዝያዳ ፍቱው",
        free: "ነፃ",
        noPlans: "ንዚ መደብ እዚ ዝኸውን መደባት የለን።",
        unlimited: "ዘይተገደበ",
        postsIncluded: "ልጥፋት ተኻቲቶም",
        viewAll: "ኩሉ ረአ",
        viewPremium: "ፕሪሚየም ረአ",
        visibility: "ተራእይነት",
        featuredListings: "ዝተመረጹ ዝርዝራት",
        prioritySupport: "ቀዳማይ ዝወሃብ ደገፍ",
        verifiedBadge: "ዝተረጋገለ ምልክት",
        analyticsAccess: "ትንታነታት",
        post: "ለጥፍ",
        categories: {
            jobs: "ስራሕቲ",
            tenders: "ጨረታታት"
        }
    }
};

const JobsTendersPricingPage = ({ category = 'jobs' }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;
    const { user: currentUser } = useAuth();

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userPlan, setUserPlan] = useState(null);

    const categoryConfig = {
        jobs: {
            title: t.jobsTitle,
            subtitle: t.jobsSubtitle,
            icon: '💼',
            color: '#E53935',
            gradient: 'linear-gradient(135deg, #B91C1C 0%, #EF4444 100%)'
        },
        tenders: {
            title: t.tendersTitle,
            subtitle: t.tendersSubtitle,
            icon: '🏛️',
            color: '#FB8C00',
            gradient: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)'
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
            console.log('Fetching plans for category:', category);

            // Fetch directly using the shared supabase client (handles public/user auth correctly)
            const { data: allPlans, error } = await supabase
                .from('membership_plans')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Supabase error fetching plans:', error);
                throw error;
            }

            console.log('Plans fetched:', allPlans?.length);

            const filteredPlans = (allPlans || []).filter(p => {
                const limit = p.category_limits?.[category];
                const permissions = p.permissions || {};
                const viewAccess = permissions.view_access?.[category];

                const hasPosting = limit !== 0 && limit !== undefined;
                const hasViewing = viewAccess === true;

                return hasPosting || hasViewing;
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
        // User subscription check needs update to new table user_subscriptions?
        // Or keep existing RPC if it still works? 
        // For now, let's silence it or use adminService.getAllSubscriptions with filter?
        // Let's keep it safe and minimal for now.
    };

    const handleSelectPlan = async (plan) => {
        if (!currentUser) {
            toast.error('Please login to subscribe');
            navigate('/auth');
            return;
        }

        // For FREE plans (price = 0), activate immediately
        if (plan.price === 0) {
            try {
                // Use RPC function to activate plan (bypasses RLS)
                const { data, error } = await supabase.rpc('activate_user_plan', {
                    p_user_id: currentUser.id,
                    p_plan_id: plan.id,
                    p_duration_days: 30
                });

                if (error) throw error;

                if (!data.success) {
                    if (data.already_active) {
                        toast.success('You already have this plan activated!');
                    } else {
                        toast.error(data.error || 'Failed to activate plan');
                    }
                    return;
                }

                toast.success(`${plan.name} activated successfully! You can now post ads.`);
                setTimeout(() => {
                    navigate('/post-ad');
                }, 1500);
            } catch (error) {
                console.error('Error activating plan:', error);
                toast.error(`Failed to activate plan: ${error.message}`);
            }
            return;
        }

        navigate(`/checkout?plan=${plan.slug || plan.id}`, { state: { plan } });
    };

    const getFeaturesList = (plan) => {
        const features = [];
        const limit = plan.category_limits?.[category];
        const permissions = plan.permissions || {};

        // Posting Limits
        // Posting Limits
        const catLabel = t.categories?.[category] || category;
        if (limit === -1) {
            features.push({ text: `${t.unlimited} ${catLabel} ${t.postsIncluded}`, included: true });
        } else if (limit > 0) {
            features.push({ text: `${limit} ${catLabel} ${t.postsIncluded}`, included: true });
        } else {
            // Limit is 0 or undefined
            features.push({ text: `${t.post} ${catLabel}`, included: false });
        }

        // View Access explicit check
        const viewAccess = permissions.view_access?.[category];
        if (viewAccess === -1 || viewAccess === true || (typeof viewAccess === 'number' && viewAccess > 0)) {
            features.push({ text: `${t.viewAll} ${catLabel}`, included: true });
        } else {
            features.push({ text: `${t.viewPremium} ${catLabel}`, included: false });
        }

        // Duration formatting
        const durationValue = plan.duration_value || 1;
        const durationUnit = plan.duration_unit || 'months';
        features.push({ text: `${durationValue} ${durationUnit} ${t.visibility}`, included: true });

        // Add features from the features array or string
        const planFeatures = Array.isArray(plan.features) ? plan.features :
            (typeof plan.features === 'string' ? JSON.parse(plan.features) : []);

        planFeatures.forEach(f => {
            const text = typeof f === 'string' ? f : f.text;
            features.push({ text: text, included: true });
        });

        // Add permission-based features if they exist
        if (permissions.can_post_featured) features.push({ text: t.featuredListings, included: true });
        if (permissions.priority_support) features.push({ text: t.prioritySupport, included: true });
        if (permissions.verified_badge) features.push({ text: t.verifiedBadge, included: true });
        if (permissions.analytics_access) features.push({ text: t.analyticsAccess, included: true });

        return features;
    };

    const FeaturesDisplay = ({ plan }) => {
        const allFeatures = getFeaturesList(plan);
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

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.palette.background.default }}>
                <CircularProgress sx={{ color: config.color }} />
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
                    <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '4rem' }, mb: 1 }}>{config.icon}</Typography>
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
                                        position: 'relative',
                                        borderRadius: 4,
                                        overflow: 'visible',
                                        transition: 'transform 0.3s',
                                        '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[10] },
                                        display: 'flex', flexDirection: 'column',
                                        border: plan.is_popular ? `2px solid ${config.color}` : 'none',
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
                                            <Box display="flex" alignItems="baseline">
                                                <Typography variant="h4" fontWeight="bold">
                                                    {plan.price === 0 ? t.free : `${plan.price} ${plan.currency || 'ETB'}`}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: isMobile ? 2.5 : 4 }}>
                                            <FeaturesDisplay plan={plan} />

                                            <Button
                                                fullWidth
                                                variant="contained"
                                                size="large"
                                                onClick={() => handleSelectPlan(plan)}
                                                sx={{
                                                    py: 1.5,
                                                    borderRadius: 3,
                                                    background: plan.price > 0 ? config.gradient : theme.palette.grey[800],
                                                    color: 'white',
                                                    textTransform: 'none',
                                                    fontWeight: 'bold',
                                                    boxShadow: theme.shadows[4]
                                                }}
                                            >
                                                {plan.price === 0 ? t.startFree : t.choosePlan}
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

export default JobsTendersPricingPage;
