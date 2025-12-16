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

            const { data, error } = await supabase
                .from('favorites')
                .select('*, listings(*)')
                .eq('user_id', user.id);

            if (error) throw error;

            // Format to return just the listings
            return data.map(f => f.listings).filter(Boolean);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }
    }
};

export default userService;
