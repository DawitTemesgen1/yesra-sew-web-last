import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  LinearProgress, Avatar, useTheme, alpha
} from '@mui/material';
import {
  TrendingUp, People, Assignment, DirectionsCar, Work, Home,
  CheckCircle, Cancel, Search, Delete,
  Refresh, Add, AttachMoney, Notifications, ArrowUpward, ArrowDownward
} from '@mui/icons-material';

const AdminHomepage = ({ t, handleRefresh, refreshing, stats, listings, users, tenders }) => {
  const theme = useTheme();

  const recentActivity = [
    {
      id: 1,
      action: 'New tender posted',
      user: 'John Doe',
      details: 'Government Construction Project',
      timestamp: '2 hours ago',
      status: 'success',
      avatar: 'JD'
    },
    {
      id: 2,
      action: 'Home listing approved',
      user: 'Admin',
      details: 'Modern Apartment in Bole',
      timestamp: '3 hours ago',
      status: 'success',
      avatar: 'AD'
    },
    {
      id: 3,
      action: 'Car listing rejected',
      user: 'Admin',
      details: 'Toyota Corolla 2018',
      timestamp: '5 hours ago',
      status: 'warning',
      avatar: 'AD'
    },
    {
      id: 4,
      action: 'New user registered',
      user: 'Jane Smith',
      details: 'jane.smith@email.com',
      timestamp: '6 hours ago',
      status: 'success',
      avatar: 'JS'
    },
    {
      id: 5,
      action: 'Job posting updated',
      user: 'Mike Johnson',
      details: 'Senior Software Developer',
      timestamp: '8 hours ago',
      status: 'info',
      avatar: 'MJ'
    }
  ];

  const quickStats = [
    {
      title: 'Total Listings',
      value: stats.totalListings || 0,
      icon: <Assignment fontSize="large" />,
      color: theme.palette.primary.main,
      bgcolor: alpha(theme.palette.primary.main, 0.1),
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers || 0,
      icon: <People fontSize="large" />,
      color: theme.palette.success.main,
      bgcolor: alpha(theme.palette.success.main, 0.1),
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Revenue',
      value: `ETB ${(stats.revenue || 0).toLocaleString()}`,
      icon: <AttachMoney fontSize="large" />,
      color: theme.palette.warning.main,
      bgcolor: alpha(theme.palette.warning.main, 0.1),
      change: '+15%',
      changeType: 'increase'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReview || 0,
      icon: <Notifications fontSize="large" />,
      color: theme.palette.secondary.main,
      bgcolor: alpha(theme.palette.secondary.main, 0.1),
      change: '-5%',
      changeType: 'decrease'
    }
  ];

  const categoryStats = [
    { name: 'Homes', icon: <Home />, count: listings?.filter(l => l.category === 'home').length || 0, color: '#3B82F6' },
    { name: 'Cars', icon: <DirectionsCar />, count: listings?.filter(l => l.category === 'car').length || 0, color: '#10B981' },
    { name: 'Jobs', icon: <Work />, count: listings?.filter(l => l.category === 'job').length || 0, color: '#F59E0B' },
    { name: 'Tenders', icon: <Assignment />, count: tenders?.length || 0, color: '#EC4899' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'warning': return <Cancel sx={{ fontSize: 16 }} />;
      case 'error': return <Delete sx={{ fontSize: 16 }} />;
      case 'info': return <Search sx={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 5,
        mt: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h3" fontWeight="800" gutterBottom sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px'
          }}>
            Dashboard Overview
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="400">
            Welcome back! Here's what's happening with your platform today.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary" // Changed from outlined to contained for better visibility
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ borderRadius: 10, px: 3, background: theme.palette.background.paper, color: theme.palette.text.primary, border: '1px solid ' + theme.palette.divider, boxShadow: theme.shadows[1] }}
          >
            Refresh Data
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ borderRadius: 10, px: 3, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` }}
          >
            Quick Post
          </Button>
        </Box>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {quickStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: alpha(stat.color, 0.1)
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0, right: 0,
                width: '100px', height: '100px',
                background: `radial-gradient(circle at top right, ${alpha(stat.color, 0.15)}, transparent 70%)`,
                borderRadius: '0 0 0 100%'
              }} />

              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: stat.bgcolor,
                    color: stat.color,
                    display: 'flex', alignItems: 'center', justifyItems: 'center'
                  }}>
                    {stat.icon}
                  </Box>
                  <Chip
                    label={stat.change}
                    size="small"
                    icon={stat.changeType === 'increase' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                    sx={{
                      bgcolor: stat.changeType === 'increase' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                      color: stat.changeType === 'increase' ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                      borderRadius: 2
                    }}
                  />
                </Box>

                <Typography variant="h3" fontWeight="800" sx={{ mb: 0.5, color: theme.palette.text.primary }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Category Overview */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Category Distribution</Typography>
                <Button size="small" endIcon={<TrendingUp />}>View Report</Button>
              </Box>

              <Grid container spacing={2}>
                {categoryStats.map((category, index) => (
                  <Grid item xs={6} sm={6} md={3} key={index}>
                    <Card variant="outlined" sx={{
                      textAlign: 'center',
                      py: 3,
                      border: '1px solid ' + alpha(category.color, 0.2),
                      transition: '0.3s',
                      '&:hover': {
                        bgcolor: alpha(category.color, 0.05),
                        transform: 'translateY(-5px)'
                      }
                    }}>
                      <Box sx={{ color: category.color, mb: 1, '& svg': { fontSize: 32 } }}>
                        {category.icon}
                      </Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                        {category.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight="500">
                        {category.name}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" gutterBottom>System Health</Typography>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" fontWeight="bold">Server Uptime</Typography>
                      <Typography variant="caption" color="success.main">99.9%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={99} color="success" sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.2) }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" fontWeight="bold">Database Load</Typography>
                      <Typography variant="caption" color="primary.main">42%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={42} color="primary" sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.2) }} />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%', maxHeight: 600, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Recent Activity</Typography>

              <Box sx={{ overflowY: 'auto', pr: 1, mt: 2, flex: 1 }}>
                {recentActivity.map((activity, index) => (
                  <Box key={activity.id} sx={{ mb: 2, pb: 2, borderBottom: index < recentActivity.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar sx={{
                        width: 40, height: 40, mr: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        {activity.avatar}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="600" color="text.primary">
                          {activity.action}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
                          {activity.details}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(activity.status)}
                          label={activity.timestamp}
                          color={getStatusColor(activity.status)}
                          size="small"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions Row */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white'
          }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold">Ready to manage content?</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Jump straight into your most common tasks.</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" sx={{ bgcolor: 'white', color: theme.palette.primary.main, '&:hover': { bgcolor: alpha('#fff', 0.9) } }}>
                  Review Pending Listings
                </Button>
                <Button variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  Manage Users
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminHomepage;
