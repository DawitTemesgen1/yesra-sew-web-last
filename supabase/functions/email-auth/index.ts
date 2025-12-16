
// Supabase Edge Function: email-auth
// UNIFIED EMAIL AUTHENTICATION HANDLER
// Handles: Email OTP Sending, Verification, User Registration, Password Reset via Nodemailer

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer@6.9.13'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
    action: 'send_email_otp' | 'verify_registration' | 'verify_reset' | 'test_config'
    email: string
    purpose?: 'registration' | 'login' | 'password_reset' // for sending
    otp?: string // for verification
    userData?: any // for registration
    newPassword?: string // for reset
    firstName?: string // for personalization
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        // 1. Parse Request
        const payload: EmailRequest = await req.json()
        const { action, email, purpose, otp, userData, newPassword, firstName } = payload

        if (!action || !email) throw new Error('Missing required fields: action, email')

        // 2. Initialize Supabase Admin
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { persistSession: false } }
        )

        // 3. Router
        switch (action) {
            case 'send_email_otp':
                return await handleSendEmailOtp(supabase, email, purpose || 'registration', firstName)
            case 'verify_registration':
                return await handleVerifyRegistration(supabase, email, otp, userData)
            case 'verify_reset':
                return await handleVerifyReset(supabase, email, otp, newPassword)
            case 'test_config':
                return new Response(JSON.stringify({ success: true, message: 'Email Function Reachable' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            default:
                throw new Error(`Invalid action: ${action}`)
        }

    } catch (error) {
        console.error('Email Auth Error:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        return new Response(
            JSON.stringify({ success: false, error: errorMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})

// ==========================================
// HANDLERS
// ==========================================

async function handleSendEmailOtp(supabase: any, email: string, purpose: string, firstName?: string) {
    // 1. Generate 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString()

    // 2. Save to DB
    const { error: dbError } = await supabase.from('otps').insert({
        phone: email, // shared column used for both phone/email
        otp: generatedOtp,
        purpose,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        used: false
    })

    if (dbError) throw new Error('Database Error: ' + dbError.message)

    // 3. Send Email
    await sendNodeMail(supabase, email, generatedOtp, purpose, firstName)

    return successResponse({ message: 'OTP Sent via Email' })
}

async function handleVerifyRegistration(supabase: any, email: string, otp: string | undefined, userData: any) {
    if (!otp || !userData) throw new Error('Missing OTP or User Data')

    // 1. Verify OTP
    const otpId = await verifyOtpInDb(supabase, email, otp, 'registration')

    // 2. Create User
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: userData.password,
        email_confirm: true, // Mark verified
        user_metadata: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            account_type: userData.accountType,
            company_name: userData.companyName
        }
    })

    if (createError) throw createError

    // 3. Mark OTP Used
    await markOtpUsed(supabase, otpId)

    return successResponse({ message: 'User Created', user })
}

async function handleVerifyReset(supabase: any, email: string, otp: string | undefined, newPassword: string | undefined) {
    if (!otp || !newPassword) throw new Error('Missing OTP or New Password')

    // 1. Verify OTP
    const otpId = await verifyOtpInDb(supabase, email, otp, 'password_reset')

    // 2. Find User
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users.users.find((u: any) => u.email === email)
    if (!user) throw new Error('User not found')

    // 3. Update Password
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword })
    if (updateError) throw updateError

    // 4. Mark OTP Used
    await markOtpUsed(supabase, otpId)

    return successResponse({ message: 'Password Reset Successful' })
}

// ==========================================
// HELPERS
// ==========================================

async function verifyOtpInDb(supabase: any, contact: string, otp: string, purpose: string) {
    const { data, error } = await supabase.from('otps')
        .select('*')
        .eq('phone', contact)
        .eq('otp', otp)
        .eq('purpose', purpose)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .limit(1)
        .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Invalid or Expired OTP')

    return data.id
}

async function markOtpUsed(supabase: any, id: string) {
    await supabase.from('otps').update({ used: true }).eq('id', id)
}

async function sendNodeMail(supabase: any, to: string, otp: string, purpose: string, firstName?: string) {
    // 1. Get Config
    const { data: settings } = await supabase.from('system_settings').select('value').eq('key', 'smtp_config').single()
    if (!settings) throw new Error('SMTP Config Missing')

    const config = settings.value
    const port = Number(config.port || 587)

    // 2. Create Transporter
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: port,
        secure: port === 465,
        auth: { user: config.username, pass: config.password }
    })

    // 3. Prepare HTML
    const subject = purpose === 'registration' ? 'Welcome to YesraSew - Verify Email' : 'YesraSew Password Reset'
    const name = firstName || 'there'
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>YesraSew Verification</h2>
        <p>Hello ${name},</p>
        <p>Your verification code is:</p>
        <h1 style="color: #1E3A8A; letter-spacing: 5px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `

    // 4. Send
    await transporter.sendMail({
        from: `"YesraSew" <${config.username}>`,
        to,
        subject,
        html
    })
}

function successResponse(data: any) {
    return new Response(
        JSON.stringify({ success: true, ...data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
}
