
import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Container, TextField, InputAdornment, IconButton,
    Typography, Grid, Card, CardContent, Chip, Stack,
    CircularProgress, useTheme, useMediaQuery, alpha
} from '@mui/material';
import {
    ArrowBack, Search, FilterList,
    Home, DirectionsCar, Work, Assignment,
    LocationOn, AccessTime
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import apiService from '../services/api';
import adminService from '../services/adminService';
import DynamicListingCard from '../components/DynamicListingCard';
import useListingAccess from '../hooks/useListingAccess';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: <FilterList fontSize="small" /> },
    { id: 'homes', label: 'Homes', icon: <Home fontSize="small" /> },
    { id: 'cars', label: 'Cars', icon: <DirectionsCar fontSize="small" /> },
    { id: 'jobs', label: 'Jobs', icon: <Work fontSize="small" /> },
    { id: 'tenders', label: 'Tenders', icon: <Assignment fontSize="small" /> },
];

const SearchPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'all';

    const [query, setQuery] = useState('');
    const [category, setCategory] = useState(initialCategory);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);

    const inputRef = useRef(null);

    // Permission Check
    const { isListingLocked } = useListingAccess('all');


    // Using useQuery directly since it's common in this codebase
    const { data: searchTemplates = {} } = useQuery(['searchTemplates'], async () => {
        try {
            const categories = await apiService.getCategories();
            const cats = categories.data?.categories || [];
            const templates = {};

            // Robust mapping for standard categories
            const categoryMappings = [
                { key: 'jobs', match: ['jobs', 'job', 'vacancy', 'vacancies'] },
                { key: 'tenders', match: ['tenders', 'tender', 'bids'] },
                { key: 'homes', match: ['homes', 'home', 'property', 'properties', 'real estate'] },
                { key: 'cars', match: ['cars', 'car', 'vehicle', 'vehicles', 'automotive'] }
            ];

            for (const mapping of categoryMappings) {
                // Find the category that matches one of the keywords
                const cat = cats.find(c => {
                    const s = (c.slug || '').toLowerCase();
                    const n = (c.name || '').toLowerCase();
                    return mapping.match.includes(s) || mapping.match.includes(n);
                });

                if (cat) {
                    try {
                        const templateData = await (typeof adminService.getTemplate === 'function' ? adminService.getTemplate(cat.id) : Promise.resolve(null));
                        if (templateData && templateData.steps) {
                            templates[mapping.key] = templateData.steps.flatMap(s => s.fields || []);
                        }
                    } catch (e) {
                        console.warn(`Failed to load template for ${mapping.key}`, e);
                    }
                }
            }
            return templates;
        } catch (err) {
            console.error('Error fetching search templates', err);
            return {};
        }
    }, {
        staleTime: 1000 * 60 * 60,
        cacheTime: 1000 * 60 * 120,
        refetchOnMount: false
    });

    // Fetch Categories for resolving IDs
    const { data: categoriesData } = useQuery('categories', async () => {
        const res = await apiService.getCategories();
        return res.categories || res.data?.categories || [];
    }, { staleTime: 1000 * 60 * 60 });
    const fetchedCategories = categoriesData || [];

    // Helper to resolve category object
    const getCategoryForListing = (listing) => {
        if (listing.category) return listing.category;
        if (listing.category_id && fetchedCategories.length > 0) {
            return fetchedCategories.find(c => c.id === listing.category_id);
        }
        return null;
    };

    const getTemplateForListing = (listing) => {
        const cat = getCategoryForListing(listing);
        if (!cat) return null;

        const rawSlug = (cat.slug || cat.name || '').toLowerCase();

        // Normalize logic to match the keys in searchTemplates
        let key = rawSlug;
        if (['job', 'jobs', 'vacancy'].some(s => rawSlug.includes(s))) key = 'jobs';
        else if (['tender', 'tenders', 'bid'].some(s => rawSlug.includes(s))) key = 'tenders';
        else if (['home', 'homes', 'property'].some(s => rawSlug.includes(s))) key = 'homes';
        else if (['car', 'cars', 'vehicle'].some(s => rawSlug.includes(s))) key = 'cars';

        const fields = searchTemplates[key];
        return fields ? { steps: [{ fields }] } : null;
    };

    useEffect(() => {
        // Initial search on mount
        handleSearch(query, initialCategory);
    }, []);

    const handleSearch = async (searchTerm, cat) => {
        setLoading(true);
        try {
            const filters = {};
            if (searchTerm && searchTerm.trim()) {
                filters.search = searchTerm.trim();
            }
            if (cat && cat !== 'all') {
                filters.category = cat;
            }

            // Call API
            const response = await apiService.getListings(filters);

            // Handle response format (support both array and {listings: []} format if wrapper changes)
            const listings = Array.isArray(response) ? response : (response.listings || []);
            setResults(listings);
        } catch (error) {
            console.error("Search error:", error);
            // Optionally set error state
        } finally {
            setLoading(false);
        }
    };

    const onQueryChange = (e) => {
        const newVal = e.target.value;
        setQuery(newVal);

        if (typingTimeout) clearTimeout(typingTimeout);

        setTypingTimeout(setTimeout(() => {
            handleSearch(newVal, category);
        }, 500));
    };

    const onCategoryChange = (newCat) => {
        setCategory(newCat);
        // Update URL param without reload
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('category', newCat);
        window.history.pushState({}, '', newUrl);

        handleSearch(query, newCat);
    };

    // Helper helpers removed since DynamicListingCard handles logic internally

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header Area */}
            <Box sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1100,
                bgcolor: 'background.paper',
                borderBottom: `1px solid ${theme.palette.divider}`,
                pt: 2,
                pb: 2
            }}>
                <Container maxWidth="lg">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton onClick={() => navigate(-1)}>
                            <ArrowBack />
                        </IconButton>
                        <TextField
                            inputRef={inputRef}
                            fullWidth
                            placeholder="Search homes, cars, jobs..."
                            value={query}
                            onChange={onQueryChange}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.common.black, 0.04),
                                    '& fieldset': { border: 'none' }
                                }
                            }}
                        />
                    </Stack>

                    {/* Category Chips */}
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 2, overflowX: 'auto', pb: 1 }}
                        className="hide-scrollbar"
                    >
                        {CATEGORIES.map((cat) => (
                            <Chip
                                key={cat.id}
                                icon={cat.icon}
                                label={cat.label}
                                onClick={() => onCategoryChange(cat.id)}
                                sx={{
                                    bgcolor: category === cat.id ? 'primary.main' : 'transparent',
                                    color: category === cat.id ? 'white' : 'text.primary',
                                    border: category === cat.id ? 'none' : `1px solid ${theme.palette.divider}`,
                                    '&:hover': {
                                        bgcolor: category === cat.id ? 'primary.dark' : alpha(theme.palette.primary.main, 0.1)
                                    },
                                    '& .MuiChip-icon': {
                                        color: category === cat.id ? 'white' : 'inherit'
                                    }
                                }}
                                clickable
                            />
                        ))}
                    </Stack>
                </Container>
            </Box>

            {/* Results Area */}
            <Container maxWidth="lg" sx={{ py: 3 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={5}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {results.map((item, index) => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <DynamicListingCard
                                        listing={{
                                            ...item,
                                            category: getCategoryForListing(item) || item.category
                                        }}
                                        template={getTemplateForListing(item)}
                                        viewMode="grid"
                                    />
                                </motion.div>
                            </Grid>
                        ))}

                        {!loading && results.length === 0 && (
                            <Box width="100%" textAlign="center" py={5}>
                                <Typography color="text.secondary">
                                    {query ? `No results found for "${query}"` : "Start searching..."}
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default SearchPage;

