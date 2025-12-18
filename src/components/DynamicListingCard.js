import React from 'react';
import { Card, Box, Typography, Stack, Chip, Divider, IconButton, useTheme, alpha, Tooltip } from '@mui/material';
import {
    LocationOn, CalendarToday, Speed, LocalGasStation, Bed, Bathtub,
    SquareFoot, Favorite, FavoriteBorder, Lock, AutoAwesome, Edit,
    Delete, Share, Visibility
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LiveActivityIndicators from './LiveActivityIndicators';
import UltraOptimizedImage from './UltraOptimizedImage';

const translations = {
    en: {
        premium: "Premium",
        premiumOnly: "Premium Only",
        premiumContent: "Premium Content",
        subscribeToView: "Subscribe to view",
        unlockNow: "Unlock Now",
        viewFullDetails: "Subscribe to view full details and contact info.",
        content: "Content",
        edit: "Edit",
        delete: "Delete",
        share: "Share",
        views: "views"
    },
    am: {
        premium: "ፕሪሚየም",
        premiumOnly: "ፕሪሚየም ብቻ",
        premiumContent: "ፕሪሚየም ይዞታ",
        subscribeToView: "ለማየት ይመዝገቡ",
        unlockNow: "አሁኑኑ ይክፈቱ",
        viewFullDetails: "ሙሉ ዝርዝሮችን ለማየት ይመዝገቡ",
        content: "ይዞታ",
        edit: "አርትዕ",
        delete: "ሰርዝ",
        share: "አጋራ",
        views: "እይታዎች"
    },
    om: {
        premium: "Olaanaa",
        premiumOnly: "Olaanaa Qofa",
        premiumContent: "Qabiyyee Olaanaa",
        subscribeToView: "Ilaaluuf Galmaa'aa",
        unlockNow: "Amma Banaa",
        viewFullDetails: "Odeeffannoo guutuu arguuf galmaa'aa",
        content: "Qabiyyee",
        edit: "Gulaali",
        delete: "Haqui",
        share: "Qoodi",
        views: "daawwannaa"
    },
    ti: {
        premium: "ፕሪሚየም",
        premiumOnly: "ፕሪሚየም ጥራይ",
        premiumContent: "ፕሪሚየም ትሕዝቶ",
        subscribeToView: "ንምርኣይ ተመዝገቡ",
        unlockNow: "ሕጂ ይክፈቱ",
        viewFullDetails: "ሙሉእ ሓበሬታ ንምርኣይ ተመዝገቡ",
        content: "ትሕዝቶ",
        edit: "ኣርትዕ",
        delete: "ደምስስ",
        share: "ኣካፍል",
        views: "ትርኢታት"
    }
};

const DynamicListingCard = ({
    listing,
    templateFields = [],
    onToggleFavorite,
    isFavorite,
    viewMode = 'grid',
    isLocked = false,
    onEdit,
    onDelete,
    onShare,
    showActions = false
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    const isPremium = listing.is_premium || listing.custom_fields?.is_premium;

    const handleCardClick = () => {
        if (isLocked) {
            navigate('/pricing');
        } else {
            navigate(`/listings/${listing.id}`);
        }
    };

    // --- 1. PREPARE DATA ---
    // Merge core fields into the fields lookup so they can be controlled by the template too
    // --- 1. PREPARE DATA ---
    // Merge core fields into the fields lookup so they can be controlled by the template too
    const coreData = {
        title: listing.title,
        price: listing.price,
        description: listing.description,
        location: listing.location,
        category: listing.category,
        created_at: listing.created_at,
        views: listing.views,
        images: listing.images || listing.custom_fields?.images || [], // Add core images array explicitly with fallback
        ...listing.custom_fields
    };

    // Debug: Log image data for cars
    if (listing.category === 'car' || listing.category === 'cars') {
        console.log('Car listing image debug:', {
            id: listing.id,
            title: listing.title,
            images: listing.images,
            custom_fields_images: listing.custom_fields?.images,
            coreData_images: coreData.images,
            all_custom_fields: listing.custom_fields
        });
    }

    // If no template fields provided, create a default set to ensure the card isn't empty
    const activeFields = templateFields.length > 0 ? templateFields.filter(f => f.is_card_visible) : [
        { field_name: 'category', card_section: 'header_top_left', card_order: 1 },
        { field_name: 'title', card_section: 'body', card_order: 1 },
        { field_name: 'price', card_section: 'footer', card_order: 1 },
        { field_name: 'location', card_section: 'body', card_order: 2 }
    ];

    const sortedFields = [...activeFields].sort((a, b) => (a.card_order || 0) - (b.card_order || 0));

    // Group by Sections
    const sections = {
        cover: sortedFields.filter(f => f.card_section === 'cover'),
        overlay_top_left: sortedFields.filter(f => f.card_section === 'header_top_left'),
        overlay_top_right: sortedFields.filter(f => f.card_section === 'header_top_right'),
        overlay_bottom: sortedFields.filter(f => f.card_section === 'image_overlay'),
        body: sortedFields.filter(f => !f.card_section || f.card_section === 'body'),
        footer: sortedFields.filter(f => f.card_section === 'footer'),
    };

    // --- 2. RENDERERS ---
    const getDaysAgo = (dateString) => {
        if (!dateString) return "Recently";
        const date = new Date(dateString);
        const diff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
        if (diff === 0) return "Today";
        if (diff === 1) return "Yesterday";
        return `${diff} days ago`;
    };

    const renderGenericField = (field, context = 'body') => {
        let value = coreData[field.field_name];
        if (value === undefined || value === null || value === '') return null;

        // Special Styling for Core Fields
        if (field.field_name === 'title') {
            return (
                <Typography key={field.id} variant="h6" fontWeight={800} noWrap sx={{
                    fontSize: '1.05rem', lineHeight: 1.3, mb: 0.5,
                    color: 'text.primary',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', whiteSpace: 'normal'
                }}>
                    {value}
                </Typography>
            );
        }

        if (field.field_name === 'price' || field.field_type === 'price') {
            return (
                <Typography key={field.id} variant="h6" color="primary.main" fontWeight={900} sx={{ fontSize: '1.15rem' }}>
                    {typeof value === 'number' ? `ETB ${value.toLocaleString()}` : value}
                </Typography>
            );
        }

        // Icon Logic - Smart icon matching
        let Icon = null;
        const lowerName = field.field_name.toLowerCase();
        const lowerLabel = (field.field_label || '').toLowerCase();

        // Match by field name or label
        if (lowerName.includes('bed') || lowerLabel.includes('bed')) Icon = Bed;
        else if (lowerName.includes('bath') || lowerLabel.includes('bath')) Icon = Bathtub;
        else if (lowerName.includes('area') || lowerName.includes('sqft') || lowerLabel.includes('area')) Icon = SquareFoot;
        else if (lowerName.includes('year') || lowerLabel.includes('year')) Icon = CalendarToday;
        else if (lowerName.includes('transmission') || lowerLabel.includes('transmission')) Icon = Speed;
        else if (lowerName.includes('fuel') || lowerLabel.includes('fuel')) Icon = LocalGasStation;
        else if (lowerName.includes('location') || field.field_type === 'location') Icon = LocationOn;

        // ========================================
        // COMPREHENSIVE FIELD TYPE RENDERING
        // ========================================

        switch (field.field_type) {
            // --- TEXT TYPES ---
            case 'text':
                // Short text - single line
                return (
                    <Typography key={field.id} variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>{field.field_label}:</span> {value}
                    </Typography>
                );

            case 'textarea':
                // Long text - multi-line with truncation
                return (
                    <Typography key={field.id} variant="body2" color="text.secondary" sx={{
                        fontSize: '0.85rem',
                        display: '-webkit-box',
                        WebkitLineClamp: context === 'overlay' ? 2 : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {value}
                    </Typography>
                );

            // --- NUMBER TYPES ---
            case 'number':
                return Icon ? (
                    <Stack direction="row" spacing={0.5} alignItems="center" key={field.id} title={field.field_label}>
                        <Icon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.85rem' }}>
                            {Number(value).toLocaleString()} {field.field_name.includes('area') ? 'sqft' : ''}
                        </Typography>
                    </Stack>
                ) : (
                    <Typography key={field.id} variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>{field.field_label}:</span> {Number(value).toLocaleString()}
                    </Typography>
                );

            // --- SELECT/DROPDOWN ---
            case 'select':
                return context === 'overlay' ? (
                    <Chip key={field.id} label={value} size="small"
                        icon={Icon ? <Icon sx={{ fontSize: '12px !important', color: 'inherit' }} /> : null}
                        sx={{
                            bgcolor: alpha('#000', 0.5), color: 'white',
                            backdropFilter: 'blur(4px)', height: 22, fontSize: '0.7rem',
                            border: `1px solid ${alpha('#fff', 0.2)}`
                        }}
                    />
                ) : (
                    <Chip key={field.id} label={value} size="small"
                        icon={Icon ? <Icon sx={{ fontSize: 14 }} /> : null}
                        sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                        }}
                    />
                );

            // --- CHECKBOX/BOOLEAN ---
            case 'checkbox':
            case 'boolean':
                const boolValue = value === true || value === 'true' || value === 'yes' || value === '1';
                return (
                    <Chip key={field.id}
                        label={field.field_label}
                        size="small"
                        color={boolValue ? "success" : "default"}
                        sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                    />
                );

            // --- RADIO ---
            case 'radio':
                return (
                    <Chip key={field.id} label={value} size="small"
                        sx={{
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: 'secondary.main',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                        }}
                    />
                );

            // --- DATE ---
            case 'date':
                const dateValue = new Date(value).toLocaleDateString();
                return Icon ? (
                    <Stack direction="row" spacing={0.5} alignItems="center" key={field.id} title={field.field_label}>
                        <Icon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.85rem' }}>
                            {dateValue}
                        </Typography>
                    </Stack>
                ) : (
                    <Typography key={field.id} variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>{field.field_label}:</span> {dateValue}
                    </Typography>
                );

            // --- IMAGE ---
            case 'image':
                const imgSrc = Array.isArray(value) ? value[0] : value;
                return (
                    <Box key={field.id} sx={{ mt: 1, borderRadius: 1, overflow: 'hidden', width: '100%', height: 150 }}>
                        <UltraOptimizedImage
                            src={imgSrc}
                            alt={field.field_label}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                            aspectRatio={16 / 9}
                        />
                    </Box>
                );

            // --- IMAGES (Array) ---
            case 'images':
                if (Array.isArray(value) && value.length > 0) {
                    return (
                        <Box key={field.id} sx={{ mt: 1, borderRadius: 1, overflow: 'hidden', width: '100%', height: 150 }}>
                            <UltraOptimizedImage
                                src={value[0]}
                                alt={field.field_label}
                                width="100%"
                                height="100%"
                                objectFit="cover"
                                aspectRatio={16 / 9}
                            />
                        </Box>
                    );
                }
                break;

            // --- VIDEO ---
            case 'video':
                const videoUrl = Array.isArray(value) ? value[0] : value;
                return (
                    <Box key={field.id} onClick={(e) => { e.stopPropagation(); window.open(videoUrl, '_blank'); }} sx={{
                        display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, px: 1,
                        bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 1, cursor: 'pointer',
                        maxWidth: 'fit-content', mt: 0.5,
                        border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
                    }}>
                        <Box sx={{
                            width: 0, height: 0,
                            borderLeft: '8px solid',
                            borderTop: '5px solid transparent',
                            borderBottom: '5px solid transparent',
                            borderColor: theme.palette.error.main,
                            ml: 0.5
                        }} />
                        <Typography variant="caption" color="error.main" fontWeight={600}>
                            {field.field_label || 'Play Video'}
                        </Typography>
                    </Box>
                );

            // --- FILE ---
            case 'file':
                const fileUrl = Array.isArray(value) ? value[0] : value;
                return (
                    <Box key={field.id} onClick={(e) => { e.stopPropagation(); window.open(fileUrl, '_blank'); }} sx={{
                        display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, px: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, cursor: 'pointer',
                        maxWidth: 'fit-content', mt: 0.5
                    }}>
                        <AutoAwesome sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" color="primary.main" fontWeight={600}>
                            {field.field_label || 'View File'}
                        </Typography>
                    </Box>
                );

            // --- LOCATION ---
            case 'location':
                return (
                    <Stack direction="row" spacing={0.5} alignItems="center" key={field.id} title={field.field_label}>
                        <LocationOn sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.85rem' }}>
                            {value}
                        </Typography>
                    </Stack>
                );

            // --- PRICE ---
            case 'price':
                return (
                    <Typography key={field.id} variant="h6" color="primary.main" fontWeight={900} sx={{ fontSize: '1.15rem' }}>
                        {typeof value === 'number' ? `ETB ${value.toLocaleString()}` : value}
                    </Typography>
                );

            // --- DEFAULT/UNKNOWN ---
            default:
                // Smart detection for untyped fields

                // Check if it's an image URL
                if (typeof value === 'string' && (value.includes('supabase') || value.match(/\.(jpeg|jpg|gif|png|webp)$/i))) {
                    return (
                        <Box key={field.id} sx={{ mt: 1, borderRadius: 1, overflow: 'hidden', width: '100%', height: 150 }}>
                            <UltraOptimizedImage
                                src={value}
                                alt={field.field_label}
                                width="100%"
                                height="100%"
                                objectFit="cover"
                                aspectRatio={16 / 9}
                            />
                        </Box>
                    );
                }

                // Check if it's a video URL
                if (typeof value === 'string' && value.match(/\.(mp4|webm|ogg|mov)$/i)) {
                    return (
                        <Box key={field.id} onClick={(e) => { e.stopPropagation(); window.open(value, '_blank'); }} sx={{
                            display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, px: 1,
                            bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 1, cursor: 'pointer',
                            maxWidth: 'fit-content', mt: 0.5
                        }}>
                            <Box sx={{
                                width: 0, height: 0,
                                borderLeft: '8px solid',
                                borderTop: '5px solid transparent',
                                borderBottom: '5px solid transparent',
                                borderColor: theme.palette.error.main,
                                ml: 0.5
                            }} />
                            <Typography variant="caption" color="error.main" fontWeight={600}>
                                {field.field_label || 'Play Video'}
                            </Typography>
                        </Box>
                    );
                }

                // Check if it's a file URL
                if (typeof value === 'string' && value.match(/\.(pdf|doc|docx|xls|xlsx|zip|rar)$/i)) {
                    return (
                        <Box key={field.id} onClick={(e) => { e.stopPropagation(); window.open(value, '_blank'); }} sx={{
                            display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, px: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, cursor: 'pointer',
                            maxWidth: 'fit-content', mt: 0.5
                        }}>
                            <AutoAwesome sx={{ fontSize: 14, color: 'primary.main' }} />
                            <Typography variant="caption" color="primary.main" fontWeight={600}>
                                {field.field_label || 'View File'}
                            </Typography>
                        </Box>
                    );
                }

                // Context-Based Styling for generic text
                if (context === 'overlay') {
                    return (
                        <Chip key={field.id} label={value} size="small"
                            icon={Icon ? <Icon sx={{ fontSize: '12px !important', color: 'inherit' }} /> : null}
                            sx={{
                                bgcolor: alpha('#000', 0.5), color: 'white',
                                backdropFilter: 'blur(4px)', height: 22, fontSize: '0.7rem',
                                border: `1px solid ${alpha('#fff', 0.2)}`
                            }}
                        />
                    );
                }

                // Default Body Styling with Icon
                if (Icon) {
                    return (
                        <Stack direction="row" spacing={0.5} alignItems="center" key={field.id} title={field.field_label}>
                            <Icon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.85rem' }}>
                                {value} {field.field_name.includes('area') ? 'sqft' : ''}
                            </Typography>
                        </Stack>
                    );
                }

                // Generic Key-Value
                return (
                    <Typography key={field.id} variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>{field.field_label}:</span> {value}
                    </Typography>
                );
        }
    };

    // Responsive sizing logic
    const imgWidth = viewMode === 'list' ? { xs: '100%', sm: 260, md: 300 } : '100%';
    const imgHeight = viewMode === 'list' ? { xs: 200, sm: '100%' } : 240;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            style={{ height: '100%' }}
        >
            <Card
                sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: viewMode === 'list' ? { xs: 'column', sm: 'row' } : 'column',
                    height: '100%',
                    position: 'relative',
                    border: '1px solid',
                    borderColor: isPremium ? '#FFD700' : 'divider',
                    bgcolor: 'background.paper',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isPremium ? '0 8px 24px rgba(255, 215, 0, 0.15)' : theme.shadows[4],
                        borderColor: isPremium ? '#FFD700' : 'primary.main',
                    }
                }}
            >
                {/* --- 3. IMAGE SECTION --- */}
                <Box onClick={handleCardClick} sx={{
                    position: 'relative',
                    width: imgWidth,
                    height: imgHeight,
                    minHeight: viewMode === 'list' ? { sm: 200 } : 'auto',
                    flexShrink: 0,
                    overflow: 'hidden',
                    bgcolor: 'action.hover'
                }}>
                    {/* Render Cover Image */}
                    {(() => {
                        let src = null;

                        // Priority 1: Standard 'images' array (most common)
                        if (coreData.images && Array.isArray(coreData.images) && coreData.images.length > 0) {
                            src = coreData.images[0];
                        }

                        // Priority 2: Field explicitly assigned to 'cover' section in template
                        if (!src) {
                            const coverField = sections.cover[0];
                            if (coverField) {
                                const val = coreData[coverField.field_name];
                                src = Array.isArray(val) ? val[0] : val;
                            }
                        }

                        // Priority 3: Scan for any image-like field
                        if (!src) {
                            const imageField = sortedFields.find(f =>
                                ['images', 'photos', 'image', 'picture', 'cover_image'].includes(f.field_name.toLowerCase()) ||
                                f.field_type === 'image'
                            );
                            if (imageField) {
                                const val = coreData[imageField.field_name];
                                src = Array.isArray(val) ? val[0] : val;
                            }
                        }

                        // Priority 4 (Ultimate Fallback): Scan ALL data values for something that looks like an image URL
                        if (!src) {
                            const potentialKeys = Object.keys(coreData);
                            for (const key of potentialKeys) {
                                const val = coreData[key];
                                // Check for string URL
                                if (typeof val === 'string' && (val.includes('supabase') || val.match(/\.(jpeg|jpg|gif|png|webp)$/i))) {
                                    src = val;
                                    break;
                                }
                                // Check for array of URLs
                                if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string' && (val[0].includes('supabase') || val[0].match(/\.(jpeg|jpg|gif|png|webp)$/i))) {
                                    src = val[0];
                                    break;
                                }
                            }
                        }

                        return src ? (
                            <UltraOptimizedImage
                                src={src}
                                alt={listing.title}
                                width="100%"
                                height="100%"
                                objectFit="cover"
                                className="card-image"
                                aspectRatio={16 / 9}
                                priority={false}
                            />
                        ) : (
                            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled' }}>
                                <Typography variant="caption" fontWeight="bold">NO IMAGE</Typography>
                            </Box>
                        );
                    })()}

                    {/* Premium Badge */}
                    {isPremium && (
                        <Box sx={{
                            position: 'absolute', top: 12, left: 12, zIndex: 2,
                            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                            color: 'black', px: 1.5, py: 0.5, borderRadius: 10,
                            fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}>
                            {isLocked ? t.premiumOnly : t.premium}
                        </Box>
                    )}

                    {/* Top Right Actions (Fav) */}
                    <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                        {!showActions && (
                            <IconButton onClick={(e) => { e.stopPropagation(); onToggleFavorite && onToggleFavorite(listing.id); }}
                                sx={{ bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', width: 32, height: 32, '&:hover': { bgcolor: 'white' } }}>
                                {isFavorite ? <Favorite color="error" sx={{ fontSize: 18 }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
                            </IconButton>
                        )}
                    </Box>

                    {/* Template Overlays */}
                    {sections.overlay_top_left.length > 0 && (
                        <Stack spacing={0.5} sx={{ position: 'absolute', top: 45, left: 12, zIndex: 1 }}>
                            {sections.overlay_top_left.map(f => renderGenericField(f, 'overlay'))}
                        </Stack>
                    )}
                    {sections.overlay_top_right.length > 0 && (
                        <Stack spacing={0.5} sx={{ position: 'absolute', top: 50, right: 12, zIndex: 1, alignItems: 'flex-end' }}>
                            {sections.overlay_top_right.map(f => renderGenericField(f, 'overlay'))}
                        </Stack>
                    )}

                    {/* Bottom Gradient Overlay */}
                    <Box sx={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        pt: 6, pb: 1.5, px: 1.5,
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'
                    }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {sections.overlay_bottom.map(f => renderGenericField(f, 'overlay'))}
                            {!sections.overlay_bottom.length && (
                                // Default fallback if no bottom overlay fields
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>{getDaysAgo(listing.created_at)}</Typography>
                            )}
                        </Stack>
                    </Box>

                    {/* Lock Overlay */}
                    {isLocked && (
                        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white' }}>
                            <Lock sx={{ fontSize: 40, mb: 1, color: '#FFD700' }} />
                            <Typography variant="button" fontWeight="bold">{t.unlockNow}</Typography>
                        </Box>
                    )}
                </Box>

                {/* --- 4. CONTENT BODY --- */}
                <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }} onClick={handleCardClick}>
                    {/* Body Fields */}
                    <Stack spacing={1} sx={{ mb: 2, flex: 1 }}>
                        {sections.body.map(f => renderGenericField(f, 'body'))}
                    </Stack>

                    <Divider sx={{ my: 1, opacity: 0.5 }} />

                    {/* Footer Fields */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            {sections.footer.map(f => renderGenericField(f, 'footer'))}
                        </Stack>

                        {/* Owner/Admin Actions */}
                        {showActions ? (
                            <Stack direction="row" spacing={0}>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit?.(listing); }} color="primary"><Edit fontSize="small" /></IconButton>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete?.(listing.id); }} color="error"><Delete fontSize="small" /></IconButton>
                            </Stack>
                        ) : (
                            // View Count Fallback if no specific footer actions defined
                            sections.footer.length === 0 && (
                                <Stack direction="row" spacing={0.5} alignItems="center" color="text.disabled">
                                    <Visibility sx={{ fontSize: 14 }} />
                                    <Typography variant="caption">{listing.views || 0}</Typography>
                                </Stack>
                            )
                        )}
                    </Stack>
                </Box>
            </Card>
        </motion.div>
    );
};

export default DynamicListingCard;
