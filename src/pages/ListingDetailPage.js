import React, { useState, useEffect } from 'react';
// v2.0 - Dynamic image handling from template fields
import {
  Container, Typography, Box, Chip, Button, IconButton, TextField,
  Avatar, Grid, useTheme, useMediaQuery, Stack, Paper,
  CircularProgress, Alert, Divider, Skeleton
} from '@mui/material';
import {
  ArrowBack, Favorite, FavoriteBorder, Share, LocationOn,
  Phone, Chat, Send, MoreVert, Verified, Lock, ArrowForwardIos, ArrowBackIosNew
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query'; // Added imports
import apiService, { supabase } from '../services/api';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import ReportDialog from '../components/ReportDialog';
import BlockUserDialog from '../components/BlockUserDialog';
import { Flag, Block as BlockIcon } from '@mui/icons-material';

const translations = {
  en: {
    loading: "Loading...",
    errorLoading: "Failed to load listing",
    listingNotFound: "Listing not found",
    goBack: "Go Back",
    removedFavorite: "💔 Removed from favorites",
    addedFavorite: "❤️ Added to favorites",
    loginToFavorite: "Please login to save favorites",
    phoneNotAvailable: "Phone number not available",
    shareCancelled: "Share cancelled",
    linkCopied: "📋 Link copied!",
    commentPosted: "✅ Comment posted!",
    loginToComment: "Please login to comment",
    unknownSeller: "Unknown Seller",
    callSeller: "Call Seller",
    chatNow: "Chat Now",
    comments: "Comments",
    addComment: "Add a comment...",
    noData: "No information available"
  },
  am: {
    loading: "በመጫን ላይ...",
    errorLoading: "ዝርዝሩን መጫን አልተቻለም",
    listingNotFound: "ዝርዝሩ አልተገኘም",
    goBack: "ተመለስ",
    removedFavorite: "💔 ከሚወዷቸው ተወግዷል",
    addedFavorite: "❤️ ወደ ሚወዷቸው ተጨምሯል",
    loginToFavorite: "እባክዎ ለማስቀመጥ ይግቡ",
    phoneNotAvailable: "ስልክ ቁጥር የለም",
    shareCancelled: "ማጋራት ተሰርዟል",
    linkCopied: "📋 ሊንኩ ተቀድቷል!",
    commentPosted: "✅ አስተያየት ተሰጥቷል!",
    loginToComment: "እባክዎ አስተያየት ለመስጠት ይግቡ",
    unknownSeller: "ያልታወቀ ሻጭ",
    callSeller: "ለሻጩ ይደውሉ",
    chatNow: "አሁን ይወያዩ",
    comments: "አስተያየቶች",
    addComment: "አስተያየት ይስጡ...",
    noData: "መረጃ የለም"
  }
};

// Helper to render text with clickable links
// Helper to render text with clickable links
const renderWithLinks = (text) => {
  if (typeof text !== 'string') return text;

  // Regex to detect URLs (http, https, www, or raw domain like example.com)
  const urlRegex = /((?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?)/g;

  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    // Check if valid URL pattern
    if (part.match(/^(?:https?:\/\/|www\.)[^\s]+$/) || part.match(/^[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?$/)) {
      let href = part;
      if (!part.startsWith('http') && !part.startsWith('//')) {
        href = `http://${part}`;
      }
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#1976d2', textDecoration: 'underline', wordBreak: 'break-all' }}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

// Dynamic Field Renderer Component
const DynamicField = ({ field, value, isMobile }) => {
  const theme = useTheme();

  if (!value && value !== 0 && value !== false) return null;

  // Format value based on field type
  const formatValue = () => {
    if (field.field_type === 'number' || field.field_type === 'currency') {
      if (field.field_name.toLowerCase().includes('price') ||
        field.field_name.toLowerCase().includes('salary') ||
        field.field_name.toLowerCase().includes('cost')) {
        return `ETB ${Number(value).toLocaleString()}`;
      }
      return value.toLocaleString();
    }

    if (field.field_type === 'date') {
      return new Date(value).toLocaleDateString();
    }

    if (field.field_type === 'boolean' || field.field_type === 'checkbox') {
      return value ? '✓ Yes' : '✗ No';
    }

    if (field.field_type === 'select' || field.field_type === 'radio') {
      return String(value);
    }

    // For standard text fields, allow linking
    if (field.field_type === 'text' || !field.field_type) {
      return renderWithLinks(String(value));
    }

    // Default fallback: Render with links for safety (catches any unhandled string types)
    return renderWithLinks(String(value));
  };

  // Render based on field type and section
  if (field.field_type === 'image') {
    return (
      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          height: '100%',
          bgcolor: field.section === 'header' ? 'background.default' : 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
        variant="outlined"
      >
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          {field.field_label}
        </Typography>
        <Box
          component="img"
          src={Array.isArray(value) ? value[0] : (typeof value === 'string' ? (value.startsWith('[') ? JSON.parse(value)[0] : value) : '')}
          alt={field.field_label}
          sx={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
            borderRadius: 1,
            mt: 1
          }}
        />
        {Array.isArray(value) && value.length > 1 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            +{value.length - 1} more images
          </Typography>
        )}
      </Paper>
    );
  }

  if (field.field_type === 'file') {
    const files = Array.isArray(value) ? value : [value];
    return (
      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          height: '100%',
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`
        }}
        variant="outlined"
      >
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          {field.field_label}
        </Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {files.map((fileUrl, idx) => (
            <Button
              key={idx}
              variant="outlined"
              size="small"
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
              startIcon={<Box component="span" sx={{ fontSize: 16 }}>📄</Box>}
            >
              {/* Try to extract a readable name, fallback to Document N */}
              {(() => {
                try {
                  const parts = fileUrl.split('/');
                  const filename = parts[parts.length - 1];
                  // Remove timestamp prefix if present (123123-random-name.pdf)
                  const cleanName = filename.split('-').slice(2).join('-') || filename;
                  return decodeURIComponent(cleanName);
                } catch (e) { return `Document ${idx + 1}`; }
              })()}
            </Button>
          ))}
        </Stack>
      </Paper>
    );
  }

  // Explicit URL/Link type handling
  if (field.field_type === 'url' || field.field_type === 'link') {
    return (
      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          height: '100%',
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`
        }}
        variant="outlined"
      >
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          {field.field_label}
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          {renderWithLinks(String(value))}
        </Box>
      </Paper>
    );
  }

  if (field.field_type === 'textarea' || field.field_name === 'description') {
    return (
      <Paper
        sx={{
          p: isMobile ? 2 : 3,
          borderRadius: 2,
          mb: 2
        }}
        variant="outlined"
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {field.field_label}
        </Typography>
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
          component="div" // Changed to div to support nested elements from renderWithLinks
        >
          {renderWithLinks(value)}
        </Typography>
      </Paper>
    );
  }

  // Regular field rendering (Text, Number, Date, etc.)
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        height: '100%',
        bgcolor: field.section === 'header' ? 'background.default' : 'background.paper',
        border: `1px solid ${theme.palette.divider}`
      }}
      variant="outlined"
    >
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {field.field_label}
      </Typography>
      <Typography
        variant={field.section === 'header' ? "h6" : "body1"}
        fontWeight={field.section === 'header' ? "bold" : "500"}
        component="div" // Changed to div
      >
        {formatValue()}
      </Typography>
    </Paper>
  );
};

