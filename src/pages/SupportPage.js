import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    InputBase,
    Button,
    useTheme,
    alpha,
    Avatar,
    Chip
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Search as SearchIcon,
    HelpOutline as HelpIcon,
    Payment as PaymentIcon,
    AccountCircle as AccountIcon,
    Build as TechnicalIcon,
    ChatBubbleOutline as ChatIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
    en: {
        badge: "Support Center",
        title: "How can we help?",
        subtitle: "Search our knowledge base or browse categories below to find the answers you need.",
        searchPlaceholder: "Describe your issue (e.g., 'password reset')",
        searchBtn: "Search",
        categories: {
            account: "Account & Login",
            accountDesc: "Issues with signing up or logging in",
            billing: "Billing & Plans",
            billingDesc: "Payments, invoices, and subscriptions",
            technical: "Technical Issues",
            technicalDesc: "Errors, bugs, or platform problems",
            general: "General Questions",
            generalDesc: "Everything else about Yesra Sew"
        },
        faqTitle: "Frequently Asked Questions",
        noResults: "No matching results found.",
        needHelp: "Still need help?",
        needHelpDesc: "Can't find the answer you're looking for? Please contact our friendly support team.",
        contactBtn: "Contact Us",
        faqs: {
            account: "Account",
            accountQ1: "How do I create an account?",
            accountA1: "To create an account, click on the 'Register' button at the top right corner. You can sign up using your email or phone number. Follow the verification steps to complete your profile.",
            accountQ2: "I forgot my password, what should I do?",
            accountA2: "Click on 'Login' and then select 'Forgot Password'. Enter your registered email or phone number to receive a reset link or OTP code.",
            payments: "Payments & Membership",
            paymentsQ1: "What payment methods do you accept?",
            paymentsA1: "We accept secure payments via Telebirr, Chapa (CBE, Awash, etc.), and major credit cards. All transactions are encrypted.",
            paymentsQ2: "Can I cancel my subscription anytime?",
            paymentsA2: "Yes, you can cancel your subscription from your profile settings. Your access will remain active until the end of your current billing period.",
            listings: "Listings",
            listingsQ1: "How can I post a job or tender?",
            listingsA1: "Once logged in, click 'Post Ad' in the navigation bar. Select your category (Job, Tender, etc.), fill in the details, and submit. Some listings may require a premium plan.",
            listingsQ2: "Why is my listing pending approval?",
            listingsA2: "All listings go through a quality check to ensure they meet our community guidelines. This process usually takes less than 2 hours during business days."
        }
    },
    am: {
        badge: "የድጋፍ ማዕከል",
        title: "እንዴት ልንረዳዎ እንችላለን?",
        subtitle: "የእውቀት ቋታችንን ይፈልጉ ወይም የሚፈልጉትን መልስ ለማግኘት ከታች ያሉትን ምድቦች ይመልከቱ።",
        searchPlaceholder: "ችግርዎን ይግለጹ (ለምሳሌ 'የይለፍ ቃል ዳግም ማስጀመር')",
        searchBtn: "ፈልግ",
        categories: {
            account: "መለያ እና መግቢያ",
            accountDesc: "በመመዝገብ ወይም በመግባት ላይ ችግሮች",
            billing: "ክፍያ እና እቅዶች",
            billingDesc: "ክፍያዎች፣ ደረሰኞች እና ምዝገባዎች",
            technical: "ቴክኒካዊ ችግሮች",
            technicalDesc: "ስህተቶች፣ ሳንካዎች ወይም የመድረክ ችግሮች",
            general: "አጠቃላይ ጥያቄዎች",
            generalDesc: "ስለ የስራ ሰው ሁሉም ነገር"
        },
        faqTitle: "በተደጋጋሚ የሚጠየቁ ጥያቄዎች",
        noResults: "ምንም ተመሳሳይ ውጤት አልተገኘም።",
        needHelp: "አሁንም እርዳታ ይፈልጋሉ?",
        needHelpDesc: "የሚፈልጉትን መልስ ማግኘት አልቻሉም? እባክዎ ወዳጃዊ የድጋፍ ቡድናችንን ያነጋግሩ።",
        contactBtn: "ያግኙን",
        faqs: {
            account: "መለያ",
            accountQ1: "መለያ እንዴት መፍጠር እችላለሁ?",
            accountA1: "መለያ ለመፍጠር በላይኛው ቀኝ ጥግ ላይ ያለውን 'ይመዝገቡ' የሚለውን ቁልፍ ይጫኑ። በኢሜል ወይም በስልክ ቁጥር መመዝገብ ይችላሉ። መገለጫዎን ለማጠናቀቅ የማረጋገጫ ደረጃዎችን ይከተሉ።",
            accountQ2: "የይለፍ ቃሌን ረስቼዋለሁ፣ ምን ማድረግ አለብኝ?",
            accountA2: "በ'መግቢያ' ላይ ጠቅ ያድርጉ እና ከዚያ 'የይለፍ ቃል ረስተዋል' ይምረጡ። የዳግም ማስጀመሪያ አገናኝ ወይም OTP ኮድ ለመቀበል የተመዘገበውን ኢሜል ወይም ስልክ ቁጥር ያስገቡ።",
            payments: "ክፍያዎች እና አባልነት",
            paymentsQ1: "ምን ዓይነት የክፍያ ዘዴዎችን ይቀበላሉ?",
            paymentsA1: "በቴሌብር፣ ቻፓ (ሲቢኢ፣ አዋሽ፣ ወዘተ) እና ዋና ዋና ክሬዲት ካርዶች በኩል ደህንነቱ የተጠበቀ ክፍያዎችን እንቀበላለን። ሁሉም ግብይቶች የተመሰጠሩ ናቸው።",
            paymentsQ2: "ምዝገባዬን በማንኛውም ጊዜ መሰረዝ እችላለሁ?",
            paymentsA2: "አዎ፣ ምዝገባዎን ከመገለጫ ቅንብሮችዎ መሰረዝ ይችላሉ። የእርስዎ መዳረሻ እስከ አሁን ያለው የክፍያ ጊዜ መጨረሻ ድረስ ንቁ ሆኖ ይቆያል።",
            listings: "ዝርዝሮች",
            listingsQ1: "ስራ ወይም ጨረታ እንዴት ልለጥፍ እችላለሁ?",
            listingsA1: "ከገቡ በኋላ በአሰሳ አሞሌው ላይ 'ማስታወቂያ ለጥፍ' የሚለውን ጠቅ ያድርጉ። ምድብዎን (ስራ፣ ጨረታ፣ ወዘተ) ይምረጡ፣ ዝርዝሮቹን ይሙሉ እና ያስገቡ። አንዳንድ ዝርዝሮች ፕሪሚየም እቅድ ሊፈልጉ ይችላሉ።",
            listingsQ2: "ዝርዝሬ ለምን በመጠባበቅ ላይ ነው?",
            listingsA2: "ሁሉም ዝርዝሮች የማህበረሰብ መመሪያዎቻችንን እንደሚያሟሉ ለማረጋገጥ የጥራት ፍተሻ ያልፋሉ። ይህ ሂደት በተለምዶ በስራ ቀናት ከ2 ሰዓት ያነሰ ጊዜ ይወስዳል።"
        }
    },
    om: {
        badge: "Giddugala Deeggarsa",
        title: "Akkamitti isin gargaaruu dandeenya?",
        subtitle: "Beekumsa keenya barbaadaa ykn deebii barbaaddan argachuuf ramaddii armaan gadii sakatta'aa.",
        searchPlaceholder: "Dhimma keessan ibsaa (fkn 'jecha icciitii irra deebi'uun')",
        searchBtn: "Barbaadi",
        categories: {
            account: "Herrega & Seensaa",
            accountDesc: "Galmaa'uu ykn seenuun rakkoo",
            billing: "Kaffaltii & Karoora",
            billingDesc: "Kaffaltii, invoice fi galmaa'ina",
            technical: "Rakkoo Teeknikaa",
            technicalDesc: "Dogongora, hanqina ykn rakkoo waltajjii",
            general: "Gaaffilee Waliigalaa",
            generalDesc: "Waa'ee Yesra Sew hunda"
        },
        faqTitle: "Gaaffilee Yeroo Baay'ee Gaafataman",
        noResults: "Bu'aan walsimuu hin argamne.",
        needHelp: "Ammallee gargaarsa barbaadduu?",
        needHelpDesc: "Deebii barbaaddan argachuu hin dandeenye? Mee garee deeggarsa michuu keenya quunnamaa.",
        contactBtn: "Nu Quunnamaa",
        faqs: {
            account: "Herrega",
            accountQ1: "Herrega akkamiin uumuu danda'a?",
            accountA1: "Herrega uumuuf, golee mirga gubbaa irratti qabduu 'Galmaa'i' jedhu cuqaasaa. Email ykn lakkoofsa bilbilaa keessaniin galmaa'uu dandeessu. Profaayilii keessan xummuruuf tarkaanfiiwwan mirkaneessaa hordofaa.",
            accountQ2: "Jecha icciitii koo irraanfadheera, maal gochuu qaba?",
            accountA2: "'Seensaa' irratti cuqaasaatii 'Jecha Icciitii Irraanfadheera' filadhaa. Hidhaa irra deebi'uun ykn koodii OTP argachuuf email ykn lakkoofsa bilbilaa galmaa'e galchaa.",
            payments: "Kaffaltii & Miseensummaa",
            paymentsQ1: "Mala kaffaltii kamii fudhattuu?",
            paymentsA1: "Karaa Telebirr, Chapa (CBE, Awash, kkf) fi kaardii liqii gurguddaa nageenya qabuun kaffaltii fudhanna. Daldalaan hundi icciitiin eegameera.",
            paymentsQ2: "Galmaa'ina koo yeroo kamiiyyuu haquu nan danda'aa?",
            paymentsA2: "Eeyyee, galmaa'ina keessan qindaa'ina profaayilii keessanii irraa haquu dandeessu. Dhaqqabummaan keessan hanga xumura yeroo kaffaltii ammaa keessaniitti socho'aa ta'ee tura.",
            listings: "Tarreewwan",
            listingsQ1: "Hojii ykn caalbaa akkamiin maxxansuu danda'a?",
            listingsA1: "Erga seentanii booda, kabala navigeeshinii irratti 'Beeksisa Maxxansi' jedhu cuqaasaa. Ramaddii keessan (Hojii, Caalbaa, kkf) filadhaa, bal'ina guutaatii galchaa. Tarreewwan tokko tokko karoora premium barbaadu danda'u.",
            listingsQ2: "Tarreen koo maaliif eeggataa jira?",
            listingsA2: "Tarreewwan hundi qajeelfama hawaasaa keenya akka guutan mirkaneessuuf qorannoo qulqullina keessa darbu. Adeemsi kun yeroo baay'ee guyyoota hojii keessatti sa'aatii 2 gadi fudhata."
        }
    },
    ti: {
        badge: "ማእከል ደገፍ",
        title: "ከመይ ክንሕግዘኩም ንኽእል?",
        subtitle: "ናይ ፍልጠት ቤት-መዝገብና ድለዩ ወይ ዘድልየኩም መልሲ ንምርካብ ኣብ ታሕቲ ዘለዉ ምድባት ተመልከቱ።",
        searchPlaceholder: "ጉዳይኩም ግለጹ (ንኣብነት 'ቃል ምሕላፍ ዳግም ምጅማር')",
        searchBtn: "ድለይ",
        categories: {
            account: "ኣካውንት & መእተዊ",
            accountDesc: "ብምምዝጋብ ወይ ብምእታው ዝተፈጠረ ጸገማት",
            billing: "ክፍሊት & መደባት",
            billingDesc: "ክፍሊታት፣ ደረሰኛታትን ምዝገባታትን",
            technical: "ቴክኒካዊ ጸገማት",
            technicalDesc: "ጌጋታት፣ ሳንካታት ወይ ናይ መድረኽ ጸገማት",
            general: "ሓፈሻዊ ሕቶታት",
            generalDesc: "ብዛዕባ የስራ ሰው ዝኾነ ኩሉ"
        },
        faqTitle: "ብተደጋጋሚ ዝሕተቱ ሕቶታት",
        noResults: "ዝሰማማዕ ውጽኢት ኣይተረኽበን።",
        needHelp: "ገና ሓገዝ ይድልየኩም ድዩ?",
        needHelpDesc: "ዝደልይዎ መልሲ ክትረኽቡ ኣይከኣልኩምን? በጃኹም ምሕዝነታዊ ናይ ደገፍ ጋንታና ተራኸቡ።",
        contactBtn: "ተራኸቡና",
        faqs: {
            account: "ኣካውንት",
            accountQ1: "ኣካውንት ከመይ ክፈጥር ይኽእል?",
            accountA1: "ኣካውንት ንምፍጣር፣ ኣብ ላዕለዋይ የማን ኩርናዕ ዘሎ 'ተመዝገብ' ዝብል መልጎም ጠውቑ። ብኢመይል ወይ ብስልኪ ቁጽሪ ክትምዝገቡ ትኽእሉ። መገለጺኹም ንምዝዛም ናይ ምርግጋጽ ስጉምትታት ተኸተሉ።",
            accountQ2: "ቃል ምሕላፈይ ረሲዐዮ፣ እንታይ ክገብር ኣለኒ?",
            accountA2: "ኣብ 'መእተዊ' ጠውቑን ድሕሪኡ 'ቃል ምሕላፍ ረሲዐዮ' ምረጹ። ናይ ዳግም ምጅማር ኣገናኽ ወይ ናይ OTP ኮድ ንምርካብ ዝተመዝገበ ኢመይል ወይ ስልኪ ቁጽሪ ኣእትዉ።",
            payments: "ክፍሊታት & ኣባልነት",
            paymentsQ1: "እንታይ ዓይነት ናይ ክፍሊት ኣገባባት ትቕበሉ?",
            paymentsA1: "ብቴሌብር፣ ቻፓ (ሲቢኢ፣ ኣዋሽ፣ ወዘተ) ከምኡ'ውን ዓበይቲ ናይ ክሬዲት ካርድታት ብዝሓለወ ክፍሊታት ንቕበል። ኩሎም ግብይታት ብምስጢር ዝተሓለዉ እዮም።",
            paymentsQ2: "ምዝገባይ ኣብ ዝኾነ ግዜ ክሰርዞ ይኽእል'የ?",
            paymentsA2: "እወ፣ ምዝገባኹም ካብ ናይ መገለጺ ኣቀማምጣ ክትሰርዝዎ ትኽእሉ። ተበጻሕነትኩም ክሳብ መወዳእታ ናይ ሕጂ ናይ ክፍሊት ግዜኹም ንቡር ክኸውን እዩ።",
            listings: "ዝርዝራት",
            listingsQ1: "ስራሕ ወይ ጨረታ ከመይ ክልጥፎ ይኽእል?",
            listingsA1: "ድሕሪ ምእታው፣ ኣብ ናይ ምድህሳስ መደርዒ ዘሎ 'መወዓውዒ ለጥፍ' ጠውቑ። ምድብኹም (ስራሕ፣ ጨረታ፣ ወዘተ) ምረጹ፣ ዝርዝራት ምልኡን ኣቕርቡን። ገለ ዝርዝራት ፕሪሚየም መደብ ክሓትቱ ይኽእሉ።",
            listingsQ2: "ዝርዝረይ ስለምንታይ ኣብ ምጽባይ ኣሎ?",
            listingsA2: "ኩሎም ዝርዝራት ናይ ማሕበረሰብና መምርሒታት ከም ዝማልኡ ንምርግጋጽ ናይ ጽሬት ምርመራ ይሓልፉ። እዚ መስርሕ እዚ መብዛሕትኡ ግዜ ኣብ መዓልታት ስራሕ ካብ 2 ሰዓት ዝወሓደ ግዜ ይወስድ።"
        }
    }
};

