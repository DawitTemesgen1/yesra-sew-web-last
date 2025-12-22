import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  useTheme, useMediaQuery, Container, Paper, Avatar, IconButton
} from '@mui/material';
import {
  Add, People, TrendingUp, Settings, Assignment, AccessTime,
  Payments, CheckCircle, Person, Home, DirectionsCar, Work,
  Visibility, Edit, Delete
} from '@mui/icons-material';
import {
  useResponsive,
  getResponsiveGridItemSize,
  getResponsiveCardProps,
  getResponsiveTableProps,
  getResponsiveTypography
} from '../utils/responsive';
import adminService from '../../services/adminService';

const StatCard = ({ title, value, icon, color, isMobile, isTablet }) => {
  const cardProps = getResponsiveCardProps(isMobile, isTablet);
  const typography = getResponsiveTypography('h4', isMobile, isTablet);

  return (
    <Card {...cardProps}>
      <CardContent sx={{
        textAlign: 'center',
        py: { xs: 2, sm: 2.5, md: 3 },
        px: { xs: 1, sm: 2, md: 3 }
      }}>
        <Box sx={{ color, mb: 1, fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
          {icon}
        </Box>
        <Typography
          variant={typography.variant}
          fontWeight="bold"
          color={color}
          sx={{ fontSize: typography.fontSize }}
        >
          {value}
        </Typography>
        <Typography
          variant={isMobile ? "caption" : "body2"}
          color="text.secondary"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

const ActivityItem = ({ activity, isMobile, isTablet }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      py: { xs: 1, sm: 1.5, md: 2 },
      px: { xs: 1, sm: 2, md: 3 },
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:hover': {
        backgroundColor: 'action.hover',
      }
    }}
  >
    <Avatar sx={{ mr: { xs: 1, sm: 2 }, width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
      <Person />
    </Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant={isMobile ? "body2" : "body1"}
        sx={{
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {activity.activity}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
        <Typography
          variant={isMobile ? "caption" : "body2"}
          color="text.secondary"
          sx={{ mr: 1 }}
        >
          {activity.user}
        </Typography>
        <Typography
          variant={isMobile ? "caption" : "caption"}
          color="text.secondary"
        >
          {activity.timestamp}
        </Typography>
      </Box>
    </Box>
    <Chip
      label={activity.status}
      size={isMobile ? "small" : "medium"}
      color={
        activity.status === 'success' ? 'success' :
          activity.status === 'warning' ? 'warning' : 'default'
      }
      sx={{ ml: { xs: 1, sm: 2 } }}
    />
  </Box>
);

const DashboardScreen = ({ t, showBackendWarning, stats = {} }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const theme = useTheme();

  // State for dynamic data
  const [activities, setActivities] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default stats to prevent undefined errors
  const safeStats = {
    totalListings: stats.totalListings || 0,
    pendingReview: stats.pendingReview || 0,
    approvedListings: stats.approvedListings || 0,
    rejectedListings: stats.rejectedListings || 0,
    totalUsers: stats.totalUsers || 0,
    activeUsers: stats.activeUsers || 0,
    revenue: stats.revenue || 0,
    pendingReviews: stats.pendingReview || 0
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // TODO: Fetch real data from adminService
        // For now, keep empty arrays
        setActivities([]);
        setRecentListings([]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Activities and listings are now fetched in useEffect above

  const statCards = [
    { title: 'Total Listings', value: safeStats.totalListings, icon: <Home />, color: '#2196F3' },
    { title: 'Pending Review', value: safeStats.pendingReview, icon: <AccessTime />, color: '#FF9800' },
    { title: 'Approved', value: safeStats.approvedListings, icon: <CheckCircle />, color: '#4CAF50' },
    { title: 'Total Users', value: safeStats.totalUsers, icon: <People />, color: '#9C27B0' },
    { title: 'Active Users', value: safeStats.activeUsers, icon: <TrendingUp />, color: '#00BCD4' },
    { title: 'Revenue', value: `$${safeStats.revenue.toLocaleString()}`, icon: <Payments />, color: '#FF5722' },
  ];

  const tableProps = getResponsiveTableProps(isMobile, isTablet);

  return (
    <Box>
      {showBackendWarning && (
        <Card sx={{ mb: { xs: 2, sm: 3 } }}>
          <CardContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              color="warning.main"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
            >
              Backend Connection Warning
            </Typography>
            <Typography
              variant={isMobile ? "body2" : "body1"}
              sx={{ mt: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Backend services are currently unavailable. Some features may not work as expected.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <Grid
        container
        spacing={{ xs: 1, sm: 2, md: 3 }}
        sx={{ mb: { xs: 2, sm: 3 } }}
      >
        {statCards.map((card, index) => {
          const gridProps = getResponsiveGridItemSize(index < 3 ? 6 : 12, isMobile, isTablet);
          return (
            <Grid item {...gridProps} key={index}>
              <StatCard {...card} isMobile={isMobile} isTablet={isTablet} />
            </Grid>
          );
        })}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: '100%' }}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' } }}
              >
                Recent Activities
              </Typography>
            </Box>
            <Box sx={{ maxHeight: { xs: 300, sm: 400 }, overflow: 'auto' }}>
              {activities.map((activity, index) => (
                <ActivityItem
                  key={index}
                  activity={activity}
                  isMobile={isMobile}
                  isTablet={isTablet}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Listings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: '100%' }}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight="bold"
                sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' } }}
              >
                Recent Listings
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: { xs: 300, sm: 400 } }}>
              <Table {...tableProps}>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    {!isMobile && <TableCell>Type</TableCell>}
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <Box>
                          <Typography
                            variant={isMobile ? "caption" : "body2"}
                            sx={{ fontWeight: 500 }}
                          >
                            {listing.title}
                          </Typography>
                          {!isMobile && (
                            <Typography variant="caption" color="text.secondary">
                              {listing.user}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      {!isMobile && <TableCell>{listing.type}</TableCell>}
                      <TableCell>{listing.price}</TableCell>
                      <TableCell>
                        <Chip
                          label={listing.status}
                          size="small"
                          color={listing.status === 'approved' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" color="primary">
                            <Visibility fontSize="small" />
                          </IconButton>
                          {!isMobile && (
                            <IconButton size="small" color="info">
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardScreen;

