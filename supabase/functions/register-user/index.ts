// Supabase Edge Function for Register User with OTP
// Verifies OTP and creates user with 'email_confirm: true'

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload = await req.json()
        const { phoneIdentifier, email, otp, password, firstName, lastName, accountType, companyName } = payload

        if (!email || !otp || !password || !firstName || !lastName) {
            throw new Error('Missing required fields')
        }

        // Initialize Supabase Admin Client (Service Role)
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
        const lookupIdentifier = phoneIdentifier || email;

        const { data: otpRecord, error: otpError } = await supabaseAdmin
            .from('otps')
            .select('*')
            .eq('phone', lookupIdentifier)
            .eq('otp', otp)
            .eq('purpose', 'registration')
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

        // 2. Create or Update User in Supabase Auth
        let userData;
        const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                account_type: accountType || 'individual',
                company_name: accountType === 'company' ? companyName : null,
                phone: phoneIdentifier || null,
                is_ethiopian_phone: !!phoneIdentifier
            }
        })

        if (createError) {
            // Check if user already exists
            if (createError.message.includes('already registered') || createError.status === 422) {
                console.log('User already exists, updating profile...');
                // fetch the user to get ID
                const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
                const existingUser = users.find((u: any) => u.email === email);

                if (existingUser) {
                    // Update the existing user
                    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                        existingUser.id,
                        {
                            password: password,
                            email_confirm: true,
                            user_metadata: {
                                first_name: firstName,
                                last_name: lastName,
                                account_type: accountType || 'individual',
                                company_name: accountType === 'company' ? companyName : null,
                                phone: phoneIdentifier || null,
                                is_ethiopian_phone: !!phoneIdentifier
                            }
                        }
                    );

                    if (updateError) throw updateError;
                    userData = { user: updatedUser.user };
                } else {
                    throw createError; // Should not happen if message says registered
                }
            } else {
                console.error('Create user error:', createError);
                throw createError;
            }
        } else {
            userData = createdUser;
        }

        // 2a. Sync to Profiles (Crucial for generic lookup)
        // If we have a phone identifier, ensure it's in the profiles table
        if (userData?.user && phoneIdentifier) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: userData.user.id,
                    email: email, // This is the dummy email
                    phone: phoneIdentifier, // The REAL phone number
                    first_name: firstName,
                    last_name: lastName,
                    account_type: accountType || 'individual',
                    company_name: accountType === 'company' ? companyName : null,
                    is_verified: true
                });

            if (profileError) console.error('Error syncing profile:', profileError);
        }

        // 3. Mark OTP as used
        await supabaseAdmin
            .from('otps')
            .update({ used: true })
            .eq('id', otpRecord.id)

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Account created successfully',
                user: userData.user
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error('Error in register-user:', error)
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'Failed to create account',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
