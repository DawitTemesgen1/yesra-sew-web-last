import React, { useMemo } from 'react';
import { Box, Typography, Stack, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * LiveActivityIndicators - Displays real-time feeling indicators like "Active Now" 
 * or "5 people looking" to create a sense of urgency and activity.
 */
const LiveActivityIndicators = ({ listing, compact = false }) => {
  const theme = useTheme();

  // Pseudo-random but consistent based on listing ID
  const activityData = useMemo(() => {
    // Generate a seed from listing ID or use a default
    const seed = typeof listing?.id === 'string'
      ? listing.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : Math.floor(Math.random() * 1000);

    return {
      viewerCount: (seed % 12) + 2, // 2-14 viewers
      isActive: seed % 3 === 0,    // 1 in 3 chance of "Active Now"
      lastActivity: (seed % 60) + 1 // 1-60 mins ago
    };
  }, [listing?.id]);

  if (!listing) return null;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {/* Pulse Dot */}
      <Box sx={{ position: 'relative', width: 8, height: 8 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: '#4CAF50',
            position: 'absolute'
          }}
        />
        <motion.div
          animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            position: 'absolute'
          }}
        />
      </Box>

      <Typography
        variant="caption"
        sx={{
          fontSize: compact ? '0.65rem' : '0.75rem',
          fontWeight: 600,
          color: 'text.secondary',
          opacity: 0.8
        }}
      >
        {activityData.viewerCount} {compact ? 'viewing' : 'people viewing now'}
      </Typography>
    </Stack>
  );
};

export default LiveActivityIndicators;

