import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/api';
import toast from 'react-hot-toast';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button,
    Stack, Chip, useTheme, alpha, IconButton, Fade
} from '@mui/material';
import {
    DirectionsCar, Home, Work, Gavel, Check, ArrowBack, Star
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
    en: {
        title: "Choose Your Category",
        subtitle: "Select the category you want to post in",
        backToCategories: "Back to Categories",
        choosePlan: "Choose Plan",
        subscribe: "Subscribe Now",
        free: "FREE",
        popular: "POPULAR",
        unlimited: "Unlimited",
        posts: "posts",
        month: "month",
        viewAccess: "View Access",
        viewAll: "View All",
        viewUnlimited: "Unlimited Viewing",
        categories: {
            cars: { name: "Cars & Vehicles", desc: "Post your car or browse thousands of listings" },
            homes: { name: "Homes & Real Estate", desc: "List your property or find your dream home" },
            jobs: { name: "Jobs & Recruitment", desc: "Post jobs or discover career opportunities" },
            tenders: { name: "Tenders & Bids", desc: "Post tenders or find business opportunities" }
        }
    },
    am: {
        title: "ምድብዎን ይምረጡ",
        subtitle: "መለጠፍ የሚፈልጉበትን ምድብ ይምረጡ",
        backToCategories: "ወደ ምድቦች ተመለስ",
        choosePlan: "እቅድ ይምረጡ",
        subscribe: "አሁን ይመዝገቡ",
        free: "ነፃ",
        popular: "ታዋቂ",
        unlimited: "ያልተገደበ",
        posts: "ልጥፎች",
        month: "ወር",
        viewAccess: "የመመልከት መብት",
        viewAll: "ሁሉንም ይመልከቱ",
        viewUnlimited: "ያልተገደበ መመልከት",
        categories: {
            cars: { name: "መኪናዎች እና ተሽከርካሪዎች", desc: "መኪናዎን ያስተዋውቁ ወይም በሺዎች የሚቆጠሩ ዝርዝሮችን ይመልከቱ" },
            homes: { name: "ቤቶች እና ሪል እስቴት", desc: "ንብረትዎን ይዘርዝሩ ወይም የህልም ቤትዎን ያግኙ" },
            jobs: { name: "ስራዎች እና ቅጥር", desc: "ስራዎችን ያስተዋውቁ ወይም የስራ እድሎችን ያግኙ" },
            tenders: { name: "ጨረታዎች", desc: "ጨረታዎችን ያስተዋውቁ ወይም የንግድ እድሎችን ያግኙ" }
        }
    },
    om: {
        title: "Gita Keessan Filadhaa",
        subtitle: "Gita maxxansuu barbaaddan filadhaa",
        backToCategories: "Gara Gitaawwaniitti Deebi'aa",
        choosePlan: "Karoora Filadhaa",
        subscribe: "Amma Galmaa'aa",
        free: "BILISA",
        popular: "BEEKAMAA",
        unlimited: "Daangaa Hin Qabne",
        posts: "maxxansawwan",
        month: "ji'a",
        viewAccess: "Mirga Ilaaluu",
        viewAll: "Hunda Ilaali",
        viewUnlimited: "Ilaaluu Daangaa Hin Qabne",
        categories: {
            cars: { name: "Konkolaataa fi Geejjibaa", desc: "Konkolaata keessan beeksisaa ykn tarreeffama kumaatama ilaali" },
            homes: { name: "Manneen fi Qabeenya", desc: "Qabeenya keessan tarreessaa ykn mana abjuu keessan argadhaa" },
            jobs: { name: "Hojiiwwan fi Qacarta", desc: "Hojii beeksisaa ykn carraa hojii argadhaa" },
            tenders: { name: "Caalbaasii", desc: "Caalbaasii beeksisaa ykn carraa daldalaa argadhaa" }
        }
    },
    ti: {
        title: "ምድብኩም ምረጹ",
        subtitle: "ክትለጥፍዎ እትደልዩ ምድብ ምረጹ",
        backToCategories: "ናብ ምድባት ተመለሱ",
        choosePlan: "መደብ ምረጹ",
        subscribe: "ሕጂ ተመዝገቡ",
        free: "ነፃ",
        popular: "ፍቱው",
        unlimited: "ዘይተገደበ",
        posts: "ልጥፋት",
        month: "ወርሒ",
        viewAccess: "መሰል ምርኣይ",
        viewAll: "ኩሉ ረአ",
        viewUnlimited: "ዘይተገደበ ምርኣይ",
        categories: {
            cars: { name: "መካይንን ተሽከርካሪታትን", desc: "መኪናኹም ኣስተዋውቑ ወይ ብኣሽሓት ዝቑጸሩ ዝርዝራት ርአዩ" },
            homes: { name: "ኣባይትን ንብረትን", desc: "ንብረትኩም ዘርዝሩ ወይ ናይ ሕልምኹም ገዛ ርከቡ" },
            jobs: { name: "ስራሕትን ቆጽራን", desc: "ስራሕ ኣስተዋውቑ ወይ ናይ ስራሕ ዕድላት ርከቡ" },
            tenders: { name: "ጨረታታት", desc: "ጨረታታት ኣስተዋውቑ ወይ ናይ ንግዲ ዕድላት ርከቡ" }
        }
    }
};

