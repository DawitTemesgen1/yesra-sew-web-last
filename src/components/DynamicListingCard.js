import React, { useMemo } from 'react';
import {
    Card, CardContent, Box, Typography, Chip, Stack,
    IconButton, Divider, useTheme, alpha, Skeleton
} from '@mui/material';
import {
    LocationOn, AccessTime, Favorite, FavoriteBorder,
    Edit, Visibility, Verified, DirectionsCar,
    Bathtub, Bed, SquareFoot, Work, AttachMoney,
    Tungsten, House, Speed, LocalGasStation
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Helper: robustly resolve the best image for the card
 */
const getCardImage = (listing) => {
    if (!listing) return null;

    // DEBUG: Log the data inspection to help trace issues
    // Use console.groupCollapsed to keep the console clean but accessible
    const debug = true;
    if (debug) console.groupCollapsed(`📷 Card Image Check: ${listing.title?.substring(0, 20)}... (${listing.id})`);

    // Strict Image Validator (Basic syntax check)
    const isValidUrl = (val, source) => {
        if (!val) {
            // validation failure silent
            return false;
        }
        if (typeof val !== 'string') {
            if (debug) console.log(`[${source}] Rejected: Not a string`, val);
            return false;
        }
        if (!val.startsWith('http') && !val.startsWith('/')) {
            if (debug) console.log(`[${source}] Rejected: Not absolute/relative path`, val);
            return false;
        }
        if (val.includes(' ')) {
            if (debug) console.log(`[${source}] Rejected: Contains spaces (likely text)`, val);
            return false;
        }
        if (val.length > 500) {
            if (debug) console.log(`[${source}] Rejected: Too long`, val);
            return false;
        }
        return true;
    };

    // Check if URL looks like an image (prevents picking PDFs/Docs)
    const isLikelyImage = (val, source) => {
        if (!isValidUrl(val, source)) return false;

        const isImg = /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(val) ||
            (val.includes('supabase') && val.includes('image'));

        if (!isImg && debug) console.log(`[${source}] Rejected: Does not look like an image (no ext/supabase)`, val);
        if (isImg && debug) console.log(`[${source}] ✅ VALID Candidate:`, val);
        return isImg;
    };

    // 1. Check 'images' array (Supabase standard)
    if (Array.isArray(listing.images) && listing.images.length > 0) {
        if (debug) console.log('Checking listing.images array:', listing.images);
        const first = listing.images[0];

        if (isValidUrl(first, 'images[0]')) {
            if (debug) { console.log('✅ Selected listing.images[0]'); console.groupEnd(); }
            return first;
        }
        if (typeof first === 'object' && isValidUrl(first?.url, 'images[0].url')) {
            if (debug) { console.log('✅ Selected listing.images[0].url'); console.groupEnd(); }
            return first.url;
        }
    }

    // 2. Check 'image' string
    if (listing.image) {
        if (debug) console.log('Checking listing.image:', listing.image);
        if (isValidUrl(listing.image, 'listing.image')) {
            if (debug) { console.log('✅ Selected listing.image'); console.groupEnd(); }
            return listing.image;
        }
    }

    // 3. Scan Custom Fields (Safely & Smartly)
    if (listing.custom_fields && typeof listing.custom_fields === 'object') {
        const cf = listing.custom_fields;
        if (debug) console.log('Scanning custom_fields:', cf);
        const keys = Object.keys(cf);

        // A. Priority Scan: Check keys that SOUND like images first
        const imageKeys = keys.filter(k => /image|photo|picture|cover|thumb/i.test(k));

        for (const key of imageKeys) {
            const val = cf[key];
            if (isLikelyImage(val, `cf.${key}`)) {
                if (debug) { console.log(`✅ Selected custom_fields.${key}`); console.groupEnd(); }
                return val;
            }

            // Handle Array of strings or objects
            if (Array.isArray(val) && val.length > 0) {
                const first = val[0];
                if (isLikelyImage(first, `cf.${key}[0]`)) {
                    if (debug) { console.log(`✅ Selected custom_fields.${key}[0]`); console.groupEnd(); }
                    return first;
                }
                // Handle {url: ...} object in array
                if (typeof first === 'object' && isLikelyImage(first?.url, `cf.${key}[0].url`)) {
                    if (debug) { console.log(`✅ Selected custom_fields.${key}[0].url`); console.groupEnd(); }
                    return first.url;
                }
            }
        }

        // B. Deep Scan: Check remaining keys for ANY valid image URL
        for (const key of keys) {
            if (imageKeys.includes(key)) continue;

            const val = cf[key];
            if (isLikelyImage(val, `cf.${key} (deep)`)) {
                if (debug) { console.log(`✅ Selected custom_fields.${key} (deep scan)`); console.groupEnd(); }
                return val;
            }

            if (Array.isArray(val) && val.length > 0) {
                const first = val[0];
                if (isLikelyImage(first, `cf.${key}[0] (deep)`)) {
                    if (debug) { console.log(`✅ Selected custom_fields.${key}[0] (deep scan)`); console.groupEnd(); }
                    return first;
                }
                // Handle {url: ...} object in array
                if (typeof first === 'object' && isLikelyImage(first?.url, `cf.${key}[0].url (deep)`)) {
                    if (debug) { console.log(`✅ Selected custom_fields.${key}[0].url (deep scan)`); console.groupEnd(); }
                    return first.url;
                }
            }
        }
    }

    if (debug) { console.log('❌ No valid image found.'); console.groupEnd(); }
    return null;
};

/**
 * Helper: Format Price
 */
const formatPrice = (price) => {
    if (!price) return 'Contact for Price';
    return `ETB ${Number(price).toLocaleString()}`;
};

/**
 * Helper: Get Time Ago
 */
const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

const DynamicListingCard = ({
    listing,
    viewMode = 'grid',
    onToggleFavorite,
    isFavorite = false,
    showActions = false,
    onEdit
}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    // --- Data Preparation ---
    const imageUrl = useMemo(() => getCardImage(listing), [listing]);
    const isPremium = listing?.is_premium;

    // Flatten attributes for easy access
    const attrs = { ...listing, ...listing.custom_fields };

    // --- Event Handlers ---
    const handleCardClick = () => {
        navigate(`/listings/${listing.id}`);
    };

    const handleFavorite = (e) => {
        e.stopPropagation();
        if (onToggleFavorite) onToggleFavorite(listing.id);
    };

    // --- Attributes Rendering Helper ---
    const renderAttribute = (icon, value, suffix = '') => {
        if (!value) return null;
        const Icon = icon;
        return (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                <Icon sx={{ fontSize: 16 }} />
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                    {value} {suffix}
                </Typography>
            </Stack>
        );
    };

    // Responsive Dimensions
    const isList = viewMode === 'list';
    // const cardHeight = isList ? 200 : 'auto'; // (unused variable, suppressing warning)
    const imageWidth = isList ? 280 : '100%';
    const imageHeight = isList ? '100%' : 220;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%' }}
        >
            <Card
                onClick={handleCardClick}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: isList ? 'row' : 'column',
                    cursor: 'pointer',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4],
                        borderColor: 'primary.main'
                    }
                }}
            >
                {/* --- IMAGE SECTION --- */}
                <Box sx={{
                    width: imageWidth,
                    height: imageHeight,
                    position: 'relative',
                    bgcolor: 'grey.100',
                    flexShrink: 0
                }}>
                    {imageUrl ? (
                        <Box
                            component="img"
                            src={imageUrl}
                            alt={listing.title}
                            loading="lazy"
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.5s ease',
                                '&:hover': { transform: 'scale(1.05)' }
                            }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex'; // Show fallback safely
                            }}
                        />
                    ) : null}

                    {/* Fallback / No Image Placeholder */}
                    <Box sx={{
                        display: imageUrl ? 'none' : 'flex',
                        position: 'absolute', inset: 0,
                        alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column',
                        color: 'text.disabled',
                        bgcolor: 'grey.100'
                    }}>
                        <Typography variant="caption" fontWeight="bold">NO IMAGE</Typography>
                    </Box>

                    {/* Premium Overlay */}
                    {isPremium && (
                        <Box sx={{
                            position: 'absolute', top: 12, left: 12,
                            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                            color: 'black', px: 1.5, py: 0.5, borderRadius: 20,
                            fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}>
                            PREMIUM
                        </Box>
                    )}

                    {/* Favorite Button */}
                    <IconButton
                        onClick={handleFavorite}
                        sx={{
                            position: 'absolute', top: 12, right: 12,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            width: 32, height: 32,
                            '&:hover': { bgcolor: 'white' }
                        }}
                    >
                        {isFavorite ? <Favorite color="error" sx={{ fontSize: 18 }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
                    </IconButton>

                    {/* Bottom Gradient for Contrast */}
                    <Box sx={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: 60,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                        pointerEvents: 'none'
                    }} />

                    {/* Location Overlay */}
                    {listing.location && (
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{
                            position: 'absolute', bottom: 10, left: 12,
                            color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                        }}>
                            <LocationOn sx={{ fontSize: 14 }} />
                            <Typography variant="caption" fontWeight={600}>{listing.location}</Typography>
                        </Stack>
                    )}
                </Box>

                {/* --- CONTENT SECTION --- */}
                <CardContent sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    '&:last-child': { pb: 2 }
                }}>
                    {/* Category Chip (Optional, if category exists) */}
                    {listing.category && (
                        <Box mb={1}>
                            <Chip
                                label={listing.category}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.65rem' }}
                            />
                        </Box>
                    )}

                    <Typography variant="h6" fontWeight={700} noWrap title={listing.title} sx={{ mb: 0.5 }}>
                        {listing.title || 'Untitled Listing'}
                    </Typography>

                    <Typography variant="h6" color="primary.main" fontWeight={800} sx={{ mb: 1.5 }}>
                        {formatPrice(listing.price)}
                    </Typography>

                    <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

                    {/* Attributes Grid */}
                    <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 'auto' }}>
                        {/* Car Attributes */}
                        {renderAttribute(Speed, attrs.mileage, 'km')}
                        {renderAttribute(LocalGasStation, attrs.fuel_type)}
                        {renderAttribute(DirectionsCar, attrs.transmission)}

                        {/* Home Attributes */}
                        {renderAttribute(Bed, attrs.bedrooms, 'Beds')}
                        {renderAttribute(Bathtub, attrs.bathrooms, 'Baths')}
                        {renderAttribute(SquareFoot, attrs.area || attrs.sqft, 'sqft')}

                        {/* Job Attributes */}
                        {renderAttribute(Work, attrs.job_type)}
                        {renderAttribute(AccessTime, attrs.deadline ? `Deadline: ${new Date(attrs.deadline).toLocaleDateString()}` : null)}
                    </Stack>

                    {/* Footer / Actions */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTime sx={{ fontSize: 12 }} /> {getTimeAgo(listing.created_at)}
                        </Typography>

                        {showActions && (
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); onEdit && onEdit(listing); }}
                                sx={{ color: 'primary.main' }}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default DynamicListingCard;