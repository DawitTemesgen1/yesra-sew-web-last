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
  Add, Work, WorkspacePremium
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const JobsScreen = ({ t, handleRefresh: parentRefresh, refreshing: parentRefreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      // Dynamically fetch category ID
      let categoryId = await adminService.getCategoryIdBySlug('jobs');
      if (!categoryId) categoryId = await adminService.getCategoryIdBySlug('job');

      // Fallback to strict ID 3 if dynamic resolution fails
      if (!categoryId) categoryId = '3';

      const data = await adminService.getListings({ category: categoryId, status: 'all' });
      setJobs(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRefresh = async () => {
    await fetchJobs();
    if (parentRefresh) parentRefresh();
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this job listing?')) {
          await adminService.deleteListing(id);
          toast.success('Job listing deleted successfully');
          fetchJobs();
        }
      } else {
        // Approve or Reject or Approve Premium
        let status = 'approved';
        let isPremium = null;

        if (action === 'reject') {
          status = 'rejected';
        } else if (action === 'approve_premium') {
          status = 'approved';
          isPremium = true;
        } else if (action === 'approve') {
          status = 'approved';
          isPremium = false; // Standard -> Not Premium
        }

        await adminService.updateListingStatus(id, status, isPremium);
        toast.success(`Job listing updated successfully`);
        fetchJobs();
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      toast.error(`Failed to update job listing`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) return;

    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} job listings?`)) return;
    }

    try {
      await Promise.all(selectedItems.map(id => {
        if (action === 'delete') return adminService.deleteListing(id);
        const status = action === 'approve' ? 'approved' : 'rejected';
        return adminService.updateListingStatus(id, status);
      }));

      toast.success(`Bulk ${action} completed successfully`);
      setSelectedItems([]);
      fetchJobs();
    } catch (err) {
      console.error(`Error performing bulk ${action}:`, err);
      toast.error(`Failed to perform bulk ${action}`);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (job.description || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
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

  const handleItemSelect = (jobId) => {
    setSelectedItems(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  if (loading && jobs.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Jobs Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/post-ad')}>
          Add New Job
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Work sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{jobs.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Jobs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {jobs.filter(j => j.status === 'approved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Active Jobs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Visibility sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {jobs.reduce((acc, curr) => acc + (curr.views || 0), 0)}
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
                placeholder="Search jobs..."
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

      {/* Jobs Table */}
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
                          setSelectedItems(filteredJobs.map(job => job.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id} sx={job.is_premium ? { bgcolor: 'rgba(255, 215, 0, 0.05)' } : {}}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(job.id)}
                        onChange={() => handleItemSelect(job.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {job.title}
                        </Typography>
                        {job.is_premium && (
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
                      {job.company || job.custom_fields?.company || job.custom_fields?.['Company Name'] || job.custom_fields?.['company_name'] || 'N/A'}
                    </TableCell>
                    <TableCell>{job.price || 'Negotiable'}</TableCell>
                    <TableCell>
                      <Chip
                        label={job.status === 'approved' ? (job.is_premium ? 'Premium Approved' : 'Standard Approved') : job.status}
                        color={getStatusColor(job.status)}
                        size="small"
                        sx={job.status === 'approved' && job.is_premium ? { bgcolor: '#FFD700', color: 'black', fontWeight: 'bold' } : {}}
                      />
                    </TableCell>
                    <TableCell>{job.views || 0}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="success" onClick={() => handleAction(job.id, 'approve')} title="Approve (Standard)">
                          <CheckCircle />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#FFD700' }} onClick={() => handleAction(job.id, 'approve_premium')} title="Approve (Premium)">
                          <WorkspacePremium />
                        </IconButton>
                        <IconButton size="small" color="warning" onClick={() => handleAction(job.id, 'reject')} title="Reject">
                          <Cancel />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleAction(job.id, 'delete')} title="Delete">
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredJobs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography sx={{ py: 3 }} color="text.secondary">
                        No job listings found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default JobsScreen;
