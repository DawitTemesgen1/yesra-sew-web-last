import { supabase } from '../lib/supabaseClient';
// Utility to safely extract error message
const getErrorMessage = (error) => {
    if (!error) return 'Unknown error occurred';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error_description) return error.error_description;
    return JSON.stringify(error);
};

/**
 * Admin Service with Performance Optimizations
 * - Implements caching for frequently accessed data
 * - Batch operations where possible
 * - Optimized queries with selective field fetching
 */

// Simple in-memory cache
const cache = {
    data: new Map(),
    timestamps: new Map(),
    TTL: 5 * 60 * 1000, // 5 minutes default TTL

    set(key, value, ttl = this.TTL) {
        this.data.set(key, value);
        this.timestamps.set(key, Date.now() + ttl);
    },

    get(key) {
        const timestamp = this.timestamps.get(key);
        if (!timestamp || Date.now() > timestamp) {
            this.data.delete(key);
            this.timestamps.delete(key);
            return null;
        }
        return this.data.get(key);
    },

    clear(pattern) {
        if (pattern) {
            for (const key of this.data.keys()) {
                if (key.includes(pattern)) {
                    this.data.delete(key);
                    this.timestamps.delete(key);
                }
            }
        } else {
            this.data.clear();
            this.timestamps.clear();
        }
    }
};

