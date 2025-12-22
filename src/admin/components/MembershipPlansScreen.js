import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Switch,
    FormControlLabel, Chip, IconButton, Tooltip, Alert, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    MenuItem, Select, FormControl, InputLabel, InputAdornment
} from '@mui/material';
import {
    Add, Edit, Delete, Star, Visibility, CheckCircle,
    TrendingUp, People, Refresh, Settings
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const MembershipPlansScreen = ({ t }) => {
    const [plans, setPlans] = useState([]);
    const [features, setFeatures] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [planDialog, setDialog] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price: 0,
        currency: 'ETB',
        billing_cycle: 'monthly',
        max_listings: null,
        max_active_listings: null,
        listing_duration_days: 30,
        can_post_featured: false,
        can_read_posts: true,
        can_post: true,
        can_comment: true,
        can_message: true,
        features: [],
        priority_support: false,
        verified_badge: false,
        analytics_access: false,
        is_active: true,
        is_popular: false,
        display_order: 0,
        color: '#2196F3',
        duration_value: 1,
        duration_unit: 'months'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [plansData, featuresData, subsData, catsData] = await Promise.all([
                adminService.getMembershipPlans(),
                adminService.getPlanFeatures(),
                adminService.getAllSubscriptions(),
                adminService.getCategories()
            ]);
            setPlans(plansData || []);
            setFeatures(featuresData || []);
            setSubscriptions(subsData || []);
            setCategories(catsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load membership data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = () => {
        setSelectedPlan(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            price: 0,
            currency: 'ETB',
            billing_cycle: 'monthly',
            max_listings: null,
            max_active_listings: null,
            listing_duration_days: 30,
            can_post_featured: false,
            can_read_posts: true,
            can_post: true,
            can_comment: true,
            can_message: true,
            features: [],
            priority_support: false,
            verified_badge: false,
            analytics_access: false,
            is_active: true,
            is_popular: false,
            display_order: 0,
            category_limits: {},
            view_access: {}, // New: { jobs: true, homes: false }
            view_access: {}, // New: { jobs: true, homes: false }
            color: '#2196F3',
            duration_value: 1,
            duration_unit: 'months'
        });
        setDialog(true);
    };

    const handleEditPlan = (plan) => {
        setSelectedPlan(plan);
        // Parse existing plan data
        const existingPermissions = plan.permissions || {};
        setFormData({
            ...plan,
            // Flatten permissions for form editing
            can_post: existingPermissions.can_post ?? true,
            can_read_posts: existingPermissions.can_read_posts ?? true,
            can_comment: existingPermissions.can_comment ?? true,
            can_message: existingPermissions.can_message ?? true,
            can_post_featured: existingPermissions.can_post_featured ?? false,
            priority_support: existingPermissions.priority_support ?? false,
            verified_badge: existingPermissions.verified_badge ?? false,
            analytics_access: existingPermissions.analytics_access ?? false,
            view_access: existingPermissions.view_access || {}, // Extract view access
            duration_value: plan.duration_value ?? 1,
            duration_unit: plan.duration_unit ?? 'months',

            features: Array.isArray(plan.features) ? plan.features : []
        });
        setDialog(true);
    };

    const handleSavePlan = async () => {
        try {
            // Generate slug from name if not provided
            let slug = formData.slug;
            if (!slug) {
                slug = formData.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            }

            // Map flat form fields to structured JSONB if needed
            // Currently DB has 'permissions' column for booleans not in top-level
            const permissions = {
                can_post: formData.can_post,
                can_read_posts: formData.can_read_posts,
                can_comment: formData.can_comment,
                can_message: formData.can_message,
                can_post_featured: formData.can_post_featured,
                priority_support: formData.priority_support,
                verified_badge: formData.verified_badge,
                analytics_access: formData.analytics_access,
                // Add view_access configuration
                view_access: formData.view_access || {}
            };

            const payload = {
                name: formData.name,
                slug: slug,
                description: formData.description,
                price: formData.price,
                // currency is not in schema often, assuming default ETB or added if needed. Schema didn't show it.
                // If schema doesn't have currency, ignore it or add it. I'll omit to avoid 400 if schema misses it.
                duration: `${formData.duration_value} ${formData.duration_unit}`, // For display compatibility
                duration_value: formData.duration_value,
                duration_unit: formData.duration_unit,
                features: formData.features || [], // ensure array
                category_limits: formData.category_limits || {},
                is_active: formData.is_active,
                color: formData.color,
                // New columns from update_membership_plans_v2.sql
                is_popular: formData.is_popular,
                listing_duration_days: formData.listing_duration_days,
                permissions: permissions,
                display_order: formData.display_order || 0
            };

            // Re-checking create_membership_plans.sql content from step 897:
            // It had: id, name, description, price, duration, features, category_limits, is_active, color, icon, created_at, updated_at.
            // It did NOT have listing_duration_days, is_popular, permissions. I added those in step 906.
            // It INVALIDATED display_order if I try to send it.

            if (selectedPlan) {
                await adminService.updateMembershipPlan(selectedPlan.id, payload);
                toast.success('Plan updated successfully');
            } else {
                await adminService.createMembershipPlan(payload);
                toast.success('Plan created successfully');
            }
            setDialog(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save plan: ' + (error.message || 'Unknown error'));
        }
    };

    const handleDeletePlan = async (planId) => {
        if (!window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
            return;
        }

        try {
            await adminService.deleteMembershipPlan(planId);
            toast.success('Plan deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete plan');
        }
    };

    const handleToggleActive = async (plan) => {
        try {
            await adminService.updateMembershipPlan(plan.id, {
                is_active: !plan.is_active
            });
            toast.success(`Plan ${!plan.is_active ? 'activated' : 'deactivated'}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update plan');
        }
    };

    const getSubscriberCount = (planId) => {
        return subscriptions.filter(s => s.plan_id === planId && s.status === 'active').length;
    };

    const formatBillingCycle = (value, unit) => {
        if (!value || !unit) return '';
        const v = parseInt(value);
        if (v === 1) {
            if (unit === 'days') return 'Daily';
            if (unit === 'weeks') return 'Weekly';
            if (unit === 'months') return 'Monthly';
            if (unit === 'years') return 'Yearly';
        }
        if (unit === 'months' && v === 3) return 'Quarterly';
        if (unit === 'months' && v === 6) return 'Biannually';

        // Capitalize unit
        const unitName = unit.charAt(0).toUpperCase() + unit.slice(1);
        return `Every ${v} ${unitName}`;
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Membership Plans
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData}>
                        Refresh
                    </Button>
                    <Button variant="contained" startIcon={<Add />} onClick={handleCreatePlan}>
                        Create Plan
                    </Button>
                </Box>
            </Box>

            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Star sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                            <Typography variant="h5" fontWeight="bold">{plans.length}</Typography>
                            <Typography variant="body2" color="text.secondary">Total Plans</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <People sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                            <Typography variant="h5" fontWeight="bold">
                                {subscriptions.filter(s => s.status === 'active').length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Active Subscribers</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <TrendingUp sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
                            <Typography variant="h5" fontWeight="bold">
                                {plans.filter(p => p.is_active).length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Active Plans</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <CheckCircle sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
                            <Typography variant="h5" fontWeight="bold">{features.length}</Typography>
                            <Typography variant="body2" color="text.secondary">Available Features</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Plans Grid */}
            <Grid container spacing={3}>
                {plans.map((plan) => (
                    <Grid item xs={12} md={6} lg={4} key={plan.id}>
                        <Card sx={{
                            height: '100%',
                            borderTop: `4px solid ${plan.color || '#2196F3'}`,
                            position: 'relative'
                        }}>
                            {plan.is_popular && (
                                <Chip
                                    label="Popular"
                                    color="primary"
                                    size="small"
                                    sx={{ position: 'absolute', top: 16, right: 16 }}
                                />
                            )}
                            <CardContent>
                                {/* Plan Header */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                                        {plan.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {plan.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 2 }}>
                                        <Typography variant="h4" fontWeight="bold" color="primary">
                                            {plan.price === 0 ? 'Free' : `${plan.price} ${plan.currency || 'ETB'}`}
                                        </Typography>
                                        {plan.price > 0 && (
                                            <Typography variant="body2" color="text.secondary">
                                                / {formatBillingCycle(plan.duration_value, plan.duration_unit)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Plan Limits */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Posting Limits
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography variant="body2">
                                            • Max Listings: {plan.max_listings === null ? 'Unlimited' : plan.max_listings}
                                        </Typography>
                                        <Typography variant="body2">
                                            • Active Listings: {plan.max_active_listings === null ? 'Unlimited' : plan.max_active_listings}
                                        </Typography>
                                        <Typography variant="body2">
                                            • Duration: {plan.listing_duration_days} days
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            {Object.entries(plan.category_limits || {}).map(([cat, limit]) => (
                                                limit !== 0 && (
                                                    <Typography key={cat} variant="caption" display="block" color="text.secondary">
                                                        • {cat}: {limit === -1 ? 'Unlimited' : limit}
                                                    </Typography>
                                                )
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Features */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Features
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {plan.can_post_featured && <Chip label="Featured" size="small" />}
                                        {plan.priority_support && <Chip label="Priority Support" size="small" />}
                                        {plan.verified_badge && <Chip label="Verified Badge" size="small" />}
                                        {plan.analytics_access && <Chip label="Analytics" size="small" />}
                                    </Box>
                                </Box>

                                {/* Subscribers */}
                                <Box sx={{ mb: 2 }}>
                                    <Chip
                                        icon={<People />}
                                        label={`${getSubscriberCount(plan.id)} subscribers`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>

                                {/* Status */}
                                <Box sx={{ mb: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={plan.is_active}
                                                onChange={() => handleToggleActive(plan)}
                                                size="small"
                                            />
                                        }
                                        label={plan.is_active ? 'Active' : 'Inactive'}
                                    />
                                </Box>

                                {/* Actions */}
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Edit />}
                                        onClick={() => handleEditPlan(plan)}
                                        fullWidth
                                    >
                                        Edit
                                    </Button>
                                    <Tooltip title="Delete Plan">
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeletePlan(plan.id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Create/Edit Plan Dialog */}
            <Dialog open={planDialog} onClose={() => setDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedPlan ? 'Edit Plan' : 'Create New Plan'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {/* Basic Info */}
                        <TextField
                            label="Plan Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            fullWidth
                            helperText="URL-friendly identifier (auto-generated if empty)"
                        />

                        {/* Plan Presets */}
                        <FormControl fullWidth>
                            <InputLabel>Auto-Fill Template (Optional)</InputLabel>
                            <Select
                                label="Auto-Fill Template (Optional)"
                                value=""
                                onChange={(e) => {
                                    const type = e.target.value;
                                    if (!type) return;

                                    // Reset all to 0/false first
                                    const newLimits = {};
                                    const newViewAccess = {};
                                    categories.forEach(c => {
                                        newLimits[c.slug] = 0;
                                        newViewAccess[c.slug] = false;
                                    });

                                    // Apply preset
                                    if (type === 'all_access') {
                                        categories.forEach(c => {
                                            newLimits[c.slug] = -1;
                                            newViewAccess[c.slug] = -1; // -1 = Unlimited views
                                        });
                                    } else {
                                        // Specific category
                                        if (categories.some(c => c.slug === type)) {
                                            newLimits[type] = 10; // Default limit
                                            newViewAccess[type] = -1; // Unlimited views for this cat
                                        }
                                    }

                                    setFormData({
                                        ...formData,
                                        category_limits: newLimits,
                                        view_access: newViewAccess,
                                        name: type === 'all_access' ? 'All Access Premium' : `${type.charAt(0).toUpperCase() + type.slice(1)} Pro`,
                                        description: type === 'all_access' ? 'Full access to all categories' : `Premium access for ${type} listings`
                                    });
                                }}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem value="all_access">All Access (Unlimited)</MenuItem>
                                {categories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.slug}>
                                        {cat.name} Only
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />

                        {/* Pricing */}
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">ETB</InputAdornment>
                                    }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    label="Duration"
                                    type="number"
                                    value={formData.duration_value}
                                    onChange={(e) => setFormData({ ...formData, duration_value: parseInt(e.target.value) || 1 })}
                                    fullWidth
                                    InputProps={{ inputProps: { min: 1 } }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Unit</InputLabel>
                                    <Select
                                        value={formData.duration_unit}
                                        label="Unit"
                                        onChange={(e) => setFormData({ ...formData, duration_unit: e.target.value })}
                                    >
                                        <MenuItem value="days">Days</MenuItem>
                                        <MenuItem value="weeks">Weeks</MenuItem>
                                        <MenuItem value="months">Months</MenuItem>
                                        <MenuItem value="years">Years</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Posting Limits */}
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
                            Posting Limits
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <TextField
                                    label="Max Listings"
                                    type="number"
                                    value={formData.max_listings || ''}
                                    onChange={(e) => setFormData({ ...formData, max_listings: e.target.value ? parseInt(e.target.value) : null })}
                                    fullWidth
                                    helperText="Leave empty for unlimited"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Max Active"
                                    type="number"
                                    value={formData.max_active_listings || ''}
                                    onChange={(e) => setFormData({ ...formData, max_active_listings: e.target.value ? parseInt(e.target.value) : null })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Duration (days)"
                                    type="number"
                                    value={formData.listing_duration_days}
                                    onChange={(e) => setFormData({ ...formData, listing_duration_days: parseInt(e.target.value) })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Category Access & Limits</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                    <strong>Posting:</strong> Define how many items can be posted per category (-1 = Unlimited). <br />
                                    <strong>Viewing:</strong> detailed view access (e.g., Tenders usually require subscription).
                                </Typography>
                            </Grid>
                            {categories.map(cat => (
                                <Grid item xs={12} md={6} key={cat.id}>
                                    <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                                        <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', mb: 1 }}>{cat.name}</Typography>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={7}>
                                                <TextField
                                                    label="Can Post (Count)"
                                                    type="number"
                                                    size="small"
                                                    value={formData.category_limits?.[cat.slug] ?? 0}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        // Allow empty string to prevent NaN during typing
                                                        const numVal = val === '' ? 0 : parseInt(val);
                                                        setFormData({
                                                            ...formData,
                                                            category_limits: {
                                                                ...(formData.category_limits || {}),
                                                                [cat.slug]: isNaN(numVal) ? 0 : numVal
                                                            }
                                                        });
                                                    }}
                                                    fullWidth
                                                    helperText="-1 = Unlimited"
                                                />
                                            </Grid>
                                            <Grid item xs={5}>
                                                <TextField
                                                    label="Can View (Count)"
                                                    type="number"
                                                    size="small"
                                                    value={formData.view_access?.[cat.slug] ?? 0}
                                                    onChange={(e) => {
                                                        const numVal = parseInt(e.target.value);
                                                        setFormData({
                                                            ...formData,
                                                            view_access: {
                                                                ...(formData.view_access || {}),
                                                                [cat.slug]: isNaN(numVal) ? 0 : numVal
                                                            }
                                                        });
                                                    }}
                                                    fullWidth
                                                    helperText="-1 = Unlimited, 0 = None"
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Permissions */}
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
                            Permissions
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.can_post}
                                            onChange={(e) => setFormData({ ...formData, can_post: e.target.checked })}
                                        />
                                    }
                                    label="Can Post"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.can_read_posts}
                                            onChange={(e) => setFormData({ ...formData, can_read_posts: e.target.checked })}
                                        />
                                    }
                                    label="Can Read Posts"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.can_comment}
                                            onChange={(e) => setFormData({ ...formData, can_comment: e.target.checked })}
                                        />
                                    }
                                    label="Can Comment"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.can_message}
                                            onChange={(e) => setFormData({ ...formData, can_message: e.target.checked })}
                                        />
                                    }
                                    label="Can Message"
                                />
                            </Grid>
                        </Grid>

                        {/* Features */}
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
                            Premium Features
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.can_post_featured}
                                            onChange={(e) => setFormData({ ...formData, can_post_featured: e.target.checked })}
                                        />
                                    }
                                    label="Featured Listings"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.priority_support}
                                            onChange={(e) => setFormData({ ...formData, priority_support: e.target.checked })}
                                        />
                                    }
                                    label="Priority Support"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.verified_badge}
                                            onChange={(e) => setFormData({ ...formData, verified_badge: e.target.checked })}
                                        />
                                    }
                                    label="Verified Badge"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.analytics_access}
                                            onChange={(e) => setFormData({ ...formData, analytics_access: e.target.checked })}
                                        />
                                    }
                                    label="Analytics Access"
                                />
                            </Grid>
                        </Grid>

                        {/* Display Settings */}
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
                            Display Settings
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.is_popular}
                                            onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                                        />
                                    }
                                    label="Mark as Popular"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Display Order"
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Color (Hex)"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    fullWidth
                                    placeholder="#2196F3"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSavePlan}>
                        {selectedPlan ? 'Update Plan' : 'Create Plan'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default MembershipPlansScreen;

