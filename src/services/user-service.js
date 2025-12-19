import { supabase } from '../lib/supabaseClient';
// Removed new createClient to share session/auth state


const userService = {
    async getProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    async updateProfile(updates) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    async getFavorites() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // 1. Get Favorite Listing IDs
            // We fetch IDs first to avoid "Could not find relationship" errors or join complications
            const { data: favorites, error: favError } = await supabase
                .from('favorites')
                .select('listing_id')
                .eq('user_id', user.id);

            if (favError) throw favError;

            if (!favorites || favorites.length === 0) {
                return [];
            }

            const listingIds = favorites.map(f => f.listing_id).filter(Boolean);

            if (listingIds.length === 0) return [];

            // 2. Fetch Actual Listings
            // We use the listing-service logic logic here ideally, but raw fetch is fine for now
            const { data: listings, error: listError } = await supabase
                .from('listings')
                .select('*')
                .in('id', listingIds);

            if (listError) throw listError;

            // Map to ensure is_premium and other computed fields if necessary
            return (listings || []).map(l => ({
                ...l,
                is_premium: l.is_premium || l.custom_fields?.is_premium || false,
                is_favorited: true // Since these ARE favorites
            }));

        } catch (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }
    }
};

export default userService;
