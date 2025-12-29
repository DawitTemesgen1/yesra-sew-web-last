import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Link, Box, IconButton, Button, Stack, useTheme, useMediaQuery, alpha, Divider } from '@mui/material';
import {
  Facebook, Instagram, LinkedIn, YouTube, Telegram,
  Email, Phone, LocationOn, Android, Apple
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import adminService from '../services/adminService';

// TikTok Icon Component
const TikTokIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a6.34 6.34 0 0 1-2.01-1.63v6.36c.14 1.09-.13 2.23-.74 3.14-.94 1.54-2.61 2.5-4.41 2.5-1.92 0-3.69-1.12-4.59-2.82C5.46 14.28 5.6 11.97 6.96 10.51c.96-1.04 2.37-1.64 3.8-1.65v4.01a2.82 2.82 0 0 0-1.89 1.05 2.82 2.82 0 0 0 3.65 3.65 2.82 2.82 0 0 0 1.05-1.89c.02-1.34.01-2.68.02-4.02 0-3.53-.01-7.06.01-10.59-.03-.02-.05-.03-.07-.05Z" />
  </svg>
);

const translations = {
  en: {
    quickLinks: "Quick Links",
    contact: "Get in Touch",
    legal: "Legal Info",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    sitemap: "Sitemap",
    copyright: "© {year} {siteName}. All Rights Reserved.",
    links: {
      home: "Home",
      jobs: "Find Jobs",
      tenders: "Browse Tenders",
      cars: "Used Cars",
      homes: "Real Estate",
      about: "About Us",
      blog: "Blog",
      contact: "Contact Us",
      support: "Help & Support"
    }
  },
  am: {
    quickLinks: "ፈጣን አገናኞች",
    contact: "ያግኙን",
    legal: "ህጋዊ መረጃ",
    privacy: "የግላዊነት ፖሊሲ",
    terms: "የአጠቃቀም ደንቦች",
    copyright: "© {year} {siteName}። ሁሉም መብቶች የተጠበቁ ናቸው።",
    links: {
      home: "መነሻ",
      jobs: "ስራዎችን ያግኙ",
      tenders: "ጨረታዎችን ያስሱ",
      cars: "ያገለገሉ መኪናዎች",
      homes: "ሪል እስቴት",
      about: "ስለ እኛ",
      blog: "ብሎግ",
      contact: "ያግኙን",
      support: "እርዳታ እና ድጋፍ"
    }
  },
  om: {
    quickLinks: "Hidhamtoota Ariifatoo",
    contact: "Nuun Dubbadhaa",
    legal: "Mootummaa",
    privacy: "Imaammata Dhuunfaa",
    terms: "Haalawwan Tajaajilaa",
    copyright: "© {year} {siteName}. Mirgi Hundi Seeraan Eegamaadha.",
    links: {
      home: "Fuula Jalqabaa",
      jobs: "Hojiiwwan Barbaadi",
      tenders: "Caalbaasiiwwan Sakatta'i",
      cars: "Konkolaattota Fayyadamoo",
      homes: "Qabeenya Dhugaa",
      about: "Waa'ee Keenya",
      blog: "Blogii",
      contact: "Nuun Dubbadhaa",
      support: "Gargaarsa"
    }
  },
  ti: {
    quickLinks: "ቀጸልቲ መላግቦታት",
    contact: "ተወከሱና",
    legal: "ሕጋዊ",
    privacy: "ናይ ግላውነት ፖሊሲ",
    terms: "ናይ ኣጠቓቕማ ደንብታት",
    copyright: "© {year} {siteName}። ኩሉ መሰላት ዝተሓለወ እዩ።",
    links: {
      home: "መበገሲ",
      jobs: "ስራሕቲ ድለዩ",
      tenders: "ጨረታታት ኣስተውዕሉ",
      cars: "ዝተጠቐምሉ መካይን",
      homes: "ሓቀኛ ንብረት",
      about: "ብዛዕባና",
      blog: "ብሎግ",
      contact: "ተወከሱና",
      support: "ሓገዝ"
    }
  }
};

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [settings, setSettings] = useState({});
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminService.getSystemSettings();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching footer settings', err);
      }
    };
    fetchSettings();

    // Listen for settings updates
    const handleSettingsUpdate = () => {

      fetchSettings();
    };

    window.addEventListener('systemSettingsUpdated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('systemSettingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const BRAND_COLORS = {
    gold: isDark ? '#D4AF37' : '#FFD700',
    darkGold: '#DAA520',
    blue: isDark ? '#3B82F6' : '#1E3A8A',
    lightBlue: '#3B82F6',
    gradient: isDark
      ? 'linear-gradient(135deg, #121212 0%, #1E1E1E 50%, #B58E2A 100%)'
      : 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%)',
  };

  const siteName = settings.site_name || 'Yesra Sew Solution';
  const siteDescription = settings.site_description || (language === 'am' ? 'ቴክኖሎጂ እና ስራን ያገናኛል። ለስራ፣ ቤት፣ መኪና እና ጨረታዎች የእርስዎ ታማኝ መድረክ።' : 'Connecting Technology and Careers. Your trusted platform for jobs, homes, cars, and tenders.');
  const contactEmail = settings.contact_email || 'info@yesrasew.com';
  const phoneNumber = settings.phone_number || '+251 911 234 567';

  // Social Links: Now strictly controlled by settings
  const socialLinks = [
    { key: 'social_facebook', icon: <Facebook />, label: 'Facebook', color: '#1877F2' },
    { key: 'social_tiktok', icon: <TikTokIcon />, label: 'TikTok', color: isDark ? '#FFFFFF' : '#000000' },
    { key: 'social_instagram', icon: <Instagram />, label: 'Instagram', color: '#E4405F' },
    { key: 'social_linkedin', icon: <LinkedIn />, label: 'LinkedIn', color: '#0A66C2' },
    { key: 'social_telegram', icon: <Telegram />, label: 'Telegram', color: '#0088cc' },
    { key: 'social_youtube', icon: <YouTube />, label: 'YouTube', color: '#FF0000' },
  ];

  return (
    <Box component="footer" sx={{
      background: isDark ? '#121212' : '#FFFFFF',
      borderTop: `1px solid ${alpha(theme.palette.divider, isDark ? 0.2 : 0.1)}`,
      pt: { xs: 6, md: 10 },
      pb: { xs: 4, md: 6 },
      position: 'relative',
      color: isDark ? '#E0E0E0' : 'inherit'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 4 }}>
          {/* Brand & About */}
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h5" sx={{
              fontWeight: 800,
              mb: 2,
              background: isDark ? `linear-gradient(135deg, #D4AF37 0%, #FFFFFF 100%)` : BRAND_COLORS.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {siteName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8, maxWidth: { xs: 'none', md: '350px' } }}>
              {siteDescription}
            </Typography>

            {(settings.show_social_footer === true || settings.show_social_footer === undefined) && (
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                {socialLinks.map((social) => {
                  const url = settings[social.key];
                  if (!url) return null; // Disappear if no link provided

                  return (
                    <IconButton
                      key={social.key}
                      component="a"
                      href={url}
                      target="_blank"
                      sx={{
                        color: isDark ? '#FFFFFF' : BRAND_COLORS.blue,
                        bgcolor: alpha(isDark ? '#FFFFFF' : BRAND_COLORS.blue, 0.05),
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: social.color,
                          color: '#fff',
                          transform: 'translateY(-3px)'
                        }
                      }}
                    >
                      {social.icon}
                    </IconButton>
                  );
                })}
              </Stack>
            )}
          </Grid>

          {/* Quick Links Group */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={6} sx={{ textAlign: { xs: 'left', md: 'left' } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: isDark ? BRAND_COLORS.gold : BRAND_COLORS.blue }}>
                  {t.quickLinks}
                </Typography>
                <Stack spacing={2}>
                  <Link href="/" color="text.secondary" underline="none" sx={{ fontSize: '0.875rem', '&:hover': { color: BRAND_COLORS.gold } }}>{t.links.home}</Link>
                  <Link href="/jobs" color="text.secondary" underline="none" sx={{ fontSize: '0.875rem', '&:hover': { color: BRAND_COLORS.gold } }}>{t.links.jobs}</Link>
                  <Link href="/tenders" color="text.secondary" underline="none" sx={{ fontSize: '0.875rem', '&:hover': { color: BRAND_COLORS.gold } }}>{t.links.tenders}</Link>
                  <Link href="/cars" color="text.secondary" underline="none" sx={{ fontSize: '0.875rem', '&:hover': { color: BRAND_COLORS.gold } }}>{t.links.cars}</Link>
                </Stack>
              </Grid>

              <Grid item xs={6} sx={{ textAlign: { xs: 'left', md: 'left' } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: isDark ? BRAND_COLORS.gold : BRAND_COLORS.blue }}>
                  {t.legal}
                </Typography>
                <Stack spacing={2}>
                  <Link href="/about" color="text.secondary" underline="none" sx={{ fontSize: '0.875rem', '&:hover': { color: BRAND_COLORS.gold } }}>{t.links.about}</Link>
                  <Link href="/blog" color="text.secondary" underline="none" sx={{ fontSize: '0.875rem', '&:hover': { color: BRAND_COLORS.gold } }}>{t.links.blog}</Link>
                  <Link href="/contact" color="text.secondary" underline="none" sx={{ fontSize: '0.875rem', '&:hover': { color: BRAND_COLORS.gold } }}>{t.links.contact}</Link>
                  <Link href="/support" color="text.secondary" underline="none" sx={{ fontSize: '0.875rem', '&:hover': { color: BRAND_COLORS.gold } }}>{t.links.support}</Link>
                  <Link href="/privacy" color="text.secondary" underline="none" sx={{ fontSize: '0.875rem', '&:hover': { color: BRAND_COLORS.gold } }}>{t.privacy}</Link>
                  <Link href="/terms" color="text.secondary" underline="none" sx={{ fontSize: '0.875rem', '&:hover': { color: BRAND_COLORS.gold } }}>{t.terms}</Link>
                </Stack>
              </Grid>
            </Grid>
          </Grid>

          {/* Contact & Apps */}
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: isDark ? BRAND_COLORS.gold : BRAND_COLORS.blue }}>
              {t.contact}
            </Typography>
            <Stack spacing={2.5} alignItems={{ xs: 'center', md: 'flex-start' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Email sx={{ color: BRAND_COLORS.gold, fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">{contactEmail}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Phone sx={{ color: BRAND_COLORS.gold, fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">{phoneNumber}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationOn sx={{ color: BRAND_COLORS.gold, fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">Addis Ababa, Ethiopia</Typography>
              </Box>
            </Stack>

            {(settings.show_app_footer === true || settings.show_app_footer === undefined) && (settings.mobile_ios || settings.mobile_android) && (
              <Stack direction="row" spacing={2} sx={{ mt: 4 }} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                {settings.mobile_ios && (
                  <Button
                    startIcon={<Apple />}
                    href={settings.mobile_ios}
                    target="_blank"
                    variant="contained"
                    sx={{
                      borderRadius: '8px',
                      bgcolor: isDark ? BRAND_COLORS.gold : BRAND_COLORS.blue,
                      color: isDark ? '#000' : '#fff',
                      textTransform: 'none',
                      minWidth: '130px',
                      '&:hover': { bgcolor: isDark ? '#B58E2A' : '#3B82F6' }
                    }}
                  >
                    App Store
                  </Button>
                )}
                {settings.mobile_android && (
                  <Button
                    startIcon={<Android />}
                    href={settings.mobile_android}
                    target="_blank"
                    variant="contained"
                    sx={{
                      borderRadius: '8px',
                      bgcolor: isDark ? BRAND_COLORS.gold : BRAND_COLORS.blue,
                      color: isDark ? '#000' : '#fff',
                      textTransform: 'none',
                      minWidth: '130px',
                      '&:hover': { bgcolor: isDark ? '#B58E2A' : '#3B82F6' }
                    }}
                  >
                    Play Store
                  </Button>
                )}
              </Stack>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ mt: 6, mb: 4, opacity: isDark ? 0.1 : 0.5 }} />

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          textAlign: 'center'
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            {t.copyright.replace('{year}', new Date().getFullYear()).replace('{siteName}', siteName)}
          </Typography>

          <Stack direction="row" spacing={3}>
            <Link href="/privacy" sx={{ fontSize: '0.75rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: BRAND_COLORS.gold } }}>{t.privacy}</Link>
            <Link href="/terms" sx={{ fontSize: '0.75rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: BRAND_COLORS.gold } }}>{t.terms}</Link>
            {settings.sitemap_url && (
              <Link href={settings.sitemap_url} target="_blank" sx={{ fontSize: '0.75rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: BRAND_COLORS.gold } }}>{t.sitemap || 'Sitemap'}</Link>
            )}
          </Stack>
        </Box>
      </Container>

      {/* Modern Wave Aesthetic (Desktop only) */}
      {!isSmall && (
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: BRAND_COLORS.gradient,
          opacity: 0.8
        }} />
      )}
    </Box>
  );
};

export default Footer;