const ListingDetailPage = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comment, setComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  // 1. Fetch Listing & Comments in Parallel
  const { data: listing, isLoading: loadingListing, error } = useQuery(
    ['listing', id],
    async () => {
      const response = await apiService.getListingById(id);
      return response.listing || response;
    },
    { staleTime: 1000 * 60 * 5 }
  );

  const { data: comments = [] } = useQuery(
    ['comments', id],
    () => apiService.getListingComments(id),
    { staleTime: 1000 * 60, enabled: !!id }
  );

  // 2. Fetch Template (Dependent on Listing)
  const { data: templateData } = useQuery(
    ['template', listing?.category_id],
    () => adminService.getTemplate(listing.category_id),
    {
      enabled: !!listing?.category_id,
      staleTime: 1000 * 60 * 60
    }
  );

  const template = templateData?.template; // Extract actual template object if nested
  const steps = templateData?.steps || [];



  useEffect(() => {
    if (listing) {
      setIsFavorite(listing.is_favorited || false);
    }
  }, [listing]);



  const handleToggleFavorite = async () => {
    try {
      await apiService.toggleFavorite(id);
      const newStatus = !isFavorite;
      setIsFavorite(newStatus);
      queryClient.setQueryData(['listing', id], (old) => {
        if (!old) return old;
        return {
          ...old,
          is_favorited: newStatus,
          favorites_count: (old.favorites_count || 0) + (newStatus ? 1 : -1)
        };
      });
      toast.success(isFavorite ? t.removedFavorite : t.addedFavorite);
    } catch (err) {
      toast.error(t.loginToFavorite);
    }
  };

  const handleCallSeller = () => {
    const phone = listing?.phone_number || listing?.contact_phone || listing?.seller?.phone;
    if (phone) window.location.href = `tel:${phone}`;
    else toast.error(t.phoneNotAvailable);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, text: `Check out ${listing.title}`, url: window.location.href });
      } catch (err) { }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t.linkCopied);
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim()) return;
    try {
      await apiService.addListingComment(id, comment);
      queryClient.invalidateQueries(['comments', id]);
      setComment('');
      toast.success(t.commentPosted);
    } catch (err) { toast.error(t.loginToComment); }
  };

  // Helper to get value from various possible locations
  const getFieldValue = (field) => {
    const name = field.field_name;
    // 1. Custom Fields (most likely for dynamic templates)
    if (listing.custom_fields && listing.custom_fields[name] !== undefined) return listing.custom_fields[name];
    // 2. Direct Property
    if (listing[name] !== undefined) return listing[name];
    // 3. Details JSON
    if (listing.details && listing.details[name] !== undefined) return listing.details[name];

    return null;
  };

  const getFieldsBySection = (section) => {
    if (!steps) return [];
    const allFields = steps.flatMap(step => step.fields || []);
    if (section === 'main') {
      // Main includes explicit 'main', null, or empty string sections
      return allFields.filter(f => f.section === 'main' || !f.section);
    }
    return allFields.filter(field => field.section === section);
  };

  const getColumnWidth = (width) => {
    if (typeof width === 'number') return width;
    switch (width) {
      case 'full': return 12;
      case 'half': return 6;
      case 'third': return 4;
      case 'quarter': return 3;
      default: return 12;
    }
  };

  if (loadingListing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !listing) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error || t.listingNotFound}</Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>{t.goBack}</Button>
      </Container>
    );
  }

  // Image Extraction Logic (Matches DynamicListingCard)
  // Priority: Admin Template Fields → Standard DB Columns → Placeholder
  const images = (() => {
    const imageArray = [];

    // 1. PRIORITY: Admin-configured template fields (if template exists)
    if (steps && steps.length > 0) {
      const imageFields = steps.flatMap(s => s.fields || []).filter(f =>
        f.field_type === 'image' || f.field_type === 'file'
      );

      imageFields.forEach(f => {
        let val = getFieldValue(f);
        if (val) {
          if (typeof val === 'string') {
            if (val.startsWith('[')) {
              try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed)) {
                  imageArray.push(...parsed.filter(url => url && typeof url === 'string'));
                }
              } catch (e) {
                if (val.startsWith('http')) imageArray.push(val);
              }
            } else if (val.startsWith('http')) {
              imageArray.push(val);
            }
          } else if (Array.isArray(val)) {
            imageArray.push(...val.filter(url => url && typeof url === 'string'));
          }
        }
      });
    }

    // 2. FALLBACK: Standard database columns (for listings without templates or legacy data)
    if (imageArray.length === 0) {
      // Check image_url column
      if (listing.image_url) {
        imageArray.push(listing.image_url);
      }
      // Check image column
      else if (listing.image) {
        imageArray.push(listing.image);
      }
      // Check media_urls array
      else if (Array.isArray(listing.media_urls)) {
        const img = listing.media_urls.find(m => m.type === 'image');
        if (img) imageArray.push(img.url);
      }
      // Check custom_fields.images (legacy or mis-assigned data)
      else if (listing.custom_fields?.images && Array.isArray(listing.custom_fields.images) && listing.custom_fields.images.length > 0) {
        imageArray.push(...listing.custom_fields.images);
      }
      // Check if images is stored as array directly in listing
      else if (Array.isArray(listing.images) && listing.images.length > 0) {
        imageArray.push(...listing.images);
      }
    }

    // 3. LAST RESORT: Placeholder (only if truly no images exist)
    if (imageArray.length === 0) {
      imageArray.push('https://via.placeholder.com/800x600?text=No+Image');
    }

    return imageArray;
  })();


  const sellerName = listing.author_name || listing.user_name || listing.seller?.name || t.unknownSeller;
  const sellerAvatar = listing.author_avatar || listing.seller?.avatar;
  const sellerVerified = listing.is_verified || listing.seller?.verified || false;

  const headerFields = getFieldsBySection('header');
  const mainFields = getFieldsBySection('main');
  const sidebarFields = getFieldsBySection('sidebar');

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: isMobile ? 16 : 4 }}>
      {/* Header */}
      <Paper sx={{ position: 'sticky', top: 0, zIndex: 1100, borderRadius: 0 }} elevation={2}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 1.5 }}>
            <IconButton onClick={() => {
              if (window.history.length > 1 && document.referrer) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}>
              <ArrowBack />
            </IconButton>
            {loadingListing ? (
              <Skeleton variant="circular" width={40} height={40} />
            ) : (
              <Avatar src={sellerAvatar} sx={{ width: 40, height: 40 }}>
                {sellerName?.[0]}
              </Avatar>
            )}
            <Box sx={{ flex: 1 }}>
              {loadingListing ? (
                <Skeleton width={150} />
              ) : (
                <Typography variant="body1" fontWeight="600">
                  {sellerName}
                  {sellerVerified && <Verified sx={{ fontSize: 16, ml: 0.5, color: 'primary.main', verticalAlign: 'middle' }} />}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={0.5}>
              <IconButton onClick={() => setReportDialogOpen(true)} color="error" title="Report">
                <Flag />
              </IconButton>
              <IconButton onClick={() => setBlockDialogOpen(true)} title="Block User">
                <BlockIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: isMobile ? 0 : 3, px: isMobile ? 0 : 3 }}>
        <Grid container spacing={isMobile ? 0 : 3}>
          {/* Left Column - Images */}
          <Grid item xs={12} md={7}>
            <Paper
              sx={{
                borderRadius: isMobile ? 0 : 3,
                overflow: 'hidden',
                position: isMobile ? 'relative' : 'sticky',
                top: isMobile ? 0 : 80,
                bgcolor: 'black',  // Ensure black background for images
                minHeight: isMobile ? 300 : 500
              }}
              elevation={isMobile ? 0 : 3}
            >
              {loadingListing ? (
                <Skeleton variant="rectangular" width="100%" height={isMobile ? 300 : 500} animation="wave" />
              ) : (
                <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box
                    component="img"
                    src={images[currentImageIndex]}
                    alt={listing?.title || 'Listing Image'}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: isMobile ? 500 : 700,
                      objectFit: 'contain',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                    }}
                  />

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePrevImage}
                        sx={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                        }}
                      >
                        <ArrowBackIosNew />
                      </IconButton>
                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                        }}
                      >
                        <ArrowForwardIos />
                      </IconButton>
                    </>
                  )}

                  {/* Image Dots */}
                  {images.length > 1 && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2
                      }}
                    >
                      {images.map((_, idx) => (
                        <Box
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: currentImageIndex === idx ? 'white' : alpha('#fff', 0.5),
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              )}

              {/* Action Bar */}
              <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton onClick={handleToggleFavorite} disabled={loadingListing}>
                    {isFavorite ? <Favorite sx={{ fontSize: 32, color: 'error.main' }} /> : <FavoriteBorder sx={{ fontSize: 32 }} />}
                  </IconButton>
                  <IconButton onClick={handleShare} disabled={loadingListing}>
                    <Share sx={{ fontSize: 28 }} />
                  </IconButton>
                  <Box sx={{ flex: 1 }} />
                  {loadingListing ? (
                    <Skeleton width={100} height={40} />
                  ) : (
                    <Chip
                      label={`ETB ${(listing?.price || 0).toLocaleString()}`}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.25rem',
                        height: 44,
                        px: 2
                      }}
                    />
                  )}
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Dynamic Content */}
          <Grid item xs={12} md={5}>
            <Box sx={{ p: isMobile ? 2 : 0 }}>
              <>
                <Stack spacing={3}>
                  {/* Title */}
                  <Box>
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" gutterBottom>
                      {listing.title}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                      <LocationOn sx={{ fontSize: 20 }} />
                      <Typography variant="body1">
                        {listing.city || listing.location || listing.address || 'Location not specified'}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Header Section Fields */}
                  {headerFields.length > 0 && (
                    <Grid container spacing={2}>
                      {headerFields.map(field => {
                        const value = getFieldValue(field);
                        return value ? (
                          <Grid item xs={12} md={field.width ? getColumnWidth(field.width) : 6} key={field.id}>
                            <DynamicField field={field} value={value} isMobile={isMobile} />
                          </Grid>
                        ) : null;
                      })}
                    </Grid>
                  )}

                  {/* Main Section Fields */}
                  {mainFields.length > 0 && (
                    <Grid container spacing={2}>
                      {mainFields.map(field => {
                        const value = getFieldValue(field);
                        return value ? (
                          <Grid item xs={12} md={field.field_type === 'textarea' ? 12 : (field.width ? getColumnWidth(field.width) : 6)} key={field.id}>
                            <DynamicField field={field} value={value} isMobile={isMobile} />
                          </Grid>
                        ) : null;
                      })}
                    </Grid>
                  )}

                  {/* Sidebar Section Fields */}
                  {sidebarFields.length > 0 && (
                    <Grid container spacing={2}>
                      {sidebarFields.map(field => {
                        const value = getFieldValue(field);
                        return value ? (
                          <Grid item xs={12} md={field.width ? getColumnWidth(field.width) : 12} key={field.id}>
                            <DynamicField field={field} value={value} isMobile={isMobile} />
                          </Grid>
                        ) : null;
                      })}
                    </Grid>
                  )}

                  {/* Fallback: Show description if no template or if description field is missing from template */}
                  {((!steps || steps.length === 0) ||
                    (!mainFields.some(f => f.field_name === 'description') &&
                      !sidebarFields.some(f => f.field_name === 'description'))) &&
                    listing.description && (
                      <Paper sx={{ p: 3, borderRadius: 2 }} variant="outlined">
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Description
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }} component="div">
                          {renderWithLinks(listing.description)}
                        </Typography>
                      </Paper>
                    )}

                  {/* Desktop Action Buttons */}
                  <Stack spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<Phone />}
                      onClick={handleCallSeller}
                      sx={{ py: 1.5, borderRadius: 2, fontWeight: 600 }}
                    >
                      {t.callSeller}
                    </Button>

                    {/* Telegram Button */}
                    {(listing.telegram_username || listing.seller?.telegram) && (
                      <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        startIcon={
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.036.308.02.475z" />
                          </svg>
                        }
                        onClick={() => {
                          const username = listing.telegram_username || listing.seller?.telegram;
                          window.open(`https://t.me/${username}`, '_blank');
                        }}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          color: '#0088cc',
                          borderColor: '#0088cc',
                          '&:hover': {
                            borderColor: '#0088cc',
                            bgcolor: alpha('#0088cc', 0.1)
                          }
                        }}
                      >
                        Message on Telegram
                      </Button>
                    )}

                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<Chat />}
                      onClick={() => navigate(`/chat/${listing.author_id || listing.user_id}`, {
                        state: {
                          recipientName: listing.seller?.name || 'Seller',
                          recipientAvatar: listing.seller?.avatar,
                          recipientId: listing.author_id || listing.user_id
                        }
                      })}
                      sx={{ py: 1.5, borderRadius: 2, fontWeight: 600 }}
                    >
                      {t.chatNow}
                    </Button>
                  </Stack>

                  {/* Comments Section */}
                  <Divider />
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {t.comments} ({comments.length})
                    </Typography>

                    {/* Add Comment */}
                    <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={t.addComment}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
                      />
                      <IconButton color="primary" onClick={handlePostComment}>
                        <Send />
                      </IconButton>
                    </Stack>

                    {/* Comments List */}
                    <Stack spacing={2}>
                      {comments.map((c, idx) => (
                        <Paper key={idx} sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                            <Avatar sx={{ width: 24, height: 24 }}>{c.user_name?.[0]}</Avatar>
                            <Typography variant="body2" fontWeight="600">{c.user_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{new Date(c.created_at).toLocaleDateString()}</Typography>
                          </Stack>
                          <Typography variant="body2">{c.comment}</Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </>

            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Bottom Bar */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          display: { xs: 'block', md: 'none' },
          zIndex: 1100,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
        elevation={8}
      >
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Phone />}
            onClick={handleCallSeller}
            sx={{ fontSize: '0.875rem' }}
          >
            Call
          </Button>

          {/* Telegram Button for Mobile */}
          {(listing.telegram_username || listing.seller?.telegram) && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.036.308.02.475z" />
                </svg>
              }
              onClick={() => {
                const username = listing.telegram_username || listing.seller?.telegram;
                window.open(`https://t.me/${username}`, '_blank');
              }}
              sx={{
                fontSize: '0.875rem',
                color: '#0088cc',
                borderColor: '#0088cc',
                '&:hover': {
                  borderColor: '#0088cc',
                  bgcolor: alpha('#0088cc', 0.1)
                }
              }}
            >
              TG
            </Button>
          )}

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Chat />}
            onClick={() => navigate(`/chat/${listing.author_id || listing.user_id}`, {
              state: {
                recipientName: listing.seller?.name || 'Seller',
                recipientAvatar: listing.seller?.avatar,
                recipientId: listing.author_id || listing.user_id
              }
            })}
            sx={{ fontSize: '0.875rem' }}
          >
            Chat
          </Button>
        </Stack>
      </Paper>
      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        type="listing"
        targetId={id}
        targetName={listing?.title}
      />

      <BlockUserDialog
        open={blockDialogOpen}
        onClose={() => setBlockDialogOpen(false)}
        userId={listing?.author_id || listing?.user_id}
        userName={sellerName}
        onBlocked={() => {
          navigate(-1);
        }}
      />
    </Box>
  );
};

export default ListingDetailPage;
