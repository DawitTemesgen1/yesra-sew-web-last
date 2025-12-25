import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, Card, Chip,
  useTheme, useMediaQuery, Stack, Button, Alert, Skeleton, CardContent
} from '@mui/material';
import {
  Business, LocationOn, Work, WorkspacePremium
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import apiService from '../services/api';
import adminService from '../services/adminService';
import SmartSearch from '../components/SmartSearch';
import LiveActivityIndicators from '../components/LiveActivityIndicators';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import DynamicListingCard from '../components/DynamicListingCard';
import { useAuth } from '../context/AuthContext';
import useListingAccess from '../hooks/useListingAccess';
import PremiumUpsellBanner from '../components/PremiumUpsellBanner';

const translations = {
  en: {
    heroTitle: "Jobs",
    heroSubtitle: "Career Opportunities",
    heroDescription: "Find your dream job in Ethiopia's growing job market. Connect with top employers.",
    searchPlaceholder: "Search jobs...",
    freeListings: "Free Listings",
    filters: {
      all: "All Jobs",
      fullTime: "Full Time",
      partTime: "Part Time",
      remote: "Remote",
      internship: "Internship",
      contract: "Contract"
    },
    loadingError: "Failed to load jobs",
    justNow: "Just now",
    hoursAgo: "h ago",
    daysAgo: "d ago",
    unknownCompany: "Unknown Company",
    viewDetails: "View Details"
  },
  am: {
    heroTitle: "ስራዎች",
    heroSubtitle: "የስራ እድሎች",
    heroDescription: "በኢትዮጵያ እያደገ ባለው የስራ ገበያ ውስጥ የሕልምዎን ስራ ያግኙ። ከላቀ ቀጣሪዎች ጋር ይገናኙ።",
    searchPlaceholder: "ስራዎችን ይፈልጉ...",
    freeListings: "ነፃ ዝርዝሮች",
    filters: {
      all: "ሁሉም ስራዎች",
      fullTime: "ሙሉ ጊዜ",
      partTime: "የትርፍ ጊዜ",
      remote: "የርቀት",
      internship: "ልምምድ",
      contract: "ኮንትራት"
    },
    loadingError: "ስራዎችን መጫን አልተቻለም",
    justNow: "አሁን",
    hoursAgo: " ሰዓታት በፊት",
    daysAgo: " ቀናት በፊት",
    unknownCompany: "ያልታወቀ ኩባንያ",
    viewDetails: "ዝርዝሮችን ይመልከቱ"
  },
  om: {
    heroTitle: "Hojiiwwan",
    heroSubtitle: "Carraawwan Hojii",
    heroDescription: "Gabaa hojii Itoophiyaa guddachaa jiru keessatti hojii abjuu keessanii argadhaa. Qacartoota olaanoo waliin wal qunnamaa.",
    searchPlaceholder: "Hojiiwwan barbaadi...",
    freeListings: "Tarreeffama Bilisaa",
    filters: {
      all: "Hojiiwwan Hunda",
      fullTime: "Yeroo Guutuu",
      partTime: "Yeroo Gartokkee",
      remote: "Fagoo Irraa",
      internship: "Leenjii",
      contract: "Kontiraata"
    },
    loadingError: "Hojiiwwan fe'uu hin dandeenye",
    justNow: "Amma",
    hoursAgo: " sa'a dura",
    daysAgo: " guyyaa dura",
    unknownCompany: "Dhaabbata Hin Beekamne",
    viewDetails: "Bal'ina Ilaali"
  },
  ti: {
    heroTitle: "ስራሕቲ",
    heroSubtitle: "ናይ ስራሕ ዕድላት",
    heroDescription: "ኣብቲ እናዓበየ ዝኸይድ ዘሎ ዕዳጋ ስራሕ ኢትዮጵያ ናይ ሕልምኹም ስራሕ ርኸቡ። ምስ ላዕለዎት ኣሰርቲ ተራኸቡ።",
    searchPlaceholder: "ስራሕቲ ድለ...",
    freeListings: "ነፃ ዝርዝራት",
    filters: {
      all: "ኩሎም ስራሕቲ",
      fullTime: "ሙሉእ ግዜ",
      partTime: "ክፋል ግዜ",
      remote: "ርሕቀት",
      internship: "ልምምድ",
      contract: "ኮንትራት"
    },
    loadingError: "ስራሕቲ ምጽዓን ኣይተኻእለን",
    justNow: "ሕጂ",
    hoursAgo: " ሰዓታት ይገብር",
    daysAgo: " መዓልታት ይገብር",
    unknownCompany: "ዘይተፈልጠ ኩባንያ",
    viewDetails: "ዝርዝር ርኣይ"
  }
};

const JobsPage = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Jobs');

  // Check listing access for jobs category
  const { hasAccess, loading: accessLoading, isListingLocked } = useListingAccess('jobs');

  const defaultFilterOptions = [
    { value: 'All Jobs', label: t.filters.all },
    { value: 'Full Time', label: t.filters.fullTime },
    { value: 'Part Time', label: t.filters.partTime },
    { value: 'Remote', label: t.filters.remote },
    { value: 'Internship', label: t.filters.internship },
    { value: 'Contract', label: t.filters.contract }
  ];

  // Fetch Template Data (Fields & Filters)
  const { data: templateData } = useQuery(['jobsTemplate'], async () => {
    try {
      const allCats = await apiService.getCategories();
      const jobsCat = allCats.data?.categories?.find(c => c.slug === 'jobs' || c.name === 'Jobs');

      if (jobsCat) {
        const data = await adminService.getTemplate(jobsCat.id);
        if (data) {
          const fields = data.steps ? data.steps.flatMap(s => s.fields || []) : [];
          const filters = data.filters || { enabled: true, items: [] };
          return { fields, filters };
        }
      }
    } catch (err) {
      console.error('Error fetching jobs template', err);
    }
    return { fields: [], filters: { enabled: true, items: [] } };
  }, {
    staleTime: 1000 * 60 * 60, // 1 hour for templates
    cacheTime: 1000 * 60 * 120, // Keep in cache for 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const templateFields = templateData?.fields || [];
  const validDynamicFilters = templateData?.filters?.enabled && templateData?.filters?.items?.length > 0
    ? [{ label: t.filters.all, value: 'All Jobs' }, ...templateData.filters.items]
    : null;

  // Use dynamic filters if available, otherwise default
  const filterOptions = validDynamicFilters || defaultFilterOptions;

  // Fetch Jobs (Cached)
  const { data: jobs = [], isLoading, error } = useQuery(
    ['jobs', selectedFilter, searchQuery],
    async () => {
      const params = {
        category: 'jobs', // Reverted to plural 'jobs' to match database slug
        type: selectedFilter !== 'All Jobs' ? selectedFilter : undefined,
        search: searchQuery || undefined
      };
      const response = await apiService.getListings(params);
      return response.listings || response || [];
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
      keepPreviousData: true,
      refetchOnMount: false, // Don't refetch when component mounts if data exists
      refetchOnWindowFocus: false // Don't refetch when window regains focus
    }
  );

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
        keywords="jobs in ethiopia, vacancies addis ababa, ngo jobs ethiopia, accounting jobs, driver jobs, employment ethiopia, career opportunities, ስራ ኢትዮጵያ, የስራ ማስታወቂያ, ብዶ ስራ ኢትዮጵያ, የሐሳብ ስራ, የአድራሽ ስራ, ስራ አዲስ አበባ, jobs addis ababa, የስራ እድል, employment addis ababa, የስራ አደራት"
      />
      {/* Hero Section */}
      <Box sx={{
        height: isMobile ? 600 : 650,
        position: 'relative',
        backgroundImage: 'url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1080)',
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
                category="jobs"
                placeholder={t.searchPlaceholder}
              />
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Filter Chips */}
      <Box sx={{ bgcolor: 'background.default', pt: 3, pb: 1 }}>
        <Box sx={{
          overflowX: 'auto',
          px: 3,
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          <Stack direction="row" spacing={1.25} sx={{ minWidth: 'max-content' }}>
            {filterOptions.map((filter) => {
              const isSelected = selectedFilter === filter.value;
              return (
                <Chip
                  key={filter.value}
                  label={filter.label}
                  onClick={() => setSelectedFilter(filter.value)}
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
      </Box>

      {/* Jobs Grid */}
      <Container maxWidth="lg" sx={{ py: 3, minHeight: 500 }}>
        {isLoading ? (
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} key={i}>
                <Card sx={{ borderRadius: 3, height: 140, display: 'flex', border: 'none', boxShadow: 'none', bgcolor: 'transparent' }}>
                  <Skeleton variant="rectangular" width={140} height={140} sx={{ borderRadius: 3 }} />
                  <Box sx={{ p: 2, flex: 1 }}>
                    <Skeleton width="60%" height={30} sx={{ mb: 1 }} />
                    <Skeleton width="40%" height={20} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          (() => {
            const premiumJobs = jobs.filter(job => job.is_premium);
            const regularJobs = jobs.filter(job => !job.is_premium);

            return (
              <>
                {/* --- PREMIUM JOBS SECTION --- */}
                <Box sx={{ mb: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <WorkspacePremium sx={{ color: '#FFD700', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary' }}>
                      Premium Jobs
                    </Typography>
                  </Stack>

                  {premiumJobs.length > 0 ? (
                    <Grid container spacing={3} component={motion.div} initial="hidden" animate="visible" variants={{
                      visible: { transition: { staggerChildren: 0.1 } }
                    }}>
                      {premiumJobs.map((job) => (
                        <Grid item xs={12} md={6} lg={4} key={job.id} component={motion.div} variants={{
                          hidden: { opacity: 0, y: 30 },
                          visible: { opacity: 1, y: 0 }
                        }}>
                          <DynamicListingCard
                            listing={job}
                            templateFields={templateFields}
                            viewMode="grid"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <PremiumUpsellBanner category="jobs" />
                  )}
                </Box>

                {/* --- STANDARD JOBS SECTION --- */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, mt: 4 }}>
                    <Work sx={{ color: 'text.secondary', fontSize: 26 }} />
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.secondary' }}>
                      {t.freeListings}
                    </Typography>
                  </Stack>

                  <Grid container spacing={3}>
                    {regularJobs.length > 0 ? (
                      regularJobs.map((job) => (
                        <Grid item xs={12} md={6} lg={4} key={job.id}>
                          <DynamicListingCard
                            listing={job}
                            templateFields={templateFields}
                            viewMode="grid"
                          />
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                          {t.noJobs}
                        </Typography>
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

export default JobsPage;
