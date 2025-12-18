import React, { useState } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';

/**
 * OptimizedImage - Performance-optimized image component with lazy loading
 * Features:
 * - Native lazy loading
 * - Loading skeleton
 * - Error handling with fallback
 * - Responsive sizing
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

    // URL Construction Helper
    const getOptimizedUrl = (url, width) => {
        if (!url || !url.includes('supabase')) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}width=${width}&quality=80&resize=cover`;
    };

    const targetWidth = props.optimizationWidth || (typeof width === 'number' ? width : 600);
    const optimizedSrc = getOptimizedUrl(src, targetWidth);

    // If we've already tried the optimized source and it failed, try the original src
    const [activeSrc, setActiveSrc] = useState(optimizedSrc);

    // Watch for src prop changes and reset
    React.useEffect(() => {
        const newSrc = getOptimizedUrl(src, targetWidth);
        setActiveSrc(newSrc);
        setLoading(true);
        setError(false);
    }, [src, targetWidth]);

    const handleLoad = () => {
        setLoading(false);
    };

    const handleError = () => {
        // If the optimized URL failed, try the original raw URL as a fallback
        if (activeSrc === optimizedSrc && src !== optimizedSrc) {
            console.warn("Optimized image failed, retrying original:", src);
            setActiveSrc(src);
        } else {
            // Both failed
            setLoading(false);
            setError(true);
        }
    };

    return (
        <Box
            sx={{
                position: 'relative',
                width: width || '100%',
                height: height || '100%',
                overflow: 'hidden',
                bgcolor: 'action.hover', // Background while loading
                ...sx
            }}
            {...props}
        >
            {loading && (
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    animation="wave"
                    sx={{ position: 'absolute', top: 0, left: 0 }}
                />
            )}
            <img
                src={error ? (fallbackSrc || '/assets/placeholder-image.png') : activeSrc}
                alt={alt}
                loading="lazy"
                onLoad={handleLoad}
                onError={handleError}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit,
                    display: error ? 'none' : (loading ? 'none' : 'block'), // Hide img while loading to show skeleton
                    transition: 'opacity 0.3s ease-in-out',
                    opacity: loading ? 0 : 1
                }}
            />
            {error && !fallbackSrc && (
                <Box sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'text.disabled', flexDirection: 'column', p: 1
                }}>
                    <Typography variant="caption" align="center" sx={{ fontSize: '0.6rem' }}>
                        Image unavailable
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default OptimizedImage;
