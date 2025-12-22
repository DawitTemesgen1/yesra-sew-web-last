import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Typography, TextField, Button, Box, Grid, Card, CardContent,
  Chip, IconButton, Pagination, InputAdornment, FormControl, InputLabel,
  Select, MenuItem, Stack, Divider, Skeleton, useTheme, alpha, useMediaQuery
} from '@mui/material';
import {
  Search, Clear, GridView, ViewList, Favorite, FavoriteBorder,
  LocationOn, CalendarToday, Speed, LocalGasStation, Bed, Bathtub, SquareFoot
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';
import apiService from '../services/api';
import adminService from '../services/adminService';
import { useLanguage } from '../contexts/LanguageContext';

import SmartSearch from '../components/SmartSearch';
import LiveActivityIndicators from '../components/LiveActivityIndicators';
import DynamicListingCard from '../components/DynamicListingCard';

// --- Translations ---
const translations = {
  en: {
    allListings: "All Listings",
    browseListings: "Browse through available listings",
    searchListings: "Search listings...",
    category: "Category",
    allCategories: "All Categories",
    sortBy: "Sort By",
    newest: "Newest",
    priceLowHigh: "Price: Low to High",
    priceHighLow: "Price: High to Low",
    mostPopular: "Most Popular",
    noListingsFound: "No listings found",
    databaseEmpty: "The database might be empty. Try adding some sample listings or check back later.",
    postFirstListing: "Post First Listing",
    adjustFilters: "Try adjusting your search or filters",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "days ago",
    beds: "Beds",
    baths: "Baths",
    sqFt: "Sq Ft",
    addedToFavorites: "Added to favorites",
    removedFromFavorites: "Removed from favorites",
    failedUpdateFavorite: "Failed to update favorite status",
    failedLoadListings: "Failed to load listings. Backend may not have data yet.",
    jobs: "Jobs",
    tenders: "Tenders",
    homes: "Homes",
    cars: "Cars",
    locationNotSpecified: "Location not specified"
  },
  am: {
    allListings: "ሁሉም ማስታወቂያዎች",
    browseListings: "ካሉ ማስታወቂያዎች ውስጥ ይፈልጉ",
    searchListings: "ማስታወቂያዎችን ይፈልጉ...",
    category: "ምድብ",
    allCategories: "ሁሉም ምድቦች",
    sortBy: "ደርድር በ",
    newest: "አዲስ",
    priceLowHigh: "ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ",
    priceHighLow: "ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ",
    mostPopular: "በጣም ታዋቂ",
    noListingsFound: "ምንም ማስታወቂያዎች አልተገኙም",
    databaseEmpty: "ዳታቤዙ ባዶ ሊሆን ይችላል። አንዳንድ ናሙና ማስታወቂያዎችን ለመጨመር ይሞክሩ ወይም በኋላ ተመልሰው ያረጋግጡ።",
    postFirstListing: "የመጀመሪያውን ማስታወቂያ ይለጥፉ",
    adjustFilters: "ፍለጋዎን ወይም ማጣሪያዎችዎን ለማስተካከል ይሞክሩ",
    today: "ዛሬ",
    yesterday: "ትናንት",
    daysAgo: "ቀናት በፊት",
    beds: "መኝታ ቤቶች",
    baths: "መታጠቢያ ቤቶች",
    sqFt: "ካሬ ጫማ",
    addedToFavorites: "ወደ ተወዳጆች ተጨምሯል",
    removedFromFavorites: "ከተወዳጆች ተወግዷል",
    failedUpdateFavorite: "የተወዳጅ ሁኔታን ማዘመን አልተቻለም",
    failedLoadListings: "ማስታወቂያዎችን መጫን አልተቻለም።",
    jobs: "ስራዎች",
    tenders: "ጨረታዎች",
    homes: "ቤቶች",
    cars: "መኪናዎች",
    locationNotSpecified: "ቦታው አልተገለጸም"
  },
  ti: {
    allListings: "ሁሉም ማስታወቂያዎች (Tigrinya)",
    browseListings: "ካሉ ማስታወቂያዎች ውስጥ ይፈልጉ",
    searchListings: "ማስታወቂያዎችን ይፈልጉ...",
    category: "ምድብ",
    allCategories: "ሁሉም ምድቦች",
    sortBy: "ደርድር በ",
    newest: "አዲስ",
    priceLowHigh: "ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ",
    priceHighLow: "ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ",
    mostPopular: "በጣም ታዋቂ",
    noListingsFound: "ምንም ማስታወቂያዎች አልተገኙም",
    databaseEmpty: "ዳታቤዙ ባዶ ሊሆን ይችላል። አንዳንድ ናሙና ማስታወቂያዎችን ለመጨመር ይሞክሩ ወይም በኋላ ተመልሰው ያረጋግጡ።",
    postFirstListing: "የመጀመሪያውን ማስታወቂያ ይለጥፉ",
    adjustFilters: "ፍለጋዎን ወይም ማጣሪያዎችዎን ለማስተካከል ይሞክሩ",
    today: "ዛሬ",
    yesterday: "ትናንት",
    daysAgo: "ቀናት በፊት",
    beds: "መኝታ ቤቶች",
    baths: "መታጠቢያ ቤቶች",
    sqFt: "ካሬ ጫማ",
    addedToFavorites: "ወደ ተወዳጆች ተጨምሯል",
    removedFromFavorites: "ከተወዳጆች ተወግዷል",
    failedUpdateFavorite: "የተወዳጅ ሁኔታን ማዘመን አልተቻለም",
    failedLoadListings: "ማስታወቂያዎችን መጫን አልተቻለም።",
    jobs: "ስራዎች",
    tenders: "ጨረታዎች",
    homes: "ቤቶች",
    cars: "መኪናዎች",
    locationNotSpecified: "ቦታው አልተገለጸም"
  },
  om: {
    allListings: "All Listings (Oromo)",
    browseListings: "Browse through available listings",
    searchListings: "Search listings...",
    category: "Category",
    allCategories: "All Categories",
    sortBy: "Sort By",
    newest: "Newest",
    priceLowHigh: "Price: Low to High",
    priceHighLow: "Price: High to Low",
    mostPopular: "Most Popular",
    noListingsFound: "No listings found",
    databaseEmpty: "The database might be empty. Try adding some sample listings or check back later.",
    postFirstListing: "Post First Listing",
    adjustFilters: "Try adjusting your search or filters",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "days ago",
    beds: "Beds",
    baths: "Baths",
    sqFt: "Sq Ft",
    addedToFavorites: "Added to favorites",
    removedFromFavorites: "Removed from favorites",
    failedUpdateFavorite: "Failed to update favorite status",
    failedLoadListings: "Failed to load listings. Backend may not have data yet.",
    jobs: "Jobs",
    tenders: "Tenders",
    homes: "Homes",
    cars: "Cars",
    locationNotSpecified: "Location not specified"
  }
};

// --- Helper Functions ---

const getDaysAgo = (dateString, t) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const diff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return t.today;
  if (diff === 1) return t.yesterday;
  return `${diff} ${t.daysAgo}`;
};

