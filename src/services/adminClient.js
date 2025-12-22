import { createClient } from '@supabase/supabase-js';

// --- Configuration for Isolated Admin Auth ---
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Custom storage adapter to namespace admin keys consistently
const adminStorage = {
    getItem: (key) => window.localStorage.getItem(`admin_panel_${key}`),
    setItem: (key, value) => window.localStorage.setItem(`admin_panel_${key}`, value),
    removeItem: (key) => window.localStorage.removeItem(`admin_panel_${key}`),
};

// Create a completely separate Supabase client instance for the Admin Panel
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: adminStorage,
        storageKey: 'session_token',
    }
});

