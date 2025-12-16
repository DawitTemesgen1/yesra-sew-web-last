import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress, Alert, Tabs, Tab,
  List, ListItem, ListItemText, ListItemIcon, Divider
} from '@mui/material';
import {
  TrendingUp, People, Visibility, ShoppingCart, Star, Search,
  Refresh, Download, DateRange, Category, AttachMoney, CheckCircle,
  TrendingDown, ArrowUpward, ArrowDownward, Remove
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import adminService from '../../services/adminService';
import { supabase } from '../../services/api';
import toast from 'react-hot-toast';

const AnalyticsScreen = ({ t }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7days');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalViews: 0,
      totalUsers: 0,
      totalListings: 0,
      totalRevenue: 0,
      viewsChange: 0,
      usersChange: 0,
      listingsChange: 0,
      revenueChange: 0
    },
    pageViews: [],
    userGrowth: [],
    topListings: [],
    topCategories: [],
    searchTerms: [],
    conversionRates: {
      signupRate: 0,
      listingRate: 0,
      subscriptionRate: 0
    },
    recentActivity: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '24hours':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Fetch all analytics data in parallel
      const [
        overviewData,
        pageViewsData,
        userGrowthData,
        topListingsData,
        categoriesData,
        searchData,
        conversionData
      ] = await Promise.all([
        fetchOverview(startDate, endDate),
        fetchPageViews(startDate, endDate),
        fetchUserGrowth(startDate, endDate),
        fetchTopListings(startDate, endDate),
        fetchTopCategories(startDate, endDate),
        fetchSearchTerms(startDate, endDate),
        fetchConversionRates(startDate, endDate)
      ]);

      setAnalytics({
        overview: overviewData,
        pageViews: pageViewsData,
        userGrowth: userGrowthData,
        topListings: topListingsData,
        topCategories: categoriesData,
        searchTerms: searchData,
        conversionRates: conversionData,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async (startDate, endDate) => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get new users in period
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Get total listings
      const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get new listings in period
      const { count: newListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Get total revenue from subscriptions
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('membership_plans(price)')
        .eq('status', 'active');

      const totalRevenue = subscriptions?.reduce((sum, sub) =>
        sum + (sub.membership_plans?.price || 0), 0) || 0;

      // Get page views from analytics_events
      const { count: totalViews } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .gte('created_at', startDate.toISOString());

      return {
        totalViews: totalViews || 0,
        totalUsers: totalUsers || 0,
        totalListings: totalListings || 0,
        totalRevenue: totalRevenue,
        viewsChange: 0, // TODO: Calculate from historical data
        usersChange: newUsers > 0 ? ((newUsers / (totalUsers - newUsers)) * 100) : 0,
        listingsChange: newListings > 0 ? ((newListings / (totalListings - newListings)) * 100) : 0,
        revenueChange: 0 // TODO: Calculate from historical data
      };
    } catch (error) {
      console.error('Error fetching overview:', error);
      return {
        totalViews: 0,
        totalUsers: 0,
        totalListings: 0,
        totalRevenue: 0,
        viewsChange: 0,
        usersChange: 0,
        listingsChange: 0,
        revenueChange: 0
      };
    }
  };

  const fetchPageViews = async (startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('created_at')
        .eq('event_type', 'page_view')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');

      if (error) throw error;

      // Group by date
      const viewsByDate = {};
      data?.forEach(event => {
        const date = new Date(event.created_at).toLocaleDateString();
        viewsByDate[date] = (viewsByDate[date] || 0) + 1;
      });

      return Object.entries(viewsByDate).map(([date, views]) => ({
        date,
        views
      }));
    } catch (error) {
      console.error('Error fetching page views:', error);
      // Return empty array if table doesn't exist or error occurs
      return [];
    }
  };

  const fetchUserGrowth = async (startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');

      if (error) throw error;

      // Group by date
      const usersByDate = {};
      let cumulative = 0;
      data?.forEach(user => {
        const date = new Date(user.created_at).toLocaleDateString();
        usersByDate[date] = (usersByDate[date] || 0) + 1;
      });

      return Object.entries(usersByDate).map(([date, count]) => {
        cumulative += count;
        return { date, users: cumulative };
      });
    } catch (error) {
      console.error('Error fetching user growth:', error);
      return [];
    }
  };

  const fetchTopListings = async (startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, views, category, created_at')
        .eq('status', 'approved')
        .order('views', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data?.map(listing => ({
        id: listing.id,
        title: listing.title,
        views: listing.views || 0,
        category: listing.category
      })) || [];
    } catch (error) {
      console.error('Error fetching top listings:', error);
      return [];
    }
  };

  const fetchTopCategories = async (startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('category')
        .eq('status', 'approved');

      if (error) throw error;

      // Count by category
      const categoryCounts = {};
      data?.forEach(listing => {
        const cat = listing.category || 'other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      return Object.entries(categoryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  const fetchSearchTerms = async (startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('metadata')
        .eq('event_type', 'search')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Count search terms
      const termCounts = {};
      data?.forEach(event => {
        const term = event.metadata?.query;
        if (term) {
          termCounts[term] = (termCounts[term] || 0) + 1;
        }
      });

      return Object.entries(termCounts)
        .map(([term, count]) => ({ term, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching search terms:', error);
      return [];
    }
  };

  const fetchConversionRates = async (startDate, endDate) => {
    try {
      const { count: totalVisitors } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .gte('created_at', startDate.toISOString());

      const { count: signups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      const { count: listings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      const { count: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      return {
        signupRate: totalVisitors > 0 ? ((signups / totalVisitors) * 100).toFixed(2) : 0,
        listingRate: signups > 0 ? ((listings / signups) * 100).toFixed(2) : 0,
        subscriptionRate: signups > 0 ? ((subscriptions / signups) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error fetching conversion rates:', error);
      return {
        signupRate: 0,
        listingRate: 0,
        subscriptionRate: 0
      };
    }
  };


  const getTrendIcon = (change) => {
    if (change > 0) return <ArrowUpward sx={{ fontSize: 16, color: '#4CAF50' }} />;
    if (change < 0) return <ArrowDownward sx={{ fontSize: 16, color: '#f44336' }} />;
    return <Remove sx={{ fontSize: 16, color: '#9E9E9E' }} />;
  };

  const getTrendColor = (change) => {
    if (change > 0) return '#4CAF50';
    if (change < 0) return '#f44336';
    return '#9E9E9E';
  };

  const COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24hours">Last 24 Hours</MenuItem>
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchAnalytics}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Download />}>
            Export
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Views
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.overview.totalViews.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    {getTrendIcon(analytics.overview.viewsChange)}
                    <Typography variant="body2" sx={{ color: getTrendColor(analytics.overview.viewsChange) }}>
                      {Math.abs(analytics.overview.viewsChange)}%
                    </Typography>
                  </Box>
                </Box>
                <Visibility sx={{ fontSize: 40, color: '#2196F3', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.overview.totalUsers.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    {getTrendIcon(analytics.overview.usersChange)}
                    <Typography variant="body2" sx={{ color: getTrendColor(analytics.overview.usersChange) }}>
                      {Math.abs(analytics.overview.usersChange).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <People sx={{ fontSize: 40, color: '#4CAF50', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Listings
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.overview.totalListings.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    {getTrendIcon(analytics.overview.listingsChange)}
                    <Typography variant="body2" sx={{ color: getTrendColor(analytics.overview.listingsChange) }}>
                      {Math.abs(analytics.overview.listingsChange).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <ShoppingCart sx={{ fontSize: 40, color: '#FF9800', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.overview.totalRevenue.toLocaleString()} ETB
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    {getTrendIcon(analytics.overview.revenueChange)}
                    <Typography variant="body2" sx={{ color: getTrendColor(analytics.overview.revenueChange) }}>
                      {Math.abs(analytics.overview.revenueChange)}%
                    </Typography>
                  </Box>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: '#9C27B0', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Page Views Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Page Views Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.pageViews}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stroke="#2196F3" fill="#2196F3" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* User Growth Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                User Growth
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#4CAF50" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top Categories
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.topCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Conversion Rates */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Conversion Rates
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Visitor to Signup</Typography>
                    <Typography variant="body2" fontWeight="bold">{analytics.conversionRates.signupRate}%</Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.200', borderRadius: 1 }}>
                    <Box sx={{ width: `${analytics.conversionRates.signupRate}%`, height: '100%', bgcolor: '#2196F3', borderRadius: 1 }} />
                  </Box>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Signup to Listing</Typography>
                    <Typography variant="body2" fontWeight="bold">{analytics.conversionRates.listingRate}%</Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.200', borderRadius: 1 }}>
                    <Box sx={{ width: `${analytics.conversionRates.listingRate}%`, height: '100%', bgcolor: '#4CAF50', borderRadius: 1 }} />
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Signup to Subscription</Typography>
                    <Typography variant="body2" fontWeight="bold">{analytics.conversionRates.subscriptionRate}%</Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.200', borderRadius: 1 }}>
                    <Box sx={{ width: `${analytics.conversionRates.subscriptionRate}%`, height: '100%', bgcolor: '#FF9800', borderRadius: 1 }} />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tables */}
      <Grid container spacing={3}>
        {/* Top Listings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top Listings
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Views</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.topListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>{listing.title}</TableCell>
                        <TableCell>
                          <Chip label={listing.category} size="small" />
                        </TableCell>
                        <TableCell align="right">{listing.views}</TableCell>
                      </TableRow>
                    ))}
                    {analytics.topListings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Search Terms */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Popular Search Terms
              </Typography>
              <List>
                {analytics.searchTerms.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Search />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.term}
                      secondary={`${item.count} searches`}
                    />
                  </ListItem>
                ))}
                {analytics.searchTerms.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No search data available
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsScreen;
