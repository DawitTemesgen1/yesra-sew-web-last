import React from 'react';
import {
    Container, Typography, Box, Paper, Grid, Card, CardContent,
    useTheme, alpha, Avatar, Stack, Divider
} from '@mui/material';
import {
    Verified, Speed, Security, Support, TrendingUp, Groups,
    Public, EmojiEvents, Handshake, Lightbulb
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
    en: {
        title: "About YesraSew",
        subtitle: "Ethiopia's Premier Marketplace - Purified Gold",
        hero: {
            title: "Connecting Ethiopia Through Trust and Innovation",
            description: "YesraSew is revolutionizing the way Ethiopians buy, sell, and connect. We're building more than a marketplace—we're creating a trusted community where opportunities flourish."
        },
        mission: {
            title: "Our Mission",
            content: "To empower every Ethiopian with a safe, transparent, and efficient platform to achieve their economic goals—whether finding their dream job, selling their car, renting a home, or winning a tender."
        },
        vision: {
            title: "Our Vision",
            content: "To become the most trusted and innovative marketplace in Ethiopia, setting the gold standard for online commerce and community engagement across East Africa."
        },
        values: {
            title: "Our Core Values",
            items: [
                {
                    icon: Verified,
                    title: "Trust & Integrity",
                    description: "Every listing is verified. Every user is protected. We build trust through transparency."
                },
                {
                    icon: Speed,
                    title: "Speed & Efficiency",
                    description: "Time is precious. We make buying and selling fast, simple, and hassle-free."
                },
                {
                    icon: Security,
                    title: "Security First",
                    description: "Your data and transactions are protected with bank-level security measures."
                },
                {
                    icon: Support,
                    title: "Customer Excellence",
                    description: "Our dedicated support team is here to help you succeed, every step of the way."
                }
            ]
        },
        stats: {
            title: "Our Impact",
            items: [
                { icon: Groups, value: "10,000+", label: "Active Users" },
                { icon: TrendingUp, value: "50,000+", label: "Successful Transactions" },
                { icon: Public, value: "All Regions", label: "Nationwide Coverage" },
                { icon: EmojiEvents, value: "#1", label: "Trusted Marketplace" }
            ]
        },
        story: {
            title: "Our Story",
            content: "YesraSew was born from a simple observation: Ethiopians needed a better way to connect for commerce. Traditional methods were slow, unreliable, and often unsafe. We set out to change that.\n\nFounded in 2024, we've grown from a small team with a big vision to Ethiopia's most trusted marketplace. Our name, 'YesraSew' (የስራ ሰው), reflects our commitment to creating opportunities for work, business, and prosperity.\n\nToday, we serve thousands of users across Ethiopia, from Addis Ababa to Mekelle, from Bahir Dar to Dire Dawa. Every day, we help people find jobs, homes, cars, and business opportunities—transforming lives and building communities."
        },
        commitment: {
            title: "Our Commitment to Ethiopia",
            items: [
                {
                    icon: Handshake,
                    title: "Local First",
                    description: "Built by Ethiopians, for Ethiopians. We understand your needs because we share them."
                },
                {
                    icon: Lightbulb,
                    title: "Innovation",
                    description: "We leverage cutting-edge technology to solve uniquely Ethiopian challenges."
                },
                {
                    icon: Groups,
                    title: "Community",
                    description: "We're not just a platform—we're a community committed to mutual success."
                }
            ]
        },
        team: {
            title: "Leadership Team",
            description: "Led by experienced entrepreneurs and technologists passionate about Ethiopia's digital future"
        },
        contact: {
            title: "Get in Touch",
            description: "Have questions? Want to partner with us? We'd love to hear from you.",
            email: "contact@yesrasew.com",
            phone: "+251 11 XXX XXXX",
            address: "Addis Ababa, Ethiopia"
        }
    },
    am: {
        title: "ስለ የስራ ሰው",
        subtitle: "የኢትዮጵያ ቀዳሚ የገበያ ቦታ - የነጠረ ወርቅ",
        hero: {
            title: "ኢትዮጵያን በአመኔታ እና በፈጠራ እናገናኛለን",
            description: "የስራ ሰው ኢትዮጵያውያን የሚገዙበት፣ የሚሸጡበት እና የሚገናኙበትን መንገድ እያደሰ ነው። ከገበያ በላይ እየገነባን ያለነው—እድሎች የሚበቅሉበት የታመነ ማህበረሰብ እየፈጠርን ነው።"
        },
        mission: {
            title: "ተልዕኮአችን",
            content: "እያንዳንዱ ኢትዮጵያዊ የህልም ስራቸውን፣ መኪናቸውን መሸጥ፣ ቤት መከራየት ወይም ጨረታ ማሸነፍ የኢኮኖሚ ግባቸውን ለማሳካት ደህንነቱ የተጠበቀ፣ ግልጽ እና ቀልጣፋ መድረክ ማስቻል።"
        },
        vision: {
            title: "ራዕያችን",
            content: "በኢትዮጵያ ውስጥ በጣም የታመነ እና አዳዲስ ፈጠራዎችን የሚያቀርብ የገበያ ቦታ መሆን፣ በምስራቅ አፍሪካ ለመስመር ላይ ንግድ እና የማህበረሰብ ተሳትፎ የወርቅ ደረጃ ማስቀመጥ።"
        },
        values: {
            title: "ዋና እሴቶቻችን",
            items: [
                {
                    icon: Verified,
                    title: "እምነት እና ታማኝነት",
                    description: "እያንዳንዱ ዝርዝር ተረጋግጧል። እያንዳንዱ ተጠቃሚ ተጠብቋል። በግልጽነት እምነት እንገነባለን።"
                },
                {
                    icon: Speed,
                    title: "ፍጥነት እና ቅልጥፍና",
                    description: "ጊዜ ውድ ነው። መግዛትን እና መሸጥን ፈጣን፣ ቀላል እና ችግር የለሽ እናደርጋለን።"
                },
                {
                    icon: Security,
                    title: "ደህንነት በመጀመሪያ",
                    description: "የእርስዎ መረጃ እና ግብይቶች በባንክ ደረጃ የደህንነት እርምጃዎች የተጠበቁ ናቸው።"
                },
                {
                    icon: Support,
                    title: "የደንበኛ ልቀት",
                    description: "የእኛ ቁርጠኛ የድጋፍ ቡድን በእያንዳንዱ ደረጃ እንዲሳኩ ለመርዳት እዚህ ነው።"
                }
            ]
        },
        stats: {
            title: "ተጽእኖአችን",
            items: [
                { icon: Groups, value: "10,000+", label: "ንቁ ተጠቃሚዎች" },
                { icon: TrendingUp, value: "50,000+", label: "ስኬታማ ግብይቶች" },
                { icon: Public, value: "ሁሉም ክልሎች", label: "በሀገር አቀፍ ሽፋን" },
                { icon: EmojiEvents, value: "#1", label: "የታመነ የገበያ ቦታ" }
            ]
        },
        story: {
            title: "ታሪካችን",
            content: "የስራ ሰው የተወለደው ከቀላል ምልከታ ነው፡ ኢትዮጵያውያን ለንግድ የተሻለ የመገናኛ መንገድ ያስፈልጋቸው ነበር። ባህላዊ ዘዴዎች ዘገምተኛ፣ አስተማማኝ ያልሆኑ እና ብዙ ጊዜ ደህንነቱ ያልተጠበቀ ነበሩ። ይህንን ለመቀየር ተነሳን።\n\nበ2024 የተመሰረተ፣ ከትንሽ ቡድን ከትልቅ ራዕይ ጋር ወደ ኢትዮጵያ በጣም የታመነ የገበያ ቦታ አድገናል። ስማችን 'የስራ ሰው' ለስራ፣ ለንግድ እና ለብልጽግና እድሎችን ለመፍጠር ያለንን ቁርጠኝነት ያሳያል።\n\nዛሬ ከአዲስ አበባ እስከ መቀሌ፣ ከባህር ዳር እስከ ድሬዳዋ በኢትዮጵያ ውስጥ በሺዎች የሚቆጠሩ ተጠቃሚዎችን እናገለግላለን። በየቀኑ ሰዎች ስራ፣ ቤት፣ መኪና እና የንግድ እድሎችን እንዲያገኙ እንረዳለን—ህይወትን እየለወጥን እና ማህበረሰቦችን እየገነባን።"
        },
        commitment: {
            title: "ለኢትዮጵያ ያለን ቁርጠኝነት",
            items: [
                {
                    icon: Handshake,
                    title: "አገር በቀል በመጀመሪያ",
                    description: "በኢትዮጵያውያን የተገነባ፣ ለኢትዮጵያውያን። ፍላጎቶችዎን እንረዳለን ምክንያቱም እናካፍላቸዋለን።"
                },
                {
                    icon: Lightbulb,
                    title: "ፈጠራ",
                    description: "ልዩ የሆኑ የኢትዮጵያ ተግዳሮቶችን ለመፍታት ዘመናዊ ቴክኖሎጂን እንጠቀማለን።"
                },
                {
                    icon: Groups,
                    title: "ማህበረሰብ",
                    description: "እኛ ከመድረክ በላይ ነን—ለጋራ ስኬት ቁርጠኛ የሆነ ማህበረሰብ ነን።"
                }
            ]
        },
        team: {
            title: "የአመራር ቡድን",
            description: "በኢትዮጵያ ዲጂታል ወደፊት ፍላጎት ባላቸው ልምድ ያላቸው ሥራ ፈጣሪዎች እና ቴክኖሎጂስቶች የሚመራ"
        },
        contact: {
            title: "ያግኙን",
            description: "ጥያቄዎች አሉዎት? ከእኛ ጋር ለመተባበር ይፈልጋሉ? ከእርስዎ መስማት እንፈልጋለን።",
            email: "contact@yesrasew.com",
            phone: "+251 11 XXX XXXX",
            address: "አዲስ አበባ፣ ኢትዮጵያ"
        }
    }
};

