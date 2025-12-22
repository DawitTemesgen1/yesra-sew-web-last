import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
  Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, List, ListItem,
  ListItemText, ListItemIcon, ListItemSecondaryAction, Alert,
  LinearProgress, Paper, Tooltip
} from '@mui/material';
import {
  Search, Refresh, Visibility, Edit,
  Add, Smartphone, Android, Apple, Download, Upload,
  Build, BugReport, Assessment, Speed,
  Place, Camera, Notifications, Contacts, Storage, Settings, Star
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const MobileAppScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm: parentSetSearchTerm, filterStatus, setFilterStatus: parentSetFilterStatus }) => {
  const [appVersions, setAppVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [buildDialog, setBuildDialog] = useState(false);
  const [versionDialog, setVersionDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // Local state for filters
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localFilterStatus, setLocalFilterStatus] = useState('all');

  const effectiveSearchTerm = searchTerm !== undefined ? searchTerm : localSearchTerm;
  const setEffectiveSearchTerm = parentSetSearchTerm || setLocalSearchTerm;
  const effectiveFilterStatus = filterStatus !== undefined ? filterStatus : localFilterStatus;
  const setEffectiveFilterStatus = parentSetFilterStatus || setLocalFilterStatus;

  // State for analytics and permissions - will be fetched from Supabase
  const [appAnalytics, setAppAnalytics] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [buildStatus, setBuildStatus] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const versions = await adminService.getMobileAppVersions();
      setAppVersions(versions || []);
    } catch (error) {
      console.error('Error fetching mobile app data:', error);
      toast.error('Failed to load mobile app versions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (refreshing) fetchData();
  }, [refreshing]);

  const filteredVersions = appVersions.filter(version => {
    const sTerm = effectiveSearchTerm || '';
    const matchSearch = (version.version || '').toLowerCase().includes(sTerm.toLowerCase()) ||
      (version.platform || '').toLowerCase().includes(sTerm.toLowerCase());

    const matchFilter = effectiveFilterStatus === 'all' || version.status === effectiveFilterStatus;

    // 0: All, 1: Android, 2: iOS
    const matchTab = activeTab === 0 ||
      (activeTab === 1 && version.platform === 'android') ||
      (activeTab === 2 && version.platform === 'ios');

    return matchSearch && matchFilter && matchTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'building': return 'warning';
      case 'queued': return 'info';
      case 'failed': return 'error';
      case 'deprecated': return 'default';
      default: return 'default';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'android': return <Android sx={{ fontSize: 20 }} />;
      case 'ios': return <Apple sx={{ fontSize: 20 }} />;
      default: return <Smartphone sx={{ fontSize: 20 }} />;
    }
  };

  const handleItemSelect = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkAction = async (action) => {
    // Stub
    toast('Bulk actions not implemented yet');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Mobile App Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Build />} onClick={() => setBuildDialog(true)}>
            Build New Version
          </Button>
          <Button variant="contained" startIcon={<Upload />}>
            Deploy to Store
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {appAnalytics.map(metric => (
          <Grid item xs={12} sm={6} md={3} key={metric.id}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">{metric.value}</Typography>
                <Typography variant="body2" color="text.secondary">{metric.metric}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Versions" />
          <Tab label="Android" />
          <Tab label="iOS" />
        </Tabs>
      </Card>

      {/* Search & Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search versions..."
                value={effectiveSearchTerm}
                onChange={(e) => setEffectiveSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={effectiveFilterStatus}
                  label="Status"
                  onChange={(e) => setEffectiveFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="building">Building</MenuItem>
                  <MenuItem value="queued">Queued</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="deprecated">Deprecated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData} disabled={loading}>
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* App Versions Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <input type="checkbox" onChange={(e) => isAllSelected(filteredVersions, selectedItems) ? setSelectedItems([]) : setSelectedItems(filteredVersions.map(v => v.id))} />
                  </TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Platform</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Downloads</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Release Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVersions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(version.id)}
                        onChange={() => handleItemSelect(version.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          v{version.version}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Build {version.build_number}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getPlatformIcon(version.platform)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {version.platform}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={version.status}
                        color={getStatusColor(version.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {version.download_count?.toLocaleString() || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{version.rating || '-'}</Typography>
                        <Star sx={{ fontSize: 16, color: '#FFD700' }} />
                      </Box>
                    </TableCell>
                    <TableCell>{version.size_mb || '-'} MB</TableCell>
                    <TableCell>{new Date(version.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="primary" onClick={() => { setSelectedVersion(version); setVersionDialog(true); }}>
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="success">
                          <Edit />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVersions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography sx={{ py: 3 }} color="text.secondary">No versions found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Detail Dialogs */}
      <Dialog open={buildDialog} onClose={() => setBuildDialog(false)}>
        <DialogTitle>Build New Version</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>Build pipeline integration is pending.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuildDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={versionDialog} onClose={() => setVersionDialog(false)}>
        <DialogTitle>Version Details</DialogTitle>
        <DialogContent>
          <Typography>Version: {selectedVersion?.version}</Typography>
          <Typography>Platform: {selectedVersion?.platform}</Typography>
          {/* More details */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

// Helper for select all checkbox
const isAllSelected = (items, selected) => items.length > 0 && items.every(i => selected.includes(i.id));

export default MobileAppScreen;

