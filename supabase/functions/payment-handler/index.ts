
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { action, provider, ...params } = await req.json()

        // Helper to get provider config
        const getProviderConfig = async (providerName: string) => {
            console.log(`Looking up provider: ${providerName}`);

            // First check if provider exists at all
            const { data: allProviders, error: listError } = await supabaseClient
                .from('payment_providers')
                .select('name, is_enabled, api_key, secret_key')
                .eq('name', providerName);

            console.log(`All providers with name ${providerName}:`, allProviders);

            if (listError) {
                console.error('Database error listing providers:', listError);
                throw new Error(`Database error: ${listError.message}`);
            }

            if (!allProviders || allProviders.length === 0) {
                throw new Error(`Payment provider '${providerName}' not found in database. Please add it first.`);
            }

            const providerData = allProviders[0];

            if (!providerData.is_enabled) {
                throw new Error(`Payment provider '${providerName}' is disabled. Please enable it in the admin dashboard.`);
            }

            if (!providerData.api_key && !providerData.secret_key) {
                throw new Error(`Payment provider '${providerName}' has no API credentials configured. Please add your ${providerName === 'chapa' ? 'Chapa' : 'ArifPay'} secret key in the admin dashboard.`);
            }

            console.log(`Provider ${providerName} configured successfully`);
            return providerData;
        };

        // --- ACTION: INITIATE ---
        if (action === 'initiate') {
            const { amount, currency, userId, subscriptionId, metadata, email, firstName, lastName, returnUrlPrefix } = params;

            // --- FREE PLAN ACTIVATION ---
            if (Number(amount) === 0 || provider === 'free') {
                console.log(`Processing free plan activation for user ${userId} and plan ${metadata?.plan_id}`);

                // 1. Create Transaction (Completed)
                const { data: transaction, error: txError } = await supabaseClient
                    .from('payment_transactions')
                    .insert({
                        user_id: userId,
                        subscription_id: subscriptionId,
                        transaction_type: 'subscription',
                        amount: 0,
                        currency: 'ETB',
                        provider: 'free',
                        status: 'completed',
                        metadata
                    })
                    .select()
                    .single();

                if (txError) throw txError;

                // 2. Activate Plan via RPC
                const planId = metadata?.plan_id;
                if (planId) {
                    // Calculate duration days
                    let days = 30; // default
                    const val = parseInt(String(metadata.duration_value)) || 1;
                    const unit = (String(metadata.duration_unit) || 'months').toLowerCase();

                    if (unit.includes('day')) days = val;
                    else if (unit.includes('week')) days = val * 7;
                    else if (unit.includes('month')) days = val * 30;
                    else if (unit.includes('year')) days = val * 365;

                    const { data: subData, error: subError } = await supabaseClient.rpc('activate_user_plan', {
                        p_user_id: userId,
                        p_plan_id: planId,
                        p_duration_days: days
                    });

                    if (subError) {
                        console.error('Error activating free plan via RPC:', subError);
                        throw new Error('Failed to activate free plan subscription');
                    }

                    if (subData && subData.success && subData.subscription_id) {
                        // Link subscription to transaction
                        await supabaseClient
                            .from('payment_transactions')
                            .update({ subscription_id: subData.subscription_id })
                            .eq('id', transaction.id);

                        // Update subscription with 'free' method
                        await supabaseClient
                            .from('user_subscriptions')
                            .update({
                                payment_method: 'free',
                                notes: `Free Plan Activation`
                            })
                            .eq('id', subData.subscription_id);
                    }
                }

                return new Response(
                    JSON.stringify({ success: true, message: 'Free plan activated successfully' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // 1. Create Transaction (Pending)
            const { data: transaction, error: txError } = await supabaseClient
                .from('payment_transactions')
                .insert({
                    user_id: userId,
                    subscription_id: subscriptionId,
                    transaction_type: 'subscription',
                    amount,
                    currency,
                    provider,
                    status: 'pending',
                    metadata
                })
                .select()
                .single();

            if (txError) throw txError;

            const config = await getProviderConfig(provider);
            let checkoutUrl, txRef;

            if (provider === 'chapa') {
                const secret = config.secret_key || config.api_key;
                if (!secret) throw new Error('Chapa secret key is missing in database');

                // Construct return_url cleanly
                const baseUrl = (returnUrlPrefix || 'https://www.yesrasewsolution.com').replace(/\/$/, '');
                const returnUrl = `${baseUrl}/payment/success?tx_ref=${transaction.id}&provider=chapa`;
                console.log('Chapa Return URL:', returnUrl);

                const chapaPayload = {
                    amount: amount,
                    currency: currency || 'ETB',
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    tx_ref: transaction.id,
                    callback_url: `${req.headers.get('origin')}/api/webhooks/chapa`,
                    return_url: returnUrl,
                    customization: {
                        title: 'YesraSew',
                        description: metadata?.plan_name || 'Membership Plan'
                    },
                    meta: {
                        hide_receipt: "true"
                    }
                };

                const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${secret}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(chapaPayload)
                });

                const result = await response.json();
                console.log('Chapa API Response:', result);

                if (result.status !== 'success') {
                    console.error('Chapa init error:', result);

                    // Properly serialize error message
                    let errorMsg = 'Chapa init failed';
                    if (result.message) {
                        if (typeof result.message === 'string') {
                            errorMsg = result.message;
                        } else if (typeof result.message === 'object') {
                            // Extract meaningful error from object
                            errorMsg = result.message.message ||
                                result.message.error ||
                                JSON.stringify(result.message);
                        }
                    }

                    console.error('Throwing Chapa error:', errorMsg);
                    throw new Error(errorMsg);
                }

                checkoutUrl = result.data.checkout_url;
                txRef = transaction.id;
            } else if (provider === 'arif_pay') {
                const key = config.api_key || config.secret_key;
                if (!key) throw new Error('ArifPay API key is missing in database');

                // Basic ArifPay Implementation
                const arifPayload = {
                    amount: amount,
                    currency: currency || 'ETB',
                    beneficiaries: [{
                        accountNumber: config.config?.account_number,
                        amount: amount
                    }],
                    cancelUrl: `${returnUrlPrefix || 'http://localhost:3000'}/payment/cancel?id=${transaction.id}&provider=arif_pay`,
                    errorUrl: `${returnUrlPrefix || 'http://localhost:3000'}/payment/error?id=${transaction.id}&provider=arif_pay`,
                    successUrl: `${returnUrlPrefix || 'http://localhost:3000'}/payment/success?id=${transaction.id}&provider=arif_pay`,
                    nonce: transaction.id
                };

                const response = await fetch('https://api.arifpay.net/api/checkout/session', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(arifPayload)
                });

                const result = await response.json();
                checkoutUrl = result.checkoutUrl;
                txRef = result.sessionId;
            }

            // Update transaction
            await supabaseClient
                .from('payment_transactions')
                .update({
                    provider_transaction_id: txRef,
                    provider_reference: txRef,
                    status: 'processing'
                })
                .eq('id', transaction.id);

            return new Response(
                JSON.stringify({ success: true, checkoutUrl, txRef }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // --- ACTION: VERIFY ---
        if (action === 'verify') {
            const { txRef } = params;
            const config = await getProviderConfig(provider);
            let status = 'failed';
            let verifyData = {};

            if (provider === 'chapa') {
                const secret = config.secret_key || config.api_key; // Fallback
                if (!secret) throw new Error('Chapa secret key is missing in database');

                const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
                    headers: { 'Authorization': `Bearer ${secret}` }
                });
                verifyData = await response.json();
                if (verifyData.status === 'success' || verifyData.data?.status === 'success') {
                    status = 'success';
                }
            } else if (provider === 'arif_pay') {
                const key = config.api_key || config.secret_key; // Fallback
                if (!key) throw new Error('ArifPay API key is missing in database');

                const response = await fetch(`https://api.arifpay.net/api/checkout/session/${txRef}`, {
                    headers: { 'Authorization': `Bearer ${key}` }
                });
                verifyData = await response.json();
                if (verifyData.status === 'DONE' || verifyData.status === 'success') {
                    status = 'success';
                }
            }

            if (status === 'success') {
                // 1. Update Transaction
                const { data: updatedTx, error: updateError } = await supabaseClient
                    .from('payment_transactions')
                    .update({ status: 'completed', paid_at: new Date().toISOString() })
                    .or(`provider_transaction_id.eq.${txRef},id.eq.${txRef}`)
                    .select()
                    .single();

                if (updateError) console.error('Error updating transaction status:', updateError);

                if (updatedTx) {
                    // 2. ACTIVATE SUBSCRIPTION
                    const metadata = updatedTx.metadata || {};
                    const planId = metadata.plan_id;
                    const userId = updatedTx.user_id;

                    if (planId && userId) {
                        // Calculate duration days
                        let days = 30; // default
                        const val = parseInt(String(metadata.duration_value)) || 1;
                        const unit = (String(metadata.duration_unit) || 'months').toLowerCase();

                        if (unit.includes('day')) days = val;
                        else if (unit.includes('week')) days = val * 7;
                        else if (unit.includes('month')) days = val * 30;
                        else if (unit.includes('year')) days = val * 365;

                        console.log(`Activating plan ${planId} for user ${userId} for ${days} days`);

                        const { data: subData, error: subError } = await supabaseClient.rpc('activate_user_plan', {
                            p_user_id: userId,
                            p_plan_id: planId,
                            p_duration_days: days
                        });

                        if (subError) {
                            console.error('Error activating plan via RPC:', subError);
                        } else if (subData && subData.success && subData.subscription_id) {
                            // Update subscription with payment provider info
                            const { error: patchError } = await supabaseClient
                                .from('user_subscriptions')
                                .update({
                                    payment_method: provider,
                                    notes: `Paid via ${provider} (Tx: ${txRef})`
                                })
                                .eq('id', subData.subscription_id);

                            if (patchError) console.error('Error patching subscription:', patchError);

                            // Link subscription to transaction
                            await supabaseClient
                                .from('payment_transactions')
                                .update({ subscription_id: subData.subscription_id })
                                .eq('id', updatedTx.id);
                        }
                    } else {
                        console.error('Missing plan_id or user_id in transaction metadata', metadata);
                    }
                }
            }

            return new Response(
                JSON.stringify({ success: true, status, data: verifyData }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        throw new Error(`Unknown action: ${action}`);

    } catch (error) {
        console.error('Payment Handler Error:', error);

        // Properly extract error message
        let failMessage = 'Unknown error occurred';
        if (error instanceof Error) {
            failMessage = error.message;
        } else if (typeof error === 'string') {
            failMessage = error;
        } else if (error && typeof error === 'object') {
            // Try to extract meaningful error info from object
            failMessage = (error as any).message ||
                (error as any).error ||
                (error as any).msg ||
                JSON.stringify(error);
        }

        console.error('Returning error message:', failMessage);

        return new Response(
            JSON.stringify({ success: false, message: failMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
