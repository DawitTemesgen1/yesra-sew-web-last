
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Authenticate Request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('No Authorization header')

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) throw new Error('Invalid token')

        // 2. Authorize (Check if requester is Owner/Super Admin)
        // We check both metadata and profile to be secure
        const requesterRole = user.user_metadata?.role

        // Also check DB profile to be sure (source of truth)
        const { data: requesterProfile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const dbRole = requesterProfile?.role;

        // Allow 'owner' or 'super_admin' to perform actions
        const allowedRoles = ['owner', 'super_admin'];
        const isAuthorized = allowedRoles.includes(requesterRole) || allowedRoles.includes(dbRole);

        if (!isAuthorized) {
            console.error(`Unauthorized attempt by user ${user.id} with role ${dbRole}/${requesterRole}`);
            return new Response(
                JSON.stringify({ error: 'Unauthorized. Only Owners can perform this action.' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { action, userId, newRole } = await req.json()

        if (action === 'update_role') {
            if (!userId || !newRole) throw new Error('Missing userId or newRole')

            console.log(`Updating user ${userId} to role ${newRole} by request of ${user.id}`);

            // 3. Perform Updates
            // A. Update Auth User Metadata -> uses admin.updateUserById which requires service_role client
            const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                { user_metadata: { role: newRole } }
            )

            if (authUpdateError) {
                console.error('Auth update error:', authUpdateError);
                throw authUpdateError
            }

            // B. Update Profiles Table
            const { error: profileUpdateError } = await supabaseAdmin
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)

            if (profileUpdateError) {
                console.error('Profile update error:', profileUpdateError);
                throw profileUpdateError
            }

            return new Response(
                JSON.stringify({ success: true, message: `User role updated to ${newRole}` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        throw new Error(`Unknown action: ${action}`)

    } catch (error) {
        console.error('Admin Action Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
