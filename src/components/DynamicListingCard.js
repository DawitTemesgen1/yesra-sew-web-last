import React from 'react';
import { Card, Box, Typography, Stack, Chip, Divider, IconButton, useTheme, alpha } from '@mui/material';
import { LocationOn, CalendarToday, Speed, LocalGasStation, Bed, Bathtub, SquareFoot, Favorite, FavoriteBorder, Lock, AutoAwesome } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LiveActivityIndicators from './LiveActivityIndicators';

const translations = {
    en: {
        premium: "Premium",
        premiumOnly: "Premium Only",
        premiumContent: "Premium Content",
        subscribeToView: "Subscribe to view",
        unlockNow: "Unlock Now",
        viewFullDetails: "Subscribe to view full details and contact info.",
        content: "Content"
    },
    am: {
        premium: "ፕሪሚየም",
        premiumOnly: "ፕሪሚየም ብቻ",
        premiumContent: "ፕሪሚየም ይዞታ",
        subscribeToView: "ለማየት ይመዝገቡ",
        unlockNow: "አሁኑኑ ይክፈቱ",
        viewFullDetails: "ሙሉ ዝርዝሮችን ለማየት ይመዝገቡ",
        content: "ይዞታ"
    },
    om: {
        premium: "Olaanaa",
        premiumOnly: "Olaanaa Qofa",
        premiumContent: "Qabiyyee Olaanaa",
        subscribeToView: "Ilaaluuf Galmaa'aa",
        unlockNow: "Amma Banaa",
        viewFullDetails: "Odeeffannoo guutuu arguuf galmaa'aa",
        content: "Qabiyyee"
    },
    ti: {
        premium: "ፕሪሚየም",
        premiumOnly: "ፕሪሚየም ጥራይ",
        premiumContent: "ፕሪሚየም ትሕዝቶ",
        subscribeToView: "ንምርኣይ ተመዝገቡ",
        unlockNow: "ሕጂ ይክፈቱ",
        viewFullDetails: "ሙሉእ ሓበሬታ ንምርኣይ ተመዝገቡ",
        content: "ትሕዝቶ"
    }
};

