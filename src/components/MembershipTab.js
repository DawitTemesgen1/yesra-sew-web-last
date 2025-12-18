import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    Box, Card, CardContent, Typography, Grid, Button, Chip, LinearProgress,
    Stack, useTheme, alpha, useMediaQuery, Divider, Paper, Alert
} from '@mui/material';
import {
    Work, Gavel, Home, DirectionsCar, CalendarToday, TrendingUp,
    CheckCircle, Cancel, Upgrade, Info
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MembershipTab = ({ userId }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            fetchSubscriptions();
        }
    }, [userId]);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);

            // 1. Fetch active subscriptions
            const { data: subs, error } = await supabase
                .from('user_subscriptions')
                .select(`
                    *,
                    membership_plans (
                        id,
                        name,
                        slug,
                        price,
                        currency,
                        duration_value,
                        duration_unit,
                        category_limits,
                        permissions,
                        features,
                        color,
                        badge_text
                    )
                `)
                .eq('user_id', userId)
                .eq('status', 'active')
                .gte('end_date', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;

            // 2. Fetch Real Usage (Row Count based)
            let usageStats = { post_usage: {}, view_usage: {} };
            try {
                const { data: stats, error: statsError } = await supabase.rpc('get_user_subscription_stats', { p_user_id: userId });
                if (!statsError && stats) {
                    usageStats = stats;
                }
            } catch (e) {
                console.error("Failed to fetch fresh usage stats:", e);
            }

            // Merge stats into subs (for easier rendering)
            const enhancedSubs = (subs || []).map(sub => ({
                ...sub,
                real_post_usage: usageStats.post_usage,
                real_view_usage: usageStats.view_usage
            }));

            setSubscriptions(enhancedSubs);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            toast.error('Failed to load subscription details');
        } finally {
            setLoading(false);
        }
    };

    // Calculate days remaining
    const getDaysRemaining = (endDate) => {
        const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get category icon
    const getCategoryIcon = (category) => {
        const icons = {
            jobs: <Work />,
            tenders: <Gavel />,
            homes: <Home />,
            cars: <DirectionsCar />
        };
        return icons[category] || <Info />;
    };

    // Get category color
    const getCategoryColor = (category) => {
        const colors = {
            jobs: '#E53935',
            tenders: '#FB8C00',
            homes: '#10B981',
            cars: '#F59E0B'
        };
        return colors[category] || theme.palette.primary.main;
    };

    return (
        <Stack spacing={3}>
            {loading ? (
                <Stack spacing={2}>
                    <LinearProgress />
                    <Typography align="center" variant="body2" color="textSecondary">Loading membership details...</Typography>
                </Stack>
            ) : subscriptions.length === 0 ? (
                <EmptyState navigate={navigate} />
            ) : (
                subscriptions.map((sub) => (
                    <MembershipCard
                        key={sub.id}
                        sub={sub}
                        theme={theme}
                        isMobile={isMobile}
                        getDaysRemaining={getDaysRemaining}
                        formatDate={formatDate}
                        getCategoryIcon={getCategoryIcon}
                        getCategoryColor={getCategoryColor}
                    />
                ))
            )}
        </Stack>
    );
};

