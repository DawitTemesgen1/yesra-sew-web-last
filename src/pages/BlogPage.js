import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Avatar,
    TextField,
    InputAdornment,
    Button,
    useTheme,
    alpha,
    useMediaQuery,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    AccessTime as TimeIcon,
    ArrowForward as ArrowIcon,
    TrendingUp as TrendingIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import blogService from '../services/blogService';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
    en: {
        badge: "Our Journal",
        title: "Insights for the",
        titleLine2: "Modern Professional",
        subtitle: "Curated strategies, market analysis, and success stories to fuel your growth in Ethiopia's dynamic economy.",
        searchPlaceholder: "Search trending topics...",
        all: "All",
        readMore: "Read",
        noResults: "No posts found matching your search.",
        newsletterTitle: "Subscribe",
        newsletterSubtitle: "Get the latest career tips delivered to your inbox.",
        emailPlaceholder: "Email address",
        subscribeBtn: "Subscribe",
        loading: "Loading posts...",
        error: "Failed to load blog posts. Please try again later.",
        subscribing: "Subscribing...",
        subscribeSuccess: "Successfully subscribed to newsletter!",
        subscribeError: "Failed to subscribe. Please try again."
    },
    am: {
        badge: "የእኛ መጽሔት",
        title: "ለዘመናዊ",
        titleLine2: "ባለሙያዎች ግንዛቤዎች",
        subtitle: "በኢትዮጵያ ተለዋዋጭ ኢኮኖሚ ውስጥ እድገትዎን ለማነቃቃት የተመረጡ ስልቶች፣ የገበያ ትንተና እና የስኬት ታሪኮች።",
        searchPlaceholder: "ተወዳጅ ርዕሶችን ይፈልጉ...",
        all: "ሁሉም",
        readMore: "አንብብ",
        noResults: "ከፍለጋዎ ጋር የሚዛመድ ምንም ልጥፍ አልተገኘም።",
        newsletterTitle: "ይመዝገቡ",
        newsletterSubtitle: "የቅርብ ጊዜ የስራ ምክሮችን ወደ ኢሜልዎ ይቀበሉ።",
        emailPlaceholder: "የኢሜይል አድራሻ",
        subscribeBtn: "ይመዝገቡ",
        loading: "ልጥፎችን በመጫን ላይ...",
        error: "የብሎግ ልጥፎችን መጫን አልተቻለም። እባክዎ ቆየት ብለው ይሞክሩ።",
        subscribing: "በመመዝገብ ላይ...",
        subscribeSuccess: "በተሳካ ሁኔታ ተመዝግበዋል!",
        subscribeError: "መመዝገብ አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
    },
    om: {
        badge: "Gaazexaa Keenya",
        title: "Hubannoo Ogeessota",
        titleLine2: "Ammayyaa",
        subtitle: "Tooftaalee filatamoo, xiinxala gabaa fi seenaa milkaa'inaa dinagdee jijjiiramaa Itoophiyaa keessatti guddina keessan kakaasuu danda'an.",
        searchPlaceholder: "Mata dureewwan beekamoo barbaadi...",
        all: "Hunda",
        readMore: "Dubbisi",
        noResults: "Barbaachaa keessaniin walsimu maxxansi hin argamne.",
        newsletterTitle: "Galmaa'aa",
        newsletterSubtitle: "Gorsa hojii haaraa email keessanitti argadhaa.",
        emailPlaceholder: "Teessoo email",
        subscribeBtn: "Galmaa'aa",
        loading: "Maxxansiwwan fe'amaa jiru...",
        error: "Maxxansiwwan blogii fe'uu hin dandeenye. Mee yeroo booda yaali.",
        subscribing: "Galmaa'aa jira...",
        subscribeSuccess: "Milkaa'inaan galmaa'amtan!",
        subscribeError: "Galmaa'uun hin dandeenye. Mee irra deebi'ii yaali."
    },
    ti: {
        badge: "መጽሄትና",
        title: "ንዘመናውያን",
        titleLine2: "ሞያውያን ርድኢታት",
        subtitle: "ኣብ ተለዋዋጢ ቁጠባ ኢትዮጵያ ዕብየትኩም ንምንቃቕ ዝተመረጹ ስትራተጂታት፣ ትንተና ዕዳጋን ዛንታታት ዓወትን።",
        searchPlaceholder: "ህቡባት ኣርእስትታት ድለዩ...",
        all: "ኩሉ",
        readMore: "ኣንብብ",
        noResults: "ምስ መድለይኻ ዝሰማማዕ ጽሑፍ ኣይተረኽበን።",
        newsletterTitle: "ተመዝገብ",
        newsletterSubtitle: "ሓድሽ ናይ ስራሕ ምኽርታት ናብ ኢመይልካ ተቐበል።",
        emailPlaceholder: "ናይ ኢመይል ኣድራሻ",
        subscribeBtn: "ተመዝገብ",
        loading: "ጽሑፋት ይጽዕን ኣሎ...",
        error: "ናይ ብሎግ ጽሑፋት ምጽዓን ኣይተኻእለን። በጃኹም ድሕሪ ቁሩብ ፈትኑ።",
        subscribing: "ይምዝገብ ኣሎ...",
        subscribeSuccess: "ብዓወት ተመዝጊብኩም!",
        subscribeError: "ምዝገባ ኣይተኻእለን። በጃኹም እንደገና ፈትኑ።"
    }
};

const BlogPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(t.all);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribing, setSubscribing] = useState(false);
    const [subscribeMessage, setSubscribeMessage] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await blogService.getPublishedPosts();
            setPosts(data);
            setError('');
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(t.error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewsletterSubscribe = async (e) => {
        e.preventDefault();
        if (!newsletterEmail) return;

        try {
            setSubscribing(true);
            await blogService.subscribeToNewsletter(newsletterEmail);
            setSubscribeMessage(t.subscribeSuccess);
            setNewsletterEmail('');
        } catch (err) {
            setSubscribeMessage(err.message || t.subscribeError);
        } finally {
            setSubscribing(false);
        }
    };

    // Extract unique categories from fetched posts
    const categories = [t.all, ...new Set(posts.map(post => post.category))];

    const filteredPosts = posts.filter(post => {
        const title = post.title?.[language] || post.title?.en || '';
        const excerpt = post.excerpt?.[language] || post.excerpt?.en || '';

        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === t.all || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            pb: 10
        }}>
            {/* Hero / Header Section */}
            <Box sx={{
                background: `linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)`,
                pt: { xs: 8, md: 14 },
                pb: { xs: 12, md: 16 },
                mb: { xs: -6, md: -8 },
                position: 'relative',
                overflow: 'hidden',
                color: 'white'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                    opacity: 0.05
                }} />

                <Box
                    component={motion.div}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: { xs: 300, md: 600 },
                        height: { xs: 300, md: 600 },
                        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
                        borderRadius: '50%',
                        zIndex: 0
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center', px: { xs: 2, md: 3 } }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <Chip
                            label={t.badge}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                                mb: 3,
                                fontWeight: 'bold',
                                bgcolor: 'rgba(255,255,255,0.1)',
                                color: '#4ADE80',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                letterSpacing: 1
                            }}
                        />
                        <Typography
                            variant={isMobile ? "h4" : "h1"}
                            component="h1"
                            fontWeight="900"
                            gutterBottom
                            sx={{
                                background: `linear-gradient(to right, #FFFFFF 0%, #A5B4FC 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 2,
                                fontSize: { xs: '2.5rem', md: '5rem' },
                                letterSpacing: '-0.02em',
                                lineHeight: 1.1
                            }}
                        >
                            {t.title} <br /> {t.titleLine2}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                maxWidth: '600px',
                                mx: 'auto',
                                mb: 6,
                                fontWeight: 300,
                                fontSize: { xs: '1.1rem', md: '1.25rem' },
                                opacity: 0.8,
                                lineHeight: 1.6
                            }}
                        >
                            {t.subtitle}
                        </Typography>

                        <Box sx={{ maxWidth: '600px', mx: 'auto', position: 'relative' }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder={t.searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        bgcolor: 'rgba(255,255,255,0.08)',
                                        backdropFilter: 'blur(20px)',
                                        borderRadius: '20px',
                                        pl: 2,
                                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        '& fieldset': { border: 'none' },
                                        height: { xs: 56, md: 64 },
                                        color: 'white',
                                        fontSize: '1.1rem',
                                        '& input': {
                                            color: 'white', // Ensure input text is white
                                            '&::placeholder': {
                                                color: 'rgba(255,255,255,0.5)',
                                                opacity: 1
                                            }
                                        }
                                    }
                                }}
                            />
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>

                {/* Categories */}
                <Box sx={{
                    display: 'flex',
                    gap: 1.5,
                    overflowX: 'auto',
                    pb: 2,
                    mb: 3,
                    mx: { xs: -2, md: 0 },
                    px: { xs: 2, md: 0 },
                    '::-webkit-scrollbar': { display: 'none' },
                    scrollBehavior: 'smooth'
                }}>
                    {categories.map((cat, index) => (
                        <Chip
                            key={index}
                            label={cat}
                            clickable
                            onClick={() => setSelectedCategory(cat)}
                            variant={selectedCategory === cat ? 'filled' : 'outlined'}
                            color={selectedCategory === cat ? 'primary' : 'default'}
                            sx={{
                                borderRadius: 50,
                                px: { xs: 1, md: 2 },
                                py: { xs: 2.5, md: 3 },
                                fontSize: '0.9rem',
                                border: selectedCategory === cat ? 'none' : `1px solid ${theme.palette.divider}`,
                                flexShrink: 0,
                                mb: 1
                            }}
                        />
                    ))}
                </Box>

                {/* Main Grid */}
                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    </Grid>
                )}

                {loading ? (
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                            <CircularProgress size={60} />
                        </Box>
                    </Grid>
                ) : (
                    <Grid container spacing={isMobile ? 2 : 4}>
                        {filteredPosts.map((post, index) => {
                            const title = post.title?.[language] || post.title?.en || 'Untitled';
                            const excerpt = post.excerpt?.[language] || post.excerpt?.en || '';

                            return (
                                <Grid item xs={12} md={6} lg={4} key={post.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                    >
                                        <Card onClick={() => navigate(`/blog/${post.id}`)} sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 3,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                            boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                            '&:hover': {
                                                transform: !isMobile && 'translateY(-8px)',
                                                boxShadow: !isMobile && '0 15px 30px rgba(0,0,0,0.08)',
                                                borderColor: 'transparent'
                                            }
                                        }}>
                                            <Box sx={{ position: 'relative' }}>
                                                <CardMedia
                                                    component="img"
                                                    height={isMobile ? "200" : "240"}
                                                    image={post.image}
                                                    alt={title}
                                                />
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 10,
                                                    left: 10,
                                                    bgcolor: 'rgba(255,255,255,0.95)',
                                                    backdropFilter: 'blur(4px)',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    fontWeight: 'bold',
                                                    fontSize: '0.75rem',
                                                    color: 'text.primary'
                                                }}>
                                                    {post.category}
                                                </Box>
                                            </Box>

                                            <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
                                                    <TimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                    <Typography variant="caption">
                                                        {post.read_time} • {new Date(post.published_date).toLocaleDateString()}
                                                    </Typography>
                                                </Box>

                                                <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    lineHeight: 1.3,
                                                    minHeight: isMobile ? 'auto' : '2.6em',
                                                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                                                }}>
                                                    {title}
                                                </Typography>

                                                <Typography variant="body2" color="text.secondary" paragraph sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: isMobile ? 2 : 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    mb: 2,
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {excerpt}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                                                    <Avatar src={post.author_avatar} sx={{ width: 28, height: 28, mr: 1 }} />
                                                    <Typography variant="subtitle2" fontWeight="medium" fontSize="0.85rem">
                                                        {post.author_name}
                                                    </Typography>
                                                    {!isMobile && (
                                                        <Button
                                                            size="small"
                                                            endIcon={<ArrowIcon fontSize="small" />}
                                                            sx={{ ml: 'auto', borderRadius: 20, textTransform: 'none', color: 'primary.main' }}
                                                        >
                                                            {t.readMore}
                                                        </Button>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            );
                        })}

                        {filteredPosts.length === 0 && !loading && (
                            <Grid item xs={12}>
                                <Box sx={{ textAlign: 'center', mt: 4 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        {t.noResults}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                )}

                {/* Newsletter CTA */}
                <Box sx={{
                    mt: { xs: 6, md: 12 },
                    p: { xs: 4, md: 8 },
                    bgcolor: 'primary.main',
                    borderRadius: 4,
                    color: 'white',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        backgroundImage: 'url(https://www.transparenttextures.com/patterns/stardust.png)',
                        opacity: 0.2
                    }} />
                    <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, px: 0 }}>
                        <EmailIcon sx={{ fontSize: { xs: 40, md: 60 }, mb: 2, opacity: 0.9 }} />
                        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" gutterBottom>
                            {t.newsletterTitle}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, mb: 4, fontWeight: 300, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            {t.newsletterSubtitle}
                        </Typography>
                        {subscribeMessage && (
                            <Alert
                                severity={subscribeMessage.includes('success') || subscribeMessage.includes('Successfully') || subscribeMessage.includes('በተሳካ') || subscribeMessage.includes('Milkaa') || subscribeMessage.includes('ብዓወት') ? 'success' : 'error'}
                                sx={{ mb: 2 }}
                                onClose={() => setSubscribeMessage('')}
                            >
                                {subscribeMessage}
                            </Alert>
                        )}
                        <Box component="form" onSubmit={handleNewsletterSubscribe} sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <TextField
                                placeholder={t.emailPlaceholder}
                                variant="filled"
                                fullWidth
                                type="email"
                                required
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                size={isMobile ? "small" : "medium"}
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                    '& .MuiFilledInput-root': {
                                        bgcolor: 'white',
                                        borderRadius: 1,
                                        color: '#000000', // Black text for visibility
                                        '&::before, &::after': {
                                            borderBottom: 'none'
                                        }
                                    },
                                    '& .MuiFilledInput-input': {
                                        color: '#000000', // Ensure input text is black
                                        '&::placeholder': {
                                            color: 'rgba(0, 0, 0, 0.6)',
                                            opacity: 1
                                        }
                                    }
                                }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="secondary"
                                size={isMobile ? "medium" : "large"}
                                disabled={subscribing}
                                sx={{ px: 4, fontWeight: 'bold' }}
                            >
                                {subscribing ? t.subscribing : t.subscribeBtn}
                            </Button>
                        </Box>
                    </Container>
                </Box>

            </Container>
        </Box>
    );
};

export default BlogPage;
