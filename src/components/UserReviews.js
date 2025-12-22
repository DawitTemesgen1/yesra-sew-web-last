// User Reviews & Ratings Component
import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Box, Rating, Avatar, Chip,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, List, ListItem, ListItemText, Divider, Alert
} from '@mui/material';
import {
  Star, RateReview, Person, ThumbUp, ThumbDown, Report
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const UserReviews = ({ userId, userType = 'seller' }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    transaction_id: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      const response = await apiService.getUserReviews(userId);
      const reviewsData = response.data || [];
      setReviews(reviewsData);
      
      if (reviewsData.length > 0) {
        const total = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        const average = total / reviewsData.length;
        setAverageRating(average);
        setTotalReviews(reviewsData.length);
      }
    } catch (error) {
    }
  };

  const handleSubmitReview = async () => {
    if (!formData.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setLoading(true);
    try {
      await apiService.createReview(userId, formData);
      toast.success('Review submitted successfully!');
      setDialogOpen(false);
      setFormData({
        rating: 5,
        comment: '',
        transaction_id: ''
      });
      fetchReviews();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInDays = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[5 - review.rating]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Star color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Reviews & Ratings
          </Typography>
          <Button
            variant="contained"
            startIcon={<RateReview />}
            onClick={() => setDialogOpen(true)}
            size="small"
          >
            Write Review
          </Button>
        </Box>

        {totalReviews === 0 ? (
          <Alert severity="info">
            <Typography variant="body2">
              Be the first to review this {userType}!
            </Typography>
          </Alert>
        ) : (
          <Box sx={{ mb: 3 }}>
            {/* Rating Summary */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ textAlign: 'center', mr: 3 }}>
                <Typography variant="h3" color="primary">
                  {averageRating.toFixed(1)}
                </Typography>
                <Rating value={averageRating} precision={0.1} readOnly />
                <Typography variant="caption" color="text.secondary">
                  {totalReviews} reviews
                </Typography>
              </Box>
              
              <Box sx={{ flexGrow: 1 }}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ width: 40 }}>
                      {rating} ★
                    </Typography>
                    <Box sx={{ flexGrow: 1, mx: 1 }}>
                      <Box
                        sx={{
                          height: 8,
                          bgcolor: 'grey.200',
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${(ratingDistribution[5 - rating] / totalReviews) * 100}%`,
                            bgcolor: 'primary.main'
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ width: 30, textAlign: 'right' }}>
                      {ratingDistribution[5 - rating]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Reviews List */}
        {reviews.length > 0 && (
          <List>
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <Avatar sx={{ mr: 2 }}>
                    <Person />
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                          {review.reviewer_name || 'Anonymous'}
                        </Typography>
                        <Rating value={review.rating} size="small" readOnly />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {formatDate(review.created_at)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                          {review.comment}
                        </Typography>
                        {review.transaction_id && (
                          <Chip
                            label="Verified Purchase"
                            size="small"
                            color="success"
                            sx={{ mr: 1 }}
                          />
                        )}
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button size="small" startIcon={<ThumbUp />}>
                            Helpful
                          </Button>
                          <Button size="small" startIcon={<Report />} color="error">
                            Report
                          </Button>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < reviews.length - 1 && <Divider sx={{ my: 2 }} />}
              </motion.div>
            ))}
          </List>
        )}

        {/* Review Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Write a Review
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Share your experience with this {userType}
            </Typography>

            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Rating
              </Typography>
              <Rating
                value={formData.rating}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, rating: newValue });
                }}
                size="large"
              />
            </Box>

            <TextField
              fullWidth
              label="Your Review"
              multiline
              rows={4}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Describe your experience with this seller/listing..."
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Transaction ID (Optional)"
              value={formData.transaction_id}
              onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
              placeholder="If this was a verified transaction"
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                Your review helps other users make informed decisions. Please be honest and constructive.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitReview}
              variant="contained"
              disabled={loading || !formData.comment.trim()}
            >
              Submit Review
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserReviews;

