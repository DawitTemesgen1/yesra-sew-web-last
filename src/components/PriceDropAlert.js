// Price Drop Alert Component
import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Chip, Button, Box, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import {
  TrendingDown, Notifications, Search, Star
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const PriceDropAlert = ({ listing, onSetAlert }) => {
  const [alertSet, setAlertSet] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentPrice = parseFloat(listing.price);
  const priceDrop = listing.original_price ? 
    ((listing.original_price - currentPrice) / listing.original_price * 100).toFixed(1) : 0;

  useEffect(() => {
    checkExistingAlert();
  }, [listing.id]);

  const checkExistingAlert = async () => {
    try {
      // Check if user has existing price alert for this listing
      const response = await apiService.getPriceAlerts(listing.id);
      if (response.data && response.data.length > 0) {
        setAlertSet(true);
        setTargetPrice(response.data[0].target_price);
      }
    } catch (error) {
    }
  };

  const handleSetAlert = async () => {
    if (!targetPrice || parseFloat(targetPrice) >= currentPrice) {
      toast.error('Please enter a target price lower than current price');
      return;
    }

    setLoading(true);
    try {
      await apiService.setPriceAlert(listing.id, {
        target_price: parseFloat(targetPrice),
        notification_method: 'push'
      });
      setAlertSet(true);
      setDialogOpen(false);
      toast.success('Price drop alert set successfully!');
    } catch (error) {
      toast.error('Failed to set price alert');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAlert = async () => {
    try {
      await apiService.removePriceAlert(listing.id);
      setAlertSet(false);
      setTargetPrice('');
      toast.success('Price alert removed');
    } catch (error) {
      toast.error('Failed to remove price alert');
    }
  };

  return (
    <>
      {priceDrop > 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Alert
            severity="success"
            icon={<TrendingDown />}
            sx={{ mb: 2 }}
            action={
              <Chip
                label={`-${priceDrop}%`}
                color="success"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            }
          >
            <Typography variant="body2">
              Price dropped by {priceDrop}%! Save {listing.original_price - currentPrice} ETB
            </Typography>
          </Alert>
        </motion.div>
      )}

      <Card sx={{ mb: 2, bgcolor: 'background.paper' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingDown color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Price Drop Alert
            </Typography>
            {alertSet && (
              <Chip
                label="Active"
                color="success"
                size="small"
                icon={<Notifications />}
              />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {alertSet 
              ? `We'll notify you when price drops below ${targetPrice} ETB`
              : `Get notified when this ${listing.category?.toLowerCase() || 'item'} drops below your target price`
            }
          </Typography>

          <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
            {currentPrice.toLocaleString()} ETB
          </Typography>

          {!alertSet ? (
            <Button
              variant="contained"
              fullWidth
              startIcon={<Notifications />}
              onClick={() => setDialogOpen(true)}
              sx={{ mb: 1 }}
            >
              Set Price Alert
            </Button>
          ) : (
            <Box>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setDialogOpen(true)}
                sx={{ mb: 1 }}
              >
                Edit Alert
              </Button>
              <Button
                variant="text"
                fullWidth
                color="error"
                onClick={handleRemoveAlert}
              >
                Remove Alert
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              💡 Tip: Set a realistic target price. Most sellers negotiate 10-20% below asking price.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Set Price Drop Alert
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current price: <strong>{currentPrice.toLocaleString()} ETB</strong>
          </Typography>

          <TextField
            fullWidth
            label="Target Price (ETB)"
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="Enter your target price"
            helperText={`Must be less than ${currentPrice.toLocaleString()} ETB`}
            sx={{ mb: 2 }}
          />

          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              📱 You'll receive a notification when the price drops to or below your target price.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSetAlert}
            variant="contained"
            disabled={loading || !targetPrice || parseFloat(targetPrice) >= currentPrice}
          >
            {alertSet ? 'Update Alert' : 'Set Alert'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PriceDropAlert;

