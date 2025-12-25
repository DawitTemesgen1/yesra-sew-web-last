import React, { useMemo } from 'react';
import {
    Card, CardContent, Box, Typography, Chip, Stack,
    IconButton, Divider, useTheme, alpha, Skeleton
} from '@mui/material';
import {
    LocationOn, AccessTime, Favorite, FavoriteBorder,
    Edit, Visibility, Verified, DirectionsCar,
    Bathtub, Bed, SquareFoot, Work, AttachMoney,
    Tungsten, House, Speed, LocalGasStation,
    ArrowForwardIos, ArrowBackIosNew
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
 * Helper: robustly resolve the best image for the card and OPTIMIZE IT
 */
const getCardImages = (listing, width = 600, templateOrFields = null) => {
    if (!listing) return [];

    // Helper to apply Supabase CDN transformations
    const optimizeUrl = (url) => {
        if (!url || !url.includes('supabase')) return url;
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.set('width', width);
            urlObj.searchParams.set('quality', '70');
            urlObj.searchParams.set('format', 'webp');
            return urlObj.toString();
        } catch (e) {
            return url;
        }
    };

    const isValidUrl = (val) => {
        if (!val || typeof val !== 'string') return false;
        if (!val.startsWith('http') && !val.startsWith('/')) return false;
        if (val.includes(' ') || val.length > 500) return false;
        return true;
    };

    const isLikelyImage = (val) => {
        if (!isValidUrl(val)) return false;
        // Check for common image extensions
        if (/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(val)) return true;
        // Accept ANY Supabase storage URL (they're almost always images in this context)
        if (val.includes('supabase') && val.includes('/storage/')) return true;
        // Also accept URLs with image-related keywords
        if (/image|photo|picture|img|thumb|cover/i.test(val)) return true;
        return false;
    };

    let collected = [];

    // --- STRATEGY 0: Template-Based Logic (Highest Priority) ---
    // Handle both full 'template' object (with steps) AND flattened 'templateFields' array
    let allFields = [];
    if (templateOrFields) {
        if (Array.isArray(templateOrFields)) {
            // It's already the flattened fields array
            allFields = templateOrFields;
        } else if (templateOrFields.steps) {
            // It's the full template object
            allFields = templateOrFields.steps.flatMap(s => s.fields || []);
        }
    }

    if (allFields.length > 0) {
        // 1. Explicit Cover Image field
        const coverField = allFields.find(f => f.is_cover_image === true);
        if (coverField) {
            const val = listing.custom_fields?.[coverField.field_name];
            if (isValidUrl(val)) collected.push(val);
            else if (Array.isArray(val) && val.length > 0) {
                const firstUrl = typeof val[0] === 'object' ? val[0]?.url : val[0];
                if (isValidUrl(firstUrl)) collected.push(firstUrl);
            }
        }

        // 2. Any field defined as 'image', 'file', or 'images' type
        allFields.filter(f => ['image', 'file', 'images', 'photo', 'cover'].includes(f.field_type) ||
            /image|photo|cover|logo|picture/i.test(f.field_name)).forEach(f => {
                const val = listing.custom_fields?.[f.field_name];
                if (Array.isArray(val)) {
                    val.forEach(v => {
                        const url = typeof v === 'object' ? (v?.url || v?.src || v?.path) : v;
                        if (isLikelyImage(url)) collected.push(url);
                    });
                } else if (typeof val === 'object' && val !== null) {
                    const url = val?.url || val?.src || val?.path;
                    if (isLikelyImage(url)) collected.push(url);
                } else if (isLikelyImage(val)) {
                    collected.push(val);
                }
            });
    }

    // --- STRATEGY 1: Standard Fields (check common field names) ---

    // 1. Check 'images' array
    if (Array.isArray(listing.images)) {
        listing.images.forEach(img => {
            const url = typeof img === 'object' ? (img?.url || img?.src) : img;
            if (isValidUrl(url)) collected.push(url);
        });
    }

    // 2. Check common single image field names
    ['image', 'cover_image', 'photo', 'thumbnail', 'logo', 'banner'].forEach(fieldName => {
        const val = listing[fieldName] || listing.custom_fields?.[fieldName];
        if (val && isValidUrl(val)) collected.push(val);
        else if (Array.isArray(val) && val.length > 0) {
            const firstUrl = typeof val[0] === 'object' ? val[0]?.url : val[0];
            if (isValidUrl(firstUrl)) collected.push(firstUrl);
        }
    });

    // 3. Check 'media_urls' (Unified Media Format)
    if (Array.isArray(listing.media_urls)) {
        listing.media_urls.forEach(m => {
            const url = typeof m === 'object' ? m?.url : m;
            if (isValidUrl(url)) collected.push(url);
        });
    }

    // --- STRATEGY 2: Smart Scan (Custom Fields) ---
    // Only run if we haven't found much yet, OR if no template was provided
    let cf = listing.custom_fields;

    // Robust parsing: Handle if custom_fields is a JSON string
    if (typeof cf === 'string') {
        try {
            cf = JSON.parse(cf);
        } catch (e) {
            cf = {};
        }
    }

    if (cf && typeof cf === 'object' && !Array.isArray(cf)) {
        const keys = Object.keys(cf);

        // A. Priority Scan: Keys that imply visual content
        keys.forEach(key => {
            if (/image|photo|picture|cover|thumb|logo|banner|attachment/i.test(key)) {
                let val = cf[key];

                // Handle stringified JSON inside values
                if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
                    try { val = JSON.parse(val); } catch (e) { }
                }

                if (Array.isArray(val)) {
                    val.forEach(v => {
                        const url = typeof v === 'object' ? v?.url : v;
                        if (isLikelyImage(url)) collected.push(url);
                    });
                } else if (isLikelyImage(val)) {
                    collected.push(val);
                } else if (typeof val === 'object' && val?.url && isLikelyImage(val.url)) {
                    collected.push(val.url);
                }
            }
        });

        // B. Broad Scan: Check ALL other values for Supabase/Image URLs
        keys.forEach(key => {
            // Skip text-heavy fields
            if (/description|desc|text|location|email|name|phone/i.test(key)) return;

            let val = cf[key];
            if (typeof val === 'string' && isLikelyImage(val) && !collected.includes(val)) {
                collected.push(val);
            }
        });
    }

    // Deduplicate & Optimize
    collected = [...new Set(collected)].map(optimizeUrl);

    // Return collected images (empty array if none found - card will show "NO IMAGE")
    return collected;
};

