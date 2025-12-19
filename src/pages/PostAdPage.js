import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, Stepper, Step, StepLabel, Button,
  Grid, Card, CardContent, CircularProgress, Stack, Alert, useTheme, useMediaQuery, alpha
} from '@mui/material';
import {
  ArrowBack, ArrowForward, CheckCircle, Category,
  Image as ImageIcon, VideoLibrary
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'; // Import useSearchParams
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import apiService, { supabase } from '../services/api';
import DynamicField from '../components/DynamicField';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import { useQueryClient } from 'react-query';

const BRAND_COLORS = {
  gold: '#FFD700',
  blue: '#1E3A8A',
  gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%)'
};

const translations = {
  en: {
    failedToLoadCategories: "Failed to load categories",
    noTemplateFound: "No template found for",
    noTemplateFoundSuffix: "Please contact the administrator to create a template for this category.",
    failedToLoadTemplate: "Failed to load template",
    fieldRequired: "This field is required",
    fillRequiredFields: "Please fill in all required fields",
    adPostedSuccessfully: "Ad posted successfully!",
    failedToPostAd: "Failed to post ad",
    reviewYourAd: "Review Your Ad",
    reviewDetailsBeforePosting: "Please review your details before posting.",
    viewFile: "View File",
    category: "Category",
    review: "Review",
    postYourAd: "Post New Ad",
    step: "Step",
    of: "of",
    back: "Back",
    posting: "Posting...",
    postAd: "Post Ad",
    next: "Next",
    listing: "Listing"
  },
  am: {
    failedToLoadCategories: "ምድቦችን መጫን አልተቻለም",
    noTemplateFound: "ለዚህ ምድብ ምንም ቅጽ አልተገኘም",
    noTemplateFoundSuffix: "እባክዎ አስተዳዳሪውን ያነጋግሩ።",
    failedToLoadTemplate: "ቅጽ መጫን አልተቻለም",
    fieldRequired: "ይህ ቦታ መሞላት አለበት",
    fillRequiredFields: "እባክዎ ሁሉንም አስፈላጊ ቦታዎች ይሙሉ",
    adPostedSuccessfully: "ማስታወቂያው በተሳካ ሁኔታ ተለጥፏል!",
    failedToPostAd: "ማስታወቂያውን መለጠፍ አልተቻለም",
    reviewYourAd: "ማስታወቂያዎን ይገምግሙ",
    reviewDetailsBeforePosting: "እባክዎ ከመለጠፍዎ በፊት ዝርዝሮቹን ይገምግሙ።",
    viewFile: "ፋይል ይመልከቱ",
    category: "ምድብ",
    review: "ግምገማ",
    postYourAd: "አዲስ ማስታወቂያ ይለጥፉ",
    step: "ደረጃ",
    of: "ከ",
    back: "ተመለስ",
    posting: "በመለጠፍ ላይ...",
    postAd: "ማስታወቂያ ይለጥፉ",
    next: "ቀጣይ",
    listing: "ዝርዝር"
  },
  om: {
    failedToLoadCategories: "Gitawwan fe'uu hin dandeenye",
    noTemplateFound: "Gita kanaaf unkaan hin argamne",
    noTemplateFoundSuffix: "Maaloo bulchaa qunnamuun unkaa uumaa.",
    failedToLoadTemplate: "Unkaa fe'uu hin dandeenye",
    fieldRequired: "Iddoon kun guutamuu qaba",
    fillRequiredFields: "Maaloo iddoowwan barbaachisaa ta'an hunda guutaa",
    adPostedSuccessfully: "Beeksifni milkaa'inaan maxxanfamera!",
    failedToPostAd: "Beeksisa maxxansuun hin danda'amne",
    reviewYourAd: "Beeksisa Keessan Irra Deebi'aa Ilaalaa",
    reviewDetailsBeforePosting: "Maaloo osoo hin maxxansin dura bal'ina isaa irra deebi'aa ilaalaa.",
    viewFile: "Faayilii Ilaali",
    category: "Gita",
    review: "Irra Deebi'ii Ilaali",
    postYourAd: "Beeksisa Haaraa Maxxansaa",
    step: "Sadarkaa",
    of: "kan",
    back: "Duubatti",
    posting: "Maxxansaa jira...",
    postAd: "Beeksisa Maxxansaa",
    next: "Itti Aanu",
    listing: "Tarree"
  },
  ti: {
    failedToLoadCategories: "ምድባት ምጽዓን ኣይተኻእለን",
    noTemplateFound: "ነዚ ምድብ ዝኸውን ቅጥዒ ኣይተረኽበን",
    noTemplateFoundSuffix: "በጃኹም ንምምሕዳር ብምርኻብ ቅጥዒ ኣዳሉው።",
    failedToLoadTemplate: "ቅጥዒ ምጽዓን ኣይተኻእለን",
    fieldRequired: "እዚ ቦታ ክምላእ ኣለዎ",
    fillRequiredFields: "በጃኹም ኩሉ ዘድሊ ቦታታት ምልኡ",
    adPostedSuccessfully: "ማስታወቂያ ብዓወት ተለጢፉ!",
    failedToPostAd: "ማስታወቂያ ምልጣፍ ኣይተኻእለን",
    reviewYourAd: "ማስታወቂያኹም ገምግሙ",
    reviewDetailsBeforePosting: "በጃኹም ቅድሚ ምልጣፍኩም ዝርዝራት ገምግሙ።",
    viewFile: "ፋይል ርኣይ",
    category: "ምድብ",
    review: "ገምግም",
    postYourAd: "ሓዲሽ ማስታወቂያ ለጥፍ",
    step: "ደረጃ",
    of: "ካብ",
    back: "ተመለስ",
    posting: "ይለጥፍ ኣሎ...",
    postAd: "ማስታወቂያ ለጥፍ",
    next: "ቀጽል",
    listing: "ዝርዝር"
  }
};

