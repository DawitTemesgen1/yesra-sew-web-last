// WhatsApp Share Component
import React, { useState } from 'react';
import {
  Button, Box, Typography, Snackbar, Alert, Tooltip
} from '@mui/material';
import {
  WhatsApp, Share, ContentCopy, CheckCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const WhatsAppShare = ({ listing }) => {
  const [copied, setCopied] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const formatListingMessage = () => {
    const message = `🔥 ${listing.title}

💰 Price: ${listing.price ? `${listing.price.toLocaleString()} ETB` : 'Contact for price'}
📍 Location: ${listing.location || 'Not specified'}
📱 Posted on Yesra Sew Solution

${listing.description ? `${listing.description.substring(0, 200)}...` : ''}

👉 View details: ${window.location.origin}/listings/${listing.id}

#Yesra Sew Solution #Ethiopia #Classifieds #${listing.category?.replace(/\s+/g, '') || 'Marketplace'}`;

    return message;
  };

  const shareViaWhatsApp = () => {
    const message = formatListingMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    // Track share event
    if (window.gtag) {
      window.gtag('event', 'share', {
        method: 'whatsapp',
        content_type: 'listing',
        item_id: listing.id
      });
    }
  };

  const copyToClipboard = async () => {
    const message = formatListingMessage();

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setSnackbarOpen(true);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);

      // Track copy event
      if (window.gtag) {
        window.gtag('event', 'copy', {
          content_type: 'listing',
          item_id: listing.id
        });
      }
    } catch (error) {
    }
  };

  const shareViaSystem = async () => {
    const message = formatListingMessage();
    const shareData = {
      title: listing.title,
      text: message,
      url: `${window.location.origin}/listings/${listing.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying to clipboard
        copyToClipboard();
      }
    } catch (error) {
    }
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Share sx={{ mr: 1 }} />
          Share Listing
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              startIcon={<WhatsApp />}
              onClick={shareViaWhatsApp}
              sx={{
                bgcolor: '#25D366',
                '&:hover': { bgcolor: '#128C7E' },
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              WhatsApp
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              startIcon={copied ? <CheckCircle /> : <ContentCopy />}
              onClick={copyToClipboard}
              color={copied ? 'success' : 'primary'}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </motion.div>

          {navigator.share && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Tooltip title="Share via system share dialog">
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={shareViaSystem}
                >
                  Share
                </Button>
              </Tooltip>
            </motion.div>
          )}
        </Box>

        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            📱 Share on WhatsApp to reach more buyers in Ethiopia
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Listing copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default WhatsAppShare;
