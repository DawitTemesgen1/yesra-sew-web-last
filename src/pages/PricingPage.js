import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/api';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Accordion, AccordionSummary, AccordionDetails, Chip,
    Stack, ToggleButton, ToggleButtonGroup, CircularProgress, useTheme, alpha
} from '@mui/material';
import { Check, Close, ExpandMore, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
    en: {
        title: "Choose Your Perfect Plan",
        subtitle: "Unlock premium features and grow your business with our flexible membership plans",
        monthly: "Monthly",
        yearly: "Yearly",
        save20: "Save 20%",
        getStarted: "Get Started",
        subscribeNow: "Subscribe Now",
        detailedComparison: "Detailed Comparison",
        feature: "Feature",
        faqTitle: "Frequently Asked Questions",
        unlimited: "Unlimited",
        post: "Post",
        view: "View",
        featuredListings: "Featured Listings",
        prioritySupport: "Priority Support",
        verifiedBadge: "Verified Badge",
        analytics: "Analytics",
        mo: "mo",
        yr: "yr",
        currency: "ETB",
        free: "FREE",
        popular: "POPULAR",
        categories: {
            cars: "Cars",
            homes: "Homes",
            jobs: "Jobs",
            tenders: "Tenders"
        },
        faqs: [
            { q: 'Can I upgrade or downgrade my plan?', a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
            { q: 'What payment methods do you accept?', a: 'We accept Chapa and Arif Pay for convenient local payments in Ethiopia.' },
            { q: 'Is there a free trial?', a: 'Our Free plan gives you access to browse and explore. Upgrade anytime to unlock posting features.' },
        ],
        noPlans: "No plans currently available."
    },
    am: {
        title: "ትክክለኛውን እቅድ ይምረጡ",
        subtitle: "ፕሪሚየም ባህሪያትን ይክፈቱ እና ንግድዎን በተለዋዋጭ የአባልነት እቅዶቻችን ያሳድጉ",
        monthly: "በወር",
        yearly: "በዓመት",
        save20: "20% ይቆጥቡ",
        getStarted: "ይጀምሩ",
        subscribeNow: "አሁን ይመዝገቡ",
        detailedComparison: "ዝርዝር ንጽጽር",
        feature: "ባህሪ",
        faqTitle: "ተደጋግሞ የሚነሱ ጥያቄዎች",
        unlimited: "ያልተገደበ",
        post: "ለጥፍ",
        view: "ይመልከቱ",
        featuredListings: "ተለይተው የቀረቡ ዝርዝሮች",
        prioritySupport: "ቅድሚያ የሚሰጠው ድጋፍ",
        verifiedBadge: "የተረጋገጠ ባጅ",
        analytics: "ትንታኔዎች",
        mo: "ወር",
        yr: "ዓመት",
        currency: "ብር",
        free: "ነፃ",
        popular: "ታዋቂ",
        categories: {
            cars: "መኪናዎች",
            homes: "ቤቶች",
            jobs: "ስራዎች",
            tenders: "ጨረታዎች"
        },
        faqs: [
            { q: 'እቅዴን ማሻሻል ወይም መቀነስ እችላለሁ?', a: 'አዎ! በማንኛውም ጊዜ እቅድዎን ማሻሻል ወይም መቀነስ ይችላሉ። ለውጦች ወዲያውኑ ተግባራዊ ይሆናሉ።' },
            { q: 'ምን ዓይነት የመክፈያ ዘዴዎችን ይቀበላሉ?', a: 'ለቀላል የአገር ውስጥ ክፍያዎች ቻፓ እና አሪፍ ፔይን እንቀበላለን።' },
            { q: 'ነፃ ሙከራ አለ?', a: 'የእኛ ነፃ እቅድ ለማሰስ እና ለመዳሰስ ያስችልዎታል። የመለጠፍ ባህሪያትን ለመክፈት በማንኛውም ጊዜ ያሻሽሉ።' },
        ],
        noPlans: "በአሁኑ ጊዜ ምንም እቅዶች የሉም።"
    },
    om: {
        title: "Karoora Keessan Filadhaa",
        subtitle: "Amaloota olaanoo banaa fi karoora miseensummaa keenya kan jijjiiramuu danda'uun daldala keessan guddisaa",
        monthly: "Baatiidhaan",
        yearly: "Waggadhaan",
        save20: "20% Qusadhaa",
        getStarted: "Jalqabaa",
        subscribeNow: "Amma Galmaa'aa",
        detailedComparison: "Wal-bira Qabuu Bal'aa",
        feature: "Amala",
        faqTitle: "Gaaffiiwwan Yeroo Baay'ee Gaafataman",
        unlimited: "Daangaa Hin Qabne",
        post: "Maxxansuuf",
        view: "Ilaaluuf",
        featuredListings: "Tarreeffama Filatamaa",
        prioritySupport: "Deeggarsa Dursee Kennamu",
        verifiedBadge: "Mallattoo Mirkaneeffame",
        analytics: "Xiinxala",
        mo: "Ji'a",
        yr: "Waggaa",
        currency: "Birr",
        free: "BILISA",
        popular: "BEEKAMAA",
        categories: {
            cars: "Konkolaataa",
            homes: "Manneen",
            jobs: "Hojiiwwan",
            tenders: "Caalbaasii"
        },
        faqs: [
            { q: 'Karoora koo fooyyessuu ykn gadi buusuu nan danda\'aa?', a: 'Eeyyee! Yeroo barbaaddanitti karoora keessan fooyyessuu ykn gadi buusuu dandeessu. Jijjiirraan battalumatti hojiirra oola.' },
            { q: 'Mallii kaffaltii akkamii fudhattu?', a: 'Kaffaltii biyya keessaa mijataa ta\'eef Chapa fi Arif Pay ni fudhanna.' },
            { q: 'Yaalii bilisaa qabduu?', a: 'Karoorri Bilisaa keenya daawwachuu fi qorachuuf isin dandeessisa. Amaloota maxxansuu banuuf yeroo kamiyyuu fooyyessaa.' },
        ],
        noPlans: "Karoorri yeroo ammaa hin jiru."
    },
    ti: {
        title: "ናይ ውልቀኹም መደብ ምረጹ",
        subtitle: "ፕሪሚየም ባህርያት ይክፈቱ እሞ ንግድኹም በቲ ተለዋዋጢ ናይ ኣባልነት መደባትና ኣዕብዩ",
        monthly: "ስለ ወርሒ",
        yearly: "ስለ ዓመት",
        save20: "20% ይቆጥቡ",
        getStarted: "ይጀምሩ",
        subscribeNow: "ሕጂ ይመዝገቡ",
        detailedComparison: "ዝርዝር ምንጽጻር",
        feature: "ባህሪ",
        faqTitle: "ተደጋጋሚ ዝሕተቱ ሕቶታት",
        unlimited: "ዘይተገደበ",
        post: "ለጥፍ",
        view: "ረአ",
        featuredListings: "ዝተመረጹ ዝርዝራት",
        prioritySupport: "ቀዳማይ ዝወሃብ ደገፍ",
        verifiedBadge: "ዝተረጋገለ ምልክት",
        analytics: "ትንታነታት",
        mo: "ወርሒ",
        yr: "ዓመት",
        currency: "ብር",
        free: "ነፃ",
        popular: "ፍቱው",
        categories: {
            cars: "መካይን",
            homes: "ኣባይቲ",
            jobs: "ስራሕቲ",
            tenders: "ጨረታታት"
        },
        faqs: [
            { q: 'መደቤ ከመሓይሽ ወይ ክንክዮ ይኽእል ድየ?', a: 'እወ! ኣብ ዝኾነ ግዜ መደብካ ከተመሓይሽ ወይ ክትነክዮ ትኽእል ኢኻ። ለውጢ ብኡንብኡ እዩ ዝጅምር።' },
            { q: 'እንታይ ዓይነት ናይ ክፍሊት መንገዲ ትቕበሉ?', a: 'ንቐሊል ናይ ውሽጢ ዓዲ ክፍሊት ቻፓን ኣሪፍ ፔይን ንቕበል ኢና።' },
            { q: 'ናጻ ፈተነ ኣለኩም ድዩ?', a: 'ናጻ መደብና ንክትግንጽልን ክትድህስስን የኽእለካ። ናይ ምልጣፍ ባህርያት ንምክትፋት ኣብ ዝኾነ ግዜ ኣመሓይሽ።' },
        ],
        noPlans: "ኣብዚ ሕጂ እዋን ዝኾነ መደብ የለን።"
    }
};

const PricingPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState('monthly');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            // Fetch directly using the shared supabase client (handles public/user auth correctly)
            const { data, error } = await supabase
                .from('membership_plans')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;

            // Parse JSON fields and format for display
            const formattedPlans = (data || []).map(plan => ({
                ...plan,
                features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
                limits: typeof plan.limits === 'string' ? JSON.parse(plan.limits) : plan.limits
            }));

            setPlans(formattedPlans);
        } catch (error) {
            console.error('Error fetching plans:', error);
            // No mock data fallback
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = async (plan) => {
        if (!user) {
            toast.error('Please login to subscribe');
            navigate('/auth');
            return;
        }

        if (plan.price === 0) {
            toast.info('You already have free access!');
            return;
        }

        navigate(`/checkout?plan=${plan.slug || plan.id}`, { state: { plan } });
    };

    const handleBillingChange = (event, newAlignment) => {
        if (newAlignment !== null) {
            setBillingCycle(newAlignment);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.palette.background.default }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', background: theme.palette.background.default, py: 8, color: theme.palette.text.primary }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box textAlign="center" mb={8}>
                    <Typography variant="h2" fontWeight="800" gutterBottom sx={{
                        background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {t.title}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 6 }}>
                        {t.subtitle}
                    </Typography>

                    {/* Billing Toggle */}
                    <ToggleButtonGroup
                        value={billingCycle}
                        exclusive
                        onChange={handleBillingChange}
                        aria-label="billing cycle"
                        sx={{ bgcolor: theme.palette.background.paper, borderRadius: 10, p: 0.5, boxShadow: 1 }}
                    >
                        <ToggleButton value="monthly" sx={{ borderRadius: 10, px: 4, py: 1, border: 'none', '&.Mui-selected': { bgcolor: theme.palette.primary.main, color: 'white!important' } }}>
                            {t.monthly}
                        </ToggleButton>
                        <ToggleButton value="yearly" sx={{ borderRadius: 10, px: 4, py: 1, border: 'none', '&.Mui-selected': { bgcolor: theme.palette.primary.main, color: 'white!important' } }}>
                            {t.yearly}
                            <Chip label={t.save20} size="small" sx={{ ml: 1, bgcolor: '#10B981', color: 'white', fontWeight: 'bold', height: 20, fontSize: '0.65rem' }} />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Pricing Cards */}
                {plans.length === 0 ? (
                    <Box textAlign="center" py={10}>
                        <Typography variant="h5" color="text.secondary">{t.noPlans}</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={4} justifyContent="center">
                        {plans.map((plan, index) => (
                            <Grid item xs={12} md={6} lg={3} key={plan.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    style={{ height: '100%' }}
                                >
                                    <Card sx={{
                                        height: '100%',
                                        position: 'relative',
                                        borderRadius: 4,
                                        overflow: 'visible',
                                        transition: 'transform 0.3s',
                                        '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[10] },
                                        display: 'flex', flexDirection: 'column',
                                        bgcolor: theme.palette.background.paper
                                    }}>
                                        {plan.is_popular && (
                                            <Box sx={{
                                                position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)',
                                                background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)',
                                                color: 'white', px: 3, py: 0.5, borderRadius: 10, fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: 1, zIndex: 2
                                            }}>
                                                {plan.badge || t.popular}
                                            </Box>
                                        )}

                                        <Box sx={{
                                            p: 4,
                                            background: `linear-gradient(135deg, ${plan.color || theme.palette.primary.main} 0%, ${alpha(plan.color || theme.palette.primary.main, 0.8)} 100%)`,
                                            color: 'white',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            borderTopLeftRadius: 16, borderTopRightRadius: 16
                                        }}>
                                            {/* Decorative circles */}
                                            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'white', opacity: 0.1 }} />
                                            <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', bgcolor: 'white', opacity: 0.1 }} />

                                            <Typography variant="h5" fontWeight="bold" gutterBottom>{plan.name}</Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9, minHeight: 40, mb: 2 }}>{plan.description}</Typography>

                                            <Box display="flex" alignItems="baseline">
                                                <Typography variant="h3" fontWeight="bold">
                                                    {plan.price === 0 ? t.free : `${billingCycle === 'yearly' ? Math.round(plan.price * 12 * 0.8) : plan.price}`}
                                                </Typography>
                                                {plan.price > 0 && <Typography variant="subtitle1" sx={{ ml: 0.5, opacity: 0.8 }}>{t.currency}/{billingCycle === 'yearly' ? t.yr : t.mo}</Typography>}
                                            </Box>
                                        </Box>

                                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                                            <Stack spacing={2} mb={4} flexGrow={1}>
                                                {/* Auto-generated Limit Features */}
                                                {Object.entries(plan.category_limits || {}).map(([cat, limit]) => {
                                                    if (limit === 0) return null;
                                                    return (
                                                        <Box key={`limit-${cat}`} display="flex" alignItems="start" gap={1.5}>
                                                            <Box component="span" sx={{
                                                                width: 20, height: 20, borderRadius: '50%',
                                                                bgcolor: alpha('#10B981', 0.1),
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                            }}>
                                                                <Check sx={{ fontSize: 14, color: '#10B981' }} />
                                                            </Box>
                                                            <Typography variant="body2" color="text.primary" sx={{ textTransform: 'capitalize' }}>
                                                                {limit === -1 ? `${t.unlimited} ${t.post} ${t.categories[cat] || cat}` : `${limit} ${t.post} ${t.categories[cat] || cat}/${t.mo}`}
                                                            </Typography>
                                                        </Box>
                                                    );
                                                })}

                                                {(Array.isArray(plan.features) ? plan.features : []).map((feature, idx) => {
                                                    // Handle both string and object formats
                                                    const featureText = typeof feature === 'string' ? feature : feature.text;
                                                    const isIncluded = typeof feature === 'string' ? true : feature.included !== false;

                                                    return (
                                                        <Box key={idx} display="flex" alignItems="start" gap={1.5}>
                                                            <Box component="span" sx={{
                                                                width: 20, height: 20, borderRadius: '50%',
                                                                bgcolor: isIncluded ? alpha('#10B981', 0.1) : alpha(theme.palette.grey[400], 0.1),
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                            }}>
                                                                {isIncluded ? <Check sx={{ fontSize: 14, color: '#10B981' }} /> : <Close sx={{ fontSize: 14, color: theme.palette.grey[400] }} />}
                                                            </Box>
                                                            <Typography variant="body2" color={isIncluded ? 'text.primary' : 'text.disabled'}>
                                                                {featureText}
                                                            </Typography>
                                                        </Box>
                                                    );
                                                })}
                                            </Stack>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={() => handleSelectPlan(plan)}
                                                sx={{
                                                    py: 1.5,
                                                    borderRadius: 3,
                                                    background: plan.is_popular ? 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%)' : (plan.price === 0 ? theme.palette.grey[200] : theme.palette.primary.main),
                                                    color: plan.price === 0 ? theme.palette.text.primary : 'white',
                                                    '&:hover': {
                                                        bgcolor: plan.price === 0 ? theme.palette.grey[300] : theme.palette.secondary.main
                                                    }
                                                }}
                                            >
                                                {plan.price === 0 ? t.getStarted : t.subscribeNow}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Comparison Table */}
                {plans.length > 0 && (
                    <Box mt={10}>
                        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={6}>{t.detailedComparison}</Typography>
                        <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: theme.palette.background.paper }}>
                            <Table>
                                <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t.feature}</TableCell>
                                        {plans.map(plan => (
                                            <TableCell key={plan.id} align="center" sx={{ color: 'white', fontWeight: 'bold' }}>{plan.name}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {/* Dynamic Category Limits Rows (Posting) */}
                                    {['jobs', 'tenders', 'homes', 'cars'].map(cat => (
                                        <TableRow key={`post-${cat}`} hover>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                                {t.post} {t.categories[cat] || cat}
                                            </TableCell>
                                            {plans.map(plan => {
                                                const limit = plan.category_limits?.[cat] ?? 0;
                                                return (
                                                    <TableCell key={plan.id} align="center">
                                                        {limit === -1
                                                            ? <Typography color="success.main" fontWeight="bold">{t.unlimited}</Typography>
                                                            : limit > 0
                                                                ? <Typography fontWeight="bold">{limit}/{t.mo}</Typography>
                                                                : <Close color="disabled" />}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}

                                    {/* Viewing Access Rows */}
                                    {['jobs', 'tenders', 'homes', 'cars'].map(cat => (
                                        <TableRow key={`view-${cat}`} hover>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                                {t.view} {t.categories[cat] || cat}
                                            </TableCell>
                                            {plans.map(plan => {
                                                const permissions = plan.permissions || {};
                                                const access = permissions.view_access?.[cat];
                                                const showCheck = access === true || (!permissions.view_access && permissions.can_read_posts !== false);

                                                return (
                                                    <TableCell key={plan.id} align="center">
                                                        {showCheck ? <Check color="success" /> : <Close color="disabled" />}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}

                                    {/* Additional Features Rows */}
                                    {[
                                        { label: t.featuredListings, key: 'can_post_featured' },
                                        { label: t.prioritySupport, key: 'priority_support' },
                                        { label: t.verifiedBadge, key: 'verified_badge' },
                                        { label: t.analytics, key: 'analytics_access' }
                                    ].map((row) => (
                                        <TableRow key={row.label} hover>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>{row.label}</TableCell>
                                            {plans.map(plan => {
                                                const perm = plan.permissions || {};
                                                const hasFeature = perm[row.key] === true;
                                                return (
                                                    <TableCell key={plan.id} align="center">
                                                        {hasFeature ? <Check color="success" /> : <Close color="disabled" />}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* FAQ */}
                <Box mt={10} maxWidth={800} mx="auto">
                    <Typography variant="h4" fontWeight="bold" textAlign="center" mb={6}>{t.faqTitle}</Typography>
                    {t.faqs.map((faq, idx) => (
                        <Accordion key={idx} elevation={2} sx={{ mb: 2, borderRadius: '16px!important', '&:before': { display: 'none' }, bgcolor: theme.palette.background.paper }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography fontWeight="bold">{faq.q}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography color="text.secondary">{faq.a}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Container>
        </Box>
    );
};

export default PricingPage;
