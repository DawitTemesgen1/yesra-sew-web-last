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
import useListingAccess from '../hooks/useListingAccess';
import { useLanguage } from '../contexts/LanguageContext';
import { Lock } from '@mui/icons-material';

const translations = {
    en: {
        premiumOnly: "Premium Only",
        premiumContent: "Premium Content",
        subscribe: "Subscribe to view full details and contact info."
    },
    am: {
        premiumOnly: "ፕሪሚየም ብቻ",
        premiumContent: "ፕሪሚየም ይዘት",
        subscribe: "ሙሉ ዝርዝሮችን እና እውቂያዎችን ለማየት ይመዝገቡ"
    },
    om: {
        premiumOnly: "Premium Qofa",
        premiumContent: "Qabiyyee Premium",
        subscribe: "Bal'ina guutuu fi qunnamtii argachuuf maallaqa kaffalaa"
    },
    ti: {
        premiumOnly: "ናይ ፕሪሚየም",
        premiumContent: "ናይ ፕሪሚየም ትሕዝቶ",
        subscribe: "ሙሉእ ዝርዝርን ርክብን ንምርኣይ ተመዝገቡ"
    }
};


/**
 * Helper: robustly resolve the best image for the card
 */
// --- FALLBACK IMAGES (Beautiful Placeholders for Jobs) ---
const JOB_IMAGES = [
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
];

/**
 * Helper: robustly resolve the best image for the card
 */
