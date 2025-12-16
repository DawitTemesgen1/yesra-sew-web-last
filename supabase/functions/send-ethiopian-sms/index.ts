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

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString()

        // Store OTP in database
        const { error: insertError } = await supabaseClient
            .from('otps')
            .insert({
                phone: phone,
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
                otp: otp, // Return OTP for development/testing
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
