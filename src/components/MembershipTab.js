import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    Box, Card, CardContent, Typography, Grid, Button, Chip, LinearProgress,
    Stack, useTheme, alpha, useMediaQuery
} from '@mui/material';
import {
    Work, Gavel, Home, DirectionsCar
} from '@mui/icons-material';

const MembershipTab = ({ userId }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [membershipDetails, setMembershipDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            fetchMembershipDetails();
        }
    }, [userId]);

    // Updated Data Handling
    const fetchMembershipDetails = async () => {
        try {
            setLoading(true);

            // 1. Get Active Subscriptions
            const { data: subs, error: subError } = await supabase
                .from('user_subscriptions')
                .select('*, membership_plans(*)')
                .eq('user_id', userId)
                .eq('status', 'active')
                .gte('end_date', new Date().toISOString());

            if (subError) throw subError;

            // 2. Aggregate Limits from Active Plans & usage (mock usage for efficiency for now)
            // Real usage would require count(*) from listings per category for current month

            const cats = ['jobs', 'tenders', 'homes', 'cars'];
            const details = {};

            // Initialize details
            cats.forEach(cat => {
                details[cat] = {
                    can_post: false,
                    monthly_limit: 0,
                    usage: 0,
                    remaining: 0,
                    active: false,
                    plan_name: null
                };
            });

            if (subs && subs.length > 0) {
                // Determine limits from plan(s)
                subs.forEach(sub => {
                    const plan = sub.membership_plans;
                    const limits = plan.category_limits || {};

                    cats.forEach(cat => {
                        const limit = limits[cat];
                        if (limit !== undefined && limit !== 0) {
                            details[cat].active = true;
                            details[cat].plan_name = plan.name;
                            details[cat].can_post = true;

                            if (details[cat].monthly_limit === -1 || limit === -1) {
                                details[cat].monthly_limit = -1; // Unlimited
                            } else {
                                details[cat].monthly_limit += limit;
                            }
                        }
                    });
                });
            }

            // Optional: Fetch actual usage counts if needed (omitted for speed/complexity balance)
            // For now, usage is 0.

            // Calculate remaining
            cats.forEach(cat => {
                if (details[cat].monthly_limit === -1) {
                    details[cat].remaining = null;
                } else {
                    details[cat].remaining = Math.max(0, details[cat].monthly_limit - details[cat].usage);
                }
            });

            setMembershipDetails(details);
        } catch (error) {
            console.error('Error fetching membership:', error);
            // Fallback to demo if auth error or no table
            // setMembershipDetails(demoData);
        } finally {
            setLoading(false);
        }
    };

    // No longer using static demoData as primary source
    const currentMembership = membershipDetails || {
        jobs: { can_post: false, monthly_limit: 0, usage: 0, active: false },
        tenders: { can_post: false, monthly_limit: 0, usage: 0, active: false },
        homes: { can_post: false, monthly_limit: 0, usage: 0, active: false },
        cars: { can_post: false, monthly_limit: 0, usage: 0, active: false }
    };
    const { jobs, tenders, homes, cars } = currentMembership;

    const CategoryCard = ({ title, icon, data, link, color, description }) => (
        <Card sx={{
            height: '100%',
            borderRadius: 4,
            border: `1px solid ${data?.active ? color : alpha(theme.palette.divider, 0.5)}`,
            boxShadow: isMobile ? theme.shadows[1] : 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
                transform: isMobile ? 'none' : 'translateY(-4px)',
                boxShadow: theme.shadows[4]
            }
        }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 2.5, md: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 3,
                            bgcolor: alpha(color, 0.1),
                            color: color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {React.cloneElement(icon, { sx: { fontSize: isMobile ? 24 : 28 } })}
                        </Box>
                        <Box>
                            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" sx={{ lineHeight: 1.2 }}>{title}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                {description}
                            </Typography>
                        </Box>
                    </Stack>
                    <Chip
                        label={data?.active ? 'ACTIVE' : 'INACTIVE'}
                        size="small"
                        sx={{
                            height: 24,
                            bgcolor: data?.active ? alpha(color, 0.1) : alpha(theme.palette.grey[500], 0.1),
                            color: data?.active ? color : 'text.secondary',
                            fontWeight: 'bold',
                            fontSize: '0.65rem'
                        }}
                    />
                </Stack>

                <Box sx={{ my: { xs: 2, md: 3 }, flexGrow: 1 }}>
                    {data?.active ? (
                        <>
                            <Box sx={{ mb: 1.5 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                                    {data.plan_name}
                                </Typography>
                            </Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={1}>
                                <Typography variant="caption" color="text.secondary">Usage</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {data.usage} <Typography component="span" variant="caption" color="text.secondary">/ {data.monthly_limit || '∞'}</Typography>
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={data.monthly_limit ? Math.min((data.usage / data.monthly_limit) * 100, 100) : 0}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: alpha(color, 0.1),
                                    '& .MuiLinearProgress-bar': { bgcolor: color }
                                }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                {data.remaining === null ? 'Unlimited remaining' : `${data.remaining} posts left`}
                            </Typography>
                        </>
                    ) : (
                        <Box sx={{
                            height: '100%',
                            minHeight: 80,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: alpha(theme.palette.grey[50], 0.5),
                            borderRadius: 2,
                            p: 2,
                            border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`
                        }}>
                            <Typography variant="body2" color="text.secondary" align="center">
                                Tap to subscribe
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Button
                    variant={data?.active ? "outlined" : "contained"}
                    fullWidth
                    size={isMobile ? "large" : "medium"}
                    onClick={() => navigate(link)}
                    sx={{
                        py: 1.5,
                        borderColor: color,
                        color: data?.active ? color : 'white',
                        bgcolor: data?.active ? 'transparent' : color,
                        boxShadow: data?.active ? 'none' : theme.shadows[2],
                        '&:hover': {
                            bgcolor: data?.active ? alpha(color, 0.05) : alpha(color, 0.9),
                            borderColor: color
                        }
                    }}
                >
                    {data?.active ? 'Manage Plan' : 'View Packages'}
                </Button>
            </CardContent>
        </Card>
    );

    if (loading) return <Box p={4} display="flex" justifyContent="center"><Typography>Loading details...</Typography></Box>;

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" gutterBottom>Subscription Packages</Typography>
                <Typography variant="body2" color="text.secondary">
                    Select a category to manage your plans.
                </Typography>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} lg={3}>
                    <CategoryCard
                        title="Jobs"
                        description="Recruitment"
                        icon={<Work />}
                        data={jobs}
                        link="/pricing/jobs"
                        color="#E53935"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <CategoryCard
                        title="Tenders"
                        description="Procurement"
                        icon={<Gavel />}
                        data={tenders}
                        link="/pricing/tenders"
                        color="#FB8C00"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <CategoryCard
                        title="Real Estate"
                        description="Property Listings"
                        icon={<Home />}
                        data={homes}
                        link="/pricing/homes"
                        color="#10B981"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                    <CategoryCard
                        title="Vehicles"
                        description="Car Sales"
                        icon={<DirectionsCar />}
                        data={cars}
                        link="/pricing/cars"
                        color="#F59E0B"
                    />
                </Grid>
            </Grid>
        </Stack>
    );
};

export default MembershipTab;
