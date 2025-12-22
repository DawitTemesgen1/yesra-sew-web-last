import React from 'react';
import {
    Container, Typography, Box, Paper, Divider, List, ListItem,
    ListItemText, useTheme, alpha
} from '@mui/material';
import { Shield, Gavel, Security } from '@mui/icons-material';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
    en: {
        title: "Terms of Service",
        lastUpdated: "Last Updated: December 2024",
        intro: "Welcome to Yesra Sew Solution - Ethiopia's Premier Marketplace. By accessing or using our platform, you agree to be bound by these Terms of Service.",
        sections: {
            acceptance: {
                title: "1. Acceptance of Terms",
                content: "By creating an account or using Yesra Sew Solution, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy."
            },
            eligibility: {
                title: "2. Eligibility",
                content: "You must be at least 18 years old to use Yesra Sew Solution. By using our services, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms."
            },
            userAccounts: {
                title: "3. User Accounts",
                points: [
                    "You are responsible for maintaining the confidentiality of your account credentials",
                    "You agree to provide accurate, current, and complete information during registration",
                    "You are responsible for all activities that occur under your account",
                    "You must notify us immediately of any unauthorized use of your account"
                ]
            },
            listings: {
                title: "4. Listing Guidelines",
                points: [
                    "All listings must be accurate, truthful, and not misleading",
                    "Prohibited items include illegal goods, weapons, drugs, and counterfeit products",
                    "You retain ownership of your content but grant Yesra Sew Solution a license to display it",
                    "We reserve the right to remove any listing that violates our policies"
                ]
            },
            transactions: {
                title: "5. Transactions",
                content: "Yesra Sew Solution acts as a platform connecting buyers and sellers. We are not a party to transactions between users. All transactions are at your own risk, and we encourage you to exercise caution and due diligence."
            },
            fees: {
                title: "6. Fees and Payments",
                content: "Certain services may require payment of fees. All fees are non-refundable unless otherwise stated. We reserve the right to change our fee structure with prior notice."
            },
            prohibited: {
                title: "7. Prohibited Conduct",
                points: [
                    "Violating any applicable laws or regulations",
                    "Infringing on intellectual property rights",
                    "Posting false, misleading, or fraudulent content",
                    "Harassing, threatening, or abusing other users",
                    "Attempting to manipulate or game the platform"
                ]
            },
            termination: {
                title: "8. Termination",
                content: "We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or any other reason we deem necessary to protect our platform and users."
            },
            liability: {
                title: "9. Limitation of Liability",
                content: "Yesra Sew Solution is provided 'as is' without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the platform."
            },
            changes: {
                title: "10. Changes to Terms",
                content: "We may update these Terms from time to time. Continued use of Yesra Sew Solution after changes constitutes acceptance of the updated Terms."
            },
            contact: {
                title: "11. Contact Information",
                content: "For questions about these Terms, please contact us at legal@yesrasew.com"
            }
        }
    },
    am: {
        title: "የአገልግሎት ውል",
        lastUpdated: "መጨረሻ የታደሰው፡ ታህሳስ 2024",
        intro: "ወደ የስራ ሰው - የኢትዮጵያ ቀዳሚ የገበያ ቦታ እንኳን በደህና መጡ። መድረካችንን በመድረስ ወይም በመጠቀም እነዚህን የአገልግሎት ውሎች ለማክበር ተስማምተዋል።",
        sections: {
            acceptance: {
                title: "1. የውሎች ተቀባይነት",
                content: "መለያ በመፍጠር ወይም የስራ ሰውን በመጠቀም እነዚህን የአገልግሎት ውሎች እና የግላዊነት ፖሊሲያችንን እንደ አነበቡ፣ እንደተረዱ እና ለማክበር እንደተስማሙ ያረጋግጣሉ።"
            },
            eligibility: {
                title: "2. ብቁነት",
                content: "የስራ ሰውን ለመጠቀም ቢያንስ 18 ዓመት መሆን አለብዎት። አገልግሎታችንን በመጠቀም ይህንን የዕድሜ መስፈርት እንደሚያሟሉ እና እነዚህን ውሎች ለመግባት ህጋዊ አቅም እንዳለዎት ይወክላሉ።"
            },
            userAccounts: {
                title: "3. የተጠቃሚ መለያዎች",
                points: [
                    "የመለያ ምስክርነቶችዎን ሚስጥራዊነት ለመጠበቅ ኃላፊነት አለብዎት",
                    "በምዝገባ ወቅት ትክክለኛ፣ ወቅታዊ እና ሙሉ መረጃ ለመስጠት ተስማምተዋል",
                    "በመለያዎ ስር ለሚከሰቱ ሁሉም ተግባራት ኃላፊነት አለብዎት",
                    "ማንኛውንም ያልተፈቀደ የመለያዎን አጠቃቀም ወዲያውኑ ማሳወቅ አለብዎት"
                ]
            },
            listings: {
                title: "4. የዝርዝር መመሪያዎች",
                points: [
                    "ሁሉም ዝርዝሮች ትክክለኛ፣ እውነተኛ እና አሳሳች ያልሆኑ መሆን አለባቸው",
                    "የተከለከሉ እቃዎች ህገወጥ እቃዎች፣ መሳሪያዎች፣ መድሃኒቶች እና ሐሰተኛ ምርቶችን ያካትታሉ",
                    "የእርስዎን ይዘት ባለቤትነት ይይዛሉ ነገር ግን ለየስራ ሰው ለማሳየት ፈቃድ ይሰጣሉ",
                    "ፖሊሲያችንን የሚጥስ ማንኛውንም ዝርዝር የማስወገድ መብት እንይዛለን"
                ]
            },
            transactions: {
                title: "5. ግብይቶች",
                content: "የስራ ሰው ገዢዎችን እና ሻጮችን የሚያገናኝ መድረክ ሆኖ ያገለግላል። በተጠቃሚዎች መካከል ባሉ ግብይቶች ውስጥ ተሳታፊ አይደለንም። ሁሉም ግብይቶች በራስዎ ስጋት ላይ ናቸው።"
            },
            fees: {
                title: "6. ክፍያዎች እና ክፍያዎች",
                content: "አንዳንድ አገልግሎቶች የክፍያ ክፍያዎችን ሊፈልጉ ይችላሉ። ሁሉም ክፍያዎች ተመላሽ የማይደረጉ ናቸው።"
            },
            prohibited: {
                title: "7. የተከለከለ ባህሪ",
                points: [
                    "ማንኛውንም ተፈጻሚ ህጎችን ወይም ደንቦችን መጣስ",
                    "የአእምሮ ንብረት መብቶችን መጣስ",
                    "ሐሰተኛ፣ አሳሳች ወይም ማጭበርበር ይዘት መለጠፍ",
                    "ሌሎች ተጠቃሚዎችን ማስፈራራት ወይም በደል ማድረስ",
                    "መድረኩን ለመጫወት መሞከር"
                ]
            },
            termination: {
                title: "8. ማቋረጥ",
                content: "እነዚህን ውሎች በመጣስ፣ በማጭበርበር ወይም መድረካችንን እና ተጠቃሚዎቻችንን ለመጠበቅ አስፈላጊ ነው ብለን በምናስበው ማንኛውም ምክንያት መለያዎን በማንኛውም ጊዜ የማገድ ወይም የማቋረጥ መብት እንይዛለን።"
            },
            liability: {
                title: "9. የኃላፊነት ገደብ",
                content: "የስራ ሰው ያለ ማንኛውም ዋስትና 'እንዳለ' ይቀርባል። መድረኩን ከመጠቀምዎ የሚመጡ ማንኛውም ቀጥተኛ ያልሆኑ ጉዳቶች ኃላፊነት የለብንም።"
            },
            changes: {
                title: "10. ለውሎች ለውጦች",
                content: "እነዚህን ውሎች በየጊዜው ማዘመን እንችላለን። ከለውጦች በኋላ የስራ ሰውን መቀጠል የዘመነውን ውሎች መቀበልን ያመለክታል።"
            },
            contact: {
                title: "11. የመገኛ አድራሻ",
                content: "ስለእነዚህ ውሎች ጥያቄዎች ካሉዎት እባክዎ በ legal@yesrasew.com ያግኙን"
            }
        }
    }
};

