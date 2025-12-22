import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
    Typography, Grid, Chip, Divider, Stack, CircularProgress, IconButton,
    Card, CardContent, Alert
} from '@mui/material';
import { Close, CheckCircle, Cancel, WorkspacePremium, LocationOn } from '@mui/icons-material';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const ListingDetailDialog = ({ open, onClose, listingId, onApprove, onReject, onDelete }) => {
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [template, setTemplate] = useState(null);

    useEffect(() => {
        if (open && listingId) {
            fetchListingDetails();
        }
    }, [open, listingId]);

    const fetchListingDetails = async () => {
        setLoading(true);
        try {
            const data = await adminService.getListingById(listingId);
            setListing(data);

            // Fetch template if category exists
            if (data.category_id) {
                try {
                    const templateData = await adminService.getTemplate(data.category_id);
                    setTemplate(templateData);
                } catch (err) {
                    
                }
            }
        } catch (error) {
            console.error('Error fetching listing:', error);
            toast.error('Failed to load listing details');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        try {
            if (action === 'approve' && onApprove) {
                await onApprove(listingId);
            } else if (action === 'reject' && onReject) {
                await onReject(listingId);
            } else if (action === 'delete' && onDelete) {
                await onDelete(listingId);
            }
            onClose();
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
        }
    };

    const renderFieldValue = (field, value) => {
        if (!value && value !== 0 && value !== false) return 'N/A';

        switch (field?.field_type) {
            case 'boolean':
                return value ? 'Yes' : 'No';
            case 'date':
                return new Date(value).toLocaleDateString();
            case 'datetime':
                return new Date(value).toLocaleString();
            case 'price':
            case 'currency':
                return `ETB ${Number(value).toLocaleString()}`;
            case 'image':
                return (
                    <Box
                        component="img"
                        src={value}
                        alt="Field image"
                        sx={{ maxWidth: 200, maxHeight: 200, borderRadius: 1 }}
                    />
                );
            case 'file':
                return (
                    <Button size="small" href={value} target="_blank">
                        View File
                    </Button>
                );
            case 'select':
            case 'radio':
                return value;
            case 'multiselect':
            case 'checkbox':
                return Array.isArray(value) ? value.join(', ') : value;
            default:
                return String(value);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'pending': return 'warning';
            case 'rejected': return 'error';
            default: return 'default';
        }
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

    if (!listing) return null;

    // Get all fields organized by steps
    const allFields = template?.steps?.flatMap(step => step.fields || []) || [];
    const customFieldsData = listing.custom_fields || {};

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Listing Details</Typography>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                {/* Header Section */}
                <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Typography variant="h5" fontWeight="bold">
                            {listing.title}
                        </Typography>
                        <Chip
                            label={listing.status}
                            color={getStatusColor(listing.status)}
                            size="small"
                        />
                        {listing.is_premium && (
                            <Chip
                                icon={<WorkspacePremium />}
                                label="Premium"
                                color="warning"
                                size="small"
                            />
                        )}
                    </Stack>

                    {listing.location && (
                        <Stack direction="row" spacing={0.5} alignItems="center" mb={1}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {listing.location}
                            </Typography>
                        </Stack>
                    )}

                    {listing.price && (
                        <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
                            ETB {Number(listing.price).toLocaleString()}
                        </Typography>
                    )}

                    {listing.description && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {listing.description}
                        </Typography>
                    )}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Images */}
                {listing.images && listing.images.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Images</Typography>
                        <Grid container spacing={2}>
                            {listing.images.map((img, idx) => (
                                <Grid item xs={6} sm={4} md={3} key={idx}>
                                    <Box
                                        component="img"
                                        src={typeof img === 'string' ? img : img.url}
                                        alt={`Image ${idx + 1}`}
                                        sx={{
                                            width: '100%',
                                            height: 150,
                                            objectFit: 'cover',
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                        <Divider sx={{ my: 3 }} />
                    </Box>
                )}

                {/* Custom Fields from Template */}
                {allFields.length > 0 ? (
                    <Box>
                        <Typography variant="h6" gutterBottom>Additional Details</Typography>
                        <Grid container spacing={2}>
                            {allFields
                                .filter(field => customFieldsData[field.field_name] !== undefined)
                                .map((field) => (
                                    <Grid item xs={12} sm={field.width === 'half' ? 6 : 12} key={field.id}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                                    {field.field_label}
                                                    {field.is_required && <span style={{ color: 'red' }}> *</span>}
                                                </Typography>
                                                <Typography variant="body1">
                                                    {renderFieldValue(field, customFieldsData[field.field_name])}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                        </Grid>
                    </Box>
                ) : (
                    // Fallback: Show all custom fields without template
                    Object.keys(customFieldsData).length > 0 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>Custom Fields</Typography>
                            <Grid container spacing={2}>
                                {Object.entries(customFieldsData).map(([key, value]) => (
                                    <Grid item xs={12} sm={6} key={key}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                                    {key.replace(/_/g, ' ').toUpperCase()}
                                                </Typography>
                                                <Typography variant="body1">
                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )
                )}

                {/* Metadata */}
                <Divider sx={{ my: 3 }} />
                <Box>
                    <Typography variant="h6" gutterBottom>Metadata</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                            <Typography variant="caption" color="text.secondary">Created At</Typography>
                            <Typography variant="body2">
                                {new Date(listing.created_at).toLocaleString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Typography variant="caption" color="text.secondary">Updated At</Typography>
                            <Typography variant="body2">
                                {new Date(listing.updated_at).toLocaleString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Typography variant="caption" color="text.secondary">Views</Typography>
                            <Typography variant="body2">{listing.views || 0}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Typography variant="caption" color="text.secondary">User ID</Typography>
                            <Typography variant="body2">{listing.user_id}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <Typography variant="caption" color="text.secondary">Category ID</Typography>
                            <Typography variant="body2">{listing.category_id}</Typography>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                {listing.status !== 'rejected' && onReject && (
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleAction('reject')}
                    >
                        Reject
                    </Button>
                )}
                {listing.status !== 'approved' && onApprove && (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleAction('approve')}
                    >
                        Approve
                    </Button>
                )}
                {onDelete && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this listing?')) {
                                handleAction('delete');
                            }
                        }}
                    >
                        Delete
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ListingDetailDialog;