/**
 * Helper: Get Summary Fields from Template
 * Selects the best fields to display on the card based on the template.
 */
const getSummaryFields = (templateOrFields, listing) => {
    let allFields = [];

    if (templateOrFields) {
        if (Array.isArray(templateOrFields)) {
            allFields = templateOrFields;
        } else if (templateOrFields.steps) {
            allFields = templateOrFields.steps.flatMap(s => s.fields || []);
        }
    }

    if (allFields.length === 0) return [];

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
        candidates = allFields; // We will filter below
    }

    // CRITICAL: Global Cleanup Filter (Applies to BOTH strategies)
    // Ensures strictly no descriptions, URLs, images, or large text blocks appear on the card
    candidates = candidates.filter(f => {
        // 1. Check Types
        if (['textarea', 'image', 'video', 'file', 'section_header', 'url', 'link'].includes(f.field_type)) return false;

        // 2. Check Names (Strict)
        if (['title', 'description', 'price', 'images', 'location', 'desc', 'summary'].includes(f.field_name)) return false;

        // 3. For Strategy B only: Check visibility (if we didn't check it above)
        if (!hasCardConfig && f.is_visible === false) return false;

        return true;
    });

    // Filter candidates that actually have data in the listing
    const summaryFields = candidates.filter(f => {
        const val = listing.custom_fields?.[f.field_name] || listing[f.field_name];
        // Exclude empty values AND values that look like URLs (if they slipped through as text)
        if (val === undefined || val === null || val === '') return false;
        if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('www.') || val.length > 50)) return false;
        return true;
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
    templateFields, // Accept templateFields prop
    isLocked // Optional override
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [isHovered, setIsHovered] = React.useState(false);

    // Use templateFields if available, otherwise template
    const activeTemplate = templateFields || template;

    // --- Data Preparation ---
    // CRITICAL: Always extract images, even if template isn't ready yet
    // This prevents "NO IMAGE" flash when navigating back from cached data
    const images = useMemo(() => {
        const imgs = getCardImages(listing, 600, activeTemplate);

        // If no images found but listing has data, try again without template
        // This handles the case where template loads after listing data
        if (imgs.length === 0 && listing && !activeTemplate) {
            return getCardImages(listing, 600, null);
        }

        return imgs;
    }, [listing, activeTemplate]);

    const imageUrl = images[currentImageIndex];
    const isPremium = listing?.is_premium;

    // Flatten attributes for easy access
    const attrs = { ...listing, ...listing.custom_fields };

    // Calculate Summary Fields (if template exists)
    const summaryFields = useMemo(() => getSummaryFields(activeTemplate, listing), [activeTemplate, listing]);

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

    const handleNextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
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

                    {/* Navigation Arrows for Card */}
                    {images.length > 1 && isHovered && (
                        <>
                            <IconButton
                                size="small"
                                onClick={handlePrevImage}
                                sx={{
                                    position: 'absolute',
                                    left: 4,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    bgcolor: 'rgba(255,255,255,0.8)',
                                    boxShadow: 1,
                                    zIndex: 2,
                                    '&:hover': { bgcolor: 'white' }
                                }}
                            >
                                <ArrowBackIosNew fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={handleNextImage}
                                sx={{
                                    position: 'absolute',
                                    right: 4,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    bgcolor: 'rgba(255,255,255,0.8)',
                                    boxShadow: 1,
                                    zIndex: 2,
                                    '&:hover': { bgcolor: 'white' }
                                }}
                            >
                                <ArrowForwardIos fontSize="small" />
                            </IconButton>
                            {/* Dots Indicator */}
                            <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{
                                    position: 'absolute',
                                    bottom: 8,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    zIndex: 2
                                }}
                            >
                                {images.slice(0, 5).map((_, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            bgcolor: currentImageIndex === idx ? 'primary.main' : 'rgba(255,255,255,0.8)',
                                            boxShadow: 1
                                        }}
                                    />
                                ))}
                            </Stack>
                        </>
                    )}

                    {/* Fallback / No Image Placeholder - Only show when truly no image */}
                    {!imageUrl && (
                        <Box sx={{
                            position: 'absolute', inset: 0,
                            display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column',
                            color: 'text.disabled',
                            bgcolor: 'grey.100'
                        }}>
                            <Typography variant="caption" fontWeight="bold">NO IMAGE</Typography>
                        </Box>
                    )}

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
                            '&:hover': { bgcolor: 'white' },
                            zIndex: 3
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
                                label={typeof listing.category === 'object' ? (listing.category.name || listing.category.slug) : listing.category}
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

                        {/* 1. Dynamic Mode (If Template Provided AND Fields Found) */}
                        {(template && summaryFields.length > 0) ? (
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
                            /* 2. Legacy Fallback Mode (Hardcoded Mapping) - If no template OR no dynamic data found */
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
