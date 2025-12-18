const API_BASE_URL = process.env.REACT_APP_LISTINGS_API || 'http://localhost:5000/api';

class ListingsAPIService {
    /**
     * Get all listings with filters and pagination
     * @param {Object} params - Query parameters
     * @returns {Promise<{success: boolean, listings: Array, pagination: Object}>}
     */
    async getListings(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/listings?${queryString}`);

            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }

            const result = await response.json();
            return {
                success: result.success,
                listings: result.listings || result.data || [],
                pagination: result.pagination
            };
        } catch (error) {
            console.error('Error fetching listings:', error);
            return { success: false, listings: [], pagination: null };
        }
    }

    /**
     * Get single listing by ID
     * @param {number} id - Listing ID
     * @returns {Promise<{success: boolean, listing: Object}>}
     */
    async getListing(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/listings/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch listing');
            }

            const result = await response.json();
            return {
                success: result.success,
                listing: result.data
            };
        } catch (error) {
            console.error('Error fetching listing:', error);
            throw error;
        }
    }

    /**
     * Create new listing with images
     * @param {Object} listingData - Listing data
     * @param {Array} images - Array of image files
     * @returns {Promise<{success: boolean, data: Object}>}
     */
    async createListing(listingData, images = []) {
        try {
            const formData = new FormData();

            // 1. Normalize Category
            // Ensure we strictly send the UUID as 'category' because that's what Admin filters by.
            const categoryValue = listingData.category_id || listingData.category;
            if (!categoryValue || categoryValue === 'undefined') {
                console.warn('Listing missing category ID, might be invisible in Admin');
            }

            // 2. Normalize Status
            // Map 'approved' -> 'active' here on client side to match DB
            let statusValue = listingData.status || 'pending';
            if (statusValue === 'approved') statusValue = 'active';

            // 3. Construct Payload Object
            const payload = {
                ...listingData,
                category: categoryValue, // Force category to be the ID
                status: statusValue
            };

            // 4. Append to FormData (excluding images and undefineds)
            Object.keys(payload).forEach(key => {
                const value = payload[key];

                // Skip images array handled separately
                if (key === 'images') return;

                // Handle Custom Fields (JSON)
                if (key === 'custom_fields') {
                    formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
                    return;
                }

                // Skip undefined/null to avoid "undefined" string
                if (value === undefined || value === null || value === 'undefined') return;

                formData.append(key, value);
            });

            // 5. Add Images
            images.forEach((image) => {
                formData.append('images', image);
            });

            const response = await fetch(`${API_BASE_URL}/listings`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create listing');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating listing:', error);
            throw error;
        }
    }

    /**
     * Update existing listing
     * @param {number} id - Listing ID
     * @param {Object} listingData - Updated listing data
     * @param {Array} newImages - Array of new image files
     * @param {Array} removeImages - Array of image IDs to remove
     * @returns {Promise<{success: boolean}>}
     */
    async updateListing(id, listingData, newImages = [], removeImages = []) {
        try {
            const formData = new FormData();

            // Add listing fields
            Object.keys(listingData).forEach(key => {
                if (key === 'custom_fields') {
                    formData.append(key, JSON.stringify(listingData[key]));
                } else if (listingData[key] !== undefined) {
                    formData.append(key, listingData[key]);
                }
            });

            // Add images to remove
            if (removeImages.length > 0) {
                formData.append('remove_images', JSON.stringify(removeImages));
            }

            // Add new images
            newImages.forEach((image) => {
                formData.append('images', image);
            });

            const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update listing');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating listing:', error);
            throw error;
        }
    }

    /**
     * Get dashboard stats (total, active, pending, etc.)
     * @returns {Promise<{success: boolean, stats: Object}>}
     */
    async getStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/stats`);

            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            return { success: false, stats: { total: 0, active: 0, pending: 0, rejected: 0 } };
        }
    }

    /**
     * Delete listing
     * @param {number} id - Listing ID
     * @returns {Promise<{success: boolean}>}
     */
    async deleteListing(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete listing');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting listing:', error);
            throw error;
        }
    }

    /**
     * Get template fields for a category (from Supabase via backend)
     * @param {number} categoryId - Category ID
     * @returns {Promise<{success: boolean, data: Array}>}
     */
    async getTemplateFields(categoryId) {
        try {
            const response = await fetch(`${API_BASE_URL}/templates/${categoryId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch template');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching template:', error);
            return { success: false, data: [] };
        }
    }
}

export default new ListingsAPIService();
