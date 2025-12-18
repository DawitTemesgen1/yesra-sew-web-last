import React, { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * OptimizedImage - Performance-optimized image component with lazy loading
 * Features:
 * - Native lazy loading
 * - Loading skeleton
 * - Error handling
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
    const [imgSrc, setImgSrc] = useState(src);

    // Reset state when src changes
    useEffect(() => {
        setImgSrc(src);
        setLoading(true);
        setError(false);
    }, [src]);

    const handleLoad = () => {
        setLoading(false);
        setError(false);
    };

    const handleError = () => {
        console.error("Image failed to load:", imgSrc);
        setLoading(false);
        setError(true);
    };

    // Don't render anything if no src
    if (!src) {
        return (
            <Box
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
            {loading && !error && (
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    animation="wave"
                    sx={{ position: 'absolute', top: 0, left: 0 }}
                />
            )}
            {!error && (
                <img
                    src={imgSrc}
                    alt={alt}
                    loading="lazy"
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
            )}
        </Box>
    );
};

export default OptimizedImage;