const PostAdPage = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editListingId = searchParams.get('edit');
  const queryClient = useQueryClient();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [template, setTemplate] = useState(null);
  const [steps, setSteps] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Fetch categories and user profile on mount
  useEffect(() => {
    fetchCategories();
    fetchUserProfile();
  }, []);

  // Fetch Listing for Edit if ID exists
  useEffect(() => {
    if (editListingId && categories.length > 0) {
      fetchListingForEdit(editListingId);
    }
  }, [editListingId, categories]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response && response.categories) {
        setCategories(response.categories);
      } else {
        // Fallback or empty
        setCategories([]);
        console.warn('No categories returned', response);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(t.failedToLoadCategories);
    }
  };

  const fetchListingForEdit = async (id) => {
    try {
      setLoading(true);
      const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!listing) throw new Error('Listing not found');

      // 1. Set Category
      const category = categories.find(c => c.id === listing.category_id);
      if (category) {
        await handleCategorySelect(category, false); // Load template, but don't clear form
      }

      // 2. Populate Form Data
      // Merge listing root fields and custom_fields
      const mergedData = {
        ...listing.custom_fields,
        ...listing,
        // Override price/title if they are in root
        title: listing.title,
        description: listing.description,
        price: listing.price,
        // Handle media
        images: listing.custom_fields?.images || listing.images || [],
        video: listing.custom_fields?.video || listing.video_urls?.[0] || null
      };

      // Also map media_urls if present (new schema)
      if (listing.media_urls && Array.isArray(listing.media_urls)) {
        listing.media_urls.forEach(media => {
          if (media.field_name) {
            mergedData[media.field_name] = media.url;
          }
        });
      }

      setFormData(mergedData);

    } catch (error) {
      console.error('Error fetching listing for edit:', error);
      toast.error('Failed to load listing for editing');
    } finally {
      setLoading(false);
    }
  };

  // Fetch template when category is selected
  const handleCategorySelect = async (category, clearForm = true) => {
    // Permission Check Logic (Same as before)
    const isRestricted = category.restricted || ['jobs', 'tenders', 'job', 'tender'].some(slug =>
      category.slug?.toLowerCase().includes(slug) ||
      category.name?.toLowerCase().includes(slug)
    );

    if (isRestricted) {
      const isVerifiedCompany = userProfile?.account_type === 'company' && userProfile?.verification_status === 'verified';
      const isAdmin = userProfile?.role === 'admin' || userProfile?.is_admin;
      if (!isVerifiedCompany && !isAdmin) {
        toast.error('Only verified companies and admins can post Jobs and Tenders.');
        return;
      }
    }

    // --- Subscription Enforcement ---
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const perms = await adminService.checkSubscriptionAccess(user.id);
      const limit = perms?.can_post?.[category.slug] ?? 0;

      // If limit is 0, user cannot post. If -1, unlimited.
      if (limit === 0) {
        toast.error(
          `You need an active subscription to post ${category.name}.`,
          {
            duration: 6000,
            icon: '🔒',
          }
        );
        // Optional: Redirect to pricing
        if (window.confirm(`You have 0 remaining posts for ${category.name}. Would you like to upgrade your plan?`)) {
          navigate(`/pricing/${category.slug}`); // assuming routing works like this or /pricing
        }
        return;
      }
    } else {
      // Not logged in - Redirect to auth?
      // Let the existing flow handle auth requirement later or now?
      // Usually Post Ad requires login immediately.
      toast.error("Please login to post an ad.");
      navigate('/auth', { state: { from: '/post-ad' } });
      return;
    }
    // --------------------------------

    setSelectedCategory(category);
    setLoading(true);
    try {
      if (clearForm) {
        setFormData({});
      }
      const data = await adminService.getTemplate(category.id);

      if (data && data.template && data.steps && data.steps.length > 0) {
        setTemplate(data.template);

        // Validate and set steps with proper structure
        const rawSteps = data.steps || [];

        const validatedSteps = rawSteps.map(s => ({
          ...s,
          title: s.step ? s.step.title : s.title,
          description: s.step ? s.step.description : s.description,
          fields: s.fields || []
        }));

        // INJECT 'Type' field for Cars and Homes if not present
        if (['cars', 'homes', 'car', 'home'].some(slug => category.slug?.includes(slug))) {
          const typeFieldExists = validatedSteps.some(s => s.fields.some(f => f.field_name === 'type'));

          if (!typeFieldExists && validatedSteps.length > 0) {
            // Add to the first step
            const typeField = {
              id: 'injected-type',
              field_name: 'type',
              field_label: 'Listing Type', // Could use translation if I had it here, but English default ok for now
              field_type: 'select',
              options: ['sale', 'rent'],
              is_required: true,
              is_visible: true,
              width: 6,
              placeholder: 'Select Type (Sale/Rent)'
            };
            // Prepend to fields of first step
            validatedSteps[0].fields.unshift(typeField);
          }
        }

        setSteps(validatedSteps);
        setActiveStep(1);
      } else {
        toast.error(
          `${t.noTemplateFound} "${category.name}". ${t.noTemplateFoundSuffix}`,
          { duration: 5000 }
        );
        setSteps([]);
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error(`${t.failedToLoadTemplate}: ${error.message}`);
      setSteps([]);
      setSelectedCategory(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Clear error if exists
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const validateStep = (stepIndex) => {
    // ... (This function remains mostly the same, ensuring fields are validated)
    // If it's the category selection step (0), it's valid if category is selected
    if (stepIndex === 0) return !!selectedCategory;

    // Adjust index for template steps (step 1 is template step 0)
    const templateStepIndex = stepIndex - 1;

    // If it's the review step (last step), it's valid
    if (templateStepIndex >= steps.length) return true;

    const currentStep = steps[templateStepIndex];
    const newErrors = {};
    let isValid = true;

    currentStep.fields?.forEach(field => {
      if (field.is_required && field.is_visible) {
        const value = formData[field.field_name];
        // Only validate if value is strictly missing/null/empty string
        if ((value === undefined || value === null || value === '') || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.field_name] = t.fieldRequired;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast.error(t.fillRequiredFields);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Separate standard fields from custom fields
      // NOTE: We reduced this list to avoid "column not found" errors. 
      // 'location', 'city', 'specific_location' will now go into custom_fields unless/until the schema is updated.
      // 'location', 'city', 'specific_location' will now go into custom_fields unless/until the schema is updated.
      const standardFields = ['title', 'description', 'price', 'type'];

      // Calculate expiration date (default 30 days) if new
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      const dbData = {
        category_id: selectedCategory.id,
        template_id: template.id,
        user_id: user.id,
        status: 'pending', // Reset to pending solely if editing? No, maybe keep logic: if edit, check if critical fields changed? For now, re-approval might be safer. Or keep existing status.
        // If editing, we shouldn't overwrite created_at. Only updated_at (which is automatic usually or we set it)
        custom_fields: {
          expires_at: expirationDate.toISOString()
        },
        media_urls: []
      };

      if (!editListingId) {
        dbData.created_at = new Date().toISOString();
      }

      // Process form data
      Object.entries(formData).forEach(([key, value]) => {
        if (standardFields.includes(key)) {
          dbData[key] = value;
        } else if (key === 'images' || key === 'video') {
          // Handle media separately? Logic below handles parsing formData via step fields
        } else {
          dbData.custom_fields[key] = value;
        }
      });

      // Ensure required fields have values (fallback logic)
      if (!dbData.title) {
        // Try to find a title-like field
        const titleField = Object.keys(formData).find(key =>
          key.toLowerCase().includes('title') ||
          key.toLowerCase().includes('name') ||
          key.toLowerCase().includes('heading') ||
          key.toLowerCase().includes('subject')
        );
        if (titleField && formData[titleField]) {
          dbData.title = formData[titleField];
        } else {
          // Use first non-empty text value as title
          const firstValue = Object.values(formData).find(v =>
            typeof v === 'string' && v.trim().length > 0
          );
          if (firstValue) {
            dbData.title = firstValue.substring(0, 100); // Limit to 100 chars
          } else {
            // Last resort: use category name + timestamp
            const timestamp = new Date().toLocaleDateString();
            dbData.title = `${selectedCategory.name} ${t.listing} - ${timestamp}`;
          }
        }
      }

      // Ensure description exists
      if (!dbData.description) {
        const descField = Object.keys(formData).find(key =>
          key.toLowerCase().includes('description') ||
          key.toLowerCase().includes('details') ||
          key.toLowerCase().includes('info')
        );
        if (descField && formData[descField]) {
          dbData.description = formData[descField];
        } else {
          // Use any available text field or create a basic description
          const textValues = Object.entries(formData)
            .filter(([key, value]) => typeof value === 'string' && value.trim().length > 0)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');

          dbData.description = textValues || `${selectedCategory.name} listing posted on ${new Date().toLocaleDateString()}`;
        }
      }

      // Ensure price is a number
      if (dbData.price) {
        dbData.price = parseFloat(dbData.price) || 0;
      }

      // Handle Media Uploads (if they are Files)
      // Note: In this implementation, DynamicField handles uploads and returns URLs directly
      // So formData should already contain URLs for 'file', 'image', 'video' types

      // Collect all media URLs with safety checks
      const mediaFields = steps
        .filter(s => s && s.fields && Array.isArray(s.fields))
        .flatMap(s => s.fields)
        .filter(f => f && f.field_type && ['image', 'video', 'file'].includes(f.field_type));

      mediaFields.forEach(field => {
        const url = formData[field.field_name];
        if (url) {
          dbData.media_urls.push({
            type: field.field_type,
            url: url,
            field_name: field.field_name
          });
        }
      });

      // Backward Compatibility: Populate 'images' array and 'image' string
      // NOTE: We are disabling direct column assignment for 'image' and 'images' 
      // because the schema might not have these columns anymore (moved to media_urls JSONB or similar).
      /*
      const imageMedia = dbData.media_urls.filter(m => m.type === 'image');
      if (imageMedia.length > 0) {
        // Only set these if you are SURE the columns exist. 
        // If getting "Could not find column", keep these commented out.
        // dbData.image = imageMedia[0].url; 
        // dbData.images = imageMedia.map(m => m.url);
      }
      */

      // Insert or Update using listingService (Node.js Backend)
      let result;
      if (editListingId) {
        // Update
        // Remove fields that shouldn't be updated or cause issues
        const updateData = { ...dbData };
        delete updateData.status;
        delete updateData.created_at;
        delete updateData.user_id; // Usually don't update user_id

        const listingService = (await import('../services/listing-service')).default;
        result = await listingService.updateListing(editListingId, updateData);
      } else {
        // Insert
        const listingService = (await import('../services/listing-service')).default;
        result = await listingService.createListing(dbData);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save listing');
      }

      toast.success(editListingId ? "Listing updated successfully!" : t.adPostedSuccessfully);

      // Invalidate queries to ensure ProfilePage and other lists refresh
      queryClient.invalidateQueries(['userListings']);
      queryClient.invalidateQueries(['listings']);

      // USAGE TRACKING: 
      // We switched to "Row Counting" strategy. 
      // So we don't need to manually increment usage. The new row in 'listings' counts as usage automatically.

      // Navigate based on previous location or default to profile
      const from = location.state?.from || '/profile';
      navigate(from);
    } catch (error) {
      console.error('Error posting/updating ad:', error);
      toast.error(`${t.failedToPostAd}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Render Category Selection Step
  const renderCategorySelection = () => (
    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
      {categories.map((category) => (
        <Grid item xs={6} sm={4} md={3} lg={2.4} key={category.id}>
          <Card
            component={motion.div}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCategorySelect(category)}
            sx={{
              cursor: 'pointer',
              height: '100%',
              minHeight: { xs: 140, sm: 160 },
              border: selectedCategory?.id === category.id ? `3px solid ${BRAND_COLORS.gold}` : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              bgcolor: selectedCategory?.id === category.id ? alpha(BRAND_COLORS.gold, 0.08) : 'background.paper',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              boxShadow: selectedCategory?.id === category.id ? `0 8px 24px ${alpha(BRAND_COLORS.gold, 0.25)}` : 1,
              '&:hover': {
                boxShadow: 4,
                borderColor: selectedCategory?.id === category.id ? BRAND_COLORS.gold : alpha(BRAND_COLORS.blue, 0.3)
              }
            }}
          >
            <CardContent sx={{
              textAlign: 'center',
              py: { xs: 2, sm: 2.5 },
              px: { xs: 1.5, sm: 2 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Box
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: '50%',
                  bgcolor: selectedCategory?.id === category.id
                    ? alpha(BRAND_COLORS.gold, 0.15)
                    : alpha(category.color || BRAND_COLORS.blue, 0.1),
                  color: selectedCategory?.id === category.id
                    ? BRAND_COLORS.gold
                    : (category.color || BRAND_COLORS.blue),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: { xs: 1, sm: 1.5 },
                  transition: 'all 0.3s ease'
                }}
              >
                <Category fontSize={isMobile ? "medium" : "large"} />
              </Box>
              <Typography
                variant={isMobile ? "body2" : "subtitle1"}
                fontWeight="bold"
                gutterBottom
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  lineHeight: 1.2,
                  mb: 0.5
                }}
              >
                {category.name}
              </Typography>
              {!isMobile && category.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: '0.75rem',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {category.description}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Helper to convert DB text width to Grid numeric width
  const getColumnWidth = (width) => {
    if (typeof width === 'number') return width; // Legacy support
    switch (width) {
      case 'full': return 12;
      case 'half': return 6;
      case 'third': return 4;
      case 'quarter': return 3;
      default: return 12;
    }
  };

  // Render Dynamic Template Step
  const renderTemplateStep = (stepIndex) => {
    const step = steps[stepIndex];
    if (!step) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {step.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {step.description}
          </Typography>
        </Grid>
        {step.fields?.map((field) => (
          <Grid
            item
            xs={12}
            md={field.width ? getColumnWidth(field.width) : (field.field_type === 'textarea' ? 12 : 6)}
            key={field.id}
          >
            <DynamicField
              field={field}
              value={formData[field.field_name]}
              onChange={(val) => handleFieldChange(field.field_name, val)}
              error={errors[field.field_name]}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render Review Step
  const renderReviewStep = () => (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {t.reviewYourAd}
      </Typography>
      <Alert severity="info" sx={{ mb: 4 }}>
        {t.reviewDetailsBeforePosting}
      </Alert>

      <Stack spacing={3}>
        {steps.map((step, index) => (
          <Card key={index} variant="outlined">
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                {step.title}
              </Typography>
              <Grid container spacing={2}>
                {step.fields?.map(field => {
                  const value = formData[field.field_name];
                  if (!value) return null;

                  return (
                    <Grid item xs={12} sm={6} key={field.id}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {field.field_label}
                      </Typography>
                      <Typography variant="body1">
                        {['image', 'video', 'file'].includes(field.field_type) ? (
                          <a href={value} target="_blank" rel="noopener noreferrer">{t.viewFile}</a>
                        ) : (
                          String(value)
                        )}
                      </Typography>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );

  const allSteps = [t.category, ...(steps.map(s => s.title)), t.review];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title={editListingId ? "Edit Listing" : t.postYourAd}
        description="Post your ad for free on YesraSew - Ethiopia's Premier Marketplace. Sell cars, houses, post jobs and tenders easily."
        keywords="post ad ethiopia, sell item ethiopia, list job ethiopia, post tender ethiopia, classifieds ethiopia"
      />
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom sx={{ color: BRAND_COLORS.blue }}>
          {editListingId ? "Edit Listing" : t.postYourAd}
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5, display: { xs: 'none', md: 'flex' } }}>
          {allSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Mobile Stepper Text */}
        {isMobile && (
          <Typography variant="subtitle1" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
            {t.step} {activeStep + 1} {t.of} {allSteps.length}: {allSteps[activeStep]}
          </Typography>
        )}

        <Box sx={{ minHeight: 400 }}>
          <AnimatePresence mode="wait">
            {loading && editListingId ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                  <CircularProgress />
                  <Typography variant="body1" sx={{ ml: 2 }}>Loading listing details...</Typography>
                </Box>
              </motion.div>
            ) : (
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeStep === 0 && renderCategorySelection()}
                {activeStep > 0 && activeStep <= steps.length && renderTemplateStep(activeStep - 1)}
                {activeStep === steps.length + 1 && renderReviewStep()}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            {t.back}
          </Button>

          {activeStep === allSteps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
              sx={{ bgcolor: BRAND_COLORS.gold, color: BRAND_COLORS.blue, '&:hover': { bgcolor: BRAND_COLORS.blue, color: 'white' } }}
            >
              {loading ? t.posting : (editListingId ? "Update Ad" : t.postAd)}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForward />}
              disabled={activeStep === 0 && !selectedCategory}
              sx={{ bgcolor: BRAND_COLORS.blue }}
            >
              {t.next}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default PostAdPage;
