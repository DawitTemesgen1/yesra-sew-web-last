import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    TextField,
    Button,
    Card,
    useTheme,
    IconButton,
    Paper,
    Stack,
    alpha
} from '@mui/material';
import {
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Facebook,
    LinkedIn,
    Instagram,
    YouTube,
    Telegram,
    Send as SendIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import adminService from '../services/adminService';
import blogService from '../services/blogService';
import { useLanguage } from '../contexts/LanguageContext';

// TikTok Icon Component
const TikTokIcon = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a6.34 6.34 0 0 1-2.01-1.63v6.36c.14 1.09-.13 2.23-.74 3.14-.94 1.54-2.61 2.5-4.41 2.5-1.92 0-3.69-1.12-4.59-2.82C5.46 14.28 5.6 11.97 6.96 10.51c.96-1.04 2.37-1.64 3.8-1.65v4.01a2.82 2.82 0 0 0-1.89 1.05 2.82 2.82 0 0 0 3.65 3.65 2.82 2.82 0 0 0 1.05-1.89c.02-1.34.01-2.68.02-4.02 0-3.53-.01-7.06.01-10.59-.03-.02-.05-.03-.07-.05Z" />
    </svg>
);

const translations = {
    en: {
        title: "Let's Start a",
        titleLine2: "Conversation",
        subtitle: "Whether you need support, have a partnership idea, or just want to say hello, we're ready to listen.",
        formTitle: "Send us a Message",
        nameLabel: "Your Name",
        emailLabel: "Your Email",
        subjectLabel: "Subject",
        messageLabel: "Message",
        sendBtn: "Send Message",
        callUs: "Call Us",
        callTime: "Mon-Fri from 8am to 5pm",
        emailUs: "Email Us",
        emailResponse: "Review response within 24hrs",
        visitUs: "Visit Us",
        location: "Addis Ababa, Ethiopia",
        connectTitle: "Connect With Us",
        successMsg: "Thanks for contacting us! We'll get back to you soon."
    },
    am: {
        title: "ውይይት",
        titleLine2: "እንጀምር",
        subtitle: "ድጋፍ፣ የአጋርነት ሀሳብ ወይም ሰላምታ ለመላክ፣ ለማዳመጥ ዝግጁ ነን።",
        formTitle: "መልእክት ይላኩልን",
        nameLabel: "ስምዎ",
        emailLabel: "ኢሜልዎ",
        subjectLabel: "ርዕስ",
        messageLabel: "መልእክት",
        sendBtn: "መልእክት ላክ",
        callUs: "ይደውሉልን",
        callTime: "ሰኞ-አርብ ከ8ሰዓት እስከ 5ሰዓት",
        emailUs: "ኢሜል ይላኩልን",
        emailResponse: "በ24 ሰዓት ውስጥ ምላሽ",
        visitUs: "ይጎብኙን",
        location: "አዲስ አበባ፣ ኢትዮጵያ",
        connectTitle: "ይገናኙን",
        successMsg: "ስለተገናኙን እናመሰግናለን! በቅርቡ እናገኝዎታለን።"
    },
    om: {
        title: "Haasawa",
        titleLine2: "Haa Jalqabnu",
        subtitle: "Deeggarsa, yaada hirmaannaa ykn nagaa dubbachuu barbaaddan, dhaggeeffachuuf qophii dha.",
        formTitle: "Ergaa Nuuf Ergaa",
        nameLabel: "Maqaa Keessan",
        emailLabel: "Email Keessan",
        subjectLabel: "Mata Duree",
        messageLabel: "Ergaa",
        sendBtn: "Ergaa Ergi",
        callUs: "Nu Bilbilaa",
        callTime: "Wiixata-Jimaata sa'a 8 hanga 5",
        emailUs: "Email Nuuf Ergaa",
        emailResponse: "Deebii sa'a 24 keessatti",
        visitUs: "Nu Daawwadhaa",
        location: "Finfinnee, Itoophiyaa",
        connectTitle: "Nu Waliin Quunnamaa",
        successMsg: "Nu quunnamuuf galatoomaa! Yeroo dhiyootti isin argina."
    },
    ti: {
        title: "ዘተ",
        titleLine2: "ንጀምር",
        subtitle: "ደገፍ፣ ናይ ሽርክነት ሓሳብ ወይ ሰላምታ ክትልእኹ እንተደሊኹም፣ ንምስማዕ ድሉዋት ኢና።",
        formTitle: "መልእኽቲ ለኣኹልና",
        nameLabel: "ስምኩም",
        emailLabel: "ኢመይልኩም",
        subjectLabel: "ኣርእስቲ",
        messageLabel: "መልእኽቲ",
        sendBtn: "መልእኽቲ ለኣኽ",
        callUs: "ደውሉልና",
        callTime: "ሰኑይ-ዓርቢ ካብ 8 ሰዓት ክሳብ 5 ሰዓት",
        emailUs: "ኢመይል ለኣኹልና",
        emailResponse: "ኣብ 24 ሰዓት መልሲ",
        visitUs: "ምጻእና",
        location: "ኣዲስ ኣበባ፣ ኢትዮጵያ",
        connectTitle: "ተራኸቡና",
        successMsg: "ስለ ዝተራኸብኩም እናመስገንና! ቀልጢፍና ክንረኽበኩም ኢና።"
    }
};

