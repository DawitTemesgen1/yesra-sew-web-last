// Supabase Edge Function for sending Ethiopian SMS via GeezSMS
// Deploy this to: supabase/functions/send-ethiopian-sms/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSRequest {
    phone: string
    userId?: string
    purpose: 'registration' | 'verification' | 'password_reset'
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { phone, userId, purpose }: SMSRequest = await req.json()

        // Normalize phone number to ensure consistency (Always +251...)
        let normalizedPhone = phone.trim().replace(/[^\d+]/g, '');
        normalizedPhone = normalizedPhone.replace(/\+/g, ''); // Remove + temporarily

        if (normalizedPhone.startsWith('2510')) {
            normalizedPhone = '251' + normalizedPhone.substring(4);
        } else if (normalizedPhone.startsWith('251')) {
            // 251... - Good
        } else if (normalizedPhone.startsWith('0') && normalizedPhone.length === 10) {
            normalizedPhone = '251' + normalizedPhone.substring(1);
        } else if (normalizedPhone.startsWith('9') && normalizedPhone.length === 9) {
            normalizedPhone = '251' + normalizedPhone;
        } else if (normalizedPhone.startsWith('7') && normalizedPhone.length === 9) {
            normalizedPhone = '251' + normalizedPhone;
        }

        const dbPhone = '+' + normalizedPhone; // Store with + in DB

        // Initialize Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // CHECK IF USER ALREADY REGISTERED (Pre-flight check)
        if (purpose === 'registration') {
            // Construct the canonical dummy email for this phone
            const potentialEmail = `phone_${normalizedPhone}@yesrasew.com`;

            // 1. Check direct profile existence (Fastest) with fuzzy phone match
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('id')
                .or(`phone.eq.+${normalizedPhone},phone.eq.${normalizedPhone},phone.eq.0${normalizedPhone.substring(3)},email.eq.${potentialEmail}`)
                .maybeSingle();

            if (profile) {
                return new Response(
                    JSON.stringify({ success: false, error: 'User already registered. Please login.' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 } // Return 200 so client sees error message
                );
            }

            // 2. Deep check in Auth Users (for legacy users missing profiles)
            // We use listUsers... optimized by checking the specific email algorithm first if possible?
            // Since we know the Exact Email format:
            // We can unfortunately only List.
            const { data: usersData } = await supabaseClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
            const exists = usersData.users.some((u: any) => {
                // Legacy email match
                if (u.email === potentialEmail) return true;
                // Phone match
                if (u.phone && u.phone.replace(/[^\d]/g, '') === normalizedPhone) return true;
                return false;
            });

            if (exists) {
                return new Response(
                    JSON.stringify({ success: false, error: 'User already registered. Please login.' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
                );
            }
        }

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString()

        // Store OTP in database
        const { error: insertError } = await supabaseClient
            .from('otps')
            .insert({
                phone: dbPhone, // Use standardized format
                otp: otp,
                purpose: purpose,
                expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
                used: false,
                user_id: userId || null
            })

        if (insertError) {
            console.error('Database insert error:', insertError)
            throw insertError
        }

        // Prepare SMS message
        const messages = {
            registration: `Welcome to YesraSew! Your verification code: ${otp}. Valid for 10 minutes.`,
            verification: `Your YesraSew verification code: ${otp}. Valid for 10 minutes.`,
            password_reset: `Your YesraSew password reset code: ${otp}. Valid for 10 minutes.`,
        }

        const message = messages[purpose] || messages.verification

        // Send SMS via GeezSMS API
        const geezSmsApiKey = Deno.env.get('GEEZ_SMS_API_KEY')

        if (!geezSmsApiKey) {
            console.warn('GeezSMS API key not configured, OTP will not be sent')
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'OTP generated (SMS not sent - API key missing)',
                    otp: otp, // Return OTP for development
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                }
            )
        }

        const smsPayload = {
            token: geezSmsApiKey,
            phone: phone.replace('+', ''), // Remove + prefix
            msg: message,
        }

        const smsResponse = await fetch('https://api.geezsms.com/api/v1/sms/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(smsPayload),
        })

        const smsResult = await smsResponse.json()

        console.log('SMS sent:', { phone, purpose, success: smsResponse.ok })

        return new Response(
            JSON.stringify({
                success: true,
                message: 'OTP sent successfully',
                // otp: otp, // REMOVED for production security
                smsStatus: smsResult,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error in send-ethiopian-sms:', error)
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Failed to send SMS',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
