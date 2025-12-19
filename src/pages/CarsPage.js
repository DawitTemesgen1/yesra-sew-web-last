import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, Typography, Box, Chip,
  useTheme, useMediaQuery, Stack,
  CircularProgress, Alert, Skeleton, CardContent
} from '@mui/material';
import {
  DirectionsCar, LocationOn, WorkspacePremium, Lock, Star
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import apiService from '../services/api';
import adminService from '../services/adminService'; // Import Admin Service
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import SmartSearch from '../components/SmartSearch';
import LiveActivityIndicators from '../components/LiveActivityIndicators';
import DynamicListingCard from '../components/DynamicListingCard'; // Import Dynamic Card
import useListingAccess from '../hooks/useListingAccess';
import PremiumUpsellBanner from '../components/PremiumUpsellBanner';

const translations = {
  en: {
    pageTitle: "Cars",
    heroTitle: "Find Your Next Ride",
    heroSubtitle: "Buy & Rent with Confidence",
    heroDescription: "Explore a vast collection of new and pre-owned vehicles. Your perfect car is just a search away.",
    searchPlaceholder: "Search by make, model, or keyword...",
    allBrands: "All Brands",
    freeListings: "Free Listings",
    loadingError: "Failed to load cars. Please try again later.",
    justNow: "Just now",
    hoursAgo: "h ago",
    daysAgo: "d ago",
    pricePrefix: "ETB",
  },
  am: {
    pageTitle: "መኪናዎች",
    heroTitle: "ቀጣይ መኪናዎን እዚህ ያግኙ",
    heroSubtitle: "በእርግጠኝነት ይግዙ እና ይከራዩ",
    heroDescription: "ሰፊ የአዳዲስ እና ያገለገሉ ተሽከርካሪዎች ስብስብን ያስሱ። የእርስዎ ምርጥ መኪና አንድ ፍለጋ ብቻ ይርቃል።",
    searchPlaceholder: "በአይነት፣ በሞዴል፣ ወይም በቁልፍ ቃል ይፈልጉ...",
    allBrands: "ሁሉም ብራንዶች",
    freeListings: "ነፃ ዝርዝሮች",
    loadingError: "መኪናዎችን ለመጫን አልተቻለም። እባክዎ ቆይተው እንደገና ይሞክሩ።",
    justNow: "አሁን",
    hoursAgo: "ሰ በፊት",
    daysAgo: "ቀን በፊት",
    pricePrefix: "ብር",
  },
  om: {
    pageTitle: "Konkolaattota",
    heroTitle: "Konkolaataa Itti Aanu Keessan Argadhaa",
    heroSubtitle: "Of-eeggannoodhaan Bitaa & Kireeffadhaa",
    heroDescription: "Kuusaa konkolaattota haaraa fi fayyadamoo bal'aa ta'e qoradhaa. Konkolaataan keessan inni madaalawaan barbaacha tokko qofa fagaata.",
    searchPlaceholder: "Maqaa, moodela, ykn jecha ijootiin barbaadi...",
    allBrands: "Biraandoota Hundaa",
    freeListings: "Tarreeffama Bilisaa",
    loadingError: "Konkolaattota fe'uu dadhabe. Maaloo yeroo booda irra deebi'aa yaalaa.",
    justNow: "Amma",
    hoursAgo: "sa'a dura",
    daysAgo: "guyyaa dura",
    pricePrefix: "ETB",
  },
  ti: {
    pageTitle: "መካይን",
    heroTitle: "ቀጻሊት መኪናኹም ኣብዚ ረኸቡ",
    heroSubtitle: "ብተኣማንነት ግዝኡን ተኻረዩን",
    heroDescription: "ሰፊሕ ክምችት ሓደሽትን ዝተጠቐምሉን መካይን ዳህሰሱ። እታ ምልእቲ መኪናኹም ሓንቲ ምድላይ ጥራይ እያ ርሒቓ ዘላ።",
    searchPlaceholder: "ብሞዴል፣ ዓይነት፣ ወይድማ ቀንዲ ቃል ድለዩ...",
    allBrands: "ኩሎም ብራንድታት",
    freeListings: "ነፃ ዝርዝራት",
    loadingError: "መካይን ምጽዓን ኣይተኻእለን። በጃኹም ድሕሪኡ እንደገና ፈትኑ።",
    justNow: "ሕጂ",
    hoursAgo: "ሰዓት ቅድሚ",
    daysAgo: "መዓልቲ ቅድሚ",
    pricePrefix: "ብር",
  }
};

const CarsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Language State ---
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  // Dynamically generate car brands based on the selected language for "All Brands"
  const CAR_BRANDS = [
    { id: 'ALL', label: t.allBrands },
    { id: 'Toyota', label: 'Toyota' },
    { id: 'Hyundai', label: 'Hyundai' },
    { id: 'Nissan', label: 'Nissan' },
    { id: 'Mitsubishi', label: 'Mitsubishi' },
    { id: 'Honda', label: 'Honda' },
    { id: 'Mercedes', label: 'Mercedes' },
    { id: 'BMW', label: 'BMW' },
    { id: 'Ford', label: 'Ford' }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [templateFields, setTemplateFields] = useState([]);

  // Access Control
  const { isListingLocked } = useListingAccess('cars');

  // Fetch Template Fields (Cached)
  useQuery(['carsTemplate'], async () => {
    try {
      const categories = await apiService.getCategories();
      const carsCat = categories.data?.categories?.find(c => c.slug === 'cars' || c.name === 'Cars');

      if (carsCat) {
        const templateData = await adminService.getTemplate(carsCat.id);
        if (templateData && templateData.steps) {
          const fields = templateData.steps.flatMap(s => s.fields || []);
          setTemplateFields(fields);
          return fields;
        }
      }
    } catch (err) {
      console.error('Error fetching cars template', err);
    }
    return [];
  }, {
    staleTime: 1000 * 60 * 60, // 1 hour for templates
    refetchOnWindowFocus: false
  });

  // Fetch Cars (Cached)
  const { data: cars = [], isLoading, error } = useQuery(
    ['cars', selectedBrand, searchQuery],
    async () => {
      const params = {
        category: 'cars', // Reverted to plural 'cars' to match database slug
        brand: selectedBrand !== 'ALL' ? selectedBrand : undefined,
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

  /* Removed blocking loader */

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Split Logic
  const premiumCars = cars.filter(c => c.is_premium || c.custom_fields?.is_premium);
  const regularCars = cars.filter(c => !c.is_premium && !c.custom_fields?.is_premium);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: isMobile ? 10 : 0 }}>
      <SEO
        title={t.pageTitle}
        description={t.heroDescription}
        keywords="used cars ethiopia, toyota vitz ethiopia, car prices addis ababa, buy cars ethiopia, sell cars ethiopia, vehicles for sale, ምኪና ኢትዮጵያ, የምኪና ሽያጭ, ቶዮታ ቪጭ ኢትዮጵያ, ምኪና አዲስ አበባ, የምኪና ማስታወቂያ, የተጠመደ ምኪና, cars addis ababa, toyota ethiopia, የምኪና ጋብያ"
      />
      {/* Hero Section */}
      <Box sx={{
        height: isMobile ? 600 : 650,
        position: 'relative',
        backgroundImage: 'url(https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1080)',
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
              {t.pageTitle}
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
                category="cars"
                placeholder={t.searchPlaceholder}
              />
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Brand Filters */}
      < Box sx={{ bgcolor: 'background.default', pt: 3, pb: 1 }}>
        <Box sx={{
          overflowX: 'auto',
          px: 3,
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          <Stack direction="row" spacing={1.25} sx={{ minWidth: 'max-content' }}>
            {CAR_BRANDS.map((brand) => {
              const isSelected = selectedBrand === brand.id;
              return (
                <Chip
                  key={brand.id}
                  label={brand.label}
                  onClick={() => setSelectedBrand(brand.id)}
                  sx={{
                    bgcolor: isSelected ? 'primary.main' : 'background.paper',
                    color: isSelected ? 'primary.contrastText' : 'text.primary',
                    borderRadius: '20px',
                    px: 2,
                    py: 2.8,
                    border: isSelected ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    fontWeight: isSelected ? 600 : 'normal',
                    '&:hover': {
                      bgcolor: isSelected ? 'primary.dark' : alpha(theme.palette.text.primary, 0.04)
                    }
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      </Box >

      {/* Cars Grid */}
      {/* Cars Grid */}
      {/* Cars Grid */}
      <Container maxWidth="lg" sx={{ py: 3, minHeight: 500 }}>
        {isLoading ? (
          // Loading Skeletons
          <Grid container spacing={3}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} lg={4} key={i}>
                <Card sx={{ borderRadius: 4, height: 320, border: 'none', boxShadow: 'none', bgcolor: 'transparent' }}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
                  <Box sx={{ pt: 1 }}>
                    <Skeleton width="60%" height={30} sx={{ mb: 1 }} />
                    <Skeleton width="40%" height={20} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <>

            {/* --- PREMIUM CARS SECTION --- */}
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <WorkspacePremium sx={{ color: '#FFD700', fontSize: 28 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary' }}>
                  Premium Cars
                </Typography>
              </Stack>

              {premiumCars.length > 0 ? (
                <Grid container spacing={3} component={motion.div} initial="hidden" animate="visible" variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}>
                  {premiumCars.map((car) => (
                    <Grid item xs={12} sm={6} lg={4} key={car.id} component={motion.div} variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0 }
                    }}>
                      <DynamicListingCard
                        listing={car}
                        template={{ steps: [{ fields: templateFields }] }}
                        viewMode="grid"
                        isLocked={isListingLocked(car)}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                /* Upsell Banner when no Premium Cars */
                <PremiumUpsellBanner category="cars" />
              )}
            </Box>

            {/* --- STANDARD CARS SECTION --- */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, mt: 4 }}>
                <DirectionsCar sx={{ color: 'text.secondary', fontSize: 26 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.secondary' }}>
                  {t.freeListings}
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                {regularCars.length > 0 ? (
                  regularCars.map((car) => (
                    <Grid item xs={12} sm={6} lg={4} key={car.id}>
                      <DynamicListingCard
                        listing={car}
                        template={{ steps: [{ fields: templateFields }] }}
                        viewMode="grid"
                        isLocked={false}
                      />
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Alert severity="info">No standard listings available at the moment.</Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          </>
        )}
      </Container>
    </Box >
  );
};

export default CarsPage;