// Trust Badges & Verification Component
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Chip, Avatar, useTheme, alpha, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, ListItemIcon, Alert
} from '@mui/material';
import {
  Verified, Shield, Star, Person, CheckCircle, Security, Phone, Email, Fingerprint, Badge, VerifiedUser
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const TrustBadges = ({ user, showActions = true }) => {
  const [verificationStatus, setVerificationStatus] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVerificationStatus();
  }, [user?.id]);

  const fetchVerificationStatus = async () => {
    try {
      const response = await apiService.getVerificationStatus();
      setVerificationStatus(response.data || {});
    } catch (error) {
    }
  };

  const handleVerifyPhone = async () => {
    setLoading(true);
    try {
      await apiService.verifyPhoneNumber({ phone_number: user.phone_number });
      toast.success('Verification code sent to your phone!');
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      await apiService.verifyEmail({ email: user.email });
      toast.success('Verification email sent!');
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIdentity = async () => {
    setLoading(true);
    try {
      await apiService.verifyIdentity({
        full_name: user.full_name,
        id_type: 'national_id',
        id_number: '',
        id_document_url: ''
      });
      toast.success('Identity verification initiated!');
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to initiate identity verification');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationLevel = () => {
    const verifiedCount = [
      verificationStatus.phone_verified,
      verificationStatus.email_verified,
      verificationStatus.identity_verified,
      verificationStatus.business_verified
    ].filter(Boolean).length;

    if (verifiedCount === 0) return { level: 'Basic', color: 'default', icon: <Person /> };
    if (verifiedCount === 1) return { level: 'Verified', color: 'info', icon: <CheckCircle /> };
    if (verifiedCount === 2) return { level: 'Trusted', color: 'success', icon: <Shield /> };
    if (verifiedCount === 3) return { level: 'Premium', color: 'warning', icon: <Star /> };
    return { level: 'Elite', color: 'secondary', icon: <Badge /> };
  };

  const verificationLevel = getVerificationLevel();

  const badges = [
    {
      id: 'phone',
      label: 'Phone Verified',
      icon: <Phone />,
      verified: verificationStatus.phone_verified,
      color: 'success',
      description: 'Phone number has been verified'
    },
    {
      id: 'email',
      label: 'Email Verified',
      icon: <Email />,
      verified: verificationStatus.email_verified,
      color: 'success',
      description: 'Email address has been verified'
    },
    {
      id: 'identity',
      label: 'Identity Verified',
      icon: <Fingerprint />,
      verified: verificationStatus.identity_verified,
      color: 'warning',
      description: 'Government ID has been verified'
    },
    {
      id: 'business',
      label: 'Business Verified',
      icon: <Security />,
      verified: verificationStatus.business_verified,
      color: 'primary',
      description: 'Business documents have been verified'
    },
    {
      id: 'premium',
      label: 'Premium Member',
      icon: <Star />,
      verified: user.subscription_plan !== 'Free',
      color: 'warning',
      description: 'Premium subscription member'
    },
    {
      id: 'top_rated',
      label: 'Top Rated',
      icon: <Badge />,
      verified: user.rating >= 4.5,
      color: 'secondary',
      description: 'Maintains excellent ratings'
    }
  ];

  const verificationActions = [
    {
      title: 'Phone Verification',
      description: 'Verify your phone number to build trust',
      icon: <Phone />,
      action: handleVerifyPhone,
      disabled: verificationStatus.phone_verified,
      completed: verificationStatus.phone_verified
    },
    {
      title: 'Email Verification',
      description: 'Verify your email address for security',
      icon: <Email />,
      action: handleVerifyEmail,
      disabled: verificationStatus.email_verified,
      completed: verificationStatus.email_verified
    },
    {
      title: 'Identity Verification',
      description: 'Upload government ID for maximum trust',
      icon: <Fingerprint />,
      action: handleVerifyIdentity,
      disabled: verificationStatus.identity_verified,
      completed: verificationStatus.identity_verified
    }
  ];

  return (
    <Box>
      {/* Verification Level Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <Chip
          label={verificationLevel.level}
          color={verificationLevel.color}
          variant="outlined"
          icon={verificationLevel.icon}
          sx={{ mb: 2, fontSize: '0.875rem', fontWeight: 'bold' }}
        />
      </motion.div>

      {/* Trust Badges Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {badges.map((badge, index) => (
          badge.verified && (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Tooltip title={badge.description}>
                <Chip
                  label={badge.label}
                  color={badge.color}
                  size="small"
                  icon={badge.icon}
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Tooltip>
            </motion.div>
          )
        ))}
      </Box>

      {/* Trust Score */}
      {user.rating && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Trust Score:
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mr: 1 }}>
            {user.rating.toFixed(1)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({user.reviews_count || 0} reviews)
          </Typography>
        </Box>
      )}

      {/* Verification Actions */}
      {showActions && (
        <Box>
          <Button
            variant="outlined"
            startIcon={<VerifiedUser />}
            onClick={() => setDialogOpen(true)}
            size="small"
            sx={{ mb: 1 }}
          >
            Get Verified
          </Button>

          <Typography variant="caption" color="text.secondary">
            Complete verification to build trust and increase visibility
          </Typography>
        </Box>
      )}

      {/* Verification Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VerifiedUser sx={{ mr: 1 }} />
            Get Verified - Build Trust
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Verified sellers get 3x more responses and sell faster!
            </Typography>
          </Alert>

          <List>
            {verificationActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    opacity: action.completed ? 0.6 : 1
                  }}
                >
                  <ListItemIcon>
                    {action.completed ? (
                      <CheckCircle color="success" />
                    ) : (
                      action.icon
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        {action.title}
                        {action.completed && (
                          <Chip
                            label="Completed"
                            color="success"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                    }
                    secondary={action.description}
                  />
                  {!action.completed && (
                    <Button
                      variant="outlined"
                      onClick={action.action}
                      disabled={loading}
                      size="small"
                    >
                      Verify
                    </Button>
                  )}
                </ListItem>
              </motion.div>
            ))}
          </List>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="caption">
              Your information is kept secure and only used for verification purposes.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrustBadges;
