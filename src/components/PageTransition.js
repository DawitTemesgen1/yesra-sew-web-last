import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
    const location = useLocation();

    return (
        <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }} // Subtle slide up
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} // Subtle slide up on exit
            transition={{ duration: 0.25, ease: 'easeOut' }} // Fast and smooth
            style={{ width: '100%', position: 'absolute' }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;

