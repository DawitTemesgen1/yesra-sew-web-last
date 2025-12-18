import { supabase } from '../lib/supabaseClient';
// Removed new createClient to share session/auth state


const listingService = {
    async createListing(listingData) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Handle image uploads if they are File objects
            let imageUrls = [];
            if (listingData.images && Array.isArray(listingData.images)) {
                const uploadPromises = listingData.images.map(async (img) => {
                    if (img.file instanceof File) {
                        const { url, error } = await this.uploadFile(img.file);
                        if (error) throw error;
                        return url;
                    } else if (typeof img === 'string') {
                        return img; // Already a URL
                    }
                    return null;
                });
                imageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);
            }

            // Prepare data for insertion
            const dbData = {
                ...listingData,
                user_id: user.id,
                status: 'pending',
                created_at: new Date().toISOString(),
                images: imageUrls, // Store array of URLs
                // Ensure numeric fields are numbers
                price: parseFloat(listingData.price) || 0,
                year: listingData.year ? parseInt(listingData.year) : null,
                bedrooms: listingData.bedrooms ? parseInt(listingData.bedrooms) : null,
                bathrooms: listingData.bathrooms ? parseInt(listingData.bathrooms) : null,
                area_sqft: listingData.area_sqft ? parseInt(listingData.area_sqft) : null,
            };

            // Remove temporary fields if any
            delete dbData.video; // Handle video separately if needed

            const { data, error } = await supabase
                .from('listings')
                .insert([dbData])
                .select()
                .single();

            if (error) throw error;
            return { success: true, listing: data };
        } catch (error) {
            console.error('Error creating listing:', error);
            return { success: false, error: error.message };
        }
    },

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
    },

    async getListings(filters = {}) {
        // PERFORMANCE OPTIMIZATION: Only select fields we actually need
        const fields = filters.fullData
            ? '*'
            : 'id,title,description,price,location,images,category_id,user_id,is_premium,custom_fields,created_at,status,type';

        let query = supabase
            .from('listings')
            .select(fields)
            .order('created_at', { ascending: false });

        // PERFORMANCE: Add pagination support
        const limit = filters.limit || 50; // Default to 50 items
        const offset = filters.offset || 0;
        query = query.range(offset, offset + limit - 1);

        if (filters.category) {
            const term = filters.category.trim().toLowerCase();
            const variations = [term];
            if (!term.endsWith('s')) variations.push(term + 's');
            if (term.endsWith('s')) variations.push(term.slice(0, -1));

            // Optimistic Cache or Hardcoded Map for core categories to save a roundtrip
            // This is critical for performance on Home Page which calls getListings multiple times
            // Optimistic Map for core categories using VERIFIED PROD IDs
            // This ensures immediate loading without waiting for the category fetch roundtrip
            const coreMap = {
                'homes': '85259f35-6146-4fd2-b75e-046199527aec',
                'cars': '461d8ebf-be96-474a-8d51-d97f84c7a042',
                'jobs': 'eade00c5-cfe5-4a6c-8d4f-42b3de59d792',
                'tenders': '4422d860-015c-44ba-b296-9823bc4470ec',
                // Singular variations just in case
                'home': '85259f35-6146-4fd2-b75e-046199527aec',
                'car': '461d8ebf-be96-474a-8d51-d97f84c7a042',
                'job': 'eade00c5-cfe5-4a6c-8d4f-42b3de59d792',
                'tender': '4422d860-015c-44ba-b296-9823bc4470ec'
            };

            let matchedId = coreMap[term] || coreMap[term + 's'] || coreMap[term.replace(/s$/, '')];

            if (matchedId) {
                query = query.eq('category_id', matchedId);
            } else {
                // CACHE STRATEGY - Only if not found in core map
                if (!window._categoryCache) {
                    try {
                        const { data: allCats } = await supabase.from('categories').select('id, name, slug');
                        if (allCats) window._categoryCache = allCats;
                    } catch (err) {
                        console.warn("Category lookup failed:", err);
                    }
                }

                const allCats = window._categoryCache || [];
                const matchedCat = allCats.find(c =>
                    variations.includes(c.slug?.toLowerCase()) ||
                    variations.includes(c.name?.toLowerCase())
                );

                if (matchedCat) {
                    query = query.eq('category_id', matchedCat.id);
                } else {
                    console.warn(`Category '${filters.category}' unable to resolve to an ID.`);
                    // Do NOT fall back to .ilike('category') as that column does not exist.
                    // Instead, we unfortunately must return no results to be accurate, 
                    // or we ignore the filter (which is confusing). 
                    // Better to return empty than wrong data.
                    // To force empty:
                    query = query.eq('id', '00000000-0000-0000-0000-000000000000');
                }
            }
        }

        // If category_id is directly provided
        if (filters.category_id) {
            query = query.eq('category_id', filters.category_id);
        }

        // Filter by user_id if provided
        if (filters.user_id) {
            query = query.eq('user_id', filters.user_id);
        }

        // Filter by status - default to 'approved' or 'active' for public pages
        // Admin pages should explicitly pass status: 'all' or specific status
        if (filters.status) {
            if (filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }
        } else {
            // Strictly show only approved/verified listings for public
            query = query.eq('status', 'approved');
        }

        // Filter by type (For Sale, For Rent, etc.)
        if (filters.type) {
            query = query.eq('type', filters.type);
        }

        // Search by title or description
        if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        // PERFORMANCE: Reduced timeout from 30s to 8s for faster failure feedback
        const { data, error } = await Promise.race([
            query,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Listings query timeout')), 8000))
        ]);

        if (error) {
            console.error('Supabase query error:', error);
            return { success: false, error: error.message, listings: [] };
        }

        if (!data || data.length === 0) {
            console.warn(`getListings returned 0 results. Filter used:`, filters);
        }

        const formattedListings = (data || []).map(l => ({
            ...l,
            is_premium: l.is_premium || l.custom_fields?.is_premium || false
        }));

        return { success: true, listings: formattedListings, hasMore: data?.length === limit };
    },

    async getListingById(id) {
        try {
            // Fetch listing with seller profile
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Fetch seller profile separately
            let sellerProfile = null;
            if (data.user_id) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user_id)
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

            // Format the response to match what the UI expects
            const formattedListing = {
                ...data,
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
                author_id: data.user_id
            };

            return { success: true, listing: formattedListing };
        } catch (error) {
            console.error('Error fetching listing:', error);
            return { success: false, error: error.message };
        }
    },

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


    async getUserListings() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, listings: data };
    },

    async deleteListing(id) {
        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    },

    async updateListing(id, updates) {
        const { data, error } = await supabase
            .from('listings')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { success: true, listing: data };
    },

    async getDashboardStats() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch user's listings to calculate stats
        const { data: listings, error } = await supabase
            .from('listings')
            .select('id, status, views, favorites_count') // Assuming views/favorites_count exist
            .eq('user_id', user.id);

        if (error) throw error;

        const stats = {
            totalPosts: listings.length,
            activePosts: listings.filter(l => l.status === 'approved' || l.status === 'active').length,
            totalViews: listings.reduce((sum, l) => sum + (l.views || 0), 0),
            responseRate: 100 // Placeholder
        };

        return { success: true, stats, listings };
    }
};

export default listingService;
