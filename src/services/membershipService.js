import { supabase } from './api';

/**
 * Membership Service
 * Handles membership plans, subscriptions, and access control
 */

const membershipService = {
    // ============================================
    // MEMBERSHIP PLANS
    // ============================================

    /**
     * Get all membership plans
     */
    async getPlans(includeInactive = false) {
        try {
            let query = supabase
                .from('membership_plans')
                .select('*')
                .order('display_order');

            if (!includeInactive) {
                query = query.eq('is_active', true);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching plans:', error);
            throw error;
        }
    },

    /**
     * Get single plan
     */
    async getPlan(planId) {
        try {
            const { data, error } = await supabase
                .from('membership_plans')
                .select('*')
                .eq('id', planId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching plan:', error);
            throw error;
        }
    },

    /**
     * Create membership plan
     */
    async createPlan(planData) {
        try {
            const { data, error } = await supabase
                .from('membership_plans')
                .insert(planData)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating plan:', error);
            throw error;
        }
    },

    /**
     * Update membership plan
     */
    async updatePlan(planId, updates) {
        try {
            const { data, error } = await supabase
                .from('membership_plans')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', planId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating plan:', error);
            throw error;
        }
    },

    /**
     * Delete membership plan
     */
    async deletePlan(planId) {
        try {
            const { error } = await supabase
                .from('membership_plans')
                .delete()
                .eq('id', planId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting plan:', error);
            throw error;
        }
    },

    /**
     * Toggle plan active status
     */
    async togglePlanStatus(planId, isActive) {
        try {
            return await this.updatePlan(planId, { is_active: isActive });
        } catch (error) {
            console.error('Error toggling plan status:', error);
            throw error;
        }
    },

    // ============================================
    // USER SUBSCRIPTIONS
    // ============================================

    /**
     * Get user's active subscription
     */
    async getUserSubscription(userId) {
        try {
            const { data, error } = await supabase
                .from('user_subscriptions')
                .select('*, membership_plans(*)')
                .eq('user_id', userId)
                .eq('status', 'active')
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user subscription:', error);
            return null;
        }
    },

    /**
     * Get all user subscriptions (history)
     */
    async getUserSubscriptionHistory(userId) {
        try {
            const { data, error } = await supabase
                .from('user_subscriptions')
                .select('*, membership_plans(*)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching subscription history:', error);
            throw error;
        }
    },

    /**
     * Get all subscriptions (admin)
     */
    async getAllSubscriptions(filters = {}) {
        try {
            let query = supabase
                .from('user_subscriptions')
                .select('*, membership_plans(*), profiles(full_name, email)')
                .order('created_at', { ascending: false });

            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.planId) {
                query = query.eq('plan_id', filters.planId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            throw error;
        }
    },

    /**
     * Subscribe user to plan
     */
    async subscribeToPlan(userId, planId, paymentProvider = null) {
        try {
            const plan = await this.getPlan(planId);

            // Check if user already has active subscription
            const existing = await this.getUserSubscription(userId);
            if (existing) {
                throw new Error('User already has an active subscription');
            }

            // Check if user has ANY subscription for this plan (active, cancelled, expired)
            // ensuring we handle the unique constraint on (user_id, plan_id)
            const { data: existingPlanSub } = await supabase
                .from('user_subscriptions')
                .select('id')
                .eq('user_id', userId)
                .eq('plan_id', planId)
                .maybeSingle();

            let data, error;

            if (existingPlanSub) {
                // Update existing subscription
                ({ data, error } = await supabase
                    .from('user_subscriptions')
                    .update({
                        status: plan.price === 0 ? 'active' : 'pending',
                        listings_limit: plan.max_listings,
                        payment_provider: paymentProvider,
                        start_date: plan.price === 0 ? new Date().toISOString() : null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingPlanSub.id)
                    .select()
                    .single());
            } else {
                // Create new subscription
                ({ data, error } = await supabase
                    .from('user_subscriptions')
                    .insert({
                        user_id: userId,
                        plan_id: planId,
                        status: plan.price === 0 ? 'active' : 'pending',
                        listings_limit: plan.max_listings,
                        payment_provider: paymentProvider,
                        start_date: plan.price === 0 ? new Date().toISOString() : null
                    })
                    .select()
                    .single());
            }

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error subscribing to plan:', error);
            throw error;
        }
    },

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId) {
        try {
            const { data, error } = await supabase
                .from('user_subscriptions')
                .update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    auto_renew: false
                })
                .eq('id', subscriptionId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw error;
        }
    },

    /**
     * Renew subscription
     */
    async renewSubscription(subscriptionId) {
        try {
            const { data: subscription } = await supabase
                .from('user_subscriptions')
                .select('*, membership_plans(*)')
                .eq('id', subscriptionId)
                .single();

            if (!subscription) throw new Error('Subscription not found');

            const plan = subscription.membership_plans;
            let newEndDate = null;

            if (plan.billing_cycle !== 'lifetime') {
                const now = new Date();
                switch (plan.billing_cycle) {
                    case 'daily':
                        newEndDate = new Date(now.setDate(now.getDate() + 1));
                        break;
                    case 'weekly':
                        newEndDate = new Date(now.setDate(now.getDate() + 7));
                        break;
                    case 'monthly':
                        newEndDate = new Date(now.setMonth(now.getMonth() + 1));
                        break;
                    case 'yearly':
                        newEndDate = new Date(now.setFullYear(now.getFullYear() + 1));
                        break;
                }
            }

            const { data, error } = await supabase
                .from('user_subscriptions')
                .update({
                    status: 'active',
                    end_date: newEndDate?.toISOString(),
                    listings_used: 0 // Reset usage
                })
                .eq('id', subscriptionId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error renewing subscription:', error);
            throw error;
        }
    },

    // ============================================
    // ACCESS CONTROL
    // ============================================

    /**
     * Check if user has feature access
     */
    async userHasFeature(userId, featureKey) {
        try {
            const { data, error } = await supabase
                .rpc('user_has_feature', {
                    user_uuid: userId,
                    feature_key: featureKey
                });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error checking feature access:', error);
            return false;
        }
    },

    /**
     * Check if user can post
     */
    async userCanPost(userId) {
        try {
            const { data, error } = await supabase
                .rpc('user_can_post', {
                    user_uuid: userId
                });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error checking post permission:', error);
            return false;
        }
    },

    /**
     * Get user's remaining listings
     */
    async getUserListingsRemaining(userId) {
        try {
            const subscription = await this.getUserSubscription(userId);

            if (!subscription) {
                return { remaining: 0, limit: 0, unlimited: false };
            }

            const plan = subscription.membership_plans;

            if (plan.max_listings === null) {
                return { remaining: Infinity, limit: null, unlimited: true };
            }

            const remaining = plan.max_listings - (subscription.listings_used || 0);

            return {
                remaining: Math.max(0, remaining),
                limit: plan.max_listings,
                unlimited: false,
                used: subscription.listings_used || 0
            };
        } catch (error) {
            console.error('Error getting listings remaining:', error);
            return { remaining: 0, limit: 0, unlimited: false };
        }
    },

    // ============================================
    // PLAN FEATURES
    // ============================================

    /**
     * Get all plan features
     */
    async getPlanFeatures() {
        try {
            const { data, error } = await supabase
                .from('plan_features')
                .select('*')
                .eq('is_active', true)
                .order('category', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching plan features:', error);
            throw error;
        }
    },

    /**
     * Create plan feature
     */
    async createPlanFeature(featureData) {
        try {
            const { data, error } = await supabase
                .from('plan_features')
                .insert(featureData)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating plan feature:', error);
            throw error;
        }
    },

    /**
     * Update plan feature
     */
    async updatePlanFeature(featureId, updates) {
        try {
            const { data, error } = await supabase
                .from('plan_features')
                .update(updates)
                .eq('id', featureId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating plan feature:', error);
            throw error;
        }
    },

    /**
     * Delete plan feature
     */
    async deletePlanFeature(featureId) {
        try {
            const { error } = await supabase
                .from('plan_features')
                .delete()
                .eq('id', featureId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting plan feature:', error);
            throw error;
        }
    },

    // ============================================
    // STATISTICS
    // ============================================

    /**
     * Get subscription statistics
     */
    async getSubscriptionStats() {
        try {
            // Total active subscriptions
            const { count: activeCount } = await supabase
                .from('user_subscriptions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Total revenue (from completed transactions)
            const { data: transactions } = await supabase
                .from('payment_transactions')
                .select('amount')
                .eq('status', 'completed');

            const totalRevenue = transactions?.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) || 0;

            // Subscriptions by plan
            const { data: byPlan } = await supabase
                .from('user_subscriptions')
                .select('plan_id, membership_plans(name)')
                .eq('status', 'active');

            const planCounts = {};
            byPlan?.forEach(sub => {
                const planName = sub.membership_plans?.name || 'Unknown';
                planCounts[planName] = (planCounts[planName] || 0) + 1;
            });

            return {
                activeSubscriptions: activeCount || 0,
                totalRevenue,
                subscriptionsByPlan: planCounts
            };
        } catch (error) {
            console.error('Error fetching subscription stats:', error);
            throw error;
        }
    }
};

export default membershipService;