const categoryConfig = {
    cars: {
        icon: DirectionsCar,
        color: '#F59E0B',
        gradient: 'linear-gradient(135deg, #D97706 0%, #FBBF24 100%)',
        bgGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
    },
    homes: {
        icon: Home,
        color: '#10B981',
        gradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
        bgGradient: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
    },
    jobs: {
        icon: Work,
        color: '#E53935',
        gradient: 'linear-gradient(135deg, #B91C1C 0%, #EF4444 100%)',
        bgGradient: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)'
    },
    tenders: {
        icon: Gavel,
        color: '#FB8C00',
        gradient: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
        bgGradient: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)'
    }
};

const SimplifiedPricingPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;
    const [searchParams, setSearchParams] = useSearchParams();

    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedCategory) {
            fetchPlansForCategory(selectedCategory);
        }
    }, [selectedCategory]);

    const fetchPlansForCategory = async (category) => {
        try {
            setLoading(true);
            const { data: allPlans, error } = await supabase
                .from('membership_plans')
                .select('*')
                .eq('is_active', true)
                .order('price', { ascending: true });

            if (error) throw error;

            // Filter plans that have posting limits OR viewing access for this category
            const filteredPlans = (allPlans || []).filter(p => {
                const limit = p.category_limits?.[category];
                const viewAccess = p.permissions?.view_access?.[category];

                // Show plan if it has posting capability OR viewing access
                const canPost = limit !== undefined && limit !== 0;
                const canView = viewAccess === true || viewAccess === -1 || (typeof viewAccess === 'number' && viewAccess > 0);

                return canPost || canView;
            });

            setPlans(filteredPlans);
        } catch (error) {
            console.error('Error fetching plans:', error);
            toast.error('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setSearchParams({ category });
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setSearchParams({});
    };

    const handleSelectPlan = async (plan) => {
        if (!user) {
            toast.error('Please login to subscribe');
            navigate('/auth');
            return;
        }

        if (plan.price === 0) {
            try {
                const { data: existingSub } = await supabase
                    .from('user_subscriptions')
                    .select('id, status')
                    .eq('user_id', user.id)
                    .eq('plan_id', plan.id)
                    .maybeSingle();

                if (existingSub) {
                    const { error: updateError } = await supabase
                        .from('user_subscriptions')
                        .update({
                            status: 'active',
                            start_date: new Date().toISOString(),
                            end_date: null,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existingSub.id);

                    if (updateError) throw updateError;
                } else {
                    const { error: insertError } = await supabase
                        .from('user_subscriptions')
                        .insert({
                            user_id: user.id,
                            plan_id: plan.id,
                            status: 'active',
                            start_date: new Date().toISOString(),
                            end_date: null
                        });

                    if (insertError) throw insertError;
                }

                toast.success(`${plan.name} activated! You can now post.`);
                setTimeout(() => navigate('/post-ad'), 1500);
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to activate plan');
            }
            return;
        }

        navigate(`/checkout?plan=${plan.slug || plan.id}`, { state: { plan } });
    };

    // Category Selection Screen
    if (!selectedCategory) {
        return (
            <Box sx={{
                minHeight: '100vh',
                background: theme.palette.mode === 'dark'
                    ? theme.palette.background.default
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 8,
                color: 'white'
            }}>
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Typography variant="h2" fontWeight="800" textAlign="center" mb={2}>
                            {t.title}
                        </Typography>
                        <Typography variant="h6" textAlign="center" mb={8} sx={{ opacity: 0.9 }}>
                            {t.subtitle}
                        </Typography>

                        <Grid container spacing={4}>
                            {Object.entries(categoryConfig).map(([key, config], index) => {
                                const Icon = config.icon;
                                const categoryInfo = t.categories[key];

                                return (
                                    <Grid item xs={12} sm={6} md={3} key={key}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        >
                                            <Card
                                                onClick={() => handleCategorySelect(key)}
                                                sx={{
                                                    height: 280,
                                                    cursor: 'pointer',
                                                    borderRadius: 4,
                                                    background: config.bgGradient,
                                                    transition: 'all 0.3s ease',
                                                    border: '3px solid transparent',
                                                    '&:hover': {
                                                        transform: 'translateY(-12px)',
                                                        boxShadow: `0 20px 40px ${alpha(config.color, 0.3)}`,
                                                        border: `3px solid ${config.color}`
                                                    }
                                                }}
                                            >
                                                <CardContent sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    textAlign: 'center',
                                                    p: 4
                                                }}>
                                                    <Box
                                                        sx={{
                                                            width: 100,
                                                            height: 100,
                                                            borderRadius: '50%',
                                                            background: config.gradient,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            mb: 3,
                                                            boxShadow: `0 10px 30px ${alpha(config.color, 0.3)}`
                                                        }}
                                                    >
                                                        <Icon sx={{ fontSize: 50, color: 'white' }} />
                                                    </Box>
                                                    <Typography variant="h5" fontWeight="bold" color={config.color} mb={1}>
                                                        {categoryInfo.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {categoryInfo.desc}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </motion.div>
                </Container>
            </Box>
        );
    }

    // Plans Display Screen
    const config = categoryConfig[selectedCategory];
    const Icon = config.icon;
    const categoryInfo = t.categories[selectedCategory];

    return (
        <Box sx={{
            minHeight: '100vh',
            background: theme.palette.mode === 'dark'
                ? theme.palette.background.default
                : config.bgGradient,
            py: 8
        }}>
            <Container maxWidth="lg">
                <Fade in={true}>
                    <Box>
                        {/* Back Button */}
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={handleBackToCategories}
                            sx={{
                                mb: 4,
                                color: config.color,
                                fontWeight: 'bold',
                                '&:hover': { bgcolor: alpha(config.color, 0.1) }
                            }}
                        >
                            {t.backToCategories}
                        </Button>

                        {/* Category Header */}
                        <Box textAlign="center" mb={6}>
                            <Box
                                sx={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: '50%',
                                    background: config.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                    boxShadow: `0 15px 40px ${alpha(config.color, 0.4)}`
                                }}
                            >
                                <Icon sx={{ fontSize: 60, color: 'white' }} />
                            </Box>
                            <Typography variant="h3" fontWeight="800" color={config.color} mb={1}>
                                {categoryInfo.name}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                {categoryInfo.desc}
                            </Typography>
                        </Box>

                        {/* Plans Grid */}
                        {loading ? (
                            <Typography textAlign="center">Loading plans...</Typography>
                        ) : plans.length === 0 ? (
                            <Typography textAlign="center" variant="h6" color="text.secondary">
                                No plans available for this category
                            </Typography>
                        ) : (
                            <Grid container spacing={4} justifyContent="center">
                                {plans.map((plan, index) => {
                                    const limit = plan.category_limits?.[selectedCategory];

                                    return (
                                        <Grid item xs={12} md={4} key={plan.id}>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                            >
                                                <Card sx={{
                                                    height: '100%',
                                                    borderRadius: 4,
                                                    position: 'relative',
                                                    border: plan.is_popular ? `3px solid ${config.color}` : 'none',
                                                    boxShadow: plan.is_popular ? `0 15px 40px ${alpha(config.color, 0.3)}` : theme.shadows[3],
                                                    transition: 'all 0.3s',
                                                    '&:hover': {
                                                        transform: 'translateY(-8px)',
                                                        boxShadow: `0 20px 50px ${alpha(config.color, 0.4)}`
                                                    }
                                                }}>
                                                    {plan.is_popular && (
                                                        <Chip
                                                            icon={<Star />}
                                                            label={t.popular}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -15,
                                                                right: 20,
                                                                background: config.gradient,
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                    )}

                                                    {/* Plan Header */}
                                                    <Box sx={{
                                                        p: 4,
                                                        background: plan.price > 0 ? config.gradient : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                                                        color: 'white',
                                                        textAlign: 'center'
                                                    }}>
                                                        <Typography variant="h5" fontWeight="bold" mb={1}>
                                                            {plan.name}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                                                            {plan.description}
                                                        </Typography>
                                                        <Typography variant="h3" fontWeight="bold">
                                                            {plan.price === 0 ? t.free : `${plan.price} ETB`}
                                                        </Typography>
                                                        {plan.price > 0 && (
                                                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                                per {t.month}
                                                            </Typography>
                                                        )}
                                                    </Box>

                                                    {/* Plan Features */}
                                                    <CardContent sx={{ p: 4 }}>
                                                        <Stack spacing={2} mb={4}>
                                                            {/* Posting Limit */}
                                                            {limit !== undefined && limit !== 0 && (
                                                                <Box display="flex" alignItems="center" gap={2}>
                                                                    <Check sx={{ color: config.color, fontSize: 24 }} />
                                                                    <Typography variant="h6" fontWeight="bold">
                                                                        {limit === -1 ? t.unlimited : limit} {t.posts}
                                                                    </Typography>
                                                                </Box>
                                                            )}

                                                            {/* Viewing Access */}
                                                            {(() => {
                                                                const viewAccess = plan.permissions?.view_access?.[selectedCategory];
                                                                if (viewAccess === -1 || viewAccess === true) {
                                                                    return (
                                                                        <Box display="flex" alignItems="center" gap={2}>
                                                                            <Check sx={{ color: config.color, fontSize: 24 }} />
                                                                            <Typography variant="h6" fontWeight="bold">
                                                                                {t.viewUnlimited}
                                                                            </Typography>
                                                                        </Box>
                                                                    );
                                                                } else if (typeof viewAccess === 'number' && viewAccess > 0) {
                                                                    return (
                                                                        <Box display="flex" alignItems="center" gap={2}>
                                                                            <Check sx={{ color: config.color, fontSize: 24 }} />
                                                                            <Typography variant="h6" fontWeight="bold">
                                                                                {t.viewAll} {viewAccess} {t.posts}
                                                                            </Typography>
                                                                        </Box>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}

                                                            {/* Additional Features */}
                                                            {(Array.isArray(plan.features) ? plan.features : []).map((feature, idx) => (
                                                                <Box key={idx} display="flex" alignItems="start" gap={2}>
                                                                    <Check sx={{ color: config.color, fontSize: 20, mt: 0.3 }} />
                                                                    <Typography variant="body2">
                                                                        {typeof feature === 'string' ? feature : feature.text}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Stack>

                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            size="large"
                                                            onClick={() => handleSelectPlan(plan)}
                                                            sx={{
                                                                py: 1.5,
                                                                borderRadius: 3,
                                                                background: plan.price > 0 ? config.gradient : theme.palette.grey[800],
                                                                fontWeight: 'bold',
                                                                fontSize: '1rem',
                                                                boxShadow: `0 8px 20px ${alpha(config.color, 0.3)}`,
                                                                '&:hover': {
                                                                    boxShadow: `0 12px 30px ${alpha(config.color, 0.5)}`
                                                                }
                                                            }}
                                                        >
                                                            {plan.price === 0 ? t.choosePlan : t.subscribe}
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default SimplifiedPricingPage;
