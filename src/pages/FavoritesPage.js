import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Card, Typography, Box, IconButton, useTheme, useMediaQuery, Stack, Divider,
    CircularProgress, Alert
} from '@mui/material';
import {
    Favorite, FavoriteBorder, LocationOn, CalendarToday, KingBed, Bathtub, SquareFoot,
    Speed, LocalGasStation, CalendarMonth, Delete
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
    en: {
        myFavorites: "My Favorites",
        savedListings: "{count} saved listings",
        savedListing: "{count} saved listing",
        noFavoritesYet: "No favorites yet",
        startAddingFavorites: "Start adding listings to your favorites to see them here",
        today: "Today",
        yesterday: "Yesterday",
        daysAgo: "days ago",
        beds: "Beds",
        baths: "Baths",
        sqFt: "Sq Ft"
    },
    am: {
        myFavorites: "የእኔ ተወዳጆች",
        savedListings: "{count} የተቀመጡ ዝርዝሮች",
        savedListing: "{count} የተቀመጠ ዝርዝር",
        noFavoritesYet: "ምንም ተወዳጆች የሉም",
        startAddingFavorites: "እዚህ እንዲታዩ ዝርዝሮችን ወደ ተወዳጆችዎ ማከል ይጀምሩ",
        today: "ዛሬ",
        yesterday: "ትናንት",
        daysAgo: "ቀናት በፊት",
        beds: "መኝታ",
        baths: "መታጠቢያ",
        sqFt: "ካሬ ጫማ"
    },
    om: {
        myFavorites: "Jaallatamaa Kiyya",
        savedListings: "Tarreewwan olkaa'aman {count}",
        savedListing: "Tarree olkaa'ame {count}",
        noFavoritesYet: "Ammatti jaallatamoon hin jiran",
        startAddingFavorites: "Asitti arguuf tarreewwan gara jaallatamaa keessaniitti dabaluu jalqabaa",
        today: "Har'a",
        yesterday: "Kaleessa",
        daysAgo: "guyyaa dura",
        beds: "Sireewwan",
        baths: "Mana Fincanii",
        sqFt: "Sq Ft"
    },
    ti: {
        myFavorites: "ናተይ ዝፈትዎም",
        savedListings: "{count} ዝተቀመጡ ዝርዝራት",
        savedListing: "{count} ዝተቀመጠ ዝርዝር",
        noFavoritesYet: "ክሳብ ሕጂ ዝፈትዎም የለን",
        startAddingFavorites: "ኣብዚ ንምርኣይ ዝርዝራት ናብ ዝፈትዎም ምውሳኽ ጀምሩ",
        today: "ሎሚ",
        yesterday: "ትማሊ",
        daysAgo: "መዓልታት ይገብር",
        beds: "መደቀሲ",
        baths: "መሕጸቢ",
        sqFt: "ስኩዌር ጫማ"
    }
};

const FavoritesPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiService.getFavorites();
                setFavorites(response.favorites || response || []);
            } catch (err) {
                setError('Failed to load favorites');
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    const getDaysAgo = (date) => {
        const diff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
        if (diff === 0) return t.today;
        if (diff === 1) return t.yesterday;
        return `${diff} ${t.daysAgo}`;
    };

    const removeFavorite = async (id) => {
        try {
            await apiService.toggleFavorite(id);
            setFavorites(prev => prev.filter(fav => fav.id !== id));
        } catch (err) {
            // Optionally show an error toast
        }
    };

    const renderSpecs = (listing) => {
        if (listing.category === 'Homes') {
            return (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                        <KingBed sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                            {listing.bedrooms || 0} {t.beds}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                        <Bathtub sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                            {listing.bathrooms || 0} {t.baths}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                        <SquareFoot sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                            {listing.areaSqft || 0} {t.sqFt}
                        </Typography>
                    </Stack>
                </Stack>
            );
        } else if (listing.category === 'Cars') {
            return (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                        <CalendarMonth sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                            {listing.year || 'N/A'}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                        <Speed sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                            {listing.transmission || 'N/A'}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                        <LocalGasStation sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                            {listing.fuel || 'N/A'}
                        </Typography>
                    </Stack>
                </Stack>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: isMobile ? 10 : 4 }}>
            {/* Header */}
            <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
                <Container maxWidth="lg">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Favorite sx={{ fontSize: isMobile ? 32 : 40 }} />
                        <Box>
                            <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" gutterBottom>
                                {t.myFavorites}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                {favorites.length === 1
                                    ? t.savedListing.replace('{count}', favorites.length)
                                    : t.savedListings.replace('{count}', favorites.length)
                                }
                            </Typography>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                {favorites.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <FavoriteBorder sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" color="text.secondary" gutterBottom>
                            {t.noFavoritesYet}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t.startAddingFavorites}
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {favorites.map((listing, index) => (
                            <Grid item xs={12} sm={6} md={4} key={listing.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.4 }}
                                >
                                    <Card
                                        onClick={() => navigate(`/listings/${listing.id}`)}
                                        sx={{
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 4
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            {/* Image Section */}
                                            <Box sx={{ position: 'relative', height: 200 }}>
                                                <Box
                                                    component="img"
                                                    src={listing.image || listing.images?.[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=500'}
                                                    alt={listing.title}
                                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                {/* Category Badge - Top Left */}
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    left: 12,
                                                    bgcolor: theme.palette.background.paper,
                                                    borderRadius: '20px',
                                                    px: 1.5,
                                                    py: 0.75
                                                }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6875rem' }}>
                                                        {listing.category}
                                                    </Typography>
                                                </Box>
                                                {/* Days Ago Badge - Top Right */}
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    right: 12,
                                                    bgcolor: alpha('#000', 0.7),
                                                    borderRadius: '20px',
                                                    px: 1.5,
                                                    py: 0.75
                                                }}>
                                                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.625rem' }}>
                                                        {getDaysAgo(listing.created_at || listing.createdAt)}
                                                    </Typography>
                                                </Box>
                                                {/* Remove Button - Bottom Left */}
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFavorite(listing.id);
                                                    }}
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 12,
                                                        left: 12,
                                                        bgcolor: alpha('#fff', 0.9),
                                                        '&:hover': { bgcolor: 'white' },
                                                        width: 36,
                                                        height: 36
                                                    }}
                                                >
                                                    <Delete color="error" sx={{ fontSize: 20 }} />
                                                </IconButton>
                                            </Box>

                                            {/* Content Section */}
                                            <Box sx={{ p: 2 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                                    {listing.type}
                                                </Typography>

                                                <Typography variant="h6" sx={{
                                                    fontWeight: 'bold',
                                                    fontSize: '1.05rem',
                                                    mb: 1,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {listing.title}
                                                </Typography>

                                                <Stack direction="row" spacing={0.5} alignItems="center" mb={1}>
                                                    <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }} noWrap>
                                                        {listing.location}
                                                    </Typography>
                                                </Stack>

                                                <Divider sx={{ my: 1 }} />

                                                {/* Specs */}
                                                {renderSpecs(listing) && (
                                                    <Box sx={{ mb: 1 }}>
                                                        {renderSpecs(listing)}
                                                    </Box>
                                                )}

                                                <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ fontSize: '1.125rem', mt: 1 }}>
                                                    ETB {listing.price}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default FavoritesPage;
