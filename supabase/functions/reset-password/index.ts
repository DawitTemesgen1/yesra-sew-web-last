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

        // Normalize identifier if it looks like a phone number (start with +, 09, 251, 9)
        // This matches the logic in send-ethiopian-sms
        let lookupIdentifier = identifier;
        if (type === 'phone' || /^[+0-9]+$/.test(identifier)) {
            let clean = identifier.trim().replace(/[^\d+]/g, '');
            clean = clean.replace(/\+/g, '');
            if (clean.startsWith('2510')) clean = '251' + clean.substring(4);
            else if (clean.startsWith('0') && clean.length === 10) clean = '251' + clean.substring(1);
            else if (clean.startsWith('9') && clean.length === 9) clean = '251' + clean;
            else if (clean.startsWith('7') && clean.length === 9) clean = '251' + clean;

            lookupIdentifier = '+' + clean;
        }

        const { data: otpRecord, error: otpError } = await supabaseAdmin
            .from('otps')
            .select('*')
            .eq('phone', lookupIdentifier) // Use normalized phone
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
                // Phone lookup via admin API list
                // Phone is checked against multiple formats
                const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })

                if (listError) throw listError;

                // Normalize phone input
                const cleanInput = identifier.replace(/[^\d]/g, ''); // 2519...
                const formats = [
                    '+' + cleanInput, // +2519...
                    cleanInput,       // 2519...
                    '0' + cleanInput.substring(3) // 09... (assuming 251 prefix)
                ];

                const user = usersData?.users.find(u => {
                    // Check against phone column
                    if (u.phone) {
                        const cleanUserPhone = u.phone.replace(/[^\d]/g, '');
                        if (cleanInput === cleanUserPhone) return true;
                    }

                    // Check against EMAIL (for legacy users stored as phone_251...@yesrasew.com)
                    // The format seen in DB is: phone_251901270712@yesrasew.com
                    // distinct format: phone_<number_without_plus>@yesrasew.com
                    const potentialEmail = `phone_${cleanInput}@yesrasew.com`;
                    if (u.email === potentialEmail) return true;

                    return false;
                });

                if (user) userId = user.id
            }

            if (!userId) {
                // Return 200 with success: false so the client can show the error message gracefully
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: 'User not found. Please check your number or register first.',
                    }),
                    {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 200,
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