const getIconForField = (fieldName) => {
  const lowerName = fieldName.toLowerCase();
  if (lowerName.includes('bedroom')) return Bed;
  if (lowerName.includes('bathroom')) return Bathtub;
  if (lowerName.includes('area') || lowerName.includes('sqft')) return SquareFoot;
  if (lowerName.includes('year')) return CalendarToday;
  if (lowerName.includes('transmission')) return Speed;
  if (lowerName.includes('fuel')) return LocalGasStation;
  // Fallbacks for generic specs
  if (lowerName.includes('location')) return LocationOn;
  return null;
};

// --- Sub-components ---



// --- Main Page Component ---

const ListingsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);

  // 1. Fetch Categories
  const { data: categories = [] } = useQuery(
    ['categories', language],
    async () => {
      const response = await apiService.getCategories();
      return response.categories || [];
    },
    { staleTime: 300000 } // 5 minutes cache
  );

  // 2. Fetch Template (Dependent on Category)
  const { data: templateFields = [] } = useQuery(
    ['template', selectedCategory],
    async () => {
      if (selectedCategory === 'All') return [];
      // Pass ID if it's an ID (number/uuid) or find the ID from categories list
      let catId = selectedCategory;
      const catObj = categories.find(c => c.id === selectedCategory || c.name === selectedCategory);
      if (catObj) catId = catObj.id;

      const templateData = await adminService.getTemplate(catId);
      if (templateData && templateData.steps) {
        return templateData.steps.flatMap(step => step.fields || []);
      }
      return [];
    },
    {
      enabled: selectedCategory !== 'All' && categories.length > 0,
      staleTime: 300000
    }
  );

  // 3. Fetch Listings
  const {
    data: listingsData = { listings: [], totalPages: 1 },
    isLoading,
    isFetching, // Add isFetching
    isError,
    refetch
  } = useQuery(
    ['listings', page, searchQuery, selectedCategory, sortBy],
    async () => {
      const params = {
        page,
        limit: 12,
        search: searchQuery || undefined,
        sortBy: sortBy === 'Newest' ? 'created_at' : sortBy === 'Price: Low to High' ? 'price_asc' : sortBy === 'Price: High to Low' ? 'price_desc' : 'created_at',
        sortOrder: sortBy === 'Price: Low to High' ? 'ASC' : 'DESC'
      };

      // Intelligent Mode: Check if we have the category object to pass exact ID
      if (selectedCategory !== 'All') {
        const catObj = categories.find(c => c.id === selectedCategory || c.name === selectedCategory);
        if (catObj && catObj.id) {
          params.category_id = catObj.id;
        } else {
          // Fallback: Pass as generic string if we can't find ID (e.g. url param)
          params.category = selectedCategory;
        }
      }

      const response = await apiService.getListings(params);
      if (!response.success && response.error) throw new Error(response.error);

      // Handle various response structures for robusticity
      const data = response.listings || response.data?.listings || response.data?.data?.listings || [];
      const pagination = response.pagination || response.data?.pagination || response.data?.data?.pagination;

      return {
        listings: data,
        totalPages: pagination?.totalPages || Math.ceil((pagination?.total || 0) / 12) || 1
      };
    },
    {
      keepPreviousData: true,
      staleTime: 5000,
      retry: 1
    }
  );

  const listings = listingsData.listings;
  const totalPages = listingsData.totalPages;

  // Improved Skeleton Logic: Show when loading OR fetching (if we have no data to show yet)
  // This prevents the "No Listings" flash during a filter change that takes a moment
  const showSkeleton = isLoading || (isFetching && listings.length === 0);

  // Handlers
  const toggleFavorite = async (listingId) => {
    try {
      await apiService.toggleFavorite(listingId);
      setFavorites(prev =>
        prev.includes(listingId) ? prev.filter(id => id !== listingId) : [...prev, listingId]
      );
      toast.success(favorites.includes(listingId) ? t.removedFromFavorites : t.addedToFavorites);
    } catch (error) {
      toast.error(t.failedUpdateFavorite);
    }
  };

  const SORT_OPTIONS = [
    { label: t.newest, value: 'Newest' },
    { label: t.priceLowHigh, value: 'Price: Low to High' },
    { label: t.priceHighLow, value: 'Price: High to Low' },
    { label: t.mostPopular, value: 'Most Popular' }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: isMobile ? 10 : 4 }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" gutterBottom>
              {selectedCategory === 'All' ? t.allListings : selectedCategory}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {t.browseListings} {listings.length > 0 && `(${listings.length})`}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4 }}>
        {/* Helper/Filter Bar */}
        <Card sx={{ p: 3, borderRadius: 4, boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <SmartSearch onSearch={setSearchQuery} placeholder={t.searchListings} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t.category}</InputLabel>
                <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} label={t.category}>
                  <MenuItem value="All">{t.allCategories}</MenuItem>
                  {categories.filter(Boolean).map(cat => (
                    <MenuItem key={cat.id || cat.name} value={cat.id || cat.name}>
                      {cat.name || cat.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t.sortBy}</InputLabel>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label={t.sortBy}>
                  {SORT_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Stack direction="row" spacing={1}>
                <IconButton onClick={() => setViewMode('grid')} color={viewMode === 'grid' ? "primary" : "default"}><GridView /></IconButton>
                <IconButton onClick={() => setViewMode('list')} color={viewMode === 'list' ? "primary" : "default"}><ViewList /></IconButton>
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {/* Content Area */}
        {showSkeleton ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 4, mb: 1 }} />
                <Skeleton width="60%" height={30} />
                <Skeleton width="40%" height={20} />
              </Grid>
            ))}
          </Grid>
        ) : isError ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="error" gutterBottom>{t.failedLoadListings}</Typography>
            <Button onClick={() => refetch()} variant="outlined">Try Again</Button>
          </Box>
        ) : listings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>{t.noListingsFound}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{t.databaseEmpty}</Typography>
            <Button variant="contained" onClick={() => navigate('/post-ad')}>{t.postFirstListing}</Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              <AnimatePresence>
                {listings.map((listing, index) => (
                  <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} key={listing.id}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <DynamicListingCard
                        listing={listing}
                        templateFields={templateFields}
                        viewMode={viewMode}
                        onToggleFavorite={toggleFavorite}
                        isFavorite={favorites.includes(listing.id) || listing.is_favorited}
                      />
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination count={totalPages} page={page} onChange={(e, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }} color="primary" />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ListingsPage;
