import { QueryClient } from 'react-query';

/**
 * Ultra-Optimized React Query Configuration
 * Features:
 * - Aggressive caching (5 minutes stale time)
 * - Background refetching
 * - Retry logic with exponential backoff
 * - Prefetching strategies
 * - Optimistic updates
 */

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache data for 5 minutes before considering it stale
            staleTime: 5 * 60 * 1000,

            // Keep unused data in cache for 10 minutes
            cacheTime: 10 * 60 * 1000,

            // Refetch in background when window regains focus
            refetchOnWindowFocus: true,

            // Refetch when network reconnects
            refetchOnReconnect: true,

            // Don't refetch on mount if data is fresh
            refetchOnMount: false,

            // Retry failed requests 3 times with exponential backoff
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Keep previous data while fetching new data (smoother UX)
            keepPreviousData: true,

            // Suspense mode for better loading states
            suspense: false,
        },
        mutations: {
            // Retry mutations once
            retry: 1,
        },
    },
});

/**
 * Prefetch helpers for common queries
 */
export const prefetchHelpers = {
    // Prefetch listings for a category
    prefetchListings: async (category, limit = 20) => {
        const optimizedListingService = (await import('./optimized-listing-service')).default;

        await queryClient.prefetchQuery(
            ['listings', category],
            () => optimizedListingService.getListings({ category, limit }),
            {
                staleTime: 5 * 60 * 1000,
            }
        );
    },

    // Prefetch listing detail
    prefetchListingDetail: async (id) => {
        const optimizedListingService = (await import('./optimized-listing-service')).default;

        await queryClient.prefetchQuery(
            ['listing', id],
            () => optimizedListingService.getListingById(id),
            {
                staleTime: 5 * 60 * 1000,
            }
        );
    },

    // Prefetch all main categories on app load
    prefetchMainCategories: async () => {
        const categories = ['cars', 'homes', 'jobs', 'tenders'];
        const optimizedListingService = (await import('./optimized-listing-service')).default;

        await Promise.all(
            categories.map(cat =>
                queryClient.prefetchQuery(
                    ['listings', cat],
                    () => optimizedListingService.getListings({ category: cat, limit: 12 }),
                    {
                        staleTime: 5 * 60 * 1000,
                    }
                )
            )
        );
    },
};

/**
 * Optimistic update helpers
 */
export const optimisticHelpers = {
    // Optimistically update listing after toggle favorite
    toggleFavoriteOptimistic: (listingId, isFavorited) => {
        queryClient.setQueryData(['listing', listingId], (old) => {
            if (!old) return old;
            return {
                ...old,
                listing: {
                    ...old.listing,
                    is_favorited: !isFavorited,
                },
            };
        });
    },

    // Optimistically add new listing to cache
    addListingOptimistic: (category, newListing) => {
        queryClient.setQueryData(['listings', category], (old) => {
            if (!old) return old;
            return {
                ...old,
                listings: [newListing, ...old.listings],
            };
        });
    },

    // Optimistically remove listing from cache
    removeListingOptimistic: (category, listingId) => {
        queryClient.setQueryData(['listings', category], (old) => {
            if (!old) return old;
            return {
                ...old,
                listings: old.listings.filter(l => l.id !== listingId),
            };
        });
    },
};

export default queryClient;

