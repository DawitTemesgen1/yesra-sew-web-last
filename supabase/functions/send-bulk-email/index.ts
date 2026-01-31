
// Supabase Edge Function for sending Bulk Emails
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload = await req.json()
        const { subject, message, isTest, testEmail, filters } = payload

        // Initialize Supabase Client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: { persistSession: false, autoRefreshToken: false }
            }
        )

        // 1. Get SMTP Configuration
        const { data: smtpSettings, error: settingsError } = await supabaseClient
            .from('system_settings')
            .select('value')
            .eq('key', 'smtp_config')
            .single()

        if (settingsError || !smtpSettings) {
            throw new Error('SMTP Config not found in system_settings')
        }

        const smtpConfig = smtpSettings.value
        const client = new SMTPClient({
            connection: {
                hostname: smtpConfig.host || 'smtp.gmail.com',
                port: Number(smtpConfig.port || 587),
                tls: Number(smtpConfig.port) === 465,
                auth: {
                    username: smtpConfig.username,
                    password: smtpConfig.password,
                },
            },
        })

        // 2. Determine Recipients
        let recipients: any[] = []

        if (isTest) {
            if (!testEmail) throw new Error('Test email is required for test mode')
            recipients = [{ email: testEmail, full_name: 'Tester' }]
        } else {
            // Build Query
            let query = supabaseClient.from('profiles').select('id, email, full_name, phone')

            // Filter by Plans (if specific plans selected)
            if (filters?.targetType === 'filtered' && filters?.plans?.length > 0) {
                // Get users with these plans
                const { data: subData } = await supabaseClient
                    .from('user_subscriptions')
                    .select('user_id')
                    .in('plan_id', filters.plans)
                    .eq('status', 'active')

                const userIds = subData?.map(s => s.user_id) || []

                if (userIds.length === 0) {
                    return new Response(JSON.stringify({ success: true, count: 0, message: 'No users found for selected plans' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
                }
                query = query.in('id', userIds)
            }

            // Filter by Registration Method
            if (filters?.targetType === 'filtered' && filters?.regMethod !== 'all') {
                if (filters.regMethod === 'email') {
                    // Must have email AND not be a phone placeholder
                    query = query.not('email', 'is', null).not('email', 'ilike', 'phone_%')
                } else if (filters.regMethod === 'phone') {
                    // Must have phone
                    query = query.not('phone', 'is', null)
                }
            }

            const { data: users, error: userError } = await query
            if (userError) throw userError

            // Post-process to filter out invalid emails (e.g. placeholders for phone users)
            recipients = (users || []).filter((u: any) => {
                if (!u.email) return false
                // If filtering specifically for phone users, we might still want to send email IF they have one?
                // Or does the user imply sending SMS? The prompt says "Email Sending Screen".
                // I will filter out placeholder emails (phone_...@yesrasew.com) unless we are just dumping.
                // But generally bulk email should only go to real emails.
                return !u.email.startsWith('phone_') && u.email.includes('@')
            })
        }

        console.log(`Sending to ${recipients.length} recipients...`)

        // 3. Send Emails (Batching/Loop)
        // Note: For large lists, this should be queued. For now, simple loop.
        let sentCount = 0
        let failedCount = 0

        for (const recipient of recipients) {
            try {
                const personalizedMessage = message.replace('{{name}}', recipient.full_name || 'Valued User')

                const htmlContent = `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background:linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                             <h2>YesraSew</h2>
                        </div>
                        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
                             ${personalizedMessage}
                             <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
                                © ${new Date().getFullYear()} YesraSew Solution. All rights reserved.<br>
                                You are receiving this email because you are a registered user.
                             </p>
                        </div>
                    </div>
                </body>
                </html>
                `

                await client.send({
                    from: `YesraSew <${smtpConfig.username}>`,
                    to: recipient.email,
                    subject: subject,
                    content: 'text/html',
                    html: htmlContent,
                })
                sentCount++
            } catch (err) {
                console.error(`Failed to send to ${recipient.email}:`, err)
                failedCount++
            }
        }

        await client.close()

        // 4. Log Communication Record
        if (!isTest && sentCount > 0) {
            await supabaseClient.from('communications').insert({
                type: 'email',
                subject: subject,
                message: message, // Store raw message or summary
                recipient: filters?.targetType === 'all' ? 'All Users' : 'Filtered Group',
                status: 'sent',
                sent_at: new Date().toISOString(),
                category: 'bulk_campaign',
                metadata: { sent: sentCount, failed: failedCount, filters }
            })
        }

        return new Response(
            JSON.stringify({
                success: true,
                count: sentCount,
                failed: failedCount,
                message: `Sent ${sentCount} emails, skipped ${failedCount}`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Bulk Email Error:', error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