const ContactUsPage = () => {
    const theme = useTheme();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;
    const [settings, setSettings] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await adminService.getSystemSettings();
                setSettings(data);
            } catch (err) {
                console.error('Error fetching settings', err);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await blogService.submitContactMessage(formData);
            alert(t.successMsg);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            console.error('Error submitting message:', err);
            alert('Failed to send message. Please try again.');
        }
    };

    const contactInfo = [
        {
            icon: <PhoneIcon fontSize="large" color="primary" />,
            title: t.callUs,
            detail: settings.phone_number || "+251 911 234 567",
            subDetail: t.callTime
        },
        {
            icon: <EmailIcon fontSize="large" color="primary" />,
            title: t.emailUs,
            detail: settings.contact_email || "info@yesrasew.com",
            subDetail: t.emailResponse
        },
        {
            icon: <LocationIcon fontSize="large" color="primary" />,
            title: t.visitUs,
            detail: settings.address || "Bole Medhanialem",
            subDetail: t.location
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>

            {/* Hero Section */}
            <Box sx={{
                background: `linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)`,
                color: 'white',
                pt: { xs: 8, md: 14 },
                pb: { xs: 10, md: 16 },
                mb: { xs: 4, md: 6 },
                position: 'relative',
                overflow: 'hidden',
                borderBottomLeftRadius: { xs: 30, md: 80 },
                borderBottomRightRadius: { xs: 30, md: 80 },
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120%',
                    height: '120%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 60%)',
                    zIndex: 0
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography
                            variant="h1"
                            fontWeight="900"
                            gutterBottom
                            sx={{
                                fontSize: { xs: '2.5rem', md: '5.5rem' },
                                background: 'linear-gradient(to right, #fff, #b3cde0)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 2,
                                letterSpacing: '-0.02em',
                                lineHeight: 1.1
                            }}
                        >
                            {t.title} <br /> {t.titleLine2}
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                opacity: 0.8,
                                fontWeight: 300,
                                maxWidth: '700px',
                                mx: 'auto',
                                fontSize: { xs: '1.1rem', md: '1.4rem' },
                                lineHeight: 1.6
                            }}
                        >
                            {t.subtitle}
                        </Typography>
                    </motion.div>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 2 }}>
                <Grid container spacing={4}>

                    {/* Contact Form */}
                    <Grid item xs={12} md={7}>
                        <Paper
                            component={motion.div}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            elevation={3}
                            sx={{ p: 4, borderRadius: 4, height: '100%' }}
                        >
                            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                                {t.formTitle}
                            </Typography>
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label={t.nameLabel}
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            variant="outlined"
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label={t.emailLabel}
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            variant="outlined"
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t.subjectLabel}
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            variant="outlined"
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label={t.messageLabel}
                                            name="message"
                                            multiline
                                            rows={5}
                                            value={formData.message}
                                            onChange={handleChange}
                                            variant="outlined"
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            endIcon={<SendIcon />}
                                            fullWidth
                                            sx={{
                                                py: 1.5,
                                                fontSize: '1.1rem',
                                                borderRadius: 2,
                                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            {t.sendBtn}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>
                    </Grid>

                    {/* Contact Info Side */}
                    <Grid item xs={12} md={5}>
                        <Stack spacing={3}>
                            {contactInfo.map((info, index) => (
                                <Card
                                    key={index}
                                    component={motion.div}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                                    elevation={2}
                                    sx={{ borderRadius: 3, display: 'flex', alignItems: 'center', p: 2 }}
                                >
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: '50%',
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        mr: 3,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        {info.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            {info.title}
                                        </Typography>
                                        <Typography variant="body1" color="text.primary">
                                            {info.detail}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {info.subDetail}
                                        </Typography>
                                    </Box>
                                </Card>
                            ))}

                            {/* Social Media Card */}
                            <Card
                                component={motion.div}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                elevation={2}
                                sx={{ borderRadius: 3, p: 3, textAlign: 'center', bgcolor: theme.palette.primary.main, color: 'white' }}
                            >
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {t.connectTitle}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                                    {[
                                        { key: 'social_facebook', icon: <Facebook />, label: 'Facebook' },
                                        { key: 'social_tiktok', icon: <TikTokIcon />, label: 'TikTok' },
                                        { key: 'social_instagram', icon: <Instagram />, label: 'Instagram' },
                                        { key: 'social_linkedin', icon: <LinkedIn />, label: 'LinkedIn' },
                                        { key: 'social_telegram', icon: <Telegram />, label: 'Telegram' },
                                        { key: 'social_youtube', icon: <YouTube />, label: 'YouTube' },
                                    ].map((social) => {
                                        const url = settings[social.key];
                                        if (!url) return null;

                                        return (
                                            <IconButton
                                                key={social.key}
                                                component="a"
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{
                                                    color: 'white',
                                                    bgcolor: 'rgba(255,255,255,0.2)',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(255,255,255,0.4)',
                                                        transform: 'translateY(-3px)'
                                                    },
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                {social.icon}
                                            </IconButton>
                                        );
                                    })}
                                </Box>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>

            {/* Map Placeholder */}
            <Box sx={{ mt: 8 }}>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5422899388334!2d38.7891673153523!3d9.014295393529342!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b859666d92ec3%3A0x768ee7f5e1376d4!2sBole%20Medhanialem%20Church!5e0!3m2!1sen!2set!4v1672304859000!5m2!1sen!2set"
                    width="100%"
                    height="400"
                    style={{ border: 0, filter: 'grayscale(0.5)' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Our Location"
                ></iframe>
            </Box>
        </Box>
    );
};

export default ContactUsPage;
