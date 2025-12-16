import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/api';
import toast from 'react-hot-toast';
import {
    Box, Container, Typography, Card, CardContent,
    CircularProgress, Button, Stack, alpha
} from '@mui/material';
import {
    CheckCircle, Error, HourglassEmpty
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const BRAND_COLORS = {
    gold: '#FFD700',
    blue: '#1E3A8A',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%)',
};

const PaymentCallbackPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState('processing'); // processing, success, failed
    const [message, setMessage] = useState('Verifying your payment...');
    const [subscriptionDetails, setSubscriptionDetails] = useState(null);

    const txRef = searchParams.get('tx_ref') || searchParams.get('id');
    const provider = searchParams.get('provider') || 'chapa';

    useEffect(() => {
        if (txRef) {
            verifyPayment();
        } else {
            setStatus('failed');
            setMessage('Invalid payment reference');
        }
    }, [txRef]);

    const verifyPayment = async () => {
        try {
            // Call payment-handler to verify
            const { data, error } = await supabase.functions.invoke('payment-handler', {
                body: {
                    action: 'verify',
                    provider: provider,
                    txRef: txRef
                }
            });

            if (error) throw error;

            if (data?.success && data?.status === 'success') {
                // Payment verified! Now activate subscription
                await activateSubscription(txRef);
                setStatus('success');
                setMessage('Payment successful! Your subscription is now active.');
                toast.success('Subscription activated successfully!');
            } else {
                setStatus('failed');
                setMessage(data?.message || 'Payment verification failed');
                toast.error('Payment verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setStatus('failed');
            setMessage(error.message || 'Failed to verify payment');
            toast.error('Payment verification failed');
        }
    };

    const activateSubscription = async (transactionId) => {
        try {
            // 1. Get transaction details
            const { data: transaction, error: txError } = await supabase
                .from('payment_transactions')
                .select('*')
                .eq('id', transactionId)
                .single();

            if (txError) throw txError;

            // 2. Get plan details
            const planId = transaction.metadata?.plan_id;
            const { data: plan, error: planError } = await supabase
                .from('membership_plans')
                .select('*')
                .eq('id', planId)
                .single();

            if (planError) throw planError;

            // 3. Calculate subscription dates
            const startDate = new Date();
            const endDate = new Date();
            const durationValue = plan.duration_value || 1;
            const durationUnit = plan.duration_unit || 'months';

            switch (durationUnit) {
                case 'days':
                    endDate.setDate(endDate.getDate() + durationValue);
                    break;
                case 'weeks':
                    endDate.setDate(endDate.getDate() + (durationValue * 7));
                    break;
                case 'months':
                    endDate.setMonth(endDate.getMonth() + durationValue);
                    break;
                case 'years':
                    endDate.setFullYear(endDate.getFullYear() + durationValue);
                    break;
            }

            // 4. Create user subscription
            const { data: subscription, error: subError } = await supabase
                .from('user_subscriptions')
                .insert({
                    user_id: user.id,
                    plan_id: planId,
                    status: 'active',
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    payment_transaction_id: transactionId,
                    auto_renew: false
                })
                .select()
                .single();

            if (subError) throw subError;

            setSubscriptionDetails({
                planName: plan.name,
                startDate: startDate.toLocaleDateString(),
                endDate: endDate.toLocaleDateString()
            });

        } catch (error) {
            console.error('Subscription activation error:', error);
            throw new Error('Failed to activate subscription: ' + error.message);
        }
    };

    const getIcon = () => {
        switch (status) {
            case 'success':
                return <CheckCircle sx={{ fontSize: 80, color: '#10B981' }} />;
            case 'failed':
                return <Error sx={{ fontSize: 80, color: '#EF4444' }} />;
            default:
                return <HourglassEmpty sx={{ fontSize: 80, color: BRAND_COLORS.blue }} />;
        }
    };

    const getColor = () => {
        switch (status) {
            case 'success':
                return '#10B981';
            case 'failed':
                return '#EF4444';
            default:
                return BRAND_COLORS.blue;
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 2
        }}>
            <Container maxWidth="sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card elevation={4}>
                        <CardContent sx={{ p: 6, textAlign: 'center' }}>
                            <Box mb={3}>
                                {status === 'processing' ? (
                                    <CircularProgress size={80} sx={{ color: BRAND_COLORS.blue }} />
                                ) : (
                                    getIcon()
                                )}
                            </Box>

                            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: getColor() }}>
                                {status === 'success' ? 'Payment Successful!' :
                                    status === 'failed' ? 'Payment Failed' :
                                        'Processing Payment'}
                            </Typography>

                            <Typography variant="body1" color="text.secondary" paragraph>
                                {message}
                            </Typography>

                            {subscriptionDetails && (
                                <Box sx={{
                                    mt: 3,
                                    p: 3,
                                    bgcolor: alpha('#10B981', 0.1),
                                    borderRadius: 2
                                }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {subscriptionDetails.planName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Active from {subscriptionDetails.startDate} to {subscriptionDetails.endDate}
                                    </Typography>
                                </Box>
                            )}

                            <Stack spacing={2} mt={4}>
                                {status === 'success' && (
                                    <>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={() => navigate('/profile?tab=membership')}
                                            sx={{
                                                background: BRAND_COLORS.gradient,
                                                py: 1.5,
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            View My Subscription
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => navigate('/post-ad')}
                                        >
                                            Start Posting
                                        </Button>
                                    </>
                                )}

                                {status === 'failed' && (
                                    <>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => navigate('/pricing')}
                                            sx={{ py: 1.5 }}
                                        >
                                            Try Again
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => navigate('/')}
                                        >
                                            Go Home
                                        </Button>
                                    </>
                                )}

                                {status === 'processing' && (
                                    <Typography variant="caption" color="text.secondary">
                                        Please wait while we verify your payment...
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};

export default PaymentCallbackPage;
