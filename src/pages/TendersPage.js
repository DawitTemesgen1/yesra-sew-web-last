import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, Typography, Box, Chip, Button, TextField,
  InputAdornment, IconButton, useTheme, useMediaQuery, Stack,
  CircularProgress, Alert, Skeleton, CardContent
} from '@mui/material';
import {
  Search, Clear, VerifiedUser, GridView, Architecture, WorkspacePremium
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import apiService from '../services/api';
import adminService from '../services/adminService'; // Import Admin Service
import SmartSearch from '../components/SmartSearch';
import LiveActivityIndicators from '../components/LiveActivityIndicators';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import DynamicListingCard from '../components/DynamicListingCard'; // Import Dynamic Card
import { useAuth } from '../context/AuthContext';
import useListingAccess from '../hooks/useListingAccess';
import PremiumUpsellBanner from '../components/PremiumUpsellBanner';


const translations = {
  en: {
    heroTitle: "Tenders",
    heroSubtitle: "Government & Private Sector",
    heroDescription: "Discover verified tender opportunities from government and private organizations across Ethiopia",
    searchPlaceholder: "Search tenders...",
    categories: {
      all: "All",
      construction: "Construction",
      technology: "Technology",
      healthcare: "Healthcare",
      energy: "Energy",
      education: "Education",
      logistics: "Logistics",
      agriculture: "Agriculture"
    },
    activeTenders: "Active Tenders",
    results: "Results",
    govtPrivate: "Gov't & Private",
    freeListings: "Free Listings",
    loadingError: "Failed to load tenders",
    verified: "Verified",
    justNow: "Just now",
    oneDayAgo: "1 day ago",
    daysAgo: "days ago",
    estBudget: "Est. Budget",
    tender: "Tender",
    bidNow: "Bid Now",
    general: "General"
  },
  am: {
    heroTitle: "ጨረታዎች",
    heroSubtitle: "የመንግስት እና የግል ዘርፍ",
    heroDescription: "በመላው ኢትዮጵያ ካሉ የመንግስት እና የግል ድርጅቶች የተረጋገጡ የጨረታ እድሎችን ያግኙ",
    searchPlaceholder: "ጨረታዎችን ይፈልጉ...",
    categories: {
      all: "ሁሉም",
      construction: "ኮንስትራክሽን",
      technology: "ቴክኖሎጂ",
      healthcare: "ጤና",
      energy: "ኢነርጂ",
      education: "ትምህርት",
      logistics: "ሎጅስቲክስ",
      agriculture: "ግብርና"
    },
    activeTenders: "ንቁ ጨረታዎች",
    results: "ውጤቶች",
    govtPrivate: "መንግስት እና የግል",
    freeListings: "ነፃ ዝርዝሮች",
    loadingError: "ጨረታዎችን መጫን አልተቻለም",
    verified: "የተረጋገጠ",
    justNow: "አሁን",
    oneDayAgo: "ከ 1 ቀን በፊት",
    daysAgo: "ቀናት በፊት",
    estBudget: "የተገመተ በጀት",
    tender: "ጨረታ",
    bidNow: "አሁን ይወዳደሩ",
    general: "ጠቅላላ"
  },
  om: {
    heroTitle: "Caalbaasiiwwan",
    heroSubtitle: "Mootummaa fi Dhaabbilee Dhuunfaa",
    heroDescription: "Carraawwan caalbaasii mirkanaa'an dhaabbilee mootummaa fi dhuunfaa Itoophiyaa keessaa argadhaa",
    searchPlaceholder: "Caalbaasiiwwan barbaadi...",
    categories: {
      all: "Hunda",
      construction: "Ijaarsa",
      technology: "Teeknooloojii",
      healthcare: "Fayyaa",
      energy: "Anniisaa",
      education: "Barnoota",
      logistics: "Loojistikii",
      agriculture: "Qonna"
    },
    activeTenders: "Caalbaasiiwwan Jiraan",
    results: "Bu'aawwan",
    govtPrivate: "Mootummaa & Dhuunfaa",
    freeListings: "Tarreeffama Bilisaa",
    loadingError: "Caalbaasiiwwan fe'uu hin dandeenye",
    verified: "Mirkanaa'aa",
    justNow: "Amma",
    oneDayAgo: "Guyyaa 1 dura",
    daysAgo: "guyyaa dura",
    estBudget: "Baajata Tilmaamame",
    tender: "Caalbaasii",
    bidNow: "Amma Dorgomaa",
    general: "Waliigala"
  },
  ti: {
    heroTitle: "ጨረታታት",
    heroSubtitle: "መንግስትን ብሕትን",
    heroDescription: "ኣብ መላእ ኢትዮጵያ ካብ ዝርከቡ መንግስታዊን ብሕታዊን ትካላት ዝወጹ ዝተረጋገጹ ዕድላት ጨረታ ርኸቡ",
    searchPlaceholder: "ጨረታታት ድለ...",
    categories: {
      all: "ኩሎም",
      construction: "ኮንስትራክሽን",
      technology: "ቴክኖሎጂ",
      healthcare: "ጥዕና",
      energy: "ኢነርጂ",
      education: "ትምህርቲ",
      logistics: "ሎጅስቲክስ",
      agriculture: "ሕርሻ"
    },
    activeTenders: "ንጡፋት ጨረታታት",
    results: "ውጽኢታት",
    govtPrivate: "መንግስትን ብሕትን",
    freeListings: "ነፃ ዝርዝራት",
    loadingError: "ጨረታታት ምጽዓን ኣይተኻእለን",
    verified: "ዝተረጋገጸ",
    justNow: "ሕጂ",
    oneDayAgo: "ቅድሚ 1 መዓልቲ",
    daysAgo: "መዓልታት ይገብር",
    estBudget: "ዝተገመተ በጀት",
    tender: "ጨረታ",
    bidNow: "ሕጂ ተወዳደሩ",
    general: "ሓፈሻዊ"
  }
};

const TendersPage = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const theme = useTheme(); // Restored
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [templateFields, setTemplateFields] = useState([]);

  // Check listing access for tenders category
  const { hasAccess, loading: accessLoading, isListingLocked } = useListingAccess('tenders');

  // Fetch Template Fields (Cached)
  useQuery(['tendersTemplate'], async () => {
    try {
      const allCats = await apiService.getCategories();
      const tendersCat = allCats.data?.categories?.find(c => c.slug === 'tenders' || c.name === 'Tenders');

      if (tendersCat) {
        const templateData = await adminService.getTemplate(tendersCat.id);
        if (templateData && templateData.steps) {
          const fields = templateData.steps.flatMap(s => s.fields || []);
          setTemplateFields(fields);
          return fields;
        }
      }
    } catch (err) {
      console.error('Error fetching tenders template', err);
    }
    return [];
  }, {
    staleTime: 1000 * 60 * 60, // 1 hour for templates
    refetchOnWindowFocus: false
  });

  // Fetch Tenders (Cached)
  const { data: tenders = [], isLoading, error } = useQuery(
    ['tenders', selectedCategory, searchQuery],
    async () => {
      const params = {
        category: 'tenders',
        type: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined
      };
      const response = await apiService.getListings(params);
      return response.listings || response || [];
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      keepPreviousData: true
    }
  );

  const categories = [
    { value: 'All', label: t.categories.all },
    { value: 'Construction', label: t.categories.construction },
    { value: 'Technology', label: t.categories.technology },
    { value: 'Healthcare', label: t.categories.healthcare },
    { value: 'Energy', label: t.categories.energy },
    { value: 'Education', label: t.categories.education },
    { value: 'Logistics', label: t.categories.logistics },
    { value: 'Agriculture', label: t.categories.agriculture }
  ];

  /* Removed blocking loader */

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: isMobile ? 10 : 0 }}>
      <SEO
        title={t.heroTitle}
        description={t.heroDescription}
        keywords="ethiopian tenders, government tenders ethiopia, ngo tenders ethiopia, procurement ethiopia, business opportunities ethiopia, bids ethiopia, construction tenders, ጨሬታ ኢትዮጵያ, የመንግስት ጨሬታ, የብዶ ጨሬታ, የቅናት ጨሬታ, tenders addis ababa, ጨሬታ አዲስ አበባ, የቅናት ማስታወቂያ, government procurement ethiopia, የቅናት እድል"
      />
      {/* Hero Section */}
      <Box sx={{
        height: isMobile ? 600 : 650,
        position: 'relative',
        backgroundImage: 'url(https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2000&auto=format&fit=crop)', // Handshake / Contract Signing
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%)',
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Typography variant={isMobile ? "h2" : "h1"} sx={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 800,
              mb: 1,
              color: '#FFFFFF',
              fontSize: isMobile ? '3.5rem' : '5rem',
              textShadow: '0 4px 16px rgba(0,0,0,0.6)',
              letterSpacing: '-0.02em'
            }}>
              {t.heroTitle}
            </Typography>
            <Typography variant={isMobile ? "h4" : "h3"} sx={{
              fontFamily: 'Playfair Display, serif',
              fontStyle: 'italic',
              mb: 3,
              color: '#FFD700',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              fontWeight: 500
            }}>
              {t.heroSubtitle}
            </Typography>
            <Typography variant={isMobile ? "body1" : "h6"} sx={{
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
              color: 'rgba(255,255,255,0.95)',
              lineHeight: 1.6,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              fontWeight: 400
            }}>
              {t.heroDescription}
            </Typography>

            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <SmartSearch
                enableNavigation={true}
                category="tenders"
                placeholder={t.searchPlaceholder}
              />
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Categories */}
      <Box sx={{ bgcolor: 'background.default', pt: 3, pb: 1 }}>
        <Box sx={{
          overflowX: 'auto',
          px: 3,
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          <Stack direction="row" spacing={1.5} sx={{ minWidth: 'max-content' }}>
            {categories.map((category) => {
              const isSelected = selectedCategory === category.value;
              return (
                <Chip
                  key={category.value}
                  label={category.label}
                  onClick={() => setSelectedCategory(category.value)}
                  sx={{
                    bgcolor: isSelected ? 'primary.main' : 'background.paper',
                    color: isSelected ? 'primary.contrastText' : 'text.primary',
                    borderRadius: '25px',
                    px: 2,
                    py: 2.8,
                    border: isSelected ? 'none' : `1px solid ${theme.palette.divider}`,
                    fontWeight: 500,
                    fontSize: '0.8125rem',
                    boxShadow: isSelected ? `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                    '&:hover': {
                      bgcolor: isSelected ? 'primary.dark' : alpha(theme.palette.text.primary, 0.04)
                    }
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      </Box>

      {/* Header */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t.activeTenders}
            </Typography>
            <Box sx={{ width: 40, height: 3, bgcolor: 'primary.main', borderRadius: 1 }} />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {tenders.length} {t.results}
            </Typography>
            <Typography variant="caption" color="primary.main" fontWeight={600}>
              {t.govtPrivate}
            </Typography>
          </Box>
        </Stack>
      </Container>

      {/* Tenders Grid */}
      <Container maxWidth="lg" sx={{ pb: 4, minHeight: 500 }}>
        {isLoading ? (
          // Loading Skeletons
          <Grid container spacing={2.5}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Card sx={{ borderRadius: 4, height: 250, border: 'none', boxShadow: 'none', bgcolor: 'transparent' }}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 4 }} />
                  <Box sx={{ pt: 1 }}>
                    <Skeleton width="70%" height={30} sx={{ mb: 1 }} />
                    <Skeleton width="90%" height={20} />
                    <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          (() => {
            const premiumTenders = tenders.filter(t => t.is_premium);
            const regularTenders = tenders.filter(t => !t.is_premium);

            return (
              <>
                {/* --- PREMIUM TENDERS SECTION --- */}
                <Box sx={{ mb: 6 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <WorkspacePremium sx={{ color: '#FFD700', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary' }}>
                      Premium Tenders
                    </Typography>
                  </Stack>

                  {premiumTenders.length > 0 ? (
                    <Grid container spacing={2.5} component={motion.div} initial="hidden" animate="visible" variants={{
                      visible: { transition: { staggerChildren: 0.1 } }
                    }}>
                      {premiumTenders.map((tender) => (
                        <Grid item xs={12} md={6} key={tender.id} component={motion.div} variants={{
                          hidden: { opacity: 0, y: 30 },
                          visible: { opacity: 1, y: 0 }
                        }}>
                          <DynamicListingCard
                            listing={tender}
                            templateFields={templateFields}
                            viewMode="grid"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    /* Upsell Banner when no premium tenders */
                    <PremiumUpsellBanner category="tenders" />
                  )}
                </Box>

                {/* --- STANDARD TENDERS SECTION --- */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <GridView sx={{ color: 'text.secondary', fontSize: 26 }} />
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.secondary' }}>
                      {t.freeListings}
                    </Typography>
                  </Stack>
                  <Grid container spacing={2.5}>
                    {regularTenders.length > 0 ? (
                      regularTenders.map((tender) => (
                        <Grid item xs={12} sm={6} lg={4} key={tender.id}>
                          <DynamicListingCard
                            listing={tender}
                            templateFields={templateFields}
                            viewMode="grid"
                          />
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 2 }}>
                          <Typography variant="h6" color="text.secondary">
                            No tenders found matching your criteria.
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </>
            );
          })()
        )}
      </Container>
    </Box>
  );
};

export default TendersPage;