const DynamicListingCard = ({
    listing,
    templateFields = [],
    onToggleFavorite,
    isFavorite,
    viewMode = 'grid',
    isLocked = false // New prop to control access
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    // Check for premium status in column OR custom_fields (fallback)
    const isPremium = listing.is_premium || listing.custom_fields?.is_premium;

    // If locked, we redirect to upgrade page on click
    const handleCardClick = () => {
        if (isLocked) {
            navigate('/pricing'); // Redirect to general pricing page
        } else {
            navigate(`/listings/${listing.id}`);
        }
    };


    // 1. Filter and Sort Fields for Card
    const cardFields = templateFields.filter(f => f.is_card_visible);
    const sortedFields = [...cardFields].sort((a, b) => (a.card_order || 0) - (b.card_order || 0));

    // 2. Section Grouping
    // 2. Section Grouping
    const headerFields = sortedFields.filter(f => f.card_section === 'image_overlay'); // Bottom Left Overlay
    const topLeftFields = sortedFields.filter(f => f.card_section === 'header_top_left');
    const topRightFields = sortedFields.filter(f => f.card_section === 'header_top_right');
    const bodyFields = sortedFields.filter(f => !f.card_section || f.card_section === 'body');
    const footerFields = sortedFields.filter(f => f.card_section === 'footer'); // New section for footer items

    // Helper to get relative time
    const getDaysAgo = (dateString) => {
        const date = new Date(dateString);
        const diff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
        if (diff === 0) return "Today";
        if (diff === 1) return "Yesterday";
        return `${diff} days ago`;
    };

    // Helper to render field value
    const renderFieldValue = (field) => {
        const value = listing.custom_fields?.[field.field_name] || listing[field.field_name];
        if (!value) return null;

        // Special Formatting
        if (field.field_name === 'price') return `ETB ${Number(value).toLocaleString()}`;
        if (field.field_type === 'date') return new Date(value).toLocaleDateString();
        return String(value);
    };

    // Helper to render field with icon (Smart Icon Detection)
    const renderFieldWithIcon = (field) => {
        const value = renderFieldValue(field);
        if (!value) return null;

        let Icon = null;
        const lowerName = field.field_name.toLowerCase();

        if (lowerName.includes('bed')) Icon = Bed;
        else if (lowerName.includes('bath')) Icon = Bathtub;
        else if (lowerName.includes('area') || lowerName.includes('sqft')) Icon = SquareFoot;
        else if (lowerName.includes('year')) Icon = CalendarToday;
        else if (lowerName.includes('transmission')) Icon = Speed;
        else if (lowerName.includes('fuel')) Icon = LocalGasStation;
        else if (lowerName.includes('location')) Icon = LocationOn;

        if (Icon) {
            return (
                <Stack direction="row" spacing={0.5} alignItems="center" key={field.id} title={field.field_label}>
                    <Icon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                        {value} {field.field_name.includes('area') ? 'sqft' : ''}
                    </Typography>
                </Stack>
            );
        }

        return (
            <Typography key={field.id} variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 600 }}>{field.field_label}:</span> {value}
            </Typography>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
        >
            <Card
                onClick={handleCardClick}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: viewMode === 'list' ? 'row' : 'column',
                    height: viewMode === 'list' ? 'auto' : '100%',
                    position: 'relative', // For Premium Badge
                    border: isPremium ? '2px solid #FFD700' : 'none', // Gold Border for Premium
                    boxShadow: isPremium ? '0 4px 20px rgba(255, 215, 0, 0.2)' : 'none',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isPremium ? '0 8px 30px rgba(255, 215, 0, 0.4)' : 4
                    }
                }}
            >
                {/* Premium Badge */}
                {isPremium && (
                    <Box sx={{
                        position: 'absolute',
                        top: 12,
                        right: viewMode === 'list' ? 12 : 'auto',
                        left: viewMode === 'list' ? 'auto' : 12,
                        zIndex: 10,
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                    }}>
                        {isLocked ? <FavoriteBorder sx={{ fontSize: 12 }} /> : <Favorite sx={{ fontSize: 12 }} />}
                        {isLocked ? t.premiumOnly : t.premium}
                    </Box>
                )}

                {/* --- IMAGE / MEDIA COVER SECTION --- */}
                <Box sx={{
                    position: 'relative',
                    width: viewMode === 'list' ? 300 : '100%',
                    height: viewMode === 'list' ? 200 : 220,
                    flexShrink: 0,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    {/* Image with blur if locked */}
                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        filter: isLocked ? 'blur(8px) brightness(0.7)' : 'none',
                        transition: 'filter 0.3s'
                    }}>
                        {(() => {
                            const coverField = sortedFields.find(f => f.card_section === 'cover');

                            if (coverField) {
                                const value = listing.custom_fields?.[coverField.field_name] || listing[coverField.field_name];

                                // If it's a file/image field (or the system 'images' field)
                                if (coverField.field_type === 'image' || coverField.field_type === 'file' || coverField.field_name === 'images') {
                                    // Value might be array or string
                                    const src = Array.isArray(value) ? value[0] : value;
                                    return (
                                        <Box
                                            component="img"
                                            src={src || 'https://via.placeholder.com/400x300'}
                                            alt={listing.title}
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    );
                                }

                                // If user explicitly mapped a text field as cover (e.g. for Jobs company logo or just text)
                                return (
                                    <Box sx={{ p: 3, textAlign: 'center', width: '100%' }}>
                                        <Typography variant="h4" fontWeight="bold" color="text.secondary">
                                            {value || ''}
                                        </Typography>
                                    </Box>
                                );
                            } else {
                                // Default Fallback: Standard Listing Image
                                const defaultImage = (() => {
                                    if (listing.image_url) return listing.image_url;
                                    if (listing.image) return listing.image; // May be null if using new schema
                                    // Check media_urls
                                    if (Array.isArray(listing.media_urls)) {
                                        const img = listing.media_urls.find(m => m.type === 'image');
                                        if (img) return img.url;
                                    }
                                    // Check custom_fields for legacy structure or mis-assigned data
                                    if (listing.custom_fields?.images && Array.isArray(listing.custom_fields.images) && listing.custom_fields.images.length > 0) {
                                        return listing.custom_fields.images[0];
                                    }
                                    return 'https://via.placeholder.com/400x300';
                                })();

                                return (
                                    <Box
                                        component="img"
                                        src={defaultImage}
                                        alt={listing.title}
                                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                );
                            }
                        })()}
                    </Box>

                    {/* Lock Overlay for Premium Content */}
                    {isLocked && (
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0, 0, 0, 0.4)',
                            zIndex: 5
                        }}>
                            <Lock sx={{ fontSize: 48, color: '#FFD700', mb: 1 }} />
                            <Typography variant="h6" fontWeight="bold" color="white" textAlign="center">
                                {t.premiumContent}
                            </Typography>
                            <Typography variant="caption" color="white" textAlign="center" sx={{ mt: 0.5 }}>
                                {t.subscribeToView}
                            </Typography>
                        </Box>
                    )}

                    {/* --- TOP LEFT OVERLAY --- */}
                    <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: '45%' }}>
                        {topLeftFields.length > 0 ? (
                            topLeftFields.map(field => (
                                <Chip
                                    key={field.id}
                                    label={renderFieldValue(field)}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(theme.palette.background.paper, 0.95),
                                        fontWeight: 600,
                                        fontSize: '0.6875rem'
                                    }}
                                />
                            ))
                        ) : (
                            /* Default: Category */
                            <Chip
                                label={listing.category_name || listing.category}
                                size="small"
                                sx={{
                                    bgcolor: alpha(theme.palette.background.paper, 0.95),
                                    fontWeight: 600,
                                    fontSize: '0.6875rem'
                                }}
                            />
                        )}
                    </Box>

                    {/* --- TOP RIGHT OVERLAY (Hidden if locked to reduce clutter) --- */}
                    {!isLocked && (
                        <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: '45%', justifyContent: 'flex-end' }}>
                            {topRightFields.length > 0 ? (
                                topRightFields.map(field => (
                                    <Chip
                                        key={field.id}
                                        label={renderFieldValue(field)}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha('#000', 0.7),
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.625rem'
                                        }}
                                    />
                                ))
                            ) : (
                                /* Default: Date */
                                <Chip
                                    label={getDaysAgo(listing.created_at)}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha('#000', 0.7),
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.625rem'
                                    }}
                                />
                            )}
                        </Box>
                    )}

                    {/* Dynamic Header Overlay Fields (Overlaid on Image if configured) */}
                    <Box sx={{ position: 'absolute', bottom: 40, left: 12, display: 'flex', gap: 1 }}>
                        {headerFields.map(field => (
                            <Chip
                                key={field.id}
                                label={renderFieldValue(field)}
                                size="small"
                                sx={{ bgcolor: alpha(theme.palette.common.black, 0.6), color: 'white', border: 'none' }}
                            />
                        ))}
                    </Box>

                    {/* Favorite Button */}
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite && onToggleFavorite(listing.id);
                        }}
                        sx={{
                            position: 'absolute',
                            bottom: 12,
                            left: 12,
                            bgcolor: alpha('#fff', 0.9),
                            '&:hover': { bgcolor: 'white' }
                        }}
                    >
                        {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                    </IconButton>
                </Box>

                {/* --- BODY SECTION --- */}
                <Box sx={{
                    p: 2.5,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: viewMode === 'grid' ? { xs: 260, sm: 210 } : 'auto',
                    position: 'relative', // For Blur Overlay
                }}>

                    {/* LOCKED CONTENT OVERLAY */}
                    {/* LOCKED CONTENT OVERLAY */}
                    {isLocked && (
                        <Box sx={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backdropFilter: 'blur(10px)',
                            background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.9))'
                                : 'linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.95))',
                            zIndex: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                            textAlign: 'center',
                            transition: 'all 0.3s'
                        }}>
                            <Box
                                component={motion.div}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                sx={{
                                    mb: 2,
                                    p: 1.5,
                                    borderRadius: '50%',
                                    bgcolor: alpha('#FFD700', 0.2),
                                    color: '#FFD700'
                                }}
                            >
                                <Lock sx={{ fontSize: 32 }} />
                            </Box>

                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'text.primary', opacity: 1, letterSpacing: 0.5 }}>
                                {t.premium} {listing.category || t.content}
                            </Typography>

                            <Typography variant="body2" sx={{ mb: 2.5, opacity: 0.8, maxWidth: '80%' }}>
                                {t.viewFullDetails}
                            </Typography>

                            <Chip
                                label={t.unlockNow}
                                icon={<AutoAwesome sx={{ fontSize: '16px !important', color: 'black !important' }} />}
                                clickable
                                sx={{
                                    fontWeight: 'bold',
                                    bgcolor: '#FFD700',
                                    color: 'black',
                                    px: 1,
                                    height: 36,
                                    fontSize: '0.85rem',
                                    '&:hover': { bgcolor: '#FFC107', transform: 'scale(1.05)' },
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)'
                                }}
                            />
                        </Box>
                    )}

                    {/* Default Title/Location if visible in body */}
                    {bodyFields.length === 0 ? (
                        /* Fallback Layout if no dynamic fields configured yet */
                        <>
                            <Typography variant="h6" fontWeight="bold" noWrap gutterBottom>{listing.title}</Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary" mb={1}>
                                <LocationOn sx={{ fontSize: 16 }} />
                                <Typography variant="body2">{listing.location || 'No Location'}</Typography>
                            </Stack>
                            <Box sx={{ mt: 'auto' }}>
                                <Typography variant="h6" color="primary" fontWeight="bold">ETB {listing.price?.toLocaleString()}</Typography>
                            </Box>
                        </>
                    ) : (
                        <Stack spacing={1} sx={{ height: '100%' }}>
                            {bodyFields.map(field => {
                                // Special Rendering for Title
                                if (field.field_name === 'title') {
                                    return (
                                        <Typography key={field.id} variant="h6" fontWeight="bold" sx={{ lineHeight: 1.3, mb: 0.5 }} noWrap>
                                            {renderFieldValue(field)}
                                        </Typography>
                                    );
                                }
                                // Special Rendering for Price (usually prominent)
                                if (field.field_name === 'price') {
                                    return (
                                        <Typography key={field.id} variant="h6" color="primary.main" fontWeight="bold">
                                            {renderFieldValue(field)}
                                        </Typography>
                                    );
                                }
                                return renderFieldWithIcon(field);
                            })}
                        </Stack>
                    )}

                    {/* Footer Section */}
                    {footerFields.length > 0 && (
                        <>
                            <Divider sx={{ my: 1.5 }} />
                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                {footerFields.map(field => renderFieldWithIcon(field))}
                            </Stack>
                        </>
                    )}

                    {/* Live Activity (Always at bottom right) */}
                    <Box sx={{ alignSelf: 'flex-end', mt: 'auto', pt: 1 }}>
                        <LiveActivityIndicators listing={listing} compact />
                    </Box>
                </Box>
            </Card>
        </motion.div>
    );
};

export default DynamicListingCard;
