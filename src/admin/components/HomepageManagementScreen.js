import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
  Switch, FormControlLabel, Divider
} from '@mui/material';
import {
  Search, Refresh, Visibility, Edit, Delete, CheckCircle, Cancel,
  Add, Home, Public, TrendingUp, Star, Image, Description
} from '@mui/icons-material';

const HomepageManagementScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const homepageSections = [
    {
      id: 1,
      section: 'Hero Banner',
      type: 'banner',
      title: 'Welcome to Yesra Sew',
      description: 'Find your perfect home, car, job, or tender',
      status: 'active',
      visible: true,
      order: 1,
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      section: 'Featured Listings',
      type: 'listings',
      title: 'Featured Properties',
      description: 'Hand-picked homes and apartments',
      status: 'active',
      visible: true,
      order: 2,
      lastUpdated: '2024-01-14'
    },
    {
      id: 3,
      section: 'Latest Tenders',
      type: 'tenders',
      title: 'Latest Government Tenders',
      description: 'Recent tender opportunities',
      status: 'active',
      visible: true,
      order: 3,
      lastUpdated: '2024-01-13'
    },
    {
      id: 4,
      section: 'Popular Jobs',
      type: 'jobs',
      title: 'Popular Job Listings',
      description: 'Top job opportunities',
      status: 'active',
      visible: true,
      order: 4,
      lastUpdated: '2024-01-12'
    },
    {
      id: 5,
      section: 'Statistics',
      type: 'stats',
      title: 'Platform Statistics',
      description: 'Our numbers speak for themselves',
      status: 'active',
      visible: true,
      order: 5,
      lastUpdated: '2024-01-11'
    },
    {
      id: 6,
      section: 'Testimonials',
      type: 'testimonials',
      title: 'What Our Users Say',
      description: 'Customer success stories',
      status: 'inactive',
      visible: false,
      order: 6,
      lastUpdated: '2024-01-10'
    },
    {
      id: 7,
      section: 'Newsletter Signup',
      type: 'form',
      title: 'Stay Updated',
      description: 'Subscribe to our newsletter',
      status: 'active',
      visible: true,
      order: 7,
      lastUpdated: '2024-01-09'
    },
    {
      id: 8,
      section: 'Footer Links',
      type: 'footer',
      title: 'Quick Links',
      description: 'Important site navigation',
      visible: true,
      order: 8,
      lastUpdated: '2024-01-08'
    }
  ];

  const filteredSections = homepageSections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      section.description.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || section.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'banner': return <Image sx={{ fontSize: 20 }} />;
      case 'listings': return <Home sx={{ fontSize: 20 }} />;
      case 'tenders': return <Public sx={{ fontSize: 20 }} />;
      case 'jobs': return <TrendingUp sx={{ fontSize: 20 }} />;
      case 'stats': return <Star sx={{ fontSize: 20 }} />;
      case 'testimonials': return <Description sx={{ fontSize: 20 }} />;
      case 'form': return <Edit sx={{ fontSize: 20 }} />;
      case 'footer': return <Public sx={{ fontSize: 20 }} />;
      default: return <Home sx={{ fontSize: 20 }} />;
    }
  };

  const handleItemSelect = (sectionId) => {
    setSelectedItems(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on sections:`, selectedItems);
  };

  const handleVisibilityToggle = (sectionId) => {
    console.log(`Toggle visibility for section: ${sectionId}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Homepage Management
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Add New Section
        </Button>
      </Box>

      {/* Stats Cards */}
      < Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Home sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">8</Typography>
              <Typography variant="body2" color="text.secondary">Total Sections</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">7</Typography>
              <Typography variant="body2" color="text.secondary">Active Sections</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Visibility sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">6</Typography>
              <Typography variant="body2" color="text.secondary">Visible Sections</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Public sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">24.5K</Typography>
              <Typography variant="body2" color="text.secondary">Daily Visitors</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid >

      {/* Filters and Search */}
      < Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={refreshing}>
                  Refresh
                </Button>
                {selectedItems.length > 0 && (
                  <>
                    <Button variant="contained" color="success" onClick={() => handleBulkAction('activate')}>
                      Activate Selected
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleBulkAction('deactivate')}>
                      Deactivate Selected
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card >

      {/* Homepage Sections Table */}
      < Card >
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredSections.map(section => section.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Visible</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(section.id)}
                        onChange={() => handleItemSelect(section.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {section.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {section.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(section.type)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {section.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={section.status}
                        color={getStatusColor(section.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={section.visible}
                            onChange={() => handleVisibilityToggle(section.id)}
                            size="small"
                          />
                        }
                        label=""
                      />
                    </TableCell>
                    <TableCell>{section.order}</TableCell>
                    <TableCell>{section.lastUpdated}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="success">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card >

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="outlined" fullWidth startIcon={<Image />}>
                Manage Hero Banner
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="outlined" fullWidth startIcon={<Star />}>
                Update Statistics
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="outlined" fullWidth startIcon={<Description />}>
                Edit Testimonials
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="outlined" fullWidth startIcon={<Public />}>
                Preview Homepage
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HomepageManagementScreen;
