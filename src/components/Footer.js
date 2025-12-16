import React from 'react';
import { Container, Grid, Typography, Link, Box, IconButton, Button } from '@mui/material';
import {
  Facebook, Twitter, Instagram, LinkedIn, YouTube, Telegram,
  Email, Phone, LocationOn, Android, Apple
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import adminService from '../services/adminService';
import { useState, useEffect } from 'react';

// --- Embedded Multilingual Translations ---
const translations = {
  en: {
    title: "YesraSew",
    description: "Purified Gold. Your trusted partner for buying, selling, and discovering amazing deals in your community.",
    quickLinks: "Quick Links",
    contact: "Get in Touch",
    copyright: "© {year} YesraSew. All Rights Reserved.",
    links: {
      home: "Home",
      jobs: "Find Jobs",
      tenders: "Browse Tenders",
      cars: "Used Cars",
      homes: "Real Estate",
      about: "About Us"
    }
  },
  am: {
    title: "የስራ ሰው",
    description: "የነጠረ ወርቅ። በማህበረሰብዎ ውስጥ አስደናቂ ቅናሾችን ለመግዛት፣ ለመሸጥ እና ለማግኘት የእርስዎ ታማኝ አጋር።",
    quickLinks: "ፈጣን አገናኞች",
    contact: "ያግኙን",
    copyright: "© {year} የስራ ሰው። ሁሉም መብቶች የተጠበቁ ናቸው።",
    links: {
      home: "መነሻ",
      jobs: "ስራዎችን ያግኙ",
      tenders: "ጨረታዎችን ያስሱ",
      cars: "ያገለገሉ መኪናዎች",
      homes: "ሪል እስቴት",
      about: "ስለ እኛ"
    }
  },
  om: {
    title: "YesraSew",
    description: "Purified Gold. Gurguruu, bituu, fi daldala dinqisiisoo hawaasa keessan keessatti argachuuf hiriyaa keessan amanamaa.",
    quickLinks: "Hidhamtoota Ariifatoo",
    contact: "Nuun Dubbadhaa",
    copyright: "© {year} YesraSew. Mirgi Hundi Seeraan Eegamaadha.",
    links: {
      home: "Fuula Jalqabaa",
      jobs: "Hojiiwwan Barbaadi",
      tenders: "Caalbaasiiwwan Sakatta'i",
      cars: "Konkolaattota Fayyadamoo",
      homes: "Qabeenya Dhugaa",
      about: "Waa'ee Keenya"
    }
  },
  ti: {
    title: "የስራ ሰው",
    description: "Purified Gold. ኣብ ማሕበረሰብኩም ዘደንቕ ዋጋታት ንምግዛእ፣ ንምሻጥን ንምርካብን እሙን መሻርኽትኹም።",
    quickLinks: "ቀጸልቲ መላግቦታት",
    contact: "ተወከሱና",
    copyright: "© {year} የስራ ሰው። ኩሉ መሰላት ዝተሓለወ እዩ።",
    links: {
      home: "መበገሲ",
      jobs: "ስራሕቲ ድለዩ",
      tenders: "ጨረታታት ኣስተውዕሉ",
      cars: "ዝተጠቐምሉ መካይን",
      homes: "ሓቀኛ ንብረት",
      about: "ብዛዕባና"
    }
  }
};




const Footer = () => {
  // Use global language state
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [settings, setSettings] = useState({});

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
  }, []);

  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, borderTop: '1px solid #e0e0e0', mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          {/* About Section */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
              {t.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.description}
            </Typography>
            {(settings.show_social_footer === true || settings.show_social_footer === undefined) && (
              <Box sx={{ mt: 2 }}>
                {settings.social_facebook && <IconButton component="a" href={settings.social_facebook} target="_blank" aria-label="Facebook" color="primary"><Facebook /></IconButton>}
                {settings.social_twitter && <IconButton component="a" href={settings.social_twitter} target="_blank" aria-label="Twitter" color="primary"><Twitter /></IconButton>}
                {settings.social_instagram && <IconButton component="a" href={settings.social_instagram} target="_blank" aria-label="Instagram" color="primary"><Instagram /></IconButton>}
                {settings.social_linkedin && <IconButton component="a" href={settings.social_linkedin} target="_blank" aria-label="LinkedIn" color="primary"><LinkedIn /></IconButton>}
                {settings.social_telegram && <IconButton component="a" href={settings.social_telegram} target="_blank" aria-label="Telegram" color="primary"><Telegram /></IconButton>}
                {settings.social_youtube && <IconButton component="a" href={settings.social_youtube} target="_blank" aria-label="YouTube" color="primary"><YouTube /></IconButton>}
              </Box>
            )}

            {(settings.show_app_footer === true || settings.show_app_footer === undefined) && (settings.mobile_ios || settings.mobile_android) && (
              <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {settings.mobile_ios && (
                  <Button variant="outlined" size="small" startIcon={<Apple />} href={settings.mobile_ios} target="_blank" sx={{ textTransform: 'none', borderRadius: 4 }}>
                    App Store
                  </Button>
                )}
                {settings.mobile_android && (
                  <Button variant="outlined" size="small" startIcon={<Android />} href={settings.mobile_android} target="_blank" sx={{ textTransform: 'none', borderRadius: 4 }}>
                    Play Store
                  </Button>
                )}
              </Box>
            )}
          </Grid>

          {/* Quick Links Section */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" color="text.primary" gutterBottom>{t.quickLinks}</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link href="/" color="text.secondary" underline="hover">{t.links.home}</Link>
              <Link href="/jobs" color="text.secondary" underline="hover">{t.links.jobs}</Link>
              <Link href="/tenders" color="text.secondary" underline="hover">{t.links.tenders}</Link>
              <Link href="/cars" color="text.secondary" underline="hover">{t.links.cars}</Link>
            </Box>
          </Grid>

          {/* More Quick Links Section */}
          <Grid item xs={12} sm={6} md={2}>
            {/* This empty title aligns the links with the other columns */}
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ color: 'transparent', userSelect: 'none' }}>&nbsp;</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link href="/homes" color="text.secondary" underline="hover">{t.links.homes}</Link>
              <Link href="/about" color="text.secondary" underline="hover">{t.links.about}</Link>
              <Link href="/privacy" color="text.secondary" underline="hover">Privacy</Link>
              <Link href="/terms" color="text.secondary" underline="hover">Terms</Link>
            </Box>
          </Grid>

          {/* Contact Section */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>{t.contact}</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Email fontSize="small" color="primary" />
                <Typography variant="body2">info@yesrasew.com</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Phone fontSize="small" color="primary" />
                <Typography variant="body2">+251 911 234 567</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <LocationOn fontSize="small" color="primary" />
                <Typography variant="body2">Addis Ababa, Ethiopia</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box mt={5} pt={3} borderTop="1px solid #e0e0e0" textAlign="center">
          <Typography variant="body2" color="text.secondary">
            {t.copyright.replace('{year}', new Date().getFullYear())}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;