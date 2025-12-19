import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                bgcolor: 'background.default'
            }}
        >
            <SEO title="Page Not Found - 404" />
            <Container maxWidth="sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '6rem', md: '10rem' },
                            fontWeight: 900,
                            color: 'primary.main',
                            opacity: 0.2,
                            lineHeight: 1
                        }}
                    >
                        404
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Page Not Found
                    </Typography>
                    <Typography color="text.secondary" paragraph sx={{ mb: 4 }}>
                        The page you are looking for might have been removed, had its name changed,
                        or is temporarily unavailable.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/')}
                        >
                            Go Home
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </Button>
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
};

export default NotFoundPage;
