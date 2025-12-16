import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent,
  useTheme, useMediaQuery, Stack,
  CircularProgress, Alert, Button
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import {
  Bed, Bathtub, SquareFoot, LocationOn, WorkspacePremium
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import apiService from '../services/api';
import adminService from '../services/adminService';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import SmartSearch from '../components/SmartSearch';
import LiveActivityIndicators from '../components/LiveActivityIndicators';
import DynamicListingCard from '../components/DynamicListingCard';
import { useAuth } from '../context/AuthContext';
import useListingAccess from '../hooks/useListingAccess';
import PremiumUpsellBanner from '../components/PremiumUpsellBanner';


const translations = {
  en: {
    heroTitle: "Find Your Dream Home",
    heroSubtitle: "Quality Living Spaces",
    searchPlaceholder: "Search for your dream home...",
    featuredProperties: "Featured Properties",
    latestProperties: "Latest Properties",
    propertiesFound: "{count} properties found",
    noProperties: "No properties found. Make sure you have approved listings in the admin panel.",
    locationNotSpecified: "Location not specified",
    sqft: "sqft",
    daysAgo: "days ago",
    hoursAgo: "hours ago",
    justNow: "Just now",
    pricePrefix: "ETB",
    freeListings: "Free Listings"
  },
  am: {
    heroTitle: "የህልም ቤትዎን ያግኙ",
    heroSubtitle: "ጥራት ያለው የመኖሪያ ቦታዎች",
    searchPlaceholder: "የህልም ቤትዎን ይፈልጉ...",
    featuredProperties: "ተለይተው የቀረቡ ቤቶች",
    latestProperties: "የቅርብ ጊዜ ቤቶች",
    propertiesFound: "{count} ቤቶች ተገኝተዋል",
    noProperties: "ምንም ቤቶች አልተገኙም። በአስተዳዳሪ ፓነል ውስጥ የጸደቁ ዝርዝሮች እንዳሉዎት ያረጋግጡ።",
    locationNotSpecified: "ቦታ አልተገለጸም",
    sqft: "ካሬ ጫማ",
    daysAgo: "ቀናት በፊት",
    hoursAgo: "ሰዓታት በፊት",
    justNow: "አሁን",
    pricePrefix: "ብር",
    freeListings: "ነፃ ዝርዝሮች"
  },
  om: {
    heroTitle: "Mana Abjuu Keessanii Argadhaa",
    heroSubtitle: "Iddoowwan Jireenyaa Qulqullina Qaban",
    searchPlaceholder: "Mana abjuu keessanii barbaadaa...",
    featuredProperties: "Manneen Filataman",
    latestProperties: "Manneen Dhiheenyatti",
    propertiesFound: "Manneen {count} argaman",
    noProperties: "Manneen homaatuu hin argamne. Tarreeffamoota mirkanaa'an admin panel keessaa qabaachuu keessan mirkaneeffadhaa.",
    locationNotSpecified: "Bakki hin ibsamne",
    sqft: "sqft",
    daysAgo: "guyyaa dura",
    hoursAgo: "sa'aatii dura",
    justNow: "Amma",
    pricePrefix: "ETB",
    freeListings: "Tarreeffama Bilisaa"
  },
  ti: {
    heroTitle: "ናይ ሕልሚ ገዛኹም ርኸቡ",
    heroSubtitle: "ጽሬት ዘለዎም ናይ መነባብሮ ቦታታት",
    searchPlaceholder: "ናይ ሕልሚ ገዛኹም ድለዩ...",
    featuredProperties: "ዝተመረጹ ኣባይቲ",
    latestProperties: "ናይ ቀረባ ግዜ ኣባይቲ",
    propertiesFound: "{count} ኣባይቲ ተረኺቦም",
    noProperties: "ምንም ኣባይቲ ኣይተረኽቡን። ኣብ ኣድሚን ፓነል ዝጸደቁ ዝርዝራት ከምዘለኩም ኣረጋግጹ።",
    locationNotSpecified: "ቦታ አልተገለጸም",
    sqft: "ስኩዌር ጫማ",
    daysAgo: "መዓልታት ቅድሚ",
    hoursAgo: "ሰዓታት ቅድሚ",
    justNow: "ሕጂ",
    pricePrefix: "ብር",
    freeListings: "ነፃ ዝርዝራት",
    premiumHomes: "ፕሪሚየም ኣባይቲ",
    standardHomes: "መደበኛ ኣባይቲ"
  }
};

const HomesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();

  // Language Context
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [templateFields, setTemplateFields] = useState([]);

  // Access Control
  const { isListingLocked } = useListingAccess('homes');

  // Fetch Template Fields (Cached)
  useQuery(['homesTemplate'], async () => {
    try {
      const categories = await apiService.getCategories();
      const homesCat = categories.data?.categories?.find(c => c.slug === 'homes' || c.name === 'Homes');

      if (homesCat) {
        const templateData = await adminService.getTemplate(homesCat.id);
        if (templateData && templateData.steps) {
          const fields = templateData.steps.flatMap(s => s.fields || []);
          setTemplateFields(fields);
          return fields;
        }
      }
    } catch (err) {
      console.error('Error fetching homes template', err);
    }
    return [];
  }, {
    staleTime: 1000 * 60 * 60, // 1 hour for templates
    refetchOnWindowFocus: false
  });

  // Fetch Properties (Cached)
  const { data: properties = [], isLoading, error } = useQuery(
    ['homes', searchQuery],
    async () => {
      const params = {
        category: 'home', // Changed from 'homes' to 'home' to match standard singular slug
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

  return (
    <Box sx={{
      bgcolor: 'background.default',
      minHeight: '100vh',
      pb: isMobile ? 10 : 0
    }}>
      <SEO
        title={t.heroTitle}
        description={t.heroSubtitle}
        keywords="house for sale ethiopia, rent house addis ababa, real estate ethiopia, villas for sale, condominiums ethiopia, apartments addis ababa, ቤት ለሽያጭ ኢትዮጵያ, ቤት ለኪራይ አዲስ አበባ, ቪላ ለሽያጭ, ኮንዶሚኒየም ኢትዮጵያ, አፓርታማ አዲስ አበባ, የቤት ሽያጭ, ንብረት ኢትዮጵያ, real estate addis ababa, property ethiopia, የቤት ማስታወቂያ"
      />
      {/* Hero Section */}
      <Box sx={{
        height: { xs: 500, md: 600 },
        position: 'relative',
        backgroundImage: 'url(https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?q=80&w=1080)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent)',
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant={isMobile ? "h2" : "h1"}
              sx={{
                fontFamily: 'Playfair Display, serif',
                fontWeight: 700,
                mb: 1,
                color: theme.palette.secondary.main
              }}
            >
              {t.heroTitle}
            </Typography>
            <Typography
              variant={isMobile ? "h4" : "h3"}
              sx={{
                fontFamily: 'Playfair Display, serif',
                fontStyle: 'italic',
                mb: 3,
                opacity: 0.9
              }}
            >
              {t.heroSubtitle}
            </Typography>

            {/* Search Section */}
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <SmartSearch
                enableNavigation={true}
                category="homes"
                placeholder={t.searchPlaceholder}
              />
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Properties Grid */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t.propertiesFound.replace('{count}', properties.length)}
          </Typography>
        </Box>

        {isLoading ? (
          // Loading Skeletons
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Card sx={{ borderRadius: 4, height: 320 }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton width="60%" height={30} sx={{ mb: 1 }} />
                    <Skeleton width="40%" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          (() => {
            const premiumProperties = properties.filter(p => p.is_premium);
            const regularProperties = properties.filter(p => !p.is_premium);

            return (
              <>
                {/* --- PREMIUM HOMES SECTION --- */}
                <Box sx={{ mb: 6 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <WorkspacePremium sx={{ color: '#FFD700', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary' }}>
                      Premium Homes
                    </Typography>
                  </Stack>

                  {premiumProperties.length > 0 ? (
                    <Grid container spacing={{ xs: 2, md: 3 }}>
                      {premiumProperties.map((property) => (
                        <Grid item xs={12} md={6} key={property.id}>
                          <DynamicListingCard
                            listing={property}
                            templateFields={templateFields}
                            viewMode="grid"
                            isLocked={isListingLocked(property)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    /* Upsell Banner when no premium properties */
                    <PremiumUpsellBanner category="homes" />
                  )}
                </Box>

                {/* --- STANDARD HOMES SECTION --- */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <Bed sx={{ color: 'text.secondary', fontSize: 26 }} />
                  <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.secondary' }}>
                    {t.freeListings}
                  </Typography>
                </Stack>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  {regularProperties.length > 0 ? (
                    regularProperties.map((property) => (
                      <Grid item xs={12} md={6} key={property.id}>
                        <DynamicListingCard
                          listing={property}
                          templateFields={templateFields}
                          viewMode="grid"
                          isLocked={false}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                        {t.noProperties}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </>
            );
          })()
        )}
      </Container>
    </Box>
  );
};

export default HomesPage;
