import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button,
    Alert, CircularProgress, Stack, InputAdornment, IconButton,
    Divider, Grid, Tab, Tabs
} from '@mui/material';
import {
    Email, Lock, Visibility, VisibilityOff, Send, Save,
    CheckCircle, Error as ErrorIcon, Google, Settings
} from '@mui/icons-material';
import { supabase } from '../../services/api';
import toast from 'react-hot-toast';

const BRAND_COLORS = {
    gold: '#FFD700',
    blue: '#1E3A8A',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%)'
};

const EmailSettingsPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showClientSecret, setShowClientSecret] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [testResult, setTestResult] = useState(null);

    // SMTP Config
    const [smtpConfig, setSmtpConfig] = useState({
        host: 'smtp.gmail.com',
        port: 587,
        username: '',
        password: '',
        fromName: 'YesraSew'
    });

    // Google Auth Config
    const [googleConfig, setGoogleConfig] = useState({
        clientId: '',
        clientSecret: ''
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);

            // Load SMTP
            const { data: smtpData } = await supabase.from('system_settings').select('value').eq('key', 'smtp_config').single();
            if (smtpData?.value) setSmtpConfig(smtpData.value);

            // Load Google
            const { data: googleData } = await supabase.from('system_settings').select('value').eq('key', 'google_auth_config').single();
            if (googleData?.value) setGoogleConfig(googleData.value);

        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSmtpChange = (field, value) => {
        setSmtpConfig(prev => ({ ...prev, [field]: value }));
        setTestResult(null);
    };

    const handleGoogleChange = (field, value) => {
        setGoogleConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveSmtp = async () => {
        try {
            setSaving(true);
            if (!smtpConfig.username || !smtpConfig.password) {
                toast.error('Email and password are required');
                return;
            }

            const { error } = await supabase.from('system_settings').upsert({
                key: 'smtp_config',
                value: smtpConfig,
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });

            if (error) throw error;
            toast.success('SMTP settings saved!');
        } catch (error) {
            console.error('Error saving SMTP:', error);
            toast.error('Failed to save SMTP settings');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveGoogle = async () => {
        try {
            setSaving(true);
            if (!googleConfig.clientId || !googleConfig.clientSecret) {
                toast.error('Client ID and Secret are required');
                return;
            }

            const { error } = await supabase.from('system_settings').upsert({
                key: 'google_auth_config',
                value: googleConfig,
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });

            if (error) throw error;
            toast.success('Google settings saved!');
        } catch (error) {
            console.error('Error saving Google config:', error);
            toast.error('Failed to save Google settings');
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        try {
            if (!testEmail) return toast.error('Enter test email');
            setTesting(true);
            setTestResult(null);

            await handleSaveSmtp(); // Ensure saved first

            const { data, error } = await supabase.functions.invoke('email-auth', {
                body: {
                    action: 'send_email_otp',
                    email: testEmail,
                    purpose: 'test_config', // Just sends code
                    firstName: 'Admin Tester'
                }
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            setTestResult({ success: true, message: 'Test email sent successfully!' });
            toast.success('Test email sent!');
        } catch (error) {
            setTestResult({ success: false, message: error.message });
            toast.error('Test failed');
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                ⚙️ Authentication & SMTP
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure email delivery and third-party authentication providers.
            </Typography>

            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                <Tab icon={<Email />} label="Email (SMTP)" iconPosition="start" />
                <Tab icon={<Google />} label="Google Auth" iconPosition="start" />
            </Tabs>

            <Grid container spacing={3}>
                {activeTab === 0 && (
                    <>
                        {/* SMTP Config */}
                        <Grid item xs={12} md={8}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Gmail SMTP Configuration
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />

                                    <Stack spacing={3}>
                                        <TextField
                                            label="Gmail Address"
                                            value={smtpConfig.username}
                                            onChange={(e) => handleSmtpChange('username', e.target.value)}
                                            fullWidth
                                            helperText="e.g. yourapp@gmail.com"
                                        />
                                        <TextField
                                            label="App Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={smtpConfig.password}
                                            onChange={(e) => handleSmtpChange('password', e.target.value)}
                                            fullWidth
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                            helperText="Generate from Google Account -> Security -> App Passwords"
                                        />
                                        <Grid container spacing={2}>
                                            <Grid item xs={8}>
                                                <TextField
                                                    label="Host"
                                                    value={smtpConfig.host}
                                                    onChange={(e) => handleSmtpChange('host', e.target.value)}
                                                    fullWidth
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <TextField
                                                    label="Port"
                                                    type="number"
                                                    value={smtpConfig.port}
                                                    onChange={(e) => handleSmtpChange('port', parseInt(e.target.value))}
                                                    fullWidth
                                                />
                                            </Grid>
                                        </Grid>

                                        <Button
                                            variant="contained"
                                            onClick={handleSaveSmtp}
                                            disabled={saving}
                                            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                                            sx={{ background: BRAND_COLORS.gradient }}
                                        >
                                            Save SMTP Settings
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Test Panel */}
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Test Delivery
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    <Stack spacing={2}>
                                        <TextField
                                            label="Test Email To"
                                            value={testEmail}
                                            onChange={(e) => setTestEmail(e.target.value)}
                                            fullWidth
                                            size="small"
                                        />
                                        <Button
                                            variant="outlined"
                                            onClick={handleTestEmail}
                                            disabled={testing}
                                            startIcon={testing ? <CircularProgress size={20} /> : <Send />}
                                        >
                                            Send Test Email
                                        </Button>
                                        {testResult && (
                                            <Alert severity={testResult.success ? 'success' : 'error'}>
                                                {testResult.message}
                                            </Alert>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </>
                )}

                {activeTab === 1 && (
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Google OAuth Configuration
                                </Typography>
                                <Alert severity="info" sx={{ mb: 3 }}>
                                    These settings are for record-keeping. You must also configure these in your Supabase Dashboard under Authentication -&gt; Providers -&gt; Google.
                                </Alert>
                                <Divider sx={{ mb: 3 }} />

                                <Stack spacing={3}>
                                    <TextField
                                        label="Client ID"
                                        value={googleConfig.clientId}
                                        onChange={(e) => handleGoogleChange('clientId', e.target.value)}
                                        fullWidth
                                        helperText="From Google Cloud Console"
                                    />
                                    <TextField
                                        label="Client Secret"
                                        type={showClientSecret ? 'text' : 'password'}
                                        value={googleConfig.clientSecret}
                                        onChange={(e) => handleGoogleChange('clientSecret', e.target.value)}
                                        fullWidth
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowClientSecret(!showClientSecret)}>
                                                        {showClientSecret ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />

                                    <TextField
                                        label="Authorized Redirect URI"
                                        value={`${process.env.REACT_APP_SUPABASE_URL}/auth/v1/callback`}
                                        fullWidth
                                        InputProps={{ readOnly: true }}
                                        helperText="Add this URL to your Google Cloud Console 'Authorized redirect URIs'"
                                        variant="filled"
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={handleSaveGoogle}
                                        disabled={saving}
                                        startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                                        sx={{ background: BRAND_COLORS.gradient }}
                                    >
                                        Save Google Settings
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default EmailSettingsPage;

