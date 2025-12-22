import React from 'react';
import {
    Container, Typography, Box, Paper, Divider, List, ListItem,
    ListItemText, useTheme, alpha, Chip, Stack
} from '@mui/material';
import { Shield, Lock, Visibility, Cookie } from '@mui/icons-material';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
    en: {
        title: "Privacy Policy",
        lastUpdated: "Last Updated: December 2024",
        intro: "At Yesra Sew Solution, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our marketplace platform.",
        commitment: "Our Commitment to Your Privacy",
        commitmentText: "We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy or practices, please contact us at privacy@yesrasew.com",
        sections: {
            collection: {
                title: "1. Information We Collect",
                subtitle: "We collect information that you provide directly to us:",
                points: [
                    "Account Information: Name, email address, phone number, and password",
                    "Profile Information: Profile picture, bio, and location",
                    "Listing Information: Details about items you list for sale",
                    "Transaction Information: Payment details and transaction history",
                    "Communications: Messages sent through our platform",
                    "Device Information: IP address, browser type, and operating system"
                ]
            },
            usage: {
                title: "2. How We Use Your Information",
                points: [
                    "To provide, maintain, and improve our services",
                    "To process transactions and send related information",
                    "To send you technical notices and support messages",
                    "To respond to your comments and questions",
                    "To detect, prevent, and address fraud and security issues",
                    "To comply with legal obligations"
                ]
            },
            sharing: {
                title: "3. Information Sharing",
                content: "We do not sell your personal information. We may share your information only in the following circumstances:",
                points: [
                    "With other users when you engage in transactions",
                    "With service providers who assist in our operations",
                    "When required by law or to protect our rights",
                    "In connection with a business transfer or acquisition"
                ]
            },
            security: {
                title: "4. Data Security",
                content: "We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
            },
            rights: {
                title: "5. Your Rights",
                points: [
                    "Access and update your personal information",
                    "Request deletion of your account and data",
                    "Opt-out of marketing communications",
                    "Object to processing of your personal data",
                    "Request a copy of your data"
                ]
            },
            cookies: {
                title: "6. Cookies and Tracking",
                content: "We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent."
            },
            children: {
                title: "7. Children's Privacy",
                content: "Our services are not intended for users under 18 years of age. We do not knowingly collect personal information from children under 18."
            },
            international: {
                title: "8. International Data Transfers",
                content: "Your information may be transferred to and maintained on computers located outside of your country where data protection laws may differ."
            },
            changes: {
                title: "9. Changes to This Policy",
                content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date."
            },
            contact: {
                title: "10. Contact Us",
                content: "If you have questions about this Privacy Policy, please contact us:",
                email: "Email: privacy@yesrasew.com",
                phone: "Phone: +251 11 XXX XXXX",
                address: "Address: Addis Ababa, Ethiopia"
            }
        }
    },
    am: {
        title: "የግላዊነት ፖሊሲ",
        lastUpdated: "መጨረሻ የታደሰው፡ ታህሳስ 2024",
        intro: "በየስራ ሰው የእርስዎን ግላዊነት በቁም ነገር እንወስዳለን። ይህ የግላዊነት ፖሊሲ የገበያ መድረካችንን በሚጠቀሙበት ጊዜ መረጃዎን እንዴት እንደምንሰበስብ፣ እንደምንጠቀም፣ እንደምናጋራ እና እንደምንጠብቅ ያብራራል።",
        commitment: "ለግላዊነትዎ ያለን ቁርጠኝነት",
        commitmentText: "የግል መረጃዎን እና የግላዊነት መብትዎን ለመጠበቅ ቁርጠኞች ነን። ስለ ፖሊሲያችን ወይም ተግባራችን ማንኛውም ጥያቄ ወይም ስጋት ካለዎት እባክዎ በ privacy@yesrasew.com ያግኙን",
        sections: {
            collection: {
                title: "1. የምንሰበስበው መረጃ",
                subtitle: "በቀጥታ ወደ እኛ የሚሰጡትን መረጃ እንሰበስባለን፡",
                points: [
                    "የመለያ መረጃ፡ ስም፣ ኢሜይል አድራሻ፣ ስልክ ቁጥር እና የይለፍ ቃል",
                    "የመገለጫ መረጃ፡ የመገለጫ ምስል፣ ባዮ እና አካባቢ",
                    "የዝርዝር መረጃ፡ ለሽያጭ የሚያስቀምጧቸው እቃዎች ዝርዝሮች",
                    "የግብይት መረጃ፡ የክፍያ ዝርዝሮች እና የግብይት ታሪክ",
                    "ግንኙነቶች፡ በመድረካችን በኩል የሚላኩ መልዕክቶች",
                    "የመሳሪያ መረጃ፡ IP አድራሻ፣ የአሳሽ አይነት እና ስርዓተ ክወና"
                ]
            },
            usage: {
                title: "2. መረጃዎን እንዴት እንደምንጠቀም",
                points: [
                    "አገልግሎቶቻችንን ለማቅረብ፣ ለመጠበቅ እና ለማሻሻል",
                    "ግብይቶችን ለማስኬድ እና ተዛማጅ መረጃ ለመላክ",
                    "ቴክኒካዊ ማስታወቂያዎችን እና የድጋፍ መልዕክቶችን ለመላክ",
                    "አስተያየቶችዎን እና ጥያቄዎችዎን ለመመለስ",
                    "ማጭበርበርን እና የደህንነት ጉዳዮችን ለመለየት፣ ለመከላከል እና ለመፍታት",
                    "ህጋዊ ግዴታዎችን ለማክበር"
                ]
            },
            sharing: {
                title: "3. መረጃ ማጋራት",
                content: "የግል መረጃዎን አንሸጥም። መረጃዎን በሚከተሉት ሁኔታዎች ብቻ እናጋራለን፡",
                points: [
                    "በግብይቶች ውስጥ ሲሳተፉ ከሌሎች ተጠቃሚዎች ጋር",
                    "በእኛ ስራዎች ውስጥ የሚያግዙ የአገልግሎት አቅራቢዎች ጋር",
                    "በህግ በሚፈለግበት ጊዜ ወይም መብቶቻችንን ለመጠበቅ",
                    "ከንግድ ማስተላለፍ ወይም ግዢ ጋር በተያያዘ"
                ]
            },
            security: {
                title: "4. የመረጃ ደህንነት",
                content: "የግል መረጃዎን ለመጠበቅ ተገቢ የቴክኒክ እና የድርጅት እርምጃዎችን እንተገብራለን። ሆኖም በበይነመረብ ላይ ምንም የማስተላለፍ ዘዴ 100% ደህንነቱ የተጠበቀ አይደለም።"
            },
            rights: {
                title: "5. መብቶችዎ",
                points: [
                    "የግል መረጃዎን ማግኘት እና ማዘመን",
                    "የመለያዎን እና መረጃዎን መሰረዝ መጠየቅ",
                    "ከግብይት ግንኙነቶች መውጣት",
                    "የግል መረጃዎን ማቀናበር ላይ መቃወም",
                    "የመረጃዎን ቅጂ መጠየቅ"
                ]
            },
            cookies: {
                title: "6. ኩኪዎች እና ክትትል",
                content: "በመድረካችን ላይ እንቅስቃሴን ለመከታተል እና የተወሰነ መረጃ ለመያዝ ኩኪዎችን እና ተመሳሳይ የክትትል ቴክኖሎጂዎችን እንጠቀማለን።"
            },
            children: {
                title: "7. የህጻናት ግላዊነት",
                content: "አገልግሎቶቻችን ከ18 ዓመት በታች ለሆኑ ተጠቃሚዎች አይደሉም። ከ18 ዓመት በታች ከሆኑ ህጻናት የግል መረጃ በማወቅ አንሰበስብም።"
            },
            international: {
                title: "8. ዓለም አቀፍ የመረጃ ማስተላለፍ",
                content: "መረጃዎ የመረጃ ጥበቃ ህጎች የተለያዩ ሊሆኑ ከሚችሉ ከአገርዎ ውጭ ወደሚገኙ ኮምፒውተሮች ሊተላለፍ እና ሊጠበቅ ይችላል።"
            },
            changes: {
                title: "9. ለዚህ ፖሊሲ ለውጦች",
                content: "ይህንን የግላዊነት ፖሊሲ በየጊዜው ማዘመን እንችላለን። አዲሱን የግላዊነት ፖሊሲ በዚህ ገጽ ላይ በመለጠፍ እና 'መጨረሻ የታደሰው' ቀን በማዘመን ማንኛውንም ለውጦች እናሳውቅዎታለን።"
            },
            contact: {
                title: "10. ያግኙን",
                content: "ስለዚህ የግላዊነት ፖሊሲ ጥያቄዎች ካሉዎት እባክዎ ያግኙን፡",
                email: "ኢሜይል፡ privacy@yesrasew.com",
                phone: "ስልክ፡ +251 11 XXX XXXX",
                address: "አድራሻ፡ አዲስ አበባ፣ ኢትዮጵያ"
            }
        }
    }
};

