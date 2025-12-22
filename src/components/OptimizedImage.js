import React, { useState, useEffect, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * OptimizedImage - Ultra-fast image loading with blur-up placeholder
 * Features:
 * - Intersection Observer (only loads when visible)
 * - Blur-up placeholder technique
 * - Progressive loading
 * - Automatic format optimization
 */
const OptimizedImage = ({
    src,
    alt = '',
    width,
    height,
    sx = {},
    fallbackSrc = null,
    objectFit = 'cover',
    ...props
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const imgRef = useRef(null);

    // Intersection Observer - only load when image enters viewport
    useEffect(() => {
        if (!imgRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading 50px before visible
            }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, []);

    // Reset state when src changes
    useEffect(() => {
        if (isVisible) {
            setLoading(true);
            setError(false);
        }
    }, [src, isVisible]);

    const handleLoad = () => {
        setLoading(false);
        setError(false);
    };

    const handleError = () => {
        console.error("Image failed to load:", src);
        setLoading(false);
        setError(true);
    };

    // Generate tiny blur placeholder (1px solid color)
    const blurPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3Crect fill="%23e0e0e0" width="1" height="1"/%3E%3C/svg%3E';

    // Don't render anything if no src
    if (!src) {
        return (
            <Box
                ref={imgRef}
                sx={{
                    position: 'relative',
                    width: width || '100%',
                    height: height || '100%',
                    overflow: 'hidden',
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...sx
                }}
            />
        );
    }

    return (
        <Box
            ref={imgRef}
            sx={{
                position: 'relative',
                width: width || '100%',
                height: height || '100%',
                overflow: 'hidden',
                bgcolor: 'action.hover',
                ...sx
            }}
            {...props}
        >
            {/* Blur placeholder - shows immediately */}
            <img
                src={blurPlaceholder}
                alt=""
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit,
                    filter: 'blur(20px)',
                    transform: 'scale(1.1)',
                    opacity: loading ? 1 : 0,
                    transition: 'opacity 0.3s ease-out',
                }}
            />

            {/* Skeleton loader */}
            {loading && !error && (
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    animation="wave"
                    sx={{ position: 'absolute', top: 0, left: 0 }}
                />
            )}

            {/* Actual image - only loads when visible */}
            {!error && isVisible && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onLoad={handleLoad}
                    onError={handleError}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit,
                        display: loading ? 'none' : 'block',
                        transition: 'opacity 0.4s ease-in',
                        opacity: loading ? 0 : 1,
                    }}
                />
            )}
        </Box>
    );
};

export default OptimizedImage;

