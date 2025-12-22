import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

const SplashScreen = ({ onFinish }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress >= 100) {
                    clearInterval(timer);
                    setTimeout(() => onFinish(), 500);
                    return 100;
                }
                return prevProgress + 10;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [onFinish]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5C2 100%)',
                        zIndex: 9999
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            duration: 0.8,
                            ease: [0.6, -0.05, 0.01, 0.99]
                        }}
                    >
                        <Box
                            component="img"
                            src={logo}
                            alt="Yesra Sew Logo"
                            sx={{
                                width: { xs: 150, sm: 200 },
                                height: { xs: 150, sm: 200 },
                                mb: 4,
                                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))'
                            }}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                fontFamily: 'Playfair Display, serif',
                                fontWeight: 'bold',
                                color: 'white',
                                mb: 1,
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                fontSize: { xs: '2rem', sm: '3rem' }
                            }}
                        >
                            Yesra Sew
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'rgba(255,255,255,0.9)',
                                mb: 4,
                                fontStyle: 'italic',
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                            }}
                        >
                            የስራ ሰው - Your Marketplace
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                    >
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                            <CircularProgress
                                variant="determinate"
                                value={progress}
                                size={60}
                                thickness={4}
                                sx={{
                                    color: 'white',
                                    '& .MuiCircularProgress-circle': {
                                        strokeLinecap: 'round'
                                    }
                                }}
                            />
                            <Box
                                sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    component="div"
                                    sx={{ color: 'white', fontWeight: 'bold' }}
                                >
                                    {`${Math.round(progress)}%`}
                                </Typography>
                            </Box>
                        </Box>
                    </motion.div>
                </Box>
            </motion.div>
        </AnimatePresence>
    );
};

export default SplashScreen;

