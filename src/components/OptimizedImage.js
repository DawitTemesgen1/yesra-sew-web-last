import React, { useState } from 'react';
import { Box, Skeleton } from '@mui/material';

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

    const handleLoad = () => {
        setLoading(false);
    };

    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    // Use Supabase image transformation for optimization if it's a Supabase URL
    // If width/height are "100%", we default to a reasonable max width (e.g., 600) for listings
    const targetWidth = props.optimizationWidth || (typeof width === 'number' ? width : 600);

    const optimizedSrc = src?.includes('supabase')
        ? `${src}?width=${targetWidth}&quality=80&resize=cover`
        : src;

    return (
        <Box
            sx={{
                position: 'relative',
                width: width || '100%',
                height: height || '100%',
                overflow: 'hidden',
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
                src={error ? fallbackSrc : optimizedSrc}
                alt={alt}
                loading="lazy" // Native lazy loading
                onLoad={handleLoad}
                onError={handleError}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit,
                    display: loading ? 'none' : 'block',
                    transition: 'opacity 0.3s ease-in-out',
                    opacity: loading ? 0 : 1
                }}
            />
        </Box>
    );
};

export default OptimizedImage;
