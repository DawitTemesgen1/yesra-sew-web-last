import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
    Typography, Grid, Chip, Divider, Stack, CircularProgress, IconButton,
    Card, CardContent, Avatar, Tab, Tabs, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import {
    Close, Person, Business, Email, Phone, Verified, Block,
    CheckCircle, Delete, LocationOn, CalendarToday
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from '../../utils/dateUtils';

const UserDetailDialog = ({ open, onClose, userId, onUpdate }) => {
    const [user, setUser] = useState(null);
    const [userListings, setUserListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (open && userId) {
            fetchUserDetails();
        }
    }, [open, userId]);

    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            // Fetch user profile
            const userData = await adminService.getUserById(userId);
            setUser(userData);

            // Fetch user's listings
            const listingsData = await adminService.getListings({ user_id: userId });
            setUserListings(listingsData || []);
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Failed to load user details');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyUser = async () => {
        try {
            await adminService.updateUserStatus(userId, { is_verified: true });
            toast.success('User verified successfully');
            fetchUserDetails();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error verifying user:', error);
            toast.error('Failed to verify user');
        }
    };

    const handleSuspendUser = async () => {
        if (!window.confirm('Are you sure you want to suspend this user?')) return;
        try {
            await adminService.updateUserStatus(userId, { is_active: false });
            toast.success('User suspended successfully');
            fetchUserDetails();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error suspending user:', error);
            toast.error('Failed to suspend user');
        }
    };

    const handleActivateUser = async () => {
        try {
            await adminService.updateUserStatus(userId, { is_active: true });
            toast.success('User activated successfully');
            fetchUserDetails();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error activating user:', error);
            toast.error('Failed to activate user');
        }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await adminService.deleteUser(userId);
            toast.success('User deleted successfully');
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'company': return <Business />;
            case 'individual': return <Person />;
            default: return <Person />;
        }
    };

    const getStatusColor = (status) => {
        if (!user?.is_active) return 'error';
        if (user?.is_verified) return 'success';
        return 'warning';
    };

    const getStatusLabel = () => {
        if (!user?.is_active) return 'Suspended';
        if (user?.is_verified) return 'Verified';
        return 'Unverified';
    };

    if (loading) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                </DialogContent>
            </Dialog>
        );
    }

    if (!user) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">User Details</Typography>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                {/* User Header */}
                <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={3} alignItems="center" mb={2}>
                        <Avatar
                            src={user.avatar_url}
                            sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                        >
                            {user.full_name?.charAt(0) || user.email?.charAt(0)}
                        </Avatar>
                        <Box flex={1}>
                            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                                <Typography variant="h5" fontWeight="bold">
                                    {user.full_name || 'Unnamed User'}
                                </Typography>
                                <Chip
                                    label={getStatusLabel()}
                                    color={getStatusColor()}
                                    size="small"
                                    icon={user.is_verified ? <Verified /> : undefined}
                                />
                                <Chip
                                    icon={getRoleIcon(user.account_type)}
                                    label={user.account_type || 'individual'}
                                    size="small"
                                    variant="outlined"
                                />
                            </Stack>
                            <Stack direction="row" spacing={3}>
                                {user.email && (
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <Email fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            {user.email}
                                        </Typography>
                                    </Stack>
                                )}
                                {user.phone && (
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <Phone fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            {user.phone}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Tabs */}
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
                    <Tab label="Profile Information" />
                    <Tab label={`Listings (${userListings.length})`} />
                    <Tab label="Activity" />
                </Tabs>

                {/* Tab 0: Profile Information */}
                {tabValue === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Personal Information</Typography>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Full Name</Typography>
                                            <Typography variant="body1">{user.full_name || 'N/A'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Email</Typography>
                                            <Typography variant="body1">{user.email || 'N/A'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Phone</Typography>
                                            <Typography variant="body1">{user.phone || 'N/A'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Location</Typography>
                                            <Typography variant="body1">{user.location || 'N/A'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Bio</Typography>
                                            <Typography variant="body2">{user.bio || 'No bio provided'}</Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Account Information</Typography>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">User ID</Typography>
                                            <Typography variant="body2" fontFamily="monospace">{user.id}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Account Type</Typography>
                                            <Typography variant="body1">{user.account_type || 'individual'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Role</Typography>
                                            <Typography variant="body1">{user.role || 'user'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Membership Plan</Typography>
                                            <Typography variant="body1">{user.membership_plan || 'Free'}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Created At</Typography>
                                            <Typography variant="body1">
                                                {new Date(user.created_at).toLocaleDateString()}
                                                {' '}({formatDistanceToNow(user.created_at)})
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Last Login</Typography>
                                            <Typography variant="body1">
                                                {user.last_login ? `${new Date(user.last_login).toLocaleDateString()} (${formatDistanceToNow(user.last_login)})` : 'Never'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {user.account_type === 'company' && (
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Company Information</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary">Company Name</Typography>
                                                <Typography variant="body1">{user.company_name || 'N/A'}</Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary">Company Size</Typography>
                                                <Typography variant="body1">{user.company_size || 'N/A'}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" color="text.secondary">Company Description</Typography>
                                                <Typography variant="body2">{user.company_description || 'N/A'}</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                )}

                {/* Tab 1: User Listings */}
                {tabValue === 1 && (
                    <Box>
                        {userListings.length > 0 ? (
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Title</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Price</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Views</TableCell>
                                            <TableCell>Created</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {userListings.map((listing) => (
                                            <TableRow key={listing.id}>
                                                <TableCell>{listing.title}</TableCell>
                                                <TableCell>{listing.category || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {listing.price ? `ETB ${Number(listing.price).toLocaleString()}` : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={listing.status}
                                                        size="small"
                                                        color={
                                                            listing.status === 'approved' ? 'success' :
                                                                listing.status === 'pending' ? 'warning' : 'error'
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>{listing.views || 0}</TableCell>
                                                <TableCell>{new Date(listing.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">No listings found</Typography>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Tab 2: Activity */}
                {tabValue === 2 && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card variant="outlined">
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold" color="primary">
                                        {userListings.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Total Listings</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card variant="outlined">
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold" color="success.main">
                                        {userListings.filter(l => l.status === 'approved').length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Approved</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card variant="outlined">
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                                        {userListings.filter(l => l.status === 'pending').length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Pending</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card variant="outlined">
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold" color="info.main">
                                        {userListings.reduce((sum, l) => sum + (l.views || 0), 0)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Total Views</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                {!user.is_verified && (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={handleVerifyUser}
                    >
                        Verify User
                    </Button>
                )}
                {user.is_active ? (
                    <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<Block />}
                        onClick={handleSuspendUser}
                    >
                        Suspend
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={handleActivateUser}
                    >
                        Activate
                    </Button>
                )}
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDeleteUser}
                >
                    Delete User
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserDetailDialog;

