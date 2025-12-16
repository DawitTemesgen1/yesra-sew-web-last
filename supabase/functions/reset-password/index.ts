// Supabase Edge Function for verify OTP and Reset Password
// Securely handles password updates using Service Role Key

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResetRequest {
    identifier: string // Phone or Email
    otp: string
    newPassword: string
    type: 'phone' | 'email'
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { identifier, otp, newPassword, type }: ResetRequest = await req.json()

        if (!identifier || !otp || !newPassword) {
            throw new Error('Missing required fields')
        }

        // Initialize Supabase Admin Client (Service Role)
        // REQUIRED for calculating auth updates
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 1. Verify OTP
        // Note: For email, 'phone' column stores the email address
        // Note: 'identifier' should be formatted/normalized by frontend before sending

        const { data: otpRecord, error: otpError } = await supabaseAdmin
            .from('otps')
            .select('*')
            .eq('phone', identifier) // phone column holds identifier (email or phone)
            .eq('otp', otp)
            .eq('purpose', 'password_reset')
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (otpError) throw otpError

        if (!otpRecord) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid or expired verification code',
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        // 2. Identify User
        let userId = otpRecord.user_id

        if (!userId) {
            // Fallback: Find user by identifier if ID not in OTP record
            // This handles cases where OTP might have been created without ID (though it shouldn't for reset)
            console.log('User ID missing in OTP record, looking up by identifier...')

            if (type === 'email') {
                const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers()
                const user = users?.users.find(u => u.email === identifier)
                if (user) userId = user.id
            } else {
                // Phone lookup is harder via admin API list, but we can try
                // or assumption is we won't reach here if frontend did job right
                // Let's rely on frontend sending formatted phone which matches profiles
            }

            if (!userId) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: 'User not found for password reset',
                    }),
                    {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 400,
                    }
                )
            }
        }

        // 3. Update Password
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        )

        if (updateError) {
            console.error('Update user error:', updateError)
            throw updateError
        }

        // 4. Mark OTP as used
        await supabaseAdmin
            .from('otps')
            .update({ used: true })
            .eq('id', otpRecord.id)

        // 5. Verification: Update profile status (good practice)
        await supabaseAdmin
            .from('profiles')
            .update({ is_verified: true })
            .eq('id', userId)

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Password reset successful',
                userId: userId
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error('Error in reset-password:', error)
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Failed to reset password',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
