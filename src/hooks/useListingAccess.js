import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import { useQuery } from 'react-query';

/**
 * Hook to check if user has access to view listings in a specific category
 * @param {string} categorySlug - The category slug (e.g., 'jobs', 'tenders', 'homes', 'cars')
 * @returns {object} - { hasAccess: boolean, loading: boolean, isListingLocked: function, refetch: function }
 */
export const useListingAccess = (categorySlug) => {
    const { user } = useAuth();

    // fetch permissions using React Query
    const { data: permissions, isLoading: loading, refetch } = useQuery(
        ['subscriptionAccess', user?.id],
        () => adminService.checkSubscriptionAccess(user?.id),
        {
            enabled: !!user,
            staleTime: 0, // Always consider stale to force check on mount/focus (critical for credit updates)
            refetchOnWindowFocus: true
        }
    );

    // Derived hasAccess state based on permissions
    const hasCategoryAccess = () => {
        if (!user) return !['jobs', 'tenders'].includes(categorySlug); // Guests blocked for restricted only

        if (!permissions) return false;

        if (!['jobs', 'tenders'].includes(categorySlug)) return true; // Open cats

        const viewLimit = permissions.can_view?.[categorySlug];
        // -1 = unlimited, >0 = has count, true = legacy
        const allow = (viewLimit === -1 || viewLimit === true || (typeof viewLimit === 'number' && viewLimit > 0));
        return allow;
    };

    /**
     * Check if a specific listing should be locked
     * @param {object} listing - The listing object
     * @returns {boolean} - True if locked
     */
    const isListingLocked = (listing) => {
        if (!listing) return false;

        // 1. Determine the effective category
        let itemCategory = categorySlug;
        if (listing.category?.slug) {
            itemCategory = listing.category.slug;
        }

        // 2. Check Session History (Already Viewed?)
        // If viewed in this session, it is ALWAYS unlocked
        const viewedSessionKey = `viewed_${listing.id}_${user?.id}`;
        if (user && sessionStorage.getItem(viewedSessionKey)) {
            return false; // Unlocked
        }

        // 3. Only check restrictions for PREMIUM listings
        // Non-premium listings are always unlocked
        if (listing.is_premium !== true) {
            return false; // Not premium = always unlocked
        }

        // 4. For premium listings, check user access
        const restrictedCategories = ['jobs', 'tenders'];

        // If no user, lock premium listings
        if (!user) return true;

        // If permissions not loaded yet, lock as safeguard
        if (!permissions) return true;

        // Check category-specific restrictions
        if (restrictedCategories.includes(itemCategory)) {
            const viewLimit = permissions.can_view?.[itemCategory];
            const hasCredit = (viewLimit === -1 || viewLimit === true || (typeof viewLimit === 'number' && viewLimit > 0));

            // Block if NO credit
            if (!hasCredit) return true;

            // If has credit (remaining > 0), show Unlocked
            return false;
        }

        // For other categories (Homes/Cars) marked is_premium:
        // Check if user has premium subscription
        if (listing.is_premium && !permissions.is_premium) {
            return true;
        }

        return false;
    };

    return {
        hasAccess: hasCategoryAccess(),
        permissions,
        loading,
        isListingLocked,
        refetch
    };
};

export default useListingAccess;
