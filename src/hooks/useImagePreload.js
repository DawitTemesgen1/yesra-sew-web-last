import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook for lazy loading images with IntersectionObserver
 * Only loads images when they're about to enter the viewport
 * Provides significant performance boost for pages with many images
 */
export const useImagePreload = (imageUrl, options = {}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);
    const imgRef = useRef(null);

    const {
        rootMargin = '50px', // Start loading 50px before entering viewport
        threshold = 0.01
    } = options;

    useEffect(() => {
        if (!imgRef.current || !imageUrl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShouldLoad(true);
                        observer.disconnect();
                    }
                });
            },
            { rootMargin, threshold }
        );

        observer.observe(imgRef.current);

        return () => {
            if (observer) observer.disconnect();
        };
    }, [imageUrl, rootMargin, threshold]);

    useEffect(() => {
        if (!shouldLoad || !imageUrl) return;

        const img = new Image();
        img.src = imageUrl;
        img.onload = () => setIsLoaded(true);
        img.onerror = () => setIsLoaded(false);
    }, [shouldLoad, imageUrl]);

    return { imgRef, isLoaded, shouldLoad };
};

/**
 * Preload multiple images in the background
 * Useful for image carousels
 */
export const preloadImages = (imageUrls) => {
    if (!Array.isArray(imageUrls)) return;

    imageUrls.forEach((url) => {
        if (url && typeof url === 'string') {
            const img = new Image();
            img.src = url;
        }
    });
};

export default useImagePreload;
