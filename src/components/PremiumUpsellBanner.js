import React from 'react';
import { Card, Typography, Button, Box } from '@mui/material';
import { WorkspacePremium } from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const translations = {
    en: {
        subscribe: "Upgrade Subscription",
        tenders: {
            title: "Win High-Value Procurement Opportunities",
            desc: "Subscribe to our Premium Tender Alert service to get instant access to government and NGO tenders before anyone else."
        },
        jobs: {
            title: "Land Your Dream Job Faster",
            desc: "Subscribe to Premium Job Alerts to get priority access to high-paying international and NGO vacancies."
        },
        homes: {
            title: "Find Your Exclusive Dream Home",
            desc: "Unlock premium real estate listings and verified properties before they hit the general market."
        },
        cars: {
            title: "Drive Your Dream Car Today",
            desc: "Subscribe to Premium Car Browser to access verified, high-condition vehicle deals from trusted sellers first."
        }
    },
    am: {
        subscribe: "የደንበኝነት ምዝገባን ያሻሽሉ",
        tenders: {
            title: "ከፍተኛ ዋጋ ያላቸውን የግዥ እድሎችን ያሸንፉ",
            desc: "የመንግስት እና መንግስታዊ ያልሆኑ ድርጅቶች ጨረታዎችን ከማንም ቀድመው ለማግኘት ለፕሪሚየም የጨረታ ማንቂያ አገልግሎታችን ይመዝገቡ።"
        },
        jobs: {
            title: "የህልም ስራዎን በፍጥነት ያግኙ",
            desc: "ከፍተኛ ክፍያ ላላቸው አለም አቀፍ እና መንግስታዊ ያልሆኑ ክፍት የስራ ቦታዎች ቅድሚያ ማግኘት እንዲችሉ ለፕሪሚየም የስራ ማንቂያዎች ይመዝገቡ።"
        },
        homes: {
            title: "ልዩ የህልም ቤትዎን ያግኙ",
            desc: "ፕሪሚየም የሪል እስቴት ዝርዝሮችን እና የተረጋገጡ ንብረቶችን ገበያ ላይ ከመውጣታቸው በፊት ያግኙ።"
        },
        cars: {
            title: "የህልም መኪናዎን ዛሬውኑ ይንዱ",
            desc: "ከታምኑ ሻጮች የተረጋገጡ እና በጥሩ ሁኔታ ላይ ያሉ የመኪና ቅናሾችን ቀድመው ለማግኘት ለፕሪሚየም መኪና አሳሽ ይመዝገቡ።"
        }
    },
    om: {
        subscribe: "Jijjiirraa Galmee Ol Kaasaa",
        tenders: {
            title: "Carraawwan Bittaa Gati-jabeessa Ta’an Mo’adhaa",
            desc: "Caalbaasiiwwan mootummaa fi miti-mootummaa namoonni biroo osoo hin argin dura argachuuf tajaajila Beeksisa Caalbaasii Piriimiyamiitiif galmaa’aa."
        },
        jobs: {
            title: "Hojii Abjuu Keessanii Dafaa Argadhaa",
            desc: "Bakkahtoota hojii kaffaltii guddaa qaban kan idil-addunyaa fi miti-mootummaa dursaan argachuuf Beeksisa Hojii Piriimiyamiitiif galmaa’aa."
        },
        homes: {
            title: "Mana Abjuu Keessanii Addaa Argadhaa",
            desc: "Tarreeffamoota manaa piriimiyamiinif qabeenyawwan mirkanaa’an gabaa waliigalaa irratti osoo hin ba’in dura banaa."
        },
        cars: {
            title: "Konkolaataa Abjuu Keessanii Har'a Oofaa",
            desc: "Waliigaltee konkolaataa mirkanaa'an fi haala gaarii irra jiran gurgurtoota amanamoo irraa dursaan argachuuf Piriimiyamiin Konkolaataa sakatta'uuf galmaa'aa."
        }
    },
    ti: {
        subscribe: "ናይ ምዝገባ ደረጃ ክብ ኣቢልኩም",
        tenders: {
            title: "ምዑዝ ዋጋ ዘለዎም ናይ ዕዳጋ ዕድላት ተዓወቱ",
            desc: "ናይ መንግስትን መንግስታዊ ዘይኮኑን ትካላት ጨረታታት ቅድሚ ካልኦት ንምርካብ ንናይ ፕሪሚየም ጨረታ ምልክታ ኣገልግሎትና ተመዝገቡ።"
        },
        jobs: {
            title: "ናይ ሕልምኹም ስራሕ ብቀሊሉ ርኸቡ",
            desc: "ልዑል ክፍሊት ዘለዎም ዓለምለኻዊን መንግስታዊ ዘይኮኑን ክፍት ቦታታት ስራሕ ብቀዳምነት ንምርካብ ንናይ ፕሪሚየም ስራሕ ምልክታታት ተመዝገቡ።"
        },
        homes: {
            title: "ፍሉይ ናይ ሕልሚ ገዛኹም ርኸቡ",
            desc: "ፕሪሚየም ዝርዝራት ሪል እስቴትን ዝተረጋገጹ ንብረታትን ናብ ሓፈሻዊ ዕዳጋ ቅድሚ ምውጽኦም ረኸብዎም።"
        },
        cars: {
            title: "ናይ ሕልምኹም መኪና ሎሚ ዘውርዋ",
            desc: "ካብ ዝተኣመኑ ሸጠምቲ ዝተረጋገጹን ብሉጽ ኩነላት ዘለወን መካይን ብቀዳምነት ንምርካብ ንናይ ፕሪሚየም መኪና ዳሰሳ ተመዝገቡ።"
        }
    }
};

const getCategoryStyles = (category) => {
    switch (category) {
        case 'tenders':
            return { bg: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)', iconColor: '#FFD700' };
        case 'jobs':
            return { bg: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)', iconColor: '#FFD700' };
        case 'homes':
            return { bg: 'linear-gradient(135deg, #006064 0%, #0097a7 100%)', iconColor: '#FFD700' };
        case 'cars':
            // Changed from red to a sleek "metallic dark blue/grey" for vehicles as per user request to avoid red
            return { bg: 'linear-gradient(135deg, #263238 0%, #37474F 100%)', iconColor: '#FFD700' };
        default:
            return { bg: 'linear-gradient(135deg, #424242 0%, #616161 100%)', iconColor: '#FFD700' };
    }
};

const PremiumUpsellBanner = ({ category }) => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const t = translations[language] || translations.en;
    const content = t[category] || t.tenders; // Fallback
    const styles = getCategoryStyles(category);

    return (
        <Card sx={{
            p: 4,
            textAlign: 'center',
            background: styles.bg,
            color: 'white',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}>
            <WorkspacePremium sx={{ fontSize: 48, color: styles.iconColor, mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                {content.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                {content.desc}
            </Typography>
            <Button
                variant="contained"
                onClick={() => navigate(`/pricing/${category}`)}
                sx={{
                    bgcolor: '#FFD700',
                    color: 'black',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#FFC107' },
                    borderRadius: 50,
                    px: 4
                }}
            >
                {t.subscribe}
            </Button>
        </Card>
    );
};

export default PremiumUpsellBanner;

