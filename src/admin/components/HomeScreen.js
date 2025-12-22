import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
  CircularProgress, Alert
} from '@mui/material';
import {
  Search, Refresh, Visibility, Edit, Delete, CheckCircle, Cancel,
  Add, Home, WorkspacePremium
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import ListingDetailDialog from './ListingDetailDialog';

const HomeScreen = ({ t, handleRefresh: parentRefresh, refreshing: parentRefreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const navigate = useNavigate();
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);

  const fetchHomes = useCallback(async () => {
    try {
      setLoading(true);
      // Dynamically fetch category ID
      let categoryId = await adminService.getCategoryIdBySlug('homes');
      if (!categoryId) categoryId = await adminService.getCategoryIdBySlug('home');
      if (!categoryId) categoryId = await adminService.getCategoryIdBySlug('real-estate');
      if (!categoryId) categoryId = await adminService.getCategoryIdBySlug('houses');
      if (!categoryId) categoryId = await adminService.getCategoryIdBySlug('house');

      // Fallback to strict ID 1 if dynamic resolution fails
      if (!categoryId) categoryId = '1';

      const data = await adminService.getListings({ category: categoryId, status: 'all' });
      setHomes(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching homes:', err);
      setError('Failed to load homes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomes();
  }, [fetchHomes]);

  const handleRefresh = async () => {
    await fetchHomes();
    if (parentRefresh) parentRefresh();
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this home listing?')) {
          await adminService.deleteListing(id);
          toast.success('Home listing deleted successfully');
          fetchHomes();
        }
      } else {
        // Approve or Reject or Premium
        let status = 'approved';
        let isPremium = null;

        if (action === 'reject') {
          status = 'rejected';
        } else if (action === 'approve_premium') {
          status = 'approved';
          isPremium = true;
        } else if (action === 'approve') {
          status = 'approved';
          isPremium = false;
        }

        await adminService.updateListingStatus(id, status, isPremium);
        toast.success(`Home listing updated successfully`);
        fetchHomes();
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      toast.error(`Failed to ${action} home listing`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) return;

    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} home listings?`)) return;
    }

    try {
      await Promise.all(selectedItems.map(id => {
        if (action === 'delete') return adminService.deleteListing(id);
        const status = action === 'approve' ? 'approved' : 'rejected';
        return adminService.updateListingStatus(id, status);
      }));

      toast.success(`Bulk ${action} completed successfully`);
      setSelectedItems([]);
      fetchHomes();
    } catch (err) {
      console.error(`Error performing bulk ${action}:`, err);
      toast.error(`Failed to perform bulk ${action}`);
    }
  };

  const filteredHomes = homes.filter(home => {
    const matchesSearch = home.title.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (home.description || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || home.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const handleItemSelect = (homeId) => {
    setSelectedItems(prev =>
      prev.includes(homeId)
        ? prev.filter(id => id !== homeId)
        : [...prev, homeId]
    );
  };

  if (loading && homes.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          {t('homes')} Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/post-ad')}>
          Add New Home
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Home sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{homes.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Homes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {homes.filter(h => h.status === 'approved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Approved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Visibility sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {homes.reduce((acc, curr) => acc + (curr.views || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">Total Views</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Search sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">0</Typography>
              <Typography variant="body2" color="text.secondary">Inquiries</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search homes..."
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
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={loading}>
                  Refresh
                </Button>
                {selectedItems.length > 0 && (
                  <>
                    <Button variant="contained" color="success" onClick={() => handleBulkAction('approve')}>
                      Approve Selected
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleBulkAction('reject')}>
                      Reject Selected
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleBulkAction('delete')}>
                      Delete Selected
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Homes Table */}
      <Card>
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
                          setSelectedItems(filteredHomes.map(home => home.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHomes.map((home) => (
                  <TableRow key={home.id} sx={home.is_premium ? { bgcolor: 'rgba(255, 215, 0, 0.05)' } : {}}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(home.id)}
                        onChange={() => handleItemSelect(home.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {home.title}
                        </Typography>
                        {home.is_premium && (
                          <Chip
                            icon={<WorkspacePremium sx={{ fontSize: '1rem !important' }} />}
                            label="Premium"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>Birr {home.price?.toLocaleString() || '0'}</TableCell>
                    <TableCell>{home.city || home.location || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={home.status === 'approved' ? (home.is_premium ? 'Premium Approved' : 'Standard Approved') : home.status}
                        color={getStatusColor(home.status)}
                        size="small"
                        sx={home.status === 'approved' && home.is_premium ? { bgcolor: '#FFD700', color: 'black', fontWeight: 'bold' } : {}}
                      />
                    </TableCell>
                    <TableCell>{home.views || 0}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => {
                            setSelectedListingId(home.id);
                            setDetailDialogOpen(true);
                          }}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="success" onClick={() => handleAction(home.id, 'approve')} title="Approve (Standard)">
                          <CheckCircle />
                        </IconButton>

                        {/* Premium Toggle */}
                        <IconButton
                          size="small"
                          onClick={() => adminService.toggleListingPremium(home.id, !home.is_premium).then(() => {
                            toast.success(`Premium status ${!home.is_premium ? 'enabled' : 'disabled'}`);
                            fetchHomes();
                          })}
                          title={home.is_premium ? "Remove Premium Status" : "Mark as Premium"}
                          sx={{ color: home.is_premium ? '#FFD700' : 'grey.400' }}
                        >
                          <WorkspacePremium />
                        </IconButton>

                        <IconButton size="small" color="warning" onClick={() => handleAction(home.id, 'reject')} title="Reject">
                          <Cancel />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleAction(home.id, 'delete')} title="Delete">
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredHomes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography sx={{ py: 3 }} color="text.secondary">
                        No home listings found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Listing Detail Dialog */}
      <ListingDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedListingId(null);
        }}
        listingId={selectedListingId}
        onApprove={async (id) => {
          await handleAction(id, 'approve');
          setDetailDialogOpen(false);
        }}
        onReject={async (id) => {
          await handleAction(id, 'reject');
          setDetailDialogOpen(false);
        }}
        onDelete={async (id) => {
          await handleAction(id, 'delete');
          setDetailDialogOpen(false);
        }}
      />
    </Box>
  );
};

export default HomeScreen;