const AboutUs = () => {
    const theme = useTheme();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <SEO
                title="About Us"
                description="Learn about YesraSew - Ethiopia's premier marketplace connecting buyers and sellers across the nation. Our mission, vision, and commitment to Ethiopian commerce."
                keywords="about yesrasew, ethiopian marketplace, about us, company mission, yesrasew story, ethiopia ecommerce"
            />

            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    py: { xs: 8, md: 12 },
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography variant="h2" fontWeight="bold" gutterBottom textAlign="center">
                            {t.title}
                        </Typography>
                        <Typography variant="h5" textAlign="center" sx={{ opacity: 0.9, mb: 4 }}>
                            {t.subtitle}
                        </Typography>
                        <Typography variant="h4" textAlign="center" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
                            {t.hero.title}
                        </Typography>
                        <Typography variant="body1" textAlign="center" sx={{ maxWidth: 700, mx: 'auto', mt: 3, fontSize: '1.1rem', opacity: 0.95 }}>
                            {t.hero.description}
                        </Typography>
                    </motion.div>
                </Container>
            </Box>

            {/* Mission & Vision */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Paper
                            sx={{
                                p: 4,
                                height: '100%',
                                borderRadius: 4,
                                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                bgcolor: alpha(theme.palette.primary.main, 0.05)
                            }}
                        >
                            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                                {t.mission.title}
                            </Typography>
                            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                                {t.mission.content}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper
                            sx={{
                                p: 4,
                                height: '100%',
                                borderRadius: 4,
                                border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                bgcolor: alpha(theme.palette.secondary.main, 0.05)
                            }}
                        >
                            <Typography variant="h4" fontWeight="bold" color="secondary" gutterBottom>
                                {t.vision.title}
                            </Typography>
                            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                                {t.vision.content}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Core Values */}
            <Box sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5), py: 8 }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
                        {t.values.title}
                    </Typography>
                    <Grid container spacing={3} sx={{ mt: 4 }}>
                        {t.values.items.map((value, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Card sx={{ height: '100%', textAlign: 'center', p: 3, borderRadius: 3 }}>
                                        <value.icon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {value.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {value.description}
                                        </Typography>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Stats */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
                    {t.stats.title}
                </Typography>
                <Grid container spacing={3} sx={{ mt: 4 }}>
                    {t.stats.items.map((stat, index) => (
                        <Grid item xs={6} md={3} key={index}>
                            <Card sx={{ textAlign: 'center', p: 4, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                <stat.icon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h3" fontWeight="bold" color="primary">
                                    {stat.value}
                                </Typography>
                                <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
                                    {stat.label}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Our Story */}
            <Box sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5), py: 8 }}>
                <Container maxWidth="md">
                    <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
                        {t.story.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 4, lineHeight: 2, fontSize: '1.1rem', whiteSpace: 'pre-line' }}>
                        {t.story.content}
                    </Typography>
                </Container>
            </Box>

            {/* Commitment */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
                    {t.commitment.title}
                </Typography>
                <Grid container spacing={4} sx={{ mt: 4 }}>
                    {t.commitment.items.map((item, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card sx={{ p: 4, height: '100%', borderRadius: 3, textAlign: 'center' }}>
                                <item.icon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    {item.title}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {item.description}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Contact */}
            <Box sx={{ bgcolor: theme.palette.primary.main, color: 'white', py: 8 }}>
                <Container maxWidth="md">
                    <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
                        {t.contact.title}
                    </Typography>
                    <Typography variant="body1" textAlign="center" sx={{ mb: 4, fontSize: '1.1rem' }}>
                        {t.contact.description}
                    </Typography>
                    <Stack spacing={2} alignItems="center">
                        <Typography variant="h6">{t.contact.email}</Typography>
                        <Typography variant="h6">{t.contact.phone}</Typography>
                        <Typography variant="h6">{t.contact.address}</Typography>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
};

export default AboutUs;
