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
  Add, Assignment, WorkspacePremium
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import ListingDetailDialog from './ListingDetailDialog';

const TenderScreen = ({ t, handleRefresh: parentRefresh, refreshing: parentRefreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);

  const fetchTenders = useCallback(async () => {
    try {
      setLoading(true);
      // Dynamically fetch category ID
      let categoryId = await adminService.getCategoryIdBySlug('tenders');
      if (!categoryId) categoryId = await adminService.getCategoryIdBySlug('tender');

      // Fallback to strict ID 4 if dynamic resolution fails, to maintain backward compatibility
      if (!categoryId) categoryId = '4';

      const data = await adminService.getListings({ category: categoryId, status: 'all' });
      setTenders(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tenders:', err);
      setError('Failed to load tenders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  const handleRefresh = async () => {
    await fetchTenders();
    if (parentRefresh) parentRefresh();
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this tender?')) {
          await adminService.deleteListing(id);
          toast.success('Tender deleted successfully');
          fetchTenders();
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
        toast.success(`Tender listing updated successfully`);
        fetchTenders();
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      toast.error(`Failed to ${action} tender`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) return;

    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} tenders?`)) return;
    }

    try {
      await Promise.all(selectedItems.map(id => {
        if (action === 'delete') return adminService.deleteListing(id);
        const status = action === 'approve' ? 'approved' : 'rejected';
        return adminService.updateListingStatus(id, status);
      }));

      toast.success(`Bulk ${action} completed successfully`);
      setSelectedItems([]);
      fetchTenders();
    } catch (err) {
      console.error(`Error performing bulk ${action}:`, err);
      toast.error(`Failed to perform bulk ${action}`);
    }
  };

  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (tender.description || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || tender.status === filterStatus;
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

  const handleItemSelect = (tenderId) => {
    setSelectedItems(prev =>
      prev.includes(tenderId)
        ? prev.filter(id => id !== tenderId)
        : [...prev, tenderId]
    );
  };

  if (loading && tenders.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Tender Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/post-ad')}>
          Add New Tender
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{tenders.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Tenders</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {tenders.filter(t => t.status === 'approved').length}
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
                {tenders.reduce((acc, curr) => acc + (curr.views || 0), 0)}
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
              <Typography variant="body2" color="text.secondary">Applications</Typography>
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
                placeholder="Search tenders..."
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

      {/* Tenders Table */}
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
                          setSelectedItems(filteredTenders.map(tender => tender.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTenders.map((tender) => (
                  <TableRow key={tender.id} sx={tender.is_premium ? { bgcolor: 'rgba(255, 215, 0, 0.05)' } : {}}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(tender.id)}
                        onChange={() => handleItemSelect(tender.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {tender.title}
                        </Typography>
                        {tender.is_premium && (
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
                      {tender.organization ||
                        tender.custom_fields?.organization ||
                        tender.custom_fields?.['Organization Name'] ||
                        tender.custom_fields?.['organization_name'] ||
                        'N/A'}
                    </TableCell>
                    <TableCell>
                      {tender.deadline ||
                        tender.custom_fields?.deadline ||
                        tender.custom_fields?.['Deadline'] ||
                        tender.custom_fields?.['closing_date'] ||
                        'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tender.status === 'approved' ? (tender.is_premium ? 'Premium Approved' : 'Standard Approved') : tender.status}
                        color={getStatusColor(tender.status)}
                        size="small"
                        sx={tender.status === 'approved' && tender.is_premium ? { bgcolor: '#FFD700', color: 'black', fontWeight: 'bold' } : {}}
                      />
                    </TableCell>
                    <TableCell>{tender.views || 0}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => {
                            setSelectedListingId(tender.id);
                            setDetailDialogOpen(true);
                          }}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="success" onClick={() => handleAction(tender.id, 'approve')} title="Approve (Standard)">
                          <CheckCircle />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#FFD700' }} onClick={() => handleAction(tender.id, 'approve_premium')} title="Approve (Premium)">
                          <WorkspacePremium />
                        </IconButton>
                        <IconButton size="small" color="warning" onClick={() => handleAction(tender.id, 'reject')} title="Reject">
                          <Cancel />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleAction(tender.id, 'delete')} title="Delete">
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTenders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography sx={{ py: 3 }} color="text.secondary">
                        No tenders found
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

export default TenderScreen;

