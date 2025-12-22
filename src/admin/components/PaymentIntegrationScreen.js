import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Switch, TextField,
    Button, FormControlLabel, Alert, Divider, IconButton, Tooltip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Dialog, DialogTitle, DialogContent, DialogActions, Tab, Tabs
} from '@mui/material';
import {
    Payment, Refresh, Visibility, VisibilityOff, CheckCircle,
    Error, Settings, History, Info
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const PaymentIntegrationScreen = ({ t }) => {
    const [providers, setProviders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [showApiKey, setShowApiKey] = useState({});
    const [editDialog, setEditDialog] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [formData, setFormData] = useState({});
    const [initializing, setInitializing] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setFetchError(null);
            const [providersData, transactionsData] = await Promise.all([
                adminService.getPaymentProviders(),
                adminService.getAllTransactions({ limit: 50 })
            ]);
            
            setProviders(providersData || []);
            setTransactions(transactionsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setFetchError(error.message || 'Failed to load payment data');
            toast.error('Failed to load payment data');
        } finally {
            setLoading(false);
        }
    };

    const handleInitializeProviders = async () => {
        try {
            setInitializing(true);
            setFetchError(null);
            const result = await adminService.initializePaymentProviders();
            
            toast.success('Payment providers initialized successfully!');
            await fetchData();
        } catch (error) {
            console.error('Error initializing providers:', error);
            setFetchError(error.message || 'Failed to initialize providers');
            toast.error(`Failed to initialize: ${error.message}`);
        } finally {
            setInitializing(false);
        }
    };

    const handleToggleProvider = async (provider) => {
        try {
            await adminService.updatePaymentProvider(provider.id, {
                is_enabled: !provider.is_enabled
            });
            toast.success(`${provider.display_name} ${!provider.is_enabled ? 'enabled' : 'disabled'}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update provider');
        }
    };

    const handleEditProvider = (provider) => {
        setSelectedProvider(provider);
        setFormData({
            api_key: provider.api_key || '',
            secret_key: provider.secret_key || '',
            webhook_secret: provider.webhook_secret || '',
            test_mode: provider.test_mode || false,
            config: provider.config || {}
        });
        setEditDialog(true);
    };

    const handleSaveProvider = async () => {
        try {
            await adminService.updatePaymentProvider(selectedProvider.id, formData);
            toast.success('Provider configuration saved');
            setEditDialog(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to save configuration');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    const getProviderIcon = (name) => {
        return <Payment sx={{ fontSize: 40 }} />;
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Payment Integration
                </Typography>
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData}>
                    Refresh
                </Button>
            </Box>

            {/* Info Alert */}
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    Configure payment providers to accept payments from users. Enable test mode for sandbox testing before going live.
                </Typography>
            </Alert>

            {/* Tabs */}
            <Card sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                    <Tab label="Payment Providers" />
                    <Tab label="Transactions" />
                    <Tab label="Webhooks" />
                </Tabs>
            </Card>

            {/* Payment Providers Tab */}
            {activeTab === 0 && (
                <>
                    {providers.length === 0 ? (
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 6 }}>
                                <Payment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h5" gutterBottom fontWeight="bold">
                                    No Payment Providers Found
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                                    Click the button below to create Chapa and ArifPay payment providers.
                                </Typography>

                                {/* Show error if exists */}
                                {fetchError && (
                                    <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
                                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                                            Error Details:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            {fetchError}
                                        </Typography>
                                    </Alert>
                                )}

                                <Button
                                    variant="contained"
                                    size="large"
                                    color="primary"
                                    startIcon={<Settings />}
                                    onClick={handleInitializeProviders}
                                    disabled={initializing}
                                    sx={{ minWidth: 250, py: 1.5, fontSize: '1.1rem' }}
                                >
                                    {initializing ? 'Creating Providers...' : 'Create Payment Providers'}
                                </Button>

                                <Alert severity="info" sx={{ mt: 3, maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
                                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                                        This will create:
                                    </Typography>
                                    <Typography variant="body2" component="div">
                                        • <strong>Chapa</strong> - Supports Telebirr, CBE Birr, M-Pesa, Cards<br />
                                        • <strong>ArifPay</strong> - Supports Telebirr, CBE Birr, eBirr<br />
                                        • Payment providers database table (if needed)
                                    </Typography>
                                </Alert>

                                {/* Debug info */}
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
                                    Check browser console (F12) for detailed error messages
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Grid container spacing={3}>
                            {providers.map((provider) => (
                                <Grid item xs={12} md={6} key={provider.id}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    {getProviderIcon(provider.name)}
                                                    <Box>
                                                        <Typography variant="h6" fontWeight="bold">
                                                            {provider.display_name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {provider.name}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={provider.is_enabled}
                                                            onChange={() => handleToggleProvider(provider)}
                                                            color="success"
                                                        />
                                                    }
                                                    label={provider.is_enabled ? 'Enabled' : 'Disabled'}
                                                />
                                            </Box>

                                            {/* Provider Description */}
                                            {provider.config?.description && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {provider.config.description}
                                                </Typography>
                                            )}

                                            <Divider sx={{ my: 2 }} />

                                            {/* Configuration Status */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Configuration Status
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Chip
                                                        size="small"
                                                        icon={provider.api_key ? <CheckCircle /> : <Error />}
                                                        label="API Key"
                                                        color={provider.api_key ? 'success' : 'default'}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        icon={provider.secret_key ? <CheckCircle /> : <Error />}
                                                        label="Secret Key"
                                                        color={provider.secret_key ? 'success' : 'default'}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={provider.test_mode ? 'Test Mode' : 'Live Mode'}
                                                        color={provider.test_mode ? 'warning' : 'success'}
                                                    />
                                                </Box>
                                            </Box>

                                            {/* Supported Payment Methods */}
                                            {provider.config?.supported_methods && (
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Supported Methods
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                        {provider.config.supported_methods.map((method) => (
                                                            <Chip
                                                                key={method}
                                                                label={method}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* API Keys (masked) */}
                                            {provider.api_key && (
                                                <Box sx={{ mb: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        API Key
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                            {showApiKey[provider.id] ? provider.api_key : '••••••••••••••••'}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setShowApiKey({ ...showApiKey, [provider.id]: !showApiKey[provider.id] })}
                                                        >
                                                            {showApiKey[provider.id] ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* Actions */}
                                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Settings />}
                                                    onClick={() => handleEditProvider(provider)}
                                                    fullWidth
                                                >
                                                    Configure
                                                </Button>
                                                {provider.config?.dashboard_url && (
                                                    <Tooltip title="Open Provider Dashboard">
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => window.open(provider.config.dashboard_url, '_blank')}
                                                        >
                                                            <Info />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}

            {/* Transactions Tab */}
            {activeTab === 1 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Recent Transactions
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Transaction ID</TableCell>
                                        <TableCell>Provider</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                    {tx.id.substring(0, 8)}...
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={tx.provider} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {tx.amount} {tx.currency}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={tx.status}
                                                    color={getStatusColor(tx.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {transactions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Typography color="text.secondary" sx={{ py: 3 }}>
                                                    No transactions yet
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Webhooks Tab */}
            {activeTab === 2 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Webhook Configuration
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Configure these webhook URLs in your payment provider dashboards:
                        </Alert>
                        {providers.map((provider) => (
                            <Box key={provider.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    {provider.display_name}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                    {window.location.origin}/api/webhooks/{provider.name}
                                </Typography>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Edit Provider Dialog */}
            <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Configure {selectedProvider?.display_name}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="API Key"
                            value={formData.api_key || ''}
                            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                            fullWidth
                            type={showApiKey.edit ? 'text' : 'password'}
                            InputProps={{
                                endAdornment: (
                                    <IconButton onClick={() => setShowApiKey({ ...showApiKey, edit: !showApiKey.edit })}>
                                        {showApiKey.edit ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                )
                            }}
                        />
                        <TextField
                            label="Secret Key"
                            value={formData.secret_key || ''}
                            onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                            fullWidth
                            type="password"
                        />
                        <TextField
                            label="Webhook Secret"
                            value={formData.webhook_secret || ''}
                            onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
                            fullWidth
                            type="password"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.test_mode || false}
                                    onChange={(e) => setFormData({ ...formData, test_mode: e.target.checked })}
                                />
                            }
                            label="Test Mode (Sandbox)"
                        />
                        <Alert severity="warning">
                            <Typography variant="body2">
                                Keep test mode enabled until you're ready to accept real payments.
                            </Typography>
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveProvider}>
                        Save Configuration
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PaymentIntegrationScreen;

