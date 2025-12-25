import { supabase } from './api';

/**
 * Payment Service
 * Handles payment processing with Arif Pay and Chapa
 */

const paymentService = {
    // ============================================
    // PAYMENT PROVIDERS
    // ============================================

    /**
     * Get all payment providers
     */
    async getPaymentProviders() {
        try {
            const { data, error } = await supabase
                .from('payment_providers')
                .select('*')
                .order('display_name');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching payment providers:', error);
            throw error;
        }
    },

    /**
     * Get enabled payment providers
     */
    async getEnabledProviders() {
        try {
            const { data, error } = await supabase
                .from('payment_providers')
                .select('*')
                .eq('is_enabled', true);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching enabled providers:', error);
            throw error;
        }
    },

    /**
     * Update payment provider configuration
     */
    async updatePaymentProvider(id, updates) {
        try {
            const { data, error } = await supabase
                .from('payment_providers')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating payment provider:', error);
            throw error;
        }
    },

    /**
     * Toggle payment provider status
     */
    async toggleProvider(id, isEnabled) {
        try {
            return await this.updatePaymentProvider(id, { is_enabled: isEnabled });
        } catch (error) {
            console.error('Error toggling provider:', error);
            throw error;
        }
    },

    // ============================================
    // ARIF PAY INTEGRATION
    // ============================================

    /**
     * Initialize Arif Pay payment
     */
    async initiateArifPayPayment(paymentData) {
        try {
            const { amount, currency, userId, subscriptionId, metadata } = paymentData;

            // Get Arif Pay configuration
            const { data: provider } = await supabase
                .from('payment_providers')
                .select('*')
                .eq('name', 'arif_pay')
                .eq('is_enabled', true)
                .single();

            if (!provider) {
                throw new Error('Arif Pay is not enabled');
            }

            // Create transaction record
            const { data: transaction, error: txError } = await supabase
                .from('payment_transactions')
                .insert({
                    user_id: userId,
                    subscription_id: subscriptionId,
                    transaction_type: 'subscription',
                    amount,
                    currency,
                    provider: 'arif_pay',
                    status: 'pending',
                    metadata
                })
                .select()
                .single();

            if (txError) throw txError;

            // Call Supabase Edge Function
            const { data: result, error: fnError } = await supabase.functions.invoke('payment-handler', {
                body: {
                    action: 'initiate',
                    provider: 'arif_pay',
                    ...paymentData,
                    returnUrlPrefix: 'https://www.yesrasewsolution.com'
                }
            });

            if (fnError) {
                console.error('Edge Function Error:', fnError);
                throw new Error(fnError.message || 'Payment initiation failed');
            }

            if (!result.checkoutUrl) {
                throw new Error('ArifPay initiation failed');
            }

            return {
                transactionId: result.txRef,
                checkoutUrl: result.checkoutUrl,
                sessionId: result.txRef
            };
        } catch (error) {
            console.error('Error initiating Arif Pay payment:', error);
            throw error;
        }
    },

    /**
     * Verify Arif Pay payment
     */
    async verifyArifPayPayment(sessionId) {
        try {
            const { data, error } = await supabase.functions.invoke('payment-handler', {
                body: {
                    action: 'verify',
                    provider: 'arif_pay',
                    txRef: sessionId
                }
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error verifying Arif Pay payment:', error);
            throw error;
        }
    },

    // ============================================
    // CHAPA INTEGRATION
    // ============================================

    /**
     * Initialize Chapa payment
     */
    async initiateChapaPayment(paymentData) {
        try {


            // Call Supabase Edge Function
            const { data: result, error: fnError } = await supabase.functions.invoke('payment-handler', {
                body: {
                    action: 'initiate',
                    provider: 'chapa',
                    ...paymentData,
                    returnUrlPrefix: 'https://www.yesrasewsolution.com'
                }
            });


            // Check for network/invocation errors first
            if (fnError) {
                console.error('Edge Function Network Error:', fnError);
                const errorMessage = fnError.message || 'Network error calling payment service';
                throw new Error(errorMessage);
            }

            // Check if result exists
            if (!result) {
                throw new Error('No response from payment service');
            }

            // Check for logical errors in the response
            if (result.success === false) {
                console.error('Payment failed - Full result:', result);
                console.error('Message type:', typeof result.message);
                console.error('Message value:', result.message);

                // Handle error message
                let errorMessage = 'Payment initiation failed';
                if (result.message) {
                    if (typeof result.message === 'string') {
                        errorMessage = result.message;
                    } else if (typeof result.message === 'object') {
                        console.error('Message is object:', JSON.stringify(result.message));
                        errorMessage = result.message.message ||
                            result.message.error ||
                            JSON.stringify(result.message);
                    } else {
                        errorMessage = String(result.message);
                    }
                }

                console.error('Throwing error:', errorMessage);
                throw new Error(errorMessage);
            }

            // Validate required fields in successful response
            if (!result.checkoutUrl || !result.txRef) {
                console.error('Invalid payment response:', result);
                throw new Error('Invalid payment response - missing checkout URL or transaction reference');
            }

            return {
                transactionId: result.txRef,
                checkoutUrl: result.checkoutUrl,
                txRef: result.txRef
            };
        } catch (error) {
            console.error('Error initiating Chapa payment:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            throw error;
        }
    },

    /**
     * Verify Chapa payment
     */
    async verifyChapaPayment(txRef) {
        try {
            const { data, error } = await supabase.functions.invoke('payment-handler', {
                body: {
                    action: 'verify',
                    provider: 'chapa',
                    txRef: txRef
                }
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error verifying Chapa payment:', error);
            if (error && typeof error === 'object') {
                console.error('Error details:', JSON.stringify(error, null, 2));
            }
            throw error;
        }
    },

    // ============================================
    // TRANSACTION MANAGEMENT
    // ============================================

    /**
     * Get user transactions
     */
    async getUserTransactions(userId, filters = {}) {
        try {
            let query = supabase
                .from('payment_transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.provider) {
                query = query.eq('provider', filters.provider);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user transactions:', error);
            throw error;
        }
    },

    /**
     * Get all transactions (admin)
     */
    async getAllTransactions(filters = {}) {
        try {
            let query = supabase
                .from('payment_transactions')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.provider) {
                query = query.eq('provider', filters.provider);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },

    /**
     * Update transaction status
     */
    async updateTransactionStatus(transactionId, status, metadata = {}) {
        try {
            const updates = {
                status,
                updated_at: new Date().toISOString(),
                ...metadata
            };

            if (status === 'completed') {
                updates.paid_at = new Date().toISOString();
            }

            const { data, error } = await supabase
                .from('payment_transactions')
                .update(updates)
                .eq('id', transactionId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    },

    /**
     * Process webhook
     */
    async processWebhook(provider, payload) {
        try {
            // Log webhook
            await supabase
                .from('payment_webhooks')
                .insert({
                    provider,
                    event_type: payload.event || payload.type || 'unknown',
                    payload,
                    processed: false
                });

            // Process based on provider
            if (provider === 'arif_pay') {
                return await this.processArifPayWebhook(payload);
            } else if (provider === 'chapa') {
                return await this.processChapaWebhook(payload);
            }

            throw new Error('Unknown payment provider');
        } catch (error) {
            console.error('Error processing webhook:', error);
            throw error;
        }
    },

    async processArifPayWebhook(payload) {
        // Implement Arif Pay webhook processing
        const { sessionId, status } = payload;

        const { data: transaction } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('provider_transaction_id', sessionId)
            .single();

        if (!transaction) return;

        if (status === 'success') {
            await this.updateTransactionStatus(transaction.id, 'completed');
            await this.activateSubscription(transaction.subscription_id);
        } else if (status === 'failed') {
            await this.updateTransactionStatus(transaction.id, 'failed');
        }
    },

    async processChapaWebhook(payload) {
        // Implement Chapa webhook processing
        const { tx_ref, status } = payload;

        const { data: transaction } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('provider_transaction_id', tx_ref)
            .single();

        if (!transaction) return;

        if (status === 'success') {
            await this.updateTransactionStatus(transaction.id, 'completed');
            await this.activateSubscription(transaction.subscription_id);
        } else if (status === 'failed') {
            await this.updateTransactionStatus(transaction.id, 'failed');
        }
    },

    /**
     * Activate subscription after successful payment
     */
    async activateSubscription(subscriptionId) {
        try {
            const { data: subscription } = await supabase
                .from('user_subscriptions')
                .select('*, membership_plans(*)')
                .eq('id', subscriptionId)
                .single();

            if (!subscription) return;

            const plan = subscription.membership_plans;
            let endDate = null;

            // Calculate end date based on billing cycle
            if (plan.billing_cycle !== 'lifetime') {
                const now = new Date();
                switch (plan.billing_cycle) {
                    case 'daily':
                        endDate = new Date(now.setDate(now.getDate() + 1));
                        break;
                    case 'weekly':
                        endDate = new Date(now.setDate(now.getDate() + 7));
                        break;
                    case 'monthly':
                        endDate = new Date(now.setMonth(now.getMonth() + 1));
                        break;
                    case 'yearly':
                        endDate = new Date(now.setFullYear(now.getFullYear() + 1));
                        break;
                }
            }

            await supabase
                .from('user_subscriptions')
                .update({
                    status: 'active',
                    start_date: new Date().toISOString(),
                    end_date: endDate?.toISOString(),
                    listings_limit: plan.max_listings
                })
                .eq('id', subscriptionId);

        } catch (error) {
            console.error('Error activating subscription:', error);
            throw error;
        }
    }
};

export default paymentService;

