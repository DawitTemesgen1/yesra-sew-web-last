import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Avatar, Button, IconButton, Grid, Card, CardContent,
  Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Tabs, Tab, useMediaQuery, useTheme, alpha, Divider, LinearProgress, Badge,
  List, ListItem, ListItemText, ListItemAvatar, Fab, Tooltip, Paper, CircularProgress,
  InputAdornment, ListItemButton
} from '@mui/material';
import {
  Edit, LocationOn, Email, Phone, Star, Verified, CameraAlt,
  Logout, Close, Save, Description, Favorite, Work, Chat,
  TrendingUp, Visibility, Delete, Share, Settings, Add,
  Dashboard as DashboardIcon, Assessment, AttachMoney, Upload,
  Facebook, Twitter, Instagram, LinkedIn, Language as WebIcon,
  Telegram, WhatsApp, CloudUpload, CardMembership
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from '../utils/dateUtils';
import apiService from '../services/api';
import { supabase } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import MembershipTab from '../components/MembershipTab';
import CompanyVerificationForm from '../components/CompanyVerificationForm';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import DynamicListingCard from '../components/DynamicListingCard';

// Brand Colors
const BRAND_COLORS = {
  gold: '#FFD700',
  darkGold: '#DAA520',
  blue: '#1E3A8A',
  lightBlue: '#3B82F6',
  gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%)',
  cardGradient: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(255, 215, 0, 0.05) 100%)'
};