const SupportPage = () => {
    const theme = useTheme();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;
    const [searchTerm, setSearchTerm] = useState('');
    const [expanded, setExpanded] = useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const categories = [
        { title: t.categories.account, icon: <AccountIcon fontSize="large" />, description: t.categories.accountDesc },
        { title: t.categories.billing, icon: <PaymentIcon fontSize="large" />, description: t.categories.billingDesc },
        { title: t.categories.technical, icon: <TechnicalIcon fontSize="large" />, description: t.categories.technicalDesc },
        { title: t.categories.general, icon: <HelpIcon fontSize="large" />, description: t.categories.generalDesc },
    ];

    const FAQS = [
        {
            category: t.faqs.account,
            questions: [
                { q: t.faqs.accountQ1, a: t.faqs.accountA1 },
                { q: t.faqs.accountQ2, a: t.faqs.accountA2 }
            ]
        },
        {
            category: t.faqs.payments,
            questions: [
                { q: t.faqs.paymentsQ1, a: t.faqs.paymentsA1 },
                { q: t.faqs.paymentsQ2, a: t.faqs.paymentsA2 }
            ]
        },
        {
            category: t.faqs.listings,
            questions: [
                { q: t.faqs.listingsQ1, a: t.faqs.listingsA1 },
                { q: t.faqs.listingsQ2, a: t.faqs.listingsA2 }
            ]
        }
    ];

    const filteredFaqs = FAQS.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
            q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(cat => cat.questions.length > 0);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

            {/* Hero Search Section */}
            <Box sx={{
                background: `linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)`,
                pt: { xs: 8, md: 10 },
                pb: { xs: 12, md: 16 },
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 600,
                    height: 600,
                    background: alpha(theme.palette.secondary.main, 0.05),
                    borderRadius: '50%',
                    filter: 'blur(80px)',
                    zIndex: 0
                }} />
                <Box sx={{
                    position: 'absolute',
                    bottom: -50,
                    left: -50,
                    width: 400,
                    height: 400,
                    background: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: '50%',
                    filter: 'blur(80px)',
                    zIndex: 0
                }} />

                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Chip
                            label={t.badge}
                            variant="outlined"
                            color="secondary"
                            sx={{ mb: 3, fontWeight: 'bold', borderColor: alpha(theme.palette.secondary.main, 0.5) }}
                        />
                        <Typography
                            variant="h2"
                            fontWeight="800"
                            gutterBottom
                            sx={{
                                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 2,
                                fontSize: { xs: '2.5rem', md: '4rem' }
                            }}
                        >
                            {t.title}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#555555', mb: 6, fontWeight: 300, maxWidth: '600px', mx: 'auto' }}>
                            {t.subtitle}
                        </Typography>

                        <Paper
                            component="form"
                            elevation={0}
                            sx={{
                                p: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: 650,
                                mx: 'auto',
                                borderRadius: '50px',
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
                                transition: 'all 0.3s ease',
                                '&:hover, &:focus-within': {
                                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)',
                                    borderColor: 'primary.main',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <Box sx={{ p: 2, pl: 3, color: 'text.secondary', display: 'flex' }}>
                                <SearchIcon />
                            </Box>
                            <InputBase
                                sx={{ ml: 1, flex: 1, fontSize: '1.1rem', py: 1 }}
                                placeholder={t.searchPlaceholder}
                                inputProps={{ 'aria-label': 'search help' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{
                                    borderRadius: 50,
                                    px: 4,
                                    py: 1.5,
                                    m: 0.5,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    boxShadow: 'none'
                                }}
                            >
                                {t.searchBtn}
                            </Button>
                        </Paper>
                    </motion.div>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: -6, mb: 8, position: 'relative', zIndex: 2 }}>

                {/* Category Cards */}
                <Grid container spacing={3} sx={{ mb: 8 }}>
                    {categories.map((cat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                            >
                                <Paper sx={{
                                    p: 3,
                                    textAlign: 'center',
                                    borderRadius: 4,
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
                                }}>
                                    <Avatar sx={{
                                        width: 60,
                                        height: 60,
                                        mx: 'auto',
                                        mb: 2,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main
                                    }}>
                                        {cat.icon}
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {cat.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {cat.description}
                                    </Typography>
                                </Paper>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {/* FAQ Section */}
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={10}>
                        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom sx={{ mb: 4 }}>
                            {t.faqTitle}
                        </Typography>

                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((section, idx) => (
                                <Box key={idx} sx={{ mb: 4 }}>
                                    <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 'bold', ml: 1 }}>
                                        {section.category}
                                    </Typography>
                                    {section.questions.map((faq, qIdx) => {
                                        const panelId = `panel${idx}-${qIdx}`;
                                        return (
                                            <Accordion
                                                key={qIdx}
                                                expanded={expanded === panelId}
                                                onChange={handleChange(panelId)}
                                                sx={{
                                                    mb: 1,
                                                    borderRadius: '12px !important',
                                                    boxShadow: 'none',
                                                    bgcolor: 'background.paper',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    '&:before': { display: 'none' },
                                                    '&.Mui-expanded': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                                                }}
                                            >
                                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                    <Typography fontWeight="medium">{faq.q}</Typography>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Typography variant="body2" color="text.secondary" paragraph>
                                                        {faq.a}
                                                    </Typography>
                                                </AccordionDetails>
                                            </Accordion>
                                        );
                                    })}
                                </Box>
                            ))
                        ) : (
                            <Typography align="center" color="text.secondary">{t.noResults}</Typography>
                        )}
                    </Grid>
                </Grid>

                {/* Bottom CTA */}
                <Box sx={{
                    mt: 8,
                    p: 4,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 3
                }}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {t.needHelp}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t.needHelpDesc}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            component={Link}
                            to="/contact"
                            variant="contained"
                            color="secondary"
                            size="large"
                            startIcon={<ChatIcon />}
                            sx={{ borderRadius: 50, px: 4 }}
                        >
                            {t.contactBtn}
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default SupportPage;
