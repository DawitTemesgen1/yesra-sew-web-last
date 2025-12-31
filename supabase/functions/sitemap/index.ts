import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://www.yesrasewsolution.com';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );

        // 1. Fetch Listings (Active/Approved)
        // We fetch ID and updated_at to build the sitemap
        const { data: listings, error } = await supabaseClient
            .from('listings')
            .select('id, updated_at, status')
            .in('status', ['active', 'approved']);

        if (error) {
            console.error("Sitemap fetch error:", error);
            throw error;
        }

        // 2. Define Static Pages
        // These are the core routes of your React App
        const staticPages = [
            { loc: '/', priority: '1.0', freq: 'daily' },
            { loc: '/jobs', priority: '0.9', freq: 'hourly' },
            { loc: '/tenders', priority: '0.9', freq: 'hourly' },
            { loc: '/homes', priority: '0.8', freq: 'daily' },
            { loc: '/cars', priority: '0.8', freq: 'daily' },
            { loc: '/listings', priority: '0.8', freq: 'always' },
            { loc: '/pricing', priority: '0.7', freq: 'weekly' },
            { loc: '/contact', priority: '0.5', freq: 'monthly' },
            { loc: '/about', priority: '0.5', freq: 'monthly' },
            { loc: '/privacy', priority: '0.3', freq: 'monthly' },
            { loc: '/terms', priority: '0.3', freq: 'monthly' },
        ];

        // 3. Build XML Content
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Append Static Pages
        staticPages.forEach(page => {
            xml += `
  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
        });

        // Append Dynamic Listings
        // Assuming URL pattern is /listings/:id
        listings?.forEach(listing => {
            const lastMod = listing.updated_at
                ? new Date(listing.updated_at).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];

            xml += `
  <url>
    <loc>${BASE_URL}/listings/${listing.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        xml += `
</urlset>`;

        // 4. Return XML Response
        return new Response(xml, {
            headers: {
                ...corsHeaders,
                "Content-Type": "application/xml",
                "Cache-Control": "public, max-age=3600, s-maxage=3600" // CDN Cache 1 hour
            },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