const translations = {
  en: {
    selectImage: "Please select an image file",
    imageSize: "Image size should be less than 5MB",
    avatarUpdated: "Avatar updated successfully!",
    avatarUploadFailed: "Failed to upload avatar",
    profileUpdated: "Profile updated successfully!",
    profileUpdateFailed: "Failed to update profile",
    confirmDelete: "Are you sure you want to delete this listing?",
    listingDeleted: "Listing deleted successfully",
    listingDeleteFailed: "Failed to delete listing",
    loadingProfile: "Loading your profile...",
    userNotFound: "User not found",
    goHome: "Go Home",
    totalListings: "Total Listings",
    activeListings: "Active Listings",
    totalViews: "Total Views",
    favorites: "Favorites",
    myListings: "My Listings",
    chats: "Chats",
    analytics: "Analytics",
    noListingsYet: "No listings yet",
    postFirstAd: "Post Your First Ad",
    noFavoritesYet: "No favorites yet",
    noConversationsYet: "No conversations yet",
    startChatting: "Start chatting with sellers to see your conversations here",
    unknownUser: "Unknown User",
    noMessagesYet: "No messages yet",
    analyticsComingSoon: "Analytics Coming Soon",
    analyticsDesc: "Detailed insights about your listings performance",
    editProfile: "Edit Profile",
    logout: "Logout",
    noBio: "No bio provided",
    reviews: "reviews",
    posted: "Posted",
    recently: "recently",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    fullName: "Full Name",
    bio: "Bio",
    location: "Location",
    phone: "Phone",
    socialMedia: "Social Media Links",
    website: "Website",
    membershipPlan: "Membership Plan",
    currentPlan: "Current Plan",
    upgrade: "Upgrade",
    renew: "Renew",
    expiresOn: "Expires on",
    features: "Features",
    noActivePlan: "No active membership plan",
    browsePlans: "Browse Plans"
  },
  am: {
    selectImage: "እባክዎ የምስል ፋይል ይምረጡ",
    imageSize: "የምስል መጠን ከ 5MB በታች መሆን አለበት",
    avatarUpdated: "የመገለጫ ምስል በተሳካ ሁኔታ ተዘምኗል!",
    avatarUploadFailed: "የመገለጫ ምስል መጫን አልተቻለም",
    profileUpdated: "መገለጫ በተሳካ ሁኔታ ተዘምኗል!",
    profileUpdateFailed: "መገለጫ ማዘመን አልተቻለም",
    confirmDelete: "ይህንን ማስታወቂያ መሰረዝ ይፈልጋሉ?",
    listingDeleted: "ማስታወቂያው በተሳካ ሁኔታ ተሰርዟል",
    listingDeleteFailed: "ማስታወቂያውን መሰረዝ አልተቻለም",
    loadingProfile: "መገለጫዎን በመጫን ላይ...",
    userNotFound: "ተጠቃሚው አልተገኘም",
    goHome: "ወደ መነሻ ሂድ",
    totalListings: "ጠቅላላ ማስታወቂያዎች",
    activeListings: "ንቁ ማስታወቂያዎች",
    totalViews: "ጠቅላላ ዕይታዎች",
    favorites: "ተወዳጆች",
    myListings: "የእኔ ማስታወቂያዎች",
    chats: "ውይይቶች",
    analytics: "ትንታኔዎች",
    noListingsYet: "እስካሁን ምንም ማስታወቂያዎች የሉም",
    postFirstAd: "የመጀመሪያውን ማስታወቂያ ይለጥፉ",
    noFavoritesYet: "እስካሁን ምንም ተወዳጆች የሉም",
    noConversationsYet: "እስካሁን ምንም ውይይቶች የሉም",
    startChatting: "ውይይቶችዎን እዚህ ለማየት ከሻጮች ጋር መወያየት ይጀምሩ",
    unknownUser: "ያልታወቀ ተጠቃሚ",
    noMessagesYet: "እስካሁን ምንም መልዕክቶች የሉም",
    analyticsComingSoon: "ትንታኔዎች በቅርቡ ይመጣሉ",
    analyticsDesc: "ስለ ማስታወቂያዎችዎ አፈጻጸም ዝርዝር ግንዛቤዎች",
    editProfile: "መገለጫ አርትዕ",
    logout: "ውጣ",
    noBio: "ምንም መግለጫ አልቀረበም",
    reviews: "ግምገማዎች",
    posted: "ተለጥፏል",
    recently: "በቅርቡ",
    saveChanges: "ለውጦችን አስቀምጥ",
    cancel: "ሰርዝ",
    fullName: "ሙሉ ስም",
    bio: "መግለጫ",
    location: "አድራሻ",
    phone: "ስልክ",
    socialMedia: "ማህበራዊ ሚዲያ አገናኞች",
    membershipPlan: "የአባልነት ዕቅድ",
    currentPlan: "የአሁኑ ዕቅድ",
    upgrade: "አሻሽል",
    renew: "አድስ",
    expiresOn: "ጊዜው የሚያበቃው",
    features: "ባህሪያት",
    noActivePlan: "ምንም ንቁ የአባልነት ዕቅድ የለም",
    browsePlans: "ዕቅዶችን ያስሱ"
  },
  om: {
    selectImage: "Maaloo faayilii fakkii filadhaa",
    imageSize: "Guddinni fakkii 5MB gadi ta'uu qaba",
    avatarUpdated: "Fakkiin piroofayilii milkaa'inaan haaromeera!",
    avatarUploadFailed: "Fakkii piroofayilii fe'uu hin dandeenye",
    profileUpdated: "Piroofayiliin milkaa'inaan haaromeera!",
    profileUpdateFailed: "Piroofayilii haaromsuun hin danda'amne",
    confirmDelete: "Tarree kana haquu barbaadduu?",
    listingDeleted: "Tarreen milkaa'inaan haqameera",
    listingDeleteFailed: "Tarree haquun hin danda'amne",
    loadingProfile: "Piroofayilii keessan fe'aa jira...",
    userNotFound: "Fayyadamaan hin argamne",
    goHome: "Gara Manaa Deemaa",
    totalListings: "Waliigala Tarreewwanii",
    activeListings: "Tarreewwan Nuti",
    totalViews: "Waliigala Ilaalchaa",
    favorites: "Jaallatamoo",
    myListings: "Tarreewwan Kiyya",
    chats: "Haasaawwan",
    analytics: "Xiinxala",
    noListingsYet: "Ammatti tarreewwan hin jiran",
    postFirstAd: "Tarree Keessan Jalqabaa Maxxansaa",
    noFavoritesYet: "Ammatti jaallatamoon hin jiran",
    noConversationsYet: "Ammatti haasaawwan hin jiran",
    startChatting: "Haasaa keessan asitti arguuf gurgurtoota waliin haasa'uu jalqabaa",
    unknownUser: "Fayyadamaa Hin Beekamne",
    noMessagesYet: "Ammatti ergaawwan hin jiran",
    analyticsComingSoon: "Xiinxalli Dhihootti Dhufa",
    analyticsDesc: "Hubannoo bal'aa waa'ee raawwii tarreewwan keessanii",
    editProfile: "Piroofayilii Gulaali",
    logout: "Ba'aa",
    noBio: "Ibsi hin kennamne",
    reviews: "yaada",
    posted: "Maxxansame",
    recently: "dhihootti",
    saveChanges: "Jijjiirama Olkaa'aa",
    cancel: "Haqi",
    fullName: "Maqaa Guutuu",
    bio: "Ibsa",
    location: "Bakka",
    phone: "Bilbila",
    socialMedia: "Liinkiiwwan Miidiyaa Hawaasaa",
    membershipPlan: "Karoora Miseensummaa",
    currentPlan: "Karoora Ammaa",
    upgrade: "Fooyyessi",
    renew: "Haaromsi",
    expiresOn: "Kan dhumu",
    features: "Amaloota",
    noActivePlan: "Karoorri miseensummaa qophaa'aa hin jiru",
    browsePlans: "Karoorawwan Sakatta'i"
  },
  ti: {
    selectImage: "በጃኹም ናይ ስእሊ ፋይል ምረጹ",
    imageSize: "ዓቐን ስእሊ ካብ 5MB ክንእስ ኣለዎ",
    avatarUpdated: "ስእሊ ፕሮፋይል ብዓወት ተሓዲሱ!",
    avatarUploadFailed: "ስእሊ ፕሮፋይል ምጽዓን ኣይተኻእለን",
    profileUpdated: "ፕሮፋይል ብዓወት ተሓዲሱ!",
    profileUpdateFailed: "ፕሮፋይል ምሕዳስ ኣይተኻእለን",
    confirmDelete: "ነዚ ዝርዝር ክትስርዝዎ ትደልዩ ዲኹም?",
    listingDeleted: "ዝርዝር ብዓወት ተሰሪዙ",
    listingDeleteFailed: "ዝርዝር ምድምሳስ ኣይተኻእለን",
    loadingProfile: "ፕሮፋይልኩም ይጽዕን ኣሎ...",
    userNotFound: "ተጠቃሚ ኣይተረኽበን",
    goHome: "ናብ ገዛ ኪድ",
    totalListings: "ጠቕላላ ዝርዝራት",
    activeListings: "ንጡፋት ዝርዝራት",
    totalViews: "ጠቕላላ ምርኣይ",
    favorites: "ዝፈትውዎም",
    myListings: "ናተይ ዝርዝራት",
    chats: "ዝርርባት",
    analytics: "ትንተና",
    noListingsYet: "ክሳብ ሕጂ ዝርዝራት የለን",
    postFirstAd: "ናይ መጀመርታ ዝርዝርኩም ለጥፉ",
    noFavoritesYet: "ክሳብ ሕጂ ዝፈትውዎ የለን",
    noConversationsYet: "ክሳብ ሕጂ ዝርርብ የለን",
    startChatting: "ዝርርብኩም ኣብዚ ንምርኣይ ምስ ሸጠቲ ምዝርራብ ጀምሩ",
    unknownUser: "ዘይፍለጥ ተጠቃሚ",
    noMessagesYet: "ክሳብ ሕጂ መልእኽቲ የለን",
    analyticsComingSoon: "ትንተና ቀልጢፉ ክመጽእ እዩ",
    analyticsDesc: "ብዛዕባ ኣፈጻጽማ ዝርዝራትኩም ዝርዝር ርድኢት",
    editProfile: "ፕሮፋይል ኣርትዕ",
    logout: "ውጻእ",
    noBio: "መግለጺ ኣይተዋህበን",
    reviews: "ግምገማታት",
    posted: "ተለጢፉ",
    recently: "ብቀረባ",
    saveChanges: "ለውጥታት ኣቅምጥ",
    cancel: "ሰርዝ",
    fullName: "ሙሉእ ሽም",
    bio: "መግለጺ",
    location: "ቦታ",
    phone: "ስልኪ",
    socialMedia: "ሊንክታት ማሕበራዊ ሚድያ",
    membershipPlan: "ናይ ኣባልነት መደብ",
    currentPlan: "ናይ ሕጂ መደብ",
    upgrade: "ኣመሓይሽ",
    renew: "ኣሐድስ",
    expiresOn: "ዝውዳእ",
    features: "መግለጺታት",
    noActivePlan: "ንጡፍ ናይ ኣባልነት መደብ የለን",
    browsePlans: "መደባት ዳህስስ"
  }
};

const ProfilePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [uploading, setUploading] = useState(false);

  // 1. Fetch User Profile
  const { data: user, isLoading: profileLoading, error: profileError } = useQuery(
    ['profile', authUser?.id],
    apiService.users.getProfile,
    {
      enabled: !!authUser,
      select: (res) => res?.user || res,
      onSuccess: (data) => {
        setEditForm({
          ...data,
          social_media: data.social_media || {}
        });
      }
    }
  );

  // 2. Fetch User Listings
  const { data: listingsData } = useQuery(
    ['userListings', authUser?.id],
    () => apiService.getListings({ user_id: authUser?.id, status: 'all' }),
    { enabled: !!authUser }
  );
  const userListings = listingsData?.listings || listingsData || [];

  // 3. Fetch Favorites
  const { data: rawFavorites } = useQuery(
    ['userFavorites', authUser?.id],
    apiService.users.getFavorites,
    { enabled: !!authUser }
  );

  // Fix for "userFavorites.map is not a function": Ensure it checks for array before usage
  const userFavorites = Array.isArray(rawFavorites) ? rawFavorites : [];

  // 4. Fetch Chats
  const { data: userChats = [] } = useQuery(
    ['userChats', authUser?.id],
    apiService.chat.getConversations,
    { enabled: !!authUser }
  );

  const loading = profileLoading; // Main loading state
  const error = profileError?.message;

  // Merge profile data with auth metadata to ensure we have a name
  const displayUser = React.useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      full_name: user.full_name || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || 'User',
      avatar_url: user.avatar_url || authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture
    };
  }, [user, authUser]);

  // Calculate Stats
  const stats = React.useMemo(() => {
    const activeListings = userListings.filter(l => l.status === 'approved' || l.status === 'active');
    return {
      totalListings: userListings.length,
      activeListings: activeListings.length,
      totalViews: userListings.reduce((sum, l) => sum + (l.views || 0), 0),
      totalFavorites: userListings.reduce((sum, l) => sum + (l.favorites_count || 0), 0)
    };
  }, [userListings]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t.selectImage);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.imageSize);
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${authUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `${authUser.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const updatedUser = await apiService.users.updateProfile({ avatar_url: data.publicUrl });
      queryClient.setQueryData(['profile', authUser?.id], updatedUser);
      toast.success(t.avatarUpdated);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || t.avatarUploadFailed);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Remove 'data' property if it exists, as it's not a column in profiles
      const { data, ...cleanForm } = editForm;
      const updatedUser = await apiService.users.updateProfile(cleanForm);
      queryClient.setQueryData(['profile', authUser?.id], updatedUser);
      setEditDialogOpen(false);
      toast.success(t.profileUpdated);
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.message || t.profileUpdateFailed);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        await apiService.deleteListing(listingId);
        queryClient.setQueryData(['userListings', authUser?.id], (old) => {
          if (!old) return old;
          if (Array.isArray(old)) return old.filter(l => l.id !== listingId);
          return {
            ...old,
            listings: old.listings.filter(l => l.id !== listingId)
          };
        });
        toast.success(t.listingDeleted);
      } catch (err) {
        toast.error(t.listingDeleteFailed);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND_COLORS.gradient
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: BRAND_COLORS.gold, mb: 2 }} size={60} />
          <Typography color="white" variant="h6">{t.loadingProfile}</Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error || !displayUser) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND_COLORS.gradient,
        p: 3
      }}>
        <Card sx={{ maxWidth: 400, textAlign: 'center', p: 3 }}>
          <Typography variant="h6" color="error" gutterBottom>{error || t.userNotFound}</Typography>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2, bgcolor: BRAND_COLORS.blue }}>
            {t.goHome}
          </Button>
        </Card>
      </Box>
    );
  }

  const handleShareListing = (listing) => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this listing on YesraSew: ${listing.title}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/listings/${listing.id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleToggleFavorite = async (listingId) => {
    try {
      await apiService.toggleFavorite(listingId);
      queryClient.invalidateQueries(['userFavorites', authUser?.id]);
      toast.success('Favorites updated');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const StatCard = ({ icon, label, value, color }) => (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Card sx={{
        background: BRAND_COLORS.cardGradient,
        border: `2px solid ${alpha(color, 0.3)}`,
        height: '100%'
      }}>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Box sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            {icon}
          </Box>
          <Typography variant="h4" fontWeight="bold" color={color}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{label}</Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const getSocialIcon = (platform) => {
    const iconProps = { sx: { fontSize: 20 } };
    switch (platform) {
      case 'facebook': return <Facebook {...iconProps} />;
      case 'twitter': return <Twitter {...iconProps} />;
      case 'instagram': return <Instagram {...iconProps} />;
      case 'linkedin': return <LinkedIn {...iconProps} />;
      case 'telegram': return <Telegram {...iconProps} />;
      case 'whatsapp': return <WhatsApp {...iconProps} />;
      case 'website': return <WebIcon {...iconProps} />;
      default: return null;
    }
  };

  const getSocialColor = (platform) => {
    switch (platform) {
      case 'facebook': return '#1877F2';
      case 'twitter': return '#1DA1F2';
      case 'instagram': return '#E4405F';
      case 'linkedin': return '#0A66C2';
      case 'telegram': return '#0088cc';
      case 'whatsapp': return '#25D366';
      case 'website': return BRAND_COLORS.gold;
      default: return BRAND_COLORS.blue;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', pb: isMobile ? 2 : 4 }}>
      <SEO
        title={displayUser?.full_name || t.unknownUser}
        description="Manage your YesraSew profile, listings, and account settings."
        keywords="user profile, yesrasew profile, my listings, settings"
      />
      {/* Hidden file input for avatar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarUpload}
      />

      {/* Header with Gradient */}
      <Box sx={{
        background: BRAND_COLORS.gradient,
        pt: isMobile ? 3 : 6,
        pb: isMobile ? 8 : 12,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          bgcolor: alpha('#fff', 0.1)
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          bgcolor: alpha('#fff', 0.1)
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Top Actions */}
          <Stack direction="row" justifyContent="space-between" mb={isMobile ? 2 : 4}>
            <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
            <Stack direction="row" spacing={1}>
              {(user.role === 'admin' || user.is_admin) && (
                <Button
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate('/admin-panel')}
                  sx={{ color: 'white', borderColor: 'white' }}
                  variant="outlined"
                  size="small"
                >
                  {!isMobile && "Admin"}
                </Button>
              )}
              <IconButton sx={{ color: 'white' }}>
                <Settings />
              </IconButton>
              <Button
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ color: 'white', borderColor: 'white' }}
                variant="outlined"
                size="small"
              >
                {!isMobile && t.logout}
              </Button>
            </Stack>
          </Stack>

          {/* Profile Header */}
          <Stack direction={isMobile ? 'column' : 'row'} spacing={3} alignItems="center">
            <Box sx={{ position: 'relative' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  uploading ? (
                    <CircularProgress size={24} sx={{ color: BRAND_COLORS.gold }} />
                  ) : (
                    <IconButton
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        bgcolor: BRAND_COLORS.gold,
                        color: BRAND_COLORS.blue,
                        '&:hover': { bgcolor: BRAND_COLORS.darkGold },
                        boxShadow: 3,
                        width: 40,
                        height: 40
                      }}
                      size="small"
                    >
                      <CameraAlt fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <Avatar
                  src={user.avatar_url}
                  sx={{
                    width: isMobile ? 100 : 140,
                    height: isMobile ? 100 : 140,
                    border: `4px solid ${BRAND_COLORS.gold}`,
                    boxShadow: `0 8px 24px ${alpha('#000', 0.3)}`
                  }}
                >
                  {user.full_name?.[0] || user.email?.[0]}
                </Avatar>
              </Badge>
            </Box>

            <Box sx={{ flex: 1, textAlign: isMobile ? 'center' : 'left', color: 'white' }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent={isMobile ? 'center' : 'flex-start'} mb={1}>
                <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">
                  {displayUser.full_name}
                </Typography>
                {displayUser.verified && <Verified sx={{ color: BRAND_COLORS.gold }} />}
              </Stack>

              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                {displayUser.bio || t.noBio}
              </Typography>

              <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={2}
                alignItems={isMobile ? 'center' : 'flex-start'}
                flexWrap="wrap"
                mb={2}
              >
                {displayUser.location && (
                  <Chip
                    icon={<LocationOn />}
                    label={displayUser.location}
                    sx={{ bgcolor: alpha('#fff', 0.2), color: 'white' }}
                  />
                )}
                {displayUser.email && (
                  <Chip
                    icon={<Email />}
                    label={displayUser.email}
                    sx={{ bgcolor: alpha('#fff', 0.2), color: 'white' }}
                  />
                )}
                {displayUser.phone && (
                  <Chip
                    icon={<Phone />}
                    label={displayUser.phone}
                    sx={{ bgcolor: alpha('#fff', 0.2), color: 'white' }}
                  />
                )}
                <Chip
                  icon={<Star />}
                  label={`${displayUser.rating || '0.0'} (${displayUser.reviews_count || 0} ${t.reviews})`}
                  sx={{ bgcolor: alpha(BRAND_COLORS.gold, 0.3), color: 'white', fontWeight: 'bold' }}
                />
              </Stack>

              {/* Social Media Links */}
              {displayUser.social_media && Object.keys(displayUser.social_media).length > 0 && (
                <Stack direction="row" spacing={1} justifyContent={isMobile ? 'center' : 'flex-start'}>
                  {Object.entries(displayUser.social_media).map(([platform, url]) => (
                    url && (
                      <Tooltip key={platform} title={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                        <IconButton
                          component="a"
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'white',
                            bgcolor: alpha(getSocialColor(platform), 0.2),
                            '&:hover': { bgcolor: alpha(getSocialColor(platform), 0.3) }
                          }}
                          size="small"
                        >
                          {getSocialIcon(platform)}
                        </IconButton>
                      </Tooltip>
                    )
                  ))}
                </Stack>
              )}
            </Box>

            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditDialogOpen(true)}
              sx={{
                bgcolor: BRAND_COLORS.gold,
                color: BRAND_COLORS.blue,
                fontWeight: 'bold',
                px: 4,
                '&:hover': { bgcolor: BRAND_COLORS.darkGold }
              }}
            >
              {t.editProfile}
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Stats Cards */}
      <Container maxWidth="lg" sx={{ mt: isMobile ? -4 : -6, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <StatCard
              icon={<Description sx={{ fontSize: 32, color: BRAND_COLORS.blue }} />}
              label={t.totalListings}
              value={stats.totalListings}
              color={BRAND_COLORS.blue}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard
              icon={<TrendingUp sx={{ fontSize: 32, color: BRAND_COLORS.gold }} />}
              label={t.activeListings}
              value={stats.activeListings}
              color={BRAND_COLORS.gold}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard
              icon={<Visibility sx={{ fontSize: 32, color: BRAND_COLORS.lightBlue }} />}
              label={t.totalViews}
              value={stats.totalViews}
              color={BRAND_COLORS.lightBlue}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard
              icon={<Favorite sx={{ fontSize: 32, color: '#EF4444' }} />}
              label={t.favorites}
              value={stats.totalFavorites}
              color="#EF4444"
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card sx={{ mt: 4, borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto"
            sx={{
              bgcolor: alpha(BRAND_COLORS.blue, 0.05),
              '& .MuiTab-root': {
                fontWeight: 'bold',
                color: BRAND_COLORS.blue
              },
              '& .Mui-selected': {
                color: BRAND_COLORS.gold
              },
              '& .MuiTabs-indicator': {
                bgcolor: BRAND_COLORS.gold,
                height: 3
              }
            }}
          >
            <Tab icon={<Description />} label={t.myListings} iconPosition="start" />
            {/* <Tab icon={<Favorite />} label={t.favorites} iconPosition="start" /> */}
            <Tab icon={<Chat />} label={t.chats} iconPosition="start" />
            <Tab icon={<Assessment />} label={t.analytics} iconPosition="start" />
            <Tab icon={<CardMembership />} label={t.membershipPlan} iconPosition="start" />
          </Tabs>

          <Box sx={{ p: isMobile ? 2 : 3 }}>
            <AnimatePresence mode="wait">
              {/* My Listings Tab */}
              {activeTab === 0 && (
                <motion.div
                  key="listings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {userListings.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {t.noListingsYet}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/post-ad')}
                        sx={{ mt: 2, bgcolor: BRAND_COLORS.blue }}
                      >
                        {t.postFirstAd}
                      </Button>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {userListings.map((listing) => (
                        <Grid item xs={12} sm={6} md={4} key={listing.id}>
                          <DynamicListingCard
                            listing={listing}
                            showActions={true}
                            onEdit={() => navigate(`/post-ad?edit=${listing.id}`)}
                            onDelete={handleDeleteListing}
                            onShare={handleShareListing}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </motion.div>
              )}

              {/* Favorites Tab - HIDDEN */}
              {false && activeTab === 1 && (
                <motion.div
                  key="favorites"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {userFavorites.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Favorite sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        {t.noFavoritesYet}
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {userFavorites.map((listing) => (
                        <Grid item xs={12} sm={6} md={4} key={listing.id}>
                          <DynamicListingCard
                            listing={listing}
                            isFavorite={true}
                            onToggleFavorite={handleToggleFavorite}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </motion.div>
              )}

              {/* Chats Tab */}
              {activeTab === 1 && (
                <motion.div
                  key="chats"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {userChats.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Chat sx={{ fontSize: 64, color: BRAND_COLORS.gold, mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {t.noConversationsYet}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t.startChatting}
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {userChats.map((chat) => {
                        // Logic to find the "other" user in the conversation
                        let otherUser = chat.other_user;

                        if (!otherUser && chat.participants && Array.isArray(chat.participants)) {
                          otherUser = chat.participants.find(p => p.id !== user.id && p.id !== authUser?.id);
                        }

                        // Fallback if still undefined (e.g. metadata)
                        if (!otherUser && chat.metadata) {
                          // Try to reconstruct from metadata if available
                          otherUser = {
                            full_name: chat.metadata.recipient_name || chat.metadata.other_user_name,
                            avatar_url: chat.metadata.recipient_avatar,
                            id: chat.metadata.recipient_id
                          };
                        }

                        // Check for snake_case AND camelCase (apiService returns fullName)
                        const displayName = otherUser?.full_name || otherUser?.fullName || otherUser?.name || otherUser?.email || t.unknownUser;
                        const displayAvatar = otherUser?.avatar_url || otherUser?.avatarUrl || otherUser?.avatar;

                        return (
                          <ListItemButton
                            key={chat.id}
                            onClick={() => navigate('/chat', {
                              state: {
                                conversationId: chat.id,
                                conversation: chat
                              }
                            })}
                            sx={{
                              borderRadius: 2,
                              mb: 1,
                              border: `1px solid ${alpha(BRAND_COLORS.blue, 0.1)}`,
                              '&:hover': {
                                bgcolor: alpha(BRAND_COLORS.gold, 0.05)
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Badge badgeContent={chat.unread_count || 0} color="error">
                                <Avatar src={displayAvatar}>
                                  {displayName?.[0] || '?'}
                                </Avatar>
                              </Badge>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {displayName}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {chat.last_message?.content || t.noMessagesYet}
                                </Typography>
                              }
                            />
                            <Typography variant="caption" color="text.secondary">
                              {chat.updated_at ? formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true }) : ''}
                            </Typography>
                          </ListItemButton>
                        );
                      })}
                    </List>
                  )}
                </motion.div>
              )}

              {/* Analytics Tab */}
              {activeTab === 2 && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Assessment sx={{ fontSize: 64, color: BRAND_COLORS.gold, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {t.analyticsComingSoon}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t.analyticsDesc}
                    </Typography>
                  </Box>
                </motion.div>
              )}

              {/* Membership Plan Tab */}
              {activeTab === 3 && (
                <motion.div
                  key="membership"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <MembershipTab userId={authUser?.id} />

                  {/* Show verification form if business but not verified */}
                  {user.account_type === 'business' && !user.company_verified && (
                    <Box sx={{ mt: 4 }}>
                      <CompanyVerificationForm userId={authUser?.id} />
                    </Box>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Card>
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: BRAND_COLORS.gradient,
          '&:hover': { transform: 'scale(1.1)' }
        }}
        onClick={() => navigate('/post-ad')}
      >
        <Add />
      </Fab>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t.editProfile}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t.fullName}
              fullWidth
              value={editForm.full_name || ''}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
            />
            <TextField
              label={t.bio}
              fullWidth
              multiline
              rows={3}
              value={editForm.bio || ''}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            />
            <TextField
              label={t.location}
              fullWidth
              value={editForm.location || ''}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
            />
            <TextField
              label={t.phone}
              fullWidth
              value={editForm.phone || ''}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />

            <Typography variant="subtitle2" sx={{ mt: 2 }}>{t.socialMedia}</Typography>
            <TextField
              label="Facebook"
              fullWidth
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start"><Facebook /></InputAdornment> }}
              value={editForm.social_media?.facebook || ''}
              onChange={(e) => setEditForm({
                ...editForm,
                social_media: { ...editForm.social_media, facebook: e.target.value }
              })}
            />
            <TextField
              label="Twitter"
              fullWidth
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start"><Twitter /></InputAdornment> }}
              value={editForm.social_media?.twitter || ''}
              onChange={(e) => setEditForm({
                ...editForm,
                social_media: { ...editForm.social_media, twitter: e.target.value }
              })}
            />
            <TextField
              label="Instagram"
              fullWidth
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start"><Instagram /></InputAdornment> }}
              value={editForm.social_media?.instagram || ''}
              onChange={(e) => setEditForm({
                ...editForm,
                social_media: { ...editForm.social_media, instagram: e.target.value }
              })}
            />
            <TextField
              label="LinkedIn"
              fullWidth
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start"><LinkedIn /></InputAdornment> }}
              value={editForm.social_media?.linkedin || ''}
              onChange={(e) => setEditForm({
                ...editForm,
                social_media: { ...editForm.social_media, linkedin: e.target.value }
              })}
            />
            <TextField
              label={t.website}
              fullWidth
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start"><WebIcon /></InputAdornment> }}
              value={editForm.social_media?.website || ''}
              onChange={(e) => setEditForm({
                ...editForm,
                social_media: { ...editForm.social_media, website: e.target.value }
              })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t.cancel}</Button>
          <Button onClick={handleSaveProfile} variant="contained">{t.saveChanges}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;