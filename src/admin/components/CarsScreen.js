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
  Add, DirectionsCar, WorkspacePremium
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import ListingDetailDialog from './ListingDetailDialog';

const CarsScreen = ({ t, handleRefresh: parentRefresh, refreshing: parentRefreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      // Dynamically fetch category ID
      let categoryId = await adminService.getCategoryIdBySlug('cars');
      if (!categoryId) categoryId = await adminService.getCategoryIdBySlug('vehicles');
      if (!categoryId) categoryId = await adminService.getCategoryIdBySlug('car');
      if (!categoryId) categoryId = await adminService.getCategoryIdBySlug('vehicle');

      // Fallback to strict ID 2 if dynamic resolution fails
      if (!categoryId) categoryId = '2';

      const data = await adminService.getListings({ category: categoryId, status: 'all' });
      setCars(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to load cars');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleRefresh = async () => {
    await fetchCars();
    if (parentRefresh) parentRefresh();
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this car listing?')) {
          await adminService.deleteListing(id);
          toast.success('Car listing deleted successfully');
          fetchCars();
        }
      } else {
        // Approve or Reject
        const status = action === 'approve' || action === 'approve_premium' ? 'approved' : 'rejected';
        const isPremium = action === 'approve_premium';
        await adminService.updateListingStatus(id, status, isPremium ? true : null);

        toast.success(`Car listing ${status} ${isPremium ? '(Premium)' : ''} successfully`);
        fetchCars();
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      toast.error(`Failed to ${action} car listing`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) return;

    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} car listings?`)) return;
    }

    try {
      await Promise.all(selectedItems.map(id => {
        if (action === 'delete') return adminService.deleteListing(id);
        const status = action === 'approve' ? 'approved' : 'rejected';
        return adminService.updateListingStatus(id, status);
      }));

      toast.success(`Bulk ${action} completed successfully`);
      setSelectedItems([]);
      fetchCars();
    } catch (err) {
      console.error(`Error performing bulk ${action}:`, err);
      toast.error(`Failed to perform bulk ${action}`);
    }
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.title.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (car.description || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || car.status === filterStatus;
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

  const handleItemSelect = (carId) => {
    setSelectedItems(prev =>
      prev.includes(carId)
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    );
  };

  if (loading && cars.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          {t('cars')} Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/post-ad')}>
          Add New Car
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <DirectionsCar sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{cars.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Cars</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {cars.filter(c => c.status === 'approved').length}
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
                {cars.reduce((acc, curr) => acc + (curr.views || 0), 0)}
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
                placeholder="Search cars..."
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

      {/* Cars Table */}
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
                          setSelectedItems(filteredCars.map(car => car.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Make/Model</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(car.id)}
                        onChange={() => handleItemSelect(car.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {car.title}
                        </Typography>
                        {car.is_premium && (
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
                    <TableCell>
                      {car.make || car.custom_fields?.make || car.custom_fields?.['Make'] || ''} {car.model || car.custom_fields?.model || car.custom_fields?.['Model'] || ''}
                    </TableCell>
                    <TableCell>Birr {car.price?.toLocaleString() || '0'}</TableCell>
                    <TableCell>
                      <Chip
                        label={car.status === 'approved' ? (car.is_premium ? 'Premium Approved' : 'Standard Approved') : car.status}
                        color={getStatusColor(car.status)}
                        size="small"
                        sx={car.status === 'approved' && car.is_premium ? { bgcolor: '#FFD700', color: 'black', fontWeight: 'bold' } : {}}
                      />
                    </TableCell>
                    <TableCell>{car.views || 0}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => {
                            setSelectedListingId(car.id);
                            setDetailDialogOpen(true);
                          }}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="success" onClick={() => handleAction(car.id, 'approve')} title="Approve (Standard)">
                          <CheckCircle />
                        </IconButton>

                        {/* Premium Toggle */}
                        <IconButton
                          size="small"
                          onClick={() => adminService.toggleListingPremium(car.id, !car.is_premium).then(() => {
                            toast.success(`Premium status ${!car.is_premium ? 'enabled' : 'disabled'}`);
                            fetchCars();
                          })}
                          title={car.is_premium ? "Remove Premium Status" : "Mark as Premium"}
                          sx={{ color: car.is_premium ? '#FFD700' : 'grey.400' }}
                        >
                          <WorkspacePremium />
                        </IconButton>

                        <IconButton size="small" color="warning" onClick={() => handleAction(car.id, 'reject')} title="Reject">
                          <Cancel />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleAction(car.id, 'delete')} title="Delete">
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCars.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography sx={{ py: 3 }} color="text.secondary">
                        No car listings found
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

export default CarsScreen;

