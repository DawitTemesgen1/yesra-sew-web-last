import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Container, Typography, CircularProgress, Alert, Paper,
    Grid, Button, Divider
} from '@mui/material';
import pagesService from '../services/pagesService';
import SEO from '../components/SEO';
// import ReactMarkdown from 'react-markdown'; // Removed dependency

const DynamicPage = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                setLoading(true);
                // If slug is not provided, maybe it's home or implicit? 
                // But Route is /:slug, so it should be there.
                const pageSlug = slug || 'home';
                const data = await pagesService.getPageBySlug(pageSlug);

                if (!data) {
                    setError('Page not found');
                } else {
                    setPage(data);
                }
            } catch (err) {
                console.error('Error fetching page:', err);
                setError('Failed to load page content');
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !page) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error || 'Page not found'}</Alert>
                <Button variant="outlined" href="/">Go Home</Button>
            </Container>
        );
    }

    return (
        <Box>
            <SEO
                title={page.title}
                description={page.meta_description || `${page.title} - YesraSew`}
                keywords={Array.isArray(page.meta_keywords) ? page.meta_keywords.join(', ') : (page.meta_keywords || `${slug}, yesrasew, legal, ethiopia`)}
            />
            {/* SEO Meta Tags could go here (Helmet) */}

            {page.sections && page.sections.length > 0 ? (
                page.sections.map((section, index) => (
                    <PageSection key={section.id || index} section={section} />
                ))
            ) : (
                <Container maxWidth="md" sx={{ py: 8 }}>
                    <Typography variant="h3" gutterBottom>{page.title}</Typography>
                    <Typography variant="body1">No content added to this page yet.</Typography>
                </Container>
            )}
        </Box>
    );
};

const PageSection = ({ section }) => {
    const { type, content } = section;

    switch (type) {
        case 'hero':
            return (
                <Box sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: 8,
                    textAlign: 'center',
                    backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                    <Container maxWidth="md">
                        <Typography variant="h2" fontWeight="bold" gutterBottom>{content.title}</Typography>
                        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>{content.subtitle}</Typography>
                        {content.ctaLink && (
                            <Button variant="contained" color="secondary" size="large" href={content.ctaLink}>
                                {content.ctaText || 'Learn More'}
                            </Button>
                        )}
                    </Container>
                </Box>
            );

        case 'content':
            return (
                <Container maxWidth="md" sx={{ py: 6 }}>
                    {/* Dangerous HTML rendering for rich text content */}
                    <div dangerouslySetInnerHTML={{ __html: content.html }} />
                </Container>
            );

        case 'features':
            return (
                <Box sx={{ py: 8, bgcolor: 'background.default' }}>
                    <Container>
                        <Typography variant="h3" align="center" gutterBottom>{content.title}</Typography>
                        <Grid container spacing={4} sx={{ mt: 4 }}>
                            {content.features?.map((feature, idx) => (
                                <Grid item xs={12} md={4} key={idx}>
                                    <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                                        <Typography variant="h6" gutterBottom>{feature.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>
            );

        default:
            return null;
    }
};

export default DynamicPage;