const PrivacyPolicy = () => {
    const theme = useTheme();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
            <SEO
                title="Privacy Policy"
                description="Yesra Sew Solution Privacy Policy - Learn how we protect your personal information and data on Ethiopia's premier marketplace"
                keywords="privacy policy, data protection, user privacy, yesrasew privacy, ethiopia marketplace privacy"
            />

            <Container maxWidth="md">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 6 },
                        borderRadius: 4,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Shield sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h3" fontWeight="bold" gutterBottom>
                            {t.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t.lastUpdated}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* Introduction */}
                    <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                        {t.intro}
                    </Typography>

                    {/* Commitment Box */}
                    <Paper
                        sx={{
                            p: 3,
                            my: 4,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            borderRadius: 3
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                            <Lock sx={{ color: 'primary.main', fontSize: 32 }} />
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                {t.commitment}
                            </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                            {t.commitmentText}
                        </Typography>
                    </Paper>

                    <Divider sx={{ my: 4 }} />

                    {/* Sections */}
                    <Box sx={{ '& > *:not(:last-child)': { mb: 4 } }}>
                        {/* Information Collection */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.collection.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                {t.sections.collection.subtitle}
                            </Typography>
                            <List sx={{ pl: 2 }}>
                                {t.sections.collection.points.map((point, index) => (
                                    <ListItem key={index} sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
                                        <ListItemText primary={point} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Usage */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.usage.title}
                            </Typography>
                            <List sx={{ pl: 2 }}>
                                {t.sections.usage.points.map((point, index) => (
                                    <ListItem key={index} sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
                                        <ListItemText primary={point} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Sharing */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.sharing.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {t.sections.sharing.content}
                            </Typography>
                            <List sx={{ pl: 2 }}>
                                {t.sections.sharing.points.map((point, index) => (
                                    <ListItem key={index} sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
                                        <ListItemText primary={point} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Security */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.security.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {t.sections.security.content}
                            </Typography>
                        </Box>

                        {/* Rights */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.rights.title}
                            </Typography>
                            <List sx={{ pl: 2 }}>
                                {t.sections.rights.points.map((point, index) => (
                                    <ListItem key={index} sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
                                        <ListItemText primary={point} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Cookies */}
                        <Box>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <Cookie sx={{ color: 'primary.main' }} />
                                <Typography variant="h5" fontWeight="bold" color="primary">
                                    {t.sections.cookies.title}
                                </Typography>
                            </Stack>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {t.sections.cookies.content}
                            </Typography>
                        </Box>

                        {/* Children */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.children.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {t.sections.children.content}
                            </Typography>
                        </Box>

                        {/* International */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.international.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {t.sections.international.content}
                            </Typography>
                        </Box>

                        {/* Changes */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.changes.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {t.sections.changes.content}
                            </Typography>
                        </Box>

                        {/* Contact */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.contact.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {t.sections.contact.content}
                            </Typography>
                            <Stack spacing={1} sx={{ mt: 2 }}>
                                <Chip label={t.sections.contact.email} color="primary" variant="outlined" />
                                <Chip label={t.sections.contact.phone} color="primary" variant="outlined" />
                                <Chip label={t.sections.contact.address} color="primary" variant="outlined" />
                            </Stack>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default PrivacyPolicy;

