import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';

/**
 * Hook to check if user has access to view listings in a specific category
 * @param {string} categorySlug - The category slug (e.g., 'jobs', 'tenders', 'homes', 'cars')
 * @returns {object} - { hasAccess: boolean, loading: boolean }
 */
export const useListingAccess = (categorySlug) => {
    const { user } = useAuth();
    const [hasAccess, setHasAccess] = useState(null); // null = checking, true = allowed, false = denied
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAccess();
    }, [user, categorySlug]);

    const checkAccess = async () => {
        try {
            setLoading(true);

            // Determine if category is restricted by default
            const restrictedCategories = ['jobs', 'tenders'];
            const isRestrictedCategory = restrictedCategories.includes(categorySlug);

            if (!user) {
                // Guest users
                // Block if category is restricted
                setHasAccess(!isRestrictedCategory);
                setPermissions(null);
                setLoading(false);
                return;
            }

            // Logged in user - fetch permissions
            const perms = await adminService.checkSubscriptionAccess(user.id);
            setPermissions(perms);

            if (!isRestrictedCategory) {
                // Non-restricted categories (homes, cars) - always allow generic access
                // But specific listings might still be premium (handled by isLocked logic in components)
                setHasAccess(true);
            } else {
                // Restricted categories - check specific view limit
                const viewLimit = perms?.can_view?.[categorySlug];

                // Check if user has view access
                // -1 = unlimited, >0 = has count, true = legacy access
                if (viewLimit === -1 || viewLimit === true || (typeof viewLimit === 'number' && viewLimit > 0)) {
                    setHasAccess(true);
                } else {
                    setHasAccess(false);
                }
            }
        } catch (error) {
            console.error('Error checking listing access:', error);
            setHasAccess(false);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Check if a specific listing should be locked
     * @param {object} listing - The listing object
     * @returns {boolean} - True if locked
     */
    const isListingLocked = (listing) => {
        if (!listing) return false;

        // 1. Determine the effective category for this listing
        let itemCategory = categorySlug; // Start with hook-scoped category
        // If listing has category data, use it (useful for generic pages like Search/Home)
        if (listing.category?.slug) {
            itemCategory = listing.category.slug;
        } else if (listing.membership_plans?.slug) {
            // Fallback or specific logic if needed
        }

        // 2. Check Category-Level Restrictions (Jobs, Tenders)
        // These are inherently restricted access
        const restrictedCategories = ['jobs', 'tenders'];
        if (restrictedCategories.includes(itemCategory)) {
            if (!user) return true; // Guests blocked

            // Check user permissions for this specific category
            // We rely on the 'permissions' object fetched by the hook
            // If hook was initialized with null/wrong category, 'permissions' should still be valid (it's user-level)
            if (!permissions) return true; // Loading or failed

            const viewLimit = permissions.can_view?.[itemCategory];
            // -1 = unlimited, >0 = has count, true = legacy
            const hasCatAccess = (viewLimit === -1 || viewLimit === true || (typeof viewLimit === 'number' && viewLimit > 0));

            if (!hasCatAccess) return true;
        }

        // 3. Check Individual Premium Flag
        if (listing.is_premium) {
            if (!user) return true;

            // If permissions haven't loaded yet or are missing, default to LOCKED for safety
            if (!permissions) return true;

            // Check if user has ANY paid subscription or valid premium flag
            // 'permissions.is_premium' comes from adminService (e.g. plan != free)
            // Logic: Lock if user is NOT premium AND (Plan is free OR No plan indicated)
            // Even safer: User MUST be marked is_premium to see premium content
            if (!permissions.is_premium) {
                // Double check plan slug just in case logic varies, but generally non-premium = status quo
                return true;
            }

            // If we get here, user is logged in AND has permissions.is_premium = true
            return false;
        }

        return false;
    };

    return { hasAccess, permissions, loading, isListingLocked };
};

export default useListingAccess;
