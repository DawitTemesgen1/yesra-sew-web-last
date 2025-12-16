// Supabase Edge Function for sending emails via SMTP
// Uses SMTP configuration from system_settings table

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
    to: string
    userId?: string
    purpose: 'registration' | 'password_reset' | 'notification' | 'test'
    subject?: string
    message?: string
    firstName?: string
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { to, userId, purpose, subject, message, firstName }: EmailRequest = await req.json()

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

        // Get SMTP configuration from database
        const { data: smtpSettings, error: settingsError } = await supabaseClient
            .from('system_settings')
            .select('value')
            .eq('key', 'smtp_config')
            .single()

        if (settingsError || !smtpSettings) {
            console.warn('SMTP not configured in system_settings')
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'SMTP not configured. Please configure email settings in admin panel.',
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        const smtpConfig = smtpSettings.value
        const port = Number(smtpConfig.port || 587)

        // Generate 4-digit OTP if needed (for registration/password_reset)
        let otp: string | null = null
        if (purpose === 'registration' || purpose === 'password_reset') {
            otp = Math.floor(1000 + Math.random() * 9000).toString()

            // Store OTP in database
            const { error: insertError } = await supabaseClient
                .from('otps')
                .insert({
                    phone: to, // Using email field for email-based OTPs
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
        }

        // Prepare email content
        const emailSubject = subject || getEmailSubject(purpose)
        const emailHtml = getEmailTemplate(purpose, otp, firstName, message)

        // Initialize SMTP client
        const client = new SMTPClient({
            connection: {
                hostname: smtpConfig.host || 'smtp.gmail.com',
                port: port,
                tls: port === 465,
                auth: {
                    username: smtpConfig.username,
                    password: smtpConfig.password,
                },
            },
        })

        // Send email
        await client.send({
            from: `YesraSew <${smtpConfig.username}>`,
            to: to,
            subject: emailSubject,
            content: 'auto',
            html: emailHtml,
        })

        await client.close()

        console.log('Email sent:', { to, purpose, success: true })

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Email sent successfully',
                otp: otp, // Return OTP for development/testing
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error in send-email:', error)

        // Extract meaningful error message
        const errorMessage = error instanceof Error ? error.message : String(error)

        return new Response(
            JSON.stringify({
                success: false,
                error: errorMessage,
                details: 'Check Function Logs for stack trace'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})

// Helper functions
function getEmailSubject(purpose: string): string {
    const subjects = {
        registration: 'Welcome to YesraSew - Verify Your Email',
        password_reset: 'YesraSew - Password Reset Code',
        notification: 'YesraSew Notification',
        test: 'YesraSew - Email Configuration Test',
    }
    return subjects[purpose] || 'YesraSew'
}

function getEmailTemplate(purpose: string, otp: string | null, firstName?: string, customMessage?: string): string {
    const name = firstName || 'there'
    const year = new Date().getFullYear()

    const baseTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .otp-box { background: white; border: 2px dashed #1E3A8A; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
    .otp-code { font-size: 32px; font-weight: bold; color: #1E3A8A; letter-spacing: 5px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    .warning { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>YesraSew</h1>
    </div>
    <div class="content">
      ${getContentByPurpose(purpose, otp, name, customMessage)}
      <p>Best regards,<br>The YesraSew Team</p>
    </div>
    <div class="footer">
      <p>© ${year} YesraSew. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`
    return baseTemplate
}

function getContentByPurpose(purpose: string, otp: string | null, name: string, customMessage?: string): string {
    switch (purpose) {
        case 'registration':
            return `
        <p>Hello ${name},</p>
        <p>Thank you for registering with YesraSew. To complete your registration, please verify your email address using the OTP code below:</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <p style="margin: 10px 0 0 0; color: #666;">This code expires in 10 minutes</p>
        </div>
        <p>If you didn't create an account with YesraSew, please ignore this email.</p>
      `

        case 'password_reset':
            return `
        <p>Hello ${name},</p>
        <p>We received a request to reset your YesraSew account password. Use the code below to reset your password:</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <p style="margin: 10px 0 0 0; color: #666;">This code expires in 10 minutes</p>
        </div>
        <div class="warning">
          <strong>⚠️ Security Notice:</strong><br>
          If you didn't request a password reset, please ignore this email and ensure your account is secure.
        </div>
      `

        case 'test':
            return `
        <h2>✅ Email Configuration Successful!</h2>
        <p>This is a test email to confirm that your SMTP configuration is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `

        case 'notification':
            return `
        <p>Hello ${name},</p>
        ${customMessage || '<p>You have a new notification from YesraSew.</p>'}
      `

        default:
            return `<p>Hello ${name},</p><p>${customMessage || 'You have a message from YesraSew.'}</p>`
    }
}
