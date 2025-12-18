import { supabase } from '../lib/supabaseClient';
import listingsAPI from './listingsAPI';

/**
 * Listing Service - Now uses Node.js/MySQL backend for listings
 * Supabase is still used for favorites, comments, and user data
 */
const listingService = {
    /**
     * Create new listing - Uses Node.js backend
     */
    async createListing(listingData) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Extract images from listingData
            const images = listingData.images || [];

            // Prepare listing data for backend
            const backendData = {
                title: listingData.title,
                description: listingData.description,
                price: parseFloat(listingData.price) || 0,
                category: listingData.category,
                location: listingData.location,
                user_id: user.id,
                category_id: listingData.category_id,
                custom_fields: listingData.custom_fields || {}
            };

            // Call Node.js backend
            const result = await listingsAPI.createListing(backendData, images);

            return {
                success: result.success,
                listing: { id: result.data?.id, ...backendData }
            };
        } catch (error) {
            console.error('Error creating listing:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get all listings - Uses Node.js backend
     */
    async getListings(filters = {}) {
        try {
            // Map frontend filters to backend params
            const params = {
                category: filters.category,
                search: filters.search,
                brand: filters.brand,
                min_price: filters.min_price,
                max_price: filters.max_price,
                location: filters.location,
                page: filters.page || 1,
                limit: filters.limit || 12,
                sort: filters.sort || 'created_at',
                order: filters.order || 'DESC'
            };

            // Remove undefined values
            Object.keys(params).forEach(key =>
                params[key] === undefined && delete params[key]
            );

            const result = await listingsAPI.getListings(params);

            return {
                success: result.success,
                listings: result.listings || [],
                pagination: result.pagination,
                hasMore: result.pagination?.page < result.pagination?.pages
            };
        } catch (error) {
            console.error('Error fetching listings:', error);
            return { success: false, listings: [], hasMore: false };
        }
    },

    /**
     * Get single listing by ID - Uses Node.js backend
     */
    async getListingById(id) {
        try {
            const result = await listingsAPI.getListing(id);

            if (!result.success || !result.listing) {
                throw new Error('Listing not found');
            }

            const listing = result.listing;

            // Fetch seller profile from Supabase
            let sellerProfile = null;
            if (listing.user_id) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', listing.user_id)
                    .single();
                sellerProfile = profile;
            }

            // Check if current user has favorited this listing
            const { data: { user } } = await supabase.auth.getUser();
            let isFavorited = false;
            if (user) {
                const { data: favorite } = await supabase
                    .from('favorites')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('listing_id', id)
                    .single();
                isFavorited = !!favorite;
            }

            // Format the response
            const formattedListing = {
                ...listing,
                seller: sellerProfile ? {
                    id: sellerProfile.id,
                    name: sellerProfile.full_name || 'Unknown Seller',
                    avatar: sellerProfile.avatar_url,
                    memberSince: sellerProfile.created_at,
                    rating: sellerProfile.rating || 0,
                    reviews: sellerProfile.review_count || 0,
                    verified: sellerProfile.is_verified || false,
                    phone: sellerProfile.phone
                } : null,
                is_favorited: isFavorited,
                author_id: listing.user_id
            };

            return { success: true, listing: formattedListing };
        } catch (error) {
            console.error('Error fetching listing:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get user's listings - Uses Node.js backend
     */
    async getUserListings() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const result = await listingsAPI.getListings({ user_id: user.id, limit: 100 });

            return {
                success: result.success,
                listings: result.listings || []
            };
        } catch (error) {
            console.error('Error fetching user listings:', error);
            return { success: false, listings: [] };
        }
    },

    /**
     * Update listing - Uses Node.js backend
     */
    async updateListing(id, updates, newImages = [], removeImages = []) {
        try {
            const result = await listingsAPI.updateListing(id, updates, newImages, removeImages);
            return { success: result.success, listing: result.data };
        } catch (error) {
            console.error('Error updating listing:', error);
            throw error;
        }
    },

    /**
     * Delete listing - Uses Node.js backend
     */
    async deleteListing(id) {
        try {
            const result = await listingsAPI.deleteListing(id);
            return { success: result.success };
        } catch (error) {
            console.error('Error deleting listing:', error);
            throw error;
        }
    },

    /**
     * Toggle favorite - Still uses Supabase
     */
    async toggleFavorite(listingId) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Check if already favorited
            const { data: existing } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', user.id)
                .eq('listing_id', listingId)
                .single();

            if (existing) {
                // Remove from favorites
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('id', existing.id);
                if (error) throw error;
                return { success: true, favorited: false };
            } else {
                // Add to favorites
                const { error } = await supabase
                    .from('favorites')
                    .insert([{ user_id: user.id, listing_id: listingId }]);
                if (error) throw error;
                return { success: true, favorited: true };
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            throw error;
        }
    },

    /**
     * Get listing comments - Still uses Supabase
     */
    async getListingComments(listingId) {
        try {
            const { data, error } = await supabase
                .from('listing_comments')
                .select('*, profiles:user_id(full_name, avatar_url)')
                .eq('listing_id', listingId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
    },

    /**
     * Add listing comment - Still uses Supabase
     */
    async addListingComment(listingId, comment) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('listing_comments')
                .insert([{
                    listing_id: listingId,
                    user_id: user.id,
                    comment: comment
                }])
                .select('*, profiles:user_id(full_name, avatar_url)')
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    /**
     * Get dashboard stats
     */
    async getDashboardStats() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // Fetch user's listings from Node.js backend
            const { listings } = await this.getUserListings();

            const stats = {
                totalPosts: listings.length,
                activePosts: listings.filter(l => l.status === 'active').length,
                totalViews: listings.reduce((sum, l) => sum + (l.views || 0), 0),
                responseRate: 100 // Placeholder
            };

            return { success: true, stats, listings };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return { success: false, stats: null, listings: [] };
        }
    },

    /**
     * Upload file - Still uses Supabase Storage (for non-listing files)
     */
    async uploadFile(file, bucket = 'listings') {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return { success: true, url: publicUrl };
        } catch (error) {
            console.error('Error uploading file:', error);
            return { success: false, error: error.message };
        }
    }
};

export default listingService;