const getCardImage = (listing) => {
    if (!listing) return null;

    // DEBUG: Log the data inspection to help trace issues
    const debug = false;

    // Strict Image Validator
    const isValidUrl = (val) => {
        if (!val || typeof val !== 'string') return false;
        if (!val.startsWith('http') && !val.startsWith('/')) return false;
        if (val.includes(' ') || val.length > 500) return false;
        return true;
    };

    const isLikelyImage = (val) => {
        if (!isValidUrl(val)) return false;
        return /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(val) ||
            (val.includes('supabase') && val.includes('image'));
    };

    // 1. Check 'images' array (Supabase standard)
    if (Array.isArray(listing.images) && listing.images.length > 0) {
        const first = listing.images[0];
        if (isValidUrl(first)) return first;
        if (typeof first === 'object' && isValidUrl(first?.url)) return first.url;
    }

    // 2. Check 'image' string
    if (listing.image && isValidUrl(listing.image)) return listing.image;

    // 3. Check 'media_urls' (New Schema Support)
    if (Array.isArray(listing.media_urls) && listing.media_urls.length > 0) {
        const validMedia = listing.media_urls.find(m => m.type === 'image' && isValidUrl(m.url));
        if (validMedia) return validMedia.url;
    }

    // 4. Scan Custom Fields
    if (listing.custom_fields && typeof listing.custom_fields === 'object') {
        const cf = listing.custom_fields;
        const keys = Object.keys(cf);
        const imageKeys = keys.filter(k => /image|photo|picture|cover|thumb/i.test(k));

        for (const key of imageKeys) {
            const val = cf[key];
            if (isLikelyImage(val)) return val;
            if (Array.isArray(val) && val.length > 0) {
                const first = val[0];
                if (isLikelyImage(first)) return first;
                if (typeof first === 'object' && isLikelyImage(first?.url)) return first.url;
            }
        }
    }

    // ❌ No user image found -> USE FALLBACK (ONLY for Jobs)

    // Determine category slug to identify jobs
    let categorySlug = 'default';
    if (listing.category) {
        if (typeof listing.category === 'string') categorySlug = listing.category.toLowerCase();
        else if (listing.category.slug) categorySlug = listing.category.slug.toLowerCase();
        else if (listing.category.name) categorySlug = listing.category.name.toLowerCase();
    }

    // Only apply fallback for Jobs
    if (categorySlug.includes('job') || categorySlug.includes('vacan')) {
        // Rotate 5 images deterministically based on ID or Title
        const hash = (listing.id || listing.title || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const index = hash % JOB_IMAGES.length;
        return JOB_IMAGES[index];
    }

    return null;
};

/**
 * Helper: Get Summary Fields from Template
 * Selects the best fields to display on the card based on the template.
 */
const getSummaryFields = (template, listing) => {
    if (!template || !template.steps) return [];

    // Flatten fields from all steps
    const allFields = template.steps.flatMap(s => s.fields || []);

    // Check if template has explicit card configuration
    const hasCardConfig = allFields.some(f => f.display_in_card === true);

    let candidates = [];

    if (hasCardConfig) {
        // STRATEGY A: Use Explicit Card Configuration
        candidates = allFields
            .filter(f => f.display_in_card === true)
            .sort((a, b) => (a.card_priority || 0) - (b.card_priority || 0));
    } else {
        // STRATEGY B: Fallback Heuristic (Automatic Selection)
        candidates = allFields.filter(f => {
            // Must be visible and simple
            if (f.is_visible === false) return false;
            if (['textarea', 'image', 'video', 'file', 'section_header'].includes(f.field_type)) return false;
            // Exclude core fields already shown elsewhere
            if (['title', 'description', 'price', 'images', 'location'].includes(f.field_name)) return false;
            return true;
        });
    }

    // Filter candidates that actually have data in the listing
    const summaryFields = candidates.filter(f => {
        const val = listing.custom_fields?.[f.field_name] || listing[f.field_name];
        return val !== undefined && val !== null && val !== '';
    });

    // Limit to prevent layout breakage (max 6 fields for card)
    return summaryFields.slice(0, 6);
};

/**
 * Helper: Format Price
 */
const formatPrice = (price) => {
    if (!price || Number(price) === 0) return null;
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
    onEdit,
    template,
    isLocked // Optional override
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    // --- Data Preparation ---
    const imageUrl = useMemo(() => getCardImage(listing), [listing]);
    const isPremium = listing?.is_premium;

    // Flatten attributes for easy access
    const attrs = { ...listing, ...listing.custom_fields };

    // Calculate Summary Fields (if template exists)
    const summaryFields = useMemo(() => getSummaryFields(template, listing), [template, listing]);

    // --- Access Control ---
    const { permissions } = useListingAccess('all');
    // Lock logic:
    // 1. If isLocked prop is passed, use it directly (override).
    // 2. Otherwise, lock if listing is Premium AND user lacks 'is_premium' permission.
    const locked = isLocked !== undefined
        ? isLocked
        : (listing?.is_premium === true && (!permissions || !permissions.is_premium));




    // --- Event Handlers ---
    const handleCardClick = () => {
        if (locked) {
            navigate('/pricing');
            return;
        }
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
    // const cardHeight = isList ? 200 : 'auto'; 
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
                    position: 'relative', // Ensure Overlay covers card
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

                    {/* PREMIUM CHIP (Top Left) */}
                    {isPremium && (
                        <Box sx={{
                            position: 'absolute', top: 10, left: 10,
                            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                            color: 'black', px: 1.2, py: 0.4, borderRadius: 1,
                            fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            zIndex: 2,
                            letterSpacing: 0.5
                        }}>
                            {t.premiumOnly}
                        </Box>
                    )}

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

                    {/* Price (Hidden for Jobs and if No Price) */}
                    {!(listing.category && (
                        (typeof listing.category === 'string' && listing.category.toLowerCase().includes('job')) ||
                        (listing.category.slug && listing.category.slug.includes('job'))
                    )) && formatPrice(listing.price) && (
                            <Typography variant="h6" color="primary.main" fontWeight={800} sx={{ mb: 1.5 }}>
                                {formatPrice(listing.price)}
                            </Typography>
                        )}

                    <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

                    {/* Attributes Grid */}
                    <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 'auto' }}>

                        {/* 1. Dynamic Mode (If Template Provided) */}
                        {template ? (
                            summaryFields.length > 0 ? (
                                summaryFields.map((field) => {
                                    const val = listing.custom_fields?.[field.field_name] || listing[field.field_name];
                                    return (
                                        <Stack key={field.id} direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                                            <Verified sx={{ fontSize: 16, color: 'primary.light' }} />
                                            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                                                <span style={{ opacity: 0.7 }}>{field.field_label}:</span> {val}
                                            </Typography>
                                        </Stack>
                                    );
                                })
                            ) : (
                                <Typography variant="caption" color="text.disabled">No details available</Typography>
                            )
                        ) : (
                            /* 2. Legacy Fallback Mode (Hardcoded Mapping) - ONLY if no template passed */
                            <>
                                {renderAttribute(Speed, attrs.mileage, 'km')}
                                {renderAttribute(LocalGasStation, attrs.fuel_type)}
                                {renderAttribute(DirectionsCar, attrs.transmission)}

                                {renderAttribute(Bed, attrs.bedrooms, 'Beds')}
                                {renderAttribute(Bathtub, attrs.bathrooms, 'Baths')}
                                {renderAttribute(SquareFoot, attrs.area || attrs.sqft, 'sqft')}

                                {renderAttribute(Work, attrs.job_type)}
                                {renderAttribute(AccessTime, attrs.deadline ? `Deadline: ${new Date(attrs.deadline).toLocaleDateString()}` : null)}
                            </>
                        )}
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

                {/* --- PREMIUM LOCK OVERLAY --- */}
                {locked && (
                    <Box sx={{
                        position: 'absolute', inset: 0,
                        backdropFilter: 'blur(6px)',
                        bgcolor: 'rgba(255,255,255,0.4)',
                        zIndex: 10,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        p: 2, textAlign: 'center',
                        userSelect: 'none'
                    }}>
                        <Box sx={{
                            bgcolor: 'rgba(0,0,0,0.8)',
                            color: '#FFD700',
                            p: 1.5, borderRadius: '50%', mb: 1.5,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                            <Lock sx={{ fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: 'black', textShadow: '0 2px 4px rgba(255,255,255,0.8)', mb: 0.5 }}>
                            {t.premiumContent}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, mb: 2 }}>
                            {t.subscribe}
                        </Typography>
                        <Chip
                            label="Subscribe Now"
                            color="secondary"
                            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); navigate('/pricing'); }}
                        />
                    </Box>
                )}
            </Card>
        </motion.div >
    );
};

export default DynamicListingCard;