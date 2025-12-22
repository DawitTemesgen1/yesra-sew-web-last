import React, { useState } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent, Button, Avatar,
  Chip, IconButton, useTheme, useMediaQuery, Stack, Divider, Paper,
  LinearProgress, List, ListItem, ListItemText, ListItemIcon, Tabs, Tab,
  CircularProgress, Alert
} from '@mui/material';
import {
  Person, Edit, Settings, NotificationsActive, FavoriteBorder, Visibility,
  PostAdd, Chat, Phone, Email, LocationOn, AccessTime, TrendingUp,
  Star, ArrowForward, Home, Work, DirectionsCar, Gavel, MoreVert,
  Delete, Share, CheckCircle, PendingActions, Error as ErrorIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/api';
import { formatDistanceToNow } from '../utils/dateUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { useQuery, useQueryClient } from 'react-query';

const translations = {
  en: {
    myDashboard: "My Dashboard",
    memberSince: "Member since",
    viewProfile: "View Profile",
    totalPosts: "Total Posts",
    activePosts: "Active Posts",
    totalViews: "Total Views",
    responseRate: "Response Rate",
    myListings: "My Listings",
    activity: "Activity",
    messages: "Messages",
    settings: "Settings",
    noListingsYet: "No listings yet.",
    edit: "Edit",
    share: "Share",
    delete: "Delete",
    recentActivity: "Recent Activity",
    noRecentActivity: "No recent activity.",
    manageConversations: "Manage your conversations",
    goToMessagesDesc: "Go to the messages page to chat with buyers and sellers.",
    goToMessages: "Go to Messages",
    accountSettings: "Account Settings",
    editProfile: "Edit Profile",
    preferences: "Preferences",
    notificationSettings: "Notification Settings",
    signOut: "Sign Out",
    listingDeleted: "Listing deleted successfully",
    failedDeleteListing: "Failed to delete listing",
    shareLinkCopied: "Share link copied to clipboard",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "days ago",
    failedLoadData: "Failed to load dashboard data",
    reviews: "reviews"
  },
  am: {
    myDashboard: "የእኔ ዳሽቦርድ",
    memberSince: "አባል ከ",
    viewProfile: "መገለጫ ይመልከቱ",
    totalPosts: "ጠቅላላ ልጥፎች",
    activePosts: "ንቁ ልጥፎች",
    totalViews: "ጠቅላላ ዕይታዎች",
    responseRate: "የምላሽ መጠን",
    myListings: "የእኔ ማስታወቂያዎች",
    activity: "እንቅስቃሴ",
    messages: "መልዕክቶች",
    settings: "ቅንብሮች",
    noListingsYet: "እስካሁን ምንም ማስታወቂያዎች የሉም።",
    edit: "አርትዕ",
    share: "አጋራ",
    delete: "ሰርዝ",
    recentActivity: "የቅርብ ጊዜ እንቅስቃሴ",
    noRecentActivity: "ምንም የቅርብ ጊዜ እንቅስቃሴ የለም።",
    manageConversations: "ውይይቶችዎን ያስተዳድሩ",
    goToMessagesDesc: "ከገዢዎች እና ሻጮች ጋር ለመወያየት ወደ መልዕክቶች ገጽ ይሂዱ።",
    goToMessages: "ወደ መልዕክቶች ይሂዱ",
    accountSettings: "የመለያ ቅንብሮች",
    editProfile: "መገለጫ አርትዕ",
    preferences: "ምርጫዎች",
    notificationSettings: "የማሳወቂያ ቅንብሮች",
    signOut: "ውጣ",
    listingDeleted: "ማስታወቂያው በተሳካ ሁኔታ ተሰርዟል",
    failedDeleteListing: "ማስታወቂያውን መሰረዝ አልተቻለም",
    shareLinkCopied: "የማጋሪያ አገናኝ ወደ ቅንጥብ ሰሌዳ ተቀድቷል",
    today: "ዛሬ",
    yesterday: "ትናንት",
    daysAgo: "ቀናት በፊት",
    failedLoadData: "የዳሽቦርድ ውሂብ መጫን አልተቻለም",
    reviews: "ግምገማዎች"
  },
  om: {
    myDashboard: "Daashboordii Kiyya",
    memberSince: "Miseensa erga",
    viewProfile: "Piroofayilii Ilaali",
    totalPosts: "Waliigala Maxxansaa",
    activePosts: "Maxxansaa Nuti",
    totalViews: "Waliigala Ilaalchaa",
    responseRate: "Sadarkaa Deebii",
    myListings: "Tarreewwan Kiyya",
    activity: "Sochii",
    messages: "Ergaawwan",
    settings: "Qindoomina",
    noListingsYet: "Ammatti tarreewwan hin jiran.",
    edit: "Gulaali",
    share: "Qoodi",
    delete: "Haqi",
    recentActivity: "Sochii Dhihoo",
    noRecentActivity: "Sochiin dhihoo hin jiru.",
    manageConversations: "Haasaa keessan to'adhaa",
    goToMessagesDesc: "Bittaa fi gurgurtoota waliin haasa'uuf gara fuula ergaawwanii deemaa.",
    goToMessages: "Gara Ergaawwanii Deemaa",
    accountSettings: "Qindoomina Akkaawuntii",
    editProfile: "Piroofayilii Gulaali",
    preferences: "Filannoo",
    notificationSettings: "Qindoomina Beeksisaa",
    signOut: "Ba'aa",
    listingDeleted: "Tarreen milkaa'inaan haqameera",
    failedDeleteListing: "Tarree haquun hin danda'amne",
    shareLinkCopied: "Liinkin qooduu gara clipboard'tti waraabameera",
    today: "Har'a",
    yesterday: "Kaleessa",
    daysAgo: "guyyoota dura",
    failedLoadData: "Daashboordii fe'uu hin dandeenye",
    reviews: "yaada"
  },
  ti: {
    myDashboard: "ዳሽቦርደይ",
    memberSince: "ኣባል ካብ",
    viewProfile: "ፕሮፋይል ርኣይ",
    totalPosts: "ጠቕላላ ልጥፍታት",
    activePosts: "ንጡፋት ልጥፍታት",
    totalViews: "ጠቕላላ ምርኣይ",
    responseRate: "መጠን ምላሽ",
    myListings: "ናተይ ዝርዝራት",
    activity: "ንጥፈታት",
    messages: "መልእኽትታት",
    settings: "ቅንብራት",
    noListingsYet: "ክሳብ ሕጂ ዝርዝራት የለን።",
    edit: "ኣርትዕ",
    share: "ኣካፍል",
    delete: "ሰርዝ",
    recentActivity: "ናይ ቀረባ ንጥፈታት",
    noRecentActivity: "ናይ ቀረባ ንጥፈታት የለን።",
    manageConversations: "ዝርርብኩም ኣመሓድሩ",
    goToMessagesDesc: "ምስ ዓደግትን ሸጠትን ንምዝርራብ ናብ መልእኽትታት ገጽ ኪዱ።",
    goToMessages: "ናብ መልእኽትታት ኪዱ",
    accountSettings: "ናይ ኣካውንት ቅንብራት",
    editProfile: "ፕሮፋይል ኣርትዕ",
    preferences: "ምርጫታት",
    notificationSettings: "ናይ ምልክታ ቅንብራት",
    signOut: "ውጻእ",
    listingDeleted: "ዝርዝር ብዓወት ተሰሪዙ",
    failedDeleteListing: "ዝርዝር ምድምሳስ ኣይተኻእለን",
    shareLinkCopied: "ናይ ምክፋል ሊንክ ተቀዲሑ",
    today: "ሎሚ",
    yesterday: "ትማሊ",
    daysAgo: "መዓልታት ይገብር",
    failedLoadData: "ዳሽቦርድ ዳታ ምጽዓን ኣይተኻእለን",
    reviews: "ግምገማታት"
  }
};

const DashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(0);

  // Fetch dashboard data
  const { data: dashboardData, isLoading: loading, error } = useQuery('dashboard', apiService.getDashboardData, {
    staleTime: 1000 * 60 * 5 // 5 min
  });

  const { data: notifications = [] } = useQuery('notifications', apiService.getNotifications);

  const user = dashboardData?.user || {
    name: 'User',
    email: '',
    phone: '',
    location: '',
    memberSince: '',
    verified: false,
    avatar: null,
    rating: 0,
    totalReviews: 0
  };

  const stats = dashboardData?.stats || {
    totalPosts: 0,
    activePosts: 0,
    totalViews: 0,
    responseRate: 0
  };

  const userListings = dashboardData?.listings || [];

  // Handle loading and error states
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle listing actions
  const handleEditListing = (listingId) => {
    navigate(`/listings/${listingId}/edit`);
  };

  const handleDeleteListing = async (listingId) => {
    try {
      await apiService.deleteListing(listingId);
      queryClient.setQueryData('dashboard', old => {
        if (!old) return old;
        return {
          ...old,
          listings: old.listings ? old.listings.filter(l => l.id !== listingId) : []
        };
      });
      toast.success(t.listingDeleted);
    } catch (error) {
      toast.error(t.failedDeleteListing);
    }
  };

  const handleShareListing = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/listings/${id}`);
    toast.success(t.shareLinkCopied);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'closed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'pending': return <PendingActions sx={{ fontSize: 16 }} />;
      case 'closed': return <ErrorIcon sx={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Homes': return <Home />;
      case 'Cars': return <DirectionsCar />;
      case 'Jobs': return <Work />;
      case 'Tenders': return <Gavel />;
      default: return <PostAdd />;
    }
  };

  const getDaysAgo = (date) => {
    if (!date) return '';
    const diff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return t.today;
    if (diff === 1) return t.yesterday;
    return `${diff} ${t.daysAgo}`;
  };

  return (
    <Box sx={{
      bgcolor: '#f8fafc',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      pb: isMobile ? 10 : 0
    }}>
      {/* Header */}
      <Box sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 3,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #D4AF37, #B58E2A, #D4AF37)',
        }
      }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" fontWeight="bold">
              {t.myDashboard}
            </Typography>
            <Stack direction="row" spacing={2}>
              <IconButton color="inherit" onClick={() => navigate('/notifications')}>
                <NotificationsActive />
              </IconButton>
              <IconButton color="inherit" onClick={() => navigate('/settings')}>
                <Settings />
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{
            p: 3,
            borderRadius: 4,
            mb: 4,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
            backdropFilter: 'blur(10px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.95)
          }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={2}>
                <Avatar sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  mx: 'auto',
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                }}>
                  {user.avatar || user.name?.[0]}
                </Avatar>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h5" fontWeight="bold">
                      {user.name}
                    </Typography>
                    {user.verified && <CheckCircle sx={{ color: 'primary.main', fontSize: 24 }} />}
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center" color="text.secondary">
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Email sx={{ fontSize: 16 }} />
                      <Typography variant="body2">{user.email}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Phone sx={{ fontSize: 16 }} />
                      <Typography variant="body2">{user.phone}</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                    <LocationOn sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{user.location}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {t.memberSince} {user.memberSince}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-end' }}>
                    <Star sx={{ color: 'warning.main', fontSize: 20 }} />
                    <Typography variant="h6" fontWeight="bold">
                      {user.rating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({user.totalReviews} {t.reviews})
                    </Typography>
                  </Stack>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2, borderRadius: 3 }}
                    onClick={() => navigate('/profile')}
                  >
                    {t.viewProfile}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: t.totalPosts, value: stats.totalPosts, icon: <PostAdd />, color: 'primary' },
            { label: t.activePosts, value: stats.activePosts, icon: <Visibility />, color: 'success' },
            { label: t.totalViews, value: stats.totalViews, icon: <TrendingUp />, color: 'info' },
            { label: t.responseRate, value: `${stats.responseRate}%`, icon: <Chat />, color: 'warning' }
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Card sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette[stat.color].main, 0.2)}`,
                  '&:hover': {
                    boxShadow: `0 4px 20px ${alpha(theme.palette[stat.color].main, 0.2)}`
                  }
                }}>
                  <Box sx={{ color: `${stat.color}.main`, mb: 1 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color={`${stat.color}.main`}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 4, mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 60
              }
            }}
          >
            <Tab label={t.myListings} />
            <Tab label={t.activity} />
            <Tab label={t.messages} />
            <Tab label={t.settings} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              {t.myListings}
            </Typography>
            {userListings.length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center">{t.noListingsYet}</Typography>
            ) : (
              <Grid container spacing={3}>
                {userListings.map((listing, index) => (
                  <Grid item xs={12} md={6} key={listing.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <Card sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        '&:hover': {
                          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`
                        }
                      }}>
                        <Box sx={{ display: 'flex', p: 2 }}>
                          <Box
                            component="img"
                            src={listing.image || listing.images?.[0] || '/logo.png'}
                            alt={listing.title}
                            sx={{
                              width: 100,
                              height: 100,
                              borderRadius: 2,
                              objectFit: 'cover',
                              flexShrink: 0
                            }}
                          />
                          <Box sx={{ flex: 1, ml: 2, minWidth: 0 }}>
                            <Stack spacing={1}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="h6" fontWeight="bold" noWrap>
                                    {listing.title}
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                    {getCategoryIcon(listing.category)}
                                    <Typography variant="body2" color="text.secondary">
                                      {listing.category}
                                    </Typography>
                                    <Chip
                                      label={listing.status}
                                      size="small"
                                      color={getStatusColor(listing.status)}
                                      icon={getStatusIcon(listing.status)}
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                  </Stack>
                                </Box>
                                <IconButton size="small">
                                  <MoreVert />
                                </IconButton>
                              </Stack>

                              <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                                <LocationOn sx={{ fontSize: 14 }} />
                                <Typography variant="caption">{listing.location}</Typography>
                              </Stack>

                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                  ETB {listing.price}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {getDaysAgo(listing.postedAt)}
                                </Typography>
                              </Stack>

                              <Stack direction="row" spacing={2} alignItems="center">
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Visibility sx={{ fontSize: 16 }} />
                                  <Typography variant="caption">{listing.views}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Chat sx={{ fontSize: 16 }} />
                                  <Typography variant="caption">{listing.chats}</Typography>
                                </Stack>
                              </Stack>
                            </Stack>
                          </Box>
                        </Box>

                        <Divider />

                        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleEditListing(listing.id)}
                            >
                              {t.edit}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="info"
                              onClick={() => handleShareListing(listing.id)}
                            >
                              {t.share}
                            </Button>
                          </Stack>
                          <Button
                            size="small"
                            variant="text"
                            color="error"
                            onClick={() => handleDeleteListing(listing.id)}
                          >
                            {t.delete}
                          </Button>
                        </Box>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              {t.recentActivity}
            </Typography>
            <Card sx={{ borderRadius: 3 }}>
              <List>
                {notifications.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>{t.noRecentActivity}</Typography>
                ) : (
                  notifications.map((notification) => (
                    <React.Fragment key={notification.id}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                          {notification.type === 'chat' && <Chat color="primary" />}
                          {notification.type === 'view' && <Visibility color="info" />}
                          {notification.type === 'favorite' && <FavoriteBorder color="error" />}
                          {notification.type === 'system' && <CheckCircle color="success" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={notification.message || notification.title}
                          secondary={notification.created_at ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }) : ''}
                          primaryTypographyProps={{
                            fontWeight: !notification.read ? 600 : 'normal',
                            color: !notification.read ? 'text.primary' : 'text.secondary'
                          }}
                        />
                        {!notification.read && (
                          <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                        )}
                      </ListItem>
                      {notification.id < notifications.length && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </Card>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              {t.messages}
            </Typography>
            <Card sx={{ borderRadius: 3, p: 3, textAlign: 'center' }}>
              <Chat sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t.manageConversations}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t.goToMessagesDesc}
              </Typography>
              <Button variant="contained" onClick={() => navigate('/chat')}>
                {t.goToMessages}
              </Button>
            </Card>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              {t.accountSettings}
            </Typography>
            <Card sx={{ borderRadius: 3, p: 3 }}>
              <Stack spacing={3}>
                <Button variant="outlined" startIcon={<Edit />} fullWidth onClick={() => navigate('/profile')}>
                  {t.editProfile}
                </Button>
                <Button variant="outlined" startIcon={<Settings />} fullWidth onClick={() => navigate('/settings')}>
                  {t.preferences}
                </Button>
                <Button variant="outlined" startIcon={<NotificationsActive />} fullWidth onClick={() => navigate('/notifications')}>
                  {t.notificationSettings}
                </Button>
                <Divider />
                <Button variant="text" color="error" fullWidth onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/');
                }}>
                  {t.signOut}
                </Button>
              </Stack>
            </Card>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DashboardPage;

