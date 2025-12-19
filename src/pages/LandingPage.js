import React, { useEffect } from 'react';
import {
    Box, Container, Typography, Button, Grid, Card, CardContent,
    Paper, useTheme, alpha
} from '@mui/material';
import {
    Home, DirectionsCar, Work, Assignment, TrendingUp,
    CheckCircle, Security, Category, People, Verified
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

const translations = {
    en: {
        hero: {
            title: "Ethiopia's Premier Marketplace",
            subtitle: "Buy, Sell, and Discover Everything You Need",
            description: "Join thousands of Ethiopians finding jobs, homes, cars, and tenders on Yesra Sew Solution - Your trusted technology and career platform",
            getStarted: "Get Started",
            learnMore: "Learn More",
            browseListings: "Browse Listings"
        },
        features: {
            title: "Why Choose Yesra Sew Solution?",
            subtitle: "The best platform for buying and selling in Ethiopia",
            feature1: {
                title: "Verified Listings",
                description: "All listings are verified to ensure quality and authenticity"
            },
            feature2: {
                title: "Secure Transactions",
                description: "Your safety is our priority with secure payment options"
            },
            feature3: {
                title: "Wide Selection",
                description: "Find everything from homes to cars, jobs to services"
            },
            feature4: {
                title: "Easy to Use",
                description: "Simple and intuitive interface for seamless experience"
            }
        },
        categories: {
            title: "Browse by Category",
            subtitle: "Find what you're looking for",
            homes: "Homes & Real Estate",
            cars: "Cars & Vehicles",
            jobs: "Jobs & Careers",
            tenders: "Tenders & Contracts",
            viewAll: "View All Categories"
        },
        stats: {
            activeUsers: "Active Users",
            listings: "Total Listings",
            categories: "Categories",
            cities: "Cities Covered"
        },
        cta: {
            title: "Ready to Get Started?",
            subtitle: "Join thousands of satisfied users on Yesra Sew Solution",
            postAd: "Post Your Ad",
            signUpNow: "Sign Up Now"
        }
    },
    am: {
        hero: {
            title: "የኢትዮጵያ ዋና የገበያ ቦታ",
            subtitle: "ግዙ፣ ሽጡ እና የሚፈልጉትን ሁሉ ያግኙ",
            description: "በየስራሰው ላይ ቤቶችን፣ መኪናዎችን፣ ስራዎችን እና ሌሎችንም የሚገዙ እና የሚሸጡ በሺዎች የሚቆጠሩ ኢትዮጵያውያን ይቀላቀሉ - የእርስዎ የታመነ የገበያ ቦታ",
            getStarted: "ጀምር",
            learnMore: "ተጨማሪ ይወቁ",
            browseListings: "ዝርዝሮችን አስሱ"
        },
        features: {
            title: "ለምን የስራሰውን ይመርጣሉ?",
            subtitle: "በኢትዮጵያ ውስጥ ለመግዛት እና ለመሸጥ ምርጡ መድረክ",
            feature1: {
                title: "የተረጋገጡ ዝርዝሮች",
                description: "ሁሉም ዝርዝሮች ጥራት እና ትክክለኛነትን ለማረጋገጥ ተረጋግጠዋል"
            },
            feature2: {
                title: "ደህንነቱ የተጠበቀ ግብይት",
                description: "ደህንነትዎ ቅድሚያችን ነው ደህንነቱ በተጠበቀ የክፍያ አማራጮች"
            },
            feature3: {
                title: "ሰፊ ምርጫ",
                description: "ከቤቶች እስከ መኪናዎች፣ ከስራዎች እስከ አገልግሎቶች ሁሉንም ያግኙ"
            },
            feature4: {
                title: "ለመጠቀም ቀላል",
                description: "ለቀላል ተሞክሮ ቀላል እና ግልጽ በይነገጽ"
            }
        },
        categories: {
            title: "በምድብ አስስ",
            subtitle: "የሚፈልጉትን ያግኙ",
            homes: "ቤቶች እና ሪል እስቴት",
            cars: "መኪናዎች እና ተሽከርካሪዎች",
            jobs: "ስራዎች እና ሙያዎች",
            tenders: "ጨረታዎች እና ኮንትራቶች",
            viewAll: "ሁሉንም ምድቦች ይመልከቱ"
        },
        stats: {
            activeUsers: "ንቁ ተጠቃሚዎች",
            listings: "ጠቅላላ ዝርዝሮች",
            categories: "ምድቦች",
            cities: "የተሸፈኑ ከተሞች"
        },
        cta: {
            title: "ለመጀመር ዝግጁ ነዎት?",
            subtitle: "በየስራሰው ላይ በሺዎች የሚቆጠሩ እርካታ ያላቸውን ተጠቃሚዎች ይቀላቀሉ",
            postAd: "ማስታወቂያዎን ያስቀምጡ",
            signUpNow: "አሁን ይመዝገቡ"
        }
    },
    om: {
        hero: {
            title: "Gabaa Guddaa Itoophiyaa",
            subtitle: "Bitaa, Gurguraa fi Waan Barbaaddan Hunda Argadhaa",
            description: "Yesra Sew Solution irratti hojiiwwan, manneen, konkolaatota fi caalbaasiiwwan argachuuf Itoophiyoota kumaatamaan waliin makamaa - Waltajjii teeknooloojii fi hojii amanamaa keessan",
            getStarted: "Jalqabi",
            learnMore: "Dabalataan Baraa",
            browseListings: "Tarreewwan Sakatta'aa"
        },
        features: {
            title: "Maaliif Yesra Sew Solution Filattan?",
            subtitle: "Itoophiyaa keessatti bituuf fi gurguratuuf waltajjii gaarii",
            feature1: {
                title: "Tarreewwan Mirkaneeffaman",
                description: "Tarreewwan hundi qulqullina fi dhugummaa mirkaneessuuf mirkaneeffamaniiru"
            },
            feature2: {
                title: "Daldala Nageenya Qabu",
                description: "Nageenya keessan dursa keenyaati filannoo kaffaltii nageenya qabuun"
            },
            feature3: {
                title: "Filannoo Bal'aa",
                description: "Manneen hanga konkolaatotatti, hojiiwwan hanga tajaajilootti hunda argadhaa"
            },
            feature4: {
                title: "Fayyadamuuf Salphaa",
                description: "Muuxannoo salphaa ta'eef walqunnamtii salphaa fi ifa ta'e"
            }
        },
        categories: {
            title: "Ramaddii Sakatta'aa",
            subtitle: "Waan barbaaddan argadhaa",
            homes: "Manneen fi Qabeenya Dhuunfaa",
            cars: "Konkolaatotaa fi Konkolaatota",
            jobs: "Hojiiwwan fi Ogummaa",
            tenders: "Tenderootaa fi Waliigaltee",
            viewAll: "Ramaddii Hunda Ilaali"
        },
        stats: {
            activeUsers: "Fayyadamtoota Sochii",
            listings: "Tarreewwan Waliigalaa",
            categories: "Ramaddii",
            cities: "Magaalota Haguugaman"
        },
        cta: {
            title: "Jalqabuuf Qophii Dha?",
            subtitle: "Yesra Sew Solution irratti fayyadamtoota gammadan kumaatamaan waliin makamaa",
            postAd: "Beeksisa Keessan Maxxansaa",
            signUpNow: "Amma Galmaa'aa"
        }
    },
    ti: {
        hero: {
            title: "ናይ ኢትዮጵያ ቀዳማይ ገበያ",
            subtitle: "ግዛእ፣ ሽየጥ፣ ከምኡውን ዝደልይዎ ኩሉ ርከብ",
            description: "ኣብ የስራሰው ገዛውቲ፣ መካይን፣ ስራሕቲ፣ ከምኡውን ካልእ ዝገዝኡን ዝሸይጡን ብኣሽሓት ዝቑጸሩ ኢትዮጵያውያን ተጸምበሩ - እቲ ዝእመነሉ ገበያኹም",
            getStarted: "ጀምር",
            learnMore: "ተወሳኺ ፍለጥ",
            browseListings: "ዝርዝራት ርአይ"
        },
        features: {
            title: "ስለምንታይ የስራሰው ትመርጹ?",
            subtitle: "ኣብ ኢትዮጵያ ንምግዛእን ንምሽያጥን እቲ ዝበለጸ መድረኽ",
            feature1: {
                title: "ዝተረጋገጹ ዝርዝራት",
                description: "ኩሎም ዝርዝራት ጽሬትን ትክክለኛነትን ንምርግጋጽ ተረጋጊጾም"
            },
            feature2: {
                title: "ውሕስነት ዘለዎ ግብይት",
                description: "ውሕስነትኩም ቀዳምነትና እዩ ብውሕስነት ዘለዎ ናይ ክፍሊት ኣማራጺታት"
            },
            feature3: {
                title: "ሰፊሕ ምርጫ",
                description: "ካብ ገዛውቲ ክሳዕ መካይን፣ ካብ ስራሕቲ ክሳዕ ኣገልግሎታት ኩሉ ርከቡ"
            },
            feature4: {
                title: "ንምጥቃም ቀሊል",
                description: "ንቀሊል ተመኩሮ ቀሊልን ንጹርን መተሓሳሰቢ"
            }
        },
        categories: {
            title: "ብምድብ ርአይ",
            subtitle: "ዝደልይዎ ርከቡ",
            homes: "ገዛውቲን ሪል እስቴትን",
            cars: "መካይንን ተሽከርከርቲን",
            jobs: "ስራሕቲን ሞያታትን",
            tenders: "ጨረታታትን ኮንትራታትን",
            viewAll: "ኩሎም ምድባት ርአይ"
        },
        stats: {
            activeUsers: "ንጡፋት ተጠቀምቲ",
            listings: "ጠቅላላ ዝርዝራት",
            categories: "ምድባት",
            cities: "ዝተሸፈና ከተማታት"
        },
        cta: {
            title: "ንምጅማር ድሉዋት ዲኹም?",
            subtitle: "ኣብ የስራሰው ብኣሽሓት ዝቑጸሩ ዕጉባት ተጠቀምቲ ተጸምበሩ",
            postAd: "መወዓውዒኹም ኣቐምጡ",
            signUpNow: "ሕጂ ተመዝገቡ"
        }
    }
};

const LandingPage = () => {
    const { language } = useLanguage();
    const t = translations[language] || translations.en;
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/homes');
        }
    }, [user, navigate]);

    const categories = [
        { icon: <Home />, key: 'homes', path: '/homes', color: '#2196F3' },
        { icon: <DirectionsCar />, key: 'cars', path: '/cars', color: '#4CAF50' },
        { icon: <Work />, key: 'jobs', path: '/jobs', color: '#FF9800' },
        { icon: <Assignment />, key: 'tenders', path: '/tenders', color: '#9C27B0' }
    ];

    const features = [
        { icon: <CheckCircle />, key: 'feature1', color: '#2196F3' },
        { icon: <Security />, key: 'feature2', color: '#4CAF50' },
        { icon: <Category />, key: 'feature3', color: '#FF9800' },
        { icon: <TrendingUp />, key: 'feature4', color: '#9C27B0' }
    ];

    const stats = [
        { label: 'activeUsers', value: '10,000+', icon: <People /> },
        { label: 'listings', value: '50,000+', icon: <Assignment /> },
        { label: 'categories', value: '20+', icon: <Category /> },
        { label: 'cities', value: '15+', icon: <Home /> }
    ];

    return (
        <Box>
            <SEO
                title={t.hero.title}
                description={t.hero.description}
                keywords="ethiopia marketplace, buy sell ethiopia, jobs ethiopia, tenders ethiopia, cars ethiopia, real estate addis ababa"
            />
            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    py: { xs: 8, md: 12 },
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background Pattern */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Typography
                                variant="h2"
                                fontWeight="bold"
                                gutterBottom
                                sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
                            >
                                {t.hero.title}
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{ mb: 3, opacity: 0.95, fontSize: { xs: '1.2rem', md: '1.5rem' } }}
                            >
                                {t.hero.subtitle}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, maxWidth: 600 }}>
                                {t.hero.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        bgcolor: 'white',
                                        color: theme.palette.primary.main,
                                        '&:hover': { bgcolor: alpha('#fff', 0.9) },
                                        px: 4,
                                        py: 1.5
                                    }}
                                    onClick={() => navigate('/register')}
                                >
                                    {t.hero.getStarted}
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        borderColor: 'white',
                                        color: 'white',
                                        '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.1) },
                                        px: 4,
                                        py: 1.5
                                    }}
                                    onClick={() => navigate('/homes')}
                                >
                                    {t.hero.browseListings}
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 400,
                                    borderRadius: 4,
                                    bgcolor: alpha('#fff', 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography variant="h3" sx={{ opacity: 0.5 }}>
                                    Yesra Sew Solution
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>
                    {t.features.title}
                </Typography>
                <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
                    {t.features.subtitle}
                </Typography>

                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={feature.key}>
                            <Card
                                sx={{
                                    height: '100%',
                                    textAlign: 'center',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 }
                                }}
                            >
                                <CardContent sx={{ p: 4 }}>
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            bgcolor: alpha(feature.color, 0.1),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 2
                                        }}
                                    >
                                        {React.cloneElement(feature.icon, { sx: { fontSize: 40, color: feature.color } })}
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {t.features[feature.key].title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t.features[feature.key].description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Categories Section */}
            <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>
                        {t.categories.title}
                    </Typography>
                    <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
                        {t.categories.subtitle}
                    </Typography>

                    <Grid container spacing={3}>
                        {categories.map((category) => (
                            <Grid item xs={12} sm={6} md={3} key={category.key}>
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            boxShadow: 8,
                                            bgcolor: alpha(category.color, 0.05)
                                        }
                                    }}
                                    onClick={() => navigate(category.path)}
                                >
                                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                        <Box
                                            sx={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: '50%',
                                                bgcolor: alpha(category.color, 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 2
                                            }}
                                        >
                                            {React.cloneElement(category.icon, { sx: { fontSize: 35, color: category.color } })}
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            {t.categories[category.key]}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/homes')}
                        >
                            {t.categories.viewAll}
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Stats Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Grid container spacing={4}>
                    {stats.map((stat) => (
                        <Grid item xs={6} md={3} key={stat.label}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    textAlign: 'center',
                                    bgcolor: 'transparent',
                                    border: '2px solid',
                                    borderColor: 'grey.200',
                                    borderRadius: 2
                                }}
                            >
                                <Box sx={{ mb: 1 }}>
                                    {React.cloneElement(stat.icon, { sx: { fontSize: 40, color: 'primary.main' } })}
                                </Box>
                                <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {t.stats[stat.label]}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* CTA Section */}
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: 8,
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }}
                />
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                        {t.cta.title}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                        {t.cta.subtitle}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                bgcolor: 'white',
                                color: 'primary.main',
                                '&:hover': { bgcolor: alpha('#fff', 0.9) },
                                px: 4,
                                py: 1.5
                            }}
                            onClick={() => navigate('/register')}
                        >
                            {t.cta.signUpNow}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{
                                borderColor: 'white',
                                color: 'white',
                                '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.1) },
                                px: 4,
                                py: 1.5
                            }}
                            onClick={() => navigate('/post-ad')}
                        >
                            {t.cta.postAd}
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;
