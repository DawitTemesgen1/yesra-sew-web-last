
// Supabase Edge Function: send-bulk-email
// Handles: Mass Email Campaigns to segments or all users
// Using Nodemailer for stability (same as email-auth)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer@6.9.13'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // 1. Handle CORS preflight
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        // 2. Parse Request
        const payload = await req.json()
        const { subject, message, isTest, testEmail, filters } = payload

        // 3. Initialize Supabase Admin
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { persistSession: false } }
        )

        // 4. Get SMTP Config
        const { data: settings } = await supabase.from('system_settings').select('value').eq('key', 'smtp_config').single()
        if (!settings) throw new Error('SMTP Config Missing')

        const config = settings.value
        const port = Number(config.port || 587)

        // 5. Create Transporter
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: port,
            secure: port === 465,
            auth: { user: config.username, pass: config.password }
        })

        // 6. Setup Recipients with Filtering
        let recipients = []
        if (isTest) {
            recipients = [{ email: testEmail, full_name: 'Tester' }]
        } else {
            console.log('Fetching recipients with filters:', filters)

            let query = supabase.from('profiles').select('id, email, full_name, phone')

            // Filter by Registration Method
            if (filters?.regMethod === 'email') {
                query = query.not('email', 'ilike', 'phone_%')
            } else if (filters?.regMethod === 'phone') {
                query = query.not('email', 'is', null)
            }

            // JOIN logic for Plan filtering
            if (filters?.targetType === 'filtered' && filters?.plans?.length > 0) {
                const { data: subscribedUserIds } = await supabase
                    .from('user_subscriptions')
                    .select('user_id')
                    .in('plan_id', filters.plans)
                    .eq('status', 'active')

                const userIds = subscribedUserIds?.map((s: any) => s.user_id) || []
                if (userIds.length === 0) {
                    return new Response(JSON.stringify({ success: true, count: 0, message: 'No users found with selected plans' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
                }
                query = query.in('id', userIds)
            }

            const { data: users, error: dbError } = await query
            if (dbError) throw dbError

            // Final filter to ensure real emails and exclude placeholders
            recipients = (users as any[] || []).filter((u: any) => u.email && u.email.includes('@') && !u.email.startsWith('phone_'))
        }

        console.log(`Sending to ${recipients.length} recipients...`)

        // 7. Send Emails (Loop)
        let sentCount = 0
        let failedCount = 0
        const failedRecipients = []

        for (const recipient of recipients) {
            try {
                // Process the message: Replace name and handle newlines
                let personalized = message.replace(/{{name}}/g, recipient.full_name || 'Valued User');
                const htmlMessage = personalized.replace(/\n/g, '<br/>');

                // Professional Template with branding
                const htmlBody = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f7f9fc; }
                        .email-container { max-width: 600px; margin: 30px auto; border: 1px solid #e1e4e8; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); background: #ffffff; }
                        .email-header { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); padding: 40px 30px; text-align: center; color: white; }
                        .email-body { padding: 40px; font-size: 16px; color: #374151; }
                        .email-footer { background: #f9fafb; padding: 25px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #f3f4f6; }
                        .brand-name { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }
                        .brand-tagline { font-size: 14px; opacity: 0.9; margin: 5px 0 0 0; }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1 class="brand-name">YesraSew Solution</h1>
                            <p class="brand-tagline">Connecting professionals, driving careers.</p>
                        </div>
                        <div class="email-body">
                            ${htmlMessage}
                        </div>
                        <div class="email-footer">
                            <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} YesraSew Solution. All rights reserved.</p>
                            <p style="margin: 0;">You are receiving this because you are a registered member of our platform.</p>
                            <p style="margin: 8px 0 0 0;"><a href="#" style="color: #3b82f6; text-decoration: none;">Unsubscribe</a> | <a href="#" style="color: #3b82f6; text-decoration: none;">Global Settings</a></p>
                        </div>
                    </div>
                </body>
                </html>
                `

                await transporter.sendMail({
                    from: `"YesraSew Support" <${config.username}>`,
                    to: recipient.email,
                    subject: isTest ? `[TEST] ${subject}` : subject,
                    html: htmlBody
                })
                sentCount++
            } catch (err: any) {
                console.error(`Failed to send to ${recipient.email}:`, err)
                failedCount++
                failedRecipients.push({ email: recipient.email, error: err.message })
            }
        }

        // 8. Log the Campaign in communications table
        if (!isTest && (sentCount > 0 || failedCount > 0)) {
            await supabase.from('communications').insert({
                type: 'email',
                subject: subject,
                message: message,
                recipient: filters?.targetType === 'all' ? 'All Users' : 'Filtered Recipients',
                status: failedCount > 0 && sentCount === 0 ? 'failed' : 'sent',
                sent_at: new Date().toISOString(),
                category: 'campaign',
                metadata: {
                    sent: sentCount,
                    failed: failedCount,
                    filters: filters,
                    failed_details: failedRecipients.slice(0, 10) // Store first 10 errors
                }
            })
        }

        return new Response(
            JSON.stringify({
                success: true,
                count: sentCount,
                failed: failedCount,
                message: isTest ? "Test email sent successfully" : `Successfully sent to ${sentCount} users, ${failedCount} failed.`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Bulk Email Function Error:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        return new Response(
            JSON.stringify({ success: false, error: errorMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
