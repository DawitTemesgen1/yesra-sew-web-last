import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip, Stack,
    CircularProgress, useTheme, alpha, IconButton
} from '@mui/material';
import { Check, ArrowBack, Close, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';

const BRAND_COLORS = {
    gold: '#FFD700',
    darkGold: '#DAA520',
    blue: '#1E3A8A',
    lightBlue: '#3B82F6',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%)',
    bgGradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' // Soft background
};

const UpgradePlanPage = () => {
    const theme = useTheme();
    const [plans, setPlans] = useState([]);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const preselectedPlan = searchParams.get('plan');

    useEffect(() => {
        if (!user) {
            toast.error('Please login to upgrade');
            navigate('/auth');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch current subscription
            const subscription = await adminService.getUserSubscription(user.id);
            setCurrentPlan(subscription?.membership_plans?.slug || 'free');

            // Fetch available plans
            const plansData = await adminService.getMembershipPlans();

            // Parse JSON fields
            const formattedPlans = plansData.map(plan => ({
                ...plan,
                features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
                limits: typeof plan.limits === 'string' ? JSON.parse(plan.limits) : plan.limits
            }));

            setPlans(formattedPlans);

            // Auto-select preselected plan
            if (preselectedPlan) {
                const plan = formattedPlans.find(p => p.slug === preselectedPlan);
                if (plan) setSelectedPlan(plan);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setCurrentPlan('free');
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan) => {
        if (plan.slug === currentPlan) {
            toast('This is your current plan');
            return;
        }
        setSelectedPlan(plan);
        setShowConfirmModal(true);
    };

    const handleConfirmUpgrade = () => {
        if (selectedPlan.price === 0) {
            toast('Downgrading to free plan');
            setShowConfirmModal(false);
            return;
        }

        navigate(`/checkout?plan=${selectedPlan.slug}`);
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BRAND_COLORS.bgGradient }}>
                <CircularProgress sx={{ color: BRAND_COLORS.blue }} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', background: BRAND_COLORS.bgGradient, py: 8 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box mb={8}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(-1)}
                        sx={{ color: 'text.secondary', mb: 4, '&:hover': { color: 'text.primary' } }}
                    >
                        Back
                    </Button>
                    <Box textAlign="center">
                        <Typography variant="h3" fontWeight="bold" gutterBottom color="text.primary">
                            Select a Plan
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                            Choose the plan that best fits your needs. Upgrade or downgrade at any time.
                        </Typography>
                    </Box>
                </Box>

                {/* Pricing Grid */}
                <Grid container spacing={3} alignItems="flex-start" justifyContent="center">
                    {plans.map((plan, index) => {
                        const isCurrentPlan = plan.slug === currentPlan;
                        const isUpgrade = plans.findIndex(p => p.slug === currentPlan) < index;

                        return (
                            <Grid item xs={12} sm={6} md={3} key={plan.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Card
                                        elevation={plan.popular ? 8 : 2}
                                        sx={{
                                            position: 'relative',
                                            borderRadius: 4,
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transform: plan.popular ? 'scale(1.05)' : 'none',
                                            border: isCurrentPlan ? `2px solid ${BRAND_COLORS.blue}` : 'none',
                                            zIndex: plan.popular ? 2 : 1
                                        }}
                                    >
                                        {plan.popular && (
                                            <Box sx={{
                                                position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)',
                                                bgcolor: BRAND_COLORS.blue, color: 'white', px: 2, py: 0.5, borderRadius: 10,
                                                fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase'
                                            }}>
                                                Most Popular
                                            </Box>
                                        )}

                                        <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                                            <Box textAlign="center" mb={3} pt={plan.popular ? 2 : 0}>
                                                <Typography variant="h6" fontWeight="bold" gutterBottom>{plan.name}</Typography>
                                                <Typography variant="caption" display="block" color="text.secondary" gutterBottom sx={{ height: 20 }}>
                                                    {plan.tagline}
                                                </Typography>
                                                <Box display="flex" justifyContent="center" alignItems="baseline" mt={2}>
                                                    <Typography variant="h4" fontWeight="800" color="text.primary">
                                                        {plan.price === 0 ? 'Free' : plan.price}
                                                    </Typography>
                                                    {plan.price > 0 && (
                                                        <Typography variant="subtitle2" color="text.secondary" ml={0.5}>ETB/mo</Typography>
                                                    )}
                                                </Box>
                                            </Box>

                                            <Stack spacing={1} sx={{ mb: 4, flexGrow: 1 }}>
                                                {plan.features?.slice(0, 6).map((feature, idx) => (
                                                    <Box key={idx} display="flex" alignItems="start" gap={1}>
                                                        <Check fontSize="small" sx={{ color: feature.highlight ? 'success.main' : 'text.disabled', mt: 0.5 }} />
                                                        <Typography variant="body2" color={feature.highlight ? 'text.primary' : 'text.secondary'} fontSize="0.85rem">
                                                            {feature.text}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Stack>

                                            <Box mt="auto">
                                                {isCurrentPlan ? (
                                                    <Button fullWidth variant="outlined" disabled size="large">
                                                        Current Plan
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        fullWidth
                                                        variant={plan.popular ? "contained" : "outlined"}
                                                        size="large"
                                                        onClick={() => handleSelectPlan(plan)}
                                                        sx={{
                                                            bgcolor: plan.popular ? BRAND_COLORS.blue : 'transparent',
                                                            borderColor: plan.popular ? 'transparent' : 'divider',
                                                            color: plan.popular ? 'white' : 'text.primary',
                                                            '&:hover': {
                                                                bgcolor: plan.popular ? BRAND_COLORS.darkGold : alpha(BRAND_COLORS.blue, 0.05),
                                                                borderColor: plan.popular ? 'transparent' : BRAND_COLORS.blue
                                                            }
                                                        }}
                                                    >
                                                        {isUpgrade ? 'Upgrade Now' : 'Select Plan'}
                                                    </Button>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Support Text */}
                <Box textAlign="center" mt={6}>
                    <Typography variant="body2" color="text.secondary">
                        Need help choosing? <Button sx={{ textTransform: 'none', verticalAlign: 'baseline', minWidth: 'auto', p: 0 }}>Contact our support team.</Button>
                    </Typography>
                </Box>
            </Container>

            {/* Confirmation Modal */}
            <Dialog open={showConfirmModal} onClose={() => setShowConfirmModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Selection</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        You are choosing the <strong>{selectedPlan?.name}</strong> plan.
                    </Typography>
                    <Box sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5), p: 2, borderRadius: 2, my: 2 }}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="text.secondary">Plan</Typography>
                            <Typography variant="subtitle2">{selectedPlan?.name}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">Price</Typography>
                            <Typography variant="subtitle2">{selectedPlan?.price === 0 ? 'FREE' : `${selectedPlan?.price} ETB/month`}</Typography>
                        </Stack>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {selectedPlan?.price > 0
                            ? 'You will be redirected to payment to complete your upgrade.'
                            : 'Your plan will be downgraded immediately.'}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setShowConfirmModal(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleConfirmUpgrade} variant="contained" sx={{ bgcolor: BRAND_COLORS.blue }}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UpgradePlanPage;