const TermsOfService = () => {
    const theme = useTheme();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
            <SEO
                title="Terms of Service"
                description="Yesra Sew Solution Terms of Service - Read our terms and conditions for using Ethiopia's premier marketplace platform"
                keywords="terms of service, user agreement, yesrasew terms, marketplace terms ethiopia"
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
                        <Gavel sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
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

                    <Divider sx={{ my: 4 }} />

                    {/* Sections */}
                    <Box sx={{ '& > *:not(:last-child)': { mb: 4 } }}>
                        {/* Acceptance */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.acceptance.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {t.sections.acceptance.content}
                            </Typography>
                        </Box>

                        {/* Eligibility */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.eligibility.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {t.sections.eligibility.content}
                            </Typography>
                        </Box>

                        {/* User Accounts */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.userAccounts.title}
                            </Typography>
                            <List sx={{ pl: 2 }}>
                                {t.sections.userAccounts.points.map((point, index) => (
                                    <ListItem key={index} sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
                                        <ListItemText primary={point} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Listings */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.listings.title}
                            </Typography>
                            <List sx={{ pl: 2 }}>
                                {t.sections.listings.points.map((point, index) => (
                                    <ListItem key={index} sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
                                        <ListItemText primary={point} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Transactions */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.transactions.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {t.sections.transactions.content}
                            </Typography>
                        </Box>

                        {/* Fees */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.fees.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {t.sections.fees.content}
                            </Typography>
                        </Box>

                        {/* Prohibited Conduct */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.prohibited.title}
                            </Typography>
                            <List sx={{ pl: 2 }}>
                                {t.sections.prohibited.points.map((point, index) => (
                                    <ListItem key={index} sx={{ display: 'list-item', listStyleType: 'disc', pl: 0 }}>
                                        <ListItemText primary={point} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Termination */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.termination.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {t.sections.termination.content}
                            </Typography>
                        </Box>

                        {/* Liability */}
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
                                {t.sections.liability.title}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                {t.sections.liability.content}
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
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default TermsOfService;