const MembershipCard = ({ sub, theme, isMobile, getDaysRemaining, formatDate, getCategoryIcon, getCategoryColor }) => {
    const plan = sub.membership_plans;
    const daysLeft = getDaysRemaining(sub.end_date);
    const isExpiring = daysLeft <= 5;

    // Use usage from ROW COUNTING (fallback to stored JSON if missing, though typically obsolete)
    const postUsageMap = sub.real_post_usage || sub.category_usage || {};
    const viewUsageMap = sub.real_view_usage || sub.view_usage || {};

    const postLimits = plan.category_limits || {};
    const viewLimits = plan.permissions?.view_access || {};

    // Filter to relevant limits
    const relevantPostLimits = Object.entries(postLimits).filter(([_, limit]) => limit !== 0 && limit !== "0" && limit !== false);
    const relevantViewLimits = Object.entries(viewLimits).filter(([_, limit]) => limit !== 0 && limit !== "0" && limit !== false);

    return (
        <Card sx={{
            p: 0,
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${alpha(plan.color || theme.palette.primary.main, 0.2)}`,
            boxShadow: `0 8px 24px ${alpha(plan.color || theme.palette.primary.main, 0.08)}`
        }}>
            {/* Header */}
            <Box sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(plan.color || theme.palette.primary.main, 0.1)}, ${alpha(plan.color || theme.palette.primary.main, 0.02)})`,
                borderBottom: `1px solid ${alpha(plan.color || theme.palette.primary.main, 0.1)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box>
                    <Typography variant="h5" fontWeight="800" sx={{ color: plan.color || 'text.primary' }}>{plan.name || 'Membership'}</Typography>
                    {plan.badge_text && (
                        <Chip label={plan.badge_text} size="small" sx={{ mt: 1, backgroundColor: plan.color, color: '#fff', fontWeight: 'bold' }} />
                    )}
                </Box>
                <Box textAlign="right">
                    <Typography variant="caption" display="block" color="text.secondary">Expires In</Typography>
                    <Chip
                        label={`${daysLeft} Days`}
                        color={isExpiring ? 'error' : 'default'}
                        variant={isExpiring ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 700 }}
                    />
                </Box>
            </Box>

            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* DETAILS */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Subscription Details</Typography>
                        <Stack spacing={1.5}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">Status</Typography>
                                <Chip label={sub.status.toUpperCase()} size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">Valid Until</Typography>
                                <Typography variant="body2" fontWeight="600">{formatDate(sub.end_date)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2">Price/Cycle</Typography>
                                <Typography variant="body2" fontWeight="600">{sub.amount_paid} {plan.currency}</Typography>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* USAGE STATS: POSTING */}
                    {relevantPostLimits.length > 0 && (
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Posting Limits</Typography>
                            <Stack spacing={2}>
                                {relevantPostLimits.map(([cat, limit]) => {
                                    // Handle unlimited
                                    const isUnlimited = limit === -1 || limit === true || limit === 'true';
                                    const max = isUnlimited ? 999 : parseInt(limit);

                                    // Normalize key
                                    const used = postUsageMap[cat] || postUsageMap[cat.toLowerCase()] || 0;
                                    const remaining = isUnlimited ? '∞' : Math.max(0, max - used);
                                    const percent = isUnlimited ? 0 : Math.min(100, (used / max) * 100);

                                    return (
                                        <Box key={`post_${cat}`}>
                                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {getCategoryIcon(cat.toLowerCase())}
                                                    <Typography variant="body2" fontWeight="600" textTransform="capitalize">{cat}</Typography>
                                                </Box>
                                                <Typography variant="caption" fontWeight="bold">
                                                    {isUnlimited ? 'Unlimited' : `${used} / ${max}`}
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={percent}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: alpha(getCategoryColor(cat.toLowerCase()) || theme.palette.grey[200], 0.2),
                                                    '& .MuiLinearProgress-bar': {
                                                        backgroundColor: getCategoryColor(cat.toLowerCase()) || theme.palette.primary.main
                                                    }
                                                }}
                                            />
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Grid>
                    )}

                    {/* USAGE STATS: VIEWING */}
                    {relevantViewLimits.length > 0 && (
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Viewing Access</Typography>
                            <Stack spacing={2}>
                                {relevantViewLimits.map(([cat, limit]) => {
                                    const isUnlimited = limit === -1 || limit === true || limit === 'true';
                                    const max = isUnlimited ? 999 : parseInt(limit);

                                    const used = viewUsageMap[cat] || viewUsageMap[cat.toLowerCase()] || 0;
                                    const remaining = isUnlimited ? '∞' : Math.max(0, max - used);
                                    const percent = isUnlimited ? 0 : Math.min(100, (used / max) * 100);

                                    return (
                                        <Box key={`view_${cat}`}>
                                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {getCategoryIcon(cat.toLowerCase())}
                                                    <Typography variant="body2" fontWeight="600" textTransform="capitalize">{cat}</Typography>
                                                </Box>
                                                <Typography variant="caption" fontWeight="bold">
                                                    {isUnlimited ? 'Full Access' : `${remaining} left`}
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={percent}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: alpha(theme.palette.info.main, 0.2),
                                                    '& .MuiLinearProgress-bar': {
                                                        backgroundColor: theme.palette.info.main
                                                    }
                                                }}
                                            />
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

const EmptyState = ({ navigate }) => (
    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }} elevation={0} variant="outlined">
        <Stack spacing={2} alignItems="center">
            <Upgrade sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography variant="h6">No Active Membership</Typography>
            <Typography variant="body2" color="text.secondary">
                You are currently on the free tier or have no active subscriptions.
                Upgrade to unlock premium features and higher limits.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/pricing')}>
                View Upgrade Options
            </Button>
        </Stack>
    </Paper>
);

export default MembershipTab;
