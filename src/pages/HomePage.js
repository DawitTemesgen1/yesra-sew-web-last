import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent,
  Button, useTheme, useMediaQuery,
  Stack, CircularProgress
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import {
  Search, Work, Gavel, Apartment, DirectionsCar,
  LocationOn, VerifiedUser, Security, AutoAwesome,
  ArrowForward, WorkspacePremium
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../context/AuthContext';
import SmartSearch from '../components/SmartSearch';
import apiService from '../services/api';
import adminService from '../services/adminService';
import SEO from '../components/SEO';
import DynamicListingCard from '../components/DynamicListingCard';
import useListingAccess from '../hooks/useListingAccess';

const translations = {
  en: {
    landing: {
      hero: {
        title: "Ethiopia's Premier Marketplace",
        subtitle: "Find Your Next Opportunity",
        description: "Jobs, Tenders, Homes & Cars",
        getStarted: "Get Started",
        browseListings: "The Gateway to Ethiopian Modern Marketplace"
      },
      features: {
        title: "Our Promise",
        feature1: {
          title: "Verified Quality",
          description: "Every listing is verified by our team to ensure the highest quality standards."
        },
        feature2: {
          title: "Secure Transactions",
          description: "We provide a secure environment for all your business transactions."
        },
        feature3: {
          title: "Premium Experience",
          description: "Enjoy a seamless and premium user experience tailored for you."
        }
      },
      categories: {
        title: "Popular Categories",
        homes: "Homes",
        cars: "Cars",
        jobs: "Jobs",
        tenders: "Tenders"
      },
      stats: {
        title: "Market Insights",
        description: "Stay updated with the latest trends in the Ethiopian market",
        jobs: "Job Opportunities",
        jobsDesc: "Active Listings",
        properties: "Properties",
        propertiesDesc: "Available Properties",
        cars: "Cars",
        carsDesc: "Available Cars"
      }
    },
    listings: {
      recentlyAdded: "Recently Added",
      premiumProperties: "Premium Properties",
      viewAll: "View All"
    },
    common: {
      search: "What are you looking for?"
    },
    keywords: "ethiopia marketplace, buy sell ethiopia, jobs ethiopia, tenders ethiopia, cars ethiopia, real estate ethiopia, classifieds addis ababa"
  },
  am: {
    landing: {
      hero: {
        title: "የኢትዮጵያ ቀዳሚ የገበያ ቦታ",
        subtitle: "ቀጣዩን እድልዎን ያግኙ",
        description: "ስራዎች፣ ጨረታዎች፣ ቤቶች እና መኪናዎች",
        getStarted: "ይጀምሩ",
        browseListings: "ወደ ኢትዮጵያ ዘመናዊ የገበያ ቦታ መግቢያ"
      },
      features: {
        title: "የኛ ቃል ኪዳን",
        feature1: {
          title: "የተረጋገጠ ጥራት",
          description: "ከፍተኛ የጥራት ደረጃዎችን ለማረጋገጥ እያንዳንዱ ዝርዝር በቡድናችን የተረጋገጠ ነው።"
        },
        feature2: {
          title: "ደህንነቱ የተጠበቀ ግብይቶች",
          description: "ለሁሉም የንግድ ልውውጦችዎ ደህንነቱ የተጠበቀ አካባቢን እናቀርባለን።"
        },
        feature3: {
          title: "ፕሪሚየም ልምድ",
          description: "ለእርስዎ የተዘጋጀ እንከን የለሽ እና ፕሪሚየም የተጠቃሚ ተሞክሮ ይደሰቱ።"
        }
      },
      categories: {
        title: "ታዋቂ ምድቦች",
        homes: "ቤቶች",
        cars: "መኪናዎች",
        jobs: "ስራዎች",
        tenders: "ጨረታዎች"
      },
      stats: {
        title: "የገበያ ግንዛቤዎች",
        description: "በኢትዮጵያ ገበያ ውስጥ ካሉ አዳዲስ አዝማሚያዎች ጋር እንደተዘመኑ ይቆዩ",
        jobs: "የስራ እድሎች",
        jobsDesc: "ንቁ ዝርዝሮች",
        properties: "ንብረቶች",
        propertiesDesc: "ያሉ ንብረቶች",
        cars: "መኪናዎች",
        carsDesc: "ያሉ መኪናዎች"
      }
    },
    listings: {
      recentlyAdded: "በቅርብ ጊዜ የተጨመሩ",
      premiumProperties: "ፕሪሚየም ንብረቶች",
      viewAll: "ሁሉንም ይመልከቱ"
    },
    common: {
      search: "ምን እየፈለጉ ነው?"
    },
    keywords: "የኢትዮጵያ ገበያ, ስራ ኢትዮጵያ, መኪና ኢትዮጵያ, ቤት ኢትዮጵያ, ጨረታ ኢትዮጵያ, አዲስ አበባ ገበያ, የስራ ማስታወቂያ, የመኪና ሽያጭ"
  },
  om: {
    landing: {
      hero: {
        title: "Gabaa Guddicha Itoophiyaa",
        subtitle: "Carraa Itti Aanu Keessan Argadhaa",
        description: "Hojiiwwan, Caalbaasiiwwan, Manneen & Konkolaattota",
        getStarted: "Jalqabi",
        browseListings: "Karra Gabaa Itiyoophiyaa Ammayyaatiif"
      },
      features: {
        title: "Waadaa Keenya",
        feature1: {
          title: "Qulqullina Mirkanaa'e",
          description: "Tarreen hundi sadarkaa qulqullina olaanaa eegamuusaa mirkaneessuuf garee keenyaan mirkanaa’a."
        },
        feature2: {
          title: "Jijjiirraa Nagaa",
          description: "Jijjiirraa daldalaa keessan hundaaf naannoo nagaa qabu isiniif mijeessina."
        },
        feature3: {
          title: "Muuxannoo Addaa",
          description: "Muuxannoo fayyadamaa addaa fi ciminnaa hin qabne kan isiniif qophaa’e gammadaa."
        }
      },
      categories: {
        title: "Gareewwan Bebbeekamoo",
        homes: "Manneen",
        cars: "Konkolaattota",
        jobs: "Hojiiwwan",
        tenders: "Caalbaasiiwwan"
      },
      stats: {
        title: "Hubannoo Gabaa",
        description: "Gabaa Itoophiyaa keessatti sadarkaa haaraa jiruun of haaressaa",
        jobs: "Carraawwan Hojii",
        jobsDesc: "Galmee Hojirra Jiran",
        properties: "Qabeenyawwan",
        propertiesDesc: "Qabeenya Argaman",
        cars: "Konkolaattota",
        carsDesc: "Konkolaattota Argaman"
      }
    },
    listings: {
      recentlyAdded: "Dhiheenyatti Kan Dabalaman",
      premiumProperties: "Qabeenyawwan Addaa",
      viewAll: "Hunda Ilaali"
    },
    common: {
      search: "Maal Barbaadaa Jirtu?"
    },
    keywords: "gabaa ethiopia, hojii ethiopia, konkolaataa gurguraaf, mana gurguraaf, caalbaasii, addis ababa marketplace"
  },
  ti: {
    landing: {
      hero: {
        title: "ቀዳማይ ዕዳጋ ኢትዮጵያ",
        subtitle: "ቀጻሊ ዕድልካ ረኸብ",
        description: "ስራሕ፣ ጨረታ፣ ኣባይቲ እና መካይን",
        getStarted: "ጀምር",
        browseListings: "ናብ ዘመናዊ ዕዳጋ ኢትዮጵያ መእተዊ"
      },
      features: {
        title: "መብጽዓና",
        feature1: {
          title: "ዝተረጋገጸ ጽሬት",
          description: "ነፍሲ ወከፍ ዝርዝር ዝለዓለ ደረጃ ጽሬት ንምርግጋጽ ብጋንታና ይረጋገጽ።"
        },
        feature2: {
          title: "ውሑስ ዝውውር",
          description: "ንኹሉ ናይ ንግዲ ዝውውርኩም ውሑስ ከባቢ ነዳሉ።"
        },
        feature3: {
          title: "ፍሉይ ተሞክሮ",
          description: "ንኣኻ ዝተዳለወ ፍጹም ዝኾነን ብሉጽን ተሞክሮ ተጠቃሚ ተዘናግዕ።"
        }
      },
      categories: {
        title: "ፍሉጣት ምድባት",
        homes: "ኣባይቲ",
        cars: "መካይን",
        jobs: "ስራሕ",
        tenders: "ጨረታ"
      },
      stats: {
        title: "ናይ ዕዳጋ ርእይቶታት",
        description: "ኣብ ዕዳጋ ኢትዮጵያ ብዛዕባ ዘሎ ሓድሽ ዝንባለታት እዋናዊ ሓበሬታ ጌርካ ጽናሕ",
        jobs: "ናይ ስራሕ ዕድላት",
        jobsDesc: "ንቑሓት ዝርዝራት",
        properties: "ንብረት",
        propertiesDesc: "ዝርከቡ ንብረት",
        cars: "መካይን",
        carsDesc: "ዝርከባ መካይን"
      }
    },
    listings: {
      recentlyAdded: "ኣብ ቀረባ እዋን ዝተወሰኸ",
      premiumProperties: "ፍሉይ ንብረት",
      viewAll: "ኩሉ ርአ"
    },
    common: {
      search: "እንታይ ትደሊ ኣለኻ?"
    },
    keywords: "ዕዳጋ ኢትዮጵያ, ስራሕ ኢትዮጵያ, መኪና ኢትዮጵያ, ገዛ ኢትዮጵያ, ጨረታ ኢትዮጵያ, ኣዲስ ኣበባ ዕዳጋ"
  }
};

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const { user } = useAuth();

  // Access Control for mixed content (Home Page)
  // We don't pass a specific category slug, so it defaults to generic checks combined with dynamic item category check
  const { isListingLocked } = useListingAccess();
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = async (listingId) => {
    try {
      await apiService.toggleFavorite(listingId);
      setFavorites(prev =>
        prev.includes(listingId)
          ? prev.filter(id => id !== listingId)
          : [...prev, listingId]
      );
      toast.success(favorites.includes(listingId) ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  // Static Categories
  // Static Categories
  const categories = [
    {
      id: 1,
      name: t.landing.categories.jobs,
      icon: <Work fontSize="large" />,
      key: 'jobs',
      bgImage: "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop')"
    },
    {
      id: 2,
      name: t.landing.categories.homes,
      icon: <Apartment fontSize="large" />,
      key: 'homes',
      bgImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop')"
    },
    {
      id: 3,
      name: t.landing.categories.cars,
      icon: <DirectionsCar fontSize="large" />,
      key: 'cars',
      bgImage: "url('https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop')"
    },
    {
      id: 4,
      name: t.landing.categories.tenders,
      icon: <Gavel fontSize="large" />,
      key: 'tenders',
      bgImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop')"
    }
  ];

  // Fetch Featured Listings (Recently Added - All Categories)
  const { data: featuredListings = [], isLoading: recentLoading, isPreviousData: isRecentPreviousData } = useQuery(
    ['featuredListings', language],
    async () => {
      try {
        // Fetch general listings (mixed categories)
        const response = await apiService.getListings({ limit: 8, sort: 'newest' });
        return response.listings || response || [];
      } catch (e) {
        console.error('Failed to fetch featured listings', e);
        // Important: Throw error to trigger retry strategy instead of silent failure
        throw e;
      }
    },
    {
      staleTime: 1000 * 60 * 5,
      keepPreviousData: true,
      retry: 2,
      refetchOnWindowFocus: false, // Prevent jarring refetch flashes
      onError: () => toast.error("Could not load latest listings")
    }
  );

  // Fetch Premium Listings (All Categories)
  const { data: premiumListings = [], isLoading: premiumLoading, isPreviousData: isPremiumPreviousData } = useQuery(
    ['premiumListings', language],
    async () => {
      try {
        // Fetch premium listings - limit requested is 10
        const response = await apiService.getListings({ is_premium: true, limit: 15 });
        const items = response.listings || response || [];

        // Strict Client-Side Filter: Only allow truly premium items in this section
        return items.filter(listing => listing.is_premium === true);
      } catch (err) {
        console.error("Error fetching premium listings:", err);
        throw err;
      }
    },
    {
      staleTime: 1000 * 60 * 5,
      keepPreviousData: true,
      retry: 2,
      refetchOnWindowFocus: false,
      // If error, we might want to fail silently or visually handle it, effectively returning empty is fine after retries
      onError: () => { }
    }
  );


  // Fetch Real Market Stats (Counts)
  const { data: marketStats = { jobs: 0, homes: 0, cars: 0 }, isLoading: statsLoading } = useQuery(
    'marketStats',
    async () => {
      return await apiService.getMarketStats();
    },
    { staleTime: 1000 * 60 * 15 } // Cache for 15 minutes
  );


  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <SEO
        title={t.landing.hero.subtitle}
        description={t.landing.hero.description}
        keywords={t.keywords}
      />

      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        minHeight: { xs: 650, md: 800 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: 'white',
      }}>
        {/* Modern Abstract Business Background */}
        <Box
          component={motion.div}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop)', // Modern Skyscrapers / Business Abstract
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />

        {/* Sophisticated Gradient Overlay */}
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(105deg, rgba(0, 10, 5, 0.95) 0%, rgba(0, 50, 25, 0.85) 50%, rgba(0, 0, 0, 0.4) 100%)', // Deep Green/Black Gradient
          zIndex: 1
        }} />

        {/* Abstract Geometric Accents */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(0, 166, 81, 0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 1,
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -150,
          right: -100,
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: 1,
        }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container alignItems="center" spacing={4}>
            {/* Left Content (Text & Search) */}
            <Grid item xs={12} md={8} lg={7}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Brand Badge */}
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2, py: 0.8,
                  mb: 4,
                  borderRadius: 50,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <VerifiedUser sx={{ fontSize: 16, color: '#00A651' }} />
                  <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600, letterSpacing: 1.2 }}>
                    TRUSTED BY 10,000+ USERS
                  </Typography>
                </Box>

                <Typography variant={isMobile ? "h3" : "h1"} sx={{
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  mb: 3,
                  background: 'linear-gradient(45deg, #FFFFFF 30%, #4caf50 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}>
                  {t.landing.hero.title}
                </Typography>

                <Typography variant="h5" sx={{
                  fontWeight: 300,
                  color: 'rgba(255, 255, 255, 0.85)',
                  mb: 6,
                  maxWidth: 600,
                  fontSize: { xs: '1.1rem', md: '1.35rem' },
                  lineHeight: 1.6
                }}>
                  {t.landing.hero.subtitle}
                </Typography>

                {/* Search Bar - Modern Card Style */}
                <Box sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  p: 1,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  mb: 5,
                  maxWidth: 700
                }}>
                  <SmartSearch
                    enableNavigation={true}
                    category="all"
                    placeholder={t.common.search}
                  />
                </Box>

                {/* Stats / Trust Indicators */}
                <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
                  {[
                    { label: 'Active Listings', value: '5,000+' },
                    { label: 'Weekly Visits', value: '12k' },
                    { label: 'Categories', value: '4 Major' },
                  ].map((stat, i) => (
                    <Box key={i}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#00A651' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.6)">
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </motion.div>
            </Grid>

            {/* Right Content (Floating Cards / Visuals - Hidden on Mobile for clean look) */}
            <Grid item xs={12} mid={4} lg={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                style={{ position: 'relative', height: 400 }}
              >
                {/* Floating Glass Cards representing categories */}
                <GlassCard
                  icon={<Work sx={{ color: '#fff' }} />}
                  title="Dream Jobs"
                  subtitle="Find your career"
                  top={20} right={80}
                  delay={0.5}
                />
                <GlassCard
                  icon={<Apartment sx={{ color: '#fff' }} />}
                  title="Modern Homes"
                  subtitle="Rent or Buy"
                  top={140} left={40}
                  delay={0.7}
                />
                <GlassCard
                  icon={<DirectionsCar sx={{ color: '#fff' }} />}
                  title="Vehicles"
                  subtitle="Best deals"
                  bottom={40} right={120}
                  delay={0.9}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Popular Categories */}
      {/* Popular Categories */}
      <Container maxWidth="lg" sx={{ py: 6, minHeight: 400 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
            {t.landing.categories.title}
          </Typography>
        </Box>

        <Grid container spacing={3} component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {categories.map((cat, i) => (
            <Grid item xs={6} md={3} key={cat.id}>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }
                }}
              >
                <Card
                  onClick={() => navigate(`/${cat.key}`)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 4,
                    height: 200,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  <Box sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: cat.bgImage,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'transform 0.5s',
                    '&:hover': { transform: 'scale(1.1)' }
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Box sx={{
                      color: '#FFD700',
                      mb: 1,
                      p: 1.5,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(4px)'
                    }}>
                      {cat.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {cat.name}
                    </Typography>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>


      {/* PREMIUM PROPERTIES (LOCKED) */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span role="img" aria-label="sparkles">✨</span> {t.listings.premiumProperties}
          </Typography>
          <Button endIcon={<ArrowForward />} color="primary" onClick={() => navigate('/listings?premium=true')}>{t.listings.viewAll}</Button>
        </Box>

        {premiumLoading ? (
          <Box sx={{ display: 'flex', overflowX: 'auto', pb: 2, gap: 3, '&::-webkit-scrollbar': { display: 'none' } }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ minWidth: 320, maxWidth: 320 }}>
                <Card sx={{ borderRadius: 4, height: 380 }}>
                  <Skeleton variant="rectangular" height={220} />
                  <CardContent>
                    <Skeleton width="80%" height={30} sx={{ mb: 1 }} />
                    <Skeleton width="40%" height={20} />
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          <>
            {/* Show Banner if no premium listings (and fallback) */}
            {premiumListings.length === 0 ? (
              <Card sx={{
                p: 4,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #004d40 0%, #00695c 100%)',
                color: 'white',
                borderRadius: 4
              }}>
                <WorkspacePremium sx={{ fontSize: 48, color: '#FFD700', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Unlock Exclusive Premium Properties
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                  Get exclusive access to high-end real estate listings.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/pricing')}
                  sx={{
                    bgcolor: '#FFD700',
                    color: 'black',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#FFC107' }
                  }}
                >
                  View Membership Plans
                </Button>
              </Card>
            ) : (
              <Box sx={{
                display: 'flex',
                overflowX: 'auto',
                pb: 2,
                gap: 3,
                '&::-webkit-scrollbar': { display: 'none' }
              }}>
                {premiumListings.map((listing, i) => (
                  <Box key={listing.id} sx={{ minWidth: 320, maxWidth: 320 }}>
                    <DynamicListingCard
                      listing={listing}
                      viewMode="grid"
                      // isLocked prop removed to allow DynamicListingCard to self-manage access via useListingAccess
                      onToggleFavorite={toggleFavorite}
                      isFavorite={favorites.includes(listing.id) || listing.is_favorited}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </Container >


      {/* Latest Posts (Regular) */}
      <Container maxWidth="lg" sx={{ py: 6, minHeight: 400 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
            {t.listings.recentlyAdded}
          </Typography>
          <Button endIcon={<ArrowForward />} color="primary" onClick={() => navigate('/listings')}>{t.listings.viewAll}</Button>
        </Box>

        {recentLoading ? (
          <Box sx={{ display: 'flex', overflowX: 'auto', pb: 2, gap: 3, '&::-webkit-scrollbar': { display: 'none' } }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ minWidth: 280, maxWidth: 280 }}>
                <Card sx={{ borderRadius: 4, height: 320, border: 'none', boxShadow: 'none', bgcolor: 'transparent' }}>
                  <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 4 }} />
                  <Box sx={{ pt: 1 }}>
                    <Skeleton width="80%" height={28} sx={{ mb: 1 }} />
                    <Skeleton width="60%" height={20} />
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{
            display: 'flex',
            overflowX: 'auto',
            pb: 2,
            gap: 3,
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}>
            {featuredListings.slice(0, 4).map((listing, i) => (
              <Box key={listing.id} sx={{ minWidth: 280, maxWidth: 280 }}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <DynamicListingCard
                    listing={listing}
                    viewMode="grid"
                    onToggleFavorite={toggleFavorite}
                    isFavorite={favorites.includes(listing.id) || listing.is_favorited}
                  />
                </motion.div>
              </Box>
            ))}
          </Box>
        )}
      </Container >

      {/* Why Choose Us */}
      <Box sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" textAlign="center" mb={6}>
            {t.landing.features.title}
          </Typography>

          <Grid container spacing={4}>
            <BenefitItem
              icon={<VerifiedUser sx={{ fontSize: 40, color: 'primary.main' }} />}
              title={t.landing.features.feature1.title}
              desc={t.landing.features.feature1.description}
            />
            <BenefitItem
              icon={<Security sx={{ fontSize: 40, color: 'primary.main' }} />}
              title={t.landing.features.feature2.title}
              desc={t.landing.features.feature2.description}
            />
            <BenefitItem
              icon={<AutoAwesome sx={{ fontSize: 40, color: 'primary.main' }} />}
              title={t.landing.features.feature3.title}
              desc={t.landing.features.feature3.description}
            />
          </Grid>
        </Container>
      </Box >

      {/* Market Insights */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" textAlign="center" mb={2}>
            {t.landing.stats.title}
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" mb={6}>
            {t.landing.stats.description}
          </Typography>

          <Grid container spacing={4}>
            <InsightItem
              title={t.landing.stats.jobs}
              value={statsLoading ? '-' : (marketStats.jobs > 50 ? marketStats.jobs + '+' : marketStats.jobs)}
              desc={t.landing.stats.jobsDesc}
              color="success.main"
            />
            <InsightItem
              title={t.landing.stats.properties}
              value={statsLoading ? '-' : (marketStats.homes > 50 ? marketStats.homes + '+' : marketStats.homes)}
              desc={t.landing.stats.propertiesDesc}
              color="info.main"
            />
            <InsightItem
              title={t.landing.stats.cars}
              value={statsLoading ? '-' : (marketStats.cars > 50 ? marketStats.cars + '+' : marketStats.cars)}
              desc={t.landing.stats.carsDesc}
              color="warning.main"
            />
          </Grid>
        </Container>
      </Box >
    </Box >
  );
};

// --- Child Components ---



const BenefitItem = ({ icon, title, desc }) => (
  <Grid item xs={12} md={4}>
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Box sx={{ mb: 2 }}>{icon}</Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>{title}</Typography>
      <Typography color="text.secondary">{desc}</Typography>
    </Box>
  </Grid>
);

const InsightItem = ({ title, value, desc, color }) => (
  <Grid item xs={12} md={4}>
    <Card sx={{ textAlign: 'center', p: 4, borderRadius: 4, borderTop: `4px solid`, borderColor: color }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>{title}</Typography>
      <Typography variant="h3" fontWeight="bold" sx={{ color: color, my: 1 }}>{value}</Typography>
      <Typography variant="body1" fontWeight="medium">{desc}</Typography>
    </Card>
  </Grid>
);

const GlassCard = ({ icon, title, subtitle, top, left, right, bottom, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: delay, type: "spring" }}
    style={{ position: 'absolute', top, left, right, bottom, zIndex: 10 }}
  >
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 2,
      borderRadius: 4,
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      minWidth: 200,
    }}>
      <Box sx={{
        p: 1.5,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00A651 0%, #00d26a 100%)',
        boxShadow: '0 4px 12px rgba(0, 166, 81, 0.3)',
        display: 'flex'
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body1" fontWeight="bold" color="white" sx={{ lineHeight: 1.2 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="rgba(255,255,255,0.7)">
          {subtitle}
        </Typography>
      </Box>
    </Box>
  </motion.div>
);

export default HomePage;