const adminService = {
    // Cache helper
    cache,

    // --- Dashboard Stats (Optimized) ---
    // --- Dashboard Stats (Optimized) ---
    async getDashboardStats(options = {}) {
        const { forceRefresh = false } = options;
        const cacheKey = 'dashboard_stats';
        const cached = cache.get(cacheKey);
        if (cached && !forceRefresh) return cached;

        const emptyStats = {
            stats: { totalListings: 0, pendingReview: 0, approvedListings: 0, rejectedListings: 0, totalUsers: 0, activeUsers: 0, revenue: 0 },
            listings: [],
            users: [],
            tenders: [],
            financial: { transactions: [] },
            analytics: {},
            settings: {}
        };

        const fetchStats = async () => {
            try {
                // Helper for safe count fetching
                const getCount = async (query) => {
                    const { count, error } = await query;
                    if (error) console.error('Count query error:', error);
                    return count || 0;
                };

                // helper for safe data fetching
                const getData = async (query) => {
                    const { data, error } = await query;
                    if (error) console.error('Data query error:', error);
                    return data || [];
                };

                // Batch 1: Key Counts (Parallel)
                const [totalListings, pendingReview, approvedListings, rejectedListings, totalUsers] = await Promise.all([
                    getCount(supabase.from('listings').select('*', { count: 'exact', head: true })),
                    getCount(supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending')),
                    getCount(supabase.from('listings').select('*', { count: 'exact', head: true }).in('status', ['active', 'approved'])),
                    getCount(supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'rejected')),
                    getCount(supabase.from('profiles').select('*', { count: 'exact', head: true }))
                ]);

                // Batch 2: Lists (Parallel)
                const [recentListings, recentUsers] = await Promise.all([
                    getData(supabase.from('listings').select('id, title, status, created_at, category_id').order('created_at', { ascending: false }).limit(10)),
                    getData(supabase.from('profiles').select('id, full_name, email, created_at, account_type').order('created_at', { ascending: false }).limit(10))
                ]);

                // Batch 3: Financials & Settings (Sequential to reduce load)
                const { data: transactions } = await supabase
                    .from('payment_transactions')
                    .select('amount, status, created_at')
                    .eq('status', 'completed')
                    .order('created_at', { ascending: false })
                    .limit(20);

                const totalRevenue = transactions?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0;

                // Safe settings fetch
                let settings = {};
                try {
                    settings = await this.getSystemSettings();
                } catch (e) { console.warn("Settings fetch failed", e); } // Don't crash on settings

                return {
                    stats: {
                        totalListings,
                        pendingReview,
                        approvedListings,
                        rejectedListings,
                        totalUsers,
                        activeUsers: totalUsers, // approximate
                        revenue: totalRevenue,
                    },
                    listings: recentListings,
                    users: recentUsers,
                    tenders: [],
                    financial: {
                        totalRevenue,
                        monthlyRevenue: 0, // Simplified for now
                        pendingPayouts: 0,
                        completedPayouts: 0,
                        transactions: transactions || [],
                    },
                    analytics: {
                        pageViews: 0, uniqueVisitors: 0, conversionRate: 0, topCategories: [], userGrowth: [],
                    },
                    settings,
                };
            } catch (error) {
                console.error('Error in stats fetcher:', error);
                throw error;
            }
        };

        try {
            // RACE CONDITION: Timestamp 5s vs Fetcher
            const result = await Promise.race([
                fetchStats(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Dashboard stats timeout')), 8000))
            ]);

            cache.set(cacheKey, result, 2 * 60 * 1000); // 2 minutes cache
            return result;
        } catch (error) {
            console.error('getDashboardStats failed or timed out:', error);
            return emptyStats;
        }
    },


    // --- Listings Management ---
    async getListings(filters = {}) {
        try {
            // OPTIMIZED: Select only needed columns for list view to drastically reduce payload size
            let query = supabase
                .from('listings')
                .select('id, title, status, price, category_id, created_at, user_id, views, is_premium, images, location')
                .order('created_at', { ascending: false });

            if (filters.status && filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }
            if (filters.category) {
                // Check if it's a UUID
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.category);

                if (isUuid) {
                    query = query.eq('category_id', filters.category);
                } else {
                    // It's a slug or name. Lookup ID.
                    const { data: catData } = await supabase
                        .from('categories')
                        .select('id')
                        .or(`slug.eq.${filters.category},name.ilike.${filters.category},slug.ilike.${filters.category}`) // Try exact slug, then fuzzy name/slug
                        .maybeSingle(); // Use maybeSingle to avoid error if not found

                    if (catData && catData.id) {
                        query = query.eq('category_id', catData.id);
                    } else {
                        // Category not found
                        console.warn(`Admin getListings: Category '${filters.category}' not found, returning empty.`);
                        return [];
                    }
                }
            }
            if (filters.search) {
                query = query.ilike('title', `%${filters.search}%`);
            }

            // Perfromance: Default limit to 50
            const limit = filters.limit || 50;
            query = query.limit(limit);

            // Timeout protection
            const { data, error } = await Promise.race([
                query,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 8000))
            ]);

            if (error) throw error;

            // Clear cache when fetching fresh data
            cache.clear('dashboard_stats');
            return data || [];
        } catch (error) {
            console.error('Error fetching listings:', error);
            // Return empty array instead of throwing to prevent UI crash
            return [];
        }
    },

    async updateListingStatus(id, status, isPremium = null) {
        try {
            const updates = { status };
            // We'll try to update the column directly first
            if (isPremium !== null) {
                updates.is_premium = isPremium;
            }

            // Remove .single() to avoid 406 errors on empty results/schema mismatches
            const { data, error } = await supabase
                .from('listings')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) {
                // FALLBACK: If 'is_premium' column doesn't exist, Supabase might throw an error.
                // We'll try to store it in 'custom_fields' instead.
                if (isPremium !== null) {
                    console.warn("Standard update failed, trying custom_fields fallback for premium status...");

                    // First fetch current custom_fields
                    const { data: current } = await supabase.from('listings').select('custom_fields').eq('id', id).single();
                    const existingFields = current?.custom_fields || {};

                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('listings')
                        .update({
                            status,
                            custom_fields: { ...existingFields, is_premium: isPremium }
                        })
                        .eq('id', id)
                        .select();

                    if (fallbackError) throw fallbackError;

                    cache.clear('dashboard_stats');
                    cache.clear('listings');
                    return fallbackData?.[0];
                }
                throw error;
            }

            cache.clear('dashboard_stats');
            cache.clear('listings');
            return data?.[0];
        } catch (error) {
            console.error('Error updating listing status:', error);
            throw error;
        }
    },

    async toggleListingPremium(id, isPremium) {
        try {
            // Update only is_premium flag
            const { data, error } = await supabase
                .from('listings')
                .update({ is_premium: isPremium })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            cache.clear('listings');
            return data;
        } catch (error) {
            console.error('Error toggling premium status:', error);
            throw error;
        }
    },

    async deleteListing(id) {
        try {
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', id);

            if (error) throw error;
            cache.clear('dashboard_stats');
            cache.clear('listings');
            return true;
        } catch (error) {
            console.error('Error deleting listing:', error);
            throw error;
        }
    },

    // --- User Management ---
    async getUsers(options = {}) {
        const {
            search,
            role,
            status, // 'active', 'suspended', or 'all'
            account_type,
            sortBy = 'created_at',
            sortOrder = 'desc',
            page = 1,
            limit = 50
        } = options;

        try {
            // Select profiles with count
            let query = supabase
                .from('profiles')
                .select('*, id, full_name, email, phone, role, is_active, verified, created_at, location, account_type', { count: 'exact' });

            if (search) {
                // ILIKE for insensitive match
                query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
            }
            if (account_type) query = query.eq('account_type', account_type);

            // Handle Role Filter (String or Array)
            if (role) {
                if (Array.isArray(role)) {
                    query = query.in('role', role);
                } else if (role !== 'all') {
                    query = query.eq('role', role);
                }
            }

            // Handle Status Filter
            if (status && status !== 'all') {
                if (status === 'active') query = query.eq('is_active', true);
                if (status === 'suspended') query = query.eq('is_active', false);
            }

            // Sorting
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });

            // Pagination
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;
            if (error) throw error;

            // Return object with data and count
            return { users: data || [], count: count || 0 };
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    async updateUserStatus(id, updates) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new Error('User not found or you do not have permission to update this user');
            }

            cache.clear('users');
            return data[0];
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    },

    async updateUserRole(userId, newRole) {
        try {
            const { data, error } = await supabase.functions.invoke('admin-actions', {
                body: { action: 'update_role', userId, newRole }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            cache.clear('users');
            return data;
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    },

    async getListingById(id) {
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching listing by ID:', error);
            throw error;
        }
    },

    async getUserById(id) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            throw error;
        }
    },

    async deleteUser(id) {
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            cache.clear('users');
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    // --- Report Management ---
    async getReports(filters = {}) {
        try {
            let query = supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters.status && filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }
            if (filters.severity) {
                query = query.eq('severity', filters.severity);
            }
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching reports:', error);
            return [];
        }
    },

    async updateReportStatus(id, status, adminNotes = null) {
        try {
            const updates = { status };
            if (adminNotes) updates.admin_notes = adminNotes;
            if (status === 'resolved') {
                updates.resolved_at = new Date().toISOString();
                updates.resolved_by = (await supabase.auth.getUser()).data.user?.id;
            }

            const { data, error } = await supabase
                .from('reports')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating report status:', error);
            throw error;
        }
    },

    // --- Categories Management ---
    async getCategories() {
        const cacheKey = 'categories';
        const cached = cache.get(cacheKey);
        if (cached) return cached;

        try {
            // Check if table exists (lazy way: just try select)
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) {
                console.warn('Categories fetch error (might be empty/missing):', error.message);
                return [];
            }
            cache.set(cacheKey, data, 10 * 60 * 1000); // 10 minutes cache
            return data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            // safe return
            return [];
        }
    },

    async createCategory(categoryData) {
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert(categoryData)
                .select();

            if (error) throw error;
            cache.clear('categories');
            return data?.[0];
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },

    async updateCategory(id, categoryData) {
        try {
            const { data, error } = await supabase
                .from('categories')
                .update(categoryData)
                .eq('id', id)
                .select();

            if (error) throw error;
            cache.clear('categories');
            return data?.[0];
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    },

    async deleteCategory(id) {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
            cache.clear('categories');
            return true;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    },

    // --- System Settings Management ---
    async getSystemSettings() {
        const cacheKey = 'system_settings';
        const cached = cache.get(cacheKey);
        if (cached) return cached;

        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*');

            if (error) throw error;

            const settings = {};
            if (data) {
                data.forEach(item => {
                    settings[item.key] = item.value;
                });
            }

            cache.set(cacheKey, settings, 5 * 60 * 1000); // 5 minutes cache
            return settings;
        } catch (error) {
            console.error('Error fetching system settings:', error);
            return {};
        }
    },

    async updateSystemSetting(key, value) {
        try {
            const { data, error } = await supabase
                .from('system_settings')
                .upsert({ key, value }, { onConflict: 'key' })
                .select();
            if (error) throw error;
            cache.clear('system_settings');
            return data?.[0];
        } catch (error) {
            console.error('Error updating system setting:', error);
            throw error;
        }
    },

    // --- Payment Providers Management ---
    async getPaymentProviders() {
        const cacheKey = 'payment_providers';
        const cached = cache.get(cacheKey);
        if (cached) return cached;

        try {
            const { data, error } = await supabase
                .from('payment_providers')
                .select('*')
                .order('name'); // Order by name instead of display_order

            if (error) {
                console.error('Error fetching payment providers:', error);
                throw error;
            }

            cache.set(cacheKey, data || [], 10 * 60 * 1000);
            return data || [];
        } catch (error) {
            console.error('Error fetching payment providers:', error);
            // Return empty array instead of throwing to prevent UI crash
            return [];
        }
    },

    async initializePaymentProviders() {
        try {


            const providers = [
                {
                    name: 'chapa',
                    display_name: 'Chapa',
                    is_enabled: false,
                    test_mode: true,
                    config: {
                        description: 'Ethiopian payment gateway supporting mobile money, bank transfers, and cards',
                        supported_currencies: ['ETB'],
                        supported_methods: ['telebirr', 'cbebirr', 'mpesa', 'bank_transfer', 'card'],
                        docs_url: 'https://developer.chapa.co/docs',
                        dashboard_url: 'https://dashboard.chapa.co'
                    }
                },
                {
                    name: 'arif_pay',
                    display_name: 'ArifPay',
                    is_enabled: false,
                    test_mode: true,
                    config: {
                        description: 'Ethiopian digital payment platform for businesses',
                        supported_currencies: ['ETB'],
                        supported_methods: ['telebirr', 'cbebirr', 'ebirr', 'bank_transfer'],
                        docs_url: 'https://developer.arifpay.net',
                        dashboard_url: 'https://dashboard.arifpay.net'
                    }
                }
            ];



            // Use upsert to handle both insert and update cases
            const { data, error } = await supabase
                .from('payment_providers')
                .upsert(providers, {
                    onConflict: 'name',
                    ignoreDuplicates: false
                })
                .select();

            if (error) {
                console.error('Error upserting providers:', error);
                throw new Error(`Database error: ${error.message}. ${error.hint || ''}`);
            }


            cache.clear('payment_providers');
            return data;
        } catch (error) {
            console.error('Error in initializePaymentProviders:', error);
            throw error;
        }
    },

    async updatePaymentProvider(id, updates) {
        try {
            const { data, error } = await supabase
                .from('payment_providers')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            cache.clear('payment_providers');
            return data;
        } catch (error) {
            console.error('Error updating payment provider:', error);
            throw error;
        }
    },

    // --- Membership Plans Management ---
    async getMembershipPlans() {
        const cacheKey = 'membership_plans';
        const cached = cache.get(cacheKey);
        if (cached) return cached;

        try {
            const { data, error } = await supabase
                .from('membership_plans')
                .select('*')
                .order('display_order');

            if (error) throw error;
            cache.set(cacheKey, data, 10 * 60 * 1000);
            return data || [];
        } catch (error) {
            console.error('Error fetching membership plans:', error);
            return [];
        }
    },

    async getPlanFeatures() {
        // Return a static list of available features for the UI using the updated schema terms
        return [
            { id: 'can_post_featured', label: 'Featured Listings' },
            { id: 'priority_support', label: 'Priority Support' },
            { id: 'verified_badge', label: 'Verified Badge' },
            { id: 'analytics_access', label: 'Analytics' }
        ];
    },

    async createMembershipPlan(planData) {
        try {
            const { data, error } = await supabase
                .from('membership_plans')
                .insert(planData)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) throw new Error('Failed to create plan');

            cache.clear('membership_plans');
            return data[0];

        } catch (error) {
            console.error('Error creating membership plan:', error);
            throw error;
        }
    },

    async updateMembershipPlan(id, updates) {
        try {
            const { data, error } = await supabase
                .from('membership_plans')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) {
                // Check if plan exists at all (stale UI?)
                const { data: check } = await supabase.from('membership_plans').select('id').eq('id', id).single();
                if (!check) {
                    throw new Error('Plan no longer exists. Please refresh the page.');
                }
                throw new Error('Update failed due to permissions or database error.');
            }

            cache.clear('membership_plans');
            return data[0];
        } catch (error) {
            console.error('Error updating membership plan:', error);
            throw error;
        }
    },

    async deleteMembershipPlan(id) {
        try {
            const { error } = await supabase
                .from('membership_plans')
                .delete()
                .eq('id', id);

            if (error) throw error;
            cache.clear('membership_plans');
            return true;
        } catch (error) {
            console.error('Error deleting membership plan:', error);
            throw error;
        }
    },

    // --- User Subscriptions Management ---
    async getAllSubscriptions(filters = {}) {
        try {
            // Simplified query to avoid potential relationship errors with 'profiles' table if it doesn't exist or FK is missing.
            // We'll fetch basic subscription info + plan details.
            let query = supabase
                .from('user_subscriptions')
                .select('*, membership_plans(*)') // Removing profiles join for now to fix error
                .order('created_at', { ascending: false });

            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            return [];
        }
    },

    // --- Access Control Helper ---
    async checkSubscriptionAccess(userId) {
        if (!userId) return null;

        const cacheKey = `sub_access_${userId}`;
        const cached = cache.get(cacheKey);
        if (cached) return cached;

        try {
            // Fetch active subscriptions
            const { data: subs, error } = await supabase
                .from('user_subscriptions')
                .select('*, membership_plans(*)')
                .eq('user_id', userId)
                .eq('status', 'active');
            // Removed .gt('end_date') here to handle indefinite (null) dates in JS

            if (error) throw error;

            // Filter out expired subscriptions (active if end_date is null or > now)
            const validSubs = subs?.filter(sub => {
                if (!sub.end_date) return true; // Lifetime/Indefinite
                return new Date(sub.end_date) > new Date();
            }) || [];

            // Default permissions for non-subscribers (Free tier)
            // Jobs/Tenders require subscription, Homes/Cars are open
            const permissions = {
                can_post: { jobs: 0, tenders: 0, homes: 0, cars: 0 },
                can_view: { jobs: 0, tenders: 0, homes: -1, cars: -1 }, // -1 = unlimited for free categories
                is_premium: false,
                active_plans: []
            };

            if (validSubs && validSubs.length > 0) {
                permissions.is_premium = true;
                validSubs.forEach(sub => {
                    const plan = sub.membership_plans;
                    if (!plan) return;

                    permissions.active_plans.push(plan.name);

                    // Aggregate View Access (Sum logic similar to posting)
                    const viewAccess = plan.permissions?.view_access || {};
                    Object.entries(viewAccess).forEach(([cat, val]) => {
                        // Handle legacy boolean true -> -1 (unlimited)
                        let limit = val;
                        if (val === true) limit = -1;
                        if (val === false) limit = 0;

                        // Default current to 0 (unless we define free tier defaults above)
                        const current = permissions.can_view[cat] === true ? -1 : (typeof permissions.can_view[cat] === 'number' ? permissions.can_view[cat] : 0);

                        if (current === -1 || limit === -1) {
                            permissions.can_view[cat] = -1;
                        } else {
                            permissions.can_view[cat] = current + limit;
                        }
                    });

                    // Aggregate Posting Limits (Sum logic: add limits from multiple plans)
                    // If any plan has -1 (unlimited), result is -1
                    const limits = plan.category_limits || {};
                    Object.entries(limits).forEach(([cat, limit]) => {
                        const current = permissions.can_post[cat] ?? 0;
                        if (current === -1 || limit === -1) {
                            permissions.can_post[cat] = -1;
                        } else {
                            permissions.can_post[cat] = current + limit;
                        }
                    });
                });
            }

            cache.set(cacheKey, permissions, 30 * 1000); // 30 seconds cache for instant multi-card deduplication
            return permissions;
        } catch (error) {
            console.error('Error checking subscription:', error);
            return null;
        }
    },

    async updateSubscriptionStatus(id, status) {
        try {
            const { data, error } = await supabase
                .from('user_subscriptions')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating subscription:', error);
            throw error;
        }
    },

    // --- Payment Transactions Management ---
    async getAllTransactions(filters = {}) {
        try {
            let query = supabase
                .from('payment_transactions')
                .select('*, profiles:user_id(full_name, email)')
                .order('created_at', { ascending: false });

            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            if (filters.provider) {
                query = query.eq('provider', filters.provider);
            }
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }
    },

    // --- Pages Management ---
    async getPages() {
        try {
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .order('menu_order');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching pages:', error);
            return [];
        }
    },

    async createPage(pageData) {
        try {
            const { data, error } = await supabase
                .from('pages')
                .insert(pageData)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating page:', error);
            throw error;
        }
    },

    async updatePage(id, updates) {
        try {
            const { data, error } = await supabase
                .from('pages')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating page:', error);
            throw error;
        }
    },

    async deletePage(id) {
        try {
            const { error } = await supabase
                .from('pages')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting page:', error);
            throw error;
        }
    },

    // --- Communication Management ---
    async getCommunications(filters = {}) {
        try {
            let query = supabase
                .from('communications')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters.type) {
                query = query.eq('type', filters.type);
            }
            if (filters.status && filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching communications:', error);
            return [];
        }
    },

    async createCommunication(data) {
        try {
            const { data: newComm, error } = await supabase
                .from('communications')
                .insert(data)
                .select()
                .single();

            if (error) throw error;
            return newComm;
        } catch (error) {
            console.error('Error creating communication:', error);
            throw error;
        }
    },

    async deleteCommunication(id) {
        try {
            const { error } = await supabase
                .from('communications')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting communication:', error);
            throw error;
        }
    },

    // --- Communication Templates ---
    async getCommunicationTemplates() {
        const cacheKey = 'communication_templates';
        const cached = cache.get(cacheKey);
        if (cached) return cached;

        try {
            const { data, error } = await supabase
                .from('communication_templates')
                .select('*')
                .order('name');

            if (error) throw error;
            cache.set(cacheKey, data, 10 * 60 * 1000);
            return data || [];
        } catch (error) {
            console.error('Error fetching communication templates:', error);
            return [];
        }
    },

    async createCommunicationTemplate(data) {
        try {
            const { data: newTemplate, error } = await supabase
                .from('communication_templates')
                .insert(data)
                .select()
                .single();

            if (error) throw error;
            cache.clear('communication_templates');
            return newTemplate;
        } catch (error) {
            console.error('Error creating communication template:', error);
            throw error;
        }
    },

    async updateCommunicationTemplate(id, updates) {
        try {
            const { data, error } = await supabase
                .from('communication_templates')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            cache.clear('communication_templates');
            return data;
        } catch (error) {
            console.error('Error updating communication template:', error);
            throw error;
        }
    },

    async deleteCommunicationTemplate(id) {
        try {
            const { error } = await supabase
                .from('communication_templates')
                .delete()
                .eq('id', id);

            if (error) throw error;
            cache.clear('communication_templates');
            return true;
        } catch (error) {
            console.error('Error deleting communication template:', error);
            throw error;
        }
    },

    // --- Mobile App Management ---
    async getMobileAppVersions() {
        try {
            const { data, error } = await supabase
                .from('mobile_app_versions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching mobile app versions:', error);
            return [];
        }
    },

    async createMobileAppVersion(data) {
        try {
            const { data: newVersion, error } = await supabase
                .from('mobile_app_versions')
                .insert(data)
                .select()
                .single();

            if (error) throw error;
            return newVersion;
        } catch (error) {
            console.error('Error creating mobile app version:', error);
            throw error;
        }
    },

    async updateMobileAppVersion(id, updates) {
        try {
            const { data, error } = await supabase
                .from('mobile_app_versions')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating mobile app version:', error);
            throw error;
        }
    },

    async deleteMobileAppVersion(id) {
        try {
            const { error } = await supabase
                .from('mobile_app_versions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting mobile app version:', error);
            throw error;
        }
    },

    // --- Post Templates Management ---
    async getTemplate(categoryId) {
        if (!categoryId) return null;

        const cacheKey = `template_${categoryId}`;
        const cached = cache.get(cacheKey);
        if (cached) return cached;

        try {

            const { data: template, error: templateError } = await supabase
                .from('post_templates')
                .select('*')
                .eq('category_id', categoryId)
                .maybeSingle(); // Use maybeSingle() instead of single() to avoid 406 error gracefully

            if (templateError) throw templateError;
            if (!template) return null; // No template exists yet

            const { data: steps, error: stepsError } = await supabase
                .from('template_steps')
                .select(`
                  *,
                  fields:template_fields(*)
                `)
                .eq('template_id', template.id)
                .order('step_number', { ascending: true });

            if (stepsError) throw stepsError;

            // Sort fields properly in JS
            steps?.forEach(step => {
                if (step.fields) {
                    step.fields.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
                }
            });

            // Use the filters directly from the template column (fallback if null)
            const filters = template.filters || { enabled: true, items: [] };

            const result = { template, steps, filters };
            cache.set(cacheKey, result, 5 * 60 * 1000); // 5 minute cache
            return result;
        } catch (error) {
            console.error('Error fetching template:', error);
            // Return null instead of throwing so UI knows to show "Create Template" state
            return null;
        }
    },

    async createTemplate(templateData) {
        try {
            const { data, error } = await supabase
                .from('post_templates')
                .insert(templateData)
                .select()
                .single();

            if (error) throw error;
            cache.clear('template_');
            return data;
        } catch (error) {
            console.error('Error creating template:', error);
            throw error;
        }
    },

    async updateTemplate(id, updates) {
        try {
            const { data, error } = await supabase
                .from('post_templates')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) throw error;
            cache.clear('template_');
            return data ? data[0] : null;
        } catch (error) {
            console.error('Error updating template:', error);
            throw error;
        }
    },

    // New Method to Manage Filters via Column
    async updateTemplateFilters(templateId, filters) {
        try {
            const { error } = await supabase
                .from('post_templates')
                .update({ filters: filters })
                .eq('id', templateId);

            if (error) throw error;

            cache.clear('template_');
            return true;
        } catch (error) {
            console.error('Error updating template filters:', error);
            throw error;
        }
    },

    // --- Subscription Management ---
    async getPlanSubscribers(planId) {
        try {
            // 1. Fetch subscriptions
            const { data: subs, error: subsError } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('plan_id', planId)
                .eq('status', 'active');

            if (subsError) throw subsError;
            if (!subs || subs.length === 0) return [];

            // 2. Fetch associated profiles
            const userIds = subs.map(s => s.user_id);
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone')
                .in('id', userIds);

            if (profilesError) throw profilesError;

            // 3. Map profiles to subscriptions
            const profileMap = {};
            profiles.forEach(p => profileMap[p.id] = p);

            return subs.map(s => ({
                ...s,
                profile: profileMap[s.user_id] || { full_name: 'Unknown', email: 'Unknown' }
            }));
        } catch (error) {
            console.error('Error fetching plan subscribers:', error);
            throw error;
        }
    },

    async grantSubscription(userId, planId, durationValue = 1, durationUnit = 'months') {
        try {
            const startDate = new Date();
            let endDate = new Date();

            if (durationUnit === 'days') endDate.setDate(startDate.getDate() + durationValue);
            if (durationUnit === 'weeks') endDate.setDate(startDate.getDate() + (durationValue * 7));
            if (durationUnit === 'months') endDate.setMonth(startDate.getMonth() + durationValue);
            if (durationUnit === 'years') endDate.setFullYear(startDate.getFullYear() + durationValue);

            // Manual UPSERT to avoid constraint dependency issues
            // 1. Check for existing subscription
            const { data: existing } = await supabase
                .from('user_subscriptions')
                .select('id')
                .eq('user_id', userId)
                .eq('plan_id', planId)
                .single();

            let result;
            if (existing) {
                // 2. Update existing
                result = await supabase
                    .from('user_subscriptions')
                    .update({
                        status: 'active',
                        start_date: startDate.toISOString(),
                        end_date: endDate.toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();
            } else {
                // 3. Insert new
                result = await supabase
                    .from('user_subscriptions')
                    .insert({
                        user_id: userId,
                        plan_id: planId,
                        status: 'active',
                        start_date: startDate.toISOString(),
                        end_date: endDate.toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();
            }

            const { data, error } = result;

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error granting subscription:', error);
            throw error;
        }
    },

    // --- Template Steps ---
    async createStep(stepData) {
        try {
            const { data, error } = await supabase
                .from('template_steps')
                .insert(stepData)
                .select();

            if (error) throw error;
            cache.clear('template_');
            return data ? data[0] : null;
        } catch (error) {
            console.error('Error creating step:', error);
            throw error;
        }
    },

    async updateStep(id, updates) {
        try {
            if (!id || id === 'NaN' || id === 'undefined') {
                throw new Error(`Invalid step ID: ${id}`);
            }

            const { data, error } = await supabase
                .from('template_steps')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) throw error;

            cache.clear('template_');
            return data ? data[0] : null;
        } catch (error) {
            console.error('Error updating step:', error);
            throw error;
        }
    },

    async deleteStep(id) {
        try {
            const { error } = await supabase
                .from('template_steps')
                .delete()
                .eq('id', id);

            if (error) throw error;
            cache.clear('template_');
            return true;
        } catch (error) {
            console.error('Error deleting step:', error);
            throw error;
        }
    },

    // --- Template Fields ---
    async createField(fieldData) {
        try {
            // Remove 'id' if it exists to let DB generate it
            const { id, ...cleanData } = fieldData;

            const { data, error } = await supabase
                .from('template_fields')
                .insert(cleanData)
                .select();

            if (error) throw error;
            cache.clear('template_');
            return data ? data[0] : null;
        } catch (error) {
            console.error('Error creating field:', error);
            throw error;
        }
    },

    async updateField(id, updates) {
        try {
            if (!id || String(id) === 'NaN' || String(id) === 'undefined') {
                throw new Error(`Invalid field ID: ${id}`);
            }

            // Sanitization: Remove id from updates if present to prevent conflict
            const { id: _, ...cleanUpdates } = updates;

            const { data, error } = await supabase
                .from('template_fields')
                .update(cleanUpdates)
                .eq('id', id)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) {
                // Return null gracefully if no rows updated
                return null;
            }

            cache.clear('template_');
            return data[0];
        } catch (error) {
            console.error('Error updating field:', error);
            throw error;
        }
    },

    async deleteField(id) {
        try {
            const { error } = await supabase
                .from('template_fields')
                .delete()
                .eq('id', id);

            if (error) throw error;
            cache.clear('template_');
            return true;
        } catch (error) {
            console.error('Error deleting field:', error);
            throw error;
        }
    },

    // --- Analytics ---
    async getAnalytics(dateRange = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - dateRange);

            const { data, error } = await supabase
                .from('analytics_events')
                .select('event_type, properties, created_at')
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Process analytics data
            const pageViews = data?.filter(e => e.event_type === 'page_view').length || 0;
            const uniqueVisitors = new Set(data?.map(e => e.properties?.session_id).filter(Boolean)).size;

            return {
                pageViews,
                uniqueVisitors,
                events: data || [],
            };
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return { pageViews: 0, uniqueVisitors: 0, events: [] };
        }
    },

    // --- Notifications ---
    async getNotifications(userId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    async createNotification(notificationData) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .insert(notificationData)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    },

    // --- Support Tickets ---
    async getSupportTickets(filters = {}) {
        try {
            let query = supabase
                .from('support_tickets')
                .select('*, profiles:user_id(full_name, email)')
                .order('created_at', { ascending: false });

            if (filters.status && filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }
            if (filters.priority) {
                query = query.eq('priority', filters.priority);
            }
            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching support tickets:', error);
            return [];
        }
    },

    async updateSupportTicket(id, updates) {
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating support ticket:', error);
            throw error;
        }
    },

    // --- Membership Plans (for user-facing pages) ---
    async getMembershipPlans() {
        try {
            const { data, error } = await supabase
                .from('membership_plans')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching membership plans:', error);
            return [];
        }
    },

    async getUserSubscription(userId) {
        try {
            const { data, error } = await supabase
                .from('user_subscriptions')
                .select('*, membership_plans(*)')
                .eq('user_id', userId)
                .eq('status', 'active')
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user subscription:', error);
            return null;
        }
    },

    // --- User Notifications (for user-facing pages) ---
    async getUserNotifications(userId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching user notifications:', error);
            return [];
        }
    },

    async markNotificationAsRead(notificationId) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    async markAllNotificationsAsRead(userId) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    // --- Reports (for user-facing report submission) ---
    async createReport(reportData) {
        try {
            const { data, error } = await supabase
                .from('reports')
                .insert([reportData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating report:', error);
            throw error;
        }
    },

    async getUserReports(userId) {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('reporter_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching user reports:', error);
            return [];
        }
    },

    // --- Support Tickets (for user-facing support) ---
    async createSupportTicket(ticketData) {
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .insert([ticketData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating support ticket:', error);
            throw error;
        }
    },

    async getUserSupportTickets(userId) {
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching user support tickets:', error);
            return [];
        }
    },

    async addTicketMessage(messageData) {
        try {
            const { data, error } = await supabase
                .from('support_ticket_messages')
                .insert([messageData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding ticket message:', error);
            throw error;
        }
    },

    async getTicketMessages(ticketId) {
        try {
            const { data, error } = await supabase
                .from('support_ticket_messages')
                .select('*, profiles:user_id(full_name, email)')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching ticket messages:', error);
            return [];
        }
    },

    // --- Pages (for user-facing dynamic pages) ---
    async getPublishedPages() {
        try {
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('is_published', true)
                .order('menu_order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching published pages:', error);
            return [];
        }
    },

    async getPageBySlug(slug) {
        try {
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('slug', slug)
                .eq('is_published', true)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching page by slug:', error);
            return null;
        }
    },

    async getHomepageSections() {
        try {
            const { data, error } = await supabase
                .from('homepage_sections')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching homepage sections:', error);
            return [];
        }
    },

    // --- Security Logs (for admin screens) ---
    async getSecurityLogs(limit = 100) {
        try {
            const { data, error } = await supabase
                .from('security_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching security logs:', error);
            return [];
        }
    },

    // --- Backup History (for admin screens) ---
    async getBackupHistory(limit = 50) {
        try {
            const { data, error } = await supabase
                .from('backup_history')
                .select('*')
                .order('started_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching backup history:', error);
            return [];
        }
    },

    // Get category ID by slug
    async getCategoryIdBySlug(slug) {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            return data?.id;
        } catch (error) {
            console.error('Error fetching category ID:', error);
            return null;
        }
    },
};

export default adminService